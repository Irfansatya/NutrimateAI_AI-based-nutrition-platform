"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";
import { PageIntro } from "./SharedComponents";
import { SAMPLE_CAMPAIGNS, CATL, type Campaign } from "@/lib/dashboard/mockData";

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

interface CampaignCardProps {
  c: Campaign;
  onDetail: (c: Campaign) => void;
}

export function CampaignCard({ c, onDetail }: CampaignCardProps) {
  const raised = col(c);
  const p2 = pct(raised, c.target);
  const isFull = full(c);
  const days = leftDays(c);
  return (
    <article className="db-nh-camp">
      <div className={`db-nh-cov c-${c.cat}`}>
        <span className="db-badge">{CATL[c.cat]}</span>
        <SvgIcon name={c.cat === "anak" ? "heart" : "asst"} className="db-ic" />
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
        <button className={`db-btn${isFull ? " o" : ""}`} onClick={() => onDetail(c)}>
          {isFull ? "Lihat detail" : "Lihat dan donasi"}
        </button>
      </div>
    </article>
  );
}

interface DonateModalProps {
  campaign: Campaign;
  onClose: () => void;
  onDone: (camp: Campaign, amount: number, name: string, anon: boolean, msg: string) => void;
  onToast: (msg: string) => void;
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000];

function DonateModal({ campaign: c, onClose, onDone, onToast }: DonateModalProps) {
  const [amount, setAmount] = React.useState(25000);
  const [customAmt, setCustomAmt] = React.useState("");
  const [nameInput, setNameInput] = React.useState("");
  const [anon, setAnon] = React.useState(false);
  const [msgInput, setMsgInput] = React.useState("");
  const [step, setStep] = React.useState<"form" | "qr" | "done">("form");
  const [timer, setTimer] = React.useState(600);
  const finalAmt = customAmt ? Number(customAmt) : amount;

  React.useEffect(() => {
    if (step !== "qr") return;
    const iv = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; }), 1000);
    return () => clearInterval(iv);
  }, [step]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const mmss = (s: number) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

  const raised = col(c);
  const p2 = pct(raised, c.target);

  return (
    <div className="db-md" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {step === "form" && (
        <div style={{ maxWidth: 440 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Donasi</h2>
            <button onClick={onClose} style={{ color: "var(--s)", fontSize: 22 }}>×</button>
          </div>
          <p style={{ fontSize: 14, color: "var(--s)", marginBottom: 4 }}>{c.judul}</p>
          <div className="db-nh-bar2"><i style={{ width: p2 + "%" }} /></div>
          <p style={{ fontSize: 13, color: "var(--s)", marginBottom: 16 }}>{rpx(raised)} terkumpul dari {rpx(c.target)}</p>
          <label className="db-l">Nominal donasi</label>
          <div className="db-nh-nom">
            {PRESET_AMOUNTS.map(a => (
              <button key={a} className={amount === a && !customAmt ? "on" : ""}
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
          <button className="db-btn" style={{ width: "100%", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            disabled={finalAmt < 1000}
            onClick={() => setStep("qr")}>
            <SvgIcon name="qr" className="" style={{ width: 19, height: 19 }} />
            Lanjut bayar dengan QRIS
          </button>
          <span className="db-nh-proto">Prototipe, belum memproses pembayaran nyata.</span>
        </div>
      )}
      {step === "qr" && (
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Scan QRIS untuk membayar</h2>
          <p style={{ fontSize: 14, color: "var(--s)", marginBottom: 12 }}>Buka aplikasi dompet digital atau m-banking Anda, lalu pindai kode QRIS berikut.</p>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.5px", marginBottom: 4 }}>{rpx(finalAmt)}</div>
          {timer > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", background: "#FFF4E5", color: "#B54708", borderRadius: 999, fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
              <SvgIcon name="clock" className="" style={{ width: 15, height: 15 }} />
              {mmss(timer)}
            </div>
          )}
          <div style={{ width: 180, margin: "0 auto 12px", padding: 16, border: "1px solid var(--b)", borderRadius: 16, background: "#fff" }}>
            {/* Placeholder QR grid */}
            <svg viewBox="0 0 80 80" style={{ width: "100%", height: "auto", display: "block" }}>
              {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c2 => {
                const isCorner = (r<3&&c2<3)||(r<3&&c2>3)||(r>3&&c2<3);
                const fill = isCorner ? "#05976A" : (Math.random() > 0.5 ? "#121517" : "none");
                return fill !== "none" ? <rect key={`${r}${c2}`} x={c2*11+1} y={r*11+1} width={10} height={10} rx={1} fill={fill} /> : null;
              }))}
            </svg>
          </div>
          <ol className="db-nh-steps" style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "grid", gap: 10, fontSize: 14, color: "var(--s)", textAlign: "left" }}>
            <li style={{ display: "flex", gap: 10 }}><b style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gl)", color: "var(--g)", display: "grid", placeItems: "center", fontSize: 12, flex: "none" }}>1</b> Buka aplikasi dompet digital atau m-banking.</li>
            <li style={{ display: "flex", gap: 10 }}><b style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gl)", color: "var(--g)", display: "grid", placeItems: "center", fontSize: 12, flex: "none" }}>2</b> Pindai kode QRIS di atas.</li>
            <li style={{ display: "flex", gap: 10 }}><b style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gl)", color: "var(--g)", display: "grid", placeItems: "center", fontSize: 12, flex: "none" }}>3</b> Konfirmasi pembayaran di aplikasi Anda.</li>
          </ol>
          <button className="db-btn" style={{ width: "100%", marginBottom: 10 }}
            onClick={() => { onDone(c, finalAmt, anon ? "Anonim" : (nameInput || "Anonim"), anon, msgInput); setStep("done"); }}>
            Saya sudah membayar
          </button>
          <button className="db-btn o" style={{ width: "100%" }} onClick={() => setStep("form")}>Kembali</button>
          <span className="db-nh-proto">Prototipe: pembayaran tidak diproses sungguhan.</span>
        </div>
      )}
      {step === "done" && (
        <div>
          <div className="db-nh-done">
            <div className="big">
              <SvgIcon name="check_ok" className="" style={{ width: 34, height: 34, stroke: "currentColor", fill: "none", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Terima kasih atas donasi Anda!</h2>
            <p style={{ color: "var(--s)", lineHeight: 1.6, fontSize: 14 }}>Bantuan Anda sebesar <b>{rpx(finalAmt)}</b> sangat berarti bagi penerima.</p>
          </div>
          <button className="db-btn" style={{ width: "100%", marginTop: 16 }} onClick={onClose}>Tutup</button>
          <span className="db-nh-proto">Prototipe: donasi tidak benar-benar diproses.</span>
        </div>
      )}
    </div>
  );
}

