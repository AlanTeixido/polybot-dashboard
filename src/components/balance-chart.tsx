"use client";

import type { BalanceSnapshot } from "@/lib/types";

export function BalanceChart({ data }: { data: BalanceSnapshot[] }) {
  if (data.length < 2) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <svg width="48" height="48" viewBox="0 0 48 48" className="text-white/10">
          <path
            d="M8 36 L16 28 L22 32 L32 18 L40 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="22" r="3" fill="currentColor" />
        </svg>
        <span className="text-sm text-white/20">
          Balance history will appear after a few bot cycles
        </span>
      </div>
    );
  }

  const values = data.map((d) => d.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 800;
  const h = 160;
  const pad = 8;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.balance - min) / range) * (h - pad * 2);
    return { x, y };
  });

  const linePath = `M${points.map((p) => `${p.x},${p.y}`).join(" L")}`;
  const areaPath = `${linePath} L${w - pad},${h} L${pad},${h} Z`;

  const latest = values[values.length - 1];
  const first = values[0];
  const change = latest - first;
  const changePct = first > 0 ? ((change / first) * 100).toFixed(1) : "0";
  const isUp = change >= 0;
  const color = isUp ? "#22d3ee" : "#f43f5e";

  // Find min/max points for markers
  const minIdx = values.indexOf(min);
  const maxIdx = values.indexOf(max);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="section-title" style={{ flex: "none" }}>
            Balance History
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/30">
            {min.toFixed(0)} - {max.toFixed(0)} $SIM
          </span>
          <span
            className={`font-mono text-sm font-semibold ${isUp ? "pnl-positive" : "pnl-negative"}`}
          >
            {isUp ? "+" : ""}{change.toFixed(2)} ({changePct}%)
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height: "160px" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="50%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1={pad}
            y1={h - pad - frac * (h - pad * 2)}
            x2={w - pad}
            y2={h - pad - frac * (h - pad * 2)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#areaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          filter="url(#glow)"
        />

        {/* Latest value dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="4"
          fill={color}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />

        {/* Min/Max markers */}
        {minIdx !== maxIdx && (
          <>
            <circle cx={points[maxIdx].x} cy={points[maxIdx].y} r="2.5" fill={color} opacity="0.5" />
            <circle cx={points[minIdx].x} cy={points[minIdx].y} r="2.5" fill="#f43f5e" opacity="0.5" />
          </>
        )}
      </svg>
      <div className="flex justify-between font-mono text-[10px] text-white/20">
        <span>{data[0]?.date?.slice(5, 16) ?? ""}</span>
        <span>{data[Math.floor(data.length / 2)]?.date?.slice(5, 16) ?? ""}</span>
        <span>{data[data.length - 1]?.date?.slice(5, 16) ?? ""}</span>
      </div>
    </div>
  );
}
