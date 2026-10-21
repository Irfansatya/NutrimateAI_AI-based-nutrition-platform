"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";
import { PageIntro } from "./SharedComponents";
import { CustomSelect, DatePicker, TimePicker } from "./FormControls";
import {
  CATS, PROVINCES, buildPlan, MEAL_SLOTS,
  type Cat, type DayPlan,
} from "@/lib/dashboard/mockData";
import { apiSaveAssessment } from "@/lib/nutricheck/client";

// ===== FORM SCHEMA =====
type FieldType = "num" | "sel" | "rad" | "chk" | "area" | "date" | "time" | "txt" | "bud";

interface Field {
  k: string; l: string; t: FieldType;
  u?: string; ph?: string; req?: number;
  o?: string[]; ex?: string; lain?: boolean;
  if?: (d: Record<string, unknown>) => boolean;
}

const N = (k: string, l: string, u?: string, ph?: string): Field => ({ k, l, t: "num", u, ph });
const SL = (k: string, l: string, o: string[]): Field => ({ k, l, t: "sel", o });
const R = (k: string, l: string, o: string[]): Field => ({ k, l, t: "rad", o });
const K = (k: string, l: string, o: string[]): Field => ({ k, l, t: "chk", o, req: 0 });
const T = (k: string, l: string, t: FieldType, ph?: string, req?: number): Field => ({ k, l, t, ph, req });
const KX = (k: string, l: string, v: string, ex: string, req = 0): Field => ({
  k, l, t: "chk", o: [...v.split("|"), "Lainnya"], ex, req, lain: true
});

const health: [string, string, Field[]] = ["Kondisi Kesehatan", "Riwayat dan kondisi yang perlu diperhatikan AI", [
  KX("rw", "Riwayat penyakit/kondisi", "Hipertensi|Diabetes|Anemia|Asma|Maag|Hipotiroid|Tidak ada", "Tidak ada"),
  KX("al", "Alergi/intoleransi", "Telur|Susu sapi|Kacang|Seafood|Gluten|Intoleransi laktosa|Tidak ada", "Tidak ada"),
  T("ob", "Obat/suplemen tambahan yang dikonsumsi saat ini", "area", "Contoh: tablet tambah darah, kalsium", 0),
]];
const eko: [string, string, Field[]] = ["Kondisi Ekonomi", "Anggaran membantu AI memilih bahan yang terjangkau", [
  { k: "bud", l: "Anggaran makan bunda per hari", t: "bud" },
]];
const ekoAnak: [string, string, Field[]] = ["Kondisi Ekonomi", "Anggaran membantu AI memilih bahan yang terjangkau", [
  { k: "bud", l: "Anggaran makan anak per hari", t: "bud" },
]];
const env: [string, string, Field[]] = ["Lingkungan & Ketersediaan Pangan", "Bahan yang mudah diperoleh di sekitar tempat tinggal", [
  SL("prov", "Domisili (Provinsi)", PROVINCES),
  KX("pokok", "Makanan pokok", "Nasi|Jagung|Singkong|Sagu|Ubi|Kentang", "Tidak mengonsumsi"),
  KX("ph", "Protein hewani", "Telur|Ayam|Ikan|Daging sapi|Hati ayam|Udang", "Tidak mengonsumsi"),
  KX("pn", "Protein nabati", "Tahu|Tempe|Kacang hijau|Kacang merah", "Tidak mengonsumsi"),
  KX("sy", "Sayuran", "Bayam|Kangkung|Wortel|Brokoli|Buncis|Labu|Sawi|Daun kelor", "Tidak mengonsumsi"),
  KX("bh", "Buah", "Pisang|Pepaya|Jeruk|Alpukat|Mangga|Jambu", "Tidak mengonsumsi"),
  KX("su", "Susu", "Susu sapi|Susu kedelai|Susu ibu hamil|Tidak mengonsumsi", "Tidak mengonsumsi"),
]];
const pola: [string, string, Field[]] = ["Pola Makan & Aktivitas", "Kebiasaan harian Bunda", [
  R("fm", "Frekuensi makan", ["2x sehari", "3x sehari", "4x sehari", "5x atau lebih"]),
  KX("diet", "Pola/diet khusus", "Tidak ada|Vegetarian|Rendah garam|Rendah gula", "Tidak ada", 1),
  R("akt", "Aktivitas harian", ["Ringan", "Sedang", "Berat"]),
  T("bgn", "Jam bangun", "time"),
  T("tdr", "Jam tidur", "time"),
  T("pan", "Pantangan/makanan yang dihindari", "area", "Contoh: durian, nanas muda", 0),
]];

type Section = [string, string, Field[], string?];