interface CampaignDetailProps {
  c: Campaign;
  onBack: () => void;
  onDonate: (c: Campaign) => void;
}

function CampaignDetail({ c, onBack, onDonate }: CampaignDetailProps) {
  const raised = col(c);
  const p2 = pct(raised, c.target);
  const days = leftDays(c);
  const isFull = full(c);
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button className="db-btn o sm" onClick={onBack}>← Kembali</button>
      </div>
      <div className="db-nh-detail">
        <div className="db-nh-dmain">
          <div className={`db-nh-cov c-${c.cat}`} style={{ height: 150, borderRadius: "0" }} />
          <div className="db-nh-in">
            <div className="db-nh-loc"><SvgIcon name="pin" className="" style={{ width: 15, height: 15 }} />{c.kota}</div>
            <h2>{c.judul}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span className={`db-badge ok`}>{CATL[c.cat]}</span>
              <span style={{ color: "var(--s)", fontSize: 13 }}>oleh {c.nama}</span>
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
            <h2>Donasi sekarang</h2>
            <p style={{ color: "var(--s)", fontSize: 14, marginBottom: 14 }}>Nominal yang Anda pilih akan langsung membantu penerima.</p>
            <div className="db-nh-bar2"><i style={{ width: p2 + "%" }} /></div>
            <div className="db-nh-amt" style={{ margin: "10px 0 16px" }}>
              <b>{rpx(raised)}</b><span>dari {rpx(c.target)}</span>
            </div>
            {isFull ? (
              <div className="db-nh-okbox">Target donasi telah tercapai. Terima kasih atas dukungan para donatur! 💚</div>
            ) : (
              <button className="db-btn" style={{ width: "100%" }} onClick={() => onDonate(c)}>
                Donasi sekarang
              </button>
            )}
            <span className="db-nh-proto">Prototipe: donasi tidak diproses sungguhan.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NutriAssistProps {
  onToast: (msg: string) => void;
}

export default function NutriAssist({ onToast }: NutriAssistProps) {
  const [allCampaigns, setAllCampaigns] = React.useState<Campaign[]>([...SAMPLE_CAMPAIGNS]);
  const [filter, setFilter] = React.useState("all");
  const [view, setView] = React.useState<Campaign | null>(null);
  const [donating, setDonating] = React.useState<Campaign | null>(null);

  const filtered = filter === "all" ? allCampaigns : allCampaigns.filter(c => c.cat === filter);

  function handleDone(c: Campaign, amount: number, name: string, anon2: boolean, msg: string) {
    setAllCampaigns(prev => prev.map(camp => {
      if (camp.id !== c.id) return camp;
      return { ...camp, donors: [{ n: anon2 ? "Anonim" : name, amt: amount, msg, ts: Date.now() }, ...camp.donors] };
    }));
    setDonating(null);
    onToast("Terima kasih! Donasi prototipe berhasil dicatat.");
  }

  if (view) {
    return (
      <div>
        <PageIntro page="assist" />
        <CampaignDetail c={view} onBack={() => setView(null)} onDonate={c => { setDonating(c); }} />
        {donating && <DonateModal campaign={donating} onClose={() => setDonating(null)} onDone={handleDone} onToast={onToast} />}
      </div>
    );
  }

  return (
    <div>
      <PageIntro page="assist" />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18, alignItems: "center", justifyContent: "space-between" }}>
        <div className="db-seg" style={{ margin: 0 }}>
          {[["all", "Semua"], ["hamil", "Ibu hamil"], ["menyusui", "Ibu menyusui"], ["anak", "Anak"]].map(([v, l]) => (
            <button key={v} className={filter === v ? "on" : ""} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
        <span style={{ color: "var(--s)", fontSize: 13 }}>{filtered.length} open donasi aktif</span>
      </div>
      <div className="db-nh-grid">
        {filtered.map(c => <CampaignCard key={c.id} c={c} onDetail={c2 => setView(c2)} />)}
      </div>
      {donating && <DonateModal campaign={donating} onClose={() => setDonating(null)} onDone={handleDone} onToast={onToast} />}
    </div>
  );
}
