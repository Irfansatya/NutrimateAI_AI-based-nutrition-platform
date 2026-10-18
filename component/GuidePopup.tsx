"use client";

/* ================= PANDUAN PENGGUNAAN (popup) =================
   Komponen tunggal yang dipakai oleh landing page DAN halaman role User,
   sehingga tampilan dan isinya selalu sama.
   Satu halaman per fitur: ilustrasi, langkah singkat, dan satu tips.
   Ilustrasi berupa SVG, jadi tetap tajam di semua ukuran layar. */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./guide-popup.css";

/* ---------- Ikon ---------- */
const GX_IC: Record<string, string> = {
  chk: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 8v8 M8 12h8",
  cal: "M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4 M8 14h2 M12 14h2 M16 14h2",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  trend: "M4 19V5 M4 19h16 M7 15l4-4 3 3 5-6",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z",
  wallet: "M4 7h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z M4 7V6a1 1 0 0 1 1-1h11 M16 13.5h2",
  asst: "M3 14h4v6H3z M7 15l5 1 5-3a1.5 1.5 0 0 1 2 2l-5 4H7 M12 4.5a2 2 0 0 1 3 0 2 2 0 0 1 0 3l-3 3-3-3a2 2 0 0 1 3-3z",
  usr: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6",
  inf: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01",
};