const SC: Record<Cat, Section[]> = {
  hamil: [
    ["Data Bunda", "Informasi dasar kehamilan", [
      N("usia", "Usia Bunda", "tahun"), N("uk", "Usia kehamilan", "minggu"),
      N("ke", "Kehamilan ke-", "", "1"), N("bb", "Berat badan saat ini", "kg"),
      N("tb", "Tinggi badan", "cm"), N("bb0", "Berat badan sebelum hamil", "kg"),
      T("hpl", "Perkiraan tanggal lahir", "date"),
    ]],
    health, eko, env, pola,
  ],
  menyusui: [
    ["Data Bunda", "Informasi dasar Bunda dan bayi (0–6 bulan)", [
      N("usia", "Usia Bunda", "tahun"), N("ub", "Usia bayi", "bulan", "0–6"),
      N("ke", "Anak ke-", "", "1"), N("bb", "Berat badan saat ini", "kg"),
      N("tb", "Tinggi badan", "cm"), N("bb0", "Berat badan sebelum hamil", "kg"),
      T("lhr", "Tanggal melahirkan", "date"),
    ]],
    health, eko, env, pola,
  ],
  anak: [
    ["Data Anak", "Informasi dasar anak", [
      T("nm", "Nama panggilan anak", "txt", "Contoh: Adik"),
      N("ua", "Usia anak", "bulan", "6–24"),
      R("jk", "Jenis kelamin", ["Laki-laki", "Perempuan"]),
      N("bb", "Berat badan saat ini", "kg"), N("tb", "Panjang/tinggi badan saat ini", "cm"),
      N("bbl", "Berat badan lahir", "kg"), N("pbl", "Panjang/tinggi badan lahir", "cm"),
      R("prem", "Lahir prematur?", ["Ya", "Tidak"]),
      { ...N("ukl", "Usia kehamilan saat lahir", "minggu"), if: (d) => d.prem === "Ya" },
    ]],
    ["Kondisi Kesehatan", "Kondisi dan riwayat kesehatan anak", [
      KX("kon", "Kondisi kesehatan saat ini", "Baik-baik saja|Anemia|Masalah pencernaan|Batuk pilek berulang", "Baik-baik saja", 1),
      KX("al", "Riwayat alergi", "Telur|Susu sapi|Kacang|Seafood|Gluten|Tidak ada", "Tidak ada"),
      T("ob", "Obat/suplemen tambahan", "area", "Contoh: vitamin D, zat besi", 0),
    ]],
    ["Status ASI & MPASI", "Pemberian ASI, susu formula, dan makanan pendamping ASI", [
      R("asi", "Apakah anak masih mendapat ASI?", ["Ya", "Tidak"]),
      R("sf", "Apakah anak mendapat susu formula?", ["Ya", "Tidak"]),
      R("mp", "Apakah anak sudah mendapat MPASI?", ["Sudah", "Belum"]),
      { ...R("fmx", "Frekuensi makan", ["1–2x sehari", "3x sehari", "4x sehari", "5x atau lebih"]), if: (d) => d.mp === "Sudah" },
    ], "ASI & MPASI"],
    ekoAnak, env,
    ["Kebiasaan & Kemampuan Makan", "", [
      K("tx", "Tekstur makanan yang sudah dapat diterima", ["Halus (puree)", "Saring kasar", "Cincang", "Finger food", "Makanan keluarga"]),
      T("tk", "Bahan makanan yang tidak disukai/dihindari", "area", "Contoh: hati ayam, bayam", 0),
    ]],
  ],
};

// ===== FIELD RENDERER =====
interface FieldProps {
  f: Field;
  d: Record<string, unknown>;
  errors: string[];
  /** Menerima patch (boleh lebih dari satu key) agar tidak saling menimpa */
  onChange: (patch: Record<string, unknown>) => void;
}

