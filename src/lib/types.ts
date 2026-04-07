export interface AgentInfo {
  balance: number;
  name?: string;
}

export interface Position {
  market_id: string;
  title: string;
  side: string;
  size: number;
  avg_price: number;
  current_price: number;
  unrealized_pnl: number;
  in_loss: boolean;
}

export interface Market {
  id: string;
  title: string;
  yes_probability: number;
  quick_score: number;
  tier: string;
  category: string;
  days_to_resolution: number;
  end_date: string;
}

export interface Trade {
  market_id: string;
  title: string;
  side: string;
  amount_usdc: number;
  pnl: number;
  reason: string;
  category: string;
  resolved: boolean;
  won: boolean | null;
  date: string;
}

export interface Stats {
  total_trades: number;
  resolved_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  current_streak: number;
  best_trade: number;
  worst_trade: number;
}

export interface CategoryStats {
  [category: string]: {
    trades: number;
    wins: number;
    losses: number;
    win_rate: number;
    pnl: number;
  };
}

export interface BalanceSnapshot {
  timestamp: number;
  balance: number;
  date: string;
}

export interface PnlSummary {
  realized: number;
  unrealized: number;
  total: number;
}

export interface PositionsData {
  positions: Position[];
  pnl: PnlSummary;
  totalValue: number;
  activeCount: number;
  resolvedCount: number;
}
