'use client';

import React from 'react';

export const AdminSkeleton = ({ type }: { type: 'dash' | 'don' | 'pay' | 'msg' }) => {
  if (type === 'dash') {
    return (
      <div className="adm-skel-wrapper" aria-busy="true" aria-label="Memuat data dashboard">
        {/* Metric Cards Skeleton */}
        <div className="cards">
          {[1, 2, 3].map((i) => (
            <div className="c k adm-skel-card" key={i}>
              <div className="adm-skel-box adm-skel-ic" />
              <div style={{ flex: 1 }}>
                <div className="adm-skel-box adm-skel-line" style={{ width: '60%', height: 14, marginBottom: 8 }} />
                <div className="adm-skel-box adm-skel-line" style={{ width: '40%', height: 28, marginBottom: 6 }} />
                <div className="adm-skel-box adm-skel-line" style={{ width: '75%', height: 12 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Two Columns Section Skeleton */}
        <div className="two">
          <div className="c adm-skel-card">
            <div className="adm-skel-box adm-skel-line" style={{ width: '45%', height: 20, marginBottom: 18 }} />
            <div className="adm-skel-box" style={{ width: '100%', height: 240, borderRadius: 14 }} />
          </div>
          <div className="c adm-skel-card">
            <div className="adm-skel-box adm-skel-line" style={{ width: '40%', height: 20, marginBottom: 18 }} />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid #eef0f4' }}>
                <div className="adm-skel-box" style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 6 }} />
                <div style={{ flex: 1 }}>
                  <div className="adm-skel-box adm-skel-line" style={{ width: '85%', height: 14, marginBottom: 6 }} />
                  <div className="adm-skel-box adm-skel-line" style={{ width: '30%', height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'don') {
    return (
      <div className="adm-skel-wrapper" aria-busy="true" aria-label="Memuat verifikasi open donasi">
        {/* Segmented Filter Skeleton */}
        <div className="adm-skel-box" style={{ width: 360, height: 42, borderRadius: 999, marginBottom: 20 }} />

        {/* Row Items Skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div className="row adm-skel-card" key={i} style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div className="adm-skel-box adm-skel-badge" style={{ width: 120, height: 22, marginBottom: 10 }} />
              <div className="adm-skel-box adm-skel-line" style={{ width: '65%', height: 18, marginBottom: 8 }} />
              <div className="adm-skel-box adm-skel-line" style={{ width: '45%', height: 14, marginBottom: 6 }} />
              <div className="adm-skel-box adm-skel-line" style={{ width: '35%', height: 14 }} />
            </div>
            <div className="adm-skel-box adm-skel-btn" style={{ width: 110, height: 40, borderRadius: 999 }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'pay') {
    return (
      <div className="adm-skel-wrapper" aria-busy="true" aria-label="Memuat pembayaran dan penarikan">
        {/* Sub-navigation tabs skeleton */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--b)', paddingBottom: 14 }}>
          <div className="adm-skel-box" style={{ width: 180, height: 38, borderRadius: 999 }} />
          <div className="adm-skel-box" style={{ width: 180, height: 38, borderRadius: 999 }} />
        </div>

        {/* Cards & Rows Skeleton */}
        <div style={{ display: 'grid', gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div className="row adm-skel-card" key={i} style={{ alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div className="adm-skel-box adm-skel-badge" style={{ width: 130, height: 22 }} />
                  <div className="adm-skel-box adm-skel-badge" style={{ width: 90, height: 22 }} />
                </div>
                <div className="adm-skel-box adm-skel-line" style={{ width: '50%', height: 18, marginBottom: 8 }} />
                <div className="adm-skel-box adm-skel-line" style={{ width: '70%', height: 14, marginBottom: 6 }} />
                <div className="adm-skel-box adm-skel-line" style={{ width: '40%', height: 14 }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="adm-skel-box adm-skel-btn" style={{ width: 44, height: 44, borderRadius: 12 }} />
                <div className="adm-skel-box adm-skel-btn" style={{ width: 44, height: 44, borderRadius: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // type === 'msg'
  return (
    <div className="ms adm-skel-wrapper" aria-busy="true" aria-label="Memuat pesan pengguna">
      <div className="adm-skel-card">
        <div className="adm-skel-box" style={{ width: '100%', height: 42, borderRadius: 999, marginBottom: 12 }} />
        <div className="adm-skel-box" style={{ width: '100%', height: 36, borderRadius: 999, marginBottom: 14 }} />
        {[1, 2, 3, 4].map((i) => (
          <div className="adm-skel-card" key={i} style={{ padding: 14, border: '1px solid var(--b)', borderRadius: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="adm-skel-box adm-skel-line" style={{ width: '45%', height: 16 }} />
              <div className="adm-skel-box adm-skel-line" style={{ width: '20%', height: 12 }} />
            </div>
            <div className="adm-skel-box adm-skel-line" style={{ width: '90%', height: 14, marginBottom: 6 }} />
            <div className="adm-skel-box adm-skel-badge" style={{ width: 70, height: 20 }} />
          </div>
        ))}
      </div>
      <div className="c adm-skel-card" style={{ minHeight: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div className="adm-skel-box adm-skel-line" style={{ width: '35%', height: 22, marginBottom: 8 }} />
            <div className="adm-skel-box adm-skel-line" style={{ width: '25%', height: 14 }} />
          </div>
          <div className="adm-skel-box adm-skel-badge" style={{ width: 80, height: 24 }} />
        </div>
        <div className="adm-skel-box" style={{ width: '100%', height: 140, borderRadius: 14, marginBottom: 20 }} />
        <div className="adm-skel-box" style={{ width: '100%', height: 110, borderRadius: 14 }} />
      </div>
    </div>
  );
};
