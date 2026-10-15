"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";
import { PageIntro } from "./SharedComponents";
import { PROVINCES, CATL, SAMPLE_CAMPAIGNS, type Campaign, type Cat } from "@/lib/dashboard/mockData";

const rpx = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
const col = (c: Campaign) => c.donors.reduce((a, d) => a + d.amt, 0);
const pct = (a: number, b: number) => b > 0 ? Math.min(100, Math.round(a / b * 100)) : 0;
const leftDays = (c: Campaign) => Math.max(0, Math.ceil((c.deadline - Date.now()) / 864e5));
const STATUS_LABELS: Record<string, [string, string]> = {
  review: ["Menunggu review admin", "info"],
  revisi: ["Perlu revisi", "warn"],
  ditolak: ["Ditolak", "bad"],
  disetujui: ["Disetujui · open donasi berjalan", "ok"],
  penuh: ["Target tercapai", "ok"],
  selesai: ["Dihentikan pemohon", "gray"],
};

// ===== UPLOAD BUTTON =====
interface UploadAreaProps {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  max?: number;
}

function UploadArea({ label, files, onChange, accept = "image/*,.pdf", max = 5 }: UploadAreaProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  function add(list: FileList | null) {
    if (!list) return;
    const newFiles = [...files, ...Array.from(list)].slice(0, max);
    onChange(newFiles);
  }
  return (
    <div>
      <div className="db-nh-files">
        {files.map((f, i) => (
          <div key={i} className="db-nh-file">
            {f.type.startsWith("image/") ? (
              <img src={URL.createObjectURL(f)} alt={f.name} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 9, background: "var(--gl)", display: "grid", placeItems: "center", flex: "none" }}>
                <SvgIcon name="doc" className="" style={{ width: 24, height: 24, color: "var(--g)" }} />
              </div>
            )}
            <div>
              <b>{f.name}</b>
              <small>{(f.size / 1024).toFixed(0)} KB</small>
            </div>
            <button onClick={() => onChange(files.filter((_, j) => j !== i))} aria-label="Hapus file">
              <SvgIcon name="trash" className="" style={{ width: 16, height: 16 }} />
            </button>
          </div>
        ))}
      </div>
      <button className="db-nh-up" type="button" onClick={() => ref.current?.click()}>
        <SvgIcon name="up" className="" style={{ width: 24, height: 24 }} />
        <div>
          <b>{label}</b>
          <small>JPG, PNG, atau PDF · maks. {max} file</small>
        </div>
      </button>
      <input ref={ref} type="file" accept={accept} multiple hidden
        onChange={e => { add(e.target.files); e.target.value = ""; }} />
    </div>
  );
}

// ===== ITEM ROW =====
interface NeedItem { n: string; q: string; c: number; }

function ItemRow({ item, index, onChange, onDelete }: { item: NeedItem; index: number; onChange: (i: number, f: keyof NeedItem, v: string | number) => void; onDelete: (i: number) => void; }) {
  return (
    <div className="db-nh-item">
      <div className="db-inp"><input value={item.n} placeholder="Nama bahan/kebutuhan" onChange={e => onChange(index, "n", e.target.value)} /></div>
      <div className="db-inp"><input value={item.q} placeholder="Jumlah/satuan" onChange={e => onChange(index, "q", e.target.value)} /></div>
      <div className="db-inp"><span>Rp</span><input type="number" min="0" step="500" value={item.c || ""} placeholder="0" onChange={e => onChange(index, "c", Number(e.target.value))} /></div>
      <button className="db-nh-del" onClick={() => onDelete(index)} aria-label="Hapus baris">
        <SvgIcon name="trash" className="" style={{ width: 17, height: 17 }} />
      </button>
    </div>
  );
}

// ===== STEP DEFINITIONS =====
const STEPS: [string, string][] = [
  ["Identitas", "Identitas pemohon atau wali"],
  ["Kondisi", "Kondisi penerima bantuan"],
  ["Ekonomi", "Kondisi ekonomi"],
  ["Kebutuhan", "Rincian kebutuhan pangan"],
  ["Pernyataan", "Konfirmasi dan kirim"],
];

