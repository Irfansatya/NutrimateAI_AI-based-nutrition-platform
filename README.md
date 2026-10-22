# NutriMate AI

Platform pendamping nutrisi untuk ibu hamil dan ibu dengan anak berusia di bawah 2 tahun, dilengkapi rekomendasi berbasis katalog lokal dan sistem bantuan donasi.

## Tentang Proyek

**Masalah**: Pemenuhan gizi pada masa kehamilan dan 1000 hari pertama kehidupan anak krusial untuk pencegahan stunting, namun banyak keluarga menghadapi keterbatasan akses informasi nutrisi kontekstual, bahan pangan bergizi, dan bantuan saat kesulitan ekonomi.

**Solusi**: NutriMate AI menyediakan asesmen nutrisi bulanan (NutriCheck), rekomendasi bahan pangan bulanan berbasis katalog lokal (NutriPlan), serta platform bantuan sosial (NutriHelp, NutriAssist, NutriWallet) yang menghubungkan penerima bantuan dengan donatur melalui validasi admin.

**Target pengguna**:
- Ibu hamil
- Ibu dengan anak berusia di bawah 2 tahun
- Donatur yang ingin membantu
- Admin platform untuk validasi pengajuan

**Nilai utama**: Rekomendasi nutrisi yang disesuaikan kondisi ekonomi, kesehatan, dan lingkungan — tanpa ketergantungan AI eksternal untuk generasi rencana harian.

---

## Fitur Utama

| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| **NutriCheck** | ✅ Implementasi lengkap | Asesmen bulanan multi-kategori (kehamilan/menyusui/anak). Data disimpan sebagai baseline (pertama) dan histori (berikutnya) dengan versioning per periode. Termasuk validasi input, penyimpanan ke PostgreSQL via Prisma, dan prefill dari asesmen sebelumnya. |
| **NutriPlan** | ✅ Implementasi lengkap | Generasi rencana 30 hari × 5 slot makan (06:30, 10:00, 12:30, 16:00, 19:00) menggunakan **katalog lokal 33 item** (bukan AI eksternal). Menerapkan batas anggaran harian ketat, filter alergen/kategori, aturan variasi, dan persistensi ke database. Mendukung regenerasi eksplisit dengan increment versi. |
| **NutriDaily** | ⚠️ Belum diimplementasikan | Direncanakan untuk pengingat WhatsApp harian berdasarkan NutriPlan aktif. PRD mendefinisikan alur, namun **tidak ada route API, komponen UI, maupun tab dashboard** untuk fitur ini saat ini. |
| **NutriHelp** | ✅ Implementasi lengkap | Formulir pengajuan bantuan dengan upload dokumen (KTP, kondisi kesehatan, ekonomi, thumbnail). Status: REVIEW → REVISION → APPROVED → ACTIVE → COMPLETED. Admin memvalidasi via dashboard. |
| **NutriAssist** | ✅ Implementasi lengkap | Daftar kampanye ACTIVE/COMPLETED untuk donasi. Donatur memilih kampanye, mengisi jumlah, nama, pesan, dan metode QRIS. Riwayat donasi pengguna tersimpan. |
| **NutriWallet** | ✅ Implementasi parsial | Ringkasan saldo (available_balance = balance - held_balance - pending_withdrawals), riwayat penarikan, dan pembuatan penarikan dengan **row-level locking (SELECT FOR UPDATE)** untuk keamanan konkurensi. Belum ada pencairan dana nyata atau transfer antar pengguna. |

> **Catatan**: NutriPlan menggunakan generator berbasis katalog lokal (`lib/nutriplan/generator.ts`) — **bukan** pemanggilan AI eksternal (Gemini/9Router sudah dihapus). Hal ini menghilangkan ketergantungan API key dan biaya inferensi.

---

## Tumpukan Teknologi

| Teknologi | Tujuan | Implementasi |
|-----------|--------|--------------|
| **Next.js 16.3.5** | Framework full-stack (App Router) | Routing, Server Components, API Routes di `/app/api/v1/*` |
| **React 19.2.8** | Library UI | Client Components untuk interaktivitas (dashboard, modal, form) |
| **TypeScript 5** | Type safety | Strict mode, tipe terpusat di `lib/` dan `component/` |
| **Tailwind CSS 4** | Styling | Utility-first, konfigurasi via PostCSS, responsive mobile-first |
| **Prisma 6.19.3** | ORM | Schema 20 model, migrasi `20261020211200_init`, Supabase PostgreSQL |
| **Supabase (PostgreSQL)** | Database utama | Connection pooling (PgBouncer port 6543), direct URL untuk migrasi |
| **Autentikasi kustom** | Auth & session | HttpOnly cookie `nm_session_token` (30 hari, SameSite=Lax), SHA-256 hash di DB, `crypto.scrypt` untuk password (salt 16 byte, key 64 byte) |
| **Server-only** | Keamanan server | Memastikan kode sensitif (hashing, DB) tidak bocor ke bundle client |
| **tsx** | Eksekusi script TS | `npm run admin:provision` untuk provisioning admin awal |

