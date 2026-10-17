"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import PingPongVideo from "@/component/PingPongVideo";

const features = [
  {
    title: "Analisis Kondisi Anda",
    desc: "Kami pahami kondisi ekonomi, kesehatan, dan lingkungan anda dahulu agar rekomendasi menu bisa lebih tepat.",
    image: "/GambarFitur1.png",
  },
  {
    title: "Susun Asupan Nutrisi",
    desc: "Tak perlu bingung memikirkan menu setiap hari. Kami susun rencana gizi bulanan yang terjangkau dan sesuai.",
    image: "/GambarFitur2.png",
  },
  {
    title: "Pantau Perkembangan",
    desc: "Catat berat dan tinggi si kecil tiap bulan, lihat perkembangannya, dan menu gizinya akan ikut disesuaikan.",
    image: "/GambarFitur3.png",
  },
  {
    title: "Ingatkan Anda Tiap Hari",
    desc: "Tak perlu bolak-balik membuka website. Kami ingatkan kebutuhan gizi si kecil lewat WhatsApp setiap hari.",
    image: "/GambarFitur4.png",
  },
  {
    title: "Galang Donasi Gizi",
    desc: "Dana belum cukup untuk gizi buah hati? Ceritakan kebutuhan Anda, dan biarkan masyarakat ikut membantu.",
    image: "/GambarFitur5.png",
  },
  {
    title: "Salurkan Bantuan Gizi",
    desc: "Bantuan anda akan sampai langsung ke ibu dan anak yang membutuhkan, menjadi sepiring gizi untuk tumbuh sehat.",
    image: "/GambarFitur6.png",
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
      className="feature-area relative isolate min-h-[405px] sm:min-h-[455px] lg:min-h-[555px] pb-6 bg-[#173e30] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background video (ping-pong, slow, blurred) */}
      <div className="feature-bg absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <PingPongVideo
          src="/videos/video-background.mp4"
          poster="/bg-fitur.png"
          playbackRate={0.5}
          className="absolute inset-0 w-full h-full object-cover blur-[3px] scale-[1.06] will-change-transform"
        />
        <div className="absolute -inset-2.5 bg-[linear-gradient(110deg,rgba(3,30,18,0.8),rgba(0,69,46,0.38)_48%,rgba(15,91,90,0.35)),rgba(255,255,255,0.12)] backdrop-blur-[14px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_5%_0%,rgba(9,180,132,0.25),transparent_35%),linear-gradient(0deg,rgba(0,24,13,0.23),transparent_48%)]" />
      </div>

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
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={700}
                    height={484}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
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