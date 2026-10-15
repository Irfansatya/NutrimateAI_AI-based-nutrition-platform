"use client";

import React, { useState, useEffect, useRef } from "react";

const features = [
  {
    title: "Analisis Kondisi Anda",
    desc: "Kami pahami kondisi ekonomi, kesehatan, dan lingkungan anda dahulu agar rekomendasi menu bisa lebih tepat.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover rounded-xl">
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
        <circle cx="585" cy="356" r="34" fill="#fff" />
        <path d="M566 356l13 13 27-30" fill="none" stroke="#2a9b72" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Susun Asupan Nutrisi",
    desc: "Tak perlu bingung memikirkan menu setiap hari. Kami susun rencana gizi bulanan yang terjangkau dan sesuai.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover rounded-xl">
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
      </svg>
    ),
  },
  {
    title: "Pantau Perkembangan",
    desc: "Catat berat dan tinggi si kecil tiap bulan, lihat perkembangannya, dan menu gizinya akan ikut disesuaikan.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover rounded-xl">
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
        <rect x="438" y="246" width="88" height="64" fill="#f1d98e" rx="12" />
        <path d="M454 278h56" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Ingatkan Anda Tiap Hari",
    desc: "Tak perlu bolak-balik membuka website. Kami ingatkan kebutuhan gizi si kecil lewat WhatsApp setiap hari.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover rounded-xl">
        <defs>
          <linearGradient id="g4" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#e8f7f1" />
            <stop offset="1" stopColor="#c7eadc" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g4)" />
        <rect x="200" y="100" width="400" height="260" rx="24" fill="#fff" />
        <rect x="240" y="140" width="320" height="60" rx="16" fill="#DCF8C6" />
        <path d="M260 170h180M260 185h120" stroke="#07543f" strokeWidth="8" strokeLinecap="round" />
        <rect x="240" y="220" width="260" height="40" rx="12" fill="#f0f4f2" />
        <path d="M260 240h150" stroke="#72b98d" strokeWidth="6" strokeLinecap="round" />
        <circle cx="580" cy="120" r="32" fill="#25D366" />
        <path d="M570 120h20M580 110v20" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Galang Donasi Gizi",
    desc: "Dana belum cukup untuk gizi buah hati? Ceritakan kebutuhan Anda, dan biarkan masyarakat ikut membantu.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover rounded-xl">
        <defs>
          <linearGradient id="g5" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#eef9f5" />
            <stop offset="1" stopColor="#d5eee4" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g5)" />
        <circle cx="400" cy="220" r="130" fill="#fff" />
        <path d="M400 270c-40-35-70-65-70-95a45 45 0 0 1 70-38 45 45 0 0 1 70 38c0 30-30 60-70 95Z" fill="#e77b62" />
        <rect x="220" y="320" width="360" height="18" rx="9" fill="#fff" />
        <rect x="220" y="320" width="240" height="18" rx="9" fill="#05976A" />
      </svg>
    ),
  },
  {
    title: "Salurkan Bantuan Gizi",
    desc: "Bantuan anda akan sampai langsung ke ibu dan anak yang membutuhkan, menjadi sepiring gizi untuk tumbuh sehat.",
    svgBg: (
      <svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover rounded-xl">
        <defs>
          <linearGradient id="g6" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#eaf7f2" />
            <stop offset="1" stopColor="#d2eae1" />
          </linearGradient>
        </defs>
        <rect width="800" height="460" rx="28" fill="url(#g6)" />
        <circle cx="400" cy="230" r="140" fill="#fff" />
        <circle cx="400" cy="230" r="100" fill="#f4ebd0" />
        <path d="M400 230l60-40a100 100 0 0 1 30 70Z" fill="#05976A" />
        <path d="M400 230l90 30a100 100 0 0 1-70 70Z" fill="#e9b45b" />
        <path d="M400 230l20 100a100 100 0 0 1-100-30Z" fill="#e77b62" />
        <path d="M400 230l-80 70a100 100 0 0 1-20-100Z" fill="#72b98d" />
      </svg>
    ),
  },
];

export default function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].screenX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        setActiveIndex((prev) => (prev + 1) % features.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
      }
    }
  };

  return (
    <div
      className="feature-area relative min-h-[460px] lg:min-h-[550px] pb-8 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url('/bg-fitur.png')` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Label Badge */}
      <div className="flex justify-center pt-8 sm:pt-10 mb-6">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-neutral-100 text-xs sm:text-sm font-semibold text-[#151817]">
          <span className="w-2 h-2 rounded-full bg-[#05976A]" />
          Apa yang bisa kami bantu untuk Anda?
        </div>
      </div>

      {/* Cards Viewport */}
      <div className="carousel max-w-[1140px] mx-auto px-4 overflow-hidden py-4">
        <div
          className="carousel-track flex items-center justify-center gap-4 sm:gap-6 transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(calc(50% - ${(activeIndex * 320) + 160}px))`,
          }}
        >
          {features.map((feature, i) => {
            const isActive = i === activeIndex;
            return (
              <article
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`feature-card w-[290px] sm:w-[320px] lg:w-[350px] h-[370px] sm:h-[405px] p-4 bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_24px_rgba(20,50,40,0.14)] cursor-pointer shrink-0 transition-all duration-700 flex flex-col ${
                  isActive
                    ? "scale-100 lg:scale-105 z-10 shadow-[0_16px_36px_rgba(20,50,40,0.22)]"
                    : "scale-90 opacity-75 hover:opacity-90"
                }`}
              >
                <h3 className="text-lg sm:text-xl font-semibold text-[#151817] mb-1.5 line-clamp-1">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-[13.5px] text-[#46484E] leading-relaxed mb-3 line-clamp-3 min-h-[54px]">
                  {feature.desc}
                </p>
                <div className="mt-auto h-[190px] sm:h-[230px] rounded-xl overflow-hidden bg-neutral-100">
                  {feature.svgBg}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Indicators */}
      <div className="carousel-indicators flex items-center justify-center gap-2 mt-6">
        {features.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Tampilkan fitur ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-8 bg-[#05976A]"
                : "w-2 bg-neutral-300 hover:bg-neutral-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
