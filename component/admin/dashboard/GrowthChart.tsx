'use client';

import { useCallback, useMemo } from 'react';

interface MonthData { label: string; count: number }

export const GrowthChart = ({ data }: { data: MonthData[] }) => {
  const W = 720;
  const H = 290;
  const L = 44;
  const B = 30;

  const counts = data.map((d) => d.count);
  const rawMax = Math.max(...counts, 1);
  // Round max up to a nice ceiling so grid lines are readable
  const mx = Math.ceil(rawMax * 1.2 / 100) * 100 || 100;
  const mn = 0;
  const gridValues = [0, Math.round(mx * 0.25), Math.round(mx * 0.5), Math.round(mx * 0.75), mx];

  const X = useCallback((i: number) => L + i * (W - L - 16) / (data.length - 1 || 1), [data.length]);
  const Y = useCallback((v: number) => 16 + (1 - (v - mn) / (mx - mn)) * (H - 16 - B), [mx, mn, H, B]);

  const points = useMemo(() => data.map((d, i) => `${X(i).toFixed(1)},${Y(d.count).toFixed(1)}`), [data, X, Y]);
  const last = data.length - 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Grafik pertumbuhan pengguna per bulan"
    >
      <defs>
        <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05976A" stopOpacity="0.3" />
          <stop offset="1" stopColor="#05976A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridValues.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - 16} y1={Y(v)} y2={Y(v)} stroke="#E3E8EE" />
          <text x={L - 10} y={Y(v) + 4} textAnchor="end" fontSize="12" fill="#5B5F66">
            {v}
          </text>
        </g>
      ))}
      {points.length > 1 && (
        <path
          d={`M${points.join('L')}L${X(last)},${H - B}L${X(0)},${H - B}Z`}
          fill="url(#gg)"
        />
      )}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#05976A"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <g key={i}>
          <circle
            cx={X(i)}
            cy={Y(d.count)}
            r={i === last ? 7 : 4}
            fill={i === last ? '#05976A' : '#fff'}
            stroke={i === last ? '#fff' : '#05976A'}
            strokeWidth={i === last ? 2.5 : 2}
          >
            <title>{`${d.label}: ${d.count} pengguna`}</title>
          </circle>
          <text x={X(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="#5B5F66">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
};
