// Mock data untuk Dashboard NutriMate AI (frontend prototype)
// Semua data ini adalah simulasi. Tidak ada koneksi ke backend, AI, atau WhatsApp nyata.

export const MOCK_USER = {
  name: "Irfan Satya",
  email: "irfan@gmail.com",
  phone: "+62 812-3456-7890",
  role: "Pengguna NutrimateAI",
  photo: null as string | null,
};

export const PROVINCES = [
  "Aceh","Sumatera Utara","Sumatera Barat","Riau","Kepulauan Riau","Jambi",
  "Sumatera Selatan","Bangka Belitung","Bengkulu","Lampung","DKI Jakarta",
  "Banten","Jawa Barat","Jawa Tengah","DI Yogyakarta","Jawa Timur","Bali",
  "Nusa Tenggara Barat","Nusa Tenggara Timur","Kalimantan Barat","Kalimantan Tengah",
  "Kalimantan Selatan","Kalimantan Timur","Kalimantan Utara","Sulawesi Utara",
  "Gorontalo","Sulawesi Tengah","Sulawesi Barat","Sulawesi Selatan",
  "Sulawesi Tenggara","Maluku","Maluku Utara","Papua","Papua Barat",
  "Papua Selatan","Papua Tengah","Papua Pegunungan","Papua Barat Daya",
];

export const CATS: [string, string, string][] = [
  ["hamil", "Ibu hamil", "Gizi sesuai usia kehamilan"],
  ["menyusui", "Ibu menyusui", "Menjaga kualitas ASI eksklusif"],
  ["anak", "Anak usia 6 - 24 bulan", "Pemberian MPASI"],
];

export type Cat = "hamil" | "menyusui" | "anak";

export interface FoodItem {
  g: string; k: string; n: string; c: number;
  q: string; qa: string; e: number; p: number; kb: number; l: number;
  m: string; b: string; al: string[];
}

function I(g:string,k:string,n:string,c:number,q:string,qa:string,e:number,p:number,kb:number,l:number,m:string,b:string,al:string[]=[]):FoodItem {
  return {g,k,n,c,q,qa,e,p,kb,l,m,b,al};
}
function SY(k:string,n:string,c:number,e:number,p:number,kb:number,l:number,m:string,b:string,q='1 mangkuk sayur matang (100 g)',qa='3–4 sdm (50 g)'):FoodItem {
  return I('sy',k,n,c,q,qa,e,p,kb,l,m,b);
}

