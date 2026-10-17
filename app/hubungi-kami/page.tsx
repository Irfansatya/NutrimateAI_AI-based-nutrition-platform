"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HubungiKamiPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    isError?: boolean;
  }>({ show: false, title: "", message: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (title: string, msg: string, isError = false) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, title, message: msg, isError });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast("Ukuran lampiran melebihi batas", "Ukuran file maksimal 10 MB. Silakan pilih file dengan ukuran lebih kecil.", true);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFileName("");
        return;
      }
      setFileName("File dipilih: " + file.name);
    } else {
      setFileName("");
    }
  };

  const handleReset = () => {
    setFullName("");
    setEmail("");
    setTopic("");
    setMessage("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !topic || !message.trim()) {
      showToast("Formulir belum lengkap", "Mohon lengkapi seluruh kolom yang bertanda bintang (*) sebelum mengirim pesan.", true);
      return;
    }

    showToast(
      "Pesan berhasil dikirim",
      "Terima kasih telah menghubungi NutrimateAI. Tim kami akan menanggapi melalui email yang Anda cantumkan."
    );
    handleReset();
  };

  return (
    <div className="hubungi-kami-page min-h-screen p-4 sm:p-8 bg-[#E6F2EE] flex items-center justify-center">
      <main className="page-card w-full max-w-[1200px] bg-white rounded-[18px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.07)]">
        {/* Navbar */}
        <nav className="navbar h-[72px] px-6 sm:px-8 flex items-center justify-between border-b border-[#f0f1f0]">
          <Link href="/" className="brand inline-flex items-center gap-2" aria-label="NutrimateAI">
            <Image
              src="/logo-NutrimateAI-fix.svg"
              alt="NutrimateAI"
              width={148}
              height={32}
              className="w-[140px] sm:w-[148px] h-auto object-contain"
              priority
            />
          </Link>

          <Link
            href="/"
            className="back-top bg-[#003223] text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#00251a] hover:-translate-y-0.5 transition-all inline-flex items-center gap-1.5"
          >
            ← Kembali
          </Link>
        </nav>

        {/* Contact Section */}
        <section className="contact-section p-6 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          {/* Left info */}
          <div className="intro">
            <div className="eyebrow inline-flex items-center gap-2 text-[#05976A] text-xs font-bold tracking-wider mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05976A]"></span>
              HUBUNGI KAMI
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[50px] font-medium leading-[1.05] tracking-tight text-[#151817] mb-5 max-w-[440px]">
              Bagaimana kami bisa membantu?
            </h1>

            <p className="intro-description text-[#707773] text-sm sm:text-[15px] leading-relaxed mb-8 sm:mb-12 max-w-[430px]">
              Punya pertanyaan, saran, atau kendala saat menggunakan NutrimateAI? Sampaikan pesan
              Anda melalui formulir di samping dan tim kami akan membantu Anda.
            </p>

            <div className="contact-details grid gap-4">
              <div className="contact-item flex items-center gap-3.5 text-[#343936] text-[13px]">
                <span className="contact-icon w-9 h-9 border border-[#e5e7e6] rounded-[10px] flex items-center justify-center text-[#05976A] bg-white shrink-0">
                  ✉
                </span>
                <span>support@nutrimateai.com</span>
              </div>

              <div className="contact-item flex items-center gap-3.5 text-[#343936] text-[13px]">
                <span className="contact-icon w-9 h-9 border border-[#e5e7e6] rounded-[10px] flex items-center justify-center text-[#05976A] bg-white shrink-0">
                  ◉
                </span>
                <span>Jl. Nutrisi Sehat No. 10, Semarang, Jawa Tengah</span>
              </div>

              <div className="contact-item flex items-center gap-3.5 text-[#343936] text-[13px]">
                <span className="contact-icon w-9 h-9 border border-[#e5e7e6] rounded-[10px] flex items-center justify-center text-[#05976A] bg-white shrink-0">
                  ☎
                </span>
                <span>+62 812-3456-7890</span>
              </div>
            </div>
          </div>

          {/* Right form card */}
          <div className="form-card bg-[#F2F8F6] rounded-[18px] p-6 sm:p-8 w-full max-w-[560px] justify-self-end">
            <div className="form-heading mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#151817] mb-1">Kirim Pesan</h2>
              <p className="text-[#707773] text-xs leading-relaxed">
                Isi formulir berikut dengan informasi yang sesuai.
              </p>
            </div>

            <form onSubmit={handleSubmit} onReset={handleReset}>
              <div className="form-grid grid gap-4">
                <div className="field grid gap-1.5">
                  <label htmlFor="fullName" className="text-xs font-semibold text-[#454b47]">
                    Nama Lengkap <span className="text-[#05976A]">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    autoComplete="name"
                    required
                    className="w-full h-10 px-3.5 rounded-[9px] bg-white text-[#151817] text-xs sm:text-[13px] border border-transparent focus:border-[#05976A]/40 focus:ring-2 focus:ring-[#05976A]/10 outline-none transition-all placeholder:text-[#a0a5a2]"
                  />
                </div>

                <div className="field grid gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-[#454b47]">
                    Email <span className="text-[#05976A]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email Anda"
                    autoComplete="email"
                    required
                    className="w-full h-10 px-3.5 rounded-[9px] bg-white text-[#151817] text-xs sm:text-[13px] border border-transparent focus:border-[#05976A]/40 focus:ring-2 focus:ring-[#05976A]/10 outline-none transition-all placeholder:text-[#a0a5a2]"
                  />
                </div>

                <div className="field grid gap-1.5">
                  <label htmlFor="topic" className="text-xs font-semibold text-[#454b47]">
                    Topik <span className="text-[#05976A]">*</span>
                  </label>
                  <div className="select-wrap relative">
                    <select
                      id="topic"
                      name="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                      className="w-full h-10 px-3.5 pr-10 rounded-[9px] bg-white text-[#151817] text-xs sm:text-[13px] border border-[#e8ebe9] focus:border-[#05976A]/40 focus:ring-2 focus:ring-[#05976A]/10 outline-none appearance-none cursor-pointer transition-all"
                    >
                      <option value="" disabled>
                        Pilih topik pesan
                      </option>
                      <option value="Pertanyaan">Pertanyaan</option>
                      <option value="Saran">Saran</option>
                      <option value="Keluhan">Keluhan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[#68706c]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="field grid gap-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-[#454b47]">
                    Pesan <span className="text-[#05976A]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pesan Anda di sini..."
                    required
                    rows={4}
                    className="w-full p-3 rounded-[9px] bg-white text-[#151817] text-xs sm:text-[13px] border border-transparent focus:border-[#05976A]/40 focus:ring-2 focus:ring-[#05976A]/10 outline-none transition-all placeholder:text-[#a0a5a2] resize-y min-h-[110px]"
                  ></textarea>
                </div>

                <div className="field grid gap-1.5">
                  <label htmlFor="attachment" className="text-xs font-semibold text-[#454b47]">
                    Lampiran <span className="text-[#9a9f9c] font-normal">(opsional)</span>
                  </label>

                  <label
                    htmlFor="attachment"
                    className="file-box relative min-h-[58px] p-2.5 sm:p-3 border border-dashed border-[#cfd4d1] bg-white rounded-[9px] flex items-center gap-3 cursor-pointer hover:border-[#05976A] hover:bg-[#fbfffd] transition-all"
                  >
                    <span className="file-icon w-8 h-8 rounded-lg bg-[#eaf7f2] text-[#05976A] flex items-center justify-center shrink-0 text-sm">
                      ↥
                    </span>
                    <div className="file-copy flex flex-col">
                      <strong className="text-xs font-semibold text-[#151817]">
                        Pilih file atau gambar
                      </strong>
                      <span className="text-[11px] text-[#929894]">Opsional · Maks. 10 MB</span>
                    </div>

                    <input
                      type="file"
                      id="attachment"
                      name="attachment"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>

                  {fileName && (
                    <span className="file-name text-[11px] text-[#05976A] font-medium break-all mt-1">
                      {fileName}
                    </span>
                  )}
                </div>

                <div className="form-actions flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-2">
                  <button
                    type="reset"
                    className="back-button h-10 px-4 rounded-[9px] border border-[#d9ddda] bg-white text-[#454a47] text-xs font-semibold hover:border-[#bfc6c2] hover:bg-neutral-50 transition-all flex items-center justify-center"
                  >
                    Hapus Isian
                  </button>

                  <button
                    type="submit"
                    className="submit-button h-10 px-5 rounded-[9px] bg-[#05976A] text-white text-xs font-semibold hover:bg-[#047b57] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                  >
                    Kirim Pesan <span>→</span>
                  </button>
                </div>
              </div>

              <p className="privacy-note text-right text-[10.5px] text-[#999f9b] mt-3">
                * Kolom wajib diisi. Lampiran bersifat opsional.
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* Modern Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 bottom-7 z-50 -translate-x-1/2 w-[min(420px,calc(100vw-32px))] p-3.5 px-4 flex items-center gap-3 bg-white/95 backdrop-blur-sm border rounded-2xl shadow-[0_14px_38px_rgba(21,24,23,0.16)] transition-all duration-300 pointer-events-none ${
          toast.show
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 translate-y-6 invisible"
        } ${
          toast.isError
            ? "border-rose-200 text-rose-900"
            : "border-[#05976A]/20 text-[#151817]"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            toast.isError
              ? "bg-rose-100 text-rose-600"
              : "bg-[#e8f7f1] text-[#05976A]"
          }`}
          aria-hidden="true"
        >
          {toast.isError ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="toast-copy grid gap-0.5">
          <strong className="text-xs font-bold leading-tight">{toast.title}</strong>
          <span className="text-[11px] text-[#707773] leading-snug">{toast.message}</span>
        </div>
      </div>
    </div>
  );
}