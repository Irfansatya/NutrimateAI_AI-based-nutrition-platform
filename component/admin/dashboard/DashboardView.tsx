'use client';

import { GrowthChart } from './GrowthChart';
import { type DashboardSummary } from '@/lib/admin/dashboard/client';

function timeAgo(isoTs: string): string {
  const diff = Date.now() - new Date(isoTs).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

interface Props {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function Sk({ w = 80, h = 20 }: { w?: number; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: 'linear-gradient(90deg,#e8eded 25%,#d4dbd9 50%,#e8eded 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        display: 'inline-block',
      }}
    />
  );
}

export const DashboardView = ({ summary, loading, error, onRetry }: Props) => {
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ color: '#d9383a', fontWeight: 600 }}>Gagal memuat data dashboard</p>
        <p style={{ color: '#666', marginTop: 6, fontSize: 14 }}>{error}</p>
        <button
          onClick={onRetry}
          style={{
            marginTop: 16,
            padding: '8px 20px',
            background: '#05976A',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="cards">
        <div className="c k">
          <span className="ic">🏠</span>
          <div>
            <small>Open Donasi Aktif</small>
            <b className="n">{loading ? <Sk w={40} /> : (summary?.activeCampaigns ?? 0)}</b>
            <span className="h">sedang berjalan</span>
          </div>
        </div>
        <div className="c k">
          <span className="ic">✉️</span>
          <div>
            <small>Pesan Belum Dibalas</small>
            <b className="n">{loading ? <Sk w={40} /> : (summary?.unrepliedMessages ?? 0)}</b>
            <span className="h">perlu ditindaklanjuti</span>
          </div>
        </div>
        <div className="c k">
          <span className="ic">👥</span>
          <div>
            <small>Total Penerima Bantuan</small>
            <b className="n">{loading ? <Sk w={40} /> : (summary?.totalRecipients ?? 0)}</b>
            <span className="h">aktif dan selesai</span>
          </div>
        </div>
      </div>

      <div className="two">
        <div className="c">
          <h2>Pertumbuhan Pengguna</h2>
          {loading || !summary ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sk w={600} h={160} />
            </div>
          ) : (
            <GrowthChart data={summary.monthlyUserGrowth} />
          )}
        </div>
        <div className="c">
          <h2>Aktivitas Terbaru</h2>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div className="act" key={i}>
                <i className="dot" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Sk w={220} h={14} />
                  <Sk w={80} h={12} />
                </div>
              </div>
            ))
          ) : !summary || summary.recentActivity.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 14 }}>Belum ada aktivitas tercatat.</p>
          ) : (
            summary.recentActivity.slice(0, 8).map((act, idx) => (
              <div className="act" key={idx}>
                <i className="dot" />
                <div>
                  <p>{act.text}</p>
                  <small>{timeAgo(act.ts)}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