export const FOOD_DB: Record<string, FoodItem[]> = {
  pokok: [
    I('pokok','Nasi','Nasi putih',1.5,'1 centong (100 g)','3–4 sdm (50 g)',130,2.7,28,.3,'Energi bertahap','Sumber energi utama untuk aktivitas harian dan tumbuh kembang.'),
    I('pokok','Jagung','Jagung rebus',2,'1 tongkol kecil (100 g)','½ tongkol kecil (50 g)',96,3.4,21,1.5,'Serat 2,4 g','Serat membantu pencernaan dan membuat kenyang lebih lama.'),
    I('pokok','Singkong','Singkong rebus',1.5,'1 potong sedang (100 g)','1 potong kecil (50 g)',160,1.4,38,.3,'Vitamin C','Karbohidrat kompleks sebagai sumber energi pengganti nasi.'),
    I('pokok','Ubi','Ubi jalar rebus',2,'1 buah sedang (100 g)','½ buah kecil (50 g)',86,1.6,20,.1,'Vitamin A tinggi','Vitamin A mendukung penglihatan dan daya tahan tubuh.'),
    I('pokok','Kentang','Kentang rebus',2.5,'1 buah sedang (100 g)','½ buah kecil (50 g)',87,1.9,20,.1,'Kalium 379 mg','Kalium membantu menjaga keseimbangan cairan tubuh.'),
  ],
  ph: [
    I('ph','Telur','Telur ayam',2.5,'1 butir rebus (50 g)','½ butir (25 g)',77,6.3,.6,5.3,'Kolin & vitamin B12','Protein lengkap dan kolin mendukung perkembangan otak.',['Telur']),
    I('ph','Ayam','Ayam tanpa kulit',4.5,'1 potong sedang (75 g)','1 potong kecil (40 g)',124,23,0,2.7,'Vitamin B6 & niasin','Protein berkualitas membantu pertumbuhan dan perbaikan jaringan.'),
    I('ph','Ikan','Ikan kembung',4,'1 ekor kecil (80 g)','½ ekor kecil (40 g)',83,17.6,0,1.4,'Omega-3 & kalsium','Omega-3 mendukung perkembangan otak dan mata.',['Seafood']),
    I('ph','Ikan','Ikan lele',3.5,'1 potong sedang (80 g)','1 potong kecil (40 g)',96,14.4,0,4,'Fosfor & vitamin B12','Sumber protein terjangkau dengan lemak sehat.',['Seafood']),
    I('ph','Daging sapi','Daging sapi',9,'1 potong kecil (60 g)','1 potong kecil (30 g)',120,15.6,0,6,'Zat besi 1,6 mg & seng','Zat besi heme mudah diserap dan membantu pembentukan sel darah merah.'),
    I('ph','Hati ayam','Hati ayam',2.5,'1 potong (40 g)','1 potong kecil (20 g)',66,10,.4,2.5,'Zat besi 3,3 mg & vitamin A','Sumber zat besi dan vitamin A.'),
    I('ph','Udang','Udang',7,'5 ekor sedang (60 g)','2–3 ekor (30 g)',60,12,.3,.9,'Yodium & selenium','Protein rendah lemak dengan mineral untuk metabolisme tubuh.',['Seafood']),
  ],
  pn: [
    I('pn','Tahu','Tahu putih',1.5,'2 potong sedang (100 g)','1 potong sedang (50 g)',76,8,1.9,4.8,'Kalsium','Protein nabati dan kalsium untuk tulang dan gigi.'),
    I('pn','Tempe','Tempe kedelai',2,'2 potong sedang (75 g)','1 potong kecil (35 g)',150,14.3,6.8,8,'Zat besi 2 mg & probiotik','Hasil fermentasi yang mudah dicerna dan kaya protein nabati.'),
    I('pn','Kacang hijau','Bubur kacang hijau',2,'1 mangkuk kecil (30 g kering)','3 sdm (15 g kering)',104,7,18,.4,'Folat & serat','Folat dan serat mendukung pembentukan sel.',['Kacang']),
    I('pn','Kacang merah','Kacang merah rebus',3,'3 sdm (50 g)','1,5 sdm (25 g)',63,4.3,11,.2,'Zat besi & serat','Protein nabati dan zat besi pelengkap menu harian.',['Kacang']),
  ],
  sy: [
    SY('Bayam','Bayam',1.5,23,2.9,3.6,.4,'Folat & zat besi','Folat dan zat besi penting untuk pembentukan sel darah.'),
    SY('Kangkung','Kangkung',1.5,19,2.6,3.1,.2,'Vitamin A & zat besi','Kaya vitamin A dan zat besi nabati.'),
    SY('Wortel','Wortel',2,41,.9,9.6,.2,'Beta-karoten','Beta-karoten diubah tubuh menjadi vitamin A untuk mata dan imunitas.'),
    SY('Brokoli','Brokoli',4,34,2.8,6.6,.4,'Vitamin C 89 mg','Vitamin C membantu penyerapan zat besi dan daya tahan tubuh.'),
    SY('Bayam','Bayam merah',1.5,26,1.9,4.9,.3,'Antosianin & zat besi','Kaya zat besi dan antioksidan dari pigmen merah.'),
    SY('Labu','Labu kuning',1.5,26,1,6.5,.1,'Vitamin A','Vitamin A dengan tekstur lembut yang cocok untuk berbagai usia.'),
    SY('Sawi','Sawi hijau',1.5,13,1.5,2.2,.2,'Vitamin K & kalsium','Vitamin K dan kalsium mendukung kesehatan tulang.'),
    SY('Daun kelor','Daun kelor',1.5,32,4.7,4.2,.7,'Kalsium & zat besi','Kaya zat besi dan kalsium untuk ibu maupun tumbuh kembang anak.','½ mangkuk (50 g)','2 sdm (25 g)'),
  ],
  bh: [
    I('bh','Pisang','Pisang',2,'1 buah sedang (100 g)','½ buah (50 g)',89,1.1,23,.3,'Kalium 358 mg','Memberi energi cepat dan kalium untuk otot dan saraf.'),
    I('bh','Pepaya','Pepaya',2,'1 potong (100 g)','1 potong kecil (50 g)',43,.5,11,.3,'Vitamin C 61 mg','Vitamin C membantu penyerapan zat besi.'),
    I('bh','Jeruk','Jeruk manis',3,'1 buah sedang (100 g)','½ buah (50 g)',47,.9,12,.1,'Vitamin C 53 mg','Vitamin C mendukung daya tahan tubuh.'),
    I('bh','Alpukat','Alpukat',4,'½ buah (70 g)','2–3 sdm (30 g)',112,1.4,6,10.3,'Lemak tak jenuh & folat','Lemak sehat membantu penyerapan vitamin larut lemak.'),
    I('bh','Mangga','Mangga',3,'1 buah kecil (100 g)','½ buah kecil (50 g)',60,.8,15,.4,'Vitamin A & C','Vitamin A dan C mendukung imunitas.'),
    I('bh','Jambu','Jambu biji',2,'1 buah sedang (100 g)','½ buah (50 g)',68,2.6,14,1,'Vitamin C 228 mg','Sangat kaya vitamin C.'),
  ],
  su: [
    I('su','Susu sapi','Susu sapi',3.5,'1 gelas (200 ml)','½ gelas (100 ml)',122,6.4,9.6,6.6,'Kalsium 240 mg','Kalsium mendukung kesehatan tulang dan gigi.',['Susu sapi','Intoleransi laktosa']),
    I('su','Susu kedelai','Susu kedelai',3,'1 gelas (200 ml)','½ gelas (100 ml)',80,6.6,4,4,'Protein nabati','Alternatif susu nabati tanpa laktosa.'),
    I('su','Susu ibu hamil','Susu ibu hamil',5,'1 gelas (200 ml)','½ gelas (100 ml)',140,7,18,4,'Folat, kalsium & zat besi','Diperkaya zat gizi untuk ibu.',['Susu sapi','Intoleransi laktosa']),
  ],
};