// ===== FORM STATE =====
interface HelpForm {
  role: string; cat: string; nama: string; wa: string; penerima: string; kota: string;
  hub: string; hubx: string;
  files: { ktp: File[]; kondisi: File[]; ekonomi: File[]; };
  eko: string;
  judul: string; story: string;
  items: NeedItem[];
  agreeStmt: boolean; agreeTruth: boolean;
}

function emptyForm(): HelpForm {
  return {
    role: "", cat: "", nama: "", wa: "", penerima: "", kota: "",
    hub: "", hubx: "",
    files: { ktp: [], kondisi: [], ekonomi: [] },
    eko: "",
    judul: "", story: "",
    items: [{ n: "", q: "", c: 0 }],
    agreeStmt: false, agreeTruth: false,
  };
}

function totalItems(items: NeedItem[]) { return items.reduce((a, x) => a + (x.c || 0), 0); }

// ===== MY CAMPAIGN VIEW =====
interface MyDonationViewProps {
  mine: Campaign;
  onStop: () => void;
  onToast: (msg: string) => void;
}

function MyDonationView({ mine, onStop, onToast }: MyDonationViewProps) {
  const raised = col(mine);
  const p2 = pct(raised, mine.target);
  const [st, stClass] = STATUS_LABELS[mine.status] ?? ["Tidak diketahui", "gray"];
  return (
    <div className="db-card">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <small style={{ color: "var(--g)", fontWeight: 600, fontSize: 12 }}>OPEN DONASI SAYA</small>
          <h2 style={{ marginTop: 4 }}>{mine.judul}</h2>
          <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <i className={`db-badge ${stClass}`}>{st}</i>
            <span style={{ color: "var(--s)", fontSize: 13 }}>{CATL[mine.cat]} · {mine.kota}</span>
          </div>
        </div>
      </div>
      <ul className="db-nh-track">
        {["Terkirim", "Dalam review", "Disetujui", "Donasi berjalan"].map((l, i) => {
          const si = mine.status === "disetujui" || mine.status === "penuh" || mine.status === "selesai" ? 3 : mine.status === "review" ? 1 : 2;
          return (
            <li key={i} className={i < si ? "done" : i === si ? "on" : ""}>
              <b>{i < si ? <SvgIcon name="check_ok" className="" style={{ width: 13, height: 13 }} /> : i + 1}</b>
              {l}
            </li>
          );
        })}
      </ul>
      <div className="db-nh-bar2"><i style={{ width: p2 + "%" }} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, margin: "10px 0 16px" }}>
        <div><b style={{ fontSize: 22, fontWeight: 600 }}>{rpx(raised)}</b> <span style={{ color: "var(--s)", fontSize: 14 }}>terkumpul dari {rpx(mine.target)}</span></div>
        <div style={{ display: "flex", gap: 14, color: "var(--s)", fontSize: 13, alignItems: "center" }}>
          <span>{mine.donors.length} donatur</span>
          <span>{leftDays(mine)} hari lagi</span>
        </div>
      </div>
      <details style={{ marginBottom: 16 }}>
        <summary style={{ cursor: "pointer", color: "var(--g)", fontWeight: 500, fontSize: 14 }}>Lihat rincian kebutuhan</summary>
        <table className="db-nh-tbl" style={{ marginTop: 12 }}>
          <thead><tr><th>Kebutuhan</th><th>Jumlah</th><th>Estimasi</th></tr></thead>
          <tbody>{mine.items.map((it, i) => <tr key={i}><td>{it.n}</td><td>{it.q}</td><td>{rpx(it.c)}</td></tr>)}</tbody>
          <tfoot><tr><td>Total</td><td /><td>{rpx(mine.target)}</td></tr></tfoot>
        </table>
      </details>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="db-btn danger" onClick={() => { onStop(); onToast("Open donasi dihentikan di prototipe."); }}>Hentikan open donasi</button>
      </div>
      <span className="db-nh-proto">Prototipe: status dan donasi tidak diproses sungguhan.</span>
    </div>
  );
}

// ===== MAIN COMPONENT =====
interface NutriHelpProps {
  onToast: (msg: string) => void;
  myCampaign: Campaign | null;
  onSubmitCampaign: (c: Campaign) => void;
  onStopCampaign: () => void;
}

