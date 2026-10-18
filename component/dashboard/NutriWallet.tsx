"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";
import { BankSelect, BANKS } from "./BankSelect";
import type { MyCampaign, Withdrawal } from "@/lib/dashboard/campaign";

const rpx = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

const MIN_WITHDRAW = 50000;
const PROCESS_NOTICE = "Penarikan dana sedang diproses dan akan dicairkan dalam 1–2 hari kerja.";

interface LedgerEntry {
  id: string;
  t: "in" | "out";
  amt: number;
  ts: number;
  desc: string;
  pending?: boolean;
}

interface NutriWalletProps {
  myCampaign: MyCampaign | null;
  withdrawals: Withdrawal[];
  onWithdraw: (w: Withdrawal) => void;
  onToast: (msg: string) => void;
}

export default function NutriWallet({ myCampaign, withdrawals, onWithdraw, onToast }: NutriWalletProps) {
  const [showWdModal, setShowWdModal] = React.useState(false);
  const [bank, setBank] = React.useState("");
  const [acct, setAcct] = React.useState("");
  const [name, setName] = React.useState("");
  const [amt, setAmt] = React.useState("");
  const [errs, setErrs] = React.useState<Record<string, string>>({});

  // Dana masuk berasal dari donasi pada open donasi milik pengguna
  const donors = React.useMemo(() => myCampaign?.donors ?? [], [myCampaign]);
  const total = donors.reduce((a, d) => a + d.amt, 0);
  const running = myCampaign?.status === "berjalan";
  const held = running ? total : 0;
  const wd = withdrawals.reduce((a, w) => a + w.amt, 0);
  const avail = Math.max(0, total - held - wd);
  const canWithdraw = avail >= MIN_WITHDRAW;

  const ledger = React.useMemo<LedgerEntry[]>(() => {
    const inn: LedgerEntry[] = donors.map((d, i) => ({
      id: `in_${i}_${d.ts}`,
      t: "in",
      amt: d.amt,
      ts: d.ts,
      desc: `Donasi dari ${d.n}`,
    }));
    const out: LedgerEntry[] = withdrawals.map((w) => ({
      id: w.id,
      t: "out",
      amt: w.amt,
      ts: w.ts,
      desc: `Penarikan ke ${w.bank} ${w.acctMasked} a.n. ${w.name}`,
      pending: w.status === "diproses",
    }));
    return [...inn, ...out].sort((a, b) => b.ts - a.ts);
  }, [donors, withdrawals]);

  const pendingList = withdrawals.filter((w) => w.status === "diproses");
  const pendingTotal = pendingList.reduce((a, w) => a + w.amt, 0);

  React.useEffect(() => {
    if (!showWdModal) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setShowWdModal(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [showWdModal]);

  function openModal() {
    setBank(""); setAcct(""); setName(""); setAmt(""); setErrs({});
    setShowWdModal(true);
  }

  function validateWd() {
    const err: Record<string, string> = {};
    if (!bank) err.bank = "Pilih bank tujuan";
    if (acct.length < 8 || acct.length > 16) err.acct = "Nomor rekening harus 8–16 digit";
    if (name.trim().length < 2) err.name = "Isi nama pemilik rekening sesuai buku tabungan";
    const a = Number(amt);
    if (!a || a < MIN_WITHDRAW) err.amt = `Penarikan minimal ${rpx(MIN_WITHDRAW)}`;
    else if (a > avail) err.amt = "Saldo dapat ditarik tidak mencukupi";
    return err;
  }

  function submitWd() {
    const v = validateWd();
    setErrs(v);
    if (Object.keys(v).length) return;
    const b = BANKS.find((x) => x.id === bank);
    onWithdraw({
      id: "wd_" + Date.now(),
      amt: Number(amt),
      ts: Date.now(),
      bank: b ? b.name : bank,
      acctMasked: "•••• " + acct.slice(-4),
      name: name.trim(),
      status: "diproses",
    });
    setShowWdModal(false);
    onToast(PROCESS_NOTICE);
  }

  return (
    <div>
      {/* WALLET HEADER */}
      <div className="db-nh-wh">
        <small>Saldo dapat ditarik</small>
        <div className="big">{rpx(avail)}</div>
        <p>Dana dari donasi yang masuk ke open donasi Anda. Dana yang masih tertahan akan tersedia setelah open donasi selesai. Pencairan dilakukan ke rekening atas nama pemohon.</p>
        <button type="button" className="db-btn" onClick={openModal} disabled={!canWithdraw}>
          <SvgIcon name="wallet" className="db-ic" /> Tarik dana
        </button>
        {!canWithdraw && (
          <p style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
            Penarikan dapat dilakukan saat saldo minimal {rpx(MIN_WITHDRAW)}.
          </p>
        )}
      </div>

      {pendingList.length > 0 && (
        <div className="db-nh-notice" role="status">
          <SvgIcon name="clock" className="" style={{ width: 20, height: 20 }} />
          <div>
            <b>
              {pendingList.length === 1
                ? `Penarikan ${rpx(pendingList[0].amt)} ke ${pendingList[0].bank} ${pendingList[0].acctMasked}`
                : `${pendingList.length} permohonan penarikan (${rpx(pendingTotal)})`}
            </b>
            <span>{PROCESS_NOTICE}</span>
          </div>
        </div>
      )}

      <div className="db-nh-wcols">
        {/* STATS */}
        <div className="db-card">
          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Ringkasan dana</h2>
          <div className="db-sum" style={{ border: 0, padding: 0 }}>
            <div>Total dana masuk<b>{rpx(total)}</b></div>
            <div>Dana tertahan (open donasi berjalan)<b>{rpx(held)}</b></div>
            <div>Total penarikan<b>{rpx(wd)}</b></div>
            <div>Saldo dapat ditarik<b style={{ color: "var(--g)" }}>{rpx(avail)}</b></div>
            <div>Total donatur<b>{donors.length}</b></div>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="db-card">
          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Riwayat transaksi</h2>
          {!ledger.length ? (
            <div className="db-nh-emptyline">Belum ada transaksi.</div>
          ) : (
            <div>
              {ledger.map((tx) => (
                <div key={tx.id} className="db-nh-tx">
                  <span className={`ti${tx.t === "out" ? " out" : ""}`}>
                    <SvgIcon name={tx.t === "out" ? "up" : "down"} className="" style={{ width: 18, height: 18 }} />
                  </span>
                  <div>
                    <b>{tx.desc}</b>
                    <small>
                      {new Date(tx.ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {tx.pending && <i className="db-badge info db-nh-mini">Diproses</i>}
                    </small>
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
        <div className="db-md" onClick={(e) => { if (e.target === e.currentTarget) setShowWdModal(false); }}>
          <div role="dialog" aria-modal="true" aria-label="Tarik dana bantuan" style={{ maxWidth: 460 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Tarik dana bantuan</h2>
              <button type="button" onClick={() => setShowWdModal(false)} aria-label="Tutup" style={{ fontSize: 22, color: "var(--s)" }}>×</button>
            </div>
            <p style={{ color: "var(--s)", fontSize: 14, marginBottom: 14 }}>Saldo dapat ditarik: <b>{rpx(avail)}</b></p>

            <div className={`db-pfield${errs.bank ? " db-err" : ""}`}>
              <label className="db-l" htmlFor="wd_b">Bank tujuan</label>
              <BankSelect id="wd_b" value={bank} onChange={setBank} />
              {errs.bank && <div className="db-em">{errs.bank}</div>}
            </div>
            <div className={`db-pfield${errs.acct ? " db-err" : ""}`}>
              <label className="db-l" htmlFor="wd_ac">Nomor rekening</label>
              <div className="db-inp">
                <input id="wd_ac" inputMode="numeric" autoComplete="off" value={acct} placeholder="Masukkan nomor rekening"
                  onChange={(e) => setAcct(e.target.value.replace(/\D/g, "").slice(0, 16))} />
              </div>
              {errs.acct && <div className="db-em">{errs.acct}</div>}
            </div>
            <div className={`db-pfield${errs.name ? " db-err" : ""}`}>
              <label className="db-l" htmlFor="wd_nm">Nama pemilik rekening</label>
              <div className="db-inp">
                <input id="wd_nm" value={name} maxLength={80} placeholder="Nama sesuai buku tabungan" onChange={(e) => setName(e.target.value)} />
              </div>
              {errs.name && <div className="db-em">{errs.name}</div>}
            </div>
            <div className={`db-pfield${errs.amt ? " db-err" : ""}`}>
              <div className="db-nh-lrow">
                <label className="db-l" htmlFor="wd_am">Nominal penarikan</label>
                <button type="button" className="db-nh-link" onClick={() => setAmt(String(avail))}>Tarik semua saldo</button>
              </div>
              <div className="db-inp">
                <span>Rp</span>
                <input id="wd_am" inputMode="numeric" autoComplete="off" value={amt ? Number(amt).toLocaleString("id-ID") : ""} placeholder="50.000"
                  onChange={(e) => setAmt(e.target.value.replace(/\D/g, "").slice(0, 12))} />
              </div>
              {errs.amt && <div className="db-em">{errs.amt}</div>}
            </div>
            <div className="db-foot">
              <button type="button" className="db-btn o" onClick={() => setShowWdModal(false)}>Batal</button>
              <button type="button" className="db-btn" onClick={submitWd}>Kirim permohonan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}