export const MEAL_SLOTS: [string, string, string[]][] = [
  ['06:30','Sarapan',['pokok','ph|pn','bh|su']],
  ['10:00','Selingan pagi',['bh','su|pn']],
  ['12:30','Makan siang',['pokok','ph|pn','sy']],
  ['16:00','Selingan sore',['pn|bh','bh|su']],
  ['19:00','Makan malam',['pokok','ph|pn','sy']],
];

export interface MealItem { n:string; q:string; c:number; nu:string; b:string; }
export interface Meal { t:string; l:string; items:MealItem[]; }
export interface DayPlan { d:Date; m:Meal[]; c:number; over:boolean; }

function rng(seed:number){
  let a=seed|0;
  return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
}

export function buildPlan(cat:Cat,budget:number,excludeWords:string[],seed:number):DayPlan[]{
  const r=rng(seed*7919+13);
  const an=cat==='anak';
  const f=an?.5:1;
  const ok=(it:FoodItem)=>{
    const nm=(it.n+' '+it.k).toLowerCase();
    return !excludeWords.some(w=>nm.includes(w.toLowerCase()));
  };
  const pool=(g:string):FoodItem[]=>{
    const db=FOOD_DB[g]||[];
    return db.filter(ok);
  };
  const get=(spec:string):FoodItem[]=>{
    if(spec==='ph|pn'||spec==='pn|bh')return[...pool('ph'),...pool('pn')];
    if(spec==='bh|su')return[...pool('bh'),...pool('su')];
    if(spec==='su|pn')return[...pool('su'),...pool('pn')];
    return pool(spec);
  };
  const nf=(x:number)=>(Math.round(x*10)/10).toString().replace('.',',');
  const fmt=(it:FoodItem):MealItem=>({
    n:it.n, q:an?it.qa:it.q, c:it.c*(an?.6:1),
    nu:`Energi ${Math.round(it.e*f)} kkal · Protein ${nf(it.p*f)} g · Karbohidrat ${nf(it.kb*f)} g · Lemak ${nf(it.l*f)} g · ${it.m}`,
    b:it.b
  });
  const pick=(spec:string,used:Set<string>,prev:Set<string>):FoodItem|null=>{
    const a=get(spec);if(!a.length)return null;
    let c=a.filter(i=>!used.has(i.n)&&!prev.has(i.n));
    if(!c.length)c=a.filter(i=>!used.has(i.n));
    if(!c.length)c=a;
    const it=c[Math.floor(r()*c.length)];used.add(it.n);return it;
  };
  const mkDay=(prev:DayPlan|null):DayPlan=>{
    const used=new Set<string>();
    const m:Meal[]=MEAL_SLOTS.map((s,si)=>{
      const pv=new Set<string>(prev?prev.m[si].items.map(i=>i.n):[]);
      return{t:s[0],l:s[1],items:s[2].map(g=>pick(g,used,pv)).filter(Boolean).map(i=>fmt(i!))};
    });
    const cost=m.reduce((a,x)=>a+x.items.reduce((b,i)=>b+i.c,0),0);
    return{d:new Date(),m,c:cost,over:cost>budget/1000};
  };
  const days:DayPlan[]=[];let prev:DayPlan|null=null;
  for(let i=0;i<30;i++){
    let best:DayPlan|null=null;
    for(let k=0;k<8;k++){const x=mkDay(prev);if(!best||x.c<best.c)best=x;if(x.c<=budget/1000){best=x;break}}
    const dt=new Date();dt.setDate(dt.getDate()+i);
    best!.d=dt;
    days.push(best!);prev=best;
  }
  return days;
}

