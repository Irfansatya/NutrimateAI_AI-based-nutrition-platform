"use client";

import React, { useEffect, useState } from "react";

interface TypewriterSubtitleProps {
  /** Daftar teks yang tampil bergantian (infinite). */
  texts: string[];
  /** Kecepatan mengetik per karakter (ms). */
  typeSpeed?: number;
  /** Lama teks diam setelah selesai diketik (ms). */
  holdMs?: number;
}

/**
 * Subheadline dengan Typewriter Effect:
 * ketik teks -> diam (holdMs) -> teks hilang -> teks berikutnya diketik -> ... (loop).
 * Cursor selalu tampil, baik saat mengetik (solid) maupun saat diam (berkedip).
 */
export default function TypewriterSubtitle({
  texts,
  typeSpeed = 45,
  holdMs = 5000,
}: TypewriterSubtitleProps) {
  const [idx, setIdx] = useState(0);
  const [len, setLen] = useState(0);

  const full = texts[idx] ?? "";
  const typing = len < full.length;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (len < full.length) {
      timer = setTimeout(() => setLen((l) => l + 1), typeSpeed);
    } else {
      timer = setTimeout(() => {
        setIdx((i) => (i + 1) % texts.length);
        setLen(0);
      }, holdMs);
    }
    return () => clearTimeout(timer);
  }, [len, full, texts.length, typeSpeed, holdMs]);

  // Teks terpanjang dipakai sebagai "ghost" agar tinggi blok tidak melompat
  const longest = texts.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <p className="db-hero-sub db-tw">
      <span className="db-tw-ghost" aria-hidden="true">
        {longest}
      </span>
      <span className="db-tw-live" aria-hidden="true">
        {full.slice(0, len)}
        <span className={`db-tw-cursor${typing ? " typing" : ""}`} />
      </span>
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {full}
      </span>
    </p>
  );
}