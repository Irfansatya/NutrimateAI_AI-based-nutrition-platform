"use client";
import React from "react";
import { createPortal } from "react-dom";
import { SvgIcon } from "./SvgIcon";
import { PageIntro } from "./SharedComponents";
import { type DayPlan, type Cat, CATS, buildPlan } from "@/lib/dashboard/mockData";

const rp = (k: number) => "Rp " + Math.round(k * 1000).toLocaleString("id-ID");
const rpFlat = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const dk = (d: Date) => d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();

// ===== SKELETON / SHIMMER =====
function PlanSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat rekomendasi menu">
      <PageIntro page="plan" action={<div className="db-sk" style={{ width: 150, height: 44, borderRadius: 10 }} />} />
      <div className="db-plan-layout">
        <div className="db-plan-left">
          {/* kalender */}
          <div className="db-plan-summary">
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="db-sk" style={{ width: 34, height: 34, borderRadius: 8 }} />
                <div className="db-sk" style={{ width: 150, height: 22 }} />
                <div className="db-sk" style={{ width: 34, height: 34, borderRadius: 8 }} />
              </div>
              <div className="db-skel-cal">
                {Array.from({ length: 35 }).map((_, i) => <div key={i} className="db-sk" />)}
              </div>
            </div>
          </div>
          {/* ringkasan */}
          <div className="db-plan-right">
            <div className="db-sum">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="db-skel-row">
                  <div className="db-sk" style={{ width: "28%" }} />
                  <div className="db-sk" style={{ width: "34%" }} />
                </div>
              ))}
            </div>
            <div className="db-sk" style={{ height: 74, borderRadius: 18 }} />
            <div className="db-sk" style={{ height: 250, borderRadius: 18 }} />
          </div>
        </div>
        {/* menu harian */}
        <div>
          <div className="db-day-head">
            <div>
              <div className="db-sk" style={{ width: 130, height: 14, margin: 0 }} />
              <div className="db-sk" style={{ width: 280, height: 28, margin: "10px 0 0" }} />
            </div>
            <div className="db-sk" style={{ width: 230, height: 38, borderRadius: 12 }} />
          </div>
          <div className="db-meal-list">
            {[0, 1, 2].map(i => (
              <article key={i} className="db-meal">
                <div className="db-meal-h">
                  <div className="db-sk round" style={{ width: 62, height: 24 }} />
                  <div className="db-sk" style={{ width: 110, height: 20 }} />
                </div>
                {[0, 1, 2, 3].map(j => (
                  <div key={j} className="db-skel-row">
                    <div className="db-sk" style={{ width: "42%" }} />
                    <div className="db-sk" style={{ width: "28%" }} />
                  </div>
                ))}
                <div className="db-sk" style={{ width: 150, height: 16, marginTop: 14 }} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface NutriPlanProps {
  plan: DayPlan[] | null;
  planCat: Cat;
  budget: number;
  onGoCheck: () => void;
  onToast: (msg: string) => void;
  userPhone: string;
}

export default function NutriPlan({ plan, planCat, budget, onGoCheck, onToast, userPhone }: NutriPlanProps) {
  const [sel, setSel] = React.useState(0);
  const [viewMonth, setViewMonth] = React.useState<Date>(() => plan ? new Date(plan[0].d.getFullYear(), plan[0].d.getMonth(), 1) : new Date());
  const [localPlan, setLocalPlan] = React.useState<DayPlan[] | null>(plan);
  const [seed, setSeed] = React.useState(1);
  const [fbText, setFbText] = React.useState("");
  const [fbExclude, setFbExclude] = React.useState<string[]>([]);
  const [budgetFactor, setBudgetFactor] = React.useState(1);
  const [approved, setApproved] = React.useState(false);
  const [waNumber, setWaNumber] = React.useState(userPhone);
  const [showModal, setShowModal] = React.useState(false);
  const [waErr, setWaErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  // Skeleton/Shimmer sebentar saat halaman NutriPlan baru dibuka
  const [booting, setBooting] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2200);
    return () => clearTimeout(t);
  }, []);

  // Saat popup NutriDaily terbuka: kunci scroll halaman utama dan izinkan tutup dengan tombol Esc
  React.useEffect(() => {
    if (!showModal) return;
    const html = document.documentElement;
    const body = document.body;
    const prevOverflow = html.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = scrollbarWidth + "px";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowModal(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKey);
    };
  }, [showModal]);

  // Sync plan from props
  React.useEffect(() => { if (plan) { setLocalPlan(plan); setSel(0); setViewMonth(new Date(plan[0].d.getFullYear(), plan[0].d.getMonth(), 1)); } }, [plan]);

  if (!localPlan) {
    return (
      <div>
        <PageIntro page="plan" />
        <div className="db-emp">
          <h2>Mulai dari kebutuhan gizi Anda</h2>
          <p className="db-sub" style={{ marginTop: 8 }}>Lengkapi NutriCheck untuk mendapatkan rekomendasi bahan pangan selama 30 hari.</p>
          <button className="db-btn" style={{ marginTop: 20 }} onClick={onGoCheck}>Isi NutriCheck</button>
        </div>
      </div>
    );
  }

  if (booting || loading) return <PlanSkeleton />;

  const vm = viewMonth;
  const y = vm.getFullYear(), mo = vm.getMonth();
  const fd = new Date(y, mo, 1).getDay();
  const nd = new Date(y, mo + 1, 0).getDate();
  const map: Record<string, number> = {};
  localPlan.forEach((p, i) => { map[dk(p.d)] = i; });

  const today = dk(new Date());
  const p = localPlan[sel];
  const catData = CATS.find(c => c[0] === planCat);
  const catLabel = catData ? catData[1] : planCat;
  const meals = p.m.filter(m => m.items.length);
  const adj = [fbExclude.length ? "tanpa " + fbExclude.join(", ") : "", budgetFactor < 1 ? "anggaran dihemat" : ""].filter(Boolean).join("; ");

  function regen() {
    const t = fbText.toLowerCase();
    const newExclude = [...fbExclude];
    let newBF = budgetFactor;
    const words: string[] = [];
    const regex = /(?:tanpa|tidak mau|tidak suka|jangan|hindari|alergi|bosan(?: dengan)?)\s+([^.;\n]+)/g;
    let m2: RegExpExecArray | null;
    while ((m2 = regex.exec(t)) !== null) {
      m2[1].split(/,|\bdan\b|\bserta\b/).forEach(seg => {
        const w = seg.split(/\s+/).filter(Boolean).join(" ").trim();
        if (w.length > 2 && !newExclude.includes(w)) { newExclude.push(w); words.push("tanpa " + w); }
      });
    }
    if (/murah|hemat|irit/.test(t) && newBF > .6) { newBF *= .8; words.push("anggaran lebih hemat"); }
    setFbExclude(newExclude); setBudgetFactor(newBF);
    const ns = seed + 1; setSeed(ns);
    setLoading(true); setFbText("");
    setTimeout(() => {
      const newPlan = buildPlan(planCat, budget * newBF, newExclude, ns);
      setLocalPlan(newPlan); setSel(0); setLoading(false);
      setViewMonth(new Date(newPlan[0].d.getFullYear(), newPlan[0].d.getMonth(), 1));
      onToast(words.length ? "Menu disusun ulang: " + words.join(", ") : "Variasi menu baru telah dibuat");
    }, 1300);
  }

  function activateWhatsApp() {
    const digits = waNumber.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) { setWaErr("Periksa kembali nomor WhatsApp yang dimasukkan."); return; }
    setApproved(true); setShowModal(false);
    onToast("NutriDaily berhasil diaktifkan");
  }

  const ex = [meals[0], meals[2], meals[4]].filter(Boolean).map(m => `${m.l}: ${m.items.map(i => i.n).join(", ")}`).join(". ");

  return (
    <div className="db-reveal">
      <PageIntro page="plan" action={<button className="db-btn o" onClick={onGoCheck}>Perbarui kondisi</button>} />
      <div className="db-plan-layout">
        <div className="db-plan-left">
          {/* CALENDAR */}
          <div className="db-plan-summary">
            <div className="db-cal">
              <div className="db-ch">
                <button onClick={() => setViewMonth(new Date(y, mo - 1, 1))} aria-label="Bulan sebelumnya">
                  <SvgIcon name="chv" className="" style={{ width: 18, height: 18 }} />
                </button>
                {vm.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                <button onClick={() => setViewMonth(new Date(y, mo + 1, 1))} aria-label="Bulan berikutnya">
                  <SvgIcon name="chr" className="" style={{ width: 18, height: 18 }} />
                </button>
              </div>
              <div className="db-cg">
                {["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"].map(d2 => <small key={d2}>{d2}</small>)}
                {Array.from({ length: fd }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: nd }).map((_, i) => {
                  const day = i + 1;
                  const idx = map[dk(new Date(y, mo, day))];
                  const isTd = dk(new Date(y, mo, day)) === today;
                  const isSel = idx === sel;
                  const hasData = idx !== undefined;
                  return (
                    <button key={day}
                      disabled={!hasData}
                      className={`${hasData ? "in" : ""}${isTd ? " td" : ""}${isSel ? " sl" : ""}`}
                      onClick={() => { if (hasData) setSel(idx); }}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="db-plan-right">
            <div className="db-sum">
              <div>Kategori<b>{catLabel}</b></div>
              <div>Anggaran/hari<b>{rpFlat(budget * budgetFactor)}</b></div>
              <div>Periode<b>30 hari</b></div>
              <div>Status<b style={{ color: approved ? "var(--g)" : "#B54708" }}>{approved ? "Disetujui" : "Menunggu persetujuan"}</b></div>
            </div>
            <div className="db-monthly-target">
              <span>Target bulan ini</span>
              <b>{planCat === "hamil" ? "Mengoptimalkan asupan protein dan zat besi" : planCat === "menyusui" ? "Mendukung kualitas ASI melalui asupan protein dan kalsium" : "Mendukung pertumbuhan melalui asupan protein dan zat besi"}</b>
            </div>
            <div className="db-side-col">
              {approved ? (
                <>
                  <div className="db-info">
                    <h4 style={{ background: "#05976A" }}><SvgIcon name="inf" className="" style={{ width: 18, height: 18 }} />NutriDaily aktif</h4>
                    <p>Pengingat harian akan dikirim melalui WhatsApp ke <b>{waNumber}</b>.</p>
                  </div>
                  <button className="db-btn o" style={{ width: "100%" }} onClick={() => setApproved(false)}>Ubah rencana</button>
                </>
              ) : (
                <div className="db-fbcard">
                  <h3>Belum sesuai?</h3>
                  <p className="db-sub">Tulis komentar, AI akan menyusun ulang rekomendasi sampai Bunda setuju.</p>
                  <textarea id="fb" placeholder="Contoh: tanpa ikan, bosan dengan tempe, buat lebih hemat"
                    value={fbText} onChange={e => setFbText(e.target.value)} style={{ marginTop: 8 }} />
                  <div className="db-sg">
                    {["Tanpa ikan", "Bosan dengan tempe", "Buat lebih hemat"].map(t => (
                      <button key={t} type="button" onClick={() => setFbText(prev => (prev.trim() ? prev.trim().replace(/[,.]$/, "") + ", " : "") + t.toLowerCase())}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <button className="db-btn k" style={{ width: "100%" }} onClick={regen}>Kirim & Generate Ulang</button>
                  {adj && <div className="db-bub" style={{ marginTop: 10 }}>Penyesuaian aktif: {adj}</div>}
                  <button className="db-btn" style={{ width: "100%", marginTop: 14 }} onClick={() => setShowModal(true)}>
                    Setuju & Aktifkan WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DAILY MEALS */}
        <div>
          <div className="db-day-head">
            <div>
              <small>REKOMENDASI HARIAN</small>
              <h2>{p.d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h2>
            </div>
            <div className={`db-day-cost${p.over ? " over" : ""}`}>
              Estimasi biaya bahan <b>{rp(p.c)}</b>
            </div>
          </div>
          <div className="db-meal-list">
            {meals.map((m, mi) => (
              <article key={mi} className="db-meal">
                <div className="db-meal-h">
                  <span className="db-mt">{m.t}</span>
                  <b>{m.l}</b>
                </div>
                <ul className="db-mi">
                  {m.items.map((item, ii) => (
                    <li key={ii}>
                      <span className="db-in">{item.n}</span>
                      <span className="db-iq">{item.q}</span>
                    </li>
                  ))}
                </ul>
                <details>
                  <summary>Lihat gizi & manfaat</summary>
                  <div className="db-dt">
                    {m.items.map((item, ii) => (
                      <div key={ii}>
                        <b>{item.n}</b>
                        <p><em>Perkiraan gizi:</em> {item.nu}</p>
                        <p><em>Manfaat:</em> {item.b}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* NUTRIDAILY MODAL
          Dirender lewat portal ke <body> agar posisi fixed tidak terpengaruh animasi/stacking
          context dari container halaman, sehingga overlay selalu menutupi seluruh layar. */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div className="db-root" style={{ minHeight: 0, background: "transparent" }}>
          <div className="db-md" role="dialog" aria-modal="true" aria-labelledby="wa-title"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <div>
              <h2 id="wa-title">Aktifkan NutriDaily</h2>
              <p className="db-sub" style={{ margin: "6px 0 16px" }}>Pastikan nomor WhatsApp penerima pengingat sudah benar.</p>
              <label className="db-l" htmlFor="wn">Nomor WhatsApp terdaftar</label>
              <div className="db-inp">
                <input id="wn" type="tel" value={waNumber} aria-label="Nomor WhatsApp" placeholder="+6281234567890"
                  onChange={e => { setWaNumber(e.target.value); setWaErr(""); }} />
              </div>
              <div className="db-wa">
                <b>NutrimateAI · Pengingat NutriDaily</b>
                Selamat pagi, Bunda! Rekomendasi bahan pangan hari ini — {ex}. Semoga sehat selalu 💚
              </div>
              {waErr && <div className="db-em" style={{ marginBottom: 8 }}>{waErr}</div>}
              <div className="db-foot">
                <button className="db-btn o" onClick={() => setShowModal(false)}>Batal</button>
                <button className="db-btn" onClick={activateWhatsApp}>Aktifkan</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}