export default function NutriHelp({ onToast, myCampaign, onSubmitCampaign, onStopCampaign }: NutriHelpProps) {
  const [tab, setTab] = React.useState<"mine" | "form">(myCampaign ? "mine" : "form");
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<HelpForm>(emptyForm());
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => { if (myCampaign) setTab("mine"); }, [myCampaign]);

  function setF<K extends keyof HelpForm>(k: K, v: HelpForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }
  function setFile(k: keyof HelpForm["files"], files: File[]) {
    setForm(f => ({ ...f, files: { ...f.files, [k]: files } }));
  }

  function validate(i: number): string[] {
    const f = form;
    const bad: string[] = [];
    const dg = (f.wa || "").replace(/\D/g, "");
    if (i === 0) {
      if (!f.role) bad.push("role");
      if (!f.cat) bad.push("cat");
      if ((f.nama || "").trim().length < 3) bad.push("nama");
      if (dg.length < 9 || dg.length > 15) bad.push("wa");
      if ((f.penerima || "").trim().length < 2) bad.push("penerima");
      if (!(f.kota || "").trim()) bad.push("kota");
      if (f.role === "lain") {
        if (!f.hub) bad.push("hub");
        if ((f.hubx || "").trim().length < 10) bad.push("hubx");
      }
      if (!f.files.ktp.length) bad.push("ktp");
    }
    if (i === 1) {
      if (!f.cat) bad.push("kondisi_cat");
      else if (!f.files.kondisi.length) bad.push("kondisi");
    }
    if (i === 2) {
      if (!f.eko) bad.push("eko");
      else if (!f.files.ekonomi.length) bad.push("ekonomi");
    }
    if (i === 3) {
      if ((f.judul || "").trim().length < 10) bad.push("judul");
      if ((f.story || "").trim().length < 50) bad.push("story");
      const validItems = f.items.filter(it => it.n.trim() && it.c > 0);
      if (!validItems.length) bad.push("items");
    }
    if (i === 4) {
      if (!f.agreeStmt) bad.push("agreeStmt");
      if (!f.agreeTruth) bad.push("agreeTruth");
    }
    return bad;
  }

  function next() {
    const errs = validate(step);
    setErrors(errs);
    if (errs.length) {
      setTimeout(() => document.querySelector(".db-err")?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
      return;
    }
    if (step < STEPS.length - 1) { setStep(s => s + 1); setErrors([]); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else { submit(); }
  }

  function submit() {
    const items = form.items.filter(it => it.n.trim() && it.c > 0);
    const camp: Campaign = {
      id: "mine_" + Date.now(),
      owner: "me",
      cat: form.cat as Cat,
      nama: form.nama,
      kota: form.kota,
      judul: form.judul,
      story: form.story,
      items,
      target: totalItems(items),
      donors: [],
      deadline: Date.now() + 30 * 864e5,
      status: "review",
      by: "Pemohon",
    };
    onSubmitCampaign(camp);
    setSubmitted(true);
    onToast("Pengajuan open donasi berhasil dikirim");
  }

  if (submitted || (myCampaign && tab === "mine")) {
    return (
      <div>
        <PageIntro page="help" />
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button className="db-btn o sm" onClick={() => setTab("mine")}>Open Donasi Saya</button>
        </div>
        {myCampaign ? (
          <MyDonationView mine={myCampaign} onStop={onStopCampaign} onToast={onToast} />
        ) : (
          <div className="db-card">
            <div className="db-nh-done">
              <div className="big">
                <SvgIcon name="check_ok" className="" style={{ width: 34, height: 34, stroke: "currentColor", fill: "none", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Pengajuan terkirim!</h2>
              <p style={{ color: "var(--s)", lineHeight: 1.6, fontSize: 14 }}>Admin sedang meninjau pengajuan Anda. Anda akan dihubungi melalui WhatsApp jika ada perkembangan.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const total = totalItems(form.items);

  return (
    <div>
      <PageIntro page="help" />
      {myCampaign && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button className={`db-btn${tab === "form" ? "" : " o"} sm`} onClick={() => setTab("form")}>Ajukan Open Donasi</button>
          <button className={`db-btn${tab === "mine" ? "" : " o"} sm`} onClick={() => setTab("mine")}>Open Donasi Saya</button>
        </div>
      )}

      {/* STEP BAR */}
      <div className="db-steps">
        {STEPS.map(([l], i) => (
          <span key={i} className={`db-st${i < step ? " done" : ""}${i === step ? " on" : ""}`}>
            <b>{i < step ? "✓" : i + 1}</b>{l}
          </span>
        ))}
      </div>
      <div className="db-bar"><i style={{ width: `${(step + 1) / STEPS.length * 100}%` }} /></div>

      <div className="db-card">
        <small style={{ color: "var(--g)", fontWeight: 600 }}>LANGKAH {step + 1} DARI {STEPS.length}</small>
        <h2 style={{ marginTop: 4, marginBottom: 4 }}>{STEPS[step][0]}</h2>
        <p style={{ color: "var(--s)", marginBottom: 20, lineHeight: 1.6 }}>{STEPS[step][1]}</p>

        {/* STEP 0: Identity */}
        {step === 0 && (
          <div>
            <div className="db-grid">
              <div className={errors.includes("role") ? "db-w db-err" : "db-w"}>
                <div className="db-l">Anda mengajukan sebagai</div>
                <div className="db-chips">
                  {["Diri sendiri", "Wali/pendamping", "Lainnya"].map(r => (
                    <label key={r} className="db-chip">
                      <input type="radio" name="role" value={r === "Lainnya" ? "lain" : r === "Wali/pendamping" ? "wali" : "self"}
                        checked={form.role === (r === "Lainnya" ? "lain" : r === "Wali/pendamping" ? "wali" : "self")}
                        onChange={() => setF("role", r === "Lainnya" ? "lain" : r === "Wali/pendamping" ? "wali" : "self")} />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
                {errors.includes("role") && <div className="db-em">Pilih peran Anda</div>}
              </div>
              <div className={errors.includes("cat") ? "db-w db-err" : "db-w"}>
                <div className="db-l">Kategori penerima bantuan</div>
                <div className="db-chips">
                  {(["hamil", "menyusui", "anak"] as Cat[]).map(c => (
                    <label key={c} className="db-chip">
                      <input type="radio" name="cat" value={c} checked={form.cat === c} onChange={() => setF("cat", c)} />
                      <span>{CATL[c]}</span>
                    </label>
                  ))}
                </div>
                {errors.includes("cat") && <div className="db-em">Pilih kategori</div>}
              </div>
              <div className={errors.includes("nama") ? "db-err" : ""}>
                <label className="db-l" htmlFor="h_nama">Nama lengkap pemohon (sesuai KTP)</label>
                <div className="db-inp"><input id="h_nama" value={form.nama} maxLength={80} onChange={e => setF("nama", e.target.value)} /></div>
                {errors.includes("nama") && <div className="db-em">Isi nama lengkap sesuai KTP</div>}
              </div>
              <div className={errors.includes("wa") ? "db-err" : ""}>
                <label className="db-l" htmlFor="h_wa">Nomor WhatsApp pemohon</label>
                <div className="db-inp"><input id="h_wa" type="tel" value={form.wa} placeholder="+62 812-3456-7890" onChange={e => setF("wa", e.target.value)} /></div>
                {errors.includes("wa") && <div className="db-em">Periksa kembali nomor WhatsApp (9–15 digit)</div>}
              </div>
              <div className={errors.includes("penerima") ? "db-err" : ""}>
                <label className="db-l" htmlFor="h_pnerima">Nama penerima bantuan</label>
                <div className="db-inp"><input id="h_pnerima" value={form.penerima} maxLength={80} onChange={e => setF("penerima", e.target.value)} /></div>
                {errors.includes("penerima") && <div className="db-em">Isi nama penerima bantuan</div>}
              </div>
              <div className={errors.includes("kota") ? "db-err" : ""}>
                <label className="db-l" htmlFor="h_kota">Kabupaten/Kota domisili</label>
                <div className="db-inp">
                  <select id="h_kota" value={form.kota} onChange={e => setF("kota", e.target.value)}>
                    <option value="">Pilih provinsi...</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {errors.includes("kota") && <div className="db-em">Pilih domisili</div>}
              </div>
              {form.role === "lain" && (
                <>
                  <div className={errors.includes("hub") ? "db-w db-err" : "db-w"}>
                    <div className="db-l">Hubungan dengan penerima bantuan</div>
                    <div className="db-chips">
                      {["Suami/istri", "Orang tua", "Saudara kandung", "Kader posyandu", "Lainnya"].map(h => (
                        <label key={h} className="db-chip">
                          <input type="radio" name="hub" value={h} checked={form.hub === h} onChange={() => setF("hub", h)} />
                          <span>{h}</span>
                        </label>
                      ))}
                    </div>
                    {errors.includes("hub") && <div className="db-em">Pilih hubungan Anda</div>}
                  </div>
                  <div className={errors.includes("hubx") ? "db-w db-err" : "db-w"}>
                    <label className="db-l" htmlFor="h_hubx">Jelaskan hubungan Anda</label>
                    <textarea id="h_hubx" value={form.hubx} placeholder="Jelaskan hubungan Anda dengan penerima bantuan (minimal 10 karakter)"
                      onChange={e => setF("hubx", e.target.value)} />
                    {errors.includes("hubx") && <div className="db-em">Jelaskan hubungan Anda minimal 10 karakter</div>}
                  </div>
                </>
              )}
              <div className={errors.includes("ktp") ? "db-w db-err" : "db-w"}>
                <div className="db-l">Foto KTP pemohon atau wali</div>
                <UploadArea label="Unggah foto KTP" files={form.files.ktp} onChange={f => setFile("ktp", f)} max={1} />
                {errors.includes("ktp") && <div className="db-em">Unggah foto KTP pemohon atau wali</div>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Kondisi */}
        {step === 1 && (
          <div>
            {!form.cat ? (
              <div className="db-nh-warnbox">Anda belum memilih kategori penerima di langkah sebelumnya. Kembali dan pilih kategori terlebih dahulu.</div>
            ) : (
              <>
                <div className="db-nh-okbox">Kategori: <b>{CATL[form.cat]}</b>. Unggah dokumen bukti kondisi di bawah.</div>
                <div className={errors.includes("kondisi") ? "db-err" : ""}>
                  <div className="db-l">Dokumen bukti kondisi (buku KIA, hasil USG, kartu posyandu, dsb.)</div>
                  <UploadArea label="Unggah dokumen kondisi" files={form.files.kondisi} onChange={f => setFile("kondisi", f)} />
                  {errors.includes("kondisi") && <div className="db-em">Unggah minimal satu dokumen</div>}
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Ekonomi */}
        {step === 2 && (
          <div>
            <div className={errors.includes("eko") ? "db-w db-err" : "db-w"} style={{ marginBottom: 18 }}>
              <div className="db-l">Jenis bukti ekonomi</div>
              <div className="db-chips">
                {["Kartu Keluarga Sejahtera (KKS)", "SKTM dari kelurahan", "Kartu Indonesia Pintar (KIP)", "Bukti penghasilan rendah"].map(o => (
                  <label key={o} className="db-chip">
                    <input type="radio" name="eko" value={o} checked={form.eko === o} onChange={() => setF("eko", o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              {errors.includes("eko") && <div className="db-em">Pilih jenis bukti</div>}
            </div>
            <div className={errors.includes("ekonomi") ? "db-err" : ""}>
              <div className="db-l">Unggah dokumen bukti ekonomi</div>
              <UploadArea label="Unggah dokumen ekonomi" files={form.files.ekonomi} onChange={f => setFile("ekonomi", f)} />
              {errors.includes("ekonomi") && <div className="db-em">Unggah dokumen bukti ekonomi</div>}
            </div>
          </div>
        )}

        {/* STEP 3: Kebutuhan */}
        {step === 3 && (
          <div>
            <div className={errors.includes("judul") ? "db-err" : ""} style={{ marginBottom: 16 }}>
              <label className="db-l" htmlFor="h_judul">Judul open donasi</label>
              <div className="db-inp"><input id="h_judul" value={form.judul} maxLength={100} placeholder="Contoh: Bantu Bu Sari penuhi gizi di trimester ketiga" onChange={e => setF("judul", e.target.value)} /></div>
              {errors.includes("judul") && <div className="db-em">Judul minimal 10 karakter</div>}
            </div>
            <div className={errors.includes("story") ? "db-err" : ""} style={{ marginBottom: 16 }}>
              <label className="db-l" htmlFor="h_story">Ceritakan kondisi Anda</label>
              <textarea id="h_story" value={form.story} placeholder="Ceritakan situasi dan kondisi kebutuhan gizi Anda (minimal 50 karakter)"
                style={{ minHeight: 120 }} onChange={e => setF("story", e.target.value)} />
              {errors.includes("story") && <div className="db-em">Cerita minimal 50 karakter</div>}
            </div>
            <div className="db-nh-h3">Rincian kebutuhan bahan pangan</div>
            <div className="db-nh-ih">
              <span>Nama bahan/kebutuhan</span><span>Jumlah/satuan</span><span>Estimasi biaya</span><span />
            </div>
            {form.items.map((item, i) => (
              <ItemRow key={i} item={item} index={i}
                onChange={(idx, field, val) => {
                  const next = form.items.map((x, j) => j === idx ? { ...x, [field]: val } : x);
                  setF("items", next);
                }}
                onDelete={idx => setF("items", form.items.filter((_, j) => j !== idx))} />
            ))}
            <div className="db-nh-rowact">
              <button className="db-btn o sm" onClick={() => setF("items", [...form.items, { n: "", q: "", c: 0 }])}>
                <SvgIcon name="plus" className="db-ic" /> Tambah baris
              </button>
            </div>
            {errors.includes("items") && <div className="db-em" style={{ marginBottom: 8 }}>Isi minimal satu bahan dengan biaya yang valid</div>}
            {total > 0 && (
              <div className="db-nh-total">
                <span>Total estimasi</span>
                <b>{rpx(total)}</b>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Pernyataan */}
        {step === 4 && (
          <div>
            <div className="db-nh-pernyataan">
              <b>Pernyataan pemohon</b>
              <ol>
                <li>Data dan dokumen yang saya berikan adalah benar dan dapat dipertanggungjawabkan.</li>
                <li>Saya bersedia dihubungi oleh tim NutrimateAI untuk verifikasi lebih lanjut.</li>
                <li>Dana donasi yang diterima akan digunakan sesuai dengan rincian kebutuhan yang diajukan.</li>
                <li>Saya memahami bahwa pengajuan ini bersifat terbuka kepada publik untuk mendapatkan donasi.</li>
              </ol>
            </div>
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <label className="db-nh-chk">
                <input type="checkbox" checked={form.agreeStmt}
                  onChange={e => setF("agreeStmt", e.target.checked)} />
                <span>Saya menyetujui pernyataan di atas dan memahami konsekuensinya.</span>
              </label>
              <label className="db-nh-chk">
                <input type="checkbox" checked={form.agreeTruth}
                  onChange={e => setF("agreeTruth", e.target.checked)} />
                <span>Saya menyatakan bahwa seluruh informasi yang diberikan adalah benar dan tidak ada yang disembunyikan.</span>
              </label>
            </div>
            {(errors.includes("agreeStmt") || errors.includes("agreeTruth")) && (
              <div className="db-em" style={{ marginTop: 8 }}>Centang kedua pernyataan untuk melanjutkan</div>
            )}
            {total > 0 && (
              <div className="db-nh-total" style={{ marginTop: 20 }}>
                <span>Total yang diajukan</span>
                <b>{rpx(total)}</b>
              </div>
            )}
            <div className="db-nh-proto" style={{ marginTop: 12 }}>
              Prototipe: pengajuan disimpan lokal dan tidak dikirim ke server nyata. Status akan langsung menjadi &ldquo;Menunggu review admin&rdquo;.
            </div>
          </div>
        )}

        <div className="db-foot">
          <button className="db-btn o" disabled={step === 0} onClick={() => { setStep(s => s - 1); setErrors([]); }}>Kembali</button>
          <button className="db-btn" onClick={next}>{step === STEPS.length - 1 ? "Kirim Pengajuan" : "Lanjut"}</button>
        </div>
      </div>
    </div>
  );
}