function GxIcon({ name }: { name: string }) {
  const path = GX_IC[name] ?? "";
  return (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      {path.split(" M").map((seg, k) => (
        <path key={k} d={k === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

/* ---------- Ilustrasi SVG per fitur ---------- */
type S = string | number;

const GX = (() => {
  const R = (x: number, y: number, w: number, h: number, f = "#fff", s: string | null = "#E3E6EC", rx = 10, e = "") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${s ? ` stroke="${s}"` : ""} ${e}/>`;
  const B = (x: number, y: number, w: number, c = "#E3E6EC", h = 6) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${c}"/>`;
  const T = (x: number, y: number, s: S, z = 11, c = "#121517", w = 500, a = "start") =>
    `<text x="${x}" y="${y}" font-size="${z}" fill="${c}" font-weight="${w}" text-anchor="${a}">${s}</text>`;
  const N = (x: number, y: number, k: S) =>
    `<circle cx="${x}" cy="${y}" r="11" fill="#05976A" stroke="#fff" stroke-width="2.5"/><text x="${x}" y="${y + 4}" font-size="11.5" font-weight="700" fill="#fff" text-anchor="middle">${k}</text>`;
  const C = (x: number, y: number, r: number, f: string, s = "", sw = 1.5) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${s ? ` stroke="${s}" stroke-width="${sw}"` : ""}/>`;
  const P = (d: string, s = "#05976A", w = 2, f = "none") =>
    `<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const G = "#05976A";
  const GL = "#E9F6F1";
  const W = (inner: string) =>
    `<svg viewBox="0 0 480 300" role="img" xmlns="http://www.w3.org/2000/svg" font-family="'Google Sans Flex',system-ui,sans-serif"><defs><linearGradient id="gxbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAF6F0"/><stop offset="1" stop-color="#F8FAF2"/></linearGradient><linearGradient id="gxgr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A7A4F"/><stop offset="1" stop-color="#032C1D"/></linearGradient></defs><rect width="480" height="300" fill="url(#gxbg)"/>${inner}</svg>`;
  const win = R(22, 18, 436, 264, "#fff", "#E3E6EC", 16);
  const tabs = (on: number) => {
    const L: [string, number, number][] = [
      ["Ajukan Open Donasi", 40, 128],
      ["Open Donasi Saya", 174, 112],
      ["NutriWallet", 292, 84],
    ];
    return (
      R(34, 30, 352, 34, "#F2F4F9", null, 17) +
      L.map(
        (l, i) =>
          (i == on ? R(l[1] - 4, 33, l[2] + 2, 28, G, null, 14) : "") +
          T(l[1] + l[2] / 2 - 3, 51, l[0], 10.5, i == on ? "#fff" : "#505257", i == on ? 600 : 500, "middle")
      ).join("")
    );
  };

  const check = () => {
    const tiles = ([["Ibu hamil", 40, 1], ["Ibu menyusui", 176, 0], ["Anak 6–24 bln", 312, 0]] as [string, number, number][])
      .map(
        (t) =>
          R(t[1], 54, 128, 42, t[2] ? GL : "#fff", t[2] ? G : "#E3E6EC", 10) +
          T(t[1] + 12, 79, t[0], 11.5, "#121517", 500) +
          (t[2] ? C(t[1] + 112, 75, 7, "#fff", G, 4.5) : C(t[1] + 112, 75, 7, "#fff", "#D5DBD8", 1.3))
      )
      .join("");
    const pills = ["Data Bunda", "Kesehatan", "Ekonomi", "Lingkungan", "Pola Makan"]
      .map((p, i) => {
        const x = 40 + i * 81;
        return (
          R(x, 108, 75, 20, i == 0 ? GL : "#fff", i == 0 ? G : "#E3E6EC", 10) +
          T(x + 37.5, 121.5, p, 9.5, i == 0 ? "#04684A" : "#8a9390", i == 0 ? 600 : 400, "middle")
        );
      })
      .join("");
    const f = (x: number, y: number, l: number, u?: string) =>
      B(x, y, l, "#C9CFCC", 5) + R(x, y + 10, 192, 28, "#F7F8FA", "#E3E6EC", 8) + (u ? T(x + 182, y + 29, u, 10, "#8a9390", 400, "end") : "");
    return W(
      win +
        T(40, 44, "Pilih kategori Anda", 12.5, "#121517", 600) +
        tiles +
        pills +
        R(40, 138, 400, 5, "#EEF0F4", null, 2.5) +
        R(40, 138, 80, 5, G, null, 2.5) +
        f(40, 156, 56, "tahun") +
        f(248, 156, 70, "minggu") +
        f(40, 200, 66, "kg") +
        f(248, 200, 58, "cm") +
        R(40, 248, 80, 26, "#fff", "#E3E6EC", 13) +
        T(80, 265, "Kembali", 10.5, "#505257", 500, "middle") +
        R(298, 248, 142, 26, G, null, 13) +
        T(369, 265, "Buat Rekomendasi", 10.5, "#fff", 600, "middle") +
        N(166, 54, 1) +
        N(440, 168, 2) +
        N(438, 248, 3)
    );
  };

  const plan = () => {
    let cal = "";
    const names = ["S", "S", "R", "K", "J", "S", "M"];
    names.forEach((n, i) => (cal += T(54 + i * 21, 86, n, 9, "#8a9390", 500, "middle")));
    for (let i = 0; i < 35; i++) {
      const cx = 54 + (i % 7) * 21,
        cy = 106 + Math.floor(i / 7) * 22;
      if (i == 10) cal += C(cx, cy, 10, G) + T(cx, cy + 4, i - 2, 10, "#fff", 600, "middle");
      else if (i >= 3 && i < 33) cal += C(cx, cy, 9, "#fff", "#CFE8DD", 1) + T(cx, cy + 3.5, i - 2, 8.5, "#505257", 400, "middle");
      else cal += C(cx, cy, 2.5, "#D5DBD8");
    }
    const meal = (y: number, nm: string, a: [string, string], b: [string, string], more?: number) =>
      R(222, y, 220, 64, "#fff", "#E3E6EC", 12) +
      R(234, y + 9, nm.length * 5.4 + 14, 16, GL, null, 8) +
      T(241, y + 20.5, nm, 9.5, "#04684A", 600) +
      T(234, y + 41, a[0], 10.5) +
      T(430, y + 41, a[1], 10.5, "#505257", 400, "end") +
      T(234, y + 55, b[0], 10.5) +
      T(430, y + 55, b[1], 10.5, "#505257", 400, "end") +
      (more ? T(432, y + 20.5, "Lihat gizi &amp; manfaat ▾", 9, G, 600, "end") : "");
    return W(
      win +
        R(36, 34, 168, 230, "#F7F8FA", "#E3E6EC", 12) +
        T(52, 58, "Oktober 2026", 11.5, "#121517", 600) +
        T(190, 58, "‹  ›", 13, "#8a9390", 500, "end") +
        cal +
        B(52, 230, 70, "#C9CFCC", 5) +
        T(52, 251, "Rp25.000 / hari", 11, "#121517", 600) +
        T(222, 50, "Rabu, 14 Oktober 2026", 12.5, "#121517", 600) +
        meal(60, "Sarapan", ["Nasi putih", "100 g"], ["Telur ayam", "1 butir"], 1) +
        meal(130, "Makan siang", ["Ikan lele", "1 potong"], ["Bayam", "100 g"]) +
        meal(200, "Makan malam", ["Tempe", "2 potong"], ["Pisang", "1 buah"]) +
        N(132, 114, 1) +
        N(448, 150, 2) +
        N(448, 80, 3)
    );
  };

  const daily = () => {
    const bub = (y: number) =>
      R(332, y, 96, 58, "#fff", null, 9) +
      T(340, y + 16, "Selamat pagi, Bunda!", 8, "#121517", 600) +
      B(340, y + 24, 80, "#D5DBD8", 4) +
      B(340, y + 33, 72, "#D5DBD8", 4) +
      B(340, y + 42, 56, "#D5DBD8", 4);
    return W(
      R(34, 24, 176, 26, G, null, 13) +
        T(122, 41, "Setuju &amp; Aktifkan WhatsApp", 10, "#fff", 600, "middle") +
        R(34, 62, 228, 204, "#fff", "#E3E6EC", 14) +
        T(50, 88, "Aktifkan NutriDaily", 13, "#121517", 600) +
        T(50, 111, "Nomor WhatsApp terdaftar", 9.5, "#505257", 500) +
        R(50, 117, 196, 28, "#F7F8FA", "#E3E6EC", 8) +
        T(60, 135.5, "+62 812-3456-7890", 11) +
        R(50, 155, 196, 44, "#E7F7EE", "#BFE4D7", 9) +
        T(60, 172, "Selamat pagi, Bunda! Rekomendasi", 9, "#04684A", 400) +
        T(60, 185, "bahan pangan hari ini…", 9, "#04684A", 400) +
        R(50, 216, 86, 28, "#fff", "#E3E6EC", 14) +
        T(93, 234, "Batal", 11, "#505257", 500, "middle") +
        R(144, 216, 102, 28, G, null, 14) +
        T(195, 234, "Aktifkan", 11, "#fff", 600, "middle") +
        P("M270 150h34 M297 143l8 7-8 7", "#9bd3bd", 2) +
        R(316, 26, 132, 248, "#1a1f1d", null, 24) +
        R(322, 34, 120, 232, "#EFEAE2", null, 18) +
        R(322, 34, 120, 30, "#0A7A4F", null, 18) +
        R(322, 50, 120, 14, "#0A7A4F", null, 0) +
        C(338, 49, 8, "#fff") +
        T(352, 53, "NutrimateAI", 9.5, "#fff", 600) +
        bub(76) +
        B(380, 150, 48, "#D5DBD8", 4) +
        N(240, 38, 1) +
        N(250, 131, 2) +
        N(244, 216, 3)
    );
  };

  const growth = () => {
    const xs = [64, 124, 184, 244, 304, 364, 424],
      med = [226, 214, 200, 190, 176, 166, 158],
      usr = [222, 216, 198, 192, 172, 168, 150];
    const up = xs.map((x, i) => `${x} ${med[i] - 22}`),
      lo = xs.map((x, i) => `${x} ${med[i] + 20}`).reverse();
    let grid = "";
    [132, 162, 192, 222, 252].forEach(
      (y) => (grid += `<line x1="52" y1="${y}" x2="436" y2="${y}" stroke="#EEF1EF" stroke-width="1"/>`)
    );
    const line = P("M" + xs.map((x, i) => `${x} ${usr[i]}`).join(" L"), G, 2.4);
    const dots = xs.slice(0, 6).map((x, i) => C(x, usr[i], 3.6, "#fff", G, 2)).join("") + C(424, 150, 6, G, "#fff", 2.5);
    return W(
      win +
        R(34, 30, 236, 34, "#F2F4F9", null, 17) +
        T(74, 51, "Isi Data", 10.5, "#505257", 500, "middle") +
        R(112, 33, 154, 28, "#fff", "#E3E6EC", 14) +
        T(189, 51, "Perkembangan Kondisi", 10.5, "#121517", 600, "middle") +
        R(40, 76, 86, 24, GL, G, 12) +
        T(83, 92, "Berat badan", 10, "#04684A", 600, "middle") +
        R(134, 76, 88, 24, "#fff", "#E3E6EC", 12) +
        T(178, 92, "Tinggi badan", 10, "#505257", 500, "middle") +
        R(40, 112, 400, 158, "#fff", "#EEF1EF", 12) +
        grid +
        `<path d="M${up.join(" L")} L${lo.join(" L")} Z" fill="${G}" fill-opacity=".14"/>` +
        P("M" + xs.map((x, i) => `${x} ${med[i]}`).join(" L"), "#0A7A4F", 1.4).replace(
          "stroke-linecap",
          'stroke-dasharray="5 4" opacity=".75" stroke-linecap'
        ) +
        line +
        dots +
        R(376, 118, 60, 22, "#121517", null, 11) +
        T(406, 133, "Bulan ini", 9.5, "#fff", 600, "middle") +
        ["Bln 1", "Bln 3", "Bln 5", "Bln 7"].map((l, i) => T(64 + i * 120, 266, l, 9, "#8a9390", 400, "middle")).join("") +
        N(266, 34, 1) +
        N(300, 176, 2) +
        N(100, 33, 3)
    );
  };

  const help = () =>
    W(
      win +
        tabs(0) +
        R(34, 76, 412, 194, "#fff", "#EEF1EF", 12) +
        [0, 1, 2, 3]
          .map(
            (i) =>
              C(60 + i * 64, 94, 6, i == 0 ? G : "#fff", i == 0 ? G : "#D5DBD8", 1.5) +
              (i < 3 ? `<line x1="${68 + i * 64}" y1="94" x2="${116 + i * 64}" y2="94" stroke="#E3E6EC" stroke-width="2"/>` : "")
          )
          .join("") +
        B(48, 112, 60, "#C9CFCC", 5) +
        R(48, 122, 190, 26, "#F7F8FA", "#E3E6EC", 8) +
        B(48, 158, 86, "#C9CFCC", 5) +
        R(48, 168, 190, 62, "#F7F8FA", "#E3E6EC", 8) +
        B(58, 180, 160, "#D5DBD8", 4) +
        B(58, 191, 132, "#D5DBD8", 4) +
        B(58, 202, 100, "#D5DBD8", 4) +
        B(258, 112, 96, "#C9CFCC", 5) +
        [122, 152]
          .map(
            (y) =>
              R(258, y, 76, 26, "#F7F8FA", "#E3E6EC", 8) +
              R(340, y, 48, 26, "#F7F8FA", "#E3E6EC", 8) +
              R(394, y, 44, 26, "#F7F8FA", "#E3E6EC", 8) +
              T(404, y + 17, "Rp", 9.5, "#8a9390", 400)
          )
          .join("") +
        R(258, 186, 180, 44, "#F7FBF9", "#9bd3bd", 10, 'stroke-dasharray="4 3"') +
        P("M282 214v-12m-6 5l6-6 6 6", "#05976A", 1.8) +
        T(298, 206, "Unggah dokumen", 10, "#04684A", 600) +
        T(298, 219, "JPG, PNG, atau PDF", 8.5, "#8a9390", 400) +
        R(48, 240, 12, 12, "#fff", "#C9CFCC", 3) +
        T(66, 250, "Saya menyetujui pernyataan", 9.5, "#505257", 400) +
        R(346, 240, 92, 24, G, null, 12) +
        T(392, 256, "Kirim", 10.5, "#fff", 600, "middle") +
        N(166, 34, 1) +
        N(238, 118, 2) +
        N(436, 242, 3)
    );

  const wallet = () => {
    const tx = (y: number, a: string) =>
      C(268, y + 9, 9, GL) +
      P(`M268 ${y + 4}v10m-4 -4l4 4 4 -4`, G, 1.6) +
      B(284, y + 4, 54, "#C9CFCC", 5) +
      B(284, y + 14, 36, "#E3E6EC", 4) +
      T(426, y + 14, a, 10.5, G, 600, "end");
    return W(
      win +
        tabs(2) +
        R(40, 78, 196, 98, "url(#gxgr)", null, 14) +
        T(54, 100, "Saldo NutriWallet", 10, "#BFE4D7", 400) +
        T(54, 126, "Rp 750.000", 22, "#fff", 700) +
        R(54, 140, 94, 24, "#fff", null, 12) +
        T(101, 156, "Cairkan dana", 10, "#0A7A4F", 600, "middle") +
        R(40, 186, 196, 80, "#fff", "#E3E6EC", 14) +
        T(54, 206, "Open donasi Anda berjalan", 10.5, "#121517", 600) +
        R(54, 214, 64, 16, GL, null, 8) +
        T(86, 225.5, "Disetujui", 9, "#04684A", 600, "middle") +
        R(54, 242, 168, 6, "#EEF0F4", null, 3) +
        R(54, 242, 108, 6, G, null, 3) +
        T(54, 260, "Terkumpul 64%", 9, "#8a9390", 400) +
        R(250, 78, 196, 188, "#fff", "#E3E6EC", 14) +
        T(264, 100, "Riwayat transaksi", 11, "#121517", 600) +
        tx(116, "+Rp50.000") +
        tx(158, "+Rp100.000") +
        tx(200, "+Rp25.000") +
        N(282, 34, 1) +
        N(372, 34, 2) +
        N(230, 84, 3)
    );
  };

  const assist = () =>
    W(
      R(34, 30, 206, 240, "#fff", "#E3E6EC", 14) +
        R(46, 42, 182, 68, GL, null, 10) +
        P("M137 94s-20-12-20-26a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 14-20 26-20 26z", G, 2, "#BFE4D7") +
        T(46, 128, "Bantu Bu Sari penuhi gizi", 11.5, "#121517", 600) +
        T(46, 143, "di trimester ketiga", 11.5, "#121517", 600) +
        T(46, 162, "Grobogan, Jawa Tengah", 9.5, "#8a9390", 400) +
        R(46, 176, 182, 6, "#EEF0F4", null, 3) +
        R(46, 176, 112, 6, G, null, 3) +
        T(46, 200, "Terkumpul", 9.5, "#8a9390", 400) +
        T(228, 200, "Rp 1.230.000", 10.5, "#121517", 600, "end") +
        B(46, 222, 120, "#E3E6EC", 5) +
        B(46, 234, 150, "#E3E6EC", 5) +
        B(46, 246, 90, "#E3E6EC", 5) +
        R(254, 30, 200, 240, "#fff", "#E3E6EC", 14) +
        T(268, 54, "Nominal donasi", 11.5, "#121517", 600) +
        ([["10rb", 0], ["25rb", 1], ["50rb", 0]] as [string, number][])
          .map(
            (c, i) =>
              R(268 + i * 58, 64, 52, 28, c[1] ? GL : "#fff", c[1] ? G : "#E3E6EC", 14) +
              T(294 + i * 58, 82, c[0], 10.5, c[1] ? "#04684A" : "#505257", c[1] ? 600 : 500, "middle")
          )
          .join("") +
        B(268, 106, 70, "#C9CFCC", 5) +
        R(268, 116, 172, 26, "#F7F8FA", "#E3E6EC", 8) +
        R(268, 152, 12, 12, G, null, 3) +
        P("M271 158l2 2.2 4-4.4", "#fff", 1.5) +
        T(286, 162, "Donasi sebagai anonim", 9.5, "#505257", 400) +
        R(268, 184, 172, 34, G, null, 17) +
        T(354, 205, "Lanjut bayar dengan QRIS", 10, "#fff", 600, "middle") +
        N(232, 38, 1) +
        N(446, 78, 2) +
        N(436, 186, 3)
    );

  const profile = () =>
    W(
      R(296, 22, 160, 38, "#fff", "#E3E6EC", 19) +
        C(316, 41, 13, GL) +
        C(316, 38, 4, "#9bd3bd") +
        P("M308 49c1-5 15-5 16 0", "#9bd3bd", 2) +
        T(336, 39, "Irfan", 10.5, "#121517", 600) +
        B(336, 45, 64, "#D5DBD8", 4) +
        P("M376 64c0 24-24 24-24 12", "#9bd3bd", 1.8).replace("stroke-linecap", 'stroke-dasharray="4 3" stroke-linecap') +
        R(70, 76, 340, 196, "#fff", "#E3E6EC", 16) +
        C(114, 120, 26, GL) +
        C(114, 113, 8, "#9bd3bd") +
        P("M100 134c2-9 26-9 28 0", "#9bd3bd", 3) +
        C(132, 138, 9, G, "#fff", 2) +
        P("M128 138h8m-4 -4v8", "#fff", 1.5) +
        T(158, 112, "Nama lengkap", 9.5, "#505257", 500) +
        R(158, 118, 236, 24, "#F7F8FA", "#E3E6EC", 8) +
        T(168, 134, "Irfan", 10.5) +
        T(86, 166, "Email", 9.5, "#505257", 500) +
        R(86, 172, 308, 24, "#EEF1F4", "#E3E6EC", 8) +
        B(96, 181, 100, "#C9CFCC", 5) +
        T(86, 212, "Nomor WhatsApp", 9.5, "#505257", 500) +
        R(86, 218, 308, 24, "#F7F8FA", "#E3E6EC", 8) +
        T(96, 234, "+62 812-3456-7890", 10.5) +
        R(222, 252, 66, 18, "#fff", "#E3E6EC", 9) +
        T(255, 264.5, "Batal", 9.5, "#505257", 500, "middle") +
        R(296, 250, 98, 22, G, null, 11) +
        T(345, 264.5, "Simpan perubahan", 8.5, "#fff", 600, "middle") +
        N(452, 26, 1) +
        N(132, 138, 2) +
        N(392, 252, 3)
    );

  return { check, plan, daily, growth, help, wallet, assist, profile };
})();

/* ---------- Isi panduan ---------- */
interface GuideItem {
  nm: string;
  ic: string;
  t: string;
  lead: string;
  fig: () => string;
  st: string[];
  tip: string;
}

const GUIDE: GuideItem[] = [
  {
    nm: "NutriCheck",
    ic: "chk",
    t: "Isi data kondisi Anda",
    lead: "Data ini dipakai NutrimateAI untuk menyusun rekomendasi gizi yang cocok untuk Anda.",
    fig: GX.check,
    st: [
      "Pilih kategori: ibu hamil, ibu menyusui, atau anak usia 6–24 bulan.",
      "Isi data di setiap bagian, lalu tekan <b>Lanjut</b>.",
      "Di bagian terakhir, tekan <b>Buat Rekomendasi</b>.",
    ],
    tip: "Isi sesuai kondisi terbaru agar rekomendasinya tepat.",
  },
  {
    nm: "NutriPlan",
    ic: "cal",
    t: "Lihat rekomendasi makan",
    lead: "NutriPlan menampilkan bahan makanan untuk setiap hari selama 30 hari.",
    fig: GX.plan,
    st: [
      "Pilih tanggal pada kalender.",
      "Lihat bahan makanan, takaran, dan perkiraan biaya untuk setiap waktu makan.",
      "Tekan <b>Lihat gizi &amp; manfaat</b> untuk membaca manfaat tiap bahan.",
    ],
    tip: "Yang direkomendasikan adalah bahan makanan, bukan resep masakan.",
  },
  {
    nm: "NutriDaily",
    ic: "phone",
    t: "Terima pengingat lewat WhatsApp",
    lead: "Setelah menu cocok, rekomendasi harian dikirim langsung ke WhatsApp Anda.",
    fig: GX.daily,
    st: [
      "Tekan <b>Setuju &amp; Aktifkan WhatsApp</b>.",
      "Periksa nomor WhatsApp Anda. Nomor bisa diganti bila perlu.",
      "Tekan <b>Aktifkan</b>. Pengingat akan dikirim setiap hari.",
    ],
    tip: "Menu belum cocok? Tulis komentar di kotak “Belum sesuai?”, lalu tekan <b>Kirim &amp; Generate Ulang</b>.",
  },
  {
    nm: "Perkembangan",
    ic: "trend",
    t: "Pantau perkembangan tiap bulan",
    lead: "Berat dan tinggi badan Anda tercatat otomatis dan ditampilkan dalam grafik.",
    fig: GX.growth,
    st: [
      "Buka NutriCheck, lalu pilih tab <b>Perkembangan Kondisi</b>.",
      "Lihat grafik berat badan dan tinggi badan dari bulan ke bulan.",
      "Perbarui data di tab <b>Isi Data</b> setiap bulan agar grafik terus bertambah.",
    ],
    tip: "Pembaruan rutin membantu rekomendasi tetap sesuai kondisi Anda.",
  },
  {
    nm: "NutriHelp",
    ic: "heart",
    t: "Ajukan open donasi",
    lead: "Gunakan fitur ini bila Anda atau orang di sekitar Anda membutuhkan bantuan pangan bergizi.",
    fig: GX.help,
    st: [
      "Buka NutriHelp, lalu pilih tab <b>Ajukan Open Donasi</b>.",
      "Isi identitas, cerita kebutuhan, dan rincian bahan pangan beserta biayanya.",
      "Unggah dokumen pendukung, setujui pernyataan, lalu tekan <b>Kirim</b>.",
    ],
    tip: "Pengajuan Anda akan diperiksa admin terlebih dahulu.",
  },
  {
    nm: "NutriWallet",
    ic: "wallet",
    t: "Pantau pengajuan dan dana",
    lead: "Lihat perkembangan pengajuan dan dana donasi yang sudah masuk.",
    fig: GX.wallet,
    st: [
      "Buka tab <b>Open Donasi Saya</b> untuk melihat status pengajuan.",
      "Setelah disetujui dan donasi masuk, buka tab <b>NutriWallet</b>.",
      "Lihat saldo dan riwayat transaksi, lalu tekan <b>Cairkan dana</b> bila diperlukan.",
    ],
    tip: "Gunakan rekening atas nama pemohon untuk pencairan dana.",
  },
  {
    nm: "NutriAssist",
    ic: "asst",
    t: "Bantu lewat donasi",
    lead: "Salurkan bantuan untuk ibu dan anak yang membutuhkan.",
    fig: GX.assist,
    st: [
      "Pilih open donasi dan baca ceritanya.",
      "Pilih nominal, lalu isi nama atau pilih donasi anonim.",
      "Tekan <b>Lanjut bayar dengan QRIS</b>, pindai kodenya, lalu tekan <b>Saya sudah membayar</b>.",
    ],
    tip: "Pastikan nominal donasi sudah benar sebelum Anda memindai kode QRIS.",
  },
  {
    nm: "Profil",
    ic: "usr",
    t: "Kelola profil akun",
    lead: "Periksa atau ubah informasi akun Anda kapan saja.",
    fig: GX.profile,
    st: [
      "Tekan kotak nama Anda di bagian atas halaman.",
      "Tekan <b>Edit profil</b>, lalu ubah foto, nama, atau nomor WhatsApp.",
      "Tekan <b>Simpan perubahan</b>.",
    ],
    tip: "Nomor WhatsApp dipakai untuk mengirim pengingat NutriDaily.",
  },
];

/* ---------- Komponen popup ---------- */
interface GuidePopupProps {
  onClose: () => void;
}

export default function GuidePopup({ onClose }: GuidePopupProps) {
  const [i, setI] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const last = GUIDE.length - 1;
  const g = GUIDE[i];

  const goTo = useCallback((n: number, focus = false) => {
    if (n < 0 || n >= GUIDE.length) return;
    setI(n);
    if (focus) tabRefs.current[n]?.focus({ preventScroll: true });
  }, []);

  // Kunci scroll halaman, fokus ke tab pertama, kembalikan fokus saat ditutup
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("gx-lock");
    tabRefs.current[0]?.focus({ preventScroll: true });
    return () => {
      document.documentElement.classList.remove("gx-lock");
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
    };
  }, []);

  // Setiap pindah halaman: tab aktif terlihat & isi kembali ke atas
  useEffect(() => {
    tabRefs.current[i]?.scrollIntoView({ block: "nearest", inline: "center" });
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [i]);

  // Keyboard: Esc menutup, panah kiri/kanan pindah halaman, Tab terkunci di dalam popup
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as HTMLElement | null;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const inNav = !!target?.closest?.(".gx-nav");
        if (inNav || target === document.body || target?.closest?.(".gx-body")) {
          e.preventDefault();
          goTo(i + (e.key === "ArrowRight" ? 1 : -1), inNav);
        }
      } else if (e.key === "Tab") {
        const f = Array.from(root.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")).filter(
          (x) => x.tabIndex >= 0 && x.offsetParent
        );
        if (!f.length) return;
        const a = f[0],
          z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", kd);
    return () => document.removeEventListener("keydown", kd);
  }, [i, onClose, goTo]);

  const svg = g.fig().replace("<svg ", `<svg aria-label="Ilustrasi fitur ${g.nm}" `);

  return createPortal(
    <div
      ref={rootRef}
      className="gx"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="gx-card" role="dialog" aria-modal="true" aria-labelledby="gxT">
        <header className="gx-head">
          <div>
            <h2 id="gxT">Panduan NutrimateAI</h2>
            <p>Pilih fitur untuk melihat cara memakainya.</p>
          </div>
          <button type="button" className="gx-x" aria-label="Tutup panduan" onClick={onClose}>
            ×
          </button>
        </header>

        <nav className="gx-nav" role="tablist" aria-label="Daftar fitur">
          {GUIDE.map((item, k) => (
            <button
              key={item.nm}
              ref={(el) => {
                tabRefs.current[k] = el;
              }}
              type="button"
              role="tab"
              id={`gxTab${k}`}
              aria-controls="gxPanel"
              aria-selected={k === i}
              tabIndex={k === i ? 0 : -1}
              onClick={() => goTo(k)}
            >
              <GxIcon name={item.ic} />
              <span>{item.nm}</span>
            </button>
          ))}
        </nav>

        <div className="gx-body" ref={bodyRef}>
          <div key={i} className="gx-main gx-in" id="gxPanel" role="tabpanel" aria-labelledby={`gxTab${i}`}>
            <figure className="gx-fig" dangerouslySetInnerHTML={{ __html: svg }} />
            <div className="gx-info">
              <p className="gx-nm">{g.nm}</p>
              <h3>{g.t}</h3>
              <p className="gx-lead">{g.lead}</p>
              <ol className="gx-steps">
                {g.st.map((s, k) => (
                  <li key={k}>
                    <b>{k + 1}</b>
                    <span dangerouslySetInnerHTML={{ __html: s }} />
                  </li>
                ))}
              </ol>
              <p className="gx-tip">
                <GxIcon name="inf" />
                <span dangerouslySetInnerHTML={{ __html: g.tip }} />
              </p>
            </div>
          </div>
        </div>

        <footer className="gx-foot">
          <button type="button" className="btn o" disabled={i === 0} onClick={() => goTo(i - 1)}>
            Sebelumnya
          </button>
          <span className="gx-cnt" aria-live="polite">
            {i + 1} dari {GUIDE.length}
          </span>
          <button type="button" className="btn" onClick={() => (i === last ? onClose() : goTo(i + 1))}>
            {i === last ? "Selesai" : "Berikutnya"}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}