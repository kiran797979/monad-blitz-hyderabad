import Database from 'better-sqlite3';
import { config } from '../config.js';
import type { Agent, Battle, Market, Bet } from '../types/index.js';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dir = dirname(config.databasePath);
    mkdirSync(dir, { recursive: true });
    
    db = new Database(config.databasePath);
    db.pragma('journal_mode = WAL');
    initializeTables(db);
  }
  return db;
}

function initializeTables(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      metadata_uri TEXT,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      total_battles INTEGER DEFAULT 0,
      staked_amount TEXT DEFAULT '0',
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS battles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_a INTEGER NOT NULL,
      agent_b INTEGER NOT NULL,
      winner INTEGER,
      stake_amount TEXT DEFAULT '0',
      status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      completed_at INTEGER,
      FOREIGN KEY (agent_a) REFERENCES agents(id),
      FOREIGN KEY (agent_b) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      battle_id INTEGER NOT NULL,
      agent_a INTEGER NOT NULL,
      agent_b INTEGER NOT NULL,
      total_pool_a TEXT DEFAULT '0',
      total_pool_b TEXT DEFAULT '0',
      winner INTEGER,
      status TEXT DEFAULT 'open',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      resolved_at INTEGER,
      FOREIGN KEY (battle_id) REFERENCES battles(id)
    );

    CREATE TABLE IF NOT EXISTS bets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      market_id INTEGER NOT NULL,
      bettor TEXT NOT NULL,
      agent_id INTEGER NOT NULL,
      amount TEXT NOT NULL,
      claimed INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (market_id) REFERENCES markets(id)
    );

    CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner);
    CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
    CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
    CREATE INDEX IF NOT EXISTS idx_bets_bettor ON bets(bettor);
  `);
}

export const dbOperations = {
  createAgent(agent: Omit<Agent, 'id' | 'createdAt'>): number {
    const stmt = getDatabase().prepare(`
      INSERT INTO agents (name, owner, metadata_uri, wins, losses, total_battles, staked_amount, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      agent.name,
      agent.owner,
      agent.metadataURI,
      agent.wins,
      agent.losses,
      agent.totalBattles,
      agent.stakedAmount,
      agent.isActive ? 1 : 0
    );
    return result.lastInsertRowid as number;
  },

  getAgent(id: number): Agent | null {
    const stmt = getDatabase().prepare('SELECT * FROM agents WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? mapRowToAgent(row) : null;
  },

  getAllAgents(): Agent[] {
    const stmt = getDatabase().prepare('SELECT * FROM agents ORDER BY created_at DESC');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(mapRowToAgent);
  },

  updateAgentStats(id: number, wins: number, losses: number, totalBattles: number): void {
    const stmt = getDatabase().prepare(`
      UPDATE agents SET wins = ?, losses = ?, total_battles = ? WHERE id = ?
    `);
    stmt.run(wins, losses, totalBattles, id);
  },

  createBattle(battle: Omit<Battle, 'id' | 'createdAt' | 'completedAt'>): number {
    const stmt = getDatabase().prepare(`
      INSERT INTO battles (agent_a, agent_b, winner, stake_amount, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      battle.agentA,
      battle.agentB,
      battle.winner,
      battle.stakeAmount,
      battle.status
    );
    return result.lastInsertRowid as number;
  },

  getBattle(id: number): Battle | null {
    const stmt = getDatabase().prepare('SELECT * FROM battles WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? mapRowToBattle(row) : null;
  },

  getAllBattles(status?: string): Battle[] {
    let stmt;
    if (status) {
      stmt = getDatabase().prepare('SELECT * FROM battles WHERE status = ? ORDER BY created_at DESC');
      const rows = stmt.all(status) as Record<string, unknown>[];
      return rows.map(mapRowToBattle);
    }
    stmt = getDatabase().prepare('SELECT * FROM battles ORDER BY created_at DESC');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(mapRowToBattle);
  },

  updateBattleStatus(id: number, status: string, winner: number | null): void {
    const stmt = getDatabase().prepare(`
      UPDATE battles SET status = ?, winner = ?, completed_at = strftime('%s', 'now') WHERE id = ?
    `);
    stmt.run(status, winner, id);
  },

  createMarket(market: Omit<Market, 'id' | 'createdAt' | 'resolvedAt'>): number {
    const stmt = getDatabase().prepare(`
      INSERT INTO markets (battle_id, agent_a, agent_b, total_pool_a, total_pool_b, winner, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      market.battleId,
      market.agentA,
      market.agentB,
      market.totalPoolA,
      market.totalPoolB,
      market.winner,
      market.status
    );
    return result.lastInsertRowid as number;
  },

  getMarket(id: number): Market | null {
    const stmt = getDatabase().prepare('SELECT * FROM markets WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? mapRowToMarket(row) : null;
  },

  getAllMarkets(status?: string): Market[] {
    let stmt;
    if (status) {
      stmt = getDatabase().prepare('SELECT * FROM markets WHERE status = ? ORDER BY created_at DESC');
      const rows = stmt.all(status) as Record<string, unknown>[];
      return rows.map(mapRowToMarket);
    }
    stmt = getDatabase().prepare('SELECT * FROM markets ORDER BY created_at DESC');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(mapRowToMarket);
  },

  updateMarketPool(marketId: number, poolA: string, poolB: string): void {
    const stmt = getDatabase().prepare(`
      UPDATE markets SET total_pool_a = ?, total_pool_b = ? WHERE id = ?
    `);
    stmt.run(poolA, poolB, marketId);
  },

  resolveMarket(id: number, winner: number): void {
    const stmt = getDatabase().prepare(`
      UPDATE markets SET winner = ?, status = 'resolved', resolved_at = strftime('%s', 'now') WHERE id = ?
    `);
    stmt.run(winner, id);
  },

  createBet(bet: Omit<Bet, 'id' | 'createdAt'>): number {
    const stmt = getDatabase().prepare(`
      INSERT INTO bets (market_id, bettor, agent_id, amount, claimed)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      bet.marketId,
      bet.bettor,
      bet.agentId,
      bet.amount,
      bet.claimed ? 1 : 0
    );
    return result.lastInsertRowid as number;
  },

  getBetsByMarket(marketId: number): Bet[] {
    const stmt = getDatabase().prepare('SELECT * FROM bets WHERE market_id = ?');
    const rows = stmt.all(marketId) as Record<string, unknown>[];
    return rows.map(mapRowToBet);
  },

  getBetsByUser(bettor: string): Bet[] {
    const stmt = getDatabase().prepare('SELECT * FROM bets WHERE bettor = ?');
    const rows = stmt.all(bettor) as Record<string, unknown>[];
    return rows.map(mapRowToBet);
  },

  markBetClaimed(id: number): void {
    const stmt = getDatabase().prepare('UPDATE bets SET claimed = 1 WHERE id = ?');
    stmt.run(id);
  },
};

function mapRowToAgent(row: Record<string, unknown>): Agent {
  return {
    id: row.id as number,
    name: row.name as string,
    owner: row.owner as string,
    metadataURI: row.metadata_uri as string,
    wins: row.wins as number,
    losses: row.losses as number,
    totalBattles: row.total_battles as number,
    stakedAmount: row.staked_amount as string,
    isActive: row.is_active === 1,
    createdAt: row.created_at as number,
  };
}

function mapRowToBattle(row: Record<string, unknown>): Battle {
  return {
    id: row.id as number,
    agentA: row.agent_a as number,
    agentB: row.agent_b as number,
    winner: row.winner as number | null,
    stakeAmount: row.stake_amount as string,
    status: row.status as Battle['status'],
    createdAt: row.created_at as number,
    completedAt: row.completed_at as number | null,
  };
}

function mapRowToMarket(row: Record<string, unknown>): Market {
  return {
    id: row.id as number,
    battleId: row.battle_id as number,
    agentA: row.agent_a as number,
    agentB: row.agent_b as number,
    totalPoolA: row.total_pool_a as string,
    totalPoolB: row.total_pool_b as string,
    winner: row.winner as number | null,
    status: row.status as Market['status'],
    createdAt: row.created_at as number,
    resolvedAt: row.resolved_at as number | null,
  };
}

function mapRowToBet(row: Record<string, unknown>): Bet {
  return {
    id: row.id as number,
    marketId: row.market_id as number,
    bettor: row.bettor as string,
    agentId: row.agent_id as number,
    amount: row.amount as string,
    claimed: row.claimed === 1,
    createdAt: row.created_at as number,
  };
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
