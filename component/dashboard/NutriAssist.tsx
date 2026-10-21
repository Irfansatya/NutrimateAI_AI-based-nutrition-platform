"use client";
import React from "react";
import { createPortal } from "react-dom";
import "@/app/dashboard/dashboard-assist.css";
import { SvgIcon } from "./SvgIcon";
import { PageIntro } from "./SharedComponents";
import { CATL, type Campaign } from "@/lib/dashboard/mockData";
import { DONATION_STATUS, type DonationRecord, type MyCampaign } from "@/lib/dashboard/campaign";
import { buildQrMatrix, buildQrisPayload, qrToSvgPath, QRIS_MERCHANT } from "@/lib/dashboard/qris";

/** Campaign yang bisa membawa foto sampul (thumbnail) */
type CardCampaign = Campaign & { thumbnail?: string };

const rpx = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const pct = (a: number, b: number) => b > 0 ? Math.min(100, Math.round(a / b * 100)) : 0;
const col = (c: Campaign) => c.donors.reduce((a, d) => a + d.amt, 0);
const full = (c: Campaign) => col(c) >= c.target;
const leftDays = (c: Campaign) => Math.max(0, Math.ceil((c.deadline - Date.now()) / 864e5));
const ago = (ts: number) => {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
  return m < 60 ? m + " menit lalu" : m < 1440 ? Math.round(m / 60) + " jam lalu" : Math.round(m / 1440) + " hari lalu";
};
const ini = (n: string) => (String(n || "?").trim()[0] || "?").toUpperCase();
const fmtDateTime = (ts: number) =>
  new Date(ts).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Nama penerima bantuan: untuk open donasi milik pengguna diambil dari isian formulir */
const recipientOf = (c: CardCampaign) => (c as Partial<MyCampaign>).form?.penerima?.trim() || c.nama;

interface CampaignCardProps {
  c: CardCampaign;
  onDetail: (c: CardCampaign) => void;
  /** true bila ini open donasi milik pengguna sendiri (hanya pratinjau) */
  own?: boolean;
}

