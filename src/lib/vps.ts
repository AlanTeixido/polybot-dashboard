import type { Trade, Stats, CategoryStats, BalanceSnapshot } from "./types";

const VPS_URL = process.env.VPS_API_URL ?? "http://178.104.71.163:8080";
const VPS_KEY = process.env.VPS_API_KEY ?? "";

function headers(): HeadersInit {
  return { "X-API-Key": VPS_KEY };
}

export async function getTrades(): Promise<Trade[]> {
  try {
    const res = await fetch(`${VPS_URL}/api/trades`, {
      headers: headers(),
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getStats(): Promise<{
  stats: Stats;
  categories: CategoryStats;
}> {
  try {
    const res = await fetch(`${VPS_URL}/api/stats`, {
      headers: headers(),
      next: { revalidate: 60 },
    });
    if (!res.ok)
      return {
        stats: emptyStats(),
        categories: {},
      };
    return await res.json();
  } catch {
    return { stats: emptyStats(), categories: {} };
  }
}

export async function getBalanceHistory(): Promise<BalanceSnapshot[]> {
  try {
    const res = await fetch(`${VPS_URL}/api/balance-history`, {
      headers: headers(),
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function emptyStats(): Stats {
  return {
    total_trades: 0,
    resolved_trades: 0,
    wins: 0,
    losses: 0,
    win_rate: 0,
    total_pnl: 0,
    current_streak: 0,
    best_trade: 0,
    worst_trade: 0,
  };
}
