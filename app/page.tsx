"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/component/Navbar";
import FeatureCarousel from "@/component/FeatureCarousel";
import TestimonialCarousel from "@/component/TestimonialCarousel";
import GuideModal from "@/component/GuideModal";
import AuthModal from "@/component/AuthModal";

// Typewriter hook helper
function useTypewriter(text: string, speed = 35, startDelay = 0) {
  const [displayText, setDisplayText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let i = 0;

    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setIsFinished(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return { displayText, isFinished };
}

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Tooltip state for marquee features
  const [activeTooltip, setActiveTooltip] = useState<{
    title: string;
    desc: string;
    x: number;
    y: number;
    show: boolean;
  }>({ title: "", desc: "", x: 0, y: 0, show: false });

  // Typewriter headlines
  const heroType = useTypewriter(
    "Nutrisi lebih tepat untuk ibu dan si kecil, langkah nyata cegah stunting",
    35,
    300
  );

  const aiType = useTypewriter(
    "Dilengkapi asisten AI yang membantu memberikan rekomendasi nutrisi sesuai kondisi Anda.",
    30,
    500
  );

  const handleOpenAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const featureDescriptions: Record<string, string> = {
    NutriCheck:
      "Membantu mengetahui kondisi ibu dan si kecil melalui riwayat kesehatan, ekonomi, lingkungan, dan kebutuhan lainnya.",
    NutriPlan:
      "Menggunakan AI untuk memberikan rekomendasi makanan dan gizi harian sesuai kondisi ibu dan si kecil.",
    NutriDaily:
      "Mengirimkan pengingat nutrisi dan jadwal penting langsung melalui WhatsApp.",
    NutriHelp:
      "Membantu ibu hamil atau keluarga menyampaikan kebutuhan gizi dan mengajukan bantuan melalui donasi.",
    NutriAssist:
      "Memungkinkan masyarakat memberikan donasi untuk membantu memenuhi kebutuhan gizi ibu dan anak.",
  };

  const handleFeatureHover = (e: React.MouseEvent<HTMLDivElement>, name: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      title: name,
      desc: featureDescriptions[name] || "",
      x: rect.left + rect.width / 2,
      y: rect.top - 12,
      show: true,
    });
  };

  return (
    <div className="landing-page bg-white min-h-screen text-[#121517] selection:bg-[#05976A]/20">
      {/* Navbar */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Content */}
      <main id="home" className="pt-[70px] sm:pt-[78px]">
        {/* ================= HERO SECTION ================= */}
        <section className="hero min-h-[calc(100vh-78px)] bg-white overflow-hidden flex flex-col justify-between">
          <div className="hero-top w-full max-w-[1080px] mx-auto px-4 pt-10 sm:pt-14 text-center">
            {/* Trust badge */}
            <div className="trust inline-flex items-center justify-center gap-2.5 text-sm sm:text-base font-medium text-neutral-800 bg-[#f4f7f5] px-4 py-1.5 rounded-full border border-neutral-200/80 mb-6 sm:mb-8">
              <Image
                src="/logo-kemenkes.png"
                alt="Logo Kementerian Kesehatan RI"
                width={22}
                height={22}
                className="w-5 h-5 object-contain"
                priority
              />
              <span>Diawasi oleh Kementerian Kesehatan RI</span>
            </div>

            {/* Headline Typewriter */}
            <h1 className="hero-title text-3xl sm:text-5xl lg:text-[56px] font-medium leading-[1.12] tracking-tight text-[#121517] max-w-[920px] mx-auto min-h-[90px] sm:min-h-[130px]">
              {heroType.displayText}
              {!heroType.isFinished && (
                <span className="inline-block w-1 h-[0.9em] bg-[#05976A] ml-1.5 rounded-sm animate-pulse align-middle" />
              )}
            </h1>

            {/* CTA Buttons */}
            <div className="hero-cta flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-11 mb-10 sm:mb-14">
              <button
                onClick={() => handleOpenAuth("signup")}
                className="btn btn-primary h-12 px-6 rounded-full inline-flex items-center justify-center gap-2.5 bg-[#05976A] text-white font-semibold hover:bg-[#047b57] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[0_8px_22px_rgba(5,151,106,0.18)]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5h5a1.8 1.8 0 0 1 1.8 1.8v10.4A1.8 1.8 0 0 1 18 19h-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h10m-3.5-3.5L14 12l-3.5 3.5" />
                </svg>
                Daftar dan Coba
              </button>

              <button
                onClick={() => setGuideModalOpen(true)}
                className="btn btn-secondary h-12 px-6 rounded-full inline-flex items-center justify-center gap-2 bg-[#E6F2EE] text-[#0b4436] font-semibold hover:bg-[#d8ece4] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Panduan Penggunaan
              </button>
            </div>
          </div>

          {/* Feature Carousel */}
          <FeatureCarousel />
        </section>

        {/* ================= FEATURE HIGHLIGHTS STRIP ================= */}
        <section className="feature-highlights bg-white py-8 border-y border-neutral-100 overflow-hidden relative">
          <p className="eyebrow text-center text-xs sm:text-sm font-bold tracking-[2.4px] text-[#7b8180] uppercase mb-6">
            BERBAGAI FITUR UNGGULAN NUTRIMATEAI
          </p>

          <div className="highlight-window overflow-hidden w-full">
            <div className="highlight-track flex w-max items-center animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, groupIdx) => (
                <div key={groupIdx} className="flex items-center gap-12 sm:gap-16 pr-12 sm:pr-16">
                  {Object.keys(featureDescriptions).map((name) => (
                    <div
                      key={name}
                      onMouseEnter={(e) => handleFeatureHover(e, name)}
                      onMouseLeave={() => setActiveTooltip((prev) => ({ ...prev, show: false }))}
                      className="highlight-item flex items-center gap-3 cursor-pointer text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      <span className="w-10 h-10 rounded-xl bg-[#f0f3f2] flex items-center justify-center text-[#05976A] border border-neutral-200/80 shrink-0 font-bold text-xs">
                        {name.slice(0, 2)}
                      </span>
                      <span className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Floating Tooltip */}
          {activeTooltip.show && (
            <div
              className="fixed z-50 -translate-x-1/2 -translate-y-full w-[280px] p-4 bg-white rounded-2xl shadow-xl border border-neutral-100 pointer-events-none transition-all duration-200"
              style={{ left: activeTooltip.x, top: activeTooltip.y }}
            >
              <h4 className="text-sm font-bold text-neutral-900 mb-1">{activeTooltip.title}</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{activeTooltip.desc}</p>
            </div>
          )}
        </section>

        {/* ================= ASISTEN AI SECTION ================= */}
        <section id="asisten-ai" className="ai-section py-20 sm:py-28 bg-white">
          <div className="container w-[calc(100%-32px)] max-w-[1140px] mx-auto">
            <h2 className="section-title text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1.18] tracking-tight max-w-[820px] mb-10 sm:mb-14">
              {aiType.displayText}
            </h2>

            {/* Video Player Box */}
            <div className="video-wrap relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-[#d2d5d4] bg-[#f4f5f4] shadow-md group">
              <video
                ref={videoRef}
                playsInline
                loop
                muted
                preload="metadata"
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src="/videos/video_AsistenAI.mp4" type="video/mp4" />
                Browser Anda tidak mendukung tag video.
              </video>

              {/* Center Play / Pause button overlay */}
              <div
                onClick={toggleVideo}
                className="absolute inset-0 flex items-center justify-center bg-black/15 cursor-pointer"
              >
                <button
                  type="button"
                  aria-label={isPlaying ? "Jeda video" : "Putar video"}
                  className={`w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                    isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                  }`}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRAKTISI SECTION ================= */}
        <section id="praktisi" className="practitioner-section py-20 sm:py-28 bg-[#E6F2EE]">
          <div className="container w-[calc(100%-32px)] max-w-[1140px] mx-auto">
            <div className="practitioner-grid grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Copy */}
              <div className="practitioner-copy">
                <h2 className="section-title text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1.18] tracking-tight text-[#121517] mb-6">
                  Rekomendasi didukung perspektif praktisi kesehatan
                </h2>
                <p className="subheadline text-base sm:text-lg text-[#46484E] leading-relaxed mb-6">
                  Rekomendasi NutrimateAI diselaraskan dengan pedoman gizi resmi dan pandangan praktisi
                  kesehatan untuk membantu Anda memperoleh asupan yang lebih tepat, aman, dan dapat dipercaya.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#07543f] bg-white px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                  <Image
                    src="/verify_praktisi.png"
                    alt="Terverifikasi"
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                  <span>Standar Rekomendasi Gizi Seimbang Kemenkes RI</span>
                </div>
              </div>

              {/* Cards List */}
              <div className="practitioner-list flex flex-col gap-3.5">
                {[
                  {
                    name: "Dokter Spesialis Gizi Klinik (Sp.GK)",
                    desc: "Verifikasi standar gizi makro & mikro ibu dan balita",
                  },
                  {
                    name: "Bidan Praktik Mandiri & Kader KIA",
                    desc: "Pendampingan buku KIA dan pemantauan berat badan",
                  },
                  {
                    name: "Nutrisionis & Ahli Diet Puskesmas",
                    desc: "Penyesuaian bahan pangan lokal berbiaya terjangkau",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="practitioner-card min-h-[76px] bg-white border border-[#d6ddda] rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                  >
                    <div className="person-icon w-12 h-12 rounded-xl bg-[#004e3b] text-white flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="person-name text-sm sm:text-base font-semibold text-[#121517]">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#707773] mt-0.5">{item.desc}</p>
                    </div>
                    <Image
                      src="/verify_praktisi.png"
                      alt="Verified"
                      width={22}
                      height={22}
                      className="w-5 h-5 object-contain shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= USERS & TESTIMONIALS ================= */}
        <section id="pengguna" className="users-section py-20 sm:py-28 bg-white overflow-hidden">
          <div className="container w-[calc(100%-32px)] max-w-[1140px] mx-auto">
            <div className="users-heading flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <h2 className="users-title text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1.18] tracking-tight text-[#121517] max-w-[620px]">
                10ribu+ pengguna telah bergabung bersama NutrimateAI
              </h2>
              <p className="text-sm sm:text-base text-[#666d6a]">
                Simak pengalaman nyata para ibu yang terbantu menjaga asupan gizi keluarga tercinta.
              </p>
            </div>

            <TestimonialCarousel />
          </div>
        </section>

        {/* ================= CLOSING CTA SECTION ================= */}
        <section className="closing-section py-24 sm:py-36 bg-gradient-to-b from-white to-[#F2F8F6] text-center px-4">
          <div className="max-w-[900px] mx-auto">
            <h2 className="closing-title text-3xl sm:text-4xl lg:text-[46px] font-medium leading-[1.2] tracking-tight text-[#121517] mb-8">
              Sekarang giliran Anda untuk memulai perjalanan gizi yang lebih tepat, demi tumbuh kembang si kecil!
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleOpenAuth("signup")}
                className="h-12 px-8 rounded-full bg-[#05976A] text-white font-semibold hover:bg-[#047b57] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[0_10px_26px_rgba(5,151,106,0.22)]"
              >
                Mulai Sekarang Gratis
              </button>

              <Link
                href="/hubungi-kami"
                className="h-12 px-7 rounded-full bg-white border border-neutral-300 text-neutral-800 font-semibold hover:bg-neutral-50 hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center"
              >
                Hubungi Tim Kami
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= SITE FOOTER ================= */}
      <footer className="site-footer border-t border-[#ecefed] bg-white pt-16 pb-8 overflow-hidden">
        <div className="container w-[calc(100%-32px)] max-w-[1140px] mx-auto">
          {/* Top Columns */}
          <div className="footer-top grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 sm:gap-12 pb-12">
            <div>
              <Link href="/#home" className="inline-block mb-4">
                <Image
                  src="/logo-NutrimateAI-fix.svg"
                  alt="NutrimateAI"
                  width={150}
                  height={34}
                  className="w-[145px] h-auto object-contain"
                />
              </Link>
              <p className="footer-muted text-xs text-[#707773] leading-relaxed mb-4 max-w-[300px]">
                Platform pendamping nutrisi ibu hamil dan ibu balita berbasis rekomendasi cerdas dan
                dukungan gotong royong gizi.
              </p>
              <Link
                href="/hubungi-kami"
                className="footer-contact inline-flex items-center gap-2.5 px-3.5 py-2 border border-[#dce9e4] bg-[#f3faf7] rounded-xl text-xs font-semibold text-[#07543f] hover:bg-[#e4f3ee] transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[#05976A] text-white flex items-center justify-center font-bold text-xs">
                  ✉
                </span>
                <span>Hubungi Kami</span>
              </Link>
            </div>

            {/* Col 2 */}
            <div className="footer-col">
              <h4 className="footer-label text-xs font-bold text-[#202422] uppercase tracking-wider mb-3">
                Fitur Nutrisi
              </h4>
              <ul className="space-y-2 text-xs text-[#707773]">
                <li>
                  <Link href="/#asisten-ai" className="hover:text-[#05976A] transition-colors">
                    NutriCheck (Asesmen)
                  </Link>
                </li>
                <li>
                  <Link href="/#asisten-ai" className="hover:text-[#05976A] transition-colors">
                    NutriPlan (Menu 30 Hari)
                  </Link>
                </li>
                <li>
                  <Link href="/#asisten-ai" className="hover:text-[#05976A] transition-colors">
                    NutriDaily (Pengingat WA)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="footer-col">
              <h4 className="footer-label text-xs font-bold text-[#202422] uppercase tracking-wider mb-3">
                Bantuan Sosial
              </h4>
              <ul className="space-y-2 text-xs text-[#707773]">
                <li>
                  <Link href="/#asisten-ai" className="hover:text-[#05976A] transition-colors">
                    NutriHelp (Ajukan Bantuan)
                  </Link>
                </li>
                <li>
                  <Link href="/#asisten-ai" className="hover:text-[#05976A] transition-colors">
                    NutriAssist (Donasi Gizi)
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setGuideModalOpen(true)}
                    className="text-left hover:text-[#05976A] transition-colors"
                  >
                    Panduan Penggunaan
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="footer-col">
              <h4 className="footer-label text-xs font-bold text-[#202422] uppercase tracking-wider mb-3">
                Informasi & Legal
              </h4>
              <ul className="space-y-2 text-xs text-[#707773]">
                <li>
                  <Link href="/hubungi-kami" className="hover:text-[#05976A] transition-colors">
                    Pusat Bantuan
                  </Link>
                </li>
                <li>
                  <span className="text-neutral-400">Pencegahan Stunting (1000 HPK)</span>
                </li>
                <li>
                  <span className="text-neutral-400">Kebijakan Privasi</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Large Watermark */}
          <div className="footer-brand select-none text-[clamp(45px,12vw,140px)] font-bold text-neutral-100 leading-none tracking-tighter text-center my-4 overflow-hidden">
            NutriMate AI
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8e9592]">
            <p>© 2026 NutriMate AI. Seluruh Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-4">
              <span>Platform Edukasi & Rekomendasi Gizi Mandiri</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Guide Modal */}
      <GuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />

      {/* Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
