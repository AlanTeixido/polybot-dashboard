import Image from "next/image";
import { getAgentInfo, getPositions, getOpportunities } from "@/lib/simmer";
import { getTrades, getStats, getBalanceHistory } from "@/lib/vps";
import { AutoRefresh } from "@/components/auto-refresh";
import { BalanceChart } from "@/components/balance-chart";
import { WinRateRing } from "@/components/win-rate-ring";
import { CategoryBars } from "@/components/category-bars";

export const dynamic = "force-dynamic";

function formatPnl(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

function tierBadgeClass(tier: string): string {
  if (tier.includes("weather")) return "badge badge-weather";
  if (tier === "tier1") return "badge badge-tier1";
  if (tier === "tier2") return "badge badge-tier2";
  if (tier === "tier3") return "badge badge-tier3";
  return "badge";
}

function streakLabel(streak: number): string {
  if (streak > 0) return `W${streak}`;
  if (streak < 0) return `L${Math.abs(streak)}`;
  return "-";
}

export default async function Dashboard() {
  const [agent, positions, opportunities, trades, statsData, balanceHistory] =
    await Promise.all([
      getAgentInfo().catch(() => ({ balance: 0, name: "Polybot" })),
      getPositions().catch(() => []),
      getOpportunities().catch(() => []),
      getTrades().catch(() => []),
      getStats().catch(() => ({
        stats: {
          total_trades: 0,
          resolved_trades: 0,
          wins: 0,
          losses: 0,
          win_rate: 0,
          total_pnl: 0,
          current_streak: 0,
          best_trade: 0,
          worst_trade: 0,
        },
        categories: {},
      })),
      getBalanceHistory().catch(() => []),
    ]);

  const { stats, categories } = statsData;
  const recentTrades = trades.slice(0, 20);
  const totalUnrealizedPnl = positions.reduce(
    (sum, p) => sum + p.unrealized_pnl,
    0
  );

  return (
    <main className="relative z-1 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="AT"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white/95">
              POLYBOT
            </h1>
            <span className="font-mono text-sm text-white/25">
              {agent.name ?? "agent"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="font-mono text-2xl font-bold tracking-tight text-white">
              {agent.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-white/25">
              $SIM Balance
            </div>
          </div>
          <AutoRefresh />
        </div>
      </header>

      {/* Stats row with ring */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {/* PnL Total */}
        <div className="card stat-card-cyan">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">
            PnL Total
          </div>
          <div
            className={`stat-value ${stats.total_pnl >= 0 ? "pnl-positive glow-cyan" : "pnl-negative glow-red"}`}
          >
            {formatPnl(stats.total_pnl)}
          </div>
          <div className="mt-1 text-[10px] text-white/20">$SIM realized</div>
        </div>

        {/* Win Rate Ring */}
        <div className="card flex flex-col items-center justify-center stat-card-cyan">
          <WinRateRing rate={stats.win_rate} />
        </div>

        {/* Trades */}
        <div className="card stat-card-purple">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">
            Trades
          </div>
          <div className="stat-value text-white">
            {stats.resolved_trades}
            <span className="text-lg text-white/25">/{stats.total_trades}</span>
          </div>
          <div className="mt-1 text-[10px] text-white/20">resolved/total</div>
        </div>

        {/* Streak */}
        <div className="card stat-card-white">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">
            Streak
          </div>
          <div
            className={`stat-value ${stats.current_streak >= 0 ? "pnl-positive" : "pnl-negative"}`}
          >
            {streakLabel(stats.current_streak)}
          </div>
          <div className="mt-1 text-[10px] text-white/20">current run</div>
        </div>

        {/* Best/Worst */}
        <div className="card stat-card-white">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">
            Best / Worst
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm font-semibold pnl-positive">
              {formatPnl(stats.best_trade)}
            </span>
            <span className="text-white/15">/</span>
            <span className="font-mono text-sm font-semibold pnl-negative">
              {formatPnl(stats.worst_trade)}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-white/20">single trade</div>
        </div>
      </div>

      {/* Balance chart */}
      <div className="card mb-6">
        <BalanceChart data={balanceHistory} />
      </div>

      {/* Positions */}
      <div className="card mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">
            Open Positions
            <span className="font-mono text-[11px] font-normal text-white/20">
              {positions.length}
            </span>
          </h2>
          {positions.length > 0 && (
            <span className="font-mono text-xs">
              unrealized:{" "}
              <span
                className={
                  totalUnrealizedPnl >= 0 ? "pnl-positive" : "pnl-negative"
                }
              >
                {formatPnl(totalUnrealizedPnl)}
              </span>
            </span>
          )}
        </div>
        {positions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <svg width="40" height="40" viewBox="0 0 40 40" className="text-white/8">
              <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="4" y1="16" x2="36" y2="16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm text-white/20">No open positions</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Side</th>
                  <th>Size</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>PnL</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.market_id}>
                    <td className="max-w-[300px] truncate font-sans text-white/70">
                      {p.title || p.market_id}
                    </td>
                    <td>
                      <span
                        className={`badge ${p.side.toUpperCase() === "YES" ? "badge-tier1" : "badge-lost"}`}
                      >
                        {p.side.toUpperCase()}
                      </span>
                    </td>
                    <td>{p.size.toFixed(1)}</td>
                    <td>{p.avg_price.toFixed(3)}</td>
                    <td>{p.current_price.toFixed(3)}</td>
                    <td
                      className={`font-semibold ${p.unrealized_pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}
                    >
                      {formatPnl(p.unrealized_pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Opportunities */}
      <div className="card mb-6">
        <h2 className="section-title mb-4">
          Top Opportunities
          <span className="font-mono text-[11px] font-normal text-white/20">
            {opportunities.length}
          </span>
        </h2>
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <svg width="40" height="40" viewBox="0 0 40 40" className="text-white/8">
              <path d="M20 6 L34 34 L6 34 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
              <line x1="20" y1="16" x2="20" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="20" cy="28" r="1" fill="currentColor" />
            </svg>
            <span className="text-sm text-white/20">No opportunities available</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Prob</th>
                  <th>Score</th>
                  <th>Tier</th>
                  <th>Category</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((m) => (
                  <tr key={m.id}>
                    <td className="max-w-[300px] truncate font-sans text-white/70">
                      {m.title}
                    </td>
                    <td>
                      <span className="text-white/80">{m.yes_probability.toFixed(1)}</span>
                      <span className="text-white/25">%</span>
                    </td>
                    <td>
                      <span className="font-semibold text-cyan-400">
                        {m.quick_score.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <span className={tierBadgeClass(m.tier)}>{m.tier}</span>
                    </td>
                    <td className="text-white/35">{m.category}</td>
                    <td>
                      <span className={m.days_to_resolution <= 3 ? "text-amber-400" : "text-white/40"}>
                        {m.days_to_resolution.toFixed(0)}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom row: categories + recent trades */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stats by category */}
        <div className="card">
          <h2 className="section-title mb-4">Performance by Category</h2>
          <CategoryBars categories={categories} />
        </div>

        {/* Recent trades */}
        <div className="card">
          <h2 className="section-title mb-4">
            Recent Trades
            <span className="font-mono text-[11px] font-normal text-white/20">
              {recentTrades.length}
            </span>
          </h2>
          {recentTrades.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-white/8">
                <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M20 12 V20 L26 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-white/20">No trades recorded yet</span>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTrades.map((t, i) => (
                <div
                  key={`${t.market_id}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-white/60">
                      {t.title || t.market_id}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/20">
                      <span
                        className={
                          t.side?.toUpperCase() === "YES"
                            ? "text-cyan-400/50"
                            : "text-red-400/50"
                        }
                      >
                        {t.side?.toUpperCase()}
                      </span>
                      <span className="capitalize">{t.category}</span>
                      <span>{t.date?.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.resolved && (
                      <span
                        className={`badge ${t.won ? "badge-won" : "badge-lost"}`}
                      >
                        {t.won ? "WIN" : "LOSS"}
                      </span>
                    )}
                    <span
                      className={`font-mono text-sm font-semibold ${t.pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}
                    >
                      {formatPnl(t.pnl)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.02] px-4 py-1.5 text-[11px] text-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/50" />
          Polybot v1.0 / Simmer Venue / Auto-refresh 60s
        </div>
      </footer>
    </main>
  );
}
