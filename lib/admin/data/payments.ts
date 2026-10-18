/* Data model dan state management untuk Pembayaran QRIS dan Pengajuan Pencairan Dana.
 * Semua verifikasi dan update saldo disimpan ke localStorage ('nm_payments', 'nm_withdrawals', 'nm_wallets')
 * sehingga persisten dan konsisten across page reloads.
 */

export interface QrisPaymentRecord {
  id: string; // Misal "NM-MD3K9A"
  campaignId: string;
  campaignTitle: string;
  recipient: string; // Nama penerima bantuan
  amount: number;
  donorName: string;
  anonymous: boolean;
  message?: string;
  method: 'QRIS';
  createdAt: number; // Timestamp transaksi dibuat / muncul di antrean
  status: 'verifikasi' | 'berhasil' | 'gagal';
  verifiedAt?: number;
  verifiedBy?: string;
}

export interface WithdrawalRecord {
  id: string; // Misal "WD-20261018-01"
  userId: string;
  userName: string;
  bank: string;
  acct: string; // Nomor rekening lengkap
  acctMasked: string; // Nomor rekening tersamar
  name: string; // Nama pemilik rekening
  amount: number;
  createdAt: number;
  status: 'diproses' | 'selesai';
  processedAt?: number;
  processedBy?: string;
}

export interface RecipientWallet {
  recipientName: string;
  balance: number;
  lastUpdated: number;
}

// Data awal QRIS
export const INITIAL_QRIS_PAYMENTS: QrisPaymentRecord[] = [
  {
    id: 'NM-MD3K9A',
    campaignId: 's5',
    campaignTitle: 'Nutrisi trimester kedua untuk Bu Rina dan calon bayi',
    recipient: 'Ibu Rina',
    amount: 50000,
    donorName: 'Irfan Satya',
    anonymous: false,
    message: 'Semoga sehat selalu dan lancar sampai persalinan, Bu.',
    method: 'QRIS',
    createdAt: Date.now() - 4 * 3600 * 1000, // 4 jam yang lalu (dalam 24 jam)
    status: 'verifikasi'
  },
  {
    id: 'NM-QR8X1P',
    campaignId: 's1',
    campaignTitle: 'Bantu Raka mendapat protein hewani setiap hari',
    recipient: 'Adik Raka',
    amount: 100000,
    donorName: 'Siti Nurhaliza',
    anonymous: false,
    message: 'Lekas sehat ya dek Raka.',
    method: 'QRIS',
    createdAt: Date.now() - 21 * 3600 * 1000, // 21 jam yang lalu (mendekati batas 24 jam)
    status: 'verifikasi'
  },
  {
    id: 'NM-QR9Z4M',
    campaignId: 's3',
    campaignTitle: 'Dukung Bu Wati menyusui dengan gizi cukup',
    recipient: 'Ibu Wati',
    amount: 25000,
    donorName: 'Hamba Allah',
    anonymous: true,
    message: 'Semoga berkah dan bermanfaat.',
    method: 'QRIS',
    createdAt: Date.now() - 26 * 3600 * 1000, // 26 jam yang lalu (melebihi 24 jam)
    status: 'verifikasi'
  },
  {
    id: 'NM-MC7H2Q',
    campaignId: 's2',
    campaignTitle: 'Menu MPASI bergizi untuk Raka agar tumbuh optimal',
    recipient: 'Adik Raka',
    amount: 75000,
    donorName: 'Ahmad Fauzi',
    anonymous: false,
    message: 'Semoga gizi Raka terpenuhi dengan baik.',
    method: 'QRIS',
    createdAt: Date.now() - 30 * 3600 * 1000,
    status: 'berhasil',
    verifiedAt: Date.now() - 28 * 3600 * 1000,
    verifiedBy: 'Admin 01'
  },
  {
    id: 'NM-MB5X8P',
    campaignId: 's3',
    campaignTitle: 'Dukung Bu Wati menyusui dengan gizi yang cukup',
    recipient: 'Ibu Wati',
    amount: 25000,
    donorName: 'Anonim',
    anonymous: true,
    message: 'Barakallah.',
    method: 'QRIS',
    createdAt: Date.now() - 50 * 3600 * 1000,
    status: 'gagal',
    verifiedAt: Date.now() - 48 * 3600 * 1000,
    verifiedBy: 'Admin 01'
  }
];

// Data awal pengajuan pencairan dana
export const INITIAL_WITHDRAWALS: WithdrawalRecord[] = [
  {
    id: 'WD-20261018-01',
    userId: 'usr_dewi_01',
    userName: 'Dewi Lestari',
    bank: 'Bank Mandiri',
    acct: '1370019283741',
    acctMasked: '•••• 3741',
    name: 'Dewi Lestari',
    amount: 150000,
    createdAt: Date.now() - 3 * 3600 * 1000,
    status: 'diproses'
  },
  {
    id: 'WD-20261018-02',
    userId: 'usr_wati_02',
    userName: 'Wati Handayani',
    bank: 'Bank Central Asia (BCA)',
    acct: '8020192831',
    acctMasked: '•••• 2831',
    name: 'Wati Handayani',
    amount: 120000,
    createdAt: Date.now() - 12 * 3600 * 1000,
    status: 'diproses'
  },
  {
    id: 'WD-20261017-03',
    userId: 'usr_rina_03',
    userName: 'Rina Tri',
    bank: 'Bank Rakyat Indonesia (BRI)',
    acct: '012901029384501',
    acctMasked: '•••• 4501',
    name: 'Rina Tri',
    amount: 200000,
    createdAt: Date.now() - 36 * 3600 * 1000,
    status: 'selesai',
    processedAt: Date.now() - 24 * 3600 * 1000,
    processedBy: 'Admin 01'
  }
];

// Saldo NutriWallet penerima bantuan
export const INITIAL_WALLETS: Record<string, number> = {
  'Ibu Rina': 250000,
  'Adik Raka': 325000,
  'Ibu Wati': 195000,
  'Dewi Lestari': 195000,
  'Wati Handayani': 195000,
  'Rina Tri': 200000
};

const STORAGE_PAYMENTS_KEY = 'nm_payments';
const STORAGE_WITHDRAWALS_KEY = 'nm_withdrawals';
const STORAGE_WALLETS_KEY = 'nm_wallets';

const isBrowser = () => typeof window !== 'undefined';

export function getStoredPayments(): QrisPaymentRecord[] {
  if (!isBrowser()) return INITIAL_QRIS_PAYMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(INITIAL_QRIS_PAYMENTS));
      return INITIAL_QRIS_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QRIS_PAYMENTS;
  }
}

export function saveStoredPayments(payments: QrisPaymentRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
  } catch {}
}

export function getStoredWithdrawals(): WithdrawalRecord[] {
  if (!isBrowser()) return INITIAL_WITHDRAWALS;
  try {
    const raw = localStorage.getItem(STORAGE_WITHDRAWALS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(INITIAL_WITHDRAWALS));
      return INITIAL_WITHDRAWALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WITHDRAWALS;
  }
}

export function saveStoredWithdrawals(withdrawals: WithdrawalRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(withdrawals));
  } catch {}
}

export function getStoredWallets(): Record<string, number> {
  if (!isBrowser()) return INITIAL_WALLETS;
  try {
    const raw = localStorage.getItem(STORAGE_WALLETS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_WALLETS_KEY, JSON.stringify(INITIAL_WALLETS));
      return INITIAL_WALLETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WALLETS;
  }
}

export function saveStoredWallets(wallets: Record<string, number>): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_WALLETS_KEY, JSON.stringify(wallets));
  } catch {}
}
