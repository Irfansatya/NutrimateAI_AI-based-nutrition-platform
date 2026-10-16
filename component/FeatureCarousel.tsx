"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const features = [
  {
    title: "Analisis Kondisi Anda",
    desc: "Kami pahami kondisi ekonomi, kesehatan, dan lingkungan anda dahulu agar rekomendasi menu bisa lebih tepat.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#e8f7f1" />
            <stop offset="1" stopColor="#c7eadc" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g1)" />
        <circle cx="650" cy="95" r="70" fill="#fff" opacity=".55" />
        <rect x="95" y="310" width="610" height="18" rx="9" fill="#8cc9b4" opacity=".7" />
        <circle cx="290" cy="168" r="58" fill="#f1bd96" />
        <path d="M235 160c8-62 100-72 119-2-28-17-61-24-119 2Z" fill="#2e3b36" />
        <path d="M226 223c17-31 91-36 126 0l34 101H190Z" fill="#fff" />
        <circle cx="516" cy="216" r="48" fill="#f1bd96" />
        <path d="M470 207c4-46 72-59 91-8-25-15-55-17-91 8Z" fill="#5b4030" />
        <path d="M459 258c16-29 69-29 92 0l25 66H434Z" fill="#f1c75b" />
        <path d="M305 255c55 4 100 24 134 62" fill="none" stroke="#d79b76" strokeWidth="18" strokeLinecap="round" />
        <circle cx="585" cy="356" r="34" fill="#fff" />
        <path d="M566 356l13 13 27-30" fill="none" stroke="#2a9b72" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Susun Asupan Nutrisi",
    desc: "Tak perlu bingung memikirkan menu setiap hari. Kami susun rencana gizi bulanan yang terjangkau dan sesuai.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#eef9f5" />
            <stop offset="1" stopColor="#d5eee4" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g2)" />
        <circle cx="400" cy="235" r="150" fill="#fff" />
        <circle cx="400" cy="235" r="112" fill="#f7f0d8" />
        <path d="M400 235 490 174A112 112 0 0 1 497 285Z" fill="#e9b45b" />
        <path d="M400 235 497 285A112 112 0 0 1 334 330Z" fill="#72b98d" />
        <path d="M400 235 334 330A112 112 0 0 1 288 190Z" fill="#e77b62" />
        <path d="M400 235 288 190A112 112 0 0 1 490 174Z" fill="#d6d8ec" />
        <circle cx="148" cy="115" r="42" fill="#fff" />
        <path d="M125 119h46M148 96v46" stroke="#3aa77c" strokeWidth="10" strokeLinecap="round" />
        <circle cx="654" cy="345" r="48" fill="#fff" />
        <path d="M632 346h44M654 324v44" stroke="#e5b24f" strokeWidth="10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Pantau Perkembangan",
    desc: "Catat berat dan tinggi si kecil tiap bulan, lihat perkembangannya, dan menu gizinya akan ikut disesuaikan.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#eaf7f2" />
            <stop offset="1" stopColor="#d2eae1" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g3)" />
        <rect x="178" y="88" width="444" height="285" rx="30" fill="#fff" />
        <rect x="212" y="128" width="220" height="20" rx="10" fill="#a9d8c7" />
        <rect x="212" y="171" width="335" height="14" rx="7" fill="#d9ebe4" />
        <rect x="212" y="199" width="270" height="14" rx="7" fill="#d9ebe4" />
        <circle cx="290" cy="278" r="48" fill="#dff3eb" />
        <path d="M270 280c13-25 34-25 47 0" fill="none" stroke="#3da47c" strokeWidth="10" strokeLinecap="round" />
        <circle cx="290" cy="260" r="12" fill="#3da47c" />
        <path d="M438 246h88v64h-88z" fill="#f1d98e" />
        <path d="M454 278h56" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
        <circle cx="665" cy="105" r="42" fill="#fff" />
        <path d="M642 105h46M665 82v46" stroke="#3da47c" strokeWidth="9" strokeLinecap="round" />
        <circle cx="125" cy="350" r="42" fill="#fff" />
        <path d="M105 351h40M125 331v40" stroke="#e2b052" strokeWidth="9" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Ingatkan Anda Tiap Hari",
    desc: "Tak perlu bolak-balik membuka website. Kami ingatkan kebutuhan gizi si kecil lewat WhatsApp setiap hari.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="g4" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#e8f7f1" />
            <stop offset="1" stopColor="#c7eadc" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g4)" />
        <circle cx="650" cy="95" r="70" fill="#fff" opacity=".55" />
        <rect x="95" y="310" width="610" height="18" rx="9" fill="#8cc9b4" opacity=".7" />
        <circle cx="290" cy="168" r="58" fill="#f1bd96" />
        <path d="M235 160c8-62 100-72 119-2-28-17-61-24-119 2Z" fill="#2e3b36" />
        <path d="M226 223c17-31 91-36 126 0l34 101H190Z" fill="#fff" />
        <circle cx="516" cy="216" r="48" fill="#f1bd96" />
        <path d="M470 207c4-46 72-59 91-8-25-15-55-17-91 8Z" fill="#5b4030" />
        <path d="M459 258c16-29 69-29 92 0l25 66H434Z" fill="#f1c75b" />
        <path d="M305 255c55 4 100 24 134 62" fill="none" stroke="#d79b76" strokeWidth="18" strokeLinecap="round" />
        <circle cx="585" cy="356" r="34" fill="#fff" />
        <path d="M566 356l13 13 27-30" fill="none" stroke="#2a9b72" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Galang Donasi Gizi",
    desc: "Dana belum cukup untuk gizi buah hati? Ceritakan kebutuhan Anda, dan biarkan masyarakat ikut membantu.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="g5" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#eef9f5" />
            <stop offset="1" stopColor="#d5eee4" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g5)" />
        <circle cx="400" cy="235" r="150" fill="#fff" />
        <circle cx="400" cy="235" r="112" fill="#f7f0d8" />
        <path d="M400 235 490 174A112 112 0 0 1 497 285Z" fill="#e9b45b" />
        <path d="M400 235 497 285A112 112 0 0 1 334 330Z" fill="#72b98d" />
        <path d="M400 235 334 330A112 112 0 0 1 288 190Z" fill="#e77b62" />
        <path d="M400 235 288 190A112 112 0 0 1 490 174Z" fill="#d6d8ec" />
        <circle cx="148" cy="115" r="42" fill="#fff" />
        <path d="M125 119h46M148 96v46" stroke="#3aa77c" strokeWidth="10" strokeLinecap="round" />
        <circle cx="654" cy="345" r="48" fill="#fff" />
        <path d="M632 346h44M654 324v44" stroke="#e5b24f" strokeWidth="10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Salurkan Bantuan Gizi",
    desc: "Bantuan anda akan sampai langsung ke ibu dan anak yang membutuhkan, menjadi sepiring gizi untuk tumbuh sehat.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
        <defs>
          <linearGradient id="g6" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#eaf7f2" />
            <stop offset="1" stopColor="#d2eae1" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g6)" />
        <rect x="178" y="88" width="444" height="285" rx="30" fill="#fff" />
        <rect x="212" y="128" width="220" height="20" rx="10" fill="#a9d8c7" />
        <rect x="212" y="171" width="335" height="14" rx="7" fill="#d9ebe4" />
        <rect x="212" y="199" width="270" height="14" rx="7" fill="#d9ebe4" />
        <circle cx="290" cy="278" r="48" fill="#dff3eb" />
        <path d="M270 280c13-25 34-25 47 0" fill="none" stroke="#3da47c" strokeWidth="10" strokeLinecap="round" />
        <circle cx="290" cy="260" r="12" fill="#3da47c" />
        <path d="M438 246h88v64h-88z" fill="#f1d98e" />
        <path d="M454 278h56" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
        <circle cx="665" cy="105" r="42" fill="#fff" />
        <path d="M642 105h46M665 82v46" stroke="#3da47c" strokeWidth="9" strokeLinecap="round" />
        <circle cx="125" cy="350" r="42" fill="#fff" />
        <path d="M105 351h40M125 331v40" stroke="#e2b052" strokeWidth="9" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function FeatureCarousel() {
  const totalSlides = features.length;
  // 3 sets for infinite seamless sliding, active in middle set at index 1
  const [activeIndex, setActiveIndex] = useState(totalSlides + 1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  // Triple the items: [Set 0 (0..5), Set 1 (6..11), Set 2 (12..17)]
  const allCards = [...features, ...features, ...features];

  const updatePosition = useCallback((animate = true) => {
    if (!carouselRef.current || !trackRef.current) return;
    const cards = trackRef.current.children;
    if (!cards.length) return;

    const firstCard = cards[0] as HTMLElement;
    const cardStyle = window.getComputedStyle(firstCard);
    const cardWidth = firstCard.offsetWidth;
    const marginLeft = parseFloat(cardStyle.marginLeft) || 0;
    const marginRight = parseFloat(cardStyle.marginRight) || 0;
    const step = cardWidth + marginLeft + marginRight;

    const viewportWidth = carouselRef.current.clientWidth;
    const cardCenter = activeIndex * step + marginLeft + cardWidth / 2;
    const offset = viewportWidth / 2 - cardCenter;

    trackRef.current.style.transition = animate
      ? "transform .68s cubic-bezier(.22,.7,.22,1)"
      : "none";
    trackRef.current.style.transform = `translateX(${offset}px)`;
  }, [activeIndex]);

  const nextSlide = useCallback(() => {
    setIsAnimating(true);
    setActiveIndex((prev) => {
      const next = prev + 1;
      return next;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setIsAnimating(true);
    setActiveIndex((prev) => prev - 1);
  }, []);

  // Center wrap-around logic
  useEffect(() => {
    updatePosition(isAnimating);

    if (activeIndex >= totalSlides * 2) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setActiveIndex((prev) => prev - totalSlides);
      }, 700);
      return () => clearTimeout(timer);
    } else if (activeIndex < totalSlides) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setActiveIndex((prev) => prev + totalSlides);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, isAnimating, totalSlides, updatePosition]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => updatePosition(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updatePosition]);

  // Autoplay timer
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2800);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const logicalActive = ((activeIndex - totalSlides) % totalSlides + totalSlides) % totalSlides;

  return (
    <div
      className="feature-area relative min-h-[405px] sm:min-h-[455px] lg:min-h-[555px] pb-6 bg-[url('/bg-fitur.png')] bg-cover bg-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Floating pill label */}
      <div className="feature-label w-max max-w-[calc(100%-32px)] mx-auto -translate-y-[17px] bg-[#E6F2EE] text-[#0c4537] rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base font-medium shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <svg className="w-5 h-5 flex-none text-[#05976A]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
        </svg>
        Apa yang bisa kami bantu untuk Anda?
      </div>

      {/* Cards Viewport */}
      <div
        ref={carouselRef}
        className="carousel w-full max-w-[1098px] mx-auto overflow-hidden py-3 sm:py-4 px-0"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0].screenX;
        }}
        onTouchEnd={(e) => {
          const diff = e.changedTouches[0].screenX - touchStartX.current;
          if (Math.abs(diff) > 40) {
            if (diff < 0) nextSlide();
            else prevSlide();
          }
        }}
      >
        <div
          ref={trackRef}
          className="carousel-track flex items-center w-max will-change-transform"
        >
          {allCards.map((feature, i) => {
            const isActive = i === activeIndex;
            return (
              <article
                key={i}
                onClick={() => {
                  setIsAnimating(true);
                  setActiveIndex(i);
                }}
                className={`feature-card w-[min(250px,calc(100vw-58px))] min-w-[min(250px,calc(100vw-58px))] sm:w-[300px] sm:min-w-[300px] lg:w-[350px] lg:min-w-[350px] mx-2 sm:mx-2.5 p-3 sm:p-4 lg:p-[17px_10px_10px] rounded-[20px] lg:rounded-[22px] bg-white shadow-[0_8px_24px_rgba(20,50,40,0.17)] cursor-pointer transition-[transform,opacity,box-shadow] duration-[680ms] ease-[cubic-bezier(.22,.7,.22,1)] flex flex-col ${
                  isActive
                    ? "scale-100 sm:scale-[1.08] lg:scale-[1.025] opacity-100 z-10 shadow-[0_12px_32px_rgba(20,50,40,0.24)]"
                    : "scale-[0.90] opacity-80 sm:opacity-90 hover:opacity-100 z-1"
                }`}
              >
                <h3 className="text-base sm:text-[18px] lg:text-[21px] font-medium text-[#121517] mb-1 sm:mb-2 line-clamp-1">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-[13px] lg:text-[15px] text-[#46484E] leading-[1.45] lg:leading-[1.5] mb-3 lg:mb-2 min-h-[50px] sm:min-h-[56px] lg:min-h-[66px] line-clamp-3">
                  {feature.desc}
                </p>
                <div className="w-full h-[145px] sm:h-[185px] lg:h-[242px] rounded-xl overflow-hidden bg-neutral-100 mt-auto flex-none">
                  {feature.svgBg}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Indicators */}
      <div className="carousel-indicators flex items-center justify-center gap-1.5 mt-4 sm:mt-5 lg:mt-6">
        {features.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAnimating(true);
              setActiveIndex(totalSlides + i);
            }}
            type="button"
            aria-label={`Tampilkan fitur ${i + 1}`}
            className={`h-[7px] rounded-full transition-all duration-300 ${
              i === logicalActive
                ? "w-8 bg-white opacity-95"
                : "w-[7px] bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
