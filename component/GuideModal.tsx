"use client";

import React, { useState, useEffect } from "react";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const guideSteps = [
  {
    title: "1. Kenali kondisi Anda",
    desc: "Mulai dengan memasukkan informasi dasar ibu dan si kecil agar NutrimateAI memahami kebutuhan nutrisi berdasarkan kondisi.",
    accent: "Profil Ibu & Anak",
    kind: "profile",
  },
  {
    title: "2. Lengkapi asesmen nutrisi",
    desc: "Jawab pertanyaan singkat tentang pola makan, kesehatan, lingkungan, dan kebutuhan keluarga. Data ini menjadi dasar analisis AI.",
    accent: "Asesmen Nutrisi",
    kind: "assessment",
  },
  {
    title: "3. Dapatkan analisis AI",
    desc: "Setelah data tersimpan, NutrimateAI merangkum kondisi dan menampilkan insight utama yang perlu diperhatikan.",
    accent: "Analisis Kondisi",
    kind: "analysis",
  },
  {
    title: "4. Lihat rekomendasi nutrisi",
    desc: "Gunakan rekomendasi makanan dan nutrisi yang dipersonalisasi untuk membantu menyusun pilihan harian yang lebih sesuai.",
    accent: "NutriPlan",
    kind: "plan",
  },
  {
    title: "5. Pantau kebutuhan harian",
    desc: "Periksa pengingat, target, dan perkembangan secara berkala supaya kebiasaan baik lebih mudah dipantau dari waktu ke waktu.",
    accent: "NutriDaily",
    kind: "daily",
  },
  {
    title: "6. Minta bantuan bila dibutuhkan",
    desc: "Jika membutuhkan dukungan, Anda dapat melihat pilihan bantuan dan menyampaikan kebutuhan yang relevan melalui fitur bantuan NutrimateAI.",
    accent: "NutriHelp",
    kind: "help",
  },
  {
    title: "7. Bantu keluarga lain",
    desc: "Masyarakat dapat memilih penggalangan dana yang tersedia dan ikut berdonasi untuk membantu kebutuhan nutrisi ibu dan anak.",
    accent: "NutriAssist",
    kind: "donate",
  },
];

