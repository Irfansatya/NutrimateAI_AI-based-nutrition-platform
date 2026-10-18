/* Pemetaan status/topik ke label dan warna badge. */
export const STATUS_BADGES = {
  review: ['Menunggu verifikasi', 'info'],
  revisi: ['Perlu revisi', 'warn'],
  ditolak: ['Ditolak', 'bad'],
  disetujui: ['Open donasi aktif', 'ok'],
  selesai: ['Selesai', ''],
  verifikasi: ['Menunggu verifikasi', 'warn'],
  berhasil: ['Pembayaran berhasil', 'ok'],
  gagal: ['Pembayaran gagal', 'bad'],
  diproses: ['Menunggu transfer', 'warn'],
  selesai_wd: ['Transfer selesai', 'ok']
};

export const TOPIC_BADGES = {
  Pertanyaan: 'info',
  Saran: 'ok',
  Keluhan: 'bad'
};
