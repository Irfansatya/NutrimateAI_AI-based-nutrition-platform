// Tipe dan helper untuk alur NutriHelp (pengajuan, review, publikasi, penarikan dana).
import type { Campaign, Cat } from "./mockData";

/**
 * Siklus hidup open donasi milik pengguna:
 * review     -> pengecekan oleh admin sedang berlangsung
 * revisi     -> admin meminta perbaikan (ada catatan admin)
 * ditolak    -> admin menolak pengajuan (ada catatan admin)
 * disetujui  -> disetujui, menunggu pengguna mempublikasikan
 * berjalan   -> sudah dipublikasikan dan tampil di NutriAssist
 * selesai    -> dihentikan/diselesaikan (manual, target tercapai, atau masa berakhir)
 * dibatalkan -> dibatalkan pengguna sebelum dipublikasikan
 */
export type CampaignStatus =
  | "review"
  | "revisi"
  | "ditolak"
  | "disetujui"
  | "berjalan"
  | "selesai"
  | "dibatalkan";

export interface NeedItem {
  n: string;
  q: string;
  c: number;
}

export interface HelpFiles {
  ktp: File[];
  kondisi: File[];
  ekonomi: File[];
  thumb: File[];
}

export interface HelpForm {
  role: string;
  cat: Cat | "";
  nama: string;
  wa: string;
  penerima: string;
  /** Provinsi domisili, mis. "Jawa Tengah" */
  provinsi: string;
  /** Kabupaten/kota domisili, mis. "Demak" atau "Kota Semarang" */
  kabkota: string;
  hub: string;
  hubx: string;
  files: HelpFiles;
  kondisiKet: string;
  eko: string;
  judul: string;
  story: string;
  durasi: number;
  items: NeedItem[];
  agreeStmt: boolean;
  agreeTruth: boolean;
}

export const DURATIONS = [14, 30, 45, 60] as const;
export const DEFAULT_DURATION = 30;

export function emptyForm(): HelpForm {
  return {
    role: "",
    cat: "",
    nama: "",
    wa: "",
    penerima: "",
    provinsi: "",
    kabkota: "",
    hub: "",
    hubx: "",
    files: { ktp: [], kondisi: [], ekonomi: [], thumb: [] },
    kondisiKet: "",
    eko: "",
    judul: "",
    story: "",
    durasi: DEFAULT_DURATION,
    items: [{ n: "", q: "", c: 0 }],
    agreeStmt: false,
    agreeTruth: false,
  };
}

export function cloneForm(f: HelpForm): HelpForm {
  return {
    ...f,
    files: {
      ktp: [...f.files.ktp],
      kondisi: [...f.files.kondisi],
      ekonomi: [...f.files.ekonomi],
      thumb: [...f.files.thumb],
    },
    items: f.items.map((i) => ({ ...i })),
  };
}

export interface MyCampaign extends Campaign {
  status: CampaignStatus;
  /** Isi formulir saat dikirim, dipakai untuk mengisi ulang form ketika perlu revisi */
  form: HelpForm;
  durasi: number;
  thumbnail?: string;
  /** Catatan admin untuk status revisi atau ditolak */
  adminNote?: string;
  submittedAt: number;
  publishedAt?: number;
  endedAt?: number;
  endReason?: "manual" | "target" | "expired";
}

/** Form pengajuan terkunci selama open donasi masih dalam proses/aktif */
export function isFormLocked(c: MyCampaign | null): boolean {
  return !!c && (c.status === "review" || c.status === "disetujui" || c.status === "berjalan");
}

export interface Withdrawal {
  id: string;
  amt: number;
  ts: number;
  bank: string;
  /** Nomor rekening yang sudah disamarkan, mis. "•••• 7890" */
  acctMasked: string;
  name: string;
  status: "diproses" | "selesai" | "ditolak";
}

/**
 * Status verifikasi pembayaran donasi:
 * verifikasi -> pembayaran sedang diperiksa oleh platform
 * berhasil   -> pembayaran terverifikasi dan dana masuk ke open donasi
 * gagal      -> pembayaran tidak dapat diverifikasi
 */
export type DonationStatus = "verifikasi" | "berhasil" | "gagal";

export interface DonationRecord {
  /** Nomor referensi pembayaran */
  id: string;
  campaignId: string;
  campaignTitle: string;
  /** Nama penerima bantuan */
  recipient: string;
  cat: Cat;
  amount: number;
  donorName: string;
  anonymous: boolean;
  message: string;
  method: "QRIS";
  ts: number;
  status: DonationStatus;
}

export const DONATION_STATUS: Record<DonationStatus, { label: string; badge: string; note: string }> = {
  verifikasi: {
    label: "Dalam verifikasi",
    badge: "warn",
    note: "Pembayaran Anda sedang diverifikasi oleh platform.",
  },
  berhasil: {
    label: "Berhasil",
    badge: "ok",
    note: "Pembayaran telah terverifikasi. Terima kasih atas donasi Anda.",
  },
  gagal: {
    label: "Gagal",
    badge: "bad",
    note: "Pembayaran tidak dapat diverifikasi. Jika dana Anda sudah terdebet, silakan hubungi kami.",
  },
};