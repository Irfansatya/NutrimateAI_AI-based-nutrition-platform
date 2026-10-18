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
import { getCurrentUser, clearUserSession } from "@/lib/user/session";
import type { DonationRecord, MyCampaign, Withdrawal } from "@/lib/dashboard/campaign";
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
} from "@/lib/dashboard/mockData";

// Dua teks subheadline yang tampil bergantian (Typewriter Effect)
const HERO_SUBTEXTS = [
  "Kenali kebutuhan gizi keluarga dengan rekomendasi yang personal.",
  "Pantau perkembangan Bunda dan si kecil setiap bulan dengan lebih mudah.",
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("check");
  const [user, setUser] = useState(MOCK_USER);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const active = getCurrentUser();
    if (!active) {
      router.replace("/");
      return;
    }
    setUser({
      name: active.name,
      email: active.email,
      phone: active.phone,
      role: active.role,
      photo: active.photo || null,
    });
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    clearUserSession();
    router.replace("/");
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

  // NutriPlan state
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [planCat, setPlanCat] = useState<Cat>("hamil");

  // NutriHelp / Wallet state
  const [myCampaign, setMyCampaign] = useState<MyCampaign | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // NutriAssist: riwayat donasi milik pengguna (status awal: Dalam verifikasi)
  const [donations, setDonations] = useState<DonationRecord[]>([]);

  // Sinkronisasi data dari shared localStorage
  const refreshUserSharedData = useCallback(() => {
    const active = getCurrentUser();
    const activeCamp = getUserActiveCampaign(active?.id);
    setMyCampaign(activeCamp);

    // Ambil withdrawals dari shared
    const sharedWd = getSharedWithdrawals();
    const userWds: Withdrawal[] = sharedWd.map(w => ({
      id: w.id,
      amt: w.amount,
      ts: w.createdAt,
      bank: w.bank,
      acctMasked: w.acctMasked,
      name: w.name,
      status: w.status === 'selesai' ? ('selesai' as any) : 'diproses',
    }));
    setWithdrawals(userWds);

    // Ambil donations dari shared
    const sharedPay = getSharedPayments();
    const userDons: DonationRecord[] = sharedPay.map(p => ({
      id: p.id,
      campaignId: p.campaignId,
      campaignTitle: p.campaignTitle,
      recipient: p.recipient,
      cat: 'hamil',
      amount: p.amount,
      donorName: p.donorName,
      anonymous: p.anonymous,
      message: p.message || '',
      method: 'QRIS',
      ts: p.createdAt,
      status: p.status,
    }));
    setDonations(userDons);
  }, []);

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

  const handleAddDonation = (d: DonationRecord) => {
    const qrisRecord: QrisPaymentRecord = {
      id: d.id,
      campaignId: d.campaignId,
      campaignTitle: d.campaignTitle,
      recipient: d.recipient,
      amount: d.amount,
      donorName: d.donorName,
      anonymous: d.anonymous,
      message: d.message,
      method: 'QRIS',
      createdAt: d.ts,
      status: d.status,
    };
    const cur = getSharedPayments();
    const next = [qrisRecord, ...cur];
    saveSharedPayments(next);
    refreshUserSharedData();
  };

  // Open donasi yang masa tayangnya habis otomatis berstatus selesai
  useEffect(() => {
    if (myCampaign?.status !== "berjalan") return;
    const iv = setInterval(() => {
      setMyCampaign(c => {
        if (c && c.status === "berjalan" && c.deadline <= Date.now()) {
          const ended: MyCampaign = { ...c, status: "selesai", endedAt: c.deadline, endReason: "expired" };
          const active = getCurrentUser();
          upsertUserCampaign(ended, active?.id);
          return ended;
        }
        return c;
      });
    }, 60000);
    return () => clearInterval(iv);
  }, [myCampaign?.status]);

  const handleSubmitCampaign = (c: MyCampaign) => {
    const active = getCurrentUser();
    upsertUserCampaign(c, active?.id);
    refreshUserSharedData();
  };

  const handlePublishCampaign = () => {
    const now = Date.now();
    setMyCampaign(c => {
      if (c && c.status === "disetujui") {
        const next: MyCampaign = { ...c, status: "berjalan", publishedAt: now, deadline: now + c.durasi * 864e5 };
        const active = getCurrentUser();
        upsertUserCampaign(next, active?.id);
        return next;
      }
      return c;
    });
  };

  const handleCancelCampaign = () => {
    const now = Date.now();
    setMyCampaign(c => {
      if (c && (c.status === "review" || c.status === "disetujui")) {
        const next: MyCampaign = { ...c, status: "dibatalkan", endedAt: now };
        const active = getCurrentUser();
        upsertUserCampaign(next, active?.id);
        return next;
      }
      return c;
    });
  };

  const handleFinishCampaign = () => {
    const now = Date.now();
    setMyCampaign(c => {
      if (c && c.status === "berjalan") {
        const next: MyCampaign = { ...c, status: "selesai", endedAt: now, endReason: "manual" };
        const active = getCurrentUser();
        upsertUserCampaign(next, active?.id);
        return next;
      }
      return c;
    });
  };

  const handleResetCampaign = () => {
    setMyCampaign(null);
  };

  const handleWithdraw = (w: Withdrawal) => {
    const active = getCurrentUser();
    const wdRecord: WithdrawalRecord = {
      id: w.id,
      userId: active?.id || 'usr_me',
      userName: active?.name || w.name,
      bank: w.bank,
      acct: w.acctMasked.replace('•••• ', '10000000'), // Simpan nomor rekening
      acctMasked: w.acctMasked,
      name: w.name,
      amount: w.amt,
      createdAt: w.ts,
      status: 'diproses',
    };
    const cur = getSharedWithdrawals();
    const next = [wdRecord, ...cur];
    saveSharedWithdrawals(next);
    refreshUserSharedData();
  };

  const handleToast = (msg: string) => {
    setToastMsg(msg);
  };

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
    return null;
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
          playbackRate={0.4}
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
            onWithdraw={handleWithdraw}
          />
        </div>

        {activeTab === "assist" && (
          <NutriAssist
            onToast={handleToast}
            myCampaign={myCampaign}
            donations={donations}
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