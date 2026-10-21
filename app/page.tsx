"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/component/Navbar";
import FeatureCarousel from "@/component/FeatureCarousel";
import TestimonialCarousel from "@/component/TestimonialCarousel";
import GuideModal from "@/component/GuideModal";
import AuthModal from "@/component/AuthModal";
import { apiGetMe } from "@/lib/auth/client";

// Typewriter hook supporting trigger, delay, and completion
function useScrollTypewriter(
  text: string,
  speed = 35,
  shouldStart = false
) {
  const [displayText, setDisplayText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!shouldStart) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsFinished(true);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsFinished(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, shouldStart]);

  return { displayText, isFinished };
}

export default function LandingPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Redirection guard: authenticated users cannot return to landing page
  useEffect(() => {
    let isMounted = true;

    apiGetMe()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.user) {
          if (res.data.user.role === "ADMIN") {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => {
        if (isMounted) setAuthChecked(true);
      });

    const checkPopstate = () => {
      apiGetMe().then((res) => {
        if (res.success && res.data?.user) {
          if (res.data.user.role === "ADMIN") {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
        }
      }).catch(() => {});
    };
    window.addEventListener("popstate", checkPopstate);
    return () => {
      isMounted = false;
      window.removeEventListener("popstate", checkPopstate);
    };
  }, [router]);

  // Trigger states
  const [heroStart] = useState(true);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [heroCursorVisible, setHeroCursorVisible] = useState(true);

  const [aiInView, setAiInView] = useState(false);

  const [practitionerInView, setPractitionerInView] = useState(false);
  const [usersInView, setUsersInView] = useState(false);
  const [closingInView, setClosingInView] = useState(false);

  const aiSectionRef = useRef<HTMLElement>(null);
  const practitionerSectionRef = useRef<HTMLElement>(null);
  const usersSectionRef = useRef<HTMLElement>(null);
  const closingSectionRef = useRef<HTMLElement>(null);

  // Tooltip state for feature highlights
  const [activeTooltip, setActiveTooltip] = useState<{
    title: string;
    desc: string;
    x: number;
    y: number;
    show: boolean;
  }>({ title: "", desc: "", x: 0, y: 0, show: false });

  // 1. Hero Typewriter
  const heroType = useScrollTypewriter(
    "Nutrisi lebih tepat untuk ibu dan si kecil, langkah nyata cegah stunting",
    42,
    heroStart
  );

  // On hero finish, reveal content and hide cursor after 2s
  useEffect(() => {
    if (heroType.isFinished) {
      setHeroRevealed(true);
      const timer = setTimeout(() => {
        setHeroCursorVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [heroType.isFinished]);

  // 2. AI Section Typewriter
  const aiType = useScrollTypewriter(
    "NutrimateAI dilengkapi dengan teknologi kecerdasan buatan untuk membantu menganalisis kondisi dan lingkungan Anda agar rekomendasi nutrisi dapat lebih sesuai.",
    28,
    aiInView
  );

  // 3. Practitioner Typewriter
  const practitionerType = useScrollTypewriter(
    "Rekomendasi NutrimateAI didukung oleh perspektif praktisi kesehatan untuk membantu Anda mendapatkan informasi nutrisi yang lebih tepat dan terpercaya.",
    28,
    practitionerInView
  );

  // 4. Users Typewriter
  const usersType = useScrollTypewriter(
    "10ribu+ pengguna telah bergabung bersama NutrimateAI",
    30,
    usersInView
  );

  // 5. Closing CTA Typewriter
  const closingType = useScrollTypewriter(
    "Sekarang giliran Anda untuk memulai perjalanan gizi yang lebih tepat, demi tumbuh kembang si kecil!",
    27,
    closingInView
  );

  // Intersection Observers setup
  // PENTING: observer baru boleh dipasang setelah pengecekan auth selesai (authChecked = true),
  // karena sebelum itu halaman hanya menampilkan spinner sehingga ref section masih null.
  useEffect(() => {
    if (!authChecked) return;

    const observerOptions = { threshold: 0.3 };

    const aiObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setAiInView(true);
        aiObserver.disconnect();
      }
    }, { threshold: 0.35 });
    if (aiSectionRef.current) aiObserver.observe(aiSectionRef.current);

    const practitionerObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPractitionerInView(true);
        practitionerObserver.disconnect();
      }
    }, observerOptions);
    if (practitionerSectionRef.current) practitionerObserver.observe(practitionerSectionRef.current);

    const usersObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setUsersInView(true);
        usersObserver.disconnect();
      }
    }, { threshold: 0.25 });
    if (usersSectionRef.current) usersObserver.observe(usersSectionRef.current);

    const closingObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setClosingInView(true);
        closingObserver.disconnect();
      }
    }, { threshold: 0.35 });
    if (closingSectionRef.current) closingObserver.observe(closingSectionRef.current);

    return () => {
      aiObserver.disconnect();
      practitionerObserver.disconnect();
      usersObserver.disconnect();
      closingObserver.disconnect();
    };
  }, [authChecked]);

  const handleOpenAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const featureDescriptions: Record<string, string> = {
    NutriCheck:
      "Membantu mengetahui kondisi ibu dan si kecil melalui riwayat kesehatan, ekonomi, lingkungan, dan kebutuhan lainnya.",
    NutriPlan:
      "Menggunakan AI untuk memberikan rekomendasi makanan dan gizi sesuai kondisi ibu dan si kecil.",
    NutriDaily:
      "Mengirimkan pengingat nutrisi dan jadwal penting langsung melalui WhatsApp.",
    NutriHelp:
      "Membantu ibu hamil atau keluarga menyampaikan kebutuhan gizi dan mengajukan bantuan melalui donasi.",
    NutriAssist:
      "Memungkinkan masyarakat memberikan donasi untuk membantu memenuhi kebutuhan gizi ibu dan anak.",
  };

  const featureIcons: Record<string, React.ReactNode> = {
    NutriCheck: (
      <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16 16 4 4M11 7.5v7M7.5 11h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    NutriPlan: (
      <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none">
        <path d="M12 3.5v17M4.5 12h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6.5 7.2c1.8-2.3 5.2-2.9 7.7-1.2 2.4 1.6 3.3 4.7 1.8 7.2-1.4 2.4-4.3 3.4-6.8 2.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    NutriDaily: (
      <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    NutriHelp: (
      <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none">
        <path d="M12 20s-7-4.1-7-9.5C5 7.7 6.7 6 9 6c1.4 0 2.4.7 3 1.8C12.6 6.7 13.6 6 15 6c2.3 0 4 1.7 4 4.5C19 15.9 12 20 12 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    NutriAssist: (
      <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none">
        <path d="M12 20V5M7 9l5-5 5 5M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  const handleFeatureHover = (e: React.MouseEvent<HTMLDivElement>, name: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popupWidth = Math.min(300, window.innerWidth - 24);
    const popupHeight = 110;
    const gap = 12;
    const edge = 12;

    let left = rect.left + rect.width / 2 - popupWidth / 2;
    left = Math.max(edge, Math.min(left, window.innerWidth - popupWidth - edge));

    let top = rect.top - popupHeight - gap;
    if (top < edge) top = rect.bottom + gap;

    setActiveTooltip({
      title: name,
      desc: featureDescriptions[name] || "",
      x: left,
      y: top,
      show: true,
    });
  };

  if (!authChecked) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#05976A]/30 border-t-[#05976A] rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#5b5f66]">Memuat NutriMate AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page bg-white min-h-screen text-[#121517] selection:bg-[#05976A]/20">
      {/* Navbar */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Content */}
      <main id="home" className="pt-[70px] sm:pt-[78px]">
        {/* ================= HERO SECTION ================= */}
        <section className="hero bg-white overflow-hidden flex flex-col justify-between">
          <div className="hero-top w-full max-w-[1080px] mx-auto px-4 pt-10 sm:pt-12 text-center flex flex-col items-center">
            {/* Trust badge */}
            <div className="trust inline-flex items-center justify-center gap-2 text-base sm:text-[19px] font-medium text-[#121517] mb-6 sm:mb-8">
              <Image
                src="/logo-kemenkes.png"
                alt="Logo Kementerian Kesehatan RI"
                width={25}
                height={25}
                className="w-5 sm:w-[25px] h-5 sm:h-[25px] object-contain"
                priority
              />
              <span>Diawasi oleh Kementerian Kesehatan RI</span>
            </div>

            {/* Headline Typewriter */}
            <h1 className="hero-title text-[32px] sm:text-[54px] lg:text-[66px] font-normal leading-[1.08] tracking-[-2.2px] text-[#121517] max-w-[1020px] mx-auto min-h-[104px] sm:min-h-[140px] lg:min-h-[145px]">
              {heroType.displayText}
              {heroCursorVisible && (
                <span className="type-cursor" aria-hidden="true" />
              )}
            </h1>

            {/* CTA Buttons */}
            <div
              className={`hero-cta reveal-after-hero flex flex-wrap items-center justify-center gap-3 mt-9 sm:mt-11 mb-16 sm:mb-24 ${
                heroRevealed ? "is-visible" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => handleOpenAuth("signup")}
                className="btn btn-primary h-12 px-6 rounded-full inline-flex items-center justify-center gap-2 bg-[#05976A] text-white font-semibold hover:bg-[#07543f] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[0_8px_22px_rgba(5,151,106,0.13)] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5h5a1.8 1.8 0 0 1 1.8 1.8v10.4A1.8 1.8 0 0 1 18 19h-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h10m-3.5-3.5L14 12l-3.5 3.5" />
                </svg>
                Daftar dan Coba
              </button>

              <button
                type="button"
                onClick={() => setGuideModalOpen(true)}
                className="btn btn-secondary h-12 px-6 rounded-full inline-flex items-center justify-center gap-2 bg-[#E6F2EE] text-[#0b4436] font-medium hover:bg-[#d5eee4] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                Panduan Penggunaan
              </button>
            </div>
          </div>

          {/* Feature Carousel */}
          <div className={`feature-area-wrap reveal-after-hero ${heroRevealed ? "is-visible" : ""}`}>
            <FeatureCarousel />
          </div>
        </section>

        {/* ================= FEATURE HIGHLIGHTS STRIP ================= */}
        <section className="feature-highlights bg-white py-8 sm:py-9 border-t border-[#f0f2f1] border-bottom border-[#edf0ef] overflow-hidden relative">
          <p className="eyebrow text-center text-xs sm:text-[15px] font-semibold tracking-[2.4px] text-[#7b8180] uppercase mb-6">
            BERBAGAI FITUR UNGGULAN
          </p>

          <div
            className="highlight-window overflow-hidden w-full"
            onMouseLeave={() => setActiveTooltip((prev) => ({ ...prev, show: false }))}
          >
            <div className="highlight-track flex w-max items-center animate-[marquee_24s_linear_infinite] hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, groupIdx) => (
                <div key={groupIdx} className="highlight-group flex items-center gap-[35px] sm:gap-[58px] pr-[35px] sm:pr-[58px]">
                  {Object.keys(featureDescriptions).map((name) => (
                    <div
                      key={name}
                      onMouseEnter={(e) => handleFeatureHover(e, name)}
                      onMouseLeave={() => setActiveTooltip((prev) => ({ ...prev, show: false }))}
                      className="highlight-item flex items-center gap-3 cursor-pointer text-[#a4aaa8] hover:text-[#4e5653] hover:-translate-y-px transition-all min-w-[155px] sm:min-w-[190px] py-2"
                    >
                      <span className="highlight-icon w-9 sm:w-[42px] h-9 sm:h-[42px] rounded-[10px] sm:rounded-xl bg-[#f0f3f2] flex items-center justify-center text-[#05976A] border border-[#e1e6e4] shrink-0">
                        {featureIcons[name]}
                      </span>
                      <span className="highlight-name text-sm sm:text-[17px] font-semibold whitespace-nowrap text-inherit">
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
              className="feature-popup fixed z-[9999] w-[min(300px,calc(100vw-24px))] p-[18px_20px_19px] bg-white rounded-[18px] border border-[#eef1ef] shadow-[0_16px_40px_rgba(18,21,23,0.12),0_2px_8px_rgba(18,21,23,0.05)] text-left pointer-events-none transition-all duration-200"
              style={{ left: activeTooltip.x, top: activeTooltip.y }}
            >
              <h3 className="feature-popup-title text-base font-bold text-[#1a1d1c] mb-1.5 leading-[1.3] tracking-tight">
                {activeTooltip.title}
              </h3>
              <p className="feature-popup-desc text-[13.5px] text-[#7b8180] leading-[1.55] m-0 font-normal">
                {activeTooltip.desc}
              </p>
            </div>
          )}
        </section>

        {/* ================= ASISTEN AI SECTION ================= */}
        <section
          id="asisten-ai"
          ref={aiSectionRef}
          className="ai-section bg-white py-16 sm:py-20 lg:py-24"
        >
          <div className="container w-[min(calc(100%-32px),1330px)] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-10 lg:gap-16 items-center">
              <div className="ai-copy max-w-[570px]">
                <h2 className="text-[34px] sm:text-[42px] lg:text-[48px] font-medium leading-[1.12] tracking-[-1.6px] text-[#080b09] mb-5">
                  Dilengkapi asisten AI
                </h2>
                <p className="text-[16px] sm:text-[18px] lg:text-[19px] leading-[1.8] text-[#555957] min-h-[150px] sm:min-h-[135px]">
                  {aiType.displayText}
                  {!aiType.isFinished && (
                    <span className="type-cursor practitioner-cursor" aria-hidden="true" />
                  )}
                </p>
              </div>

              
              <div
                className="ai-visual relative w-full aspect-video rounded-[18px] sm:rounded-[22px] overflow-hidden bg-cover bg-center shadow-[0_16px_45px_rgba(5,65,43,0.12)]"
                style={{ backgroundImage: "url('/bg-asisten.png')" }}
              >
                <div className="absolute left-1/2 top-1/2 w-[84%] aspect-video -translate-x-1/2 -translate-y-1/2 rounded-[9px] sm:rounded-[12px] overflow-hidden bg-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                    aria-label="Video penjelasan Asisten AI NutrimateAI"
                    className="block w-full h-full object-cover pointer-events-none"
                  >
                    <source src="/videos/videoAI.mp4" type="video/mp4" />
                    Browser Anda tidak mendukung tag video.
                  </video>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= PRAKTISI SECTION ================= */}
        <section
          id="praktisi"
          ref={practitionerSectionRef}
          className="practitioner-section py-20 sm:py-28 bg-[#E6F2EE]"
        >
          <div className="container w-[min(calc(100%-32px),1240px)] mx-auto">
            <div className="practitioner-grid grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              {/* Copy */}
              <div className="practitioner-copy">
                <h2 className="section-title text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1.14] tracking-[-1.5px] text-[#121517] mb-6">
                  Didukung oleh praktisi
                  <br />
                  kesehatan Indonesia
                </h2>
                <p className="subheadline text-base sm:text-lg text-[#46484E] leading-[1.55] max-w-[500px] min-h-[84px] mt-6">
                  {practitionerType.displayText}
                  {!practitionerType.isFinished && (
                    <span className="type-cursor practitioner-cursor" aria-hidden="true" />
                  )}
                </p>
              </div>

              {/* Practitioner List Cards */}
              <div className="practitioner-list flex flex-col gap-3">
                {[
                  "Ahli Gizi & Nutrisi",
                  "Spesialis Obstetri & Ginekologi",
                  "Ahli Kesehatan Masyarakat",
                ].map((title, i) => (
                  <article
                    key={i}
                    className="practitioner-card min-h-[70px] sm:min-h-[76px] bg-white border border-[#d6ddda] rounded-[13px] p-[10px_17px_10px_12px] flex items-center gap-[15px] shadow-[0_2px_7px_rgba(0,0,0,0.025)]"
                  >
                    <div className="person-icon w-[45px] sm:w-[48px] h-[45px] sm:h-[48px] rounded-[9px] bg-[#004e3b] text-white flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M5.5 20c.7-3.2 2.9-5 6.5-5s5.8 1.8 6.5 5M17.5 7.5h3m-1.5-1.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="person-name text-[15px] sm:text-[17px] font-semibold text-[#121517] flex-1">
                      {title}
                    </span>
                    <svg className="verified w-5 sm:w-6 h-5 sm:h-6 text-[#05976A] shrink-0" viewBox="0 0 24 24" fill="none" aria-label="Terverifikasi">
                      <path d="M12 3.1 18.8 6v5.1c0 4.2-2.7 7.5-6.8 9.3-4.1-1.8-6.8-5.1-6.8-9.3V6L12 3.1Z" fill="currentColor" />
                      <path d="m8.7 12 2.1 2.1 4.5-4.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= USERS & TESTIMONIALS ================= */}
        <section
          id="pengguna"
          ref={usersSectionRef}
          className="users-section pt-20 sm:pt-28 bg-white overflow-hidden scroll-mt-20"
        >
          <div className="container w-[min(calc(100%-32px),1240px)] mx-auto">
            <div className="users-heading grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-[70px] items-end mb-10 sm:mb-12">
              <h2 className="users-title text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1.14] tracking-[-1.5px] text-[#121517] max-w-[590px] min-h-[90px] sm:min-h-[103px]">
                {usersType.displayText}
                {!usersType.isFinished && (
                  <span className="type-cursor" aria-hidden="true" />
                )}
              </h2>
              <p className="users-subtitle flex items-center gap-4 text-base sm:text-lg text-[#666d6a] md:justify-self-end mb-2">
                Ini kata mereka
                <svg className="w-5 sm:w-[21px] h-5 sm:h-[21px] text-[#05976A]" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M6.5 13.5 12 19l5.5-5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </div>

            <TestimonialCarousel />
          </div>
        </section>

        {/* ================= CLOSING CTA SECTION ================= */}
        <section
          ref={closingSectionRef}
          className="closing-section py-28 sm:py-[150px] px-5 sm:px-6 bg-white text-center"
        >
          <h2 className="closing-title relative mx-auto max-w-[1050px] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1.14] tracking-[-1.5px] text-[#121517]">
            {/* Ghost text for layout height preservation */}
            <span className="closing-ghost invisible" aria-hidden="true">
              Sekarang giliran Anda untuk memulai perjalanan gizi yang lebih tepat, demi tumbuh kembang si kecil!
              <span className="type-cursor" />
            </span>
            {/* Live animated typewriter */}
            <span className="closing-live absolute left-0 right-0 top-0">
              {closingType.displayText}
              {!closingType.isFinished && (
                <span className="type-cursor" aria-hidden="true" />
              )}
            </span>
          </h2>
        </section>
      </main>

      {/* ================= SITE FOOTER ================= */}
      <footer className="site-footer border-t border-[#ecefed] bg-white pt-6 overflow-hidden">
        <div className="container w-[min(calc(100%-32px),1240px)] mx-auto">
          {/* Top Columns */}
          <div className="footer-top grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] gap-8 sm:gap-[55px] items-start pb-10 sm:pb-[50px]">
            <div>
              <div className="footer-label text-[13px] font-semibold mb-3.5 text-[#202422]">
                Hubungi kami
              </div>
              <div className="footer-muted text-xs text-[#a0a6a3] leading-[1.45] mb-2">
                Butuh bantuan atau ingin berkolaborasi
                <br />
                bersama NutrimateAI?
              </div>
              <Link
                href="/hubungi-kami"
                className="footer-contact inline-flex items-center gap-2.5 mt-2 p-[10px_13px] border border-[#dce9e4] bg-[#f3faf7] rounded-[10px] text-xs text-[#3f4845] hover:bg-[#e6f4ef] transition-colors"
              >
                <span className="footer-contact-icon w-[27px] h-[27px] rounded-full bg-[#05976A] text-white grid place-items-center shrink-0">
                  <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none">
                    <path d="M4 11.2 19.2 4.7c.9-.38 1.75.48 1.37 1.37L14.1 21.3c-.36.84-1.57.79-1.86-.08l-2.1-6.28-6.28-2.1C2.99 12.55 2.95 11.55 4 11.2Z" fill="currentColor" />
                    <path d="m10.2 14.8 5.9-5.9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span>
                  Hubungi Kami
                  <br />
                  <small className="text-[#8e9592]">Kirim pesan langsung melalui website</small>
                </span>
              </Link>
            </div>

            {/* Col 2 */}
            <div className="footer-col">
              <div className="footer-label text-[13px] font-semibold mb-3.5 text-[#202422]">
                Fitur
              </div>
              <div className="space-y-3 text-xs text-[#969d9a]">
                <Link href="/#home" className="block hover:text-[#05976A] transition-colors">
                  Beranda
                </Link>
                <Link href="/#asisten-ai" className="block hover:text-[#05976A] transition-colors">
                  Asisten AI
                </Link>
                <Link href="/#praktisi" className="block hover:text-[#05976A] transition-colors">
                  Praktisi
                </Link>
                <Link href="/#pengguna" className="block hover:text-[#05976A] transition-colors">
                  Pengguna
                </Link>
              </div>
            </div>

            {/* Col 3 */}
            <div className="footer-col">
              <div className="footer-label text-[13px] font-semibold mb-3.5 text-[#202422]">
                Jelajahi
              </div>
              <div className="space-y-3 text-xs text-[#969d9a]">
                <Link href="/#home" className="block hover:text-[#05976A] transition-colors">
                  Tentang NutrimateAI
                </Link>
                <Link href="/#asisten-ai" className="block hover:text-[#05976A] transition-colors">
                  Rekomendasi Nutrisi
                </Link>
                <Link href="/#pengguna" className="block hover:text-[#05976A] transition-colors">
                  Ulasan Pengguna
                </Link>
                <Link href="/hubungi-kami" className="block hover:text-[#05976A] transition-colors">
                  Hubungi Kami
                </Link>
              </div>
            </div>

            {/* Col 4 */}
            <div className="footer-col">
              <div className="footer-label text-[13px] font-semibold mb-3.5 text-[#202422]">
                Bantuan
              </div>
              <div className="space-y-3 text-xs text-[#969d9a]">
                <span className="block cursor-pointer hover:text-[#05976A] transition-colors">
                  FAQ
                </span>
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(true)}
                  className="block text-left hover:text-[#05976A] transition-colors"
                >
                  Panduan
                </button>
                <span className="block cursor-pointer hover:text-[#05976A] transition-colors">
                  Kebijakan Privasi
                </span>
                <span className="block cursor-pointer hover:text-[#05976A] transition-colors">
                  Syarat Penggunaan
                </span>
              </div>
            </div>
          </div>

          {/* Large Brand Watermark */}
          <div
            className="footer-brand select-none text-[clamp(50px,16vw,220px)] leading-[0.68] sm:leading-[0.68] font-medium tracking-[-0.075em] text-[#eef0ef] whitespace-nowrap -translate-x-1 overflow-hidden"
            aria-hidden="true"
          >
            NutrimateAI
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom py-4 border-t border-[#f0f2f1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[#8e9592]">
            <span>© 2026 NutrimateAI. All rights reserved.</span>
            <div className="footer-legal flex gap-4 sm:gap-5 flex-wrap">
              <span className="cursor-pointer hover:text-[#555b58] transition-colors">Terms of Service</span>
              <span className="cursor-pointer hover:text-[#555b58] transition-colors">Privacy Policy</span>
              <span className="cursor-pointer hover:text-[#555b58] transition-colors">Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />
      <AuthModal isOpen={authModalOpen} initialMode={authMode} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}