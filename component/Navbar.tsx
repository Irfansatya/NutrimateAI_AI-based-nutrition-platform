"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
  onOpenAuth: (mode: "signin" | "signup") => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] h-[70px] sm:h-[78px] transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-[#d6e0db]/80 shadow-[0_8px_28px_rgba(20,45,36,0.08)]"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="w-[calc(100%-32px)] sm:w-[calc(100%-84px)] max-w-none h-full mx-auto flex items-center justify-between gap-6 sm:gap-7">
        {/* Brand */}
        <Link href="/#home" className="brand w-[135px] sm:w-[143px] shrink-0" aria-label="NutrimateAI">
          <Image
            src="/logo-NutrimateAI-fix.svg"
            alt="NutrimateAI"
            width={143}
            height={32}
            className="w-full h-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="nav-links hidden md:flex items-center justify-center gap-8 lg:gap-11 mx-auto text-[15px] font-medium text-[#121517]">
          <Link href="/#asisten-ai" className="hover:text-[#05976A] transition-colors">
            Asisten AI
          </Link>
          <Link href="/#praktisi" className="hover:text-[#05976A] transition-colors">
            Praktisi
          </Link>
          <Link href="/#pengguna" className="hover:text-[#05976A] transition-colors">
            Pengguna
          </Link>
          <Link href="/hubungi-kami" className="hover:text-[#05976A] transition-colors">
            Hubungi Kami
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="nav-actions hidden md:flex items-center gap-2">
          <button
            onClick={() => onOpenAuth("signin")}
            className="min-w-[78px] h-[42px] px-5 rounded-full inline-flex items-center justify-center text-[15px] font-medium text-[#121517] hover:-translate-y-0.5 hover:text-[#05976A] transition-all"
          >
            Masuk
          </button>
          <button
            onClick={() => onOpenAuth("signup")}
            className="min-w-[78px] h-[42px] px-5 rounded-full inline-flex items-center justify-center text-[15px] font-semibold bg-[#05976A] text-white hover:bg-[#07543f] hover:-translate-y-0.5 transition-all shadow-sm"
          >
            Daftar
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle md:hidden w-11 h-11 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`block w-5 h-0.5 bg-[#121517] rounded-full transition-transform duration-200 ${
              mobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#121517] rounded-full transition-opacity duration-200 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#121517] rounded-full transition-transform duration-200 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[70px] left-4 right-4 z-50 p-4 flex flex-col gap-1 border border-neutral-200 rounded-2xl bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/#asisten-ai"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg text-center font-medium text-neutral-800 hover:bg-[#E6F2EE] transition-colors"
          >
            Asisten AI
          </Link>
          <Link
            href="/#praktisi"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg text-center font-medium text-neutral-800 hover:bg-[#E6F2EE] transition-colors"
          >
            Praktisi
          </Link>
          <Link
            href="/#pengguna"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg text-center font-medium text-neutral-800 hover:bg-[#E6F2EE] transition-colors"
          >
            Pengguna
          </Link>
          <Link
            href="/hubungi-kami"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-lg text-center font-medium text-neutral-800 hover:bg-[#E6F2EE] transition-colors"
          >
            Hubungi Kami
          </Link>

          <hr className="my-1 border-neutral-100" />

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAuth("signin");
            }}
            className="p-3 rounded-lg text-center font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Masuk
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAuth("signup");
            }}
            className="p-3 rounded-full text-center font-semibold bg-[#05976A] text-white hover:bg-[#07543f] transition-colors"
          >
            Daftar Sekarang
          </button>
        </div>
      )}
    </header>
  );
}
