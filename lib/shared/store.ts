/* Shared persistent store untuk sinkronisasi NutriHelp (Campaigns),
 * NutriAssist (QRIS Payments), NutriWallet (Withdrawals & Balances)
 * antara User Dashboard dan Admin Portal via localStorage.
 */

import { INITIAL_DONATIONS } from '@/lib/admin/data/donations';
import {
  INITIAL_QRIS_PAYMENTS,
  INITIAL_WITHDRAWALS,
  INITIAL_WALLETS,
  type QrisPaymentRecord,
  type WithdrawalRecord,
} from '@/lib/admin/data/payments';
import type { Donation, DonationItem } from '@/component/admin/NutrimateAIAdminApp';
import type { MyCampaign, HelpForm } from '@/lib/dashboard/campaign';
import type { Cat, Campaign } from '@/lib/dashboard/mockData';

// Storage keys
export const STORAGE_CAMPAIGNS_KEY = 'nm_campaigns';
export const STORAGE_PAYMENTS_KEY = 'nm_payments';
export const STORAGE_WITHDRAWALS_KEY = 'nm_withdrawals';
export const STORAGE_WALLETS_KEY = 'nm_wallets';

export const SYNC_EVENT_NAME = 'nutrimate_shared_sync';

const isBrowser = () => typeof window !== 'undefined';

export function broadcastSync(detail: { key: string }) {
  if (!isBrowser()) return;
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail }));
  } catch {}
}

// ==========================================
// 1. CAMPAIGNS (NutriHelp & Admin Verifikasi)
// ==========================================

export interface SharedCampaign {
  id: string; // Misal "camp_1" atau "mine_123"
  numId: number; // Numerik unik untuk Admin DonationView
  userId?: string; // ID user pemilik (jika dibuat user login)
  owner: 'me' | 'other';
  cat: Cat;
  nama: string; // Nama pemohon / subjek
  pem: string; // Nama lengkap pemohon (untuk admin)
  nm: string; // Nama penerima bantuan (ibu/anak)
  ket: string; // Keterangan (e.g., '11 bulan', 'Ibu hamil')
  kota: string; // Domisili
  judul: string;
  story: string;
  items: DonationItem[];
  target: number;
  durasi: number;
  st: 'review' | 'revisi' | 'ditolak' | 'disetujui' | 'berjalan' | 'selesai' | 'dibatalkan';
  d: number; // Hari sejak diajukan / update
  docs: string[];
  col: number; // Terkumpul
  dn: number; // Donatur count
  note?: string; // Catatan admin (alasan revisi/tolak)
  form?: HelpForm;
  thumbnail?: string;
  submittedAt: number;
  publishedAt?: number;
  endedAt?: number;
  endReason?: 'manual' | 'target' | 'expired';
}

function convertInitialDonationsToShared(): SharedCampaign[] {
  return INITIAL_DONATIONS.map((d) => ({
    id: `camp_${d.id}`,
    numId: d.id,
    owner: 'other',
    cat: d.ket.toLowerCase().includes('anak') || d.ket.toLowerCase().includes('bulan')
      ? 'anak'
      : d.ket.toLowerCase().includes('menyusui')
      ? 'menyusui'
      : 'hamil',
    nama: d.nm,
    pem: d.pem,
    nm: d.nm,
    ket: d.ket,
    kota: d.kota,
    judul: d.judul,
    story: d.story,
    items: d.items,
    target: d.items.reduce((sum, item) => sum + item.c, 0),
    durasi: d.dur,
    st: d.st as any,
    d: d.d,
    docs: d.docs,
    col: d.col,
    dn: d.dn,
    note: d.note,
    submittedAt: Date.now() - d.d * 864e5,
  }));
}

export function getSharedCampaigns(): SharedCampaign[] {
  if (!isBrowser()) return convertInitialDonationsToShared();
  try {
    const raw = localStorage.getItem(STORAGE_CAMPAIGNS_KEY);
    if (!raw) {
      const initial = convertInitialDonationsToShared();
      localStorage.setItem(STORAGE_CAMPAIGNS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : convertInitialDonationsToShared();
  } catch {
    return convertInitialDonationsToShared();
  }
}

export function saveSharedCampaigns(campaigns: SharedCampaign[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_CAMPAIGNS_KEY, JSON.stringify(campaigns));
    broadcastSync({ key: STORAGE_CAMPAIGNS_KEY });
  } catch {}
}

/** Tambah / update campaign pengajuan Open Donasi dari NutriHelp */
export function upsertUserCampaign(camp: MyCampaign, userId?: string): SharedCampaign {
  const all = getSharedCampaigns();
  const existingIdx = all.findIndex((c) => c.id === camp.id);

  const numId = existingIdx >= 0 ? all[existingIdx].numId : Date.now();
  const sharedCamp: SharedCampaign = {
    id: camp.id,
    numId,
    userId,
    owner: 'me',
    cat: camp.cat,
    nama: camp.nama,
    pem: camp.form?.nama || camp.nama,
    nm: camp.form?.penerima || camp.nama,
    ket: camp.cat === 'hamil' ? 'Ibu hamil' : camp.cat === 'menyusui' ? 'Ibu menyusui' : 'Anak',
    kota: camp.kota,
    judul: camp.judul,
    story: camp.story,
    items: camp.items,
    target: camp.target,
    durasi: camp.durasi,
    st: camp.status as any,
    d: 0,
    docs: ['KTP_Pemohon.jpg', 'Dokumen_Kondisi.pdf', 'Bukti_Ekonomi.pdf'],
    col: camp.donors?.reduce((sum, d) => sum + d.amt, 0) || 0,
    dn: camp.donors?.length || 0,
    note: camp.adminNote,
    form: camp.form,
    thumbnail: camp.thumbnail,
    submittedAt: camp.submittedAt || Date.now(),
    publishedAt: camp.publishedAt,
    endedAt: camp.endedAt,
    endReason: camp.endReason,
  };

  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...sharedCamp };
  } else {
    all.unshift(sharedCamp);
  }

  saveSharedCampaigns(all);
  return sharedCamp;
}

