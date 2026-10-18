'use client';

import React, { useState, useMemo } from 'react';
import {
  type QrisPaymentRecord,
  type WithdrawalRecord,
  saveStoredPayments,
  saveStoredWithdrawals,
  saveStoredWallets
} from '@/lib/admin/data/payments';
import { formatRupiah } from '@/lib/admin/format';
import { StatusBadge } from '@/component/admin/ui/Badge';
import { Icon } from '@/component/admin/ui/Icon';
import { ModalWrapper } from '@/component/admin/ui/ModalWrapper';

interface PaymentsViewProps {
  payments: QrisPaymentRecord[];
  withdrawals: WithdrawalRecord[];
  wallets: Record<string, number>;
  onUpdatePayments: (next: QrisPaymentRecord[]) => void;
  onUpdateWithdrawals: (next: WithdrawalRecord[]) => void;
  onUpdateWallets: (next: Record<string, number>) => void;
  onShowToast: (msg: string) => void;
  onAddActivity: (text: string, dayAgo?: number) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  withdrawals,
  wallets,
  onUpdatePayments,
  onUpdateWithdrawals,
  onUpdateWallets,
  onShowToast,
  onAddActivity
}) => {
  const [activeSection, setActiveSection] = useState<'qris' | 'withdraw'>('qris');
  const [qrisFilter, setQrisFilter] = useState<'all' | 'verifikasi' | 'berhasil' | 'gagal'>('verifikasi');
  const [wdFilter, setWdFilter] = useState<'all' | 'diproses' | 'selesai'>('diproses');

  // Modal State untuk Verifikasi QRIS
  const [verifyModal, setVerifyModal] = useState<{
    open: boolean;
    payment: QrisPaymentRecord | null;
    decision: 'berhasil' | 'gagal';
    isSubmitting: boolean;
  }>({
    open: false,
    payment: null,
    decision: 'berhasil',
    isSubmitting: false
  });

  // Modal State untuk Konfirmasi Pencairan Dana
  const [wdModal, setWdModal] = useState<{
    open: boolean;
    withdrawal: WithdrawalRecord | null;
    isSubmitting: boolean;
  }>({
    open: false,
    withdrawal: null,
    isSubmitting: false
  });

  // Filter QRIS Payments
  const filteredPayments = useMemo(() => {
    if (qrisFilter === 'all') return payments;
    return payments.filter((p) => p.status === qrisFilter);
  }, [payments, qrisFilter]);

  // Filter Withdrawals
  const filteredWithdrawals = useMemo(() => {
    if (wdFilter === 'all') return withdrawals;
    return withdrawals.filter((w) => w.status === wdFilter);
  }, [withdrawals, wdFilter]);

  // Hitung Waktu 24 Jam
  const getDeadlineInfo = (createdAt: number) => {
    const deadline = createdAt + 24 * 3600 * 1000;
    const now = Date.now();
    const diff = deadline - now;

    if (diff <= 0) {
      const overdueHours = Math.floor(Math.abs(diff) / (3600 * 1000));
      return {
        isOverdue: true,
        isWarning: false,
        text: `Melebihi batas (${overdueHours} jam lalu)`,
        tagClass: 'bd bad'
      };
    }

    const remainingHours = Math.floor(diff / (3600 * 1000));
    const remainingMinutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));

    if (remainingHours <= 3) {
      return {
        isOverdue: false,
        isWarning: true,
        text: `Sisa waktu: ${remainingHours} jam ${remainingMinutes} mnt`,
        tagClass: 'bd warn'
      };
    }

    return {
      isOverdue: false,
      isWarning: false,
      text: `Sisa waktu: ${remainingHours} jam`,
      tagClass: 'bd info'
    };
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle Eksekusi Verifikasi QRIS
  const handleConfirmQrisVerification = () => {
    if (!verifyModal.payment || verifyModal.isSubmitting) return;

    setVerifyModal((prev) => ({ ...prev, isSubmitting: true }));
    const payment = verifyModal.payment;
    const decision = verifyModal.decision;

    setTimeout(() => {
      // 1. Update status pembayaran (idempotent: cek status sebelum kredit)
      const nextPayments = payments.map((p) => {
        if (p.id === payment.id) {
          return {
            ...p,
            status: decision,
            verifiedAt: Date.now(),
            verifiedBy: 'Admin 01'
          };
        }
        return p;
      });

      // 2. Jika berhasil dan belum pernah dikreditkan, tambahkan ke NutriWallet penerima
      let nextWallets = { ...wallets };
      if (decision === 'berhasil' && payment.status === 'verifikasi') {
        const currentBal = nextWallets[payment.recipient] || 0;
        nextWallets[payment.recipient] = currentBal + payment.amount;
        saveStoredWallets(nextWallets);
        onUpdateWallets(nextWallets);
      }

      saveStoredPayments(nextPayments);
      onUpdatePayments(nextPayments);

      const decisionText = decision === 'berhasil' ? 'diverifikasi berhasil' : 'ditandai gagal/tidak diterima';
      onAddActivity(`Pembayaran ${payment.id} sebesar ${formatRupiah(payment.amount)} ${decisionText}`, 0);
      onShowToast(
        decision === 'berhasil'
          ? `Pembayaran ${payment.id} berhasil diverifikasi. Saldo ${payment.recipient} bertambah.`
          : `Pembayaran ${payment.id} ditandai tidak diterima.`
      );

      setVerifyModal({
        open: false,
        payment: null,
        decision: 'berhasil',
        isSubmitting: false
      });
    }, 400);
  };

  // Handle Eksekusi Selesai Pencairan Dana
  const handleConfirmWithdrawal = () => {
    if (!wdModal.withdrawal || wdModal.isSubmitting) return;

    setWdModal((prev) => ({ ...prev, isSubmitting: true }));
    const wd = wdModal.withdrawal;

    setTimeout(() => {
      // 1. Update status pengajuan pencairan (idempotent)
      const nextWithdrawals = withdrawals.map((w) => {
        if (w.id === wd.id) {
          return {
            ...w,
            status: 'selesai' as const,
            processedAt: Date.now(),
            processedBy: 'Admin 01'
          };
        }
        return w;
      });

      // 2. Potong saldo NutriWallet penerima jika sebelumnya 'diproses'
      let nextWallets = { ...wallets };
      if (wd.status === 'diproses') {
        const currentBal = nextWallets[wd.userName] || 0;
        nextWallets[wd.userName] = Math.max(0, currentBal - wd.amount);
        saveStoredWallets(nextWallets);
        onUpdateWallets(nextWallets);
      }

      saveStoredWithdrawals(nextWithdrawals);
      onUpdateWithdrawals(nextWithdrawals);

      onAddActivity(`Pencairan dana ${wd.id} (${formatRupiah(wd.amount)}) ke ${wd.userName} telah selesai ditransfer`, 0);
      onShowToast(`Pencairan dana untuk ${wd.userName} berhasil diselesaikan.`);

      setWdModal({
        open: false,
        withdrawal: null,
        isSubmitting: false
      });
    }, 400);
  };

  return (
    <div className="pay-view-root">
      {/* Tab Switcher: Section A vs Section B */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, borderBottom: '1px solid var(--b)', paddingBottom: 16 }}>
        <button
          className={`btn ${activeSection === 'qris' ? '' : 'o'}`}
          onClick={() => setActiveSection('qris')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ width: 18, height: 18, display: 'inline-block' }}>
            <Icon name="qris" />
          </span>
          <span>Verifikasi Pembayaran QRIS</span>
          {payments.filter((p) => p.status === 'verifikasi').length > 0 && (
            <span
              style={{
                background: activeSection === 'qris' ? '#fff' : 'var(--g)',
                color: activeSection === 'qris' ? 'var(--g)' : '#fff',
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999
              }}
            >
              {payments.filter((p) => p.status === 'verifikasi').length}
            </span>
          )}
        </button>

        <button
          className={`btn ${activeSection === 'withdraw' ? '' : 'o'}`}
          onClick={() => setActiveSection('withdraw')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ width: 18, height: 18, display: 'inline-block' }}>
            <Icon name="wallet" />
          </span>
          <span>Pengajuan Pencairan Dana</span>
          {withdrawals.filter((w) => w.status === 'diproses').length > 0 && (
            <span
              style={{
                background: activeSection === 'withdraw' ? '#fff' : 'var(--g)',
                color: activeSection === 'withdraw' ? 'var(--g)' : '#fff',
                fontSize: 12,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999
              }}
            >
              {withdrawals.filter((w) => w.status === 'diproses').length}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION A: VERIFIKASI PEMBAYARAN QRIS                          */}
      {/* ============================================================== */}
      {activeSection === 'qris' && (
        <section aria-label="Verifikasi Pembayaran QRIS">
          {/* Sub Filter */}
          <div className="seg" role="tablist">
            {[
              ['verifikasi', `Menunggu (${payments.filter((p) => p.status === 'verifikasi').length})`],
              ['berhasil', `Berhasil (${payments.filter((p) => p.status === 'berhasil').length})`],
              ['gagal', `Gagal (${payments.filter((p) => p.status === 'gagal').length})`],
              ['all', `Semua (${payments.length})`]
            ].map(([val, label]) => (
              <button
                key={val}
                role="tab"
                className={qrisFilter === val ? 'on' : ''}
                onClick={() => setQrisFilter(val as any)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* List Kartu Verifikasi QRIS */}
          {filteredPayments.length === 0 ? (
            <div className="empty">
              <p>Tidak ada data transaksi pembayaran QRIS pada filter ini.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {filteredPayments.map((p) => {
                const deadline = getDeadlineInfo(p.createdAt);
                const isPending = p.status === 'verifikasi';

                return (
                  <div
                    key={p.id}
                    className="row"
                    style={{
                      borderLeft: isPending && deadline.isOverdue ? '4px solid #b42318' : isPending && deadline.isWarning ? '4px solid #f59e0b' : undefined
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                        <StatusBadge status={p.status} />
                        <span className="bd info" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {p.id}
                        </span>
                        {isPending && (
                          <span className={deadline.tagClass} title="Batas waktu konfirmasi manual 24 jam">
                            {deadline.text}
                          </span>
                        )}
                        {p.verifiedBy && (
                          <span className="bd" style={{ color: 'var(--s)' }}>
                            Oleh {p.verifiedBy}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: 18, marginBottom: 4 }}>
                        {formatRupiah(p.amount)} · {p.donorName} {p.anonymous && <small style={{ color: 'var(--m)' }}>(Anonim)</small>}
                      </h3>

                      <p style={{ color: 'var(--s)', fontSize: 14 }}>
                        Untuk: <b>{p.recipient}</b> — <i>{p.campaignTitle}</i>
                      </p>

                      {p.message && (
                        <p style={{ marginTop: 6, fontStyle: 'italic', color: '#475467', background: 'var(--f)', padding: '6px 12px', borderRadius: 8 }}>
                          &ldquo;{p.message}&rdquo;
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--m)' }}>
                        <span>Waktu Transaksi: {formatDate(p.createdAt)}</span>
                        {p.verifiedAt && <span>Diverifikasi: {formatDate(p.verifiedAt)}</span>}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {isPending ? (
                        <>
                          <button
                            className="btn"
                            title="Tandai pembayaran diterima dan berhasil"
                            aria-label={`Konfirmasi pembayaran ${p.id}`}
                            onClick={() =>
                              setVerifyModal({
                                open: true,
                                payment: p,
                                decision: 'berhasil',
                                isSubmitting: false
                              })
                            }
                            style={{
                              width: 44,
                              height: 44,
                              padding: 0,
                              borderRadius: 12,
                              display: 'grid',
                              placeItems: 'center'
                            }}
                          >
                            <span style={{ width: 20, height: 20 }}>
                              <Icon name="check" />
                            </span>
                          </button>
                          <button
                            className="btn r"
                            title="Tolak / pembayaran tidak diterima"
                            aria-label={`Tolak pembayaran ${p.id}`}
                            onClick={() =>
                              setVerifyModal({
                                open: true,
                                payment: p,
                                decision: 'gagal',
                                isSubmitting: false
                              })
                            }
                            style={{
                              width: 44,
                              height: 44,
                              padding: 0,
                              borderRadius: 12,
                              display: 'grid',
                              placeItems: 'center'
                            }}
                          >
                            <span style={{ width: 20, height: 20 }}>
                              <Icon name="x" />
                            </span>
                          </button>
                        </>
                      ) : (
                        <span className="mut" style={{ fontSize: 13 }}>
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* SECTION B: PENGAJUAN PENCAIRAN DANA                            */}
      {/* ============================================================== */}
      {activeSection === 'withdraw' && (
        <section aria-label="Pengajuan Pencairan Dana">
          {/* Sub Filter */}
          <div className="seg" role="tablist">
            {[
              ['diproses', `Menunggu Transfer (${withdrawals.filter((w) => w.status === 'diproses').length})`],
              ['selesai', `Selesai (${withdrawals.filter((w) => w.status === 'selesai').length})`],
              ['all', `Semua (${withdrawals.length})`]
            ].map(([val, label]) => (
              <button
                key={val}
                role="tab"
                className={wdFilter === val ? 'on' : ''}
                onClick={() => setWdFilter(val as any)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* List Kartu Pencairan */}
          {filteredWithdrawals.length === 0 ? (
            <div className="empty">
              <p>Tidak ada permohonan pencairan dana pada filter ini.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {filteredWithdrawals.map((w) => {
                const isPending = w.status === 'diproses';
                const currentWalletBal = wallets[w.userName] ?? 0;

                return (
                  <div key={w.id} className="row">
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <StatusBadge status={w.status === 'selesai' ? 'selesai_wd' : 'diproses'} />
                        <span className="bd info" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {w.id}
                        </span>
                        <span className="bd" style={{ color: 'var(--s)' }}>
                          Saldo dompet saat ini: {formatRupiah(currentWalletBal)}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 18, marginBottom: 4 }}>
                        {formatRupiah(w.amount)} · Pemohon: <b>{w.userName}</b>
                      </h3>

                      <p style={{ color: 'var(--s)', fontSize: 14 }}>
                        Rekening Tujuan: <b>{w.bank}</b> · No: <span style={{ fontFamily: 'monospace' }}>{w.acct}</span> a.n. <b>{w.name}</b>
                      </p>

                      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--m)' }}>
                        <span>Waktu Pengajuan: {formatDate(w.createdAt)}</span>
                        {w.processedAt && (
                          <span>
                            Ditransfer: {formatDate(w.processedAt)} ({w.processedBy})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Selesai */}
                    <div>
                      {isPending ? (
                        <button
                          className="btn"
                          onClick={() =>
                            setWdModal({
                              open: true,
                              withdrawal: w,
                              isSubmitting: false
                            })
                          }
                          style={{ minWidth: 100 }}
                        >
                          Selesai
                        </button>
                      ) : (
                        <span className="mut" style={{ fontSize: 13 }}>
                          Ditransfer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* MODAL KONFIRMASI VERIFIKASI QRIS                               */}
      {/* ============================================================== */}
      {verifyModal.open && verifyModal.payment && (
        <ModalWrapper maxWidth={480} onClose={() => !verifyModal.isSubmitting && setVerifyModal((prev) => ({ ...prev, open: false }))}>
          <div className="mb cf">
            <div
              className="cfi"
              style={{
                background: verifyModal.decision === 'berhasil' ? 'var(--gl)' : '#fde7e5',
                color: verifyModal.decision === 'berhasil' ? 'var(--g)' : '#b42318'
              }}
            >
              <Icon name={verifyModal.decision === 'berhasil' ? 'check' : 'x'} />
            </div>
            <h2>
              {verifyModal.decision === 'berhasil'
                ? 'Konfirmasi Pembayaran Diterima'
                : 'Konfirmasi Pembayaran Gagal'}
            </h2>
            <p>
              Pastikan dana mutasi pada rekening QRIS platform telah diperiksa sebelum mengambil keputusan verifikasi.
            </p>

            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: 'var(--f)',
                borderRadius: 14,
                textAlign: 'left',
                border: '1px solid var(--b)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Nomor Transaksi:</span>
                <b style={{ fontFamily: 'monospace' }}>{verifyModal.payment.id}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Nominal Donasi:</span>
                <b style={{ color: 'var(--g)', fontSize: 16 }}>{formatRupiah(verifyModal.payment.amount)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Donatur:</span>
                <b>
                  {verifyModal.payment.donorName} {verifyModal.payment.anonymous && '(Anonim)'}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Penerima:</span>
                <b>{verifyModal.payment.recipient}</b>
              </div>
            </div>
          </div>

          <div className="mf" style={{ justifyContent: 'center', border: 0, paddingTop: 4 }}>
            <button
              className="btn o"
              disabled={verifyModal.isSubmitting}
              onClick={() => setVerifyModal((prev) => ({ ...prev, open: false }))}
            >
              Batal
            </button>
            <button
              className={`btn ${verifyModal.decision === 'berhasil' ? '' : 'r'}`}
              disabled={verifyModal.isSubmitting}
              onClick={handleConfirmQrisVerification}
            >
              {verifyModal.isSubmitting ? 'Memproses...' : 'Verifikasi'}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ============================================================== */}
      {/* MODAL KONFIRMASI SELESAI PENCAIRAN DANA                       */}
      {/* ============================================================== */}
      {wdModal.open && wdModal.withdrawal && (
        <ModalWrapper maxWidth={500} onClose={() => !wdModal.isSubmitting && setWdModal((prev) => ({ ...prev, open: false }))}>
          <div className="mb cf">
            <div className="cfi">
              <Icon name="bank" />
            </div>
            <h2>Konfirmasi Penyelesaian Transfer</h2>
            <p>
              Apakah Anda telah melakukan transfer dana secara manual ke rekening tujuan pemohon? Tindakan ini akan memotong saldo NutriWallet pemohon.
            </p>

            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: 'var(--f)',
                borderRadius: 14,
                textAlign: 'left',
                border: '1px solid var(--b)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Pemohon:</span>
                <b>{wdModal.withdrawal.userName}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Nominal Penarikan:</span>
                <b style={{ color: 'var(--g)', fontSize: 16 }}>{formatRupiah(wdModal.withdrawal.amount)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Bank Tujuan:</span>
                <b>{wdModal.withdrawal.bank}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Nomor Rekening:</span>
                <b style={{ fontFamily: 'monospace' }}>{wdModal.withdrawal.acct}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--s)', fontSize: 14 }}>Atas Nama:</span>
                <b>{wdModal.withdrawal.name}</b>
              </div>
            </div>
          </div>

          <div className="mf" style={{ justifyContent: 'center', border: 0, paddingTop: 4 }}>
            <button
              className="btn o"
              disabled={wdModal.isSubmitting}
              onClick={() => setWdModal((prev) => ({ ...prev, open: false }))}
            >
              Kembali
            </button>
            <button
              className="btn"
              disabled={wdModal.isSubmitting}
              onClick={handleConfirmWithdrawal}
            >
              {wdModal.isSubmitting ? 'Memproses...' : 'Selesai'}
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};