---

## Instalasi dan Setup

### Prasyarat

- **Node.js 20+** (direkomendasikan LTS)
- **npm** (lockfile `package-lock.json` tersedia)
- **Akun Supabase** dengan project PostgreSQL aktif
- **Git**

### Clone Repository

```bash
git clone <repository-url>
cd nutrimate
```

### Install Dependencies

```bash
npm install
```

### Konfigurasi Environment Variables

Salin file contoh dan isi nilai sebenarnya:

```bash
cp .env.example .env
```

**Variabel wajib**:

| Variabel | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | Connection string Supabase **pooler** (Transaction mode, port 6543) untuk query runtime. Format: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Connection string **direct** (Session mode, port 5432) untuk Prisma CLI/migrasi. Format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` |
| `NODE_ENV` | `development` atau `production` |
| `PORT` | Port server development (default: `3002`) |
| `INITIAL_ADMIN_EMAIL` | Email admin untuk provisioning sekali jalan |
| `INITIAL_ADMIN_PASSWORD` | Kata sandi admin (min 8 char, huruf besar, angka) |
| `INITIAL_ADMIN_NAME` | Nama tampilan admin |

> **Penting**: Jangan commit file `.env`. Tidak ada API key AI eksternal yang dibutuhkan untuk NutriPlan (generator lokal).

### Konfigurasi Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Jalankan migrasi (hanya jika belum pernah dijalankan di project Supabase ini)
npm run prisma:migrate:init
```

> Migrasi `20261020211200_init` sudah mencakup 20 model (users, sessions, nutrition_contexts, assessments, plans, campaigns, donations, wallet, withdrawals, dll). **Jangan reset database** jika sudah berisi data.

### Provisioning Admin (Sekali Jalan)

Setelah variabel `INITIAL_ADMIN_*` diisi di `.env`:

```bash
npm run admin:provision
```

Script ini idempoten — aman dijalankan berulang. Admin dibuat dengan role `ADMIN` dan status `ACTIVE`.

### Jalankan Secara Lokal

```bash
npm run dev
```

Aplikasi berjalan di **http://localhost:3002** (port dikonfigurasi di `package.json`).

---

## Akses Aplikasi dan Panduan Pengguna

### Public Access

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Landing Page | `/` | Hero, fitur (NutriCheck, NutriPlan, NutriDaily, NutriHelp, NutriAssist), testimonial, CTA daftar/masuk. Modal login/daftar terintegrasi. |
| Hubungi Kami | `/hubungi-kami` | Formulir kontak (nama, email, topik, pesan, lampiran ≤10 MB). Submit via API. |
| Login / Daftar | `/` (modal) | **AuthModal** — modal tunggal dengan tab "Masuk" dan "Daftar". Validasi client-side, submit ke `/api/v1/auth/login` & `/register`. On success → redirect ke `/dashboard`. |

> Tidak ada route `/login` atau `/register` terpisah — autentikasi ditangani via modal di landing page.

### User Access

**Registrasi**: Buka `/` → klik "Daftar" → isi nama, email, WhatsApp, kata sandi (min 8 char, huruf besar, angka, max 128 char) → submit → auto redirect ke `/dashboard`.

**Login**: Buka `/` → klik "Masuk" → isi email & kata sandi → submit → auto redirect ke `/dashboard`.

**Dashboard User**: `/dashboard` (harus authenticated, role `USER`)

Tab navigasi (hero bottom nav):
- **NutriCheck** (`check`) — Wizard asesmen per kategori (hamil/menyusui/anak). Data tersimpan per periode, baseline + histori.
- **NutriPlan** (`plan`) — Tampilkan plan aktif (READY) atau generate baru dari asesmen terbaru. Regenerasi via tombol "Buat Ulang" (increment versi). Ringkasan: kategori, anggaran/hari, periode 30 hari, status.
- **NutriHelp** (`help`) — Buat/publikasikan/batal/akhiri kampanye bantuan. Form multi-step dengan upload dokumen. Wallet & penarikan terintegrasi di sini.
- **NutriAssist** (`assist`) — Lihat kampanye aktif (lain user), donasi via QRIS, riwayat donasi sendiri.

**Alur utama user**:
1. Daftar/Login → `/dashboard`
2. Isi **NutriCheck** (kategori sesuai kondisi) → Submit
3. Buka **NutriPlan** → Generate/Regenerate → Lihat rencana 30 hari
4. (Opsional) Ajukan bantuan via **NutriHelp** atau donasi via **NutriAssist**
5. Kelola **NutriWallet** (lihat saldo, ajukan penarikan) di tab NutriHelp

