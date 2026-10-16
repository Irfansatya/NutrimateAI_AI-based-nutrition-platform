'use client';

import { useCallback, useMemo } from 'react';
import { GROWTH_DATA } from '@/lib/admin/data/stats';

export const GrowthChart = () => {
  const W = 720;
  const H = 290;
  const L = 44;
  const B = 30;
  const mn = 500;
  const mx = 1300;
  const months = ['Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];

  const X = useCallback((i: number) => L + i * (W - L - 16) / 11, [L, W]);
  const Y = useCallback((v: number) => 16 + (1 - (v - mn) / (mx - mn)) * (H - 16 - B), [H, B, mn, mx]);

  const points = useMemo(() => {
    return GROWTH_DATA.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`);
  }, [X, Y]);

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
      {[500, 700, 900, 1100, 1300].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - 16} y1={Y(v)} y2={Y(v)} stroke="#E3E8EE" />
          <text x={L - 10} y={Y(v) + 4} textAnchor="end" fontSize="12" fill="#5B5F66">
            {v}
          </text>
        </g>
      ))}
      <path
        d={`M${points.join('L')}L${X(11)},${H - B}L${X(0)},${H - B}Z`}
        fill="url(#gg)"
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#05976A"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {GROWTH_DATA.map((v, i) => (
        <g key={i}>
          <circle
            cx={X(i)}
            cy={Y(v)}
            r={i === 11 ? 7 : 4}
            fill={i === 11 ? '#05976A' : '#fff'}
            stroke={i === 11 ? '#fff' : '#05976A'}
            strokeWidth={i === 11 ? 2.5 : 2}
          >
            <title>{`${months[i]}: ${v} pengguna`}</title>
          </circle>
          <text x={X(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="#5B5F66">
            {months[i]}
          </text>
        </g>
      ))}
    </svg>
  );
};
