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
  getVisitedAdminPages,
  markAdminPageVisited
} from '@/lib/admin/session';
import { apiGetMe, apiLogout, type SafeAuthUser } from '@/lib/auth/client';
import { apiGetAdminCampaigns, apiAdminReviewCampaign } from '@/lib/nutrihelp/client';
import { apiGetAdminDonations, apiAdminVerifyDonation } from '@/lib/nutriassist/client';
import {
  apiGetAdminWithdrawals,
  apiAdminCompleteWithdrawal,
  apiAdminRejectWithdrawal,
} from '@/lib/nutriwallet/client';
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
  id: number | string;
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
  const [adminUser, setAdminUser] = useState<SafeAuthUser | null>(null);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'dash' | 'don' | 'pay' | 'msg'>('dash');

  // State Data dengan Type Casting
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationsError, setDonationsError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES as Message[]);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES as Activity[]);

  // State Pembayaran & Penarikan
  const [payments, setPayments] = useState<QrisPaymentRecord[]>([]);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);
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

  // Helper konversi HelpCampaign DB ke Donation item Admin
  const mapDbCampaignToAdminDonation = useCallback((camp: any): Donation => {
    const stMap: Record<string, string> = {
      REVIEW: 'review',
      REVISION: 'revisi',
      REJECTED: 'ditolak',
      APPROVED: 'disetujui',
      ACTIVE: 'disetujui', // Admin mengelompokkan active/approved ke tab 'disetujui' (Aktif)
      COMPLETED: 'selesai',
      CANCELED: 'ditolak',
    };

    const docObj = (camp.documents || {}) as any;
    const manifest = docObj.manifest || {};
    const docs = [
      ...(manifest.ktp || []),
      ...(manifest.kondisi || []),
      ...(manifest.ekonomi || []),
      ...(manifest.thumb || []),
    ];

    const confirmedDonationsSum = (camp.donations || []).reduce(
      (sum: number, d: any) => sum + Number(d.amount),
      0
    );

    const diffDays = Math.max(
      0,
      Math.floor((Date.now() - new Date(camp.submittedAt).getTime()) / 864e5)
    );

    return {
      id: camp.id, // String UUID kompatibel dengan review API
      pem: camp.applicantName,
      nm: camp.recipientName,
      ket: camp.category === 'PREGNANCY' ? 'Ibu hamil' : camp.category === 'BREASTFEEDING' ? 'Ibu menyusui' : 'Anak',
      kota: camp.city,
      judul: camp.title,
      story: camp.story,
      items: (camp.items || []).map((it: any) => ({
        n: it.name,
        q: it.quantity,
        c: Number(it.estimatedCost),
      })),
      st: stMap[camp.status] || 'review',
      d: diffDays,
      dur: camp.durationDays,
      docs: docs.length > 0 ? docs : ['KTP_Pemohon.jpg', 'Dokumen_Kondisi.pdf', 'Bukti_Ekonomi.pdf'],
      col: confirmedDonationsSum,
      dn: camp.donations?.length || 0,
      note: camp.adminNote || undefined,
    };
  }, []);

  // Fungsi reload data tersimpan dari backend PostgreSQL (Campaigns) dan shared localStorage (Payments, Withdrawals, Wallets)
  const refreshSharedData = useCallback(async () => {
    // 1. Ambil kampanye dari PostgreSQL via API
    setDonationsError(null);
    try {
      const campRes = await apiGetAdminCampaigns();
      if (campRes.success && Array.isArray(campRes.data?.campaigns)) {
        const dbDonations = campRes.data.campaigns.map(mapDbCampaignToAdminDonation);
        setDonations(dbDonations);
      } else {
        setDonations([]);
        setDonationsError(campRes.message || 'Gagal memuat kampanye dari server.');
      }
    } catch {
      setDonations([]);
      setDonationsError('Gagal terhubung ke server kampanye.');
    }

    // 2. Ambil donasi/pembayaran QRIS dari PostgreSQL via API
    setPaymentsError(null);
    try {
      const donRes = await apiGetAdminDonations();
      if (donRes.success && Array.isArray(donRes.data?.donations)) {
        const mappedPayments: QrisPaymentRecord[] = donRes.data.donations.map((d: any) => {
          let st: 'verifikasi' | 'berhasil' | 'gagal' = 'verifikasi';
          if (d.status === 'CONFIRMED') st = 'berhasil';
          else if (d.status === 'REJECTED') st = 'gagal';

          return {
            id: d.id,
            campaignId: d.campaignId,
            campaignTitle: d.campaign?.title || 'Open Donasi',
            recipient: d.campaign?.recipientName || 'Penerima',
            amount: Number(d.amount),
            donorName: d.isAnonymous ? 'Anonim' : d.donorName,
            anonymous: d.isAnonymous,
            message: d.message || undefined,
            method: 'QRIS',
            createdAt: new Date(d.createdAt).getTime(),
            status: st,
            verifiedAt: d.verifiedAt ? new Date(d.verifiedAt).getTime() : undefined,
            verifiedBy: d.verifierAdmin?.name || undefined,
          };
        });
        setPayments(mappedPayments);
      } else {
        setPayments([]);
        setPaymentsError(donRes.message || 'Gagal memuat transaksi donasi.');
      }
    } catch {
      setPayments([]);
      setPaymentsError('Gagal terhubung ke server transaksi donasi.');
    }

    // 3. Ambil permohonan pencairan dana dari PostgreSQL via API
    setWithdrawalsError(null);
    try {
      const wdRes = await apiGetAdminWithdrawals();
      if (wdRes.success && Array.isArray(wdRes.data?.withdrawals)) {
        const nextWalletsMap: Record<string, number> = {};
        const mappedWithdrawals: WithdrawalRecord[] = wdRes.data.withdrawals.map((w: any) => {
          let st: 'diproses' | 'selesai' = 'diproses';
          if (w.status === 'COMPLETED') st = 'selesai';

          const userName = w.user?.name || w.accountHolder || 'Penerima Bantuan';
          if (w.wallet) {
            nextWalletsMap[userName] = Number(w.wallet.balance);
          }

          return {
            id: w.id,
            userId: w.userId,
            userName,
            bank: w.bankName,
            acct: w.accountNumber,
            acctMasked: '•••• ' + String(w.accountNumber).slice(-4),
            name: w.accountHolder,
            amount: Number(w.amount),
            createdAt: new Date(w.createdAt).getTime(),
            status: st,
            processedAt: w.processedAt ? new Date(w.processedAt).getTime() : undefined,
            processedBy: w.processor?.name || undefined,
          };
        });
        setWithdrawals(mappedWithdrawals);
        if (Object.keys(nextWalletsMap).length > 0) {
          setWallets(nextWalletsMap);
        }
      } else {
        setWithdrawals([]);
        setWithdrawalsError(wdRes.message || 'Gagal memuat antrean penarikan dana.');
      }
    } catch {
      setWithdrawals([]);
      setWithdrawalsError('Gagal terhubung ke server penarikan dana.');
    }
  }, [mapDbCampaignToAdminDonation]);

  // Inisialisasi Session via Backend apiGetMe() & Listen Sync Events
  useEffect(() => {
    let isMounted = true;

    apiGetMe()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.user && res.data.user.role === 'ADMIN') {
          setIsLoggedIn(true);
          setAdminUser(res.data.user);
          refreshSharedData();
        } else {
          setIsLoggedIn(false);
          setAdminUser(null);
        }
        setIsVerifyingAuth(false);
      })
      .catch(() => {
        if (isMounted) {
          setIsLoggedIn(false);
          setAdminUser(null);
          setIsVerifyingAuth(false);
        }
      });

    const handleSync = () => {
      apiGetMe().then((res) => {
        if (res.success && res.data?.user && res.data.user.role === 'ADMIN') {
          refreshSharedData();
        }
      }).catch(() => {});
    };

    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      isMounted = false;
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

  const handleLoginSuccess = async () => {
    try {
      const res = await apiGetMe();
      if (res.success && res.data?.user && res.data.user.role === 'ADMIN') {
        setIsLoggedIn(true);
        setAdminUser(res.data.user);
        setActiveTab('dash');
        refreshSharedData();
      }
    } catch {
      // Fallback
      setIsLoggedIn(true);
      setActiveTab('dash');
      refreshSharedData();
    }
  };

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await apiLogout();
    } catch {}
    setIsLoggedIn(false);
    setAdminUser(null);
    clearAdminSession();
    showToast('Anda telah keluar.');
  };

  const addActivity = useCallback((text: string, dayAgo = 0) => {
    setActivities((prev) => [[text, dayAgo], ...prev]);
  }, []);

  const handleUpdateDonation = useCallback(async (id: any, newStatus: string, note?: string) => {
    // Jika id adalah UUID string (dari PostgreSQL)
    if (typeof id === 'string') {
      const decisionMap: Record<string, any> = {
        disetujui: 'APPROVED',
        revisi: 'REVISION_REQUESTED',
        ditolak: 'REJECTED',
      };
      const decision = decisionMap[newStatus];
      if (decision) {
        try {
          const res = await apiAdminReviewCampaign(id, { decision, note });
          if (!res.success) {
            showToast(res.message || 'Gagal menyimpan review.');
            return { success: false, message: res.message };
          }
          showToast('Hasil verifikasi terkirim. Pengguna akan diberi tahu lewat NutriHelp.');
          await refreshSharedData();
          return { success: true };
        } catch {
          showToast('Terjadi gangguan jaringan saat review.');
          return { success: false, message: 'Terjadi gangguan jaringan saat review.' };
        }
      }
    } else {
      updateCampaignStatusByAdmin(id, newStatus, note);
      showToast('Hasil verifikasi terkirim. Pengguna akan diberi tahu lewat NutriHelp.');
      await refreshSharedData();
      return { success: true };
    }
    await refreshSharedData();
    return { success: true };
  }, [refreshSharedData, showToast]);

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

  if (isVerifyingAuth) {
    return (
      <>
        <AdminStyleSheet />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f6' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span className="adm-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} aria-hidden="true" />
            <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Memverifikasi sesi admin...</span>
          </div>
        </div>
      </>
    );
  }

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
                  <b>{adminUser?.name || ADMIN_ACCOUNT.name}</b>
                  <small>{adminUser?.email || ADMIN_ACCOUNT.email}</small>
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
                  error={donationsError}
                  onRetry={refreshSharedData}
                />
              )}
              {activeTab === 'pay' && (
                <PaymentsView
                  payments={payments}
                  paymentsError={paymentsError}
                  withdrawals={withdrawals}
                  withdrawalsError={withdrawalsError}
                  wallets={wallets}
                  onVerifyPayment={async (paymentId, decision) => {
                    const apiDecision = decision === 'berhasil' ? 'CONFIRMED' : 'REJECTED';
                    const res = await apiAdminVerifyDonation(paymentId, { decision: apiDecision });
                    if (res.success) {
                      await refreshSharedData();
                    }
                    return res;
                  }}
                  onCompleteWithdrawal={async (withdrawalId) => {
                    const res = await apiAdminCompleteWithdrawal(withdrawalId);
                    if (res.success) {
                      await refreshSharedData();
                    }
                    return res;
                  }}
                  onRejectWithdrawal={async (withdrawalId, reason) => {
                    const res = await apiAdminRejectWithdrawal(withdrawalId, { reason });
                    if (res.success) {
                      await refreshSharedData();
                    }
                    return res;
                  }}
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