> **Catatan**: Tidak ada tab "NutriDaily" di dashboard. Fitur pengingat WhatsApp belum diimplementasikan.

### Admin Access

**Login Admin**: `/admin` → halaman login terpisah (`LoginView`). Menggunakan **endpoint yang sama** (`/api/v1/auth/login`) tapi memverifikasi `role === 'ADMIN'` via `/api/v1/auth/me`. Jika bukan admin → session direvoke, error "Akses ditolak".

**Dashboard Admin**: `/admin` (setelah login berhasil, role `ADMIN`)

Tab navigasi (sidebar kiri):
- **Dashboard** (`dash`) — Ringkasan: total users, kampanye pending/active, total donasi terkonfirmasi, pesan belum dibalas, penerima unik, pertumbuhan bulanan (chart SVG), aktivitas terbaru.
- **Donasi** (`don`) — Daftar pengajuan bantuan (REVIEW, REVISION, APPROVED, ACTIVE, COMPLETED, REJECTED). Detail, approve/reject/revision dengan catatan admin.
- **Pembayaran** (`pay`) — Verifikasi donasi QRIS (PENDING_VERIFICATION → CONFIRMED/REJECTED), update wallet penerima otomatis.
- **Pesan** (`msg`) — Daftar formulir "Hubungi Kami", balas/terbitkan/tutup.

**Otorisasi**: Dicek di backend (middleware/handler) — bukan hanya sembunyikan UI. Non-admin akses `/admin` → logout paksa.

---

## Referensi Route (Browser Path)

| Role | Browser Path | Tujuan | Akses |
|------|--------------|--------|-------|
| Public | `/` | Landing page + modal auth | Tanpa login |
| Public | `/hubungi-kami` | Formulir kontak | Tanpa login |
| User | `/dashboard` | Dashboard user (tab: check, plan, help, assist) | Login + role USER |
| Admin | `/admin` | Dashboard admin (tab: dash, don, pay, msg) | Login + role ADMIN |

> **Redirect**: User unauthenticated akses `/dashboard` → redirect ke `/`. Non-admin akses `/admin` → logout + redirect ke `/`.

---

## Kredensial Login dan Demo Account

**Tidak ada demo account publik** yang disediakan di repository.

- User baru: daftar via modal di `/`
- Admin: provisioning sekali jalan via `npm run admin:provision` (memerlukan `INITIAL_ADMIN_*` di `.env`)
- **Jangan** gunakan kredensial nyata, token, atau secret dari file environment untuk demo.

---

## Struktur Proyek

```
nutrimate/
├── app/                          # Next.js App Router
│   ├── api/v1/                   # API Routes (REST)
│   │   ├── auth/                 # register, login, logout, me
│   │   ├── admin/                # dashboard summary, campaigns, donations, withdrawals
│   │   ├── nutricheck/           # assessments (POST, GET latest)
│   │   ├── nutrihelp/            # campaigns (user & admin)
│   │   ├── nutriassist/          # campaigns, donations
│   │   ├── nutriplan/            # generate, current
│   │   └── nutriwallet/          # summary, withdrawals
│   ├── admin/page.tsx            # Entry admin (NutrimateAIAdminApp)
│   ├── dashboard/page.tsx        # Dashboard user (tab shell)
│   ├── hubungi-kami/page.tsx     # Contact page
│   ├── page.tsx                  # Landing page + AuthModal
│   ├── layout.tsx                # Root layout, font, globals.css
│   └── globals.css               # Global styles (Tailwind + custom)
├── component/                    # React Components
│   ├── dashboard/                # NutriCheck, NutriPlan, NutriHelp, NutriAssist, NutriWallet, SharedComponents
│   ├── admin/                    # Admin app, views, ui, auth, dashboard, donations, messages, payments
│   ├── AuthModal.tsx             # Modal login/daftar (landing)
│   ├── Navbar.tsx, FeatureCarousel.tsx, GuideModal.tsx, ...
├── lib/                          # Logika terpusat & client API
│   ├── auth/                     # server.ts (hash, session), client.ts (apiRegister, apiLogin, apiGetMe, apiLogout)
│   ├── nutriplan/                # catalogue.ts (33 item), generator.ts (local), client.ts
│   ├── nutricheck/, nutrihelp/, nutriassist/, nutriwallet/, admin/  # API clients & utils
│   ├── db/                       # Prisma client singleton
│   ├── dashboard/                # mockData.ts (fallback client-side), campaign.ts
│   └── shared/                   # store.ts (localStorage sync for wallet/withdrawals)
├── prisma/
│   └── schema.prisma             # 20 model, enums, relations, indexes
├── public/                       # Aset statis (logo, bg, icons, videos placeholder)
├── docs/
│   ├── API_SPEC.md               # Kontrak API endpoint
│   └── DATABASE.md               # Data dictionary, formula keuangan, siklus plan
├── scripts/
│   └── provision-admin.ts        # Provisioning admin idempoten
├── .env.example                  # Template environment variables
├── package.json                  # Scripts: dev, build, start, lint, prisma:*, admin:provision
├── tsconfig.json                 # TypeScript config (strict, path aliases @/*)
└── README.md                     # (File ini)
```

