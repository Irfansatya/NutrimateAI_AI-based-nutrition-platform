'use client';

import { useState, useMemo } from 'react';
import { formatDaysAgo, formatRupiah, getProgressPercent, getRecipientLabel, getTotalCost } from '@/lib/admin/format';
import { StatusBadge } from '@/component/admin/ui/Badge';
import { ReviewModal } from '@/component/admin/donations/ReviewModal';
interface DonationViewProps {
  donations: any[];
  onUpdateDonation: (id: any, newStatus: string, note?: string) => Promise<any> | any;
  onShowToast: (msg: string) => void;
  onAddActivity: (msg: string) => void;
  error?: string | null;
  onRetry?: () => void;
}

export const DonationView = ({
  donations,
  onUpdateDonation,
  onShowToast,
  onAddActivity,
  error,
  onRetry,
}: DonationViewProps) => {
  const [filter, setFilter] = useState('review');
  const [activeDonationId, setActiveDonationId] = useState<number | string | null>(null);

  const tabs = [
    ['review', 'Menunggu'],
    ['revisi', 'Revisi'],
    ['disetujui', 'Aktif'],
    ['selesai', 'Selesai'],
    ['ditolak', 'Ditolak']
  ];

  const getCount = (st: string) => donations.filter((p: any) => p.st === st).length;
  const filteredDonations = donations.filter((p: any) => p.st === filter);

  const selectedDonation = useMemo(
    () => donations.find((p: any) => p.id === activeDonationId),
    [donations, activeDonationId]
  );

  const handleFinishReview = async (newStatus: string, activityMessage: string, note?: string) => {
    if (!activeDonationId) return;
    const res = await onUpdateDonation(activeDonationId, newStatus, note);
    if (res && res.success === false) return;
    onAddActivity(activityMessage);
    setActiveDonationId(null);
    setFilter(newStatus);
  };

  return (
    <>
      <div className="seg" role="tablist">
        {tabs.map((t) => (
          <button
            key={t[0]}
            role="tab"
            className={filter === t[0] ? 'on' : ''}
            onClick={() => setFilter(t[0])}
          >
            {t[1]} ({getCount(t[0])})
          </button>
        ))}
      </div>

      {error ? (
        <div className="c empty" style={{ color: '#d9383a', padding: '32px 16px', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Gagal Memuat Pengajuan Donasi</p>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>{error}</p>
          {onRetry && (
            <button className="btn o" onClick={onRetry}>
              Coba Lagi
            </button>
          )}
        </div>
      ) : filteredDonations.length ? (
        filteredDonations.map((p: any) => (
          <div className="row" key={p.id}>
            <div>
              <StatusBadge status={p.st} />
              <h3>{p.judul}</h3>
              <p>
                Pemohon {p.pem} · Penerima {getRecipientLabel(p)} · {p.kota}
                <br />
                Target {formatRupiah(getTotalCost(p))} · {formatDaysAgo(p.d)}
              </p>
              {['disetujui', 'selesai'].includes(p.st) && (
                <div className="mini">
                  <div className="pg">
                    <i style={{ width: `${getProgressPercent(p)}%` }}></i>
                  </div>
                  {formatRupiah(p.col)} terkumpul ({getProgressPercent(p)}%)
                </div>
              )}
            </div>
            <button
              className={`btn ${p.st === 'review' ? '' : 'o'}`}
              onClick={() => setActiveDonationId(p.id)}
            >
              {p.st === 'review' ? 'Tinjau' : 'Lihat detail'}
            </button>
          </div>
        ))
      ) : (
        <div className="c empty">Tidak ada pengajuan pada status ini.</div>
      )}

      {selectedDonation && (
        <ReviewModal
          donation={selectedDonation}
          onClose={() => setActiveDonationId(null)}
          onFinish={handleFinishReview}
        />
      )}
    </>
  );
};
