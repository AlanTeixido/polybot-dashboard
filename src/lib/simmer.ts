import type { AgentInfo, Position, Market, PositionsData } from "./types";

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
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Simmer /agents/me failed: ${res.status}`);
  const data = await res.json();
  return {
    balance: parseFloat(data.balance ?? data.sim_balance ?? "0"),
    name: data.name ?? data.agent_name ?? "Polybot",
  };
}

export async function getPositions(): Promise<Position[]> {
  const data = await getPositionsData();
  return data.positions;
}

export async function getPositionsData(): Promise<PositionsData> {
  const empty: PositionsData = {
    positions: [],
    pnl: { realized: 0, unrealized: 0, total: 0 },
    totalValue: 0,
    activeCount: 0,
    resolvedCount: 0,
  };

  const res = await fetch(`${SIMMER_API}/positions`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return empty;
  const data = await res.json();

  // Simmer returns { positions: [...], pnl_summary: {...}, position_counts: {...} }
  const list = data.positions ?? data.data ?? (Array.isArray(data) ? data : []);

  const positions = list
    .filter((p: Record<string, unknown>) => p.status === "active")
    .map((p: Record<string, unknown>) => {
      const sharesYes = parseFloat(String(p.shares_yes ?? "0"));
      const sharesNo = parseFloat(String(p.shares_no ?? "0"));
      const side = sharesYes > sharesNo ? "YES" : "NO";
      const size = Math.max(sharesYes, sharesNo);

      if (size <= 0) return null;

      const currentPrice = parseFloat(String(p.current_price ?? "0"));
      const avgCost = parseFloat(String(p.avg_cost ?? "0"));
      const pnl = parseFloat(String(p.pnl ?? "0"));

      return {
        market_id: String(p.market_id ?? ""),
        title: String(p.question ?? p.title ?? ""),
        side,
        size,
        avg_price: avgCost,
        current_price: currentPrice,
        unrealized_pnl: pnl,
        in_loss: pnl < -0.5,
      } satisfies Position;
    })
    .filter(Boolean) as Position[];

  // Extract PnL summary (combined across venues)
  const pnlRaw = data.pnl_summary?.combined ?? data.pnl_summary?.sim ?? {};
  const counts = data.position_counts ?? {};

  return {
    positions,
    pnl: {
      realized: parseFloat(String(pnlRaw.realized ?? "0")),
      unrealized: parseFloat(String(pnlRaw.unrealized ?? "0")),
      total: parseFloat(String(pnlRaw.total ?? "0")),
    },
    totalValue: parseFloat(String(data.total_value ?? "0")),
    activeCount: parseInt(String(counts.active ?? "0")),
    resolvedCount: parseInt(String(counts.resolved ?? "0")),
  };
}

export async function getOpportunities(): Promise<Market[]> {
  const res = await fetch(`${SIMMER_API}/markets/opportunities?limit=10`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();

  // Simmer returns { opportunities: [...] }
  const list = data.opportunities ?? data.data ?? (Array.isArray(data) ? data : []);

  return list.slice(0, 10).map((m: Record<string, unknown>) => {
    const prob = parseFloat(String(m.current_probability ?? m.probability ?? "0.5"));
    return {
      id: String(m.id ?? m.market_id ?? ""),
      title: String(m.question ?? m.title ?? ""),
      yes_probability: Math.round(prob * 1000) / 10,
      quick_score: parseFloat(String(m.opportunity_score ?? m.quick_score ?? "0")),
      tier: String(m.recommended_side ?? "unknown"),
      category: String(m.import_source ?? m.category ?? "unknown"),
      days_to_resolution: daysUntil(String(m.resolves_at ?? "")),
      end_date: String(m.resolves_at ?? m.endDate ?? ""),
    } satisfies Market;
  });
}

function daysUntil(dateStr: string): number {
  if (!dateStr) return 30;
  try {
    const end = new Date(dateStr);
    const now = new Date();
    return Math.max(Math.round((end.getTime() - now.getTime()) / 86400000), 0);
  } catch {
    return 30;
  }
}
