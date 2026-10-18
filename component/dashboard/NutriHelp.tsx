"use client";
import React from "react";
import { SvgIcon } from "./SvgIcon";
import { PageIntro } from "./SharedComponents";
import NutriWallet from "./NutriWallet";
import MyDonation from "./MyDonation";
import UploadArea from "./UploadArea";
import { CustomSelect } from "./FormControls";
import { CATL, type Cat } from "@/lib/dashboard/mockData";
import { DAFTAR_PROVINSI, daftarKabKota, formatDomisili } from "@/lib/dashboard/wilayah";
import {
  DURATIONS,
  cloneForm,
  emptyForm,
  isFormLocked,
  type HelpForm,
  type MyCampaign,
  type NeedItem,
  type Withdrawal,
} from "@/lib/dashboard/campaign";

const rpx = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

// ===== ITEM ROW =====
function ItemRow({ item, index, onChange, onDelete }: {
  item: NeedItem;
  index: number;
  onChange: (i: number, f: keyof NeedItem, v: string | number) => void;
  onDelete: (i: number) => void;
}) {
  return (
    <div className="db-nh-item">
      <div className="db-inp"><input value={item.n} placeholder="Nama bahan/kebutuhan" onChange={e => onChange(index, "n", e.target.value)} /></div>
      <div className="db-inp"><input value={item.q} placeholder="Jumlah/satuan" onChange={e => onChange(index, "q", e.target.value)} /></div>
      <div className="db-inp"><span>Rp</span><input type="number" min="0" step="500" value={item.c || ""} placeholder="0" onChange={e => onChange(index, "c", Number(e.target.value))} /></div>
      <button type="button" className="db-nh-del" onClick={() => onDelete(index)} aria-label="Hapus baris">
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
  ["Kebutuhan", "Rincian kebutuhan pangan dan masa open donasi"],
  ["Pernyataan", "Konfirmasi dan kirim"],
];

const SUBMIT_DELAY_MS = 3000;

function totalItems(items: NeedItem[]) { return items.reduce((a, x) => a + (x.c || 0), 0); }

function initialForm(c: MyCampaign | null): HelpForm {
  return c && (c.status === "revisi" || c.status === "ditolak") ? cloneForm(c.form) : emptyForm();
}

// ===== MAIN COMPONENT =====
type Tab = "form" | "mine" | "wallet";

interface NutriHelpProps {
  onToast: (msg: string) => void;
  myCampaign: MyCampaign | null;
  onSubmitCampaign: (c: MyCampaign) => void;
  onPublishCampaign: () => void;
  onCancelCampaign: () => void;
  onFinishCampaign: () => void;
  onResetCampaign: () => void;
  withdrawals: Withdrawal[];
  onWithdraw: (w: Withdrawal) => void;
}

export default function NutriHelp({
  onToast,
  myCampaign,
  onSubmitCampaign,
  onPublishCampaign,
  onCancelCampaign,
  onFinishCampaign,
  onResetCampaign,
  withdrawals,
  onWithdraw,
}: NutriHelpProps) {
  const [tab, setTab] = React.useState<Tab>(myCampaign ? "mine" : "form");
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<HelpForm>(() => initialForm(myCampaign));
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Saat status open donasi berubah (mis. admin menyetujui, meminta revisi, atau menolak),
  // arahkan pengguna ke tab "Open Donasi Saya". Untuk revisi/ditolak, isi ulang form dengan data sebelumnya.
  const status = myCampaign?.status;
  const [seenStatus, setSeenStatus] = React.useState(status);
  if (seenStatus !== status) {
    setSeenStatus(status);
    if (myCampaign) {
      setTab("mine");
      if (status === "revisi" || status === "ditolak") {
        setForm(cloneForm(myCampaign.form));
        setStep(0);
        setErrors([]);
      }
    }
  }

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const locked = isFormLocked(myCampaign);
  const needsFix = status === "revisi" || status === "ditolak";

  function setF<K extends keyof HelpForm>(k: K, v: HelpForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }
  function setFile(k: keyof HelpForm["files"], files: File[]) {
    setForm(f => ({ ...f, files: { ...f.files, [k]: files } }));
  }

  // Ganti provinsi: pilihan kabupaten/kota direset bila provinsinya berbeda
  function onProvinsiChange(v: string) {
    setForm(f => ({ ...f, provinsi: v, kabkota: f.provinsi === v ? f.kabkota : "" }));
  }

  const kabKotaOptions = React.useMemo(() => daftarKabKota(form.provinsi), [form.provinsi]);

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
      if (!f.provinsi) bad.push("provinsi");
      if (!f.kabkota || !daftarKabKota(f.provinsi).includes(f.kabkota)) bad.push("kabkota");
      if (f.role === "lain") {
        if (!f.hub) bad.push("hub");
        if ((f.hubx || "").trim().length < 10) bad.push("hubx");
      }
      if (!f.files.ktp.length) bad.push("ktp");
    }
    if (i === 1) {
      if (!f.cat) bad.push("kondisi_cat");
      else {
        if (!f.files.kondisi.length) bad.push("kondisi");
        if ((f.kondisiKet || "").trim().length < 10) bad.push("kondisiKet");
      }
    }
    if (i === 2) {
      if (!f.eko) bad.push("eko");
      if (!f.files.ekonomi.length) bad.push("ekonomi");
    }
    if (i === 3) {
      if ((f.judul || "").trim().length < 10) bad.push("judul");
      if (!f.files.thumb.length) bad.push("thumb");
      if ((f.story || "").trim().length < 50) bad.push("story");
      const validItems = f.items.filter(it => it.n.trim() && it.c > 0);
      if (!validItems.length) bad.push("items");
      if (!(DURATIONS as readonly number[]).includes(f.durasi)) bad.push("durasi");
    }
    if (i === 4) {
      if (!f.agreeStmt) bad.push("agreeStmt");
      if (!f.agreeTruth) bad.push("agreeTruth");
    }
    return bad;
  }

  function next() {
    if (submitting) return;
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
    if (submitting) return;
    const snapshot = cloneForm(form);
    const items = snapshot.items.filter(it => it.n.trim() && it.c > 0);
    const thumbFile = snapshot.files.thumb[0];
    const prevId = myCampaign?.id;
    setSubmitting(true);
    timer.current = setTimeout(() => {
      const camp: MyCampaign = {
        id: prevId ?? "mine_" + Date.now(),
        owner: "me",
        cat: snapshot.cat as Cat,
        nama: snapshot.nama,
        kota: formatDomisili(snapshot.kabkota, snapshot.provinsi),
        judul: snapshot.judul,
        story: snapshot.story,
        items,
        target: totalItems(items),
        donors: [],
        deadline: 0,
        status: "review",
        by: "Pemohon",
        form: snapshot,
        durasi: snapshot.durasi,
        thumbnail: thumbFile ? URL.createObjectURL(thumbFile) : undefined,
        submittedAt: Date.now(),
      };
      onSubmitCampaign(camp);
      setSubmitting(false);
      setForm(emptyForm());
      setStep(0);
      setErrors([]);
      setTab("mine");
      window.scrollTo({ top: 0, behavior: "smooth" });
      onToast("Pengajuan open donasi berhasil dikirim");
    }, SUBMIT_DELAY_MS);
  }

  function handlePublish() {
    onPublishCampaign();
    onToast("Open donasi berhasil dipublikasikan dan kini tampil di NutriAssist");
  }
  function handleCancel() {
    onCancelCampaign();
    onToast("Open donasi telah dibatalkan");
  }
  function handleFinish() {
    onFinishCampaign();
    onToast("Open donasi telah diselesaikan");
  }
  function handleNew() {
    onResetCampaign();
    setForm(emptyForm());
    setStep(0);
    setErrors([]);
    setTab("form");
  }

  const tabs: [Tab, string][] = [
    ["form", "Ajukan Open Donasi"],
    ["mine", "Open Donasi Saya"],
    ["wallet", "NutriWallet"],
  ];

  const tabBar = (
    <div className="db-seg db-nh-tabs" role="tablist" aria-label="Menu NutriHelp">
      {tabs.map(([k, l]) => (
        <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""}
          disabled={submitting} onClick={() => setTab(k)}>
          {l}
        </button>
      ))}
    </div>
  );

  const total = totalItems(form.items);

  // ----- Isi tab -----
  let content: React.ReactNode;

  if (tab === "wallet") {
    content = <NutriWallet myCampaign={myCampaign} withdrawals={withdrawals} onWithdraw={onWithdraw} onToast={onToast} />;
  } else if (tab === "mine") {
    content = (
      <MyDonation
        mine={myCampaign}
        onEdit={() => setTab("form")}
        onPublish={handlePublish}
        onCancel={handleCancel}
        onFinish={handleFinish}
        onNew={handleNew}
        onOpenWallet={() => setTab("wallet")}
      />
    );
  } else if (locked && myCampaign) {
    const lockText =
      myCampaign.status === "review"
        ? "Pengajuan Anda sedang diperiksa oleh admin. Pengajuan baru dapat dibuat setelah pengajuan ini dibatalkan, atau jika admin meminta revisi atau menolaknya."
        : myCampaign.status === "disetujui"
          ? "Pengajuan Anda sudah disetujui dan menunggu dipublikasikan. Publikasikan atau batalkan open donasi ini untuk membuat pengajuan baru."
          : "Open donasi Anda sedang berjalan. Selesaikan open donasi ini terlebih dahulu untuk membuat pengajuan baru.";
    content = (
      <div className="db-card">
        <div className="db-nh-done">
          <div className="big">
            <SvgIcon name="shd" className="" style={{ width: 32, height: 32 }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Form pengajuan belum dapat diisi</h2>
          <p style={{ color: "var(--s)", lineHeight: 1.6, fontSize: 14, maxWidth: 520, margin: "0 auto 16px" }}>{lockText}</p>
          <button type="button" className="db-btn" onClick={() => setTab("mine")}>Lihat Open Donasi Saya</button>
        </div>
      </div>
    );
  } else {
    content = (
      <>
        {needsFix && myCampaign && (
          <div className={myCampaign.status === "ditolak" ? "db-nh-badbox" : "db-nh-warnbox"}>
            <b>{myCampaign.status === "revisi" ? "Admin meminta revisi pengajuan Anda" : "Pengajuan sebelumnya ditolak"}</b>
            <br />
            {myCampaign.adminNote?.trim() || "Periksa kembali data dan dokumen Anda, lalu kirim ulang pengajuan."}
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
                    {([["self", "Diri sendiri"], ["wali", "Wali/pendamping"], ["lain", "Lainnya"]] as [string, string][]).map(([v, l]) => (
                      <label key={v} className="db-chip">
                        <input type="radio" name="role" value={v} checked={form.role === v} onChange={() => setF("role", v)} />
                        <span>{l}</span>
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
                <div className={errors.includes("penerima") ? "db-w db-err" : "db-w"}>
                  <label className="db-l" htmlFor="h_penerima">Nama penerima bantuan</label>
                  <div className="db-inp"><input id="h_penerima" value={form.penerima} maxLength={80} onChange={e => setF("penerima", e.target.value)} /></div>
                  {errors.includes("penerima") && <div className="db-em">Isi nama penerima bantuan</div>}
                </div>
                <div className="db-w">
                  <div className="db-l">Domisili</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px 20px" }}>
                    <div className={errors.includes("provinsi") ? "db-err" : ""}>
                      <label htmlFor="h_provinsi" style={{ display: "block", fontSize: 13, color: "var(--s)", marginBottom: 6 }}>Provinsi</label>
                      <CustomSelect id="h_provinsi" value={form.provinsi} options={DAFTAR_PROVINSI} placeholder="Pilih provinsi" onChange={onProvinsiChange} />
                      {errors.includes("provinsi") && <div className="db-em">Pilih provinsi domisili</div>}
                    </div>
                    <div className={errors.includes("kabkota") ? "db-err" : ""}>
                      <label htmlFor="h_kabkota" style={{ display: "block", fontSize: 13, color: "var(--s)", marginBottom: 6 }}>Kabupaten/Kota</label>
                      <fieldset
                        disabled={!form.provinsi}
                        style={{ border: 0, padding: 0, margin: 0, minWidth: 0, cursor: form.provinsi ? undefined : "not-allowed" }}
                      >
                        <div style={{ opacity: form.provinsi ? 1 : 0.6, pointerEvents: form.provinsi ? undefined : "none" }}>
                          <CustomSelect
                            key={form.provinsi || "kosong"}
                            id="h_kabkota"
                            value={form.kabkota}
                            options={kabKotaOptions}
                            placeholder={form.provinsi ? "Pilih kabupaten/kota" : "Pilih provinsi terlebih dahulu"}
                            onChange={v => setF("kabkota", v)}
                          />
                        </div>
                      </fieldset>
                      {errors.includes("kabkota") && <div className="db-em">{form.provinsi ? "Pilih kabupaten/kota domisili" : "Pilih provinsi terlebih dahulu"}</div>}
                    </div>
                  </div>
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
                  <div className={errors.includes("kondisi") ? "db-err" : ""} style={{ marginBottom: 18 }}>
                    <div className="db-l">Dokumen bukti kondisi (buku KIA, hasil USG, kartu posyandu, dsb.)</div>
                    <UploadArea label="Unggah dokumen kondisi" files={form.files.kondisi} onChange={f => setFile("kondisi", f)} max={5} />
                    {errors.includes("kondisi") && <div className="db-em">Unggah minimal satu dokumen</div>}
                  </div>
                  <div className={errors.includes("kondisiKet") ? "db-err" : ""}>
                    <label className="db-l" htmlFor="h_kondisiket">Keterangan dokumen</label>
                    <textarea id="h_kondisiket" value={form.kondisiKet} style={{ minHeight: 100 }}
                      placeholder="Jelaskan dokumen yang Anda unggah: jenis dokumen dan kondisi yang ditunjukkan (minimal 10 karakter)"
                      onChange={e => setF("kondisiKet", e.target.value)} />
                    {errors.includes("kondisiKet") && <div className="db-em">Isi keterangan dokumen minimal 10 karakter</div>}
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
                <UploadArea label="Unggah dokumen ekonomi" files={form.files.ekonomi} onChange={f => setFile("ekonomi", f)} max={1} />
                {errors.includes("ekonomi") && <div className="db-em">Unggah dokumen bukti ekonomi</div>}
              </div>
            </div>
          )}

          {/* STEP 3: Kebutuhan */}
          {step === 3 && (
            <div>
              <div className={errors.includes("judul") ? "db-err" : ""} style={{ marginBottom: 16 }}>
                <label className="db-l" htmlFor="h_judul">Judul open donasi</label>
                <div className="db-inp"><input id="h_judul" value={form.judul} maxLength={100} placeholder="Judul singkat yang menggambarkan kebutuhan gizi Anda" onChange={e => setF("judul", e.target.value)} /></div>
                {errors.includes("judul") && <div className="db-em">Judul minimal 10 karakter</div>}
              </div>
              <div className={errors.includes("thumb") ? "db-err" : ""} style={{ marginBottom: 16 }}>
                <div className="db-l">Foto utama open donasi (thumbnail)</div>
                <p className="db-nh-note" style={{ marginBottom: 10 }}>
                  Unggah foto ibu atau anak, atau foto yang menunjukkan kondisinya. Foto ini menjadi gambar sampul kartu open donasi di NutriAssist dan dapat dilihat oleh publik.
                </p>
                <UploadArea label="Unggah foto thumbnail" files={form.files.thumb} onChange={f => setFile("thumb", f)} max={1} imageOnly />
                {errors.includes("thumb") && <div className="db-em">Unggah foto thumbnail open donasi</div>}
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
                    const nextItems = form.items.map((x, j) => j === idx ? { ...x, [field]: val } : x);
                    setF("items", nextItems);
                  }}
                  onDelete={idx => setF("items", form.items.length > 1 ? form.items.filter((_, j) => j !== idx) : [{ n: "", q: "", c: 0 }])} />
              ))}
              <div className="db-nh-rowact">
                <button type="button" className="db-btn o sm" onClick={() => setF("items", [...form.items, { n: "", q: "", c: 0 }])}>
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

              <div className={errors.includes("durasi") ? "db-err" : ""} style={{ marginTop: 22 }}>
                <div className="db-l">Durasi open donasi</div>
                <div className="db-chips">
                  {DURATIONS.map(d => (
                    <label key={d} className="db-chip">
                      <input type="radio" name="durasi" value={d} checked={form.durasi === d} onChange={() => setF("durasi", d)} />
                      <span>{d} hari</span>
                    </label>
                  ))}
                </div>
                <p className="db-nh-note" style={{ marginTop: 8 }}>Masa open donasi dihitung sejak Anda mempublikasikannya di NutriAssist.</p>
                {errors.includes("durasi") && <div className="db-em">Pilih durasi open donasi</div>}
              </div>
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
                  <input type="checkbox" checked={form.agreeStmt} onChange={e => setF("agreeStmt", e.target.checked)} />
                  <span>Saya menyetujui pernyataan di atas dan memahami konsekuensinya.</span>
                </label>
                <label className="db-nh-chk">
                  <input type="checkbox" checked={form.agreeTruth} onChange={e => setF("agreeTruth", e.target.checked)} />
                  <span>Saya menyatakan bahwa seluruh informasi yang diberikan adalah benar dan tidak ada yang disembunyikan.</span>
                </label>
              </div>
              {(errors.includes("agreeStmt") || errors.includes("agreeTruth")) && (
                <div className="db-em" style={{ marginTop: 8 }}>Centang kedua pernyataan untuk melanjutkan</div>
              )}
              {total > 0 && (
                <div className="db-nh-total" style={{ marginTop: 20 }}>
                  <span>Total yang diajukan · {form.durasi} hari</span>
                  <b>{rpx(total)}</b>
                </div>
              )}
              <div className="db-nh-info" style={{ marginTop: 12 }}>
                Setelah dikirim, pengajuan Anda akan diperiksa oleh admin. Pantau statusnya di tab Open Donasi Saya.
              </div>
            </div>
          )}

          <div className="db-foot">
            <button type="button" className="db-btn o" disabled={step === 0 || submitting} onClick={() => { setStep(s => s - 1); setErrors([]); }}>Kembali</button>
            <button type="button" className="db-btn" disabled={submitting} onClick={next}>{step === STEPS.length - 1 ? "Kirim Pengajuan" : "Lanjut"}</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <PageIntro page="help" />
      {tabBar}
      {content}

      {submitting && (
        <div className="db-ai-wait" role="status" aria-live="polite">
          <div className="db-ai-wait-card">
            <div className="db-ai-ind"><div className="db-ai-spinner" /></div>
            <h2>Mengirim pengajuan</h2>
            <p>Mohon tunggu, data dan dokumen Anda sedang dikirim untuk diperiksa.</p>
            <div className="db-nh-loadbar" aria-hidden="true"><i /></div>
          </div>
        </div>
      )}
    </div>
  );
}