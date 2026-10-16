'use client';

import { Icon } from '../ui/Icon';
import { Badge, TopicBadge } from '../ui/Badge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MessageList = ({
  messages,
  filteredMessages,
  unrepliedCount,
  selectedId,
  filter,
  query,
  onFilterChange,
  onQueryChange,
  onSelect
}: {
  messages: any[];
  filteredMessages: any[];
  unrepliedCount: number;
  selectedId: any;
  filter: string;
  query: string;
  onFilterChange: (f: string) => void;
  onQueryChange: (q: string) => void;
  onSelect: (id: any) => void;
}) => (
  <div>
    <div className="seg" role="tablist">
      {[
        ['all', `Semua (${messages.length})`],
        ['un', `Belum dibalas (${unrepliedCount})`],
        ['rd', `Sudah dibalas (${messages.length - unrepliedCount})`]
      ].map((t) => (
        <button
          key={t[0]}
          role="tab"
          className={filter === t[0] ? 'on' : ''}
          onClick={() => onFilterChange(t[0])}
        >
          {t[1]}
        </button>
      ))}
    </div>

    <label className="sr">
      <Icon name="search" />
      <input
        className="in"
        type="search"
        placeholder="Cari nama, email, atau isi pesan"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </label>

    <div className="ml">
      {filteredMessages.length ? (
        filteredMessages.map((x) => (
          <button
            key={x.id}
            className={`mi ${x.id === selectedId ? 'on' : ''} ${x.r ? 'rd' : ''}`}
            onClick={() => onSelect(x.id)}
          >
            <div className="r1">
              <b>{x.n}</b>
              <small>{x.t}</small>
            </div>
            <p>{x.tx}</p>
            <div className="r3">
              <TopicBadge topic={x.tp} />
              <Badge tone={x.r ? 'ok' : 'warn'}>{x.r ? 'Dibalas' : 'Belum dibalas'}</Badge>
            </div>
          </button>
        ))
      ) : (
        <div className="c empty">Tidak ada pesan yang cocok.</div>
      )}
    </div>
  </div>
);