function FieldComp({ f, d, errors, onChange }: FieldProps) {
  if (f.if && !f.if(d)) return null;
  const v = d[f.k];
  const hasErr = errors.includes(f.k);
  const lainErr = errors.includes(f.k + "_x");
  const isWide = ["chk", "area", "rad", "bud"].includes(f.t);
  const isOptional = f.req === 0;
  const set = (k: string, val: unknown) => onChange({ [k]: val });

  function renderInput() {
    if (f.t === "num") return (
      <div className="db-inp">
        <input type="number" min="0" step="any" value={String(v ?? "")}
          placeholder={f.ph ?? ""}
          onChange={e => set(f.k, e.target.value)} />
        {f.u && <span>{f.u}</span>}
      </div>
    );
    if (f.t === "sel") return (
      <CustomSelect value={String(v ?? "")} options={f.o ?? []}
        placeholder="Pilih..." onChange={val => set(f.k, val)} />
    );
    if (f.t === "date") {
      const t = new Date();
      const todayISO = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
      return (
        <DatePicker value={String(v ?? "")}
          max={f.k === "lhr" ? todayISO : undefined}
          onChange={val => set(f.k, val)} />
      );
    }
    if (f.t === "time") return (
      <TimePicker value={String(v ?? "")} onChange={val => set(f.k, val)} />
    );
    if (f.t === "rad") return (
      <div className="db-chips">
        {f.o?.map(x => (
          <label key={x} className="db-chip">
            <input type="radio" name={f.k} value={x} checked={v === x}
              onChange={() => set(f.k, x)} />
            <span>{x}</span>
          </label>
        ))}
      </div>
    );
    if (f.t === "chk") {
      const arr: string[] = Array.isArray(v) ? (v as string[]) : [];
      const hasLain = arr.includes("Lainnya");
      // Opsi eksklusif ("Tidak ada" / "Tidak mengonsumsi" / "Baik-baik saja")
      const exOn = !!f.ex && arr.includes(f.ex);

      const toggle = (x: string) => {
        const checked = arr.includes(x);
        let next: string[];
        if (f.ex && x === f.ex) {
          // pilih / lepas opsi eksklusif; memilihnya mengosongkan opsi lain
          next = checked ? [] : [x];
        } else if (exOn) {
          return; // opsi lain terkunci selama opsi eksklusif aktif
        } else {
          next = checked ? arr.filter(a => a !== x) : [...arr, x];
        }
        const patch: Record<string, unknown> = { [f.k]: next };
        if (!next.includes("Lainnya")) patch[f.k + "_x"] = "";
        onChange(patch);
      };

      return (
        <div>
          <div className="db-chips">
            {f.o?.map(x => {
              const checked = arr.includes(x);
              const locked = exOn && x !== f.ex;
              return (
                <label key={x} className="db-chip">
                  <input type="checkbox" value={x} checked={checked} disabled={locked}
                    onChange={() => toggle(x)} />
                  <span>{x}</span>
                </label>
              );
            })}
          </div>
          {f.lain && hasLain && (
            <div className={lainErr ? "db-err" : ""} style={{ marginTop: 8 }}>
              <div className="db-inp">
                <input type="text" value={String(d[f.k + "_x"] ?? "")}
                  placeholder="Tuliskan opsi lainnya (wajib diisi)" maxLength={80}
                  onChange={e => set(f.k + "_x", e.target.value)} />
              </div>
              {lainErr && <div className="db-em">Isi kolom &ldquo;Lainnya&rdquo; terlebih dahulu</div>}
            </div>
          )}
        </div>
      );
    }
    if (f.t === "bud") {
      const bv = Number(v) || 25000;
      return (
        <div>
          <div className="db-bv">Rp {bv.toLocaleString("id-ID")}</div>
          <input type="range" min="10000" max="500000" step="1000" value={bv}
            onChange={e => set(f.k, Number(e.target.value))} />
        </div>
      );
    }
    if (f.t === "area") return (
      <textarea value={String(v ?? "")} placeholder={f.ph ?? ""}
        onChange={e => set(f.k, e.target.value)} />
    );
    // txt
    return (
      <div className="db-inp">
        <input type="text" value={String(v ?? "")}
          placeholder={f.ph ?? ""}
          onChange={e => set(f.k, e.target.value)} />
      </div>
    );
  }

  return (
    <div className={`${isWide ? "db-w" : ""}${hasErr ? " db-err" : ""}`}>
      <div className="db-l">
        {f.l}
        {isOptional && <span style={{ color: "var(--s)", fontWeight: 400 }}> (opsional)</span>}
      </div>
      {renderInput()}
      {hasErr && <div className="db-em">Bagian ini wajib diisi</div>}
    </div>
  );
}

// ===== GROWTH DATA =====
export interface GrowthRecord { ym: number; x: number; bb: number; tb: number; bb0?: number | null; jk?: "L" | "P"; }

