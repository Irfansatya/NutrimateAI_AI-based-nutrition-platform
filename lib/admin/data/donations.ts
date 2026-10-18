/* Data simulasi pengajuan open donasi. */
export const INITIAL_DONATIONS = [
  {
    id: 1,
    pem: 'Dewi Lestari',
    nm: 'Adik Raka',
    ket: '11 bulan',
    kota: 'Demak, Jawa Tengah',
    judul: 'Bantu Raka mendapat protein hewani setiap hari',
    story: 'Berat badan Raka belum naik dua bulan terakhir menurut posyandu. Ayahnya pengemudi ojek sehingga telur, ikan, dan hati ayam jarang terbeli.',
    items: [
      { n: 'Telur ayam', q: '4 kg', c: 120000 },
      { n: 'Ikan kembung', q: '3 kg', c: 105000 },
      { n: 'Hati ayam', q: '1 kg', c: 35000 }
    ],
    st: 'review',
    d: 0,
    dur: 30,
    docs: ['KTP_Dewi.jpg', 'BukuKIA_Raka.pdf', 'SKTM.pdf', 'Foto_dapur.jpg'],
    col: 0,
    dn: 0
  },
  {
    id: 2,
    pem: 'Sari Wulandari',
    nm: 'Ibu Sari',
    ket: 'Ibu hamil',
    kota: 'Grobogan, Jawa Tengah',
    judul: 'Bantu Bu Sari penuhi gizi di trimester ketiga',
    story: 'Suami Bu Sari buruh tani berpenghasilan tidak tetap. Bidan menganjurkan tambahan protein dan zat besi.',
    items: [
      { n: 'Telur ayam', q: '6 kg', c: 180000 },
      { n: 'Ikan lele', q: '5 kg', c: 150000 },
      { n: 'Sayuran hijau', q: '2 bulan', c: 80000 }
    ],
    st: 'review',
    d: 1,
    dur: 45,
    docs: ['KTP_Sari.jpg', 'SuratBidan.pdf', 'Kartu_PKH.jpg', 'Foto_rumah.jpg'],
    col: 0,
    dn: 0
  },
  {
    id: 3,
    pem: 'Wati Handayani',
    nm: 'Ibu Wati',
    ket: 'Ibu menyusui',
    kota: 'Lombok Tengah, Nusa Tenggara Barat',
    judul: 'Dukung Bu Wati menyusui dengan gizi cukup',
    story: 'Keluarga mengandalkan kebun yang belum panen sehingga asupan protein dan sayur Bu Wati sering kurang.',
    items: [
      { n: 'Ikan segar', q: '5 kg', c: 150000 },
      { n: 'Telur ayam', q: '4 kg', c: 120000 },
      { n: 'Kacang hijau', q: '3 kg', c: 60000 }
    ],
    st: 'disetujui',
    d: 9,
    dur: 30,
    docs: ['KTP_Wati.jpg', 'SuratBidan_Wati.pdf'],
    col: 195000,
    dn: 14
  },
  {
    id: 4,
    pem: 'Rina Tri',
    nm: 'Ibu Rina',
    ket: 'Ibu hamil',
    kota: 'Sukabumi, Jawa Barat',
    judul: 'Nutrisi trimester kedua untuk Bu Rina',
    story: 'Bu Rina kehilangan pekerjaan di pabrik dan anggaran makan ditekan seminimal mungkin.',
    items: [
      { n: 'Susu ibu hamil', q: '6 kotak', c: 240000 },
      { n: 'Tempe dan tahu', q: '2 bulan', c: 100000 }
    ],
    st: 'disetujui',
    d: 20,
    dur: 30,
    docs: ['KTP_Rina.jpg', 'BukuKIA_Rina.pdf'],
    col: 300000,
    dn: 22
  },
  {
    id: 5,
    pem: 'Lastri Utami',
    nm: 'Adik Naura',
    ket: '14 bulan',
    kota: 'Kupang, Nusa Tenggara Timur',
    judul: 'Cegah stunting: protein hewani untuk Naura',
    story: 'Tinggi badan Naura di bawah kurva pertumbuhan pada pemeriksaan puskesmas terakhir.',
    items: [
      { n: 'Telur ayam', q: '6 kg', c: 180000 },
      { n: 'Ikan segar', q: '6 kg', c: 180000 }
    ],
    st: 'selesai',
    d: 50,
    dur: 30,
    docs: ['KTP_Lastri.jpg', 'BukuKIA_Naura.pdf'],
    col: 360000,
    dn: 31
  },
  {
    id: 6,
    pem: 'Agus Prabowo',
    nm: 'Ibu Maya',
    ket: 'Ibu hamil',
    kota: 'Kota Semarang, Jawa Tengah',
    judul: 'Gizi harian Bu Maya',
    story: 'Mohon bantuan membeli bahan pangan.',
    items: [{ n: 'Telur ayam', q: '2 kg', c: 60000 }],
    st: 'ditolak',
    d: 5,
    dur: 14,
    docs: ['KTP_Agus.jpg'],
    note: 'Bukti kondisi ekonomi tidak dapat diverifikasi.',
    col: 0,
    dn: 0
  }
];
