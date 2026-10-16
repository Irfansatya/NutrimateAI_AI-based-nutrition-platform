'use client';

import { useState } from 'react';
import { formatRupiah, getProgressPercent, getRecipientLabel, getTotalCost } from '@/lib/admin/format';
import { DocButton } from '@/component/admin/ui/DocButton';
import { ModalWrapper } from '@/component/admin/ui/ModalWrapper';
import { StatusBadge } from '@/component/admin/ui/Badge';
import { Donation } from '../NutrimateAIAdminApp';

interface ReviewModalProps {
  donation: Donation;
  onClose: () => void;
  onFinish: (newStatus: string, activityMessage: string, note?: string) => void;
}

export const ReviewModal = ({ donation, onClose, onFinish }: ReviewModalProps) => {
  const isEditable = donation.st === 'review';
  const isRunning = ['disetujui', 'selesai'].includes(donation.st);

  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);
  const [mode, setMode] = useState<'' | 'revisi' | 'tolak'>('');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const checklistLabels = [
    'Identitas pemohon sesuai KTP',
    'Bukti kondisi ibu/anak valid',
    'Bukti kondisi ekonomi valid',
    'Kebutuhan dan estimasi biaya wajar'
  ];

  const handleCheckboxChange = (index: number) => {
    const updated = [...checks];
    updated[index] = !updated[index];
    setChecks(updated);
  };

  const handleApprove = () => {
    onFinish('disetujui', `Pengajuan "${donation.judul}" disetujui, open donasi tayang`);
  };

  const handleSubmitRevisionOrReject = () => {
    if (note.trim().length < 10) {
      setErrorMsg('Catatan wajib diisi (minimal 10 karakter) agar pengguna tahu alasannya.');
      return;
    }
    const targetStatus = mode === 'revisi' ? 'revisi' : 'ditolak';
    const actionLabel = mode === 'revisi' ? 'Revisi diminta untuk ' : 'Pengajuan ditolak: ';
    onFinish(targetStatus, `${actionLabel}"${donation.judul}"`, note.trim());
  };

  return (
    <ModalWrapper maxWidth={760} onClose={onClose}>
      <div className="mb">
        <StatusBadge status={donation.st} />
        <h2>{donation.judul}</h2>

        <div className="g2">
          <div><small>Pemohon</small>{donation.pem}</div>
          <div><small>Penerima</small>{getRecipientLabel(donation)}</div>
          <div><small>Domisili</small>{donation.kota}</div>
          <div><small>Durasi</small>{donation.dur} hari</div>
        </div>

        <small className="lb">Cerita</small>
        <div className="msg">{donation.story}</div>

        <small className="lb">Dokumen terunggah</small>
        <div className="docs">
          {donation.docs.map((doc, idx) => (
            <DocButton key={idx} fileName={doc} />
          ))}
        </div>
        <p className="hint">Klik dokumen untuk membukanya di tab baru.</p>

        <table>
          <thead>
            <tr>
              <th>Bahan</th>
              <th>Jumlah</th>
              <th>Estimasi biaya</th>
            </tr>
          </thead>
          <tbody>
            {donation.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.n}</td>
                <td>{item.q}</td>
                <td>{formatRupiah(item.c)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}><b>Total target dana</b></td>
              <td><b>{formatRupiah(getTotalCost(donation))}</b></td>
            </tr>
          </tbody>
        </table>

        {isRunning && (
          <div className="fund">
            <div className="fh">
              <span>Dana terkumpul</span>
              <b>{getProgressPercent(donation)}%</b>
            </div>

            <div
              className="pg"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={getProgressPercent(donation)}
            >
              <i style={{ width: `${getProgressPercent(donation)}%` }}></i>
            </div>

            <div className="fs">
              <b>{formatRupiah(donation.col)}</b> terkumpul dari target{' '}
              {formatRupiah(getTotalCost(donation))} · {donation.dn} donasi masuk
            </div>
          </div>
        )}

        {donation.note && (
          <>
            <small className="lb">Catatan admin</small>
            <div className="msg">{donation.note}</div>
          </>
        )}

        {isEditable && (
          <>
            <div className="chk">
              {checklistLabels.map((lbl, idx) => (
                <label key={idx}>
                  <input
                    type="checkbox"
                    className="ck"
                    checked={checks[idx]}
                    onChange={() => handleCheckboxChange(idx)}
                  />
                  {lbl}
                </label>
              ))}
            </div>

            {mode && (
              <>
                <textarea
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={`${
                    mode === 'revisi'
                      ? 'Tulis bagian yang harus diperbaiki pengguna'
                      : 'Tulis alasan penolakan'
                  } (wajib, dikirim ke pengguna)`}
                  autoFocus
                />
                <div className="em">{errorMsg}</div>
              </>
            )}
          </>
        )}
      </div>

      <div className="mf">
        <button className="btn o" onClick={onClose}>
          Tutup
        </button>

        {isEditable && (
          <>
            {mode ? (
              <>
                <button className="btn o" onClick={() => setMode('')}>
                  Batal
                </button>
                <button
                  className={`btn ${mode === 'revisi' ? 'w' : 'r'}`}
                  onClick={handleSubmitRevisionOrReject}
                >
                  Kirim {mode === 'revisi' ? 'permintaan revisi' : 'penolakan'}
                </button>
              </>
            ) : (
              <>
                <button className="btn r" onClick={() => setMode('tolak')}>
                  Tolak
                </button>
                <button className="btn w" onClick={() => setMode('revisi')}>
                  Minta revisi
                </button>
                <button
                  className="btn"
                  disabled={!checks.every(Boolean)}
                  onClick={handleApprove}
                >
                  Setujui
                </button>
              </>
            )}
          </>
        )}
      </div>
    </ModalWrapper>
  );
};