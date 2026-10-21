"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import "./dashboard-revisi.css";
import "./dashboard-nutrihelp.css";

import PingPongVideo from "@/component/PingPongVideo";
import TypewriterSubtitle from "@/component/dashboard/TypewriterSubtitle";
import { SvgIcon } from "@/component/dashboard/SvgIcon";
import { Toast, ProfileModal, GuideModal } from "@/component/dashboard/SharedComponents";
import NutriCheck, { type GrowthRecord } from "@/component/dashboard/NutriCheck";
import NutriPlan from "@/component/dashboard/NutriPlan";
import NutriHelp from "@/component/dashboard/NutriHelp";
import NutriAssist from "@/component/dashboard/NutriAssist";
import { apiGetMe, apiLogout } from "@/lib/auth/client";
import { apiGetAssessments, apiGetLatestAssessment, type NutritionContextType } from "@/lib/nutricheck/client";
import {
  apiGetUserCampaigns,
  apiCreateCampaign,
  apiUpdateCampaignAction,
} from "@/lib/nutrihelp/client";
import {
  apiGetActiveCampaigns,
  apiGetMyDonations,
  apiCreateDonation,
} from "@/lib/nutriassist/client";
import {
  apiGetWalletSummary,
  apiGetWalletWithdrawals,
  apiCreateWithdrawal,
  type WalletSummaryData,
} from "@/lib/nutriwallet/client";
import type { DonationRecord, MyCampaign, Withdrawal, HelpForm, NeedItem } from "@/lib/dashboard/campaign";
import {
  getUserActiveCampaign,
  upsertUserCampaign,
  getSharedPayments,
  saveSharedPayments,
  getSharedWithdrawals,
  saveSharedWithdrawals,
  SYNC_EVENT_NAME
} from "@/lib/shared/store";
import type { QrisPaymentRecord, WithdrawalRecord } from "@/lib/admin/data/payments";

import {
  MOCK_USER,
  NAV_ITEMS,
  type Cat,
  type DayPlan,
  type Campaign,
} from "@/lib/dashboard/mockData";