// ===== NUTRIASSIST MOCK CAMPAIGNS =====
export interface Donor { n:string; amt:number; msg:string; ts:number; }
export interface Campaign {
  id:string; owner:'other'|'me'; cat:Cat; nama:string; kota:string;
  judul:string; story:string; items:{n:string;q:string;c:number}[];
  target:number; donors:Donor[]; deadline:number; status:string; by:string;
}

const DN=['Budi S.','Anonim','Dewi L.','Rizky A.','Hamba Allah','Putri N.','Agus W.','Maya K.','Anonim','Eko P.','Rina T.','Dimas F.'];
const DA=[10000,10000,15000,20000,25000,25000,30000,50000,75000,100000];
const DM=['Semoga sehat selalu ya, Bu.','Semangat, semoga lancar.','','Cepat tumbuh kuat, Dik.','Barakallah.','Semoga bermanfaat.',''];

function seedDonors(target:number,ratio:number,sd:number):Donor[]{
  let a=sd*7919;const r=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296};
  const goal=target*ratio;const L:Donor[]=[];let s=0,i=0;
  while(s<goal&&i<200){
    const amt=DA[Math.floor(r()*DA.length)];
    if(s+amt>target*.97)break;
    L.push({n:DN[(i*7+sd)%DN.length],amt,msg:DM[Math.floor(r()*DM.length)],ts:Date.now()-(i*53+17)*60000*(1+Math.floor(r()*4))});
    s+=amt;i++;
  }
  return L;
}

function mk(id:string,cat:Cat,nama:string,kota:string,judul:string,story:string,items:{n:string;q:string;c:number}[],ratio:number,days:number,sd:number):Campaign{
  const target=items.reduce((a,x)=>a+x.c,0);
  return{id,owner:'other',cat,nama,kota,judul,story,items,target,donors:seedDonors(target,ratio,sd),deadline:Date.now()+days*864e5,status:'disetujui',by:'Pemohon terverifikasi'};
}

