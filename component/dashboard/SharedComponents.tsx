"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";
import { MOCK_USER, INTRO, type Cat } from "@/lib/dashboard/mockData";

interface PageIntroProps {
  page: string;
  action?: React.ReactNode;
}

export function PageIntro({ page, action }: PageIntroProps) {
  const [title, sub] = INTRO[page] ?? [page, ""];
  return (
    <header className="db-page-intro">
      <div>
        <h1>
          <span className="db-ripple-mark" aria-hidden="true">
            <i />
            <b />
          </span>
          {title}
        </h1>
        <p className="db-sub">{sub}</p>
      </div>
      {action}
    </header>
  );
}

interface ToastProps {
  message: string;
  onDone: () => void;
}

export function Toast({ message, onDone }: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <div className="db-toast" role="status" aria-live="polite">
      <span>{message}</span>
    </div>
  );
}

interface ProfileModalProps {
  onClose: () => void;
  user: typeof MOCK_USER;
  onUserChange: (u: typeof MOCK_USER) => void;
  onToast: (msg: string) => void;
  onLogout?: () => void;
}

export function ProfileModal({ onClose, user, onUserChange, onToast, onLogout }: ProfileModalProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: user.name, phone: user.phone, photo: user.photo });
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function save() {
    if (draft.name.trim().length < 2) { setErr("Nama lengkap minimal 2 karakter."); return; }
    const digits = draft.phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) { setErr("Periksa kembali nomor WhatsApp (9–15 digit)."); return; }
    onUserChange({ ...user, name: draft.name.trim(), phone: draft.phone.trim(), photo: draft.photo });
    setEditing(false); setErr(""); onToast("Profil berhasil diperbarui");
  }

  return (
    <div className="db-profile-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="db-profile-card" role="dialog" aria-modal="true" aria-label="Profil pengguna">
        <button className="db-pc-close" onClick={onClose} aria-label="Tutup">×</button>
        <div className="db-pc-head">
          <div className="db-pc-avatar">
            {user.photo ? <img src={user.photo} alt="Foto profil" /> : <SvgIcon name="usr" className="" style={{ width: 30, height: 30 }} />}
          </div>
          <div className="db-pc-id">
            <h2>{editing ? (draft.name || "Nama pengguna") : user.name}</h2>
            {!editing && <span className="db-pc-chip">Akun aktif</span>}
          </div>
        </div>
        <div>
          {editing ? (
            <div>
              <div className="db-pfield">
                <label className="db-l" htmlFor="pfn">Nama lengkap</label>
                <div className="db-inp">
                  <input id="pfn" value={draft.name} maxLength={60} autoComplete="name"
                    onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
                </div>
              </div>
              <div className="db-pfield">
                <label className="db-l" htmlFor="pfe">Email</label>
                <div className="db-inp dis">
                  <input id="pfe" value={user.email} disabled />
                </div>
              </div>
              <div className="db-pfield">
                <label className="db-l" htmlFor="pfw">Nomor WhatsApp</label>
                <div className="db-inp">
                  <input id="pfw" type="tel" value={draft.phone} placeholder="+62 812-3456-7890"
                    onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
                </div>
              </div>
              {err && <div className="db-em">{err}</div>}
              <div className="db-profile-actions">
                <button className="db-btn o" onClick={() => { setEditing(false); setErr(""); }}>Batal</button>
                <button className="db-btn" onClick={save}>Simpan perubahan</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="db-pr">
                <span className="db-pi"><SvgIcon name="usr" className="" style={{ width: 17, height: 17 }} /></span>
                <div><small>Nama lengkap</small><b>{user.name}</b></div>
              </div>
              <div className="db-pr">
                <span className="db-pi"><SvgIcon name="mail" className="" style={{ width: 17, height: 17 }} /></span>
                <div><small>Email</small><b>{user.email}</b></div>
              </div>
              <div className="db-pr">
                <span className="db-pi"><SvgIcon name="phone" className="" style={{ width: 17, height: 17 }} /></span>
                <div><small>Nomor WhatsApp</small><b>{user.phone}</b></div>
              </div>
              <div className="db-profile-actions">
                <button
                  className="db-btn danger"
                  onClick={() => {
                    onClose();
                    if (onLogout) {
                      onLogout();
                    } else {
                      onToast("Logout berhasil.");
                    }
                  }}
                >
                  Logout
                </button>
                <button className="db-btn o" onClick={onClose}>Tutup</button>
                <button className="db-btn" onClick={() => { setDraft({ name: user.name, phone: user.phone, photo: user.photo }); setEditing(true); }}>
                  <SvgIcon name="pen" className="db-ic" />Edit profil
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ===== GUIDE MODAL =====
const GUIDE_ITEMS = [
  { nm: "NutriCheck", ic: "chk", t: "Isi data kondisi Anda", lead: "Data ini dipakai NutrimateAI untuk menyusun rekomendasi gizi yang cocok untuk Anda.", steps: ["Pilih kategori: ibu hamil, ibu menyusui, atau anak usia 6–24 bulan.", "Isi data di setiap bagian, lalu tekan <b>Lanjut</b>.", "Di bagian terakhir, tekan <b>Buat Rekomendasi</b>."], tip: "Isi sesuai kondisi terbaru agar rekomendasinya tepat." },
  { nm: "NutriPlan", ic: "cal", t: "Lihat rekomendasi makan", lead: "NutriPlan menampilkan bahan makanan untuk setiap hari selama 30 hari.", steps: ["Pilih tanggal pada kalender.", "Lihat bahan makanan, takaran, dan perkiraan biaya untuk setiap waktu makan.", "Tekan <b>Lihat gizi & manfaat</b> untuk membaca manfaat tiap bahan."], tip: "Yang direkomendasikan adalah bahan makanan, bukan resep masakan." },
  { nm: "NutriDaily", ic: "phone", t: "Terima pengingat lewat WhatsApp", lead: "Setelah menu cocok, rekomendasi harian dikirim langsung ke WhatsApp Anda.", steps: ["Tekan <b>Setuju & Aktifkan WhatsApp</b>.", "Periksa nomor WhatsApp Anda.", "Tekan <b>Aktifkan</b>. Pengingat akan dikirim setiap hari."], tip: "Menu belum cocok? Tulis komentar lalu tekan <b>Kirim & Generate Ulang</b>." },
  { nm: "Perkembangan", ic: "trend", t: "Pantau perkembangan tiap bulan", lead: "Berat dan tinggi badan Anda tercatat otomatis dan ditampilkan dalam grafik.", steps: ["Buka NutriCheck, lalu pilih tab <b>Perkembangan Kondisi</b>.", "Lihat grafik berat badan dan tinggi badan dari bulan ke bulan.", "Perbarui data di tab <b>Isi Data</b> setiap bulan."], tip: "Pembaruan rutin membantu rekomendasi tetap sesuai kondisi Anda." },
  { nm: "NutriHelp", ic: "heart", t: "Ajukan open donasi", lead: "Gunakan fitur ini bila Anda membutuhkan bantuan pangan bergizi.", steps: ["Buka NutriHelp, lalu pilih tab <b>Ajukan Open Donasi</b>.", "Isi identitas, cerita kebutuhan, dan rincian bahan pangan beserta biayanya.", "Unggah dokumen pendukung, setujui pernyataan, lalu tekan <b>Kirim</b>."], tip: "Pengajuan Anda akan diperiksa admin terlebih dahulu." },
  { nm: "NutriWallet", ic: "wallet", t: "Pantau pengajuan dan dana", lead: "Lihat perkembangan pengajuan dan dana donasi yang sudah masuk.", steps: ["Buka tab <b>Open Donasi Saya</b> untuk melihat status pengajuan.", "Setelah disetujui dan donasi masuk, buka tab <b>NutriWallet</b>.", "Lihat saldo dan riwayat transaksi."], tip: "Gunakan rekening atas nama pemohon untuk pencairan dana." },
  { nm: "NutriAssist", ic: "asst", t: "Bantu lewat donasi", lead: "Salurkan bantuan untuk ibu dan anak yang membutuhkan.", steps: ["Pilih open donasi dan baca ceritanya.", "Pilih nominal, lalu isi nama atau pilih donasi anonim.", "Tekan <b>Lanjut bayar dengan QRIS</b>, pindai kodenya, lalu tekan <b>Saya sudah membayar</b>."], tip: "Ini versi prototipe, jadi pembayaran belum diproses sungguhan." },
  { nm: "Profil", ic: "usr", t: "Kelola profil akun", lead: "Periksa atau ubah informasi akun Anda kapan saja.", steps: ["Tekan kotak nama Anda di bagian atas halaman.", "Tekan <b>Edit profil</b>, lalu ubah foto, nama, atau nomor WhatsApp.", "Tekan <b>Simpan perubahan</b>."], tip: "Nomor WhatsApp dipakai untuk mengirim pengingat NutriDaily." },
];

interface GuideModalProps { onClose: () => void; }

export function GuideModal({ onClose }: GuideModalProps) {
  const [idx, setIdx] = React.useState(0);
  const g = GUIDE_ITEMS[idx];

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, GUIDE_ITEMS.length - 1));
      if (e.key === "ArrowLeft") setIdx(i => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="db-gx" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="Panduan NutrimateAI">
      <section className="db-gx-card">
        <header className="db-gx-head">
          <div>
            <h2>Panduan NutrimateAI</h2>
            <p>Pilih fitur untuk melihat cara memakainya.</p>
          </div>
          <button className="db-gx-x" onClick={onClose} aria-label="Tutup panduan">×</button>
        </header>
        <nav className="db-gx-nav" role="tablist">
          {GUIDE_ITEMS.map((item, k) => (
            <button key={k} role="tab" className={idx === k ? "on" : ""} onClick={() => setIdx(k)}>
              <SvgIcon name={item.ic} className="" style={{ width: 17, height: 17 }} />
              <span>{item.nm}</span>
            </button>
          ))}
        </nav>
        <div className="db-gx-body">
          <div className="db-gx-main">
            <figure className="db-gx-fig">
              <div style={{ padding: "40px 20px", textAlign: "center", background: "#f2f8f4", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ opacity: .45 }}>
                  <SvgIcon name={g.ic} className="" style={{ width: 80, height: 80, color: "#05976A" }} />
                </div>
              </div>
            </figure>
            <div className="db-gx-info">
              <p className="db-gx-nm">{g.nm}</p>
              <h3>{g.t}</h3>
              <p className="db-gx-lead">{g.lead}</p>
              <ol className="db-gx-steps">
                {g.steps.map((s, i) => (
                  <li key={i}><b>{i + 1}</b><span dangerouslySetInnerHTML={{ __html: s }} /></li>
                ))}
              </ol>
              <div className="db-gx-tip">
                <SvgIcon name="inf" className="" style={{ width: 18, height: 18, marginTop: 1 }} />
                <span dangerouslySetInnerHTML={{ __html: g.tip }} />
              </div>
            </div>
          </div>
        </div>
        <footer className="db-gx-foot">
          <button className="db-btn o" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>Sebelumnya</button>
          <span className="db-gx-cnt">{idx + 1} dari {GUIDE_ITEMS.length}</span>
          <button className="db-btn" onClick={() => { if (idx === GUIDE_ITEMS.length - 1) onClose(); else setIdx(i => i + 1); }}>
            {idx === GUIDE_ITEMS.length - 1 ? "Selesai" : "Berikutnya"}
          </button>
        </footer>
      </section>
    </div>
  );
}