---

## Tim Pengembang

| Nama | Peran | GitHub |
|------|-------|--------|
| *(Informasi tim tidak terdokumentasikan di repository)* | | |

> Repository tidak berisi file `AUTHORS`, `CONTRIBUTORS`, atau metadata tim di `package.json`. Isi bagian ini setelah informasi diverifikasi.

---

## Deployment dan Testing

### Deployment

- **Platform**: Vercel (direkomendasikan untuk Next.js) atau Node.js hosting dengan PostgreSQL.
- **Database**: Supabase PostgreSQL (production) — `DATABASE_URL` & `DIRECT_URL` harus dikonfigurasi di environment deployment.
- **Build**: `npm run build` → output di `.next/`, jalankan `npm run start` (port 3002).
- **Variabel production**: Sama dengan development, tapi `NODE_ENV=production` dan `PORT` sesuai provider.
- **Cookie Secure**: Di production, cookie `nm_session_token` otomatis `Secure=true` (cek `lib/auth/server.ts`).

> URL live **tidak terdokumentasikan** di repository. Isi setelah deployment production.

### Verifikasi Kode

| Perintah | Fungsi |
|----------|--------|
| `npm run build` | Compile Next.js (Turbopack), type-check TypeScript, generate static pages. |
| `npx tsc --noEmit` | Type-check saja (tanpa emit), cepat untuk CI. |
| `npm run lint` | ESLint (Next.js config) — cek kode tidak digunakan, best practice. |
| `npm run prisma:validate` | Validasi sintaks schema Prisma. |
| `npm run prisma:format` | Format file `schema.prisma`. |

**Hasil terakhir** (lokal):
- `npm run build` → ✅ Compiled successfully (24 routes, 12s)
- `npx tsc --noEmit` → ✅ 0 errors

### Skenario Uji Manual Direkomendasikan

1. **Registrasi & Login User**
   - Buka `/` → Daftar akun baru → Verifikasi redirect ke `/dashboard`
   - Logout → Login kembali → Masuk dashboard

2. **Akses Berbasis Role**
   - Login user → akses `/admin` → harus logout paksa
   - Login admin (provision dulu) → akses `/admin` → dashboard admin tampil
   - Login admin → akses `/dashboard` → redirect ke `/admin` (perilaku `apiGetMe`)

3. **NutriCheck Persistensi**
   - Isi asesmen kategori "hamil" lengkap → Submit
   - Refresh halaman → Data prefill dari asesmen terbaru
   - Ganti kategori → Isi "menyusui" → Submit → Verifikasi dua context tersimpan

4. **NutriPlan Generasi & Regenerasi**
   - Setelah NutriCheck → Buka tab NutriPlan → Generate plan
   - Verifikasi 30 hari × 5 slot, anggaran/hari sesuai input
   - Klik "Buat Ulang" → Versi increment, plan baru tersimpan
   - Logout → Login → Buka NutriPlan → Plan aktif (READY) masih tampil

5. **NutriHelp → Admin Review → NutriAssist → NutriWallet**
   - User buat kampanye → Publish → Admin approve di `/admin` (tab Donasi)
   - User lain donasi via NutriAssist (QRIS) → Admin verifikasi di `/admin` (tab Pembayaran)
   - Wallet penerima update → User ajukan penarikan → Admin complete di `/admin` (tab Pembayaran)
   - Verifikasi saldo `available_balance` & riwayat penarikan di tab NutriHelp

6. **Hubungi Kami**
   - Isi form di `/hubungi-kami` → Submit → Pesan muncul di admin tab Pesan

---

## Catatan Implementasi

- **NutriDaily**: Hanya terdefinisi di PRD dan landing page. **Belum ada implementasi backend/frontend**.
- **Video aset**: `video-background.mp4` dan `video_AsistenAI.mp4` belum tersedia. Halaman menggunakan fallback poster (`bg-fitur.png`, `bg-popup01.png`).
- **Password recovery**: Belum diimplementasikan (UI menampilkan "Fitur pemulihan kata sandi segera hadir").
- **NutriWallet**: Saldo virtual, belum ada integrasi payment gateway nyata untuk pencairan.
- **Semantic versioning**: Belum diterapkan (package.json `0.1.0`).

---

## Lisensi

Proyek internal untuk keperluan lomba/pembelajaran. Lisensi belum ditentukan.