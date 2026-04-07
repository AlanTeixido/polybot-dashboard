import type { AgentInfo, Position, Market } from "./types";

const SIMMER_API = "https://api.simmer.markets/api/sdk";

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.SIMMER_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function getAgentInfo(): Promise<AgentInfo> {
  const res = await fetch(`${SIMMER_API}/agents/me`, {
    headers: headers(),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Simmer /agents/me failed: ${res.status}`);
  const data = await res.json();
  return {
    balance: parseFloat(data.balance ?? data.sim_balance ?? "0"),
    name: data.name ?? data.agent_name ?? "Polybot",
  };
}

export async function getPositions(): Promise<Position[]> {
  const res = await fetch(`${SIMMER_API}/positions`, {
    headers: headers(),
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.data ?? data.positions ?? [];

  return list
    .map((p: Record<string, unknown>) => {
      const size = parseFloat(String(p.size ?? p.amount ?? "0"));
      if (size <= 0) return null;
      const currentPrice = parseFloat(
        String(p.currentPrice ?? p.current_price ?? p.price ?? "0")
      );
      const avgPrice = parseFloat(
        String(p.avgPrice ?? p.avg_price ?? p.averagePrice ?? "0")
      );
      const pnl = avgPrice > 0 ? (currentPrice - avgPrice) * size : 0;
      return {
        market_id: String(p.market_id ?? p.market ?? ""),
        title: String(p.title ?? p.question ?? ""),
        side: String(p.side ?? p.outcome ?? ""),
        size,
        avg_price: avgPrice,
        current_price: currentPrice,
        unrealized_pnl: pnl,
        in_loss: pnl < -0.5,
      } satisfies Position;
    })
    .filter(Boolean) as Position[];
}

export async function getOpportunities(): Promise<Market[]> {
  const res = await fetch(`${SIMMER_API}/markets/opportunities?limit=10`, {
    headers: headers(),
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.data ?? data.markets ?? [];

  return list.slice(0, 10).map((m: Record<string, unknown>) => {
    const prob = parseFloat(String(m.probability ?? m.yes_probability ?? "0.5"));
    return {
      id: String(m.id ?? m.market_id ?? ""),
      title: String(m.question ?? m.title ?? ""),
      yes_probability: prob <= 1 ? Math.round(prob * 1000) / 10 : prob,
      quick_score: parseFloat(String(m.quick_score ?? m.score ?? "0")),
      tier: String(m.tier ?? "unknown"),
      category: String(m.category ?? "unknown"),
      days_to_resolution: parseFloat(String(m.days_to_resolution ?? "30")),
      end_date: String(m.endDate ?? m.end_date ?? ""),
    } satisfies Market;
  });
}
