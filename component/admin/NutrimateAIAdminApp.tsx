'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AdminStyleSheet from './AdminStyleSheet';
import { ADMIN_ACCOUNT } from '@/lib/admin/data/admin';
import { INITIAL_MESSAGES } from '@/lib/admin/data/messages';
import { INITIAL_ACTIVITIES } from '@/lib/admin/data/activities';
import { STATS_DATA } from '@/lib/admin/data/stats';
import {
  type QrisPaymentRecord,
  type WithdrawalRecord,
} from '@/lib/admin/data/payments';
import {
  getAdminDonationsList,
  updateCampaignStatusByAdmin,
  getSharedPayments,
  saveSharedPayments,
  getSharedWithdrawals,
  saveSharedWithdrawals,
  getSharedWallets,
  saveSharedWallets,
  SYNC_EVENT_NAME
} from '@/lib/shared/store';
import {
  clearAdminSession,
  hasAdminSession,
  saveAdminSession,
  getVisitedAdminPages,
  markAdminPageVisited
} from '@/lib/admin/session';
import { Icon } from '@/component/admin/ui/Icon';
import { Logo } from '@/component/admin/ui/Logo';
import { ModalWrapper } from '@/component/admin/ui/ModalWrapper';
import { DashboardView } from '@/component/admin/dashboard/DashboardView';
import { DonationView } from '@/component/admin/donations/DonationView';
import { PaymentsView } from '@/component/admin/payments/PaymentsView';
import { MessageView } from '@/component/admin/messages/MessageView';
import { LoginView } from '@/component/admin/auth/LoginView';
import { AdminSkeleton } from '@/component/admin/ui/AdminSkeleton';

// ===== Definisi Tipe Data Lintas Komponen =====
export interface DonationItem {
  n: string;
  q: string;
  c: number;
}

export interface Donation {
  id: number;
  pem: string;
  nm: string;
  ket: string;
  kota: string;
  judul: string;
  story: string;
  items: DonationItem[];
  st: string;
  d: number;
  dur: number;
  docs: string[];
  col: number;
  dn: number;
  note?: string;
}

export interface Message {
  id: number;
  n: string;
  e: string;
  tp: string;
  t: string;
  tx: string;
  f: string;
  r: string;
  rt?: string;
}

export type Activity = [string, number];