function GuideVisual({ kind }: { kind: string }) {
  switch (kind) {
    case "profile":
      return (
        <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <rect width="960" height="540" fill="#f7faf8" />
          <rect width="960" height="62" fill="#ffffff" />
          <circle cx="34" cy="31" r="15" fill="#dff2eb" />
          <path d="M27 37c1-9 13-9 14 0" fill="#05976a" />
          <circle cx="34" cy="27" r="5" fill="#05976a" />
          <text x="61" y="37" fontFamily="Arial" fontSize="21" fontWeight="700" fill="#101514">
            NutrimateAI
          </text>
          <rect x="32" y="94" width="896" height="100" rx="20" fill="#e9f6f1" />
          <text x="58" y="132" fontFamily="Arial" fontSize="26" fontWeight="700" fill="#0d4f3c">
            Lengkapi profil Anda
          </text>
          <text x="58" y="162" fontFamily="Arial" fontSize="16" fill="#52625d">
            Data dasar membantu kami menyesuaikan rekomendasi.
          </text>
          <rect x="32" y="218" width="430" height="274" rx="20" fill="#fff" stroke="#e0e8e4" />
          <text x="58" y="252" fontFamily="Arial" fontSize="18" fontWeight="700" fill="#18201d">
            Profil Ibu
          </text>
          <rect x="58" y="273" width="170" height="44" rx="12" fill="#f5f7f6" />
          <text x="75" y="301" fontFamily="Arial" fontSize="14" fill="#7b8581">
            Nama lengkap
          </text>
          <rect x="244" y="273" width="190" height="44" rx="12" fill="#f5f7f6" />
          <text x="261" y="301" fontFamily="Arial" fontSize="14" fill="#7b8581">
            Usia
          </text>
          <rect x="58" y="334" width="376" height="44" rx="12" fill="#f5f7f6" />
          <text x="75" y="362" fontFamily="Arial" fontSize="14" fill="#7b8581">
            Kondisi kesehatan
          </text>
          <rect x="58" y="397" width="145" height="42" rx="21" fill="#05976a" />
          <text x="88" y="424" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#fff">
            Simpan profil
          </text>
          <rect x="486" y="218" width="442" height="274" rx="20" fill="#fff" stroke="#e0e8e4" />
          <circle cx="548" cy="280" r="40" fill="#dff2eb" />
          <path d="M528 294c2-20 38-20 40 0" fill="#05976a" />
          <circle cx="548" cy="276" r="13" fill="#05976a" />
          <text x="608" y="276" fontFamily="Arial" fontSize="18" fontWeight="700" fill="#18201d">
            Profil si kecil
          </text>
          <text x="608" y="303" fontFamily="Arial" fontSize="14" fill="#7b8581">
            Usia, berat, tinggi, dan kebutuhan
          </text>
          <rect x="528" y="338" width="350" height="14" rx="7" fill="#edf2ef" />
          <rect x="528" y="338" width="235" height="14" rx="7" fill="#73c4a7" />
          <rect x="528" y="372" width="350" height="14" rx="7" fill="#edf2ef" />
          <rect x="528" y="372" width="188" height="14" rx="7" fill="#73c4a7" />
        </svg>
      );
    case "assessment":
      return (
        <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <rect width="960" height="540" fill="#f8faf9" />
          <rect x="32" y="30" width="896" height="480" rx="22" fill="#fff" stroke="#e1e8e4" />
          <text x="68" y="76" fontFamily="Arial" fontSize="25" fontWeight="700" fill="#121917">
            Asesmen Nutrisi
          </text>
          <text x="68" y="105" fontFamily="Arial" fontSize="14" fill="#74807c">
            Jawab beberapa pertanyaan untuk membaca kebutuhan Anda.
          </text>
          <rect x="68" y="132" width="824" height="54" rx="14" fill="#e9f6f1" />
          <text x="91" y="166" fontFamily="Arial" fontSize="16" fontWeight="700" fill="#0b5a43">
            1 / 6
          </text>
          <rect x="160" y="151" width="680" height="16" rx="8" fill="#d5e8e0" />
          <rect x="160" y="151" width="220" height="16" rx="8" fill="#05976a" />
          <text x="68" y="228" fontFamily="Arial" fontSize="19" fontWeight="700" fill="#17201d">
            Bagaimana pola makan Anda hari ini?
          </text>
          <rect x="68" y="254" width="824" height="52" rx="14" fill="#fff" stroke="#d9e2de" />
          <circle cx="94" cy="280" r="9" fill="#fff" stroke="#05976a" strokeWidth="3" />
          <text x="119" y="286" fontFamily="Arial" fontSize="15" fill="#26302c">
            Sudah cukup teratur
          </text>
          <rect x="68" y="320" width="824" height="52" rx="14" fill="#fff" stroke="#d9e2de" />
          <circle cx="94" cy="346" r="9" fill="#05976a" />
          <circle cx="94" cy="346" r="4" fill="#fff" />
          <text x="119" y="352" fontFamily="Arial" fontSize="15" fill="#26302c">
            Masih perlu diperbaiki
          </text>
          <rect x="68" y="416" width="130" height="44" rx="22" fill="#05976a" />
          <text x="107" y="444" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#fff">
            Lanjut
          </text>
        </svg>
      );
    case "analysis":
      return (
        <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <rect width="960" height="540" fill="#f7faf8" />
          <rect x="32" y="30" width="896" height="480" rx="22" fill="#fff" />
          <text x="68" y="78" fontFamily="Arial" fontSize="25" fontWeight="700" fill="#121917">
            Analisis kondisi
          </text>
          <text x="68" y="107" fontFamily="Arial" fontSize="14" fill="#75817d">
            Ringkasan yang dihasilkan dari data asesmen Anda.
          </text>
          <rect x="68" y="137" width="250" height="170" rx="18" fill="#e9f6f1" />
          <text x="91" y="173" fontFamily="Arial" fontSize="14" fill="#49625a">
            Kondisi keseluruhan
          </text>
          <text x="91" y="225" fontFamily="Arial" fontSize="43" fontWeight="700" fill="#07543f">
            Baik
          </text>
          <text x="91" y="258" fontFamily="Arial" fontSize="13" fill="#587169">
            3 area perlu dipantau
          </text>
          <rect x="340" y="137" width="552" height="170" rx="18" fill="#fff" stroke="#e0e8e4" />
          <text x="366" y="173" fontFamily="Arial" fontSize="16" fontWeight="700" fill="#17201d">
            Insight utama
          </text>
          <circle cx="374" cy="207" r="5" fill="#05976a" />
          <text x="390" y="212" fontFamily="Arial" fontSize="14" fill="#38433f">
            Asupan protein dapat ditingkatkan
          </text>
          <circle cx="374" cy="239" r="5" fill="#05976a" />
          <text x="390" y="244" fontFamily="Arial" fontSize="14" fill="#38433f">
            Jadwal makan perlu lebih konsisten
          </text>
          <circle cx="374" cy="271" r="5" fill="#05976a" />
          <text x="390" y="276" fontFamily="Arial" fontSize="14" fill="#38433f">
            Pantau kebutuhan cairan harian
          </text>
          <rect x="68" y="330" width="824" height="145" rx="18" fill="#fff" stroke="#e0e8e4" />
          <text x="91" y="366" fontFamily="Arial" fontSize="16" fontWeight="700" fill="#17201d">
            Prioritas rekomendasi
          </text>
          <rect x="91" y="389" width="220" height="58" rx="13" fill="#f4f8f6" />
          <text x="108" y="414" fontFamily="Arial" fontSize="12" fill="#6a7772">
            Prioritas 01
          </text>
          <text x="108" y="435" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#07543f">
            Protein & zat besi
          </text>
          <rect x="328" y="389" width="220" height="58" rx="13" fill="#f4f8f6" />
          <text x="345" y="414" fontFamily="Arial" fontSize="12" fill="#6a7772">
            Prioritas 02
          </text>
          <text x="345" y="435" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#07543f">
            Serat & sayur
          </text>
        </svg>
      );
    case "plan":
      return (
        <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <rect width="960" height="540" fill="#f8faf9" />
          <rect x="32" y="30" width="896" height="480" rx="22" fill="#fff" />
          <text x="68" y="78" fontFamily="Arial" fontSize="25" fontWeight="700" fill="#121917">
            Rekomendasi NutriPlan
          </text>
          <text x="68" y="107" fontFamily="Arial" fontSize="14" fill="#75817d">
            Contoh rencana makan yang disesuaikan dengan hasil analisis.
          </text>
          <rect x="68" y="138" width="824" height="72" rx="16" fill="#e9f6f1" />
          <text x="92" y="168" fontFamily="Arial" fontSize="13" fill="#587169">
            Hari ini
          </text>
          <text x="92" y="194" fontFamily="Arial" fontSize="18" fontWeight="700" fill="#07543f">
            Fokus: protein, zat besi & serat
          </text>
          <g>
            <rect x="68" y="232" width="250" height="210" rx="18" fill="#fff" stroke="#e0e8e4" />
            <circle cx="193" cy="286" r="43" fill="#d8ead5" />
            <circle cx="180" cy="280" r="18" fill="#f0bd76" />
            <circle cx="210" cy="294" r="20" fill="#80aa62" />
            <text x="91" y="350" fontFamily="Arial" fontSize="15" fontWeight="700" fill="#17201d">
              Sarapan
            </text>
            <text x="91" y="377" fontFamily="Arial" fontSize="14" fill="#5e6a66">
              Oat + telur + buah
            </text>
            <rect x="91" y="398" width="82" height="28" rx="14" fill="#e9f6f1" />
            <text x="109" y="417" fontFamily="Arial" fontSize="11" fontWeight="700" fill="#07543f">
              Seimbang
            </text>
          </g>
          <g>
            <rect x="355" y="232" width="250" height="210" rx="18" fill="#fff" stroke="#e0e8e4" />
            <circle cx="480" cy="286" r="43" fill="#dcead0" />
            <circle cx="466" cy="286" r="20" fill="#e3a969" />
            <circle cx="497" cy="298" r="15" fill="#65a15d" />
            <text x="378" y="350" fontFamily="Arial" fontSize="15" fontWeight="700" fill="#17201d">
              Makan siang
            </text>
            <text x="378" y="377" fontFamily="Arial" fontSize="14" fill="#5e6a66">
              Nasi + ikan + sayur
            </text>
            <rect x="378" y="398" width="82" height="28" rx="14" fill="#e9f6f1" />
            <text x="396" y="417" fontFamily="Arial" fontSize="11" fontWeight="700" fill="#07543f">
              Seimbang
            </text>
          </g>
          <g>
            <rect x="642" y="232" width="250" height="210" rx="18" fill="#fff" stroke="#e0e8e4" />
            <circle cx="767" cy="286" r="43" fill="#e9e2c7" />
            <circle cx="752" cy="287" r="19" fill="#d48d55" />
            <circle cx="781" cy="297" r="15" fill="#8eaf62" />
            <text x="665" y="350" fontFamily="Arial" fontSize="15" fontWeight="700" fill="#17201d">
              Camilan
            </text>
            <text x="665" y="377" fontFamily="Arial" fontSize="14" fill="#5e6a66">
              Yogurt + pisang
            </text>
            <rect x="665" y="398" width="82" height="28" rx="14" fill="#e9f6f1" />
            <text x="683" y="417" fontFamily="Arial" fontSize="11" fontWeight="700" fill="#07543f">
              Praktis
            </text>
          </g>
        </svg>
      );
    case "daily":
      return (
        <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <rect width="960" height="540" fill="#f7faf8" />
          <rect x="32" y="30" width="896" height="480" rx="22" fill="#fff" />
          <text x="68" y="78" fontFamily="Arial" fontSize="25" fontWeight="700" fill="#121917">
            NutriDaily
          </text>
          <text x="68" y="107" fontFamily="Arial" fontSize="14" fill="#75817d">
            Pantau kebiasaan nutrisi dan pengingat penting.
          </text>
          <rect x="68" y="138" width="824" height="82" rx="17" fill="#07543f" />
          <text x="93" y="170" fontFamily="Arial" fontSize="13" fill="#bfe5d8">
            Progress minggu ini
          </text>
          <text x="93" y="202" fontFamily="Arial" fontSize="22" fontWeight="700" fill="#fff">
            5 dari 7 hari tercatat
          </text>
          <rect x="610" y="172" width="230" height="14" rx="7" fill="#2e735f" />
          <rect x="610" y="172" width="164" height="14" rx="7" fill="#83d0b4" />
          <rect x="68" y="248" width="824" height="195" rx="18" fill="#fff" stroke="#e0e8e4" />
          <text x="92" y="282" fontFamily="Arial" fontSize="16" fontWeight="700" fill="#17201d">
            Pengingat hari ini
          </text>
          <circle cx="101" cy="321" r="8" fill="#05976a" />
          <text x="121" y="327" fontFamily="Arial" fontSize="14" fill="#34403b">
            Sarapan — 07.00
          </text>
          <rect x="700" y="305" width="140" height="32" rx="16" fill="#e9f6f1" />
          <text x="739" y="326" fontFamily="Arial" fontSize="12" fontWeight="700" fill="#07543f">
            Selesai
          </text>
          <circle cx="101" cy="365" r="8" fill="#05976a" />
          <text x="121" y="371" fontFamily="Arial" fontSize="14" fill="#34403b">
            Minum air — 10.00
          </text>
          <rect x="700" y="349" width="140" height="32" rx="16" fill="#fff4d8" />
          <text x="746" y="370" fontFamily="Arial" fontSize="12" fontWeight="700" fill="#8b6a22">
            Ingat
          </text>
          <circle cx="101" cy="409" r="8" fill="#d2d8d5" />
          <text x="121" y="415" fontFamily="Arial" fontSize="14" fill="#34403b">
            Makan siang — 12.00
          </text>
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <rect width="960" height="540" fill="#f8faf9" />
          <rect x="32" y="30" width="896" height="480" rx="22" fill="#fff" />
          <text x="68" y="78" fontFamily="Arial" fontSize="25" fontWeight="700" fill="#121917">
            NutriHelp
          </text>
          <text x="68" y="107" fontFamily="Arial" fontSize="14" fill="#75817d">
            Temukan dukungan yang sesuai dengan kebutuhan keluarga.
          </text>
          <rect x="68" y="137" width="530" height="306" rx="18" fill="#e9f6f1" />
          <text x="94" y="175" fontFamily="Arial" fontSize="16" fontWeight="700" fill="#07543f">
            Ajukan kebutuhan bantuan
          </text>
          <text x="94" y="202" fontFamily="Arial" fontSize="13" fill="#5c7169">
            Ceritakan kebutuhan secara singkat dan jelas.
          </text>
          <rect x="94" y="226" width="478" height="48" rx="12" fill="#fff" />
          <text x="112" y="256" fontFamily="Arial" fontSize="13" fill="#89938f">
            Kategori bantuan
          </text>
          <rect x="94" y="288" width="478" height="78" rx="12" fill="#fff" />
          <text x="112" y="317" fontFamily="Arial" fontSize="13" fill="#89938f">
            Deskripsi kebutuhan
          </text>
          <text x="112" y="344" fontFamily="Arial" fontSize="12" fill="#b0b7b4">
            Contoh: kebutuhan makanan bergizi...
          </text>
          <rect x="94" y="387" width="132" height="40" rx="20" fill="#05976a" />
          <text x="126" y="413" fontFamily="Arial" fontSize="13" fontWeight="700" fill="#fff">
            Kirim pengajuan
          </text>
          <rect x="630" y="137" width="262" height="306" rx="18" fill="#fff" stroke="#e0e8e4" />
          <circle cx="761" cy="192" r="42" fill="#dff2eb" />
          <path d="M740 205c2-19 40-19 42 0" fill="#05976a" />
          <circle cx="761" cy="185" r="13" fill="#05976a" />
          <text x="667" y="264" fontFamily="Arial" fontSize="16" fontWeight="700" fill="#17201d">
            Status bantuan
          </text>
          <text x="667" y="292" fontFamily="Arial" fontSize="13" fill="#64706b">
            Sedang diverifikasi
          </text>
          <rect x="667" y="318" width="188" height="12" rx="6" fill="#e6ece9" />
          <rect x="667" y="318" width="105" height="12" rx="6" fill="#73c4a7" />
          <text x="667" y="365" fontFamily="Arial" fontSize="12" fill="#89938f">
            Kami akan memberi kabar
          </text>
          <text x="667" y="385" fontFamily="Arial" fontSize="12" fill="#89938f">
            ketika ada pembaruan.
          </text>
        </svg>
      );
    case "donate":
      return (
        <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <rect width="960" height="540" fill="#f7faf8" />
          <rect x="32" y="30" width="896" height="480" rx="22" fill="#fff" />
          <text x="68" y="78" fontFamily="Arial" fontSize="25" fontWeight="700" fill="#121917">
            Bantu melalui donasi
          </text>
          <text x="68" y="107" fontFamily="Arial" fontSize="14" fill="#75817d">
            Pilih penggalangan dana yang ingin Anda dukung.
          </text>
          <rect x="68" y="137" width="530" height="304" rx="18" fill="#e9f6f1" />
          <rect x="92" y="162" width="482" height="120" rx="16" fill="#fff" />
          <circle cx="145" cy="222" r="35" fill="#d7ead7" />
          <path d="M130 225c10-25 33-25 43 0" fill="#6aa76d" />
          <text x="198" y="211" fontFamily="Arial" fontSize="16" fontWeight="700" fill="#17201d">
            Bantuan nutrisi keluarga
          </text>
          <text x="198" y="237" fontFamily="Arial" fontSize="13" fill="#697570">
            Target Rp5.000.000
          </text>
          <rect x="198" y="253" width="330" height="10" rx="5" fill="#e4ebe7" />
          <rect x="198" y="253" width="210" height="10" rx="5" fill="#05976a" />
          <text x="92" y="326" fontFamily="Arial" fontSize="15" fontWeight="700" fill="#17201d">
            Nominal donasi
          </text>
          <rect x="92" y="345" width="220" height="48" rx="12" fill="#fff" />
          <text x="111" y="375" fontFamily="Arial" fontSize="14" fill="#7a8581">
            Rp 100.000
          </text>
          <rect x="332" y="345" width="242" height="48" rx="24" fill="#05976a" />
          <text x="407" y="375" fontFamily="Arial" fontSize="14" fontWeight="700" fill="#fff">
            Donasi sekarang
          </text>
          <rect x="630" y="137" width="262" height="304" rx="18" fill="#07543f" />
          <text x="658" y="180" fontFamily="Arial" fontSize="13" fill="#bfe5d8">
            Kontribusi Anda
          </text>
          <text x="658" y="226" fontFamily="Arial" fontSize="31" fontWeight="700" fill="#fff">
            Berarti
          </text>
          <text x="658" y="255" fontFamily="Arial" fontSize="13" fill="#d2e9e1">
            untuk tumbuh kembang
          </text>
          <text x="658" y="276" fontFamily="Arial" fontSize="13" fill="#d2e9e1">
            ibu dan si kecil.
          </text>
          <circle cx="758" cy="352" r="48" fill="#2b735f" />
          <path
            d="M734 352c0-17 24-28 24-28s24 11 24 28c0 18-24 30-24 30s-24-12-24-30Z"
            fill="#fff"
            opacity=".95"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStep = guideSteps[currentIndex];

  const handleNext = () => {
    if (currentIndex < guideSteps.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      className="guide-modal fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guideTitle"
    >
      <div
        className="guide-backdrop absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="guide-dialog relative z-10 w-full sm:max-w-[750px] max-h-[calc(100vh-12px)] overflow-hidden bg-white rounded-t-[28px] sm:rounded-[24px] shadow-[0_28px_80px_rgba(0,0,0,0.24)] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="guide-header relative flex items-center justify-between p-4 px-6 border-b border-neutral-100 min-h-[60px]">
          <div
            className="guide-handle absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-neutral-300 sm:hidden"
            aria-hidden="true"
          />
          <h2 id="guideTitle" className="text-lg sm:text-xl font-semibold text-[#121517]">
            Panduan Penggunaan
          </h2>
          <button
            onClick={onClose}
            className="guide-close px-4 py-1.5 rounded-full bg-[#edf2f5] text-[#101214] text-xs font-medium hover:bg-[#e4eaed] transition-colors"
          >
            Tutup
          </button>
        </div>

        {/* Content */}
        <div className="guide-content p-5 sm:p-6 overflow-y-auto">
          {/* Visual Container */}
          <div className="guide-visual relative min-h-[200px] sm:min-h-[250px] rounded-xl overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-[#eef0b9] via-[#a8c783] to-[#215c35]">
            <div className="guide-screen relative z-10 w-[94%] sm:w-[82%] max-w-[560px] aspect-video bg-white border-4 sm:border-[6px] border-white/95 rounded-lg shadow-xl overflow-hidden">
              <GuideVisual kind={currentStep.kind} />
            </div>
          </div>

          {/* Meta & Controls */}
          <div className="guide-meta mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-[#121517] mb-1">
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#3c4542] leading-relaxed max-w-[540px]">
                {currentStep.desc}
              </p>
            </div>

            <div className="guide-controls flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Langkah sebelumnya"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:bg-[#E6F2EE] disabled:text-[#05976A] disabled:cursor-not-allowed bg-[#05976A] text-white hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === guideSteps.length - 1}
                aria-label="Langkah berikutnya"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:bg-[#E6F2EE] disabled:text-[#05976A] disabled:cursor-not-allowed bg-[#05976A] text-white hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Indicators */}
          <div className="guide-indicators flex items-center justify-center gap-1.5 pt-4">
            {guideSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Tampilkan langkah ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-6 bg-[#05976A]"
                    : "w-2 bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
