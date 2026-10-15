"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sari Rahayu",
    role: "Ibu Hamil (Trimester 2) · Surabaya",
    text: "NutrimateAI membantu saya memahami kebutuhan nutrisi selama kehamilan dengan cara yang sangat praktis. Anggaran pangan keluarga kami tetap aman dan terukur.",
    avatarBg: "from-[#d4edd2] to-[#80c8a6]",
    initials: "SR",
  },
  {
    name: "Dewi Lestari",
    role: "Ibu Anak 14 Bulan · Semarang",
    text: "Rekomendasi menu hariannya sangat bervariasi dan ramah di kantong. Saya tidak perlu bingung lagi memikirkan kebutuhan zat besi dan protein si kecil.",
    avatarBg: "from-[#fae5c6] to-[#f4b56c]",
    initials: "DL",
  },
  {
    name: "Rina Kusuma",
    role: "Ibu Menyusui · Yogyakarta",
    text: "Pengingat hariannya langsung ke WhatsApp sangat membantu kesibukan saya sehari-hari. Saya jadi lebih teratur menjaga kualitas ASI untuk bayi.",
    avatarBg: "from-[#cfe6f4] to-[#7eb7de]",
    initials: "RK",
  },
  {
    name: "Ayu Wulandari",
    role: "Penerima Manfaat NutriHelp · Demak",
    text: "Melalui fitur bantuan donasi, keluarga kami merasa sangat didukung saat masa-masa sulit. Anak kami tetap bisa mendapatkan makanan bergizi untuk tumbuh kembangnya.",
    avatarBg: "from-[#edd6f7] to-[#b673d4]",
    initials: "AW",
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div
      className="testimonial-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cards Viewport */}
      <div className="overflow-hidden">
        <div
          className="flex gap-5 transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((item, i) => (
            <div key={i} className="w-full shrink-0">
              <div className="testimonial-card w-full max-w-[720px] mx-auto min-h-[300px] border border-[#e0e4e2] rounded-2xl bg-white p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-[190px_1fr] gap-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
                {/* Photo / Avatar Box */}
                <div
                  className={`testimonial-photo relative overflow-hidden rounded-xl min-h-[180px] sm:min-h-[240px] bg-gradient-to-br ${item.avatarBg} flex flex-col justify-between p-4`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center font-bold text-neutral-800 text-base shadow-sm">
                    {item.initials}
                  </div>

                  <div className="relative z-10 pt-4">
                    <Image
                      src="/logo_NutrimateAI_putih.svg"
                      alt="NutrimateAI"
                      width={100}
                      height={24}
                      className="w-[90px] h-auto object-contain drop-shadow"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="testimonial-content flex flex-col justify-between py-1">
                  <div>
                    <span className="quote-mark text-4xl sm:text-5xl font-serif text-[#05976A] leading-none select-none">
                      “
                    </span>
                    <p className="text-base sm:text-lg text-[#151817] leading-relaxed -mt-2 mb-4 font-normal">
                      {item.text}
                    </p>
                  </div>

                  <div className="testimonial-meta pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#111] uppercase tracking-wide">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#707773] mt-0.5">{item.role}</p>
                    </div>

                    <div className="stars text-amber-500 text-sm tracking-widest" aria-label="Rating 5 bintang">
                      ★★★★★
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls: Dots and Arrows */}
      <div className="testimonial-controls flex items-center justify-between max-w-[720px] mx-auto mt-6 px-2">
        <div className="testimonial-dots flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Tampilkan ulasan ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-7 bg-[#1b1e1d]"
                  : "w-2 bg-[#d9dddb] hover:bg-[#bfc4c1]"
              }`}
            />
          ))}
        </div>

        <div className="testimonial-arrows flex items-center gap-2.5">
          <button
            onClick={handlePrev}
            aria-label="Ulasan sebelumnya"
            className="w-10 h-10 rounded-xl border border-[#dfe4e2] bg-white text-[#1a1d1c] flex items-center justify-center hover:bg-neutral-50 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            aria-label="Ulasan berikutnya"
            className="w-10 h-10 rounded-xl border border-[#dfe4e2] bg-white text-[#1a1d1c] flex items-center justify-center hover:bg-neutral-50 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
