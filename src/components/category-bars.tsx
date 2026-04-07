"use client";

import type { CategoryStats } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  weather: "#34d399",
  politics: "#22d3ee",
  sports: "#a78bfa",
  economics: "#fbbf24",
  science: "#f472b6",
  entertainment: "#fb923c",
  unknown: "#6b7280",
};

function getColor(cat: string): string {
  const lower = cat.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return CATEGORY_COLORS.unknown;
}

export function CategoryBars({ categories }: { categories: CategoryStats }) {
  const entries = Object.entries(categories).sort(([, a], [, b]) => b.pnl - a.pnl);
  const maxTrades = Math.max(...entries.map(([, d]) => d.trades), 1);

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-white/20">
        No resolved trades yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([cat, data]) => {
        const color = getColor(cat);
        const pnlSign = data.pnl >= 0 ? "+" : "";
        return (
          <div key={cat}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
                />
                <span className="text-sm capitalize text-white/70">{cat}</span>
                <span className="font-mono text-[11px] text-white/20">
                  {data.wins}W/{data.losses}L
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-white/50">
                  {data.win_rate}%
                </span>
                <span
                  className={`font-mono text-sm font-medium ${data.pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}
                >
                  {pnlSign}{data.pnl.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(data.trades / maxTrades) * 100}%`,
                  background: `linear-gradient(90deg, ${color}cc, ${color}44)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
