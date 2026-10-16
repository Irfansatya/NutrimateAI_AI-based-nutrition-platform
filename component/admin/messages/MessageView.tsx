'use client';

import { useMemo, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MessageView = ({ messages, onReplyMessage, onShowToast, onAddActivity }: { messages: any[]; onReplyMessage: any; onShowToast: any; onAddActivity: any }) => {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [activeMessageId, setActiveMessageId] = useState(1);

  const unrepliedCount = useMemo(() => messages.filter((m) => !m.r).length, [messages]);

  const filteredMessages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      const matchFilter =
        filter === 'all' || (filter === 'un' ? !m.r : !!m.r);
      const matchQuery =
        !q ||
        (m.n + ' ' + m.e + ' ' + m.tx + ' ' + m.tp).toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [messages, filter, query]);

  const selectedMsg = useMemo(
    () => messages.find((x) => x.id === activeMessageId) || filteredMessages[0],
    [messages, activeMessageId, filteredMessages]
  );

  return (
    <div className="ms">
      <MessageList
        messages={messages}
        filteredMessages={filteredMessages}
        unrepliedCount={unrepliedCount}
        selectedId={selectedMsg?.id}
        filter={filter}
        query={query}
        onFilterChange={setFilter}
        onQueryChange={setQuery}
        onSelect={setActiveMessageId}
      />
      <MessageDetail
        message={selectedMsg}
        onReplyMessage={onReplyMessage}
        onShowToast={onShowToast}
        onAddActivity={onAddActivity}
      />
    </div>
  );
};
