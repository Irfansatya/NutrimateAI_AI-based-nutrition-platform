"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser, authenticateUser, saveUserSession } from "@/lib/user/session";

/* Ikon mata untuk tombol lihat/sembunyikan kata sandi */
function EyeIcon() {
  return (
    <svg
      className="w-[18px] h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className="w-[18px] h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

/* Default: mata tertutup (kata sandi tersembunyi). Klik: mata terbuka (kata sandi terlihat). */
function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      aria-pressed={visible}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 flex items-center justify-center transition-colors"
    >
      {visible ? <EyeIcon /> : <EyeOffIcon />}
    </button>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "signin" | "signup";
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = "signup",
  onClose,
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    isError?: boolean;
  }>({ show: false, message: "" });

  // Setiap popup dibuka, mode selalu mengikuti tombol yang ditekan
  // (Daftar -> signup, Masuk -> signin), bukan mode terakhir yang dibuka.
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialMode]);

  // Berpindah antara form Masuk dan Daftar selalu mengembalikan toggle ke mata tertutup.
  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
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
  }, [isOpen, isLoading, onClose]);

  const showToastMsg = (message: string, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  if (!isOpen) return null;

  // Validation helpers
  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isWhatsappValid = (val: string) => {
    const digits = val.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  };
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  const isPasswordValid =
    passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      showToastMsg("Nama lengkap minimal 2 karakter.", true);
      return;
    }
    if (!isEmailValid(email)) {
      showToastMsg("Masukkan alamat email yang valid.", true);
      return;
    }
    if (!isWhatsappValid(whatsapp)) {
      showToastMsg("Nomor WhatsApp minimal 10 digit angka.", true);
      return;
    }
    if (!isPasswordValid) {
      showToastMsg("Kata sandi belum memenuhi semua kriteria keamanan.", true);
      return;
    }
    if (confirmPassword !== password) {
      showToastMsg("Konfirmasi kata sandi tidak cocok.", true);
      return;
    }

    setIsLoading(true);

    const regResult = registerUser({
      name,
      email,
      phone: whatsapp,
      password,
    });

    if (!regResult.success) {
      setIsLoading(false);
      showToastMsg(regResult.error || "Gagal melakukan pendaftaran akun.", true);
      return;
    }

    showToastMsg("Memproses pendaftaran akun...");

    setTimeout(() => {
      setIsLoading(false);
      showToastMsg("Pendaftaran berhasil! Silakan masuk dengan akun Anda.");
      setSigninEmail(email);
      setSigninPassword("");
      setMode("signin");
    }, 1200);
  };

  const handleSigninSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid(signinEmail)) {
      showToastMsg("Masukkan alamat email yang valid.", true);
      return;
    }
    if (!signinPassword) {
      showToastMsg("Kata sandi wajib diisi.", true);
      return;
    }

    setIsLoading(true);

    const authResult = authenticateUser(signinEmail, signinPassword);

    if (!authResult.success || !authResult.user) {
      setIsLoading(false);
      showToastMsg(authResult.error || "Email atau kata sandi tidak cocok.", true);
      return;
    }

    saveUserSession(authResult.user.id);

    setTimeout(() => {
      setIsLoading(false);
      showToastMsg("Berhasil masuk! Selamat datang di NutriMate AI.");
      setTimeout(() => {
        onClose();
        router.push("/dashboard");
      }, 700);
    }, 800);
  };

  return (
    <div
      className="auth-modal fixed inset-0 z-[4000] flex items-center justify-center p-0 sm:p-6 bg-black/55 transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={isLoading ? undefined : onClose} />

      <div className="auth-dialog relative z-10 w-full sm:max-w-[800px] h-full sm:h-auto sm:max-h-[92vh] sm:min-h-[530px] overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-white sm:rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          aria-label="Tutup popup"
          className="auth-close absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full border border-neutral-200 bg-white/90 hover:bg-white text-neutral-700 flex items-center justify-center shadow-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Art (Hidden on Mobile) */}
        <div
          className="auth-art hidden md:flex flex-col justify-between p-8 bg-[#07543f] bg-cover bg-center bg-no-repeat text-white relative overflow-hidden"
          style={{ backgroundImage: "url('/bg-popup01.png')" }}
        >
          {/* Overlay tipis agar teks tetap terbaca di atas gambar */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Pendamping Gizi Keluarga
            </div>
            <h3 className="text-2xl font-bold leading-snug mb-3">
              Nutrisi Tepat untuk 1000 Hari Pertama Kehidupan
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Dapatkan rekomendasi bahan pangan bulanan dan pengingat harian yang disesuaikan dengan
              kondisi kesehatan dan anggaran keluarga.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm">
              NM
            </div>
            <div>
              <p className="text-xs font-semibold">NutriMate AI Platform</p>
              <p className="text-[11px] text-emerald-200">Mitra Sehat Ibu dan Anak</p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-panel p-6 sm:p-9 overflow-y-auto flex flex-col justify-center relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-xl border border-neutral-100">
                <div className="w-8 h-8 rounded-full border-2 border-[#E6F2EE] border-t-[#05976A] animate-spin" />
                <span className="text-xs font-bold text-neutral-800">Menyiapkan akun...</span>
                <span className="text-[10px] text-neutral-500 -mt-2">Sebentar ya Bunda</span>
              </div>
            </div>
          )}

          {mode === "signup" ? (
            /* ================= SIGN UP ================= */
            <div className="animate-in fade-in duration-200">
              <h2 className="text-xl sm:text-2xl font-bold text-[#151817] mb-1">
                Buat akun NutrimateAI
              </h2>
              <p className="text-xs text-[#666d69] mb-5">
                Dapatkan rekomendasi nutrisi yang disesuaikan. Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-[#07543f] font-semibold underline hover:text-[#05976A]"
                >
                  Masuk
                </button>
              </p>

              <form onSubmit={handleSignupSubmit} className="grid gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-neutral-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sinta Rahmawati"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-neutral-200 text-xs sm:text-[13px] outline-none focus:border-[#05976A] focus:ring-2 focus:ring-[#05976A]/10 transition-all"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-neutral-700">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-neutral-200 text-xs sm:text-[13px] outline-none focus:border-[#05976A] focus:ring-2 focus:ring-[#05976A]/10 transition-all"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-neutral-700">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-neutral-200 text-xs sm:text-[13px] outline-none focus:border-[#05976A] focus:ring-2 focus:ring-[#05976A]/10 transition-all"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-neutral-700">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 px-3 pr-10 rounded-lg border border-neutral-200 text-xs sm:text-[13px] outline-none focus:border-[#05976A] focus:ring-2 focus:ring-[#05976A]/10 transition-all"
                    />
                    <PasswordToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                  </div>

                  {/* Password rules pills */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                    <span className={passwordChecks.length ? "text-[#05976A] font-semibold" : "text-neutral-400"}>
                      {passwordChecks.length ? "✓" : "•"} 8+ Karakter
                    </span>
                    <span className={passwordChecks.uppercase ? "text-[#05976A] font-semibold" : "text-neutral-400"}>
                      {passwordChecks.uppercase ? "✓" : "•"} Huruf Besar
                    </span>
                    <span className={passwordChecks.number ? "text-[#05976A] font-semibold" : "text-neutral-400"}>
                      {passwordChecks.number ? "✓" : "•"} Angka
                    </span>
                  </div>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-neutral-700">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 px-3 pr-10 rounded-lg border border-neutral-200 text-xs sm:text-[13px] outline-none focus:border-[#05976A] focus:ring-2 focus:ring-[#05976A]/10 transition-all"
                    />
                    <PasswordToggle
                      visible={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((v) => !v)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 mt-2 rounded-lg bg-[#05976A] text-white text-xs sm:text-sm font-semibold hover:bg-[#047b57] active:scale-[0.99] transition-all shadow-md shadow-[#05976A]/20"
                >
                  Daftar Sekarang
                </button>
              </form>
            </div>
          ) : (
            /* ================= SIGN IN ================= */
            <div className="animate-in fade-in duration-200">
              <h2 className="text-xl sm:text-2xl font-bold text-[#151817] mb-1">
                Selamat datang kembali
              </h2>
              <p className="text-xs text-[#666d69] mb-6">
                Masuk untuk melihat rencana gizi dan riwayat Anda. Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-[#07543f] font-semibold underline hover:text-[#05976A]"
                >
                  Daftar
                </button>
              </p>

              <form onSubmit={handleSigninSubmit} className="grid gap-3.5">
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-neutral-700">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-neutral-200 text-xs sm:text-[13px] outline-none focus:border-[#05976A] focus:ring-2 focus:ring-[#05976A]/10 transition-all"
                  />
                </div>

                <div className="grid gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-neutral-700">Kata Sandi</label>
                    <button
                      type="button"
                      onClick={() => showToastMsg("Fitur pemulihan kata sandi segera hadir.")}
                      className="text-[11px] text-[#07543f] hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan kata sandi"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      className="w-full h-10 px-3 pr-10 rounded-lg border border-neutral-200 text-xs sm:text-[13px] outline-none focus:border-[#05976A] focus:ring-2 focus:ring-[#05976A]/10 transition-all"
                    />
                    <PasswordToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 mt-2 rounded-lg bg-[#05976A] text-white text-xs sm:text-sm font-semibold hover:bg-[#047b57] active:scale-[0.99] transition-all shadow-md shadow-[#05976A]/20"
                >
                  Masuk ke Akun
                </button>
              </form>
            </div>
          )}

          {/* Switch tab bottom */}
          <div className="mt-6 pt-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
            {mode === "signup" ? (
              <span>
                Sudah memiliki akun terdaftar?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-[#07543f] font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </span>
            ) : (
              <span>
                Belum memiliki akun NutrimateAI?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-[#07543f] font-semibold hover:underline"
                >
                  Daftar gratis
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Auth Toast Notification */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 bottom-8 z-[5000] -translate-x-1/2 w-[min(420px,calc(100vw-32px))] p-3 px-4 rounded-xl flex items-center gap-2.5 bg-white shadow-2xl border transition-all duration-300 pointer-events-none ${
          toast.show ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-4 invisible"
        } ${toast.isError ? "border-rose-200 text-rose-800" : "border-[#05976A]/30 text-neutral-800"}`}
      >
        <span className="text-base shrink-0">{toast.isError ? "⚠️" : "✨"}</span>
        <span className="text-xs font-medium leading-relaxed">{toast.message}</span>
      </div>
    </div>
  );
}