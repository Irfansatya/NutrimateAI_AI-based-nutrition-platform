"use client";
import React from "react";
import { SvgIcon } from "@/component/dashboard/SvgIcon";
import GuidePopup from "@/component/GuidePopup";
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
}

export function ProfileModal({ onClose, user, onUserChange, onToast }: ProfileModalProps) {
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
                <button className="db-btn danger" onClick={() => { onClose(); onToast("Logout pada prototipe lokal. Hubungkan autentikasi untuk mengakhiri sesi akun."); }}>Logout</button>
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
// Memakai komponen yang sama dengan popup Panduan di landing page,
// sehingga tampilan dan isinya selalu identik.
interface GuideModalProps { onClose: () => void; }

export function GuideModal({ onClose }: GuideModalProps) {
  return <GuidePopup onClose={onClose} />;
}