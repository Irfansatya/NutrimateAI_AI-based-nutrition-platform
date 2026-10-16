import { STATUS_BADGES, TOPIC_BADGES } from '@/lib/admin/data/badges';

export const Badge = ({ tone = '', children }: { tone?: string; children: React.ReactNode }) => <span className={`bd ${tone}`}>{children}</span>;

export const StatusBadge = ({ status }: { status: string }) => {
  const badgeInfo = STATUS_BADGES[status as keyof typeof STATUS_BADGES] || ['', ''];
  return <Badge tone={badgeInfo[1]}>{badgeInfo[0]}</Badge>;
};

export const TopicBadge = ({ topic }: { topic: string }) => {
  const tone = TOPIC_BADGES[topic as keyof typeof TOPIC_BADGES] || '';
  return <Badge tone={tone}>{topic}</Badge>;
};
