export interface Agent {
  id: number;
  name: string;
  owner: string;
  metadataURI: string;
  wins: number;
  losses: number;
  totalBattles: number;
  stakedAmount: string;
  isActive: boolean;
  createdAt: number;
}

export interface Battle {
  id: number;
  agentA: number;
  agentB: number;
  winner: number | null;
  stakeAmount: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  completedAt: number | null;
}

export interface Market {
  id: number;
  battleId: number;
  agentA: number;
  agentB: number;
  totalPoolA: string;
  totalPoolB: string;
  winner: number | null;
  status: 'open' | 'closed' | 'resolved';
  createdAt: number;
  resolvedAt: number | null;
}

export interface Bet {
  id: number;
  marketId: number;
  bettor: string;
  agentId: number;
  amount: string;
  claimed: boolean;
  createdAt: number;
}

export interface AIBattleResult {
  winnerId: number;
  loserId: number;
  reasoning: string;
  battleLog: string[];
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: number;
  uptime: number;
  database: boolean;
  blockchain: boolean;
}

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
