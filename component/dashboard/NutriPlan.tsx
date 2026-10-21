"use client";
import React from "react";
import { createPortal } from "react-dom";
import { SvgIcon } from "./SvgIcon";
import { PageIntro } from "./SharedComponents";
import { type DayPlan, type Cat, CATS, type Meal, type MealItem, buildPlan } from "@/lib/dashboard/mockData";
import { apiGetCurrentPlan, apiGeneratePlan, type NutriPlanData } from "@/lib/nutriplan/client";
import { apiGetLatestAssessment } from "@/lib/nutricheck/client";

const rp = (k: number) => "Rp " + Math.round(k * 1000).toLocaleString("id-ID");
const rpFlat = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const dk = (d: Date) => d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();

function mapCategoryToDb(cat: Cat): "PREGNANCY" | "BREASTFEEDING" | "CHILD" {
  if (cat === "hamil") return "PREGNANCY";
  if (cat === "menyusui") return "BREASTFEEDING";
  return "CHILD";
}

function mapBackendPlanToDayPlans(backendPlan: NutriPlanData): DayPlan[] {
  return backendPlan.days.map((day) => {
    const rawDate = day.recommendationDate;
    const parsedDate = new Date(rawDate);
    const d = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const m: Meal[] = (day.meals || []).map((slot) => {
      const items: MealItem[] = (slot.items || []).map((it) => ({
        n: it.name,
        q: it.portion,
        c: (it.estimatedCost || 0) / 1000,
        nu: it.nutritionSummary || "",
        b: it.benefit || "",
      }));
      return {
        t: slot.time,
        l: slot.label,
        items,
      };
    });

    return {
      d,
      m,
      c: (day.estimatedCost || 0) / 1000,
      over: day.isOverBudget || false,
    };
  });
}