// Dua teks subheadline yang tampil bergantian (Typewriter Effect)
const HERO_SUBTEXTS = [
  "Kenali kebutuhan gizi keluarga dengan rekomendasi yang personal.",
  "Pantau perkembangan Bunda dan si kecil setiap bulan dengan lebih mudah.",
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("check");
  const [user, setUser] = useState<{
    id?: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    photo: string | null;
  }>(MOCK_USER);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiGetMe()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.user) {
          const authUser = res.data.user;
          setUser({
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            phone: authUser.phone || "",
            role: authUser.role === "USER" ? "Pengguna NutrimateAI" : authUser.role,
            photo: authUser.photo || null,
          });
          setIsAuthorized(true);
        } else {
          router.replace("/");
        }
      })
      .catch(() => {
        if (isMounted) {
          router.replace("/");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await apiLogout();
      if (res.success) {
        router.replace("/");
      } else {
        setToastMsg(res.message || "Gagal keluar. Silakan coba lagi.");
      }
    } catch {
      setToastMsg("Terjadi gangguan jaringan saat keluar.");
    }
  };

  // Typewriter subheadline pada hero: ketik, diam 5 detik, hilang, lalu ulangi.
  const longestSub = HERO_SUBTEXTS.reduce((a, b) => b.length > a.length ? b : a);
  const [liveText, setLiveText] = useState("");
  const [typing, setTyping] = useState(false);
  const twRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let cancelled = false;

    const schedule = (callback: () => void, delay: number) => {
      twRef.current = setTimeout(() => {
        if (!cancelled) callback();
      }, delay);
    };

    const run = () => {
      if (cancelled) return;
      const text = HERO_SUBTEXTS[index % HERO_SUBTEXTS.length];
      index += 1;

      if (prefersReduced) {
        setTyping(false);
        setLiveText(text);
        schedule(() => {
          setLiveText("");
          schedule(run, 450);
        }, 5000);
        return;
      }

      setTyping(true);
      let character = 0;
      const step = () => {
        if (cancelled) return;
        character += 1;
        setLiveText(text.slice(0, character));
        if (character < text.length) {
          schedule(step, 34);
        } else {
          setTyping(false);
          schedule(() => {
            setLiveText("");
            schedule(run, 450);
          }, 5000);
        }
      };
      schedule(step, index === 1 ? 500 : 0);
    };

    run();
    return () => {
      cancelled = true;
      if (twRef.current) clearTimeout(twRef.current);
    };
  }, []);

  // NutriCheck state
  const [cat, setCat] = useState<Cat>("hamil");
  const [checkData, setCheckData] = useState<Record<Cat, Record<string, unknown>>>({
    hamil: { bud: 25000 },
    menyusui: { bud: 25000 },
    anak: { bud: 25000 },
  });
  const [growth, setGrowth] = useState<Record<Cat, GrowthRecord[]>>({
    hamil: [],
    menyusui: [],
    anak: [],
  });

  // Load NutriCheck assessment history & growth data from backend
  useEffect(() => {
    if (!isAuthorized) return;
    let isMounted = true;

    apiGetAssessments().then((res) => {
      if (!isMounted || !res.success || !res.data) return;
      if (res.data.growth) {
        setGrowth({
          hamil: res.data.growth.hamil || [],
          menyusui: res.data.growth.menyusui || [],
          anak: res.data.growth.anak || [],
        });
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isAuthorized]);

  // Load latest assessment to prefill form when category changes
  useEffect(() => {
    if (!isAuthorized) return;
    let isMounted = true;

    const catEnum: NutritionContextType = cat === "hamil" ? "PREGNANCY" : cat === "menyusui" ? "BREASTFEEDING" : "CHILD";
    apiGetLatestAssessment(catEnum).then((res) => {
      if (!isMounted || !res.success || !res.data) return;
      if (res.data.formData) {
        setCheckData((prev) => ({
          ...prev,
          [cat]: { ...prev[cat], ...res.data.formData },
        }));
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isAuthorized, cat]);

  // NutriPlan state
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [planCat, setPlanCat] = useState<Cat>("hamil");

  // NutriHelp / Wallet state
  const [myCampaign, setMyCampaign] = useState<MyCampaign | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummaryData | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  // NutriAssist: riwayat donasi milik pengguna & active campaigns dari database
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignsError, setActiveCampaignsError] = useState<string | null>(null);

  // Helper konversi HelpCampaign DB ke MyCampaign UI
  const mapDbCampaignToMyCampaign = useCallback((camp: any): MyCampaign => {
    const stMap: Record<string, any> = {
      REVIEW: "review",
      REVISION: "revisi",
      REJECTED: "ditolak",
      APPROVED: "disetujui",
      ACTIVE: "berjalan",
      COMPLETED: "selesai",
      CANCELED: "dibatalkan",
    };

    const docObj = (camp.documents || {}) as any;
    const formSnap = docObj.formSnapshot || {};
    const cat = camp.category === "PREGNANCY" ? "hamil" : camp.category === "BREASTFEEDING" ? "menyusui" : "anak";

    const items: NeedItem[] = (camp.items || []).map((it: any) => ({
      n: it.name,
      q: it.quantity,
      c: Number(it.estimatedCost),
    }));

    const form: HelpForm = {
      role: formSnap.role || "",
      cat,
      nama: camp.applicantName,
      wa: camp.whatsappNumber,
      penerima: camp.recipientName,
      provinsi: camp.province,
      kabkota: camp.city,
      hub: camp.relationship,
      hubx: formSnap.hubx || "",
      files: { ktp: [], kondisi: [], ekonomi: [], thumb: [] },
      kondisiKet: camp.healthConditionDesc,
      eko: camp.economicConditionDesc,
      judul: camp.title,
      story: camp.story,
      durasi: camp.durationDays,
      items,
      agreeStmt: true,
      agreeTruth: true,
    };

    const pubAt = camp.publishedAt ? new Date(camp.publishedAt).getTime() : undefined;
    const deadline = pubAt ? pubAt + camp.durationDays * 864e5 : 0;

    return {
      id: camp.id,
      owner: "me",
      cat,
      nama: camp.recipientName,
      kota: camp.city,
      judul: camp.title,
      story: camp.story,
      items,
      target: Number(camp.targetAmount),
      // Aggregate from CONFIRMED donations; synthetic entry preserves col(c) calculation
      donors: camp._confirmedAmount
        ? [{ n: "Donasi Terkonfirmasi", amt: Number(camp._confirmedAmount), msg: "", ts: Date.now() }]
        : [],
      deadline,
      status: stMap[camp.status] || "review",
      by: "Pemohon",
      form,
      durasi: camp.durationDays,
      thumbnail: camp.thumbnailUrl || undefined,
      adminNote: camp.adminNote || undefined,
      submittedAt: new Date(camp.submittedAt).getTime(),
      publishedAt: pubAt,
      endedAt: camp.endedAt ? new Date(camp.endedAt).getTime() : undefined,
      endReason: camp.endReason || undefined,
    };
  }, []);

  // Sinkronisasi data dari backend (Campaigns) dan shared localStorage (Withdrawals & Donations)
  const refreshUserSharedData = useCallback(async () => {
    // 1. Ambil kampanye dari PostgreSQL via API
    try {
      const campRes = await apiGetUserCampaigns();
      if (campRes.success && Array.isArray(campRes.data?.campaigns) && campRes.data.campaigns.length > 0) {
        const activeCamp = mapDbCampaignToMyCampaign(campRes.data.campaigns[0]);
        setMyCampaign(activeCamp);
      } else {
        setMyCampaign(null);
      }
    } catch {
      // Fallback lokal jika ada gangguan
    }

    // 2. Ambil ringkasan wallet & riwayat penarikan dari PostgreSQL via API
    try {
      const summaryRes = await apiGetWalletSummary();
      if (summaryRes.success && summaryRes.data) {
        setWalletSummary(summaryRes.data);
        setWalletError(null);
      } else {
        setWalletError(summaryRes.message || "Gagal memuat ringkasan dompet.");
      }
    } catch {
      setWalletError("Gagal terhubung ke server dompet.");
    }

    try {
      const wdRes = await apiGetWalletWithdrawals();
      if (wdRes.success && Array.isArray(wdRes.data?.withdrawals)) {
        const mappedWds: Withdrawal[] = wdRes.data.withdrawals.map((w: any) => ({
          id: w.id,
          amt: Number(w.amount),
          ts: new Date(w.createdAt).getTime(),
          bank: w.bankName,
          acctMasked: "•••• " + String(w.accountNumber).slice(-4),
          name: w.accountHolder,
          status: w.status === "COMPLETED" ? "selesai" : "diproses",
        }));
        setWithdrawals(mappedWds);
      }
    } catch {
      // Fallback lokal jika ada gangguan
    }

    // 3. Ambil kampanye aktif NutriAssist dari PostgreSQL via API
    try {
      const actRes = await apiGetActiveCampaigns();
      if (actRes.success && Array.isArray(actRes.data?.campaigns)) {
        setActiveCampaignsError(null);
        const mappedCampaigns: Campaign[] = actRes.data.campaigns.map((c: any) => {
          const cat = c.category === "PREGNANCY" ? "hamil" : c.category === "BREASTFEEDING" ? "menyusui" : "anak";
          const donors = (c.donations || []).map((d: any) => ({
            n: d.isAnonymous ? "Anonim" : d.donorName,
            amt: Number(d.amount),
            msg: d.message || "",
            ts: new Date(d.createdAt).getTime(),
          }));
          const pubAt = c.publishedAt ? new Date(c.publishedAt).getTime() : Date.now();
          const deadline = c.deadlineAt ? new Date(c.deadlineAt).getTime() : pubAt + c.durationDays * 864e5;
          const items = (c.items || []).map((it: any) => ({
            n: it.name,
            q: it.quantity,
            c: Number(it.estimatedCost),
          }));

          return {
            id: c.id,
            owner: c.creatorUserId === user.id ? ("me" as const) : ("other" as const),
            cat,
            nama: c.recipientName,
            kota: c.city,
            judul: c.title,
            story: c.story,
            items,
            target: Number(c.targetAmount),
            donors,
            deadline,
            status: c.status === "ACTIVE" ? "berjalan" : "disetujui",
            by: "Pemohon terverifikasi",
            thumbnail: c.thumbnailUrl || undefined,
          };
        });
        setActiveCampaigns(mappedCampaigns);
      } else {
        setActiveCampaignsError(actRes.message || "Gagal memuat kampanye aktif.");
      }
    } catch {
      setActiveCampaignsError("Gagal terhubung ke server kampanye.");
    }

    // 4. Ambil donasi milik user dari PostgreSQL via API
    try {
      const myDonRes = await apiGetMyDonations();
      if (myDonRes.success && Array.isArray(myDonRes.data?.donations)) {
        const mappedDonations: DonationRecord[] = myDonRes.data.donations.map((d: any) => {
          let uiStatus: "verifikasi" | "berhasil" | "gagal" = "verifikasi";
          if (d.status === "CONFIRMED") uiStatus = "berhasil";
          else if (d.status === "REJECTED") uiStatus = "gagal";

          const campCat = d.campaign?.category === "PREGNANCY" ? "hamil" : d.campaign?.category === "BREASTFEEDING" ? "menyusui" : "anak";

          return {
            id: d.id,
            campaignId: d.campaignId,
            campaignTitle: d.campaign?.title || "Open Donasi",
            recipient: d.campaign?.recipientName || "Penerima",
            cat: campCat,
            amount: Number(d.amount),
            donorName: d.isAnonymous ? "Anonim" : d.donorName,
            anonymous: d.isAnonymous,
            message: d.message || "",
            method: "QRIS",
            ts: new Date(d.createdAt).getTime(),
            status: uiStatus,
          };
        });
        setDonations(mappedDonations);
      }
    } catch {
      // Fallback lokal jika ada gangguan
    }
  }, [mapDbCampaignToMyCampaign]);

  useEffect(() => {
    if (isAuthorized) {
      refreshUserSharedData();
    }

    const handleSync = () => {
      refreshUserSharedData();
    };

    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [isAuthorized, refreshUserSharedData]);

  const handleAddDonation = async (d: {
    campaignId: string;
    amount: number;
    donorName?: string;
    isAnonymous?: boolean;
    message?: string;
  }): Promise<{ success: boolean; donationId?: string; message?: string }> => {
    try {
      const res = await apiCreateDonation(d);
      if (res.success && res.data?.donation) {
        await refreshUserSharedData();
        return { success: true, donationId: res.data.donation.id };
      } else {
        return { success: false, message: res.message || "Gagal membuat donasi." };
      }
    } catch {
      return { success: false, message: "Terjadi gangguan jaringan saat membuat transaksi donasi." };
    }
  };

  // Open donasi yang masa tayangnya habis otomatis berstatus selesai
  useEffect(() => {
    if (myCampaign?.status !== "berjalan") return;
    const iv = setInterval(() => {
      setMyCampaign(c => {
        if (c && c.status === "berjalan" && c.deadline <= Date.now()) {
          apiUpdateCampaignAction(c.id, { action: "finish", endReason: "expired" })
            .then(() => refreshUserSharedData())
            .catch(() => {});
          return { ...c, status: "selesai", endedAt: c.deadline, endReason: "expired" };
        }
        return c;
      });
    }, 60000);
    return () => clearInterval(iv);
  }, [myCampaign?.status, refreshUserSharedData]);

  const handleSubmitCampaign = async (c: MyCampaign): Promise<{ success: boolean; message?: string }> => {
    try {
      const f = c.form;
      const catEnum = f.cat === "hamil" ? "PREGNANCY" : f.cat === "menyusui" ? "BREASTFEEDING" : "CHILD";

      const relationship =
        f.role === "self"
          ? "Diri sendiri"
          : f.role === "wali"
          ? "Wali/pendamping"
          : f.role === "lain"
          ? (f.hub === "Lainnya" ? (f.hubx || "Lainnya") : (f.hub || "Lainnya"))
          : (f.hub || "Diri sendiri");

      const res = await apiCreateCampaign({
        category: catEnum,
        applicantName: f.nama,
        recipientName: f.penerima,
        whatsappNumber: f.wa,
        relationship: relationship.trim().slice(0, 64),
        province: f.provinsi,
        city: f.kabkota,
        title: f.judul,
        story: f.story,
        healthConditionDesc: f.kondisiKet,
        economicConditionDesc: f.eko,
        durationDays: f.durasi,
        items: f.items.map(it => ({
          name: it.n,
          quantity: it.q,
          estimatedCost: it.c,
        })),
        thumbnailUrl: c.thumbnail,
        documents: {
          ktp: f.files.ktp.map(file => file.name),
          kondisi: f.files.kondisi.map(file => file.name),
          ekonomi: f.files.ekonomi.map(file => file.name),
          thumb: f.files.thumb.map(file => file.name),
        },
        formSnapshot: {
          role: f.role,
          hub: f.hub,
          hubx: f.hubx,
        },
      });

      if (res.success) {
        await refreshUserSharedData();
        return { success: true };
      } else {
        const errorMsg = res.message || "Gagal mengirim pengajuan open donasi.";
        setToastMsg(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch {
      const errorMsg = "Terjadi gangguan jaringan saat mengirim pengajuan.";
      setToastMsg(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const handlePublishCampaign = async () => {
    if (!myCampaign) return;
    try {
      const res = await apiUpdateCampaignAction(myCampaign.id, { action: "publish" });
      if (res.success) {
        await refreshUserSharedData();
        setToastMsg("Open donasi berhasil dipublikasikan.");
      } else {
        setToastMsg(res.message || "Gagal mempublikasikan donasi.");
      }
    } catch {
      setToastMsg("Terjadi gangguan jaringan saat mempublikasikan donasi.");
    }
  };

  const handleCancelCampaign = async () => {
    if (!myCampaign) return;
    try {
      const res = await apiUpdateCampaignAction(myCampaign.id, { action: "cancel" });
      if (res.success) {
        await refreshUserSharedData();
        setToastMsg("Pengajuan open donasi berhasil dibatalkan.");
      } else {
        setToastMsg(res.message || "Gagal membatalkan pengajuan.");
      }
    } catch {
      setToastMsg("Terjadi gangguan jaringan saat membatalkan pengajuan.");
    }
  };

  const handleFinishCampaign = async () => {
    if (!myCampaign) return;
    try {
      const res = await apiUpdateCampaignAction(myCampaign.id, { action: "finish", endReason: "manual" });
      if (res.success) {
        await refreshUserSharedData();
        setToastMsg("Open donasi berhasil diselesaikan.");
      } else {
        setToastMsg(res.message || "Gagal menyelesaikan donasi.");
      }
    } catch {
      setToastMsg("Terjadi gangguan jaringan saat menyelesaikan donasi.");
    }
  };

  const handleResetCampaign = () => {
    setMyCampaign(null);
  };

  const handleWithdraw = async (w: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    amount: number;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiCreateWithdrawal(w);
      if (res.success) {
        await refreshUserSharedData();
        return { success: true };
      } else {
        return { success: false, message: res.message || "Gagal mengajukan penarikan dana." };
      }
    } catch {
      return { success: false, message: "Terjadi gangguan jaringan saat mengajukan penarikan." };
    }
  };

  const handleToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  const handleDataChange = (targetCat: Cat, nextData: Record<string, unknown>) => {
    setCheckData(prev => ({ ...prev, [targetCat]: nextData }));
  };

  const handleGrowthUpdate = (targetCat: Cat, records: GrowthRecord[]) => {
    setGrowth(prev => ({ ...prev, [targetCat]: records }));
  };

  const handleGoToPlan = (newPlan: DayPlan[], targetCat: Cat) => {
    setPlan(newPlan);
    setPlanCat(targetCat);
    setActiveTab("plan");
  };

  const activeBudget = Number(checkData[cat]?.bud) || 25000;

  const currentDateLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f3f6f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-neutral-500">Memuat sesi pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-root">
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}

      {/* HERO HEADER */}
      <header id="db-hero">
        {/* Video background: diperlambat, di-blur, diputar maju-mundur (ping-pong) */}
        <PingPongVideo
          src="/videos/video-background.mp4"
          poster="/bg-fitur.png"
          playbackRate={1.0}
          className="db-hero-video"
        />

        <div className="db-hero-in">
          <div className="db-hero-top">
            <Link href="" className="db-brand-white" aria-label="NutriMate AI beranda">
              <Image
                src="/logo_NutrimateAI_putih.svg"
                alt="NutriMate AI"
                width={140}
                height={28}
                priority
              />
            </Link>

            <div className="db-hero-tools">
              <div className="db-date-pill">
                <SvgIcon name="cal" style={{ width: 15, height: 15 }} />
                <span>{currentDateLabel}</span>
              </div>
              <button
                type="button"
                className="db-guide-btn"
                onClick={() => setShowGuide(true)}
              >
                <SvgIcon name="book" />
                <span>Panduan</span>
              </button>
            </div>
          </div>

          <div className="db-hero-main">
            <div className="db-hero-copy">
              <h1>Halo, Bunda {user.name.split(" ")[0]}</h1>
              <p className="db-hero-sub db-tw" aria-label={liveText || longestSub}>
                <span className="db-tw-ghost" aria-hidden="true">{longestSub}</span>
                <span className="db-tw-live" aria-live="polite">
                  {liveText}
                  {liveText && <span className={`db-tw-cursor${typing ? " typing" : ""}`} aria-hidden="true" />}
                </span>
              </p>
            </div>
          </div>

          <div className="db-hero-bottom">
            <nav className="db-hero-nav" aria-label="Navigasi dashboard">
              {NAV_ITEMS.map(([id, label]) => {
                const iconMap: Record<string, string> = {
                  check: "chk", plan: "cal", help: "heart", assist: "asst",
                };
                return (
                  <button
                    key={id}
                    type="button"
                    className={activeTab === id ? "on" : ""}
                    onClick={() => setActiveTab(id)}
                  >
                    <SvgIcon name={iconMap[id] ?? "chk"} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              className="db-account-pill"
              onClick={() => setShowProfile(true)}
              aria-label="Buka profil akun"
            >
              <span className="db-account-avatar">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} />
                ) : (
                  <SvgIcon name="usr" />
                )}
              </span>
              <span>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="db-wrap">
        {activeTab === "check" && (
          <NutriCheck
            cat={cat}
            onCatChange={setCat}
            data={checkData}
            onDataChange={handleDataChange}
            growth={growth}
            onGrowthUpdate={handleGrowthUpdate}
            onToast={handleToast}
            onGoToPlan={handleGoToPlan}
          />
        )}

        {activeTab === "plan" && (
          <NutriPlan
            plan={plan}
            planCat={planCat}
            budget={activeBudget}
            onGoCheck={() => setActiveTab("check")}
            onToast={handleToast}
            userPhone={user.phone}
          />
        )}

        {/* NutriHelp tetap terpasang agar isian form tidak hilang saat pindah menu */}
        <div hidden={activeTab !== "help"}>
          <NutriHelp
            onToast={handleToast}
            myCampaign={myCampaign}
            onSubmitCampaign={handleSubmitCampaign}
            onPublishCampaign={handlePublishCampaign}
            onCancelCampaign={handleCancelCampaign}
            onFinishCampaign={handleFinishCampaign}
            onResetCampaign={handleResetCampaign}
            withdrawals={withdrawals}
            walletSummary={walletSummary}
            walletError={walletError}
            onWithdraw={handleWithdraw}
          />
        </div>

        {activeTab === "assist" && (
          <NutriAssist
            onToast={handleToast}
            myCampaign={myCampaign}
            donations={donations}
            activeCampaigns={activeCampaigns}
            activeCampaignsError={activeCampaignsError}
            onAddDonation={handleAddDonation}
          />
        )}
      </main>

      {/* MODALS */}
      {showProfile && (
        <ProfileModal
          user={user}
          onUserChange={setUser}
          onClose={() => setShowProfile(false)}
          onToast={handleToast}
          onLogout={handleLogout}
        />
      )}

      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}