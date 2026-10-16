'use client';

import { DocButton } from '../ui/DocButton';
import { Badge, TopicBadge } from '../ui/Badge';
import { ReplyForm } from './ReplyForm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MessageDetail = ({ message, onReplyMessage, onShowToast, onAddActivity }: { message: any; onReplyMessage: any; onShowToast: any; onAddActivity: any }) => (
  <div className="c">
    {message ? (
      <>
        <div className="dh">
          <div>
            <h2>{message.n}</h2>
            <a href={`mailto:${message.e}`}>{message.e}</a>
          </div>
          <Badge tone={message.r ? 'ok' : 'warn'}>
            {message.r ? 'Sudah dibalas' : 'Belum dibalas'}
          </Badge>
        </div>

        <div className="g2">
          <div>
            <small>Topik</small>
            <TopicBadge topic={message.tp} />
          </div>
          <div>
            <small>Diterima</small>
            {message.t}
          </div>
        </div>

        <small className="lb">Pesan</small>
        <div className="msg">{message.tx}</div>

        <small className="lb">Lampiran</small>
        {message.f ? (
          <>
            <div className="docs">
              <DocButton fileName={message.f} />
            </div>
            <p className="hint">Klik lampiran untuk membukanya di tab baru.</p>
          </>
        ) : (
          <p className="mut">Tidak ada lampiran</p>
        )}

        <div className="rep">
          {message.r ? (
            <>
              <small className="lb">Balasan Anda</small>
              <div className="msg sent">{message.r}</div>
              <p className="hint">
                Terkirim ke {message.e} · {message.rt}
              </p>
            </>
          ) : (
            <ReplyForm
              message={message}
              onReplyMessage={onReplyMessage}
              onShowToast={onShowToast}
              onAddActivity={onAddActivity}
            />
          )}
        </div>
      </>
    ) : (
      <div className="empty">Pilih pesan untuk melihat isinya.</div>
    )}
  </div>
);