export default function NutrimateAIAdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dash' | 'don' | 'pay' | 'msg'>('dash');

  // State Data dengan Type Casting
  const [donations, setDonations] = useState<Donation[]>([]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES as Message[]);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES as Activity[]);

  // State Pembayaran & Penarikan
  const [payments, setPayments] = useState<QrisPaymentRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [wallets, setWallets] = useState<Record<string, number>>({});

  // Loading Skeleton Per Halaman (3 detik pada kunjungan pertama di sesi)
  const [pageLoading, setPageLoading] = useState<Record<string, boolean>>({
    dash: false,
    don: false,
    pay: false,
    msg: false
  });
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Global Interactivity (Toast & Logout Modal)
  const [toastMessage, setToastMessage] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Fungsi reload data tersimpan dari shared localStorage
  const refreshSharedData = useCallback(() => {
    setDonations(getAdminDonationsList());
    setPayments(getSharedPayments());
    setWithdrawals(getSharedWithdrawals());
    setWallets(getSharedWallets());
  }, []);

  // Inisialisasi Session Sesuai HTML Asli & Listen Sync Events
  useEffect(() => {
    if (hasAdminSession()) {
      setIsLoggedIn(true);
      refreshSharedData();
    }

    const handleSync = () => {
      if (hasAdminSession()) {
        refreshSharedData();
      }
    };

    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshSharedData]);

  // Handler pergantian tab dengan pengecekan first-visit skeleton 3 detik
  const handleTabChange = useCallback((tab: 'dash' | 'don' | 'pay' | 'msg') => {
    setActiveTab(tab);

    const visited = getVisitedAdminPages();
    if (!visited.includes(tab)) {
      setPageLoading((prev) => ({ ...prev, [tab]: true }));
      markAdminPageVisited(tab);

      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(() => {
        setPageLoading((prev) => ({ ...prev, [tab]: false }));
      }, 3000);
    }
  }, []);

  // Saat pertama kali login, cek skeleton untuk dashboard
  useEffect(() => {
    if (isLoggedIn) {
      const visited = getVisitedAdminPages();
      if (!visited.includes(activeTab)) {
        setPageLoading((prev) => ({ ...prev, [activeTab]: true }));
        markAdminPageVisited(activeTab);

        if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = setTimeout(() => {
          setPageLoading((prev) => ({ ...prev, [activeTab]: false }));
        }, 3000);
      }
    }
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [isLoggedIn, activeTab]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActiveTab('dash');
    saveAdminSession();
    refreshSharedData();
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    setIsLoggedIn(false);
    clearAdminSession();
    showToast('Anda telah keluar.');
  };

  const addActivity = useCallback((text: string, dayAgo = 0) => {
    setActivities((prev) => [[text, dayAgo], ...prev]);
  }, []);

  const handleUpdateDonation = useCallback((id: number, newStatus: string, note?: string) => {
    updateCampaignStatusByAdmin(id, newStatus, note);
    setDonations(getAdminDonationsList());
  }, []);

  const handleReplyMessage = useCallback((id: number, replyText: string, replyTime: string) => {
    setMessages((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, r: replyText, rt: replyTime } : item
      )
    );
  }, []);

  // Header Stat Items Dinamis Berdasarkan Halaman Aktif
  const heroStats = useMemo(() => {
    const countByStatus = (st: string) => donations.filter((p) => p.st === st).length;
    const unrepliedCount = messages.filter((m) => !m.r).length;
    const totalMessages = messages.length;
    const repliedCount = totalMessages - unrepliedCount;

    const pendingPaymentsCount = payments.filter((p) => p.status === 'verifikasi').length;
    const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'diproses').length;
    const totalConfirmedDonations = payments
      .filter((p) => p.status === 'berhasil')
      .reduce((sum, p) => sum + p.amount, 0);

    if (activeTab === 'dash') {
      return [
        ['Total Pengguna', STATS_DATA.users.toLocaleString('id-ID'), `+${STATS_DATA.today} Hari ini`],
        ['Pengajuan Menunggu Verifikasi', countByStatus('review'), 'Perlu ditinjau'],
        [
          'Total Donasi Tercatat',
          `Rp ${Math.round((STATS_DATA.donTotal + totalConfirmedDonations) / 1e6)}jt`,
          `Dari ${STATS_DATA.donCount + payments.filter((p) => p.status === 'berhasil').length} donasi`
        ]
      ];
    }

    if (activeTab === 'don') {
      return [
        ['Menunggu Verifikasi', countByStatus('review'), 'Perlu ditinjau'],
        ['Open Donasi Aktif', countByStatus('disetujui'), 'Sedang berjalan'],
        ['Total Pengajuan', donations.length, 'Semua status']
      ];
    }

    if (activeTab === 'pay') {
      return [
        ['Verifikasi QRIS', pendingPaymentsCount, 'Menunggu konfirmasi'],
        ['Pencairan Dana', pendingWithdrawalsCount, 'Menunggu transfer manual'],
        ['Donasi Berhasil', `Rp ${Math.round(totalConfirmedDonations / 1e3)}rb`, 'Telah masuk dompet']
      ];
    }

    return [
      ['Total Pesan', totalMessages, 'Dari Hubungi Kami'],
      ['Belum Dibalas', unrepliedCount, 'Perlu ditindaklanjuti'],
      ['Sudah Dibalas', repliedCount, 'Terkirim ke email']
    ];
  }, [activeTab, donations, messages, payments, withdrawals]);

  const pageHeaderTitles = {
    dash: {
      title: 'Dashboard',
      sub: 'Ringkasan aktivitas NutrimateAI hari ini.'
    },
    don: {
      title: 'Verifikasi Donasi',
      sub: 'Tinjau pengajuan open donasi, lalu setujui, minta revisi, atau tolak.'
    },
    pay: {
      title: 'Pembayaran & Penarikan',
      sub: 'Verifikasi manual donasi QRIS dan kelola pengajuan pencairan dana penerima.'
    },
    msg: {
      title: 'Pesan Pengguna',
      sub: 'Pesan dari formulir Hubungi Kami. Balasan dikirim ke email pengirim.'
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <AdminStyleSheet />
        <LoginView onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <>
      <AdminStyleSheet />
      
      {/* Toast Notification dengan Ikon Hijau */}
      {toastMessage && (
        <div className="toast">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" fill="#E9F6F1" stroke="#05976A" strokeWidth="1.8" />
            <path
              d="M8.5 12.5L10.8 14.8L15.5 9.5"
              stroke="#05976A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Utama */}
      <header className="top">
        <div className="wr">
          <div className="bar">
            <Logo />
            <nav className="nv" aria-label="Menu utama">
              {[
                ['dash', 'Dashboard'],
                ['don', 'Verifikasi Donasi'],
                ['pay', 'Pembayaran & Penarikan'],
                ['msg', 'Pesan Pengguna']
              ].map((nav) => (
                <button
                  key={nav[0]}
                  className={activeTab === nav[0] ? 'on' : ''}
                  aria-current={activeTab === nav[0] ? 'page' : undefined}
                  onClick={() => handleTabChange(nav[0] as 'dash' | 'don' | 'pay' | 'msg')}
                >
                  {nav[1]}
                </button>
              ))}
            </nav>

            <div className="me">
              <div className="pf">
                <span className="av">
                  <Icon name="u" />
                </span>
                <div>
                  <b>{ADMIN_ACCOUNT.name}</b>
                  <small>{ADMIN_ACCOUNT.email}</small>
                </div>
              </div>
              <button
                className="lo"
                aria-label="Keluar dari akun admin"
                title="Keluar"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                <Icon name="out" />
              </button>
            </div>
          </div>

          <div className="hero">
            <div className="ht">
              <h1>{pageHeaderTitles[activeTab].title}</h1>
              <p>{pageHeaderTitles[activeTab].sub}</p>
            </div>
            <div className="hs">
              {heroStats.map((s, i) => (
                <div className={`hc${i === 0 ? ' hl' : ''}`} key={i}>
                  <small>{s[0]}</small>
                  <b>{s[1]}</b>
                  <span>{s[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Konten Halaman */}
      <main className="wr">
        <section className="panel">
          {pageLoading[activeTab] ? (
            <AdminSkeleton type={activeTab} />
          ) : (
            <>
              {activeTab === 'dash' && (
                <DashboardView
                  donations={donations}
                  messages={messages}
                  activities={activities}
                />
              )}
              {activeTab === 'don' && (
                <DonationView
                  donations={donations}
                  onUpdateDonation={handleUpdateDonation}
                  onShowToast={showToast}
                  onAddActivity={addActivity}
                />
              )}
              {activeTab === 'pay' && (
                <PaymentsView
                  payments={payments}
                  withdrawals={withdrawals}
                  wallets={wallets}
                  onUpdatePayments={(next) => {
                    saveSharedPayments(next);
                    setPayments(next);
                  }}
                  onUpdateWithdrawals={(next) => {
                    saveSharedWithdrawals(next);
                    setWithdrawals(next);
                  }}
                  onUpdateWallets={(next) => {
                    saveSharedWallets(next);
                    setWallets(next);
                  }}
                  onShowToast={showToast}
                  onAddActivity={addActivity}
                />
              )}
              {activeTab === 'msg' && (
                <MessageView
                  messages={messages}
                  onReplyMessage={handleReplyMessage}
                  onShowToast={showToast}
                  onAddActivity={addActivity}
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* Modal Konfirmasi Logout */}
      {isLogoutModalOpen && (
        <ModalWrapper maxWidth={400} onClose={() => setIsLogoutModalOpen(false)}>
          <div className="mb cf">
            <div className="cfi">
              <Icon name="out" />
            </div>
            <h2>Keluar dari akun admin?</h2>
            <p>Anda akan keluar dan kembali ke halaman login.</p>
          </div>
          <div
            className="mf"
            style={{ justifyContent: 'center', border: 0, paddingTop: '4px' }}
          >
            <button
              className="btn o"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Batal
            </button>
            <button className="btn" onClick={handleLogout}>
              Ya, keluar
            </button>
          </div>
        </ModalWrapper>
      )}
    </>
  );
}