export function CampaignCard({ c, onDetail, own = false }: CampaignCardProps) {
  const raised = col(c);
  const p2 = pct(raised, c.target);
  const isFull = full(c);
  const days = leftDays(c);
  const thumb = c.thumbnail;
  return (
    <article className="db-nh-camp">
      <div
        className={thumb ? "db-nh-cov has-thumb" : `db-nh-cov c-${c.cat}`}
        style={thumb ? { backgroundImage: `url("${thumb}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <span className="db-badge">{CATL[c.cat]}</span>
        {own && <span className="db-badge db-nh-own">Open donasi Anda</span>}
        {!thumb && <SvgIcon name={c.cat === "anak" ? "heart" : "asst"} className="db-ic" />}
      </div>
      <div className="db-nh-cb">
        <div className="db-nh-loc">
          <SvgIcon name="pin" className="" style={{ width: 15, height: 15 }} />
          {c.kota}
        </div>
        <h3>{c.judul}</h3>
        <div className="db-nh-bar"><i style={{ width: p2 + "%" }} /></div>
        <div className="db-nh-amt">
          <b>{rpx(raised)}</b>
          <span>dari {rpx(c.target)}</span>
        </div>
        <div className="db-nh-meta">
          <span><SvgIcon name="usr" className="" style={{ width: 15, height: 15 }} />{c.donors.length} donatur</span>
          <span><SvgIcon name="clock" className="" style={{ width: 15, height: 15 }} />{days} hari lagi</span>
        </div>
        <button className={`db-btn${own || isFull ? " o" : ""}`} onClick={() => onDetail(c)}>
          {own ? "Lihat pratinjau detail" : isFull ? "Lihat detail" : "Lihat dan donasi"}
        </button>
      </div>
    </article>
  );
}

// ===== KARTU QRIS =====
function QrisCard({ amount, reference }: { amount: number; reference: string }) {
  const { d, size } = React.useMemo(
    () => qrToSvgPath(buildQrMatrix(buildQrisPayload(amount, reference), "M"), 4),
    [amount, reference]
  );
  return (
    <div className="db-qris">
      <div className="db-qris-head">
        <b>QRIS</b>
        <span>QR Code Standar<br />Pembayaran Nasional</span>
      </div>
      <div className="db-qris-merchant">{QRIS_MERCHANT.name}</div>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Kode QRIS" shapeRendering="crispEdges">
        <rect width={size} height={size} fill="#fff" />
        <path d={d} fill="#000" />
      </svg>
      <div className="db-qris-foot">Dapat dipindai melalui seluruh aplikasi pembayaran yang mendukung QRIS</div>
    </div>
  );
}

// ===== POPUP DONASI =====
type DonateStep = "form" | "qr" | "loading" | "done";

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000];
const DEFAULT_AMOUNT = 25000;
const QR_TIMEOUT_S = 600;
const VERIFY_DELAY_MS = 3000;

const newReference = () =>
  "NM-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).toUpperCase().slice(2, 5);
const mmss = (s: number) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

interface DonateModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSubmit: (d: {
    campaignId: string;
    amount: number;
    donorName?: string;
    isAnonymous?: boolean;
    message?: string;
  }) => Promise<{ success: boolean; donationId?: string; message?: string }>;
}

function DonateModal({ campaign: c, onClose, onSubmit }: DonateModalProps) {
  const [amount, setAmount] = React.useState(DEFAULT_AMOUNT);
  const [customAmt, setCustomAmt] = React.useState("");
  const [nameInput, setNameInput] = React.useState("");
  const [anon, setAnon] = React.useState(false);
  const [msgInput, setMsgInput] = React.useState("");
  const [step, setStep] = React.useState<DonateStep>("form");
  const [timer, setTimer] = React.useState(QR_TIMEOUT_S);
  const [reference, setReference] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const verifyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const finalAmt = customAmt ? Math.round(Number(customAmt)) : amount;
  const canClose = step !== "loading";

  // Hitung mundur batas waktu pembayaran
  React.useEffect(() => {
    if (step !== "qr") return;
    const iv = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; }), 1000);
    return () => clearInterval(iv);
  }, [step]);

  // Tutup dengan tombol Escape (tidak aktif saat proses pengecekan pembayaran)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && canClose) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, canClose]);

  React.useEffect(() => () => { if (verifyTimer.current) clearTimeout(verifyTimer.current); }, []);

  const raised = col(c);
  const p2 = pct(raised, c.target);

  async function goToQr() {
    setErrorMsg("");
    setStep("loading");
    const name = nameInput.trim();
    try {
      const res = await onSubmit({
        campaignId: c.id,
        amount: finalAmt,
        donorName: anon || !name ? "Anonim" : name,
        isAnonymous: anon || !name,
        message: msgInput.trim(),
      });
      if (res.success && res.donationId) {
        setReference(res.donationId);
        setTimer(QR_TIMEOUT_S);
        setStep("qr");
      } else {
        setStep("form");
        setErrorMsg(res.message || "Gagal membuat kode pembayaran QRIS.");
      }
    } catch {
      setStep("form");
      setErrorMsg("Terjadi gangguan jaringan saat membuat transaksi donasi.");
    }
  }

  async function confirmPaid() {
    if (step !== "qr" || timer <= 0) return;
    setStep("loading");
    try {
      const { apiMarkDonationPaid } = await import("@/lib/nutriassist/client");
      const res = await apiMarkDonationPaid(reference);
      if (res.success) {
        verifyTimer.current = setTimeout(() => setStep("done"), 1200);
      } else {
        setStep("qr");
        setErrorMsg(res.message || "Gagal mengonfirmasi pembayaran.");
      }
    } catch {
      setStep("qr");
      setErrorMsg("Terjadi gangguan jaringan saat konfirmasi pembayaran.");
    }
  }

  function donateAgain() {
    setAmount(DEFAULT_AMOUNT);
    setCustomAmt("");
    setMsgInput("");
    setTimer(QR_TIMEOUT_S);
    setStep("form");
  }

  if (typeof document === "undefined") return null;

  // Dirender lewat portal ke <body> agar overlay selalu menutupi seluruh layar
  return createPortal(
    <div className="db-root" style={{ minHeight: 0, background: "transparent" }}>
      <div className="db-md db-dn-md" onClick={e => { if (e.target === e.currentTarget && canClose) onClose(); }}>
        <div className="db-dn-card" role="dialog" aria-modal="true" aria-label="Donasi">
          <div className="db-dn-scroll">

            {step === "form" && (
              <div>
                <div className="db-dn-head">
                  <h2>Donasi</h2>
                  <button type="button" className="db-dn-x" onClick={onClose} aria-label="Tutup">×</button>
                </div>
                <p style={{ fontSize: 14, color: "var(--s)", marginBottom: 4 }}>{c.judul}</p>
                <div className="db-nh-bar2"><i style={{ width: p2 + "%" }} /></div>
                <p style={{ fontSize: 13, color: "var(--s)", marginBottom: 16 }}>{rpx(raised)} terkumpul dari {rpx(c.target)}</p>
                <label className="db-l">Nominal donasi</label>
                <div className="db-nh-nom">
                  {PRESET_AMOUNTS.map(a => (
                    <button key={a} type="button" className={amount === a && !customAmt ? "on" : ""}
                      onClick={() => { setAmount(a); setCustomAmt(""); }}>
                      {rpx(a).replace("Rp ", "")}
                    </button>
                  ))}
                </div>
                <div className="db-pfield">
                  <label className="db-l" htmlFor="camt">Nominal lainnya</label>
                  <div className="db-inp"><span>Rp</span><input id="camt" type="number" min="1000" step="1000" value={customAmt} placeholder="0" onChange={e => setCustomAmt(e.target.value)} /></div>
                </div>
                <div className="db-pfield">
                  <label className="db-l" htmlFor="dnm">Nama donatur</label>
                  <div className="db-inp"><input id="dnm" value={nameInput} placeholder="Nama Anda" disabled={anon} onChange={e => setNameInput(e.target.value)} /></div>
                </div>
                <label className="db-nh-chk" style={{ marginBottom: 12 }}>
                  <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />
                  <span>Donasi sebagai anonim</span>
                </label>
                <div className="db-pfield">
                  <label className="db-l" htmlFor="dms">Pesan (opsional)</label>
                  <div className="db-inp"><input id="dms" value={msgInput} placeholder="Semoga sehat selalu..." onChange={e => setMsgInput(e.target.value)} /></div>
                </div>
                <div className="db-nh-sumrow"><span>Total donasi</span><b>{rpx(finalAmt || 0)}</b></div>
                {errorMsg && <div style={{ color: "#d9383a", fontSize: 13, marginTop: 8, textAlign: "center" }}>{errorMsg}</div>}
                <button type="button" className="db-btn" style={{ width: "100%", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  disabled={!(finalAmt >= 1000)}
                  onClick={goToQr}>
                  <SvgIcon name="qr" className="" style={{ width: 19, height: 19 }} />
                  Lanjut bayar dengan QRIS
                </button>
              </div>
            )}

            {step === "qr" && (
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Scan QRIS untuk membayar</h2>
                <p style={{ fontSize: 14, color: "var(--s)", marginBottom: 12 }}>Buka aplikasi dompet digital atau m-banking Anda, lalu pindai kode QRIS berikut.</p>
                <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.5px", marginBottom: 6 }}>{rpx(finalAmt)}</div>
                <div className={`db-dn-timer${timer > 0 ? "" : " off"}`}>
                  <SvgIcon name="clock" className="" style={{ width: 15, height: 15 }} />
                  {timer > 0 ? mmss(timer) : "Waktu pembayaran habis"}
                </div>
                <QrisCard amount={finalAmt} reference={reference} />
                <ol className="db-dn-steps">
                  <li><b>1</b> Buka aplikasi dompet digital atau m-banking.</li>
                  <li><b>2</b> Pindai kode QRIS di atas.</li>
                  <li><b>3</b> Konfirmasi pembayaran di aplikasi Anda, lalu tekan tombol di bawah.</li>
                </ol>
                <button type="button" className="db-btn" style={{ width: "100%", marginBottom: 10 }}
                  disabled={timer <= 0} onClick={confirmPaid}>
                  Saya sudah membayar
                </button>
                {errorMsg && <div style={{ color: "#d9383a", fontSize: 13, marginBottom: 10, textAlign: "center" }}>{errorMsg}</div>}
                <button type="button" className="db-btn o" style={{ width: "100%" }} onClick={() => setStep("form")}>Kembali</button>
              </div>
            )}

            {step === "loading" && (
              <div className="db-dn-wait" role="status" aria-live="polite">
                <div className="db-ai-ind"><div className="db-ai-spinner" /></div>
                <h2>Memeriksa pembayaran</h2>
                <p>Mohon tunggu sebentar dan jangan menutup jendela ini.</p>
                <div className="db-dn-load" aria-hidden="true"><i /></div>
              </div>
            )}

            {step === "done" && (
              <div>
                <div className="db-nh-done">
                  <div className="big">
                    <SvgIcon name="check_ok" className="" style={{ width: 34, height: 34, stroke: "currentColor", fill: "none", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Terima kasih atas donasi Anda!</h2>
                  <p style={{ color: "var(--s)", lineHeight: 1.6, fontSize: 14 }}>
                    Pembayaran sebesar <b>{rpx(finalAmt)}</b> untuk {c.nama} sedang dalam proses verifikasi oleh platform.
                    Anda dapat memantau statusnya di tab Donasi Saya.
                  </p>
                  <div className="db-dn-ref">
                    <span className="db-badge warn">{DONATION_STATUS.verifikasi.label}</span>
                    <span>No. referensi <b>{reference}</b></span>
                  </div>
                </div>
                <div className="db-dn-actions">
                  <button type="button" className="db-btn o" onClick={onClose}>Kembali</button>
                  <button type="button" className="db-btn" onClick={donateAgain}>Donasi Lagi</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface CampaignDetailProps {
  c: CardCampaign;
  onBack: () => void;
  onDonate?: (c: CardCampaign) => void;
  /** true bila ini open donasi milik pengguna sendiri (hanya pratinjau, tanpa donasi) */
  own?: boolean;
}

export function CampaignDetail({ c, onBack, onDonate, own = false }: CampaignDetailProps) {
  const raised = col(c);
  const p2 = pct(raised, c.target);
  const days = leftDays(c);
  const isFull = full(c);
  const thumb = c.thumbnail;
  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button className="db-btn o sm" onClick={onBack}>← Kembali</button>
        {own && <span className="db-badge info">Pratinjau tampilan untuk donatur</span>}
      </div>
      <div className="db-nh-detail">
        <div className="db-nh-dmain">
          <div
            className={thumb ? "db-nh-cov has-thumb" : `db-nh-cov c-${c.cat}`}
            style={{
              height: thumb ? 260 : 150,
              borderRadius: "0",
              ...(thumb ? { backgroundImage: `url("${thumb}")`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
            }}
          />
          <div className="db-nh-in">
            <div className="db-nh-loc"><SvgIcon name="pin" className="" style={{ width: 15, height: 15 }} />{c.kota}</div>
            <h2>{c.judul}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span className={`db-badge ok`}>{CATL[c.cat]}</span>
              <span style={{ color: "var(--s)", fontSize: 13 }}>untuk {recipientOf(c)}</span>
            </div>
            <div className="db-nh-bar2"><i style={{ width: p2 + "%" }} /></div>
            <div className="db-nh-amt" style={{ margin: "10px 0" }}>
              <b>{rpx(raised)}</b><span>terkumpul dari {rpx(c.target)}</span>
              <span className="db-badge ok" style={{ marginLeft: "auto" }}>{p2}%</span>
            </div>
            <div className="db-nh-meta">
              <span><SvgIcon name="usr" className="" style={{ width: 15, height: 15 }} />{c.donors.length} donatur</span>
              <span><SvgIcon name="clock" className="" style={{ width: 15, height: 15 }} />{days} hari lagi</span>
            </div>
            <h3 className="db-nh-h3">Cerita</h3>
            <p className="db-nh-story">{c.story}</p>
            <h3 className="db-nh-h3">Rincian kebutuhan</h3>
            <table className="db-nh-tbl">
              <thead><tr><th>Kebutuhan</th><th>Jumlah</th><th>Estimasi biaya</th></tr></thead>
              <tbody>{c.items.map((it, i) => <tr key={i}><td>{it.n}</td><td>{it.q}</td><td>{rpx(it.c)}</td></tr>)}</tbody>
              <tfoot><tr><td>Total</td><td></td><td>{rpx(c.target)}</td></tr></tfoot>
            </table>
            <h3 className="db-nh-h3">Donatur ({c.donors.length})</h3>
            <div className="db-nh-dl">
              {c.donors.length === 0 && (
                <p style={{ color: "var(--s)", fontSize: 14, padding: "6px 0" }}>Belum ada donatur.</p>
              )}
              {c.donors.slice(0, 8).map((d, i) => (
                <div key={i} className="db-nh-dn">
                  <div className="db-nh-av">{ini(d.n)}</div>
                  <div>
                    <b>{d.n}</b>
                    <small>{ago(d.ts)}</small>
                    {d.msg && <p>{d.msg}</p>}
                  </div>
                  <strong>{rpx(d.amt)}</strong>
                </div>
              ))}
              {c.donors.length > 8 && <p style={{ color: "var(--s)", fontSize: 13, textAlign: "center", padding: "8px 0" }}>dan {c.donors.length - 8} donatur lainnya</p>}
            </div>
          </div>
        </div>
        <div className="db-nh-dside">
          <div className="db-nh-pay">
            <h2>{own ? "Open donasi Anda" : "Donasi sekarang"}</h2>
            {!own && <p style={{ color: "var(--s)", fontSize: 14, marginBottom: 14 }}>Nominal yang Anda pilih akan langsung membantu penerima.</p>}
            <div className="db-nh-bar2"><i style={{ width: p2 + "%" }} /></div>
            <div className="db-nh-amt" style={{ margin: "10px 0 16px" }}>
              <b>{rpx(raised)}</b><span>dari {rpx(c.target)}</span>
            </div>
            {own ? (
              <div className="db-nh-info">Ini adalah tampilan open donasi Anda bagi para donatur. Anda tidak dapat berdonasi ke open donasi sendiri.</div>
            ) : isFull ? (
              <div className="db-nh-okbox">Target donasi telah tercapai. Terima kasih atas dukungan para donatur! 💚</div>
            ) : (
              <button className="db-btn" style={{ width: "100%" }} onClick={() => onDonate?.(c)}>
                Donasi sekarang
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== RIWAYAT DONASI (tab Donasi Saya) =====
function DonationHistory({ donations, onBrowse }: { donations: DonationRecord[]; onBrowse: () => void }) {
  const list = [...donations].sort((a, b) => b.ts - a.ts);

  if (list.length === 0) {
    return (
      <div className="db-card">
        <div className="db-dn-empty">
          <div className="ico"><SvgIcon name="heart" className="" /></div>
          <h3>Belum ada riwayat donasi</h3>
          <p>Donasi yang Anda berikan akan tampil di sini beserta status verifikasi pembayarannya.</p>
          <button type="button" className="db-btn" onClick={onBrowse}>Lihat Open Donasi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="db-card">
      <div className="db-dn-histhead">
        <h2>Riwayat donasi</h2>
        <span>{list.length} donasi</span>
      </div>
      {list.map(d => {
        const st = DONATION_STATUS[d.status];
        return (
          <div key={d.id} className="db-dn-item">
            <div className="db-dn-ico"><SvgIcon name="heart" className="" /></div>
            <div className="db-dn-main">
              <b>{d.campaignTitle}</b>
              <div className="db-dn-meta">
                Untuk {d.recipient} · {CATL[d.cat]}
                {d.anonymous && " · Donasi anonim"}
              </div>
              <div className="db-dn-meta">{fmtDateTime(d.ts)} · {d.method} · Ref {d.id}</div>
              <div className={`db-dn-note ${st.badge}`}>{st.note}</div>
            </div>
            <div className="db-dn-side">
              <span className="db-dn-amt">{rpx(d.amount)}</span>
              <span className={`db-badge ${st.badge}`}>{st.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== HALAMAN NUTRIASSIST =====
type Section = "open" | "mine";

const SECTIONS: [Section, string][] = [
  ["open", "Open Donasi"],
  ["mine", "Donasi Saya"],
];

const CATEGORY_TABS: [string, string][] = [
  ["all", "Semua"],
  ["hamil", "Ibu hamil"],
  ["menyusui", "Ibu menyusui"],
  ["anak", "Anak 6–24 bulan"],
];

interface NutriAssistProps {
  onToast?: (msg: string) => void;
  /** Open donasi milik pengguna; tampil di daftar bila sudah dipublikasikan (hanya pratinjau) */
  myCampaign?: MyCampaign | null;
  /** Riwayat pemberian donasi milik pengguna */
  donations: DonationRecord[];
  /** Daftar kampanye aktif dari database */
  activeCampaigns?: Campaign[];
  /** Status error fetching active campaigns */
  activeCampaignsError?: string | null;
  /** Dipanggil saat pengguna membuat dan membayar donasi */
  onAddDonation: (d: {
    campaignId: string;
    amount: number;
    donorName?: string;
    isAnonymous?: boolean;
    message?: string;
  }) => Promise<{ success: boolean; donationId?: string; message?: string }>;
}

export default function NutriAssist({
  myCampaign = null,
  donations,
  activeCampaigns,
  activeCampaignsError,
  onAddDonation,
}: NutriAssistProps) {
  const [section, setSection] = React.useState<Section>("open");
  const [filter, setFilter] = React.useState("all");
  const [viewId, setViewId] = React.useState<string | null>(null);
  const [donatingId, setDonatingId] = React.useState<string | null>(null);

  const own: MyCampaign | null = myCampaign && myCampaign.status === "berjalan" ? myCampaign : null;
  // Exclude user's own campaign from "others" — it's already shown as `own` card to avoid duplicates
  const others: Campaign[] = (activeCampaigns ?? []).filter(c => !own || c.id !== own.id);
  const all: CardCampaign[] = own ? [own, ...others] : others;
  const filtered = filter === "all" ? all : all.filter(c => c.cat === filter);
  const view = viewId ? all.find(c => c.id === viewId) ?? null : null;
  const donating = donatingId ? others.find(c => c.id === donatingId) ?? null : null;
  const isOwn = (c: CardCampaign) => !!own && c.id === own.id;

  const modal = donating && (
    <DonateModal
      key={donating.id}
      campaign={donating}
      onClose={() => setDonatingId(null)}
      onSubmit={onAddDonation}
    />
  );

  if (view) {
    return (
      <div>
        <PageIntro page="assist" />
        <CampaignDetail c={view} own={isOwn(view)} onBack={() => setViewId(null)} onDonate={c => setDonatingId(c.id)} />
        {modal}
      </div>
    );
  }

  return (
    <div>
      <PageIntro page="assist" />

      <div className="db-seg db-nh-tabs" role="tablist" aria-label="Menu NutriAssist">
        {SECTIONS.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={section === k} className={section === k ? "on" : ""}
            onClick={() => setSection(k)}>
            {l}
          </button>
        ))}
      </div>

      {section === "open" ? (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18, alignItems: "center", justifyContent: "space-between" }}>
            <div className="db-seg" style={{ margin: 0 }}>
              {CATEGORY_TABS.map(([v, l]) => (
                <button key={v} type="button" className={filter === v ? "on" : ""} onClick={() => setFilter(v)}>{l}</button>
              ))}
            </div>
            <span style={{ color: "var(--s)", fontSize: 13 }}>{filtered.length} open donasi aktif</span>
          </div>

          {activeCampaignsError ? (
            <div className="db-card" style={{ padding: "32px 16px", textAlign: "center", color: "#d9383a" }}>
              <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Gagal Memuat Kampanye Donasi</p>
              <p style={{ fontSize: 14, color: "var(--s)" }}>{activeCampaignsError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="db-card" style={{ padding: "32px 16px", textAlign: "center" }}>
              <p style={{ color: "var(--s)", fontSize: 14 }}>Belum ada open donasi yang aktif saat ini.</p>
            </div>
          ) : (
            <div className="db-nh-grid">
              {filtered.map(c => <CampaignCard key={c.id} c={c} own={isOwn(c)} onDetail={c2 => setViewId(c2.id)} />)}
            </div>
          )}
        </>
      ) : (
        <DonationHistory donations={donations} onBrowse={() => setSection("open")} />
      )}

      {modal}
    </div>
  );
}