const WHO_L_W = "5.7,6.4,7.9,9.8;6.0,6.7,8.3,10.3;6.3,6.9,8.6,10.7;6.4,7.1,8.9,11.0;6.6,7.4,9.2,11.4;6.8,7.6,9.4,11.7;6.9,7.7,9.6,12.0;7.1,7.9,9.9,12.3;7.2,8.1,10.1,12.6;7.4,8.3,10.3,12.8;7.5,8.4,10.5,13.1;7.7,8.6,10.7,13.4;7.8,8.8,10.9,13.7;8.0,8.9,11.1,13.9;8.1,9.1,11.3,14.2;8.2,9.2,11.5,14.5;8.4,9.4,11.8,14.7;8.5,9.5,12.0,15.0;8.6,9.7,12.2,15.3";
const WHO_P_W = "5.1,5.7,7.3,9.3;5.3,6.0,7.6,9.8;5.6,6.2,7.9,10.2;5.8,6.4,8.2,10.5;5.9,6.6,8.5,10.9;6.1,6.8,8.7,11.2;6.3,6.9,8.9,11.5;6.4,7.1,9.2,11.8;6.6,7.2,9.4,12.1;6.7,7.4,9.6,12.4;6.9,7.5,9.8,12.6;7.0,7.7,10.0,12.9;7.2,7.8,10.2,13.2;7.3,8.0,10.4,13.5;7.5,8.1,10.6,13.7;7.6,8.3,10.9,14.0;7.8,8.4,11.1,14.3;7.9,8.6,11.3,14.6;8.1,8.7,11.5,14.8";
const WHO_L_H = "61.2,63.3,67.6,71.9;62.7,64.8,69.2,73.5;64.0,66.2,70.6,75.0;65.2,67.5,72.0,76.5;66.4,68.7,73.3,77.9;67.6,69.9,74.5,79.2;68.6,71.0,75.7,80.5;69.6,72.1,76.9,81.8;70.6,73.1,78.0,83.0;71.6,74.1,79.1,84.2;72.5,75.0,80.2,85.4;73.3,76.0,81.2,86.5;74.2,76.9,82.3,87.7;75.0,77.7,83.2,88.8;76.0,78.6,84.2,89.8;76.5,79.4,85.1,90.9;77.2,80.2,86.0,91.9;78.0,81.0,86.9,92.9;78.7,81.7,87.8,93.9";
const WHO_P_H = "58.9,61.2,65.7,70.3;60.3,62.7,67.3,71.9;61.7,64.0,68.7,73.5;62.9,65.3,70.1,75.0;64.1,66.5,71.5,76.4;65.2,67.7,72.8,77.8;66.3,68.9,74.0,79.2;67.3,70.0,75.2,80.5;68.3,71.0,76.4,81.7;69.3,72.0,77.5,83.0;70.2,73.0,78.6,84.2;71.1,74.0,79.7,85.4;72.0,74.9,80.7,86.5;72.8,75.8,81.7,87.6;73.7,76.7,82.7,88.7;74.5,77.5,83.7,89.8;75.2,78.4,84.6,90.8;76.0,79.2,85.5,91.9;76.7,80.0,86.4,92.9";

function whoRef(jk: "L" | "P", type: "w" | "h", age: number) {
  const raw = jk === "L" ? (type === "w" ? WHO_L_W : WHO_L_H) : (type === "w" ? WHO_P_W : WHO_P_H);
  const idx = Math.max(6, Math.min(24, Math.round(age))) - 6;
  return raw.split(";")[idx]?.split(",").map(Number) ?? [0, 0, 0, 0];
}

