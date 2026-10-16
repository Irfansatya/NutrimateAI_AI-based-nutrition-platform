"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Rina Pratiwi",
    photo: "https://i.pravatar.cc/500?img=47",
    text: "NutrimateAI membantu saya lebih memahami kebutuhan gizi selama mendampingi tumbuh kembang si kecil.",
  },
  {
    name: "Dinda Lestari",
    photo: "https://i.pravatar.cc/500?img=32",
    text: "Rekomendasi makanannya terasa lebih relevan karena disesuaikan dengan kondisi dan kebutuhan saya.",
  },
  {
    name: "Ayu Maharani",
    photo: "https://i.pravatar.cc/500?img=12",
    text: "Pengingat lewat WhatsApp membuat saya tidak mudah lupa dengan jadwal dan kebutuhan nutrisi harian.",
  },
  {
    name: "Siti Rahma",
    photo: "https://i.pravatar.cc/500?img=44",
    text: "Informasinya ringkas dan mudah dipahami. Saya jadi lebih percaya diri dalam menyiapkan makanan untuk anak.",
  },
  {
    name: "Maya Putri",
    photo: "https://i.pravatar.cc/500?img=5",
    text: "Saya suka karena satu platform menggabungkan pemeriksaan kondisi, rekomendasi, dan pengingat nutrisi.",
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const getStep = useCallback(() => {
    if (!trackRef.current) return 533; // fallback 515 + 18
    const firstCard = trackRef.current.children[0] as HTMLElement;
    if (!firstCard) return 533;
    const gap = parseFloat(window.getComputedStyle(trackRef.current).gap) || 18;
    return firstCard.getBoundingClientRect().width + gap;
  }, []);

  const updatePosition = useCallback((index: number, animate = true) => {
    if (!viewportRef.current || !trackRef.current) return;
    const step = getStep();
    const visibleCount = Math.max(1, Math.floor(viewportRef.current.clientWidth / step));
    const maxIndex = Math.max(0, testimonials.length - visibleCount);
    const clampedIndex = Math.min(index, maxIndex);

    const offset = clampedIndex * step;
    trackRef.current.style.transition = animate ? "transform .65s cubic-bezier(.2,.75,.2,1)" : "none";
    trackRef.current.style.transform = `translateX(-${offset}px)`;
  }, [getStep]);

  const handleNext = useCallback(() => {
    if (!viewportRef.current) return;
    const step = getStep();
    const visibleCount = Math.max(1, Math.floor(viewportRef.current.clientWidth / step));
    const maxIndex = Math.max(0, testimonials.length - visibleCount);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [getStep]);

  const handlePrev = useCallback(() => {
    if (!viewportRef.current) return;
    const step = getStep();
    const visibleCount = Math.max(1, Math.floor(viewportRef.current.clientWidth / step));
    const maxIndex = Math.max(0, testimonials.length - visibleCount);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [getStep]);

  useEffect(() => {
    updatePosition(currentIndex, true);
  }, [currentIndex, updatePosition]);

  useEffect(() => {
    const handleResize = () => updatePosition(currentIndex, false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex, updatePosition]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4200);

    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  return (
    <div
      className="testimonial-container relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Testimonials Viewport */}
      <div ref={viewportRef} className="testimonial-viewport overflow-hidden relative">
        <div
          ref={trackRef}
          className="testimonial-track flex gap-[18px] w-max will-change-transform"
        >
          {testimonials.map((item, i) => (
            <article
              key={i}
              className="testimonial-card w-[min(86vw,440px)] sm:w-[515px] min-h-[275px] sm:min-h-[322px] border border-[#e0e4e2] rounded-[17px] bg-white p-[11px] sm:p-[14px] grid grid-cols-[145px_1fr] sm:grid-cols-[205px_1fr] gap-[13px] sm:gap-[18px] shadow-[0_3px_10px_rgba(0,0,0,0.025)] shrink-0"
            >
              {/* Photo */}
              <div className="testimonial-photo relative overflow-hidden rounded-[11px] min-h-[250px] sm:min-h-[292px] bg-[#e8eeeb]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photo}
                  alt={`Foto pengguna ${item.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                <div className="absolute left-[11px] sm:left-[13px] bottom-[12px] sm:bottom-[14px] z-10 w-[108px] sm:w-[110px] max-w-[72%]">
                  <Image
                    src="/logo_NutrimateAI_putih.svg"
                    alt="NutrimateAI"
                    width={110}
                    height={26}
                    className="w-full h-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.22)]"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="testimonial-content flex flex-col justify-between p-[6px_5px_5px_0] min-w-0">
                <div>
                  <div className="quote-mark text-[44px] sm:text-[52px] leading-[0.7] font-bold text-[#111] mb-[10px] sm:mb-[15px] select-none">
                    “
                  </div>
                  <p className="testimonial-text text-base sm:text-[19px] leading-[1.35] tracking-[-0.35px] text-[#121517] m-0 font-normal">
                    {item.text}
                  </p>
                </div>

                <div className="testimonial-meta mt-auto pt-[18px] flex flex-col items-start justify-end gap-1">
                  <strong className="testimonial-name text-[15px] sm:text-[16px] leading-[1.1] font-semibold tracking-[0.1px] text-[#111] uppercase">
                    {item.name}
                  </strong>
                  <span className="stars text-sm sm:text-[17px] leading-none tracking-[1px] text-[#4b504e] select-none" aria-label="5 dari 5 bintang">
                    ★★★★★
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Controls: Dots and Arrows */}
      <div className="testimonial-controls flex items-center justify-between mt-[34px]">
        <div className="testimonial-dots flex items-center gap-1.5" aria-label="Indikator ulasan">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Tampilkan ulasan ${i + 1}`}
              className={`h-[6px] border-0 p-0 rounded-full cursor-pointer transition-[width,background-color] duration-200 ${
                i === currentIndex
                  ? "w-[26px] bg-[#1b1e1d]"
                  : "w-[6px] bg-[#d9dddb] hover:bg-[#bfc4c1]"
              }`}
            />
          ))}
        </div>

        <div className="testimonial-arrows flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Ulasan sebelumnya"
            className="testimonial-arrow w-[42px] h-[42px] border border-[#dfe4e2] rounded-[11px] bg-white text-[#1a1d1c] grid place-items-center cursor-pointer hover:border-[#bfc8c4] hover:bg-[#f7f9f8] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
              <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Ulasan berikutnya"
            className="testimonial-arrow w-[42px] h-[42px] border border-[#dfe4e2] rounded-[11px] bg-white text-[#1a1d1c] grid place-items-center cursor-pointer hover:border-[#bfc8c4] hover:bg-[#f7f9f8] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
              <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
