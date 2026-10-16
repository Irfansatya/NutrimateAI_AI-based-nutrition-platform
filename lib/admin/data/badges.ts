/* Pemetaan status/topik ke label dan warna badge. */
export const STATUS_BADGES = {
  review: ['Menunggu verifikasi', 'info'],
  revisi: ['Perlu revisi', 'warn'],
  ditolak: ['Ditolak', 'bad'],
  disetujui: ['Open donasi aktif', 'ok'],
  selesai: ['Selesai', '']
};

export const TOPIC_BADGES = {
  Pertanyaan: 'info',
  Saran: 'ok',
  Keluhan: 'bad'
};