function nf(x: number) { return (Math.round(x * 10) / 10).toString().replace(".", ","); }
function ml(ym: number) { return new Date(Math.floor(ym / 12), ym % 12, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" }); }

function GrowthChart({ cat, rows, mode }: { cat: Cat; rows: GrowthRecord[]; mode: "bb" | "tb" }) {
  if (!rows.length) return null;
  const last = rows[rows.length - 1];
  const pts = rows.map(r => ({ x: r.x, y: mode === "tb" ? r.tb : r.bb, t: ml(r.ym) }));
  const W = 720, H = 300, L = 46, R2 = 16, T = 20, B = 44;
  let xs: number[] = [], lo: number[] = [], hi: number[] = [], med: number[] | null = null;
  let xl = "", lb: string[] = [];

  if (cat === "hamil") {
    const bmi = (last.bb0 ?? last.bb) / ((last.tb / 100) ** 2);
    const imtCat = bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;
    const loR = [.44, .35, .23, .17][imtCat], hiR = [.58, .5, .33, .27][imtCat];
    for (let x = 0; x <= 40; x++) {
      xs.push(x);
      const tPct = Math.min(x, 13) / 13, e = Math.max(0, x - 13);
      lo.push((last.bb0 ?? last.bb) + .5 * tPct + e * loR);
      hi.push((last.bb0 ?? last.bb) + 2 * tPct + e * hiR);
    }
    xl = "Usia kehamilan (minggu)"; lb = ["Kisaran kenaikan BB dianjurkan", "", "Berat badan Bunda"];
  } else if (cat === "menyusui") {
    const h2 = (last.tb / 100) ** 2;
    const mx = Math.max(6, ...rows.map(r => r.x));
    for (let x = 0; x <= mx; x++) { xs.push(x); lo.push(18.5 * h2); hi.push(24.9 * h2); }
    med = xs.map(() => (last.bb0 ?? last.bb));
    xl = "Usia bayi (bulan)"; lb = ["Rentang IMT normal", "Berat badan sebelum hamil", "Berat badan Bunda"];
  } else {
    const jk = last.jk ?? "P";
    for (let x = 6; x <= 24; x++) {
      xs.push(x);
      const ref = whoRef(jk, mode === "tb" ? "h" : "w", x);
      lo.push(ref[1]); hi.push(ref[3]); (med ??= []).push(ref[2]);
    }
    xl = "Usia anak (bulan)"; lb = ["Rentang normal (−2 s.d. +2 SD)", "Median standar WHO", mode === "tb" ? "Panjang/tinggi anak" : "Berat badan anak"];
  }

  const x0 = xs[0], x1 = xs[xs.length - 1];
  let y0 = Math.min(...lo, ...pts.map(p => p.y));
  let y1 = Math.max(...hi, ...pts.map(p => p.y));
  const pd = (y1 - y0) * .08 || 1; y0 -= pd; y1 += pd;
  const X = (v: number) => L + (Math.min(x1, Math.max(x0, v)) - x0) / (x1 - x0) * (W - L - R2);
  const Y = (v: number) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  const range = (y1 - y0) / 4;
  const p = 10 ** Math.floor(Math.log10(range));
  const f2 = range / p;
  const stp = (f2 <= 1 ? 1 : f2 <= 2 ? 2 : f2 <= 5 ? 5 : 10) * p;
  const gridLines: number[] = [];
  for (let v = Math.ceil(y0 / stp) * stp; v <= y1; v += stp) gridLines.push(v);
  const bandUp = hi.map((v, i) => `${X(xs[i]).toFixed(1)},${Y(v).toFixed(1)}`);
  const bandLo = lo.map((v, i) => `${X(xs[i]).toFixed(1)},${Y(v).toFixed(1)}`).reverse();
  const bandD = `M${bandUp.join("L")}L${bandLo.join("L")}Z`;
  const lineD = pts.map(p2 => `${X(p2.x).toFixed(1)},${Y(p2.y).toFixed(1)}`).join(" ");
  const medD = med ? med.map((v, i) => `${X(xs[i]).toFixed(1)},${Y(v).toFixed(1)}`).join(" ") : null;
  const u = mode === "tb" ? "cm" : "kg";
  const k = Math.max(1, Math.ceil((x1 - x0) / 10));
  const xLabels: number[] = [];
  for (let v = x0; v <= x1; v += k) xLabels.push(v);

  return (
    <div>
      <svg className="db-gsvg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Grafik perkembangan">
        {gridLines.map(v => (
          <g key={v}>
            <line x1={L} x2={W - R2} y1={Y(v).toFixed(1)} y2={Y(v).toFixed(1)} stroke="#E3E6EC" />
            <text x={L - 8} y={Y(v) + 4} textAnchor="end" fontSize="11.5" fill="#505257">{nf(v)}</text>
          </g>
        ))}
        {xLabels.map(v => (
          <text key={v} x={X(v).toFixed(1)} y={H - B + 18} textAnchor="middle" fontSize="11.5" fill="#505257">{v}</text>
        ))}
        <path d={bandD} fill="#05976A" fillOpacity=".14" />
        {medD && <polyline points={medD} fill="none" stroke="#0A7A4F" strokeWidth="1.5" strokeDasharray="5 4" opacity=".75" />}
        {pts.length > 1 && <polyline points={lineD} fill="none" stroke="#05976A" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {pts.map((p2, i) => (
          <g key={i}>
            <circle cx={X(p2.x).toFixed(1)} cy={Y(p2.y).toFixed(1)} r={i === pts.length - 1 ? 6 : 4.5} fill="#05976A" stroke="#fff" strokeWidth="2">
              <title>{p2.t}: {nf(p2.y)} {u}</title>
            </circle>
            <text x={X(p2.x).toFixed(1)} y={Y(p2.y) - 11} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#04684A">{nf(p2.y)}</text>
          </g>
        ))}
        <text x={((L + W - R2) / 2).toFixed(1)} y={H - 6} textAnchor="middle" fontSize="12" fill="#505257">{xl}</text>
      </svg>
      <div className="db-lg">
        <span><i style={{ background: "rgba(5,151,106,.22)" }} />{lb[0]}</span>
        {lb[1] && <span><i className="dsh" />{lb[1]}</span>}
        <span><i style={{ background: "#05976A" }} />{lb[2]}</span>
      </div>
    </div>
  );
}

// ===== GROWTH ANALYSIS =====
interface AnalysisResult { r: GrowthRecord; st: [string, string]; n: string[]; ev: string; el: string; es: string; }

function analyzeGrowth(cat: Cat, rows: GrowthRecord[]): AnalysisResult[] {
  return rows.map((r, i) => {
    const p = rows[i - 1];
    const n: string[] = [];
    let st: [string, string] = ["Sesuai target", "ok"];
    let ev = "", el = "", es = "";
    const h = r.tb / 100;
    const sg2 = (x: number) => (x > 0 ? "+" : x < 0 ? "−" : "±") + nf(Math.abs(x));

    if (cat === "hamil") {
      const bmi = (r.bb0 ?? r.bb) / (h * h);
      const g = r.bb - (r.bb0 ?? r.bb);
      const imtCat = bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;
      const loR = [.44, .35, .23, .17][imtCat], hiR = [.58, .5, .33, .27][imtCat];
      const tPct = Math.min(r.x, 13) / 13, e = Math.max(0, r.x - 13);
      const lo2 = .5 * tPct + e * loR, hi2 = 2 * tPct + e * hiR;
      n.push(`IMT sebelum hamil ${nf(bmi)}. Kenaikan BB yang dianjurkan pada minggu ke-${r.x} adalah ${nf(lo2)}–${nf(hi2)} kg.`);
      if (g < lo2) { st = ["Di bawah target", "warn"]; n.push(`Kenaikan berat badan ${nf(g)} kg masih di bawah kisaran.`); }
      else if (g > hi2) { st = ["Di atas target", "warn"]; n.push(`Kenaikan berat badan ${nf(g)} kg melebihi kisaran.`); }
      else n.push(`Kenaikan berat badan ${nf(g)} kg sudah sesuai kisaran.`);
      if (p && r.x > p.x) {
        const rt = (r.bb - p.bb) / (r.x - p.x);
        n.push(`Dibanding data sebelumnya: ${sg2(r.bb - p.bb)} kg dalam ${r.x - p.x} minggu.`);
        if (rt > 1) { st = ["Naik terlalu cepat", "warn"]; }
        else if (rt < 0 && r.x > 13) { st = ["Berat badan turun", "bad"]; }
      }
      ev = sg2(g) + " kg"; el = "Kenaikan berat badan"; es = `Target ${nf(lo2)}–${nf(hi2)} kg`;
    } else if (cat === "menyusui") {
      const bmi = r.bb / (h * h);
      if (bmi < 18.5) { st = ["Berat badan rendah", "warn"]; n.push(`IMT ${nf(bmi)} di bawah normal.`); }
      else if (bmi >= 25) { st = ["Di atas rentang normal", "warn"]; n.push(`IMT ${nf(bmi)} di atas rentang normal.`); }
      else n.push(`IMT ${nf(bmi)} berada dalam rentang normal.`);
      ev = nf(bmi); el = "IMT saat ini"; es = "Normal 18,5–24,9";
    } else {
      const jk = r.jk ?? "P";
      const rw = whoRef(jk, "w", r.x), rh = whoRef(jk, "h", r.x);
      const wStatus = r.bb < rw[1] ? "warn" : r.bb > rw[3] ? "warn" : "ok";
      const hStatus = r.tb < rh[1] ? "warn" : r.tb > rh[3] ? "warn" : "ok";
      st = (wStatus === "ok" && hStatus === "ok") ? ["Tumbuh sesuai standar", "ok"] : ["Perhatikan pertumbuhan", "warn"];
      n.push(`Berat badan ${nf(r.bb)} kg (median ${nf(rw[2])} kg).`);
      n.push(`Panjang/tinggi ${nf(r.tb)} cm (median ${nf(rh[2])} cm).`);
      ev = r.x + " bulan"; el = "Usia anak"; es = jk === "L" ? "Laki-laki" : "Perempuan";
    }
    return { r, st, n, ev, el, es };
  });
}

// ===== MAIN CHECK COMPONENT =====
interface NutriCheckProps {
  cat: Cat;
  onCatChange: (c: Cat) => void;
  data: Record<Cat, Record<string, unknown>>;
  onDataChange: (cat: Cat, data: Record<string, unknown>) => void;
  growth: Record<Cat, GrowthRecord[]>;
  onGrowthUpdate: (cat: Cat, records: GrowthRecord[]) => void;
  onToast: (msg: string) => void;
  onGoToPlan: (plan: DayPlan[], cat: Cat) => void;
}

export default function NutriCheck({
  cat, onCatChange, data, onDataChange, growth, onGrowthUpdate, onToast, onGoToPlan
}: NutriCheckProps) {
  const [step, setStep] = React.useState(0);
  const [maxStep, setMaxStep] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [ckTab, setCkTab] = React.useState<"form" | "growth">("form");
  const [growthMode, setGrowthMode] = React.useState<"bb" | "tb">("bb");
  const [showAiWait, setShowAiWait] = React.useState(false);
  // 0 = menyiapkan rekomendasi, 1 = rekomendasi siap, 2 = loading singkat sebelum pindah ke NutriPlan
  const [aiPhase, setAiPhase] = React.useState<0 | 1 | 2>(0);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const ss = SC[cat];
  const s = ss[step];
  const d = data[cat];
  const isLast = step === ss.length - 1;

  function setD(patch: Record<string, unknown>) {
    onDataChange(cat, { ...d, ...patch });
  }

  function validateStep() {
    const fields = s[2].filter(f => !(f.if && !f.if(d)));
    const errs: string[] = [];
    for (const f of fields) {
      const v = d[f.k];
      if (f.t === "chk") {
        const arr = Array.isArray(v) ? (v as string[]) : [];
        if (f.req === 1 && !arr.length) errs.push(f.k);
        // "Lainnya" wajib diisi teks (berlaku walau field-nya opsional)
        if (f.lain && arr.includes("Lainnya") && !String(d[f.k + "_x"] ?? "").trim()) errs.push(f.k + "_x");
        continue;
      }
      if (f.req === 0) continue;
      if (f.t === "bud") continue; // selalu punya nilai bawaan
      if (v === undefined || v === "" || v === null) errs.push(f.k);
    }
    return errs;
  }

  async function handleNext() {
    if (showAiWait) return;
    const errs = validateStep();
    setErrors(errs);
    if (errs.length) {
      // scroll to first error
      setTimeout(() => document.querySelector(".db-err")?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
      return;
    }
    if (!isLast) {
      const ns = step + 1;
      setStep(ns); setMaxStep(Math.max(maxStep, ns)); setErrors([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // 1. Persist to backend first
      setShowAiWait(true); setAiPhase(0);

      const categoryEnum = cat === "hamil" ? "PREGNANCY" : cat === "menyusui" ? "BREASTFEEDING" : "CHILD";
      try {
        const res = await apiSaveAssessment({
          category: categoryEnum,
          data: d,
        });

        if (!res.success) {
          setShowAiWait(false);
          onToast(res.message || "Gagal menyimpan asesmen ke server.");
          return;
        }

        // 2. Update local growth chart state with saved metrics
        const bb = Number(d.bb), tb = Number(d.tb);
        const x = cat === "hamil" ? Number(d.uk) : cat === "menyusui" ? Number(d.ub) : Number(d.ua);
        if (bb > 0 && tb > 0 && !isNaN(x)) {
          const now2 = new Date();
          const ym = now2.getFullYear() * 12 + now2.getMonth();
          const rec: GrowthRecord = { ym, x, bb, tb, bb0: Number(d.bb0) || null, jk: d.jk === "Laki-laki" ? "L" : "P" };
          const existing = growth[cat].filter(r => r.ym !== ym);
          onGrowthUpdate(cat, [...existing, rec].sort((a, b) => a.ym - b.ym));
          onToast("Data asesmen dan grafik perkembangan berhasil disimpan.");
        }

        // 3. AI generation simulation transition
        const STEP1 = 2000, STEP2 = 2000;
        timers.current.forEach(clearTimeout);
        timers.current = [
          setTimeout(() => setAiPhase(1), STEP1),
          setTimeout(() => setAiPhase(2), STEP1 + STEP2),
          setTimeout(() => {
            setShowAiWait(false);
            // Pindah ke tab NutriPlan; NutriPlan akan otomatis memuat atau men-generate plan riil dari Gemini backend
            onGoToPlan([], cat);
          }, STEP1 + STEP2 + 1000),
        ];
      } catch {
        setShowAiWait(false);
        onToast("Terjadi gangguan jaringan saat menyimpan asesmen.");
      }
    }
  }

  const growthRows = growth[cat];

  if (ckTab === "growth") {
    const analysis = analyzeGrowth(cat, growthRows);
    const last2 = analysis[analysis.length - 1];
    return (
      <section className="db-form-area" style={{ position: "relative" }}>
        {showAiWait && <AiWaitOverlay phase={aiPhase} />}
        <PageIntro page="check" />
        <div className="db-category-box">
          <h2>Pilih kategori Anda</h2>
          <div className="db-cat-row">
            {CATS.map(c2 => (
              <button key={c2[0]} className={`db-cat-tile${cat === c2[0] ? " on" : ""}`} aria-pressed={cat === c2[0]}
                onClick={() => { onCatChange(c2[0] as Cat); setStep(0); setErrors([]); }}>
                <span className="db-tt"><b>{c2[1]}</b><small>{c2[2]}</small></span>
                <i className="db-rd" />
              </button>
            ))}
          </div>
        </div>
        <div className="db-seg">
          <button onClick={() => setCkTab("form")}>Isi Data</button>
          <button className="on" onClick={() => setCkTab("growth")}>Perkembangan Kondisi</button>
        </div>
        {!growthRows.length ? (
          <div className="db-card db-emp">
            <h2>Belum ada data perkembangan</h2>
            <p className="db-sub" style={{ marginTop: 8 }}>Berat dan tinggi badan dari form NutriCheck akan tercatat otomatis setiap bulan, lalu dianalisis menjadi grafik dan catatan kondisi.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
              <button className="db-btn" onClick={() => setCkTab("form")}>Isi data sekarang</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="db-gtop">
              <h2>Ringkasan bulan terbaru</h2>
              <button className="db-btn sm" onClick={() => { setCkTab("form"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Perbarui data bulan ini</button>
            </div>
            {last2 && (
              <div className="db-stats">
                <div className="db-stat"><small>Berat badan</small><b>{nf(last2.r.bb)} kg</b><span>Data terbaru</span></div>
                <div className="db-stat"><small>Tinggi badan</small><b>{nf(last2.r.tb)} cm</b><span>Data terbaru</span></div>
                <div className="db-stat"><small>{last2.el}</small><b>{last2.ev}</b><span>{last2.es}</span></div>
                <div className="db-stat"><small>Status terbaru</small><div className="db-stb"><i className={`db-badge ${last2.st[1]}`}>{last2.st[0]}</i></div><span>{ml(last2.r.ym)}</span></div>
              </div>
            )}
            <div className="db-gcard">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Grafik perkembangan</h2>
                {cat === "anak" && (
                  <div className="db-gtabs">
                    <button className={growthMode === "bb" ? "on" : ""} onClick={() => setGrowthMode("bb")}>Berat badan</button>
                    <button className={growthMode === "tb" ? "on" : ""} onClick={() => setGrowthMode("tb")}>Panjang/tinggi</button>
                  </div>
                )}
              </div>
              <GrowthChart cat={cat} rows={growthRows} mode={growthMode} />
            </div>
            <div className="db-gcard">
              <div style={{ marginBottom: 14 }}><h2 style={{ fontSize: 18, fontWeight: 600 }}>Catatan perkembangan</h2></div>
              <div className="db-nl">
                {[...analysis].reverse().map((a, i) => (
                  <div key={i} className="db-nt">
                    <div className="db-nt-h"><b>{ml(a.r.ym)}</b><i className={`db-badge ${a.st[1]}`}>{a.st[0]}</i></div>
                    <ul>{a.n.map((t2, j) => <li key={j}>{t2}</li>)}</ul>
                  </div>
                ))}
              </div>
              <p className="db-gnote">Analisis ini berupa perkiraan untuk membantu pemantauan, bukan diagnosis. Konsultasikan hasilnya dengan bidan, dokter, atau posyandu/puskesmas.</p>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section style={{ position: "relative" }}>
      {showAiWait && <AiWaitOverlay phase={aiPhase} />}
      <PageIntro page="check" />
      <div className="db-category-box">
        <h2>Pilih kategori Anda</h2>
        <div className="db-cat-row">
          {CATS.map(c2 => (
            <button key={c2[0]} className={`db-cat-tile${cat === c2[0] ? " on" : ""}`} aria-pressed={cat === c2[0]}
              onClick={() => { onCatChange(c2[0] as Cat); setStep(0); setErrors([]); }}>
              <span className="db-tt"><b>{c2[1]}</b><small>{c2[2]}</small></span>
              <i className="db-rd" />
            </button>
          ))}
        </div>
      </div>
      <div className="db-seg">
        <button className="on" onClick={() => setCkTab("form")}>Isi Data</button>
        <button onClick={() => setCkTab("growth")}>Perkembangan Kondisi</button>
      </div>
      {step === 0 && (
        <div className="db-banner">Perbarui NutriCheck setiap bulan. Berat dan tinggi badan Anda akan tercatat otomatis sebagai grafik di tab Perkembangan Kondisi.</div>
      )}
      <div className="db-steps">
        {ss.map((sx, i) => (
          <button key={i} className={`db-st${i < step ? " done" : ""}${i === step ? " on" : ""}`}
            disabled={i > maxStep}
            onClick={() => { if (i <= maxStep) { setStep(i); setErrors([]); } }}>
            <b>{i < step ? "✓" : i + 1}</b>
            {(sx[3] || sx[0].split(" &")[0])}
          </button>
        ))}
      </div>
      <div className="db-bar"><i style={{ width: `${(step + 1) / ss.length * 100}%` }} /></div>
      <div className="db-card">
        <small style={{ color: "var(--g)", fontWeight: 600 }}>BAGIAN {step + 1} DARI {ss.length}</small>
        <h2 style={{ marginTop: 4 }}>{s[0]}</h2>
        <p style={{ color: "var(--s)", margin: "6px 0 20px", lineHeight: 1.6 }}>{s[1] || "Isi bagian ini sesuai kondisi terkini."}</p>
        <div className="db-grid">
          {s[2].map((f, i) => (
            <FieldComp key={f.k + i} f={f} d={d} errors={errors}
              onChange={patch => setD(patch)} />
          ))}
        </div>
        <div className="db-foot">
          <button className="db-btn o" disabled={step === 0} onClick={() => { setStep(s2 => s2 - 1); setErrors([]); }}>Kembali</button>
          <button className="db-btn" onClick={handleNext}>{isLast ? "Buat Rekomendasi" : "Lanjut"}</button>
        </div>
      </div>
    </section>
  );
}

function AiWaitOverlay({ phase }: { phase: 0 | 1 | 2 }) {
  const content: [string, string][] = [
    ["Menyiapkan rekomendasi gizi", "NutrimateAI sedang menyusun rekomendasi gizi berdasarkan data kondisi yang Anda masukkan."],
    ["Rekomendasi sudah siap", "NutriPlan akan ditampilkan sebentar lagi."],
    ["Membuka NutriPlan", "Mohon tunggu sebentar, rekomendasi Anda sedang dimuat."],
  ];
  const [title, text] = content[phase];
  return (
    <div className="db-ai-wait" style={{ position: "fixed" }}>
      <div className={`db-ai-wait-card${phase === 1 ? " done" : ""}`} data-phase={phase} role="status" aria-live="polite">
        <div className="db-ai-ind">
          <div className="db-ai-spinner" />
          <svg className="db-ai-ok" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <div className="db-ai-msg in" key={phase}>
          <h2>{title}</h2>
          <p>{text}</p>
          {phase === 2 && (
            <div className="db-ai-dots" aria-hidden="true"><i /><i /><i /></div>
          )}
        </div>
        <div className="db-ai-steps" aria-hidden="true"><i /><i /></div>
      </div>
    </div>
  );
}