export const SAMPLE_CAMPAIGNS:Campaign[]=[
  mk('s1','hamil','Ibu Sari (30 minggu)','Kab. Grobogan, Jawa Tengah',
    'Bantu Bu Sari penuhi gizi di trimester ketiga',
    'Bu Sari (29) sedang hamil 30 minggu. Suaminya bekerja sebagai buruh tani dengan penghasilan tidak tetap. Bidan menganjurkan Bu Sari menambah asupan protein dan zat besi, tetapi penghasilan keluarga belum cukup untuk membeli bahan makanan bergizi setiap hari.',
    [{n:'Telur ayam',q:'6 kg',c:180000},{n:'Ikan lele',q:'5 kg',c:150000},{n:'Hati ayam',q:'2 kg',c:70000},{n:'Tempe dan tahu',q:'2 bulan',c:120000},{n:'Bayam dan daun kelor',q:'40 ikat',c:80000}],.72,21,1),
  mk('s2','anak','Raka (11 bulan)','Kab. Demak, Jawa Tengah',
    'Menu MPASI bergizi untuk Raka agar tumbuh optimal',
    'Raka berusia 11 bulan dan mulai makan makanan keluarga. Berat badannya belum naik dalam dua bulan terakhir menurut catatan posyandu. Ayahnya bekerja sebagai pengemudi ojek, sehingga protein hewani jarang bisa dibeli.',
    [{n:'Telur ayam',q:'4 kg',c:120000},{n:'Ikan kembung',q:'3 kg',c:105000},{n:'Hati ayam',q:'1 kg',c:35000},{n:'Wortel, labu, dan bayam',q:'2 bulan',c:90000},{n:'Beras',q:'10 kg',c:140000}],.35,12,2),
  mk('s3','menyusui','Ibu Wati (bayi 3 bulan)','Kab. Lombok Tengah, NTB',
    'Dukung Bu Wati menyusui dengan gizi yang cukup',
    'Bu Wati menyusui bayinya yang berusia 3 bulan. Keluarga mereka mengandalkan hasil kebun yang belum panen, sehingga asupan protein dan sayur Bu Wati sering kurang.',
    [{n:'Ikan segar',q:'5 kg',c:150000},{n:'Telur ayam',q:'4 kg',c:120000},{n:'Kacang hijau',q:'3 kg',c:60000},{n:'Daun kelor dan sayur hijau',q:'2 bulan',c:70000},{n:'Pisang dan pepaya',q:'2 bulan',c:80000}],.58,27,3),
  mk('s4','anak','Naura (14 bulan)','Kab. Kupang, NTT',
    'Cegah stunting: protein hewani untuk Naura',
    'Tinggi badan Naura (14 bulan) berada di bawah kurva pertumbuhan pada pemeriksaan terakhir di puskesmas. Orang tuanya petani dengan lahan kecil.',
    [{n:'Telur ayam',q:'6 kg',c:180000},{n:'Ikan segar',q:'6 kg',c:180000},{n:'Hati ayam',q:'2 kg',c:70000},{n:'Ubi dan jagung',q:'2 bulan',c:60000}],.18,30,4),
  mk('s5','hamil','Ibu Rina (22 minggu)','Kab. Sukabumi, Jawa Barat',
    'Nutrisi trimester kedua untuk Bu Rina dan calon bayi',
    'Bu Rina hamil anak kedua dan baru saja kehilangan pekerjaan di pabrik. Anggaran makan keluarga ditekan seminimal mungkin.',
    [{n:'Susu ibu hamil',q:'6 kotak',c:240000},{n:'Telur ayam',q:'4 kg',c:120000},{n:'Tempe dan tahu',q:'2 bulan',c:100000},{n:'Buah (pisang, jeruk, jambu)',q:'2 bulan',c:120000}],.88,6,5),
  mk('s6','menyusui','Ibu Lastri (bayi 5 bulan)','Kab. Malang, Jawa Timur',
    'Gizi seimbang untuk Bu Lastri selama ASI eksklusif',
    'Bu Lastri ingin memberi ASI eksklusif sampai 6 bulan, tetapi sering melewatkan makan karena harus menghemat.',
    [{n:'Ayam tanpa kulit',q:'4 kg',c:140000},{n:'Telur ayam',q:'4 kg',c:120000},{n:'Sayuran hijau',q:'2 bulan',c:80000},{n:'Kacang-kacangan',q:'3 kg',c:75000}],.44,18,6),
];

export const CATL:Record<string,string>={hamil:'Ibu hamil',menyusui:'Ibu menyusui',anak:'Anak 6–24 bulan'};

export const NAV_ITEMS:[string,string][]=[
  ['check','NutriCheck'],
  ['plan','NutriPlan'],
  ['help','NutriHelp'],
  ['assist','NutriAssist'],
];

export const INTRO:Record<string,[string,string]>={
  check:['NutriCheck','Lengkapi profil untuk membantu NutrimateAI memahami kebutuhan gizi Anda secara personal.'],
  plan:['NutriPlan','Rekomendasi bahan pangan dan takaran tiap waktu makan, bebas Anda olah sesuai selera keluarga.'],
  help:['NutriHelp','Ajukan open donasi untuk membantu memenuhi kebutuhan nutrisi Anda bersama para donatur.'],
  assist:['NutriAssist','Salurkan donasi untuk membantu ibu dan anak memenuhi kebutuhan gizi.'],
};
