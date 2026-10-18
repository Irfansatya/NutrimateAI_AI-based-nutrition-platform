// Data wilayah Indonesia: 38 provinsi, 416 kabupaten, dan 98 kota (total 514 kabupaten/kota).
// Nama provinsi mengikuti daftar yang dipakai di NutriCheck (mis. "DI Yogyakarta", "Bangka Belitung").
// Saat backend siap, data ini bisa diganti dengan hasil API wilayah tanpa mengubah komponen.

interface Wilayah {
  kab: string[];
  kota: string[];
}

const DATA: Record<string, Wilayah> = {
  "Aceh": {
    kab: ["Aceh Barat", "Aceh Barat Daya", "Aceh Besar", "Aceh Jaya", "Aceh Selatan", "Aceh Singkil", "Aceh Tamiang", "Aceh Tengah", "Aceh Tenggara", "Aceh Timur", "Aceh Utara", "Bener Meriah", "Bireuen", "Gayo Lues", "Nagan Raya", "Pidie", "Pidie Jaya", "Simeulue"],
    kota: ["Banda Aceh", "Langsa", "Lhokseumawe", "Sabang", "Subulussalam"],
  },
  "Sumatera Utara": {
    kab: ["Asahan", "Batu Bara", "Dairi", "Deli Serdang", "Humbang Hasundutan", "Karo", "Labuhanbatu", "Labuhanbatu Selatan", "Labuhanbatu Utara", "Langkat", "Mandailing Natal", "Nias", "Nias Barat", "Nias Selatan", "Nias Utara", "Padang Lawas", "Padang Lawas Utara", "Pakpak Bharat", "Samosir", "Serdang Bedagai", "Simalungun", "Tapanuli Selatan", "Tapanuli Tengah", "Tapanuli Utara", "Toba"],
    kota: ["Binjai", "Gunungsitoli", "Medan", "Padangsidimpuan", "Pematangsiantar", "Sibolga", "Tanjungbalai", "Tebing Tinggi"],
  },
  "Sumatera Barat": {
    kab: ["Agam", "Dharmasraya", "Kepulauan Mentawai", "Lima Puluh Kota", "Padang Pariaman", "Pasaman", "Pasaman Barat", "Pesisir Selatan", "Sijunjung", "Solok", "Solok Selatan", "Tanah Datar"],
    kota: ["Bukittinggi", "Padang", "Padang Panjang", "Pariaman", "Payakumbuh", "Sawahlunto", "Solok"],
  },
  "Riau": {
    kab: ["Bengkalis", "Indragiri Hilir", "Indragiri Hulu", "Kampar", "Kepulauan Meranti", "Kuantan Singingi", "Pelalawan", "Rokan Hilir", "Rokan Hulu", "Siak"],
    kota: ["Dumai", "Pekanbaru"],
  },
  "Kepulauan Riau": {
    kab: ["Bintan", "Karimun", "Kepulauan Anambas", "Lingga", "Natuna"],
    kota: ["Batam", "Tanjungpinang"],
  },
  "Jambi": {
    kab: ["Batanghari", "Bungo", "Kerinci", "Merangin", "Muaro Jambi", "Sarolangun", "Tanjung Jabung Barat", "Tanjung Jabung Timur", "Tebo"],
    kota: ["Jambi", "Sungai Penuh"],
  },
  "Sumatera Selatan": {
    kab: ["Banyuasin", "Empat Lawang", "Lahat", "Muara Enim", "Musi Banyuasin", "Musi Rawas", "Musi Rawas Utara", "Ogan Ilir", "Ogan Komering Ilir", "Ogan Komering Ulu", "Ogan Komering Ulu Selatan", "Ogan Komering Ulu Timur", "Penukal Abab Lematang Ilir"],
    kota: ["Lubuklinggau", "Pagar Alam", "Palembang", "Prabumulih"],
  },
  "Bangka Belitung": {
    kab: ["Bangka", "Bangka Barat", "Bangka Selatan", "Bangka Tengah", "Belitung", "Belitung Timur"],
    kota: ["Pangkalpinang"],
  },
  "Bengkulu": {
    kab: ["Bengkulu Selatan", "Bengkulu Tengah", "Bengkulu Utara", "Kaur", "Kepahiang", "Lebong", "Mukomuko", "Rejang Lebong", "Seluma"],
    kota: ["Bengkulu"],
  },
  "Lampung": {
    kab: ["Lampung Barat", "Lampung Selatan", "Lampung Tengah", "Lampung Timur", "Lampung Utara", "Mesuji", "Pesawaran", "Pesisir Barat", "Pringsewu", "Tanggamus", "Tulang Bawang", "Tulang Bawang Barat", "Way Kanan"],
    kota: ["Bandar Lampung", "Metro"],
  },
  "DKI Jakarta": {
    kab: ["Kepulauan Seribu"],
    kota: ["Jakarta Barat", "Jakarta Pusat", "Jakarta Selatan", "Jakarta Timur", "Jakarta Utara"],
  },
  "Banten": {
    kab: ["Lebak", "Pandeglang", "Serang", "Tangerang"],
    kota: ["Cilegon", "Serang", "Tangerang", "Tangerang Selatan"],
  },
  "Jawa Barat": {
    kab: ["Bandung", "Bandung Barat", "Bekasi", "Bogor", "Ciamis", "Cianjur", "Cirebon", "Garut", "Indramayu", "Karawang", "Kuningan", "Majalengka", "Pangandaran", "Purwakarta", "Subang", "Sukabumi", "Sumedang", "Tasikmalaya"],
    kota: ["Bandung", "Banjar", "Bekasi", "Bogor", "Cimahi", "Cirebon", "Depok", "Sukabumi", "Tasikmalaya"],
  },
  "Jawa Tengah": {
    kab: ["Banjarnegara", "Banyumas", "Batang", "Blora", "Boyolali", "Brebes", "Cilacap", "Demak", "Grobogan", "Jepara", "Karanganyar", "Kebumen", "Kendal", "Klaten", "Kudus", "Magelang", "Pati", "Pekalongan", "Pemalang", "Purbalingga", "Purworejo", "Rembang", "Semarang", "Sragen", "Sukoharjo", "Tegal", "Temanggung", "Wonogiri", "Wonosobo"],
    kota: ["Magelang", "Pekalongan", "Salatiga", "Semarang", "Surakarta", "Tegal"],
  },
  "DI Yogyakarta": {
    kab: ["Bantul", "Gunungkidul", "Kulon Progo", "Sleman"],
    kota: ["Yogyakarta"],
  },
  "Jawa Timur": {
    kab: ["Bangkalan", "Banyuwangi", "Blitar", "Bojonegoro", "Bondowoso", "Gresik", "Jember", "Jombang", "Kediri", "Lamongan", "Lumajang", "Madiun", "Magetan", "Malang", "Mojokerto", "Nganjuk", "Ngawi", "Pacitan", "Pamekasan", "Pasuruan", "Ponorogo", "Probolinggo", "Sampang", "Sidoarjo", "Situbondo", "Sumenep", "Trenggalek", "Tuban", "Tulungagung"],
    kota: ["Batu", "Blitar", "Kediri", "Madiun", "Malang", "Mojokerto", "Pasuruan", "Probolinggo", "Surabaya"],
  },
  "Bali": {
    kab: ["Badung", "Bangli", "Buleleng", "Gianyar", "Jembrana", "Karangasem", "Klungkung", "Tabanan"],
    kota: ["Denpasar"],
  },
  "Nusa Tenggara Barat": {
    kab: ["Bima", "Dompu", "Lombok Barat", "Lombok Tengah", "Lombok Timur", "Lombok Utara", "Sumbawa", "Sumbawa Barat"],
    kota: ["Bima", "Mataram"],
  },
  "Nusa Tenggara Timur": {
    kab: ["Alor", "Belu", "Ende", "Flores Timur", "Kupang", "Lembata", "Malaka", "Manggarai", "Manggarai Barat", "Manggarai Timur", "Nagekeo", "Ngada", "Rote Ndao", "Sabu Raijua", "Sikka", "Sumba Barat", "Sumba Barat Daya", "Sumba Tengah", "Sumba Timur", "Timor Tengah Selatan", "Timor Tengah Utara"],
    kota: ["Kupang"],
  },
  "Kalimantan Barat": {
    kab: ["Bengkayang", "Kapuas Hulu", "Kayong Utara", "Ketapang", "Kubu Raya", "Landak", "Melawi", "Mempawah", "Sambas", "Sanggau", "Sekadau", "Sintang"],
    kota: ["Pontianak", "Singkawang"],
  },
  "Kalimantan Tengah": {
    kab: ["Barito Selatan", "Barito Timur", "Barito Utara", "Gunung Mas", "Kapuas", "Katingan", "Kotawaringin Barat", "Kotawaringin Timur", "Lamandau", "Murung Raya", "Pulang Pisau", "Seruyan", "Sukamara"],
    kota: ["Palangka Raya"],
  },
  "Kalimantan Selatan": {
    kab: ["Balangan", "Banjar", "Barito Kuala", "Hulu Sungai Selatan", "Hulu Sungai Tengah", "Hulu Sungai Utara", "Kotabaru", "Tabalong", "Tanah Bumbu", "Tanah Laut", "Tapin"],
    kota: ["Banjarbaru", "Banjarmasin"],
  },
  "Kalimantan Timur": {
    kab: ["Berau", "Kutai Barat", "Kutai Kartanegara", "Kutai Timur", "Mahakam Ulu", "Paser", "Penajam Paser Utara"],
    kota: ["Balikpapan", "Bontang", "Samarinda"],
  },
  "Kalimantan Utara": {
    kab: ["Bulungan", "Malinau", "Nunukan", "Tana Tidung"],
    kota: ["Tarakan"],
  },
  "Sulawesi Utara": {
    kab: ["Bolaang Mongondow", "Bolaang Mongondow Selatan", "Bolaang Mongondow Timur", "Bolaang Mongondow Utara", "Kepulauan Sangihe", "Kepulauan Siau Tagulandang Biaro", "Kepulauan Talaud", "Minahasa", "Minahasa Selatan", "Minahasa Tenggara", "Minahasa Utara"],
    kota: ["Bitung", "Kotamobagu", "Manado", "Tomohon"],
  },
  "Gorontalo": {
    kab: ["Boalemo", "Bone Bolango", "Gorontalo", "Gorontalo Utara", "Pohuwato"],
    kota: ["Gorontalo"],
  },
  "Sulawesi Tengah": {
    kab: ["Banggai", "Banggai Kepulauan", "Banggai Laut", "Buol", "Donggala", "Morowali", "Morowali Utara", "Parigi Moutong", "Poso", "Sigi", "Tojo Una-Una", "Tolitoli"],
    kota: ["Palu"],
  },
  "Sulawesi Barat": {
    kab: ["Majene", "Mamasa", "Mamuju", "Mamuju Tengah", "Pasangkayu", "Polewali Mandar"],
    kota: [],
  },
  "Sulawesi Selatan": {
    kab: ["Bantaeng", "Barru", "Bone", "Bulukumba", "Enrekang", "Gowa", "Jeneponto", "Kepulauan Selayar", "Luwu", "Luwu Timur", "Luwu Utara", "Maros", "Pangkajene dan Kepulauan", "Pinrang", "Sidenreng Rappang", "Sinjai", "Soppeng", "Takalar", "Tana Toraja", "Toraja Utara", "Wajo"],
    kota: ["Makassar", "Palopo", "Parepare"],
  },
  "Sulawesi Tenggara": {
    kab: ["Bombana", "Buton", "Buton Selatan", "Buton Tengah", "Buton Utara", "Kolaka", "Kolaka Timur", "Kolaka Utara", "Konawe", "Konawe Kepulauan", "Konawe Selatan", "Konawe Utara", "Muna", "Muna Barat", "Wakatobi"],
    kota: ["Baubau", "Kendari"],
  },
  "Maluku": {
    kab: ["Buru", "Buru Selatan", "Kepulauan Aru", "Kepulauan Tanimbar", "Maluku Barat Daya", "Maluku Tengah", "Maluku Tenggara", "Seram Bagian Barat", "Seram Bagian Timur"],
    kota: ["Ambon", "Tual"],
  },
  "Maluku Utara": {
    kab: ["Halmahera Barat", "Halmahera Selatan", "Halmahera Tengah", "Halmahera Timur", "Halmahera Utara", "Kepulauan Sula", "Pulau Morotai", "Pulau Taliabu"],
    kota: ["Ternate", "Tidore Kepulauan"],
  },
  "Papua": {
    kab: ["Biak Numfor", "Jayapura", "Keerom", "Kepulauan Yapen", "Mamberamo Raya", "Sarmi", "Supiori", "Waropen"],
    kota: ["Jayapura"],
  },
  "Papua Barat": {
    kab: ["Fakfak", "Kaimana", "Manokwari", "Manokwari Selatan", "Pegunungan Arfak", "Teluk Bintuni", "Teluk Wondama"],
    kota: [],
  },
  "Papua Barat Daya": {
    kab: ["Maybrat", "Raja Ampat", "Sorong", "Sorong Selatan", "Tambrauw"],
    kota: ["Sorong"],
  },
  "Papua Selatan": {
    kab: ["Asmat", "Boven Digoel", "Mappi", "Merauke"],
    kota: [],
  },
  "Papua Tengah": {
    kab: ["Deiyai", "Dogiyai", "Intan Jaya", "Mimika", "Nabire", "Paniai", "Puncak", "Puncak Jaya"],
    kota: [],
  },
  "Papua Pegunungan": {
    kab: ["Jayawijaya", "Lanny Jaya", "Mamberamo Tengah", "Nduga", "Pegunungan Bintang", "Tolikara", "Yahukimo", "Yalimo"],
    kota: [],
  },
};

const collator = new Intl.Collator("id");

/** Daftar provinsi, urut abjad */
export const DAFTAR_PROVINSI: string[] = Object.keys(DATA).sort(collator.compare);

/**
 * Daftar kabupaten/kota pada sebuah provinsi.
 * Kabupaten ditulis tanpa awalan ("Demak"), kota diberi awalan "Kota" ("Kota Semarang")
 * agar tidak tertukar dengan kabupaten yang bernama sama. Kabupaten tampil lebih dulu, lalu kota.
 */
export function daftarKabKota(provinsi: string): string[] {
  const w = DATA[provinsi];
  if (!w) return [];
  return [
    ...[...w.kab].sort(collator.compare),
    ...w.kota.map((k) => `Kota ${k}`).sort(collator.compare),
  ];
}

/** Format tampilan domisili, mis. "Demak, Jawa Tengah" */
export function formatDomisili(kabKota: string, provinsi: string): string {
  return kabKota && provinsi ? `${kabKota}, ${provinsi}` : "";
}