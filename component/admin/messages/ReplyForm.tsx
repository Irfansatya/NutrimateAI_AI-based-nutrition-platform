'use client';

import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ReplyForm = ({ message, onReplyMessage, onShowToast, onAddActivity }: { message: any; onReplyMessage: any; onShowToast: any; onAddActivity: any }) => {
  const [subjectText, setSubjectText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const defaultSubj = `Re: ${message.tp} - Hubungi Kami NutrimateAI`;
    const first = message.n.split(' ')[0];
    setSubjectText(defaultSubj);
    setReplyText(`Halo ${first},\n\nTerima kasih telah menghubungi NutrimateAI. \n\nSalam hangat,\nTim Admin NutrimateAI`);
    setErrorText('');
  }, [message]);

  const handleSendReply = async () => {
    if (replyText.trim().length < 10) {
      setErrorText('Isi balasan terlebih dahulu (minimal 10 karakter).');
      return;
    }
    setIsSending(true);

    // Simulasi Asynchronous Fetching / API Mailer
    await new Promise((r) => setTimeout(r, 800));

    const timestamp = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    onReplyMessage(message.id, replyText.trim(), timestamp);
    onAddActivity(`Pesan dari ${message.n} dibalas`);
    setIsSending(false);
    onShowToast(`Balasan terkirim ke ${message.e}`);
  };

  return (
    <>
      <small className="lb">Balas lewat email ke {message.e}</small>
      <input
        className="in sub"
        value={subjectText}
        onChange={(e) => setSubjectText(e.target.value)}
        aria-label="Subjek email"
      />
      <textarea
        value={replyText}
        onChange={(e) => {
          setReplyText(e.target.value);
          setErrorText('');
        }}
        aria-label="Isi balasan"
      />
      <div className="em">{errorText}</div>
      <div className="ft">
        <span>Balasan dikirim ke email pengguna di atas.</span>
        <button
          className="btn"
          disabled={isSending}
          onClick={handleSendReply}
        >
          {isSending ? 'Mengirim...' : 'Kirim balasan'}
        </button>
      </div>
    </>
  );
};
