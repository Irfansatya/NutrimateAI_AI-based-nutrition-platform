"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";
import { CampaignCard, CampaignDetail } from "./NutriAssist";
import { CATL } from "@/lib/dashboard/mockData";
import type { CampaignStatus, MyCampaign } from "@/lib/dashboard/campaign";

const rpx = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const col = (c: MyCampaign) => c.donors.reduce((a, d) => a + d.amt, 0);
const pct = (a: number, b: number) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);
const leftDays = (c: MyCampaign) => Math.max(0, Math.ceil((c.deadline - Date.now()) / 864e5));
const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const fmtShort = (ts: number) =>
  new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const STEP_LABELS = ["Terkirim", "Dalam review", "Disetujui", "Donasi berjalan"];

const BADGES: Record<CampaignStatus, [string, string]> = {
  review: ["Pengecekan berlangsung", "info"],
  revisi: ["Perlu revisi", "warn"],
  ditolak: ["Ditolak", "bad"],
  disetujui: ["Disetujui", "ok"],
  berjalan: ["Donasi berjalan", "ok"],
  selesai: ["Selesai", "gray"],
  dibatalkan: ["Dibatalkan", "gray"],
};

// ===== TRACK 4 TAHAP =====
function Track({ mine }: { mine: MyCampaign }) {
  const s = mine.status;
  const cur =
    s === "review" || s === "revisi" || s === "ditolak" ? 1 : s === "disetujui" ? 2 : s === "berjalan" ? 3 : 4;
  const reviewSub: Record<string, [string, string]> = {
    review: ["Pengecekan berlangsung", "info"],
    revisi: ["Perlu revisi", "warn"],
    ditolak: ["Ditolak", "bad"],
  };

  return (
    <ul className="db-nh-track">
      {STEP_LABELS.map((l, i) => {
        let sub: [string, string] | null = null;
        if (i === 0) sub = [fmtShort(mine.submittedAt), "muted"];
        if (i === 1 && cur === 1) sub = reviewSub[s];
        if (i === 2 && cur === 2) sub = ["Menunggu publikasi", "ok"];
        if (i === 3 && cur === 3) sub = [`${leftDays(mine)} hari lagi`, "ok"];
        const state = i < cur ? "done" : i === cur ? "on" : "";
        const tone = i === 1 && cur === 1 && s === "revisi" ? " warn" : i === 1 && cur === 1 && s === "ditolak" ? " bad" : "";
        const alert = tone !== "";
        return (
          <li key={l} className={`${state}${tone}`}>
            <b>
              {i < cur ? (
                <SvgIcon name="check_ok" className="" style={{ width: 13, height: 13 }} />
              ) : alert ? (
                "!"
              ) : (
                i + 1
              )}
            </b>
            <div>
              <span>{l}</span>
              {sub && <small className={`db-nh-sub ${sub[1]}`}>{sub[0]}</small>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ===== TABEL KEBUTUHAN =====
function NeedTable({ mine }: { mine: MyCampaign }) {
  return (
    <table className="db-nh-tbl">
      <thead><tr><th>Kebutuhan</th><th>Jumlah</th><th>Estimasi</th></tr></thead>
      <tbody>{mine.items.map((it, i) => <tr key={i}><td>{it.n}</td><td>{it.q}</td><td>{rpx(it.c)}</td></tr>)}</tbody>
      <tfoot><tr><td>Total</td><td /><td>{rpx(mine.target)}</td></tr></tfoot>
    </table>
  );
}

// ===== RINGKASAN PENGAJUAN =====
function Summary({ mine }: { mine: MyCampaign }) {
  return (
    <div className={`db-nh-sumgrid${mine.thumbnail ? " has-img" : ""}`}>
      {mine.thumbnail && <img className="db-nh-thumb" src={mine.thumbnail} alt="Foto utama open donasi" />}
      <div className="db-nh-facts">
        <div><small>Penerima bantuan</small><b>{mine.form.penerima}</b></div>
        <div><small>Kategori</small><b>{CATL[mine.cat]}</b></div>
        <div><small>Domisili</small><b>{mine.kota}</b></div>
        <div><small>Durasi open donasi</small><b>{mine.durasi} hari</b></div>
        <div><small>Target dana</small><b>{rpx(mine.target)}</b></div>
        <div><small>Dikirim pada</small><b>{fmtDate(mine.submittedAt)}</b></div>
      </div>
    </div>
  );
}

// ===== MODAL KONFIRMASI =====
interface ConfirmModalProps {
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmModal({ title, text, confirmLabel, onConfirm, onClose }: ConfirmModalProps) {
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="db-md" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth: 420 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h2>
        <p style={{ color: "var(--s)", fontSize: 14.5, lineHeight: 1.6 }}>{text}</p>
        <div className="db-nh-actions" style={{ justifyContent: "flex-end", marginTop: 20 }}>
          <button type="button" className="db-btn o" onClick={onClose}>Kembali</button>
          <button type="button" className="db-btn danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ===== KOMPONEN UTAMA =====
interface MyDonationProps {
  mine: MyCampaign | null;
  /** Buka tab Ajukan Open Donasi (untuk revisi atau pengajuan baru) */
  onEdit: () => void;
  onPublish: () => void;
  onCancel: () => void;
  onFinish: () => void;
  /** Hapus open donasi yang sudah berakhir lalu buka form baru */
  onNew: () => void;
  onOpenWallet: () => void;
}

export default function MyDonation({ mine, onEdit, onPublish, onCancel, onFinish, onNew, onOpenWallet }: MyDonationProps) {
  const [confirm, setConfirm] = React.useState<null | "cancel" | "finish">(null);
  const [previewing, setPreviewing] = React.useState(false);

  if (!mine) {
    return (
      <div className="db-card">
        <div className="db-nh-done">
          <div className="big">
            <SvgIcon name="heart" className="" style={{ width: 32, height: 32 }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Belum ada open donasi</h2>
          <p style={{ color: "var(--s)", lineHeight: 1.6, fontSize: 14, marginBottom: 16 }}>
            Ajukan open donasi untuk mendapatkan bantuan kebutuhan gizi dari para donatur.
          </p>
          <button type="button" className="db-btn" onClick={onEdit}>Ajukan Open Donasi</button>
        </div>
      </div>
    );
  }

  if (previewing && mine.status === "berjalan") {
    return <CampaignDetail c={mine} own onBack={() => setPreviewing(false)} />;
  }

  const raised = col(mine);
  const p2 = pct(raised, mine.target);
  const targetReached = raised >= mine.target;
  const inReview = mine.status === "review" || mine.status === "revisi" || mine.status === "ditolak";
  const [badgeLabel, badgeTone] = mine.status === "berjalan" && targetReached ? ["Target tercapai", "ok"] : BADGES[mine.status];
  const endReason =
    mine.endReason === "target"
      ? "Open donasi selesai karena target dana telah tercapai."
      : mine.endReason === "expired"
        ? "Masa open donasi telah berakhir."
        : "Open donasi telah Anda selesaikan.";

  const confirmCopy =
    confirm === "finish"
      ? {
          title: "Selesaikan open donasi lebih awal?",
          text: `Open donasi akan dihentikan sekarang dan tidak dapat dibuka kembali.${targetReached ? "" : ` Target belum tercapai (${p2}%).`} Dana yang terkumpul (${rpx(raised)}) tetap dapat ditarik melalui NutriWallet.`,
          label: "Ya, selesaikan",
        }
      : mine.status === "disetujui"
        ? {
            title: "Batalkan open donasi?",
            text: "Open donasi yang sudah disetujui tidak akan dipublikasikan. Anda dapat membuat pengajuan baru setelahnya.",
            label: "Ya, batalkan",
          }
        : {
            title: "Batalkan pengajuan?",
            text: "Pengajuan Anda tidak akan dilanjutkan ke tahap berikutnya. Anda dapat membuat pengajuan baru setelahnya.",
            label: "Ya, batalkan",
          };

  return (
    <div className="db-card">
      <div className="db-nh-mhead">
        <div>
          <small style={{ color: "var(--g)", fontWeight: 600, fontSize: 12 }}>OPEN DONASI SAYA</small>
          <h2 style={{ marginTop: 4 }}>{mine.judul}</h2>
          <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <i className={`db-badge ${badgeTone}`}>{badgeLabel}</i>
            <span style={{ color: "var(--s)", fontSize: 13 }}>{CATL[mine.cat]} · {mine.kota}</span>
          </div>
        </div>
      </div>

      {mine.status !== "dibatalkan" && <Track mine={mine} />}

      {/* ===== 2. DALAM REVIEW ===== */}
      {inReview && (
        <section className="db-nh-panel">
          <div className="db-nh-panel-h">
            <h3>Dalam review</h3>
            <i className={`db-badge ${badgeTone}`}>{badgeLabel}</i>
          </div>

          {mine.status === "review" && (
            <p className="db-nh-lead">
              Tim NutrimateAI sedang memeriksa data dan dokumen Anda. Anda akan dihubungi melalui WhatsApp jika ada perkembangan.
            </p>
          )}

          {(mine.status === "revisi" || mine.status === "ditolak") && (
            <div className={`db-nh-admin${mine.status === "ditolak" ? " bad" : ""}`}>
              <b>{mine.status === "revisi" ? "Catatan revisi dari admin" : "Alasan pengajuan ditolak"}</b>
              <p>{mine.adminNote?.trim() || "Admin belum menambahkan catatan. Silakan hubungi kami bila membutuhkan penjelasan."}</p>
            </div>
          )}

          <Summary mine={mine} />

          <details className="db-nh-det">
            <summary>Lihat rincian kebutuhan</summary>
            <NeedTable mine={mine} />
          </details>

          <div className="db-nh-actions">
            {mine.status === "revisi" && (
              <button type="button" className="db-btn" onClick={onEdit}>Perbaiki dan kirim ulang</button>
            )}
            {mine.status === "ditolak" && (
              <button type="button" className="db-btn" onClick={onEdit}>Ajukan ulang</button>
            )}
            {mine.status === "review" && (
              <button type="button" className="db-btn danger" onClick={() => setConfirm("cancel")}>Batalkan pengajuan</button>
            )}
          </div>
        </section>
      )}

      {/* ===== 3. DISETUJUI ===== */}
      {mine.status === "disetujui" && (
        <section className="db-nh-panel">
          <div className="db-nh-panel-h">
            <h3>Disetujui</h3>
            <i className="db-badge ok">Siap dipublikasikan</i>
          </div>
          <div className="db-nh-okbox" style={{ marginBottom: 16 }}>
            Selamat, pengajuan Anda telah disetujui. Publikasikan open donasi agar tampil di NutriAssist selama {mine.durasi} hari sejak tanggal publikasi.
          </div>
          <Summary mine={mine} />
          <details className="db-nh-det">
            <summary>Lihat rincian kebutuhan</summary>
            <NeedTable mine={mine} />
          </details>
          <div className="db-nh-actions">
            <button type="button" className="db-btn" onClick={onPublish}>Publikasikan open donasi</button>
            <button type="button" className="db-btn danger" onClick={() => setConfirm("cancel")}>Batalkan open donasi</button>
          </div>
        </section>
      )}

      {/* ===== 4. DONASI BERJALAN ===== */}
      {mine.status === "berjalan" && (
        <section className="db-nh-panel">
          <div className="db-nh-panel-h">
            <h3>Donasi berjalan</h3>
          </div>
          <div className="db-nh-bar2"><i style={{ width: p2 + "%" }} /></div>
          <div className="db-nh-prow">
            <div>
              <b className="amt">{rpx(raised)}</b>{" "}
              <span>terkumpul dari {rpx(mine.target)}</span>
            </div>
            <div className="meta">
              <span>{p2}%</span>
              <span>{mine.donors.length} donatur</span>
              <span>{leftDays(mine)} hari lagi</span>
            </div>
          </div>

          {targetReached && (
            <div className="db-nh-okbox">
              Target dana telah tercapai. Anda dapat menyelesaikan open donasi sekarang, lalu menarik dana melalui NutriWallet.
            </div>
          )}

          <h3 className="db-nh-h3">Rincian open donasi</h3>
          <div className="db-nh-facts">
            <div><small>Penerima bantuan</small><b>{mine.form.penerima}</b></div>
            <div><small>Kategori</small><b>{CATL[mine.cat]}</b></div>
            <div><small>Provinsi</small><b>{mine.kota}</b></div>
            <div><small>Durasi</small><b>{mine.durasi} hari</b></div>
            <div><small>Dipublikasikan</small><b>{mine.publishedAt ? fmtDate(mine.publishedAt) : "-"}</b></div>
            <div><small>Berakhir pada</small><b>{fmtDate(mine.deadline)}</b></div>
          </div>

          <h3 className="db-nh-h3">Cerita</h3>
          <p className="db-nh-story">{mine.story}</p>

          <h3 className="db-nh-h3">Rincian kebutuhan</h3>
          <NeedTable mine={mine} />

          <h3 className="db-nh-h3">Pratinjau di NutriAssist</h3>
          <p className="db-nh-note" style={{ marginBottom: 12 }}>
            Beginilah open donasi Anda tampil bagi para donatur. Anda tidak dapat berdonasi ke open donasi sendiri.
          </p>
          <div className="db-nh-prev">
            <CampaignCard c={mine} own onDetail={() => setPreviewing(true)} />
          </div>

          <div className="db-nh-actions">
            <button type="button" className="db-btn danger" onClick={() => setConfirm("finish")}>
              {targetReached ? "Selesaikan open donasi" : "Selesaikan lebih awal"}
            </button>
          </div>
        </section>
      )}

      {/* ===== SELESAI ===== */}
      {mine.status === "selesai" && (
        <section className="db-nh-panel">
          <div className="db-nh-panel-h">
            <h3>Open donasi selesai</h3>
          </div>
          <div className="db-nh-okbox" style={{ marginBottom: 16 }}>{endReason}</div>
          <div className="db-nh-facts">
            <div><small>Dana terkumpul</small><b>{rpx(raised)}</b></div>
            <div><small>Target dana</small><b>{rpx(mine.target)} ({p2}%)</b></div>
            <div><small>Total donatur</small><b>{mine.donors.length}</b></div>
            <div><small>Berakhir pada</small><b>{fmtDate(mine.endedAt ?? mine.deadline)}</b></div>
          </div>
          <div className="db-nh-actions">
            <button type="button" className="db-btn" onClick={onOpenWallet}>Buka NutriWallet</button>
            <button type="button" className="db-btn o" onClick={onNew}>Ajukan open donasi baru</button>
          </div>
        </section>
      )}

      {/* ===== DIBATALKAN ===== */}
      {mine.status === "dibatalkan" && (
        <section className="db-nh-panel" style={{ borderTop: 0, paddingTop: 0 }}>
          <div className="db-nh-info">Open donasi ini telah dibatalkan. Anda dapat membuat pengajuan baru kapan saja.</div>
          <div className="db-nh-actions">
            <button type="button" className="db-btn" onClick={onNew}>Ajukan open donasi baru</button>
          </div>
        </section>
      )}

      {confirm && (
        <ConfirmModal
          title={confirmCopy.title}
          text={confirmCopy.text}
          confirmLabel={confirmCopy.label}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const action = confirm;
            setConfirm(null);
            if (action === "finish") onFinish();
            else onCancel();
          }}
        />
      )}
    </div>
  );
}