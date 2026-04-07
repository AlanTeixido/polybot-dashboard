import { getAgentInfo, getPositions, getOpportunities } from "@/lib/simmer";
import { getTrades, getStats, getBalanceHistory } from "@/lib/vps";
import { AutoRefresh } from "@/components/auto-refresh";
import { BalanceChart } from "@/components/balance-chart";

export const revalidate = 60;

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
  const recentTrades = trades.slice(0, 15);
  const totalUnrealizedPnl = positions.reduce(
    (sum, p) => sum + p.unrealized_pnl,
    0
  );

  return (
    <main className="relative z-1 mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-white/90">
            POLYBOT
          </h1>
          <span className="font-mono text-sm text-white/30">
            {agent.name ?? "agent"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg font-bold text-white">
            {agent.balance.toFixed(2)}{" "}
            <span className="text-sm text-white/40">$SIM</span>
          </span>
          <AutoRefresh />
        </div>
      </header>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-white/35">
            PnL Total
          </div>
          <div
            className={`stat-value ${stats.total_pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}
          >
            {formatPnl(stats.total_pnl)}
          </div>
        </div>
        <div className="card">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-white/35">
            Win Rate
          </div>
          <div className="stat-value text-white">
            {stats.win_rate}
            <span className="text-lg text-white/40">%</span>
          </div>
        </div>
        <div className="card">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-white/35">
            Trades
          </div>
          <div className="stat-value text-white">
            {stats.resolved_trades}
            <span className="text-lg text-white/40">
              /{stats.total_trades}
            </span>
          </div>
        </div>
        <div className="card">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-white/35">
            Streak
          </div>
          <div
            className={`stat-value ${stats.current_streak >= 0 ? "pnl-positive" : "pnl-negative"}`}
          >
            {streakLabel(stats.current_streak)}
          </div>
        </div>
      </div>

      {/* Balance chart */}
      <div className="card mb-6">
        <BalanceChart data={balanceHistory} />
      </div>

      {/* Positions */}
      <div className="card mb-6">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/35">
          Open Positions
          {positions.length > 0 && (
            <span className="ml-2 font-mono text-white/20">
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
        </h2>
        {positions.length === 0 ? (
          <div className="py-6 text-center text-sm text-white/20">
            No open positions
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
                    <td className="max-w-[280px] truncate font-sans text-white/70">
                      {p.title || p.market_id}
                    </td>
                    <td>
                      <span
                        className={
                          p.side.toUpperCase() === "YES"
                            ? "text-cyan-400"
                            : "text-red-400"
                        }
                      >
                        {p.side.toUpperCase()}
                      </span>
                    </td>
                    <td>{p.size.toFixed(1)}</td>
                    <td>{p.avg_price.toFixed(3)}</td>
                    <td>{p.current_price.toFixed(3)}</td>
                    <td
                      className={
                        p.unrealized_pnl >= 0 ? "pnl-positive" : "pnl-negative"
                      }
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
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/35">
          Top Opportunities
        </h2>
        {opportunities.length === 0 ? (
          <div className="py-6 text-center text-sm text-white/20">
            No opportunities available
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
                    <td className="max-w-[280px] truncate font-sans text-white/70">
                      {m.title}
                    </td>
                    <td>{m.yes_probability.toFixed(1)}%</td>
                    <td className="text-cyan-400">
                      {m.quick_score.toFixed(1)}
                    </td>
                    <td>
                      <span className={tierBadgeClass(m.tier)}>{m.tier}</span>
                    </td>
                    <td className="text-white/40">{m.category}</td>
                    <td>{m.days_to_resolution.toFixed(0)}d</td>
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
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/35">
            Performance by Category
          </h2>
          {Object.keys(categories).length === 0 ? (
            <div className="py-6 text-center text-sm text-white/20">
              No resolved trades yet
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(categories)
                .sort(([, a], [, b]) => b.pnl - a.pnl)
                .map(([cat, data]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm capitalize text-white/70">
                        {cat}
                      </span>
                      <span className="ml-2 font-mono text-xs text-white/25">
                        {data.trades} trades
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-white">
                        {data.win_rate}%
                      </span>
                      <span
                        className={`font-mono text-sm ${data.pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}
                      >
                        {formatPnl(data.pnl)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent trades */}
        <div className="card">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/35">
            Recent Trades
          </h2>
          {recentTrades.length === 0 ? (
            <div className="py-6 text-center text-sm text-white/20">
              No trades recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentTrades.map((t, i) => (
                <div
                  key={`${t.market_id}-${i}`}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-white/60">
                      {t.title || t.market_id}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/25">
                      <span
                        className={
                          t.side?.toUpperCase() === "YES"
                            ? "text-cyan-400/60"
                            : "text-red-400/60"
                        }
                      >
                        {t.side?.toUpperCase()}
                      </span>
                      <span>{t.category}</span>
                      <span>{t.date?.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.resolved && (
                      <span
                        className={`badge ${t.won ? "badge-won" : "badge-lost"}`}
                      >
                        {t.won ? "W" : "L"}
                      </span>
                    )}
                    <span
                      className={`font-mono text-sm ${t.pnl >= 0 ? "pnl-positive" : "pnl-negative"}`}
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
      <footer className="mt-8 pb-4 text-center text-[11px] text-white/15">
        Polybot v1.0 / Simmer Venue / Auto-refresh 60s
      </footer>
    </main>
  );
}