// ===== SKELETON / SHIMMER =====
function PlanSkeleton({ isGenerating = false }: { isGenerating?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Memuat rekomendasi menu">
      <PageIntro page="plan" action={<div className="db-sk" style={{ width: 150, height: 44, borderRadius: 10 }} />} />
      {isGenerating && (
        <div style={{
          background: "#ECFDF5",
          border: "1px solid #A7F3D0",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#065F46"
        }}>
          <div style={{
            width: 18,
            height: 18,
            border: "2px solid #059669",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <div style={{ fontSize: 14 }}>
            <b>NutriMate sedang menyusun variasi rencana gizi 30 hari...</b>
            <div style={{ fontSize: 13, color: "#047857", marginTop: 2 }}>
              Menyesuaikan bahan lokal dengan batasan anggaran harian Anda dari katalog pangan gizi.
            </div>
          </div>
        </div>
      )}
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
  const [viewMonth, setViewMonth] = React.useState<Date>(() => {
    if (plan && plan.length > 0 && plan[0]?.d instanceof Date && !isNaN(plan[0].d.getTime())) {
      return new Date(plan[0].d.getFullYear(), plan[0].d.getMonth(), 1);
    }
    return new Date();
  });
  const [localPlan, setLocalPlan] = React.useState<DayPlan[] | null>(plan && plan.length > 0 ? plan : null);
  const [dailyTipsList, setDailyTipsList] = React.useState<string[]>([]);
  const [activePlanMeta, setActivePlanMeta] = React.useState<NutriPlanData | null>(null);
  const [planError, setPlanError] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [approved, setApproved] = React.useState(false);
  const [waNumber, setWaNumber] = React.useState(userPhone);
  const [showModal, setShowModal] = React.useState(false);
  const [waErr, setWaErr] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [fbText, setFbText] = React.useState("");
  const [fbExclude, setFbExclude] = React.useState<string[]>([]);
  const [budgetFactor, setBudgetFactor] = React.useState(1);
  const [seed, setSeed] = React.useState(1);

  const [hasAssessment, setHasAssessment] = React.useState<boolean | null>(null);

  const isMountedRef = React.useRef(true);
  const isFetchingRef = React.useRef(false);
  const onToastRef = React.useRef(onToast);
  React.useEffect(() => { onToastRef.current = onToast; });

  // Load existing plan or generate one from Gemini backend
  const loadOrGeneratePlan = React.useCallback(async (retryCount = 0) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setPlanError(null);

    const dbCategory = mapCategoryToDb(planCat);

    try {
      // 1. Check if an active plan already exists
      const currentRes = await apiGetCurrentPlan(dbCategory);

      if (!isMountedRef.current) return;

      if (currentRes.success && currentRes.data?.plan) {
        const fetchedPlan: NutriPlanData = currentRes.data.plan;
        const mapped = mapBackendPlanToDayPlans(fetchedPlan);
        setLocalPlan(mapped);
        setActivePlanMeta(fetchedPlan);
        setDailyTipsList(fetchedPlan.days.map((d) => d.dailyTips || ""));
        setApproved(fetchedPlan.isApproved || false);
        setHasAssessment(true);
        setSel(0);
        if (mapped.length > 0) {
          setViewMonth(new Date(mapped[0].d.getFullYear(), mapped[0].d.getMonth(), 1));
        }
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // 2. Check whether a saved NutriCheck assessment exists before calling Gemini
      const assessRes = await apiGetLatestAssessment(dbCategory);

      if (!isMountedRef.current) return;

      if (!assessRes.success || !assessRes.data?.latest) {
        // No saved assessment for this category: show honest empty state
        setHasAssessment(false);
        setLocalPlan(null);
        setPlanError(null);
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      setHasAssessment(true);

      // 3. Assessment exists, but plan does not exist: generate a new plan via Gemini
      setIsGenerating(true);
      setLoading(false); // Switch from initial fetch skeleton to explicit generating state
      const genRes = await apiGeneratePlan(dbCategory);

      if (!isMountedRef.current) return;
      setIsGenerating(false);

      if (genRes.success && genRes.data?.planId) {
        // Fetch the freshly generated plan
        const afterGenRes = await apiGetCurrentPlan(dbCategory);
        if (afterGenRes.success && afterGenRes.data?.plan) {
          const freshPlan: NutriPlanData = afterGenRes.data.plan;
          const mapped = mapBackendPlanToDayPlans(freshPlan);
          setLocalPlan(mapped);
          setActivePlanMeta(freshPlan);
          setDailyTipsList(freshPlan.days.map((d) => d.dailyTips || ""));
          setApproved(freshPlan.isApproved || false);
          setSel(0);
          if (mapped.length > 0) {
            setViewMonth(new Date(mapped[0].d.getFullYear(), mapped[0].d.getMonth(), 1));
          }
          setLoading(false);
          isFetchingRef.current = false;
          onToastRef.current("Rencana gizi 30 hari berhasil disusun.");
          return;
        }
      }

      // If generation failed with NO_ASSESSMENT, mark hasAssessment = false
      if (genRes.code === "NO_ASSESSMENT") {
        setHasAssessment(false);
        setLocalPlan(null);
        setPlanError(null);
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // If generation failed with any other error, present honest error state
      const errMsg = genRes.message || "Gagal menyusun rekomendasi gizi.";
      setPlanError(errMsg);
      setLocalPlan(null);
      setLoading(false);
      isFetchingRef.current = false;
    } catch {
      if (!isMountedRef.current) return;
      setIsGenerating(false);
      setPlanError("Terjadi gangguan jaringan saat memuat rekomendasi gizi.");
      setLocalPlan(null);
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [planCat]);

  React.useEffect(() => {
    isMountedRef.current = true;
    loadOrGeneratePlan();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadOrGeneratePlan]);

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

  if (loading || isGenerating) {
    return <PlanSkeleton isGenerating={isGenerating} />;
  }

  if (planError) {
    return (
      <div>
        <PageIntro page="plan" />
        <div className="db-emp">
          <h2 style={{ color: "#d9383a" }}>Gagal Menampilkan Rekomendasi Gizi</h2>
          <p className="db-sub" style={{ marginTop: 8, maxWidth: 480, marginInline: "auto" }}>
            {planError}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <button className="db-btn o" onClick={onGoCheck}>Perbarui NutriCheck</button>
            <button className="db-btn" onClick={() => loadOrGeneratePlan()}>Coba Lagi</button>
          </div>
        </div>
      </div>
    );
  }

  if (!localPlan || localPlan.length === 0) {
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

  async function regen() {
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

    const dbCategory = mapCategoryToDb(planCat);
    try {
      const genRes = await apiGeneratePlan(dbCategory, {
        regenerate: true,
        excludeWords: newExclude,
        budgetFactor: newBF,
      });

      if (genRes.success && genRes.data?.planId) {
        const afterGenRes = await apiGetCurrentPlan(dbCategory);
        if (afterGenRes.success && afterGenRes.data?.plan) {
          const freshPlan: NutriPlanData = afterGenRes.data.plan;
          const mapped = mapBackendPlanToDayPlans(freshPlan);
          setLocalPlan(mapped);
          setActivePlanMeta(freshPlan);
          setDailyTipsList(freshPlan.days.map((d) => d.dailyTips || ""));
          setApproved(false);
          setSel(0);
          if (mapped.length > 0) {
            setViewMonth(new Date(mapped[0].d.getFullYear(), mapped[0].d.getMonth(), 1));
          }
          setLoading(false);
          onToast(words.length ? "Menu disusun ulang: " + words.join(", ") : "Variasi menu baru telah dibuat");
          return;
        }
      }

      // Fallback client preview if network error occurs during regen
      const newPlan = buildPlan(planCat, budget * newBF, newExclude, ns);
      setLocalPlan(newPlan); setSel(0); setLoading(false);
      setViewMonth(new Date(newPlan[0].d.getFullYear(), newPlan[0].d.getMonth(), 1));
      onToast(words.length ? "Menu disusun ulang: " + words.join(", ") : "Variasi menu baru telah dibuat");
    } catch {
      const newPlan = buildPlan(planCat, budget * newBF, newExclude, ns);
      setLocalPlan(newPlan); setSel(0); setLoading(false);
      setViewMonth(new Date(newPlan[0].d.getFullYear(), newPlan[0].d.getMonth(), 1));
      onToast(words.length ? "Menu disusun ulang: " + words.join(", ") : "Variasi menu baru telah dibuat");
    }
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
              <div>Anggaran/hari<b>{rpFlat(activePlanMeta ? activePlanMeta.dailyBudget : budget * budgetFactor)}</b></div>
              <div>Periode<b>30 hari</b></div>
              <div>Status<b style={{ color: approved ? "var(--g)" : "#B54708" }}>{approved ? "Disetujui" : activePlanMeta?.status === "READY" ? "Siap Digunakan" : "Menunggu persetujuan"}</b></div>
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
                  <p className="db-sub">Tulis komentar bahan atau preferensi untuk menyusun variasi menu baru.</p>
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
          {dailyTipsList[sel] && (
            <div style={{
              background: "#E8F5E9",
              border: "1px solid #A5D6A7",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 14,
              color: "#2E7D32"
            }}>
              <b>Tips Gizi Hari Ini:</b> {dailyTipsList[sel]}
            </div>
          )}
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