/** Dapatkan campaign milik user aktif untuk tab "Open Donasi Saya" */
export function getUserActiveCampaign(userId?: string): MyCampaign | null {
  const all = getSharedCampaigns();
  const mine = all.find((c) => (userId && c.userId === userId) || c.owner === 'me');
  if (!mine) return null;

  return {
    id: mine.id,
    owner: 'me',
    cat: mine.cat,
    nama: mine.nama,
    kota: mine.kota,
    judul: mine.judul,
    story: mine.story,
    items: mine.items,
    target: mine.target,
    donors: [],
    deadline: mine.publishedAt ? mine.publishedAt + mine.durasi * 864e5 : 0,
    status: mine.st as any,
    by: 'Pemohon',
    form: mine.form as HelpForm,
    durasi: mine.durasi,
    thumbnail: mine.thumbnail,
    adminNote: mine.note,
    submittedAt: mine.submittedAt,
    publishedAt: mine.publishedAt,
    endedAt: mine.endedAt,
    endReason: mine.endReason,
  };
}

/** Konversi ke format Donation untuk Admin DonationView */
export function getAdminDonationsList(): Donation[] {
  const all = getSharedCampaigns();
  return all.map((c) => ({
    id: c.numId,
    pem: c.pem,
    nm: c.nm,
    ket: c.ket,
    kota: c.kota,
    judul: c.judul,
    story: c.story,
    items: c.items,
    st: c.st === 'berjalan' ? 'disetujui' : c.st, // Admin memakai 'disetujui' untuk aktif
    d: c.d,
    dur: c.durasi,
    docs: c.docs,
    col: c.col,
    dn: c.dn,
    note: c.note,
  }));
}

/** Update status pengajuan dari Admin ReviewModal */
export function updateCampaignStatusByAdmin(
  numId: number,
  newStatus: string,
  note?: string
): void {
  const all = getSharedCampaigns();
  const updated = all.map((c) => {
    if (c.numId === numId) {
      return {
        ...c,
        st: (newStatus === 'disetujui' ? 'disetujui' : newStatus) as any,
        note: note !== undefined ? note : c.note,
      };
    }
    return c;
  });
  saveSharedCampaigns(updated);
}

// ==========================================
// 2. QRIS DONATIONS (NutriAssist & Admin Pay)
// ==========================================

export function getSharedPayments(): QrisPaymentRecord[] {
  if (!isBrowser()) return INITIAL_QRIS_PAYMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(INITIAL_QRIS_PAYMENTS));
      return INITIAL_QRIS_PAYMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_QRIS_PAYMENTS;
  } catch {
    return INITIAL_QRIS_PAYMENTS;
  }
}

export function saveSharedPayments(payments: QrisPaymentRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
    broadcastSync({ key: STORAGE_PAYMENTS_KEY });
  } catch {}
}

export function addSharedPayment(payment: QrisPaymentRecord): void {
  const all = getSharedPayments();
  all.unshift(payment);
  saveSharedPayments(all);
}

// ==========================================
// 3. WITHDRAWALS (NutriWallet & Admin Pay)
// ==========================================

export function getSharedWithdrawals(): WithdrawalRecord[] {
  if (!isBrowser()) return INITIAL_WITHDRAWALS;
  try {
    const raw = localStorage.getItem(STORAGE_WITHDRAWALS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(INITIAL_WITHDRAWALS));
      return INITIAL_WITHDRAWALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_WITHDRAWALS;
  } catch {
    return INITIAL_WITHDRAWALS;
  }
}

export function saveSharedWithdrawals(withdrawals: WithdrawalRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(withdrawals));
    broadcastSync({ key: STORAGE_WITHDRAWALS_KEY });
  } catch {}
}

export function addSharedWithdrawal(w: WithdrawalRecord): void {
  const all = getSharedWithdrawals();
  all.unshift(w);
  saveSharedWithdrawals(all);
}

// ==========================================
// 4. WALLET BALANCES (NutriWallet & Admin)
// ==========================================

export function getSharedWallets(): Record<string, number> {
  if (!isBrowser()) return INITIAL_WALLETS;
  try {
    const raw = localStorage.getItem(STORAGE_WALLETS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_WALLETS_KEY, JSON.stringify(INITIAL_WALLETS));
      return INITIAL_WALLETS;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : INITIAL_WALLETS;
  } catch {
    return INITIAL_WALLETS;
  }
}

export function saveSharedWallets(wallets: Record<string, number>): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_WALLETS_KEY, JSON.stringify(wallets));
    broadcastSync({ key: STORAGE_WALLETS_KEY });
  } catch {}
}

export function getWalletBalance(recipientName: string): number {
  const wallets = getSharedWallets();
  return Math.round(Number(wallets[recipientName]) || 0);
}
