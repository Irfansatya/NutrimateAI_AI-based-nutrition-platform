"use client";

import React, { useEffect, useRef } from "react";

interface PingPongVideoProps {
  src: string;
  poster?: string;
  /** 1 = normal speed, 0.5 = half speed */
  playbackRate?: number;
  className?: string;
}

/**
 * Background video: otomatis diputar, diperlambat, dan saat mencapai akhir
 * diputar mundur sampai awal, lalu maju lagi (infinite). Tanpa kontrol apa pun.
 *
 * Putar mundur dilakukan dengan menggeser currentTime tiap frame. Seek baru
 * hanya dikirim setelah seek sebelumnya selesai ("seeked"), supaya browser
 * tidak menumpuk antrean seek dan gambar tidak patah-patah.
 */
export default function PingPongVideo({
  src,
  poster,
  playbackRate = 0.5,
  className = "",
}: PingPongVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;
    let lastTs = 0;
    let pos = 0; // posisi (detik) saat memutar mundur
    let reversing = false;
    let seeking = false;
    let cancelled = false;

    const playForward = () => {
      reversing = false;
      cancelAnimationFrame(rafId);
      video.playbackRate = playbackRate;
      video.play().catch(() => {});
    };

    const reverseStep = (ts: number) => {
      if (cancelled || !reversing) return;
      if (!lastTs) lastTs = ts;
      const delta = (ts - lastTs) / 1000;
      lastTs = ts;

      // Waktu tetap berjalan walau seek sebelumnya belum selesai,
      // sehingga kecepatan mundur sama dengan kecepatan maju.
      pos -= delta * playbackRate;

      if (pos <= 0.03) {
        video.currentTime = 0;
        playForward();
        return;
      }

      if (!seeking) {
        seeking = true;
        video.currentTime = pos;
      }
      rafId = requestAnimationFrame(reverseStep);
    };

    const startReverse = () => {
      if (reversing || cancelled) return;
      reversing = true;
      lastTs = 0;
      pos = video.currentTime;
      video.pause();
      rafId = requestAnimationFrame(reverseStep);
    };

    const handleSeeked = () => {
      seeking = false;
    };

    const handleEnded = () => startReverse();

    const handleTimeUpdate = () => {
      // Antisipasi: mulai mundur sedikit sebelum benar-benar habis
      if (
        !reversing &&
        video.duration &&
        video.currentTime >= video.duration - 0.05
      ) {
        startReverse();
      }
    };

    video.muted = true;
    video.loop = false;
    video.playbackRate = playbackRate;
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reduceMotion) playForward();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [playbackRate]);

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      controls={false}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}