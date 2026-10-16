'use client';

import { useMemo } from 'react';
import { formatDaysAgo } from '@/lib/admin/format';
import { Icon } from '../ui/Icon';
import { GrowthChart } from './GrowthChart';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DashboardView = ({ donations, messages, activities }: { donations: any[]; messages: any[]; activities: any[] }) => {
  const activeDonationsCount = useMemo(
    () => donations.filter((p: any) => p.st === 'disetujui').length,
    [donations]
  );
  const unrepliedMessagesCount = useMemo(
    () => messages.filter((m: any) => !m.r).length,
    [messages]
  );
  const totalBeneficiaries = useMemo(
    () => donations.filter((p: any) => ['disetujui', 'selesai'].includes(p.st)).length,
    [donations]
  );

  return (
    <>
      <div className="cards">
        <div className="c k">
          <span className="ic"><Icon name="h" /></span>
          <div>
            <small>Open Donasi Aktif</small>
            <b className="n">{activeDonationsCount}</b>
            <span className="h">sedang berjalan</span>
          </div>
        </div>
        <div className="c k">
          <span className="ic"><Icon name="m" /></span>
          <div>
            <small>Pesan Belum Dibalas</small>
            <b className="n">{unrepliedMessagesCount}</b>
            <span className="h">perlu ditindaklanjuti</span>
          </div>
        </div>
        <div className="c k">
          <span className="ic"><Icon name="g" /></span>
          <div>
            <small>Total Penerima Bantuan</small>
            <b className="n">{totalBeneficiaries}</b>
            <span className="h">aktif dan selesai</span>
          </div>
        </div>
      </div>

      <div className="two">
        <div className="c">
          <h2>Pertumbuhan Pengguna</h2>
          <GrowthChart />
        </div>
        <div className="c">
          <h2>Aktivitas Terbaru</h2>
          {activities.slice(0, 5).map((act: any, idx: number) => (
            <div className="act" key={idx}>
              <i className="dot"></i>
              <div>
                <p>{act[0]}</p>
                <small>{formatDaysAgo(act[1])}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
