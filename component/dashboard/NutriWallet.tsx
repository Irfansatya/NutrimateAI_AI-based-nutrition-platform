"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";
import { PageIntro } from "./SharedComponents";
import { type Campaign } from "@/lib/dashboard/mockData";

const rpx = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

interface LedgerEntry {
  id: string;
  t: "in" | "out";
  amt: number;
  ts: number;
  desc: string;
  camp?: string;
}

const SAMPLE_LEDGER: LedgerEntry[] = [
  { id: "tx1", t: "in", amt: 100000, ts: Date.now() - 3600000 * 2, desc: "Donasi dari Budi S." },
  { id: "tx2", t: "in", amt: 50000, ts: Date.now() - 3600000 * 12, desc: "Donasi dari Anonim" },
  { id: "tx3", t: "in", amt: 25000, ts: Date.now() - 3600000 * 36, desc: "Donasi dari Dewi L." },
];

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "BSI", "CIMB Niaga", "Permata", "Lainnya"];

interface NutriWalletProps {
  myCampaign: Campaign | null;
  onToast: (msg: string) => void;
}

export default function NutriWallet({ myCampaign, onToast }: NutriWalletProps) {
  const [ledger, setLedger] = React.useState<LedgerEntry[]>(SAMPLE_LEDGER);
  const [showWdModal, setShowWdModal] = React.useState(false);
  const [bank, setBank] = React.useState("");
  const [bankx, setBankx] = React.useState("");
  const [acct, setAcct] = React.useState("");
  const [name, setName] = React.useState("");
  const [amt, setAmt] = React.useState("");
  const [errs, setErrs] = React.useState<Record<string, string>>({});

  const inn = ledger.filter(e => e.t === "in");
  const out = ledger.filter(e => e.t === "out");
  const live = !!myCampaign && myCampaign.status === "disetujui";
  const total = inn.reduce((a, e) => a + e.amt, 0);
  const held = live && myCampaign ? inn.filter(e => e.camp === myCampaign.id).reduce((a, e) => a + e.amt, 0) : 0;
  const wd = out.reduce((a, e) => a + e.amt, 0);
  const avail = Math.max(0, total - held - wd);

  function validateWd() {
    const err: Record<string, string> = {};
    if (!bank) err.bank = "Pilih bank tujuan";
    if (bank === "Lainnya" && bankx.trim().length < 2) err.bankx = "Isi nama bank";
    if (acct.trim().length < 8) err.acct = "Nomor rekening minimal 8 digit";
    if (name.trim().length < 2) err.name = "Isi nama pemilik rekening sesuai buku tabungan";
    const a = Number(amt);
    if (!a || a < 50000) err.amt = "Penarikan minimal Rp 50.000";
    else if (a > avail) err.amt = "Saldo dapat ditarik tidak mencukupi";
    return err;
  }

  function submitWd() {
    const v = validateWd();
    setErrs(v);
    if (Object.keys(v).length) return;
    const a = Number(amt);
    const newTx: LedgerEntry = {
      id: "tx_" + Date.now(),
      t: "out",
      amt: a,
      ts: Date.now(),
      desc: `Penarikan ke ${bank === "Lainnya" ? bankx : bank} - ${acct} a.n. ${name}`,
    };
    setLedger(l => [newTx, ...l]);
    setShowWdModal(false);
    setBank(""); setBankx(""); setAcct(""); setName(""); setAmt("");
    onToast("Permintaan penarikan dicatat di prototipe");
  }

  return (
    <div>
      <PageIntro page="wallet" />
      {/* WALLET HEADER */}
      <div className="db-nh-wh">
        <small>Total Saldo Bantuan Masuk</small>
        <div className="big">{rpx(avail)}</div>
        <p>Dana yang sudah terkumpul dari open donasi yang disetujui. Dapat ditarik ke rekening terverifikasi atas nama pemohon.</p>
        <button className="db-btn" onClick={() => setShowWdModal(true)}>
          <SvgIcon name="wallet" className="db-ic" /> Tarik dana
        </button>
      </div>

      <div className="db-nh-wcols">
        {/* STATS */}
        <div className="db-card">
          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Ringkasan dana</h2>
          <div className="db-sum" style={{ border: 0, padding: 0 }}>
            <div>Total dana masuk<b>{rpx(total)}</b></div>
            <div>Dana tertahan (open donasi berjalan)<b>{rpx(held)}</b></div>
            <div>Total sudah ditarik<b>{rpx(wd)}</b></div>
            <div>Saldo dapat ditarik<b style={{ color: "var(--g)" }}>{rpx(avail)}</b></div>
            <div>Total donatur<b>{inn.length}</b></div>
          </div>
          <div className="db-nh-proto" style={{ marginTop: 14 }}>
            <b>Catatan prototipe:</b> NutriWallet bersifat simulasi frontend. Tidak terhubung ke rekening atau payment gateway nyata.
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="db-card">
          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Riwayat transaksi</h2>
          {!ledger.length ? (
            <div className="db-nh-emptyline">Belum ada transaksi.</div>
          ) : (
            <div>
              {ledger.map(tx => (
                <div key={tx.id} className="db-nh-tx">
                  <span className={`ti${tx.t === "out" ? " out" : ""}`}>
                    <SvgIcon name={tx.t === "out" ? "up" : "down"} className="" style={{ width: 18, height: 18 }} />
                  </span>
                  <div>
                    <b>{tx.desc}</b>
                    <small>{new Date(tx.ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</small>
                  </div>
                  <strong className={tx.t === "in" ? "in" : ""}>
                    {tx.t === "in" ? "+" : "−"}{rpx(tx.amt)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAW MODAL */}
      {showWdModal && (
        <div className="db-md" onClick={e => { if (e.target === e.currentTarget) setShowWdModal(false); }}>
          <div style={{ maxWidth: 460 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Tarik dana bantuan</h2>
              <button onClick={() => setShowWdModal(false)} style={{ fontSize: 22, color: "var(--s)" }}>×</button>
            </div>
            <p style={{ color: "var(--s)", fontSize: 14, marginBottom: 14 }}>Saldo dapat ditarik: <b>{rpx(avail)}</b></p>
            <div className="db-pfield">
              <label className="db-l" htmlFor="wd_b">Bank tujuan</label>
              <div className="db-inp">
                <select id="wd_b" value={bank} onChange={e => setBank(e.target.value)}>
                  <option value="">Pilih bank...</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {errs.bank && <div className="db-em">{errs.bank}</div>}
            </div>
            {bank === "Lainnya" && (
              <div className="db-pfield">
                <label className="db-l" htmlFor="wd_bx">Nama bank lainnya</label>
                <div className="db-inp"><input id="wd_bx" value={bankx} placeholder="Contoh: Bank Jago" onChange={e => setBankx(e.target.value)} /></div>
                {errs.bankx && <div className="db-em">{errs.bankx}</div>}
              </div>
            )}
            <div className="db-pfield">
              <label className="db-l" htmlFor="wd_ac">Nomor rekening</label>
              <div className="db-inp"><input id="wd_ac" type="number" value={acct} placeholder="1234567890" onChange={e => setAcct(e.target.value)} /></div>
              {errs.acct && <div className="db-em">{errs.acct}</div>}
            </div>
            <div className="db-pfield">
              <label className="db-l" htmlFor="wd_nm">Nama pemilik rekening</label>
              <div className="db-inp"><input id="wd_nm" value={name} placeholder="Nama sesuai buku tabungan" onChange={e => setName(e.target.value)} /></div>
              {errs.name && <div className="db-em">{errs.name}</div>}
            </div>
            <div className="db-pfield">
              <label className="db-l" htmlFor="wd_am">Nominal penarikan</label>
              <div className="db-inp"><span>Rp</span><input id="wd_am" type="number" min="50000" step="10000" value={amt} placeholder="50.000" onChange={e => setAmt(e.target.value)} /></div>
              {errs.amt && <div className="db-em">{errs.amt}</div>}
            </div>
            <div className="db-foot">
              <button className="db-btn o" onClick={() => setShowWdModal(false)}>Batal</button>
              <button className="db-btn" onClick={submitWd}>Kirim permohonan</button>
            </div>
            <span className="db-nh-proto" style={{ marginTop: 12 }}>Prototipe: penarikan dana bersifat simulasi dan tidak memotong dana riil.</span>
          </div>
        </div>
      )}
    </div>
  );
}
