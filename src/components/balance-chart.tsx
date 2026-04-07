"use client";

import type { BalanceSnapshot } from "@/lib/types";

export function BalanceChart({ data }: { data: BalanceSnapshot[] }) {
  if (data.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-white/30">
        Balance history will appear after a few bot cycles
      </div>
    );
  }

  const values = data.map((d) => d.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 600;
  const h = 120;
  const pad = 4;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.balance - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L${w - pad},${h} L${pad},${h} Z`;

  const latest = values[values.length - 1];
  const first = values[0];
  const change = latest - first;
  const isUp = change >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-white/50">Balance History</span>
        <span
          className={`font-mono text-xs ${isUp ? "text-cyan-400" : "text-red-400"}`}
        >
          {isUp ? "+" : ""}
          {change.toFixed(2)} $SIM
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isUp ? "#22d3ee" : "#f43f5e"}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={isUp ? "#22d3ee" : "#f43f5e"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke={isUp ? "#22d3ee" : "#f43f5e"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between font-mono text-[10px] text-white/25">
        <span>{data[0]?.date?.slice(5, 16) ?? ""}</span>
        <span>{data[data.length - 1]?.date?.slice(5, 16) ?? ""}</span>
      </div>
    </div>
  );
}
