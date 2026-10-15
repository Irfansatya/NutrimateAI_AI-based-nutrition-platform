"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./dashboard.css";

import { SvgIcon } from "@/component/dashboard/SvgIcon";
import { Toast, ProfileModal, GuideModal } from "@/component/dashboard/SharedComponents";
import NutriCheck, { type GrowthRecord } from "@/component/dashboard/NutriCheck";
import NutriPlan from "@/component/dashboard/NutriPlan";
import NutriHelp from "@/component/dashboard/NutriHelp";
import NutriAssist from "@/component/dashboard/NutriAssist";
import NutriWallet from "@/component/dashboard/NutriWallet";

import {
  MOCK_USER,
  NAV_ITEMS,
  type Cat,
  type DayPlan,
  type Campaign,
} from "@/lib/dashboard/mockData";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("check");
  const [user, setUser] = useState(MOCK_USER);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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
  const [myCampaign, setMyCampaign] = useState<Campaign | null>(null);

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

  return (
    <div className="db-root">
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}

      {/* HERO HEADER */}
      <header id="db-hero">
        <video
          className="db-hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/bg-fitur.png"
        >
          <source src="/videos/video-background.mp4" type="video/mp4" />
        </video>

        <div className="db-hero-in">
          <div className="db-hero-top">
            <Link href="/" className="db-brand-white" aria-label="NutriMate AI beranda">
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
              <p className="db-hero-sub">
                Mari pantau dan penuhi kebutuhan nutrisi keluarga bersama NutriMate AI.
              </p>
            </div>
          </div>

          <div className="db-hero-bottom">
            <nav className="db-hero-nav" aria-label="Navigasi dashboard">
              {NAV_ITEMS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={activeTab === id ? "on" : ""}
                  onClick={() => setActiveTab(id)}
                >
                  <SvgIcon
                    name={
                      id === "check"
                        ? "chk"
                        : id === "plan"
                        ? "cal"
                        : id === "help"
                        ? "heart"
                        : "asst"
                    }
                  />
                  <span>{label}</span>
                </button>
              ))}
              <button
                type="button"
                className={activeTab === "wallet" ? "on" : ""}
                onClick={() => setActiveTab("wallet")}
              >
                <SvgIcon name="wallet" />
                <span>NutriWallet</span>
              </button>
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
                <small>{user.role}</small>
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

        {activeTab === "help" && (
          <NutriHelp
            onToast={handleToast}
            myCampaign={myCampaign}
            onSubmitCampaign={setMyCampaign}
            onStopCampaign={() => setMyCampaign(null)}
          />
        )}

        {activeTab === "assist" && (
          <NutriAssist onToast={handleToast} />
        )}

        {activeTab === "wallet" && (
          <NutriWallet
            myCampaign={myCampaign}
            onToast={handleToast}
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
        />
      )}

      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}
