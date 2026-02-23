import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { config } from '../config.js';
import type { Agent, Battle, Market, Bet } from '../types/index.js';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

let db: SqlJsDatabase | null = null;
let dbPath: string = '';

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();
  
  const dir = dirname(config.databasePath);
  mkdirSync(dir, { recursive: true });
  
  dbPath = config.databasePath;
  
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  initializeTables(db);
  saveDatabase();
}

function saveDatabase(): void {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

function initializeTables(database: SqlJsDatabase): void {
  database.run(`
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
    )
  `);
  
  database.run(`
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
    )
  `);
  
  database.run(`
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
    )
  `);
  
  database.run(`
    CREATE TABLE IF NOT EXISTS bets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      market_id INTEGER NOT NULL,
      bettor TEXT NOT NULL,
      agent_id INTEGER NOT NULL,
      amount TEXT NOT NULL,
      claimed INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (market_id) REFERENCES markets(id)
    )
  `);
  
  database.run(`CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_bets_bettor ON bets(bettor)`);
}

export function getDatabase(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export const dbOperations = {
  createAgent(agent: Omit<Agent, 'id' | 'createdAt'>): number {
    const database = getDatabase();
    database.run(
      `INSERT INTO agents (name, owner, metadata_uri, wins, losses, total_battles, staked_amount, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [agent.name, agent.owner, agent.metadataURI, agent.wins, agent.losses, agent.totalBattles, agent.stakedAmount, agent.isActive ? 1 : 0]
    );
    const result = database.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    return result[0]?.values[0]?.[0] as number;
  },

  getAgent(id: number): Agent | null {
    const database = getDatabase();
    const result = database.exec('SELECT * FROM agents WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return mapRowToAgent(result[0].columns, result[0].values[0]);
  },

  getAllAgents(): Agent[] {
    const database = getDatabase();
    const result = database.exec('SELECT * FROM agents ORDER BY created_at DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => mapRowToAgent(result[0].columns, row));
  },

  updateAgentStats(id: number, wins: number, losses: number, totalBattles: number): void {
    const database = getDatabase();
    database.run('UPDATE agents SET wins = ?, losses = ?, total_battles = ? WHERE id = ?', [wins, losses, totalBattles, id]);
    saveDatabase();
  },

  createBattle(battle: Omit<Battle, 'id' | 'createdAt' | 'completedAt'>): number {
    const database = getDatabase();
    database.run(
      `INSERT INTO battles (agent_a, agent_b, winner, stake_amount, status) VALUES (?, ?, ?, ?, ?)`,
      [battle.agentA, battle.agentB, battle.winner, battle.stakeAmount, battle.status]
    );
    const result = database.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    return result[0]?.values[0]?.[0] as number;
  },

  getBattle(id: number): Battle | null {
    const database = getDatabase();
    const result = database.exec('SELECT * FROM battles WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return mapRowToBattle(result[0].columns, result[0].values[0]);
  },

  getAllBattles(status?: string): Battle[] {
    const database = getDatabase();
    let result;
    if (status) {
      result = database.exec('SELECT * FROM battles WHERE status = ? ORDER BY created_at DESC', [status]);
    } else {
      result = database.exec('SELECT * FROM battles ORDER BY created_at DESC');
    }
    if (result.length === 0) return [];
    return result[0].values.map(row => mapRowToBattle(result[0].columns, row));
  },

  updateBattleStatus(id: number, status: string, winner: number | null): void {
    const database = getDatabase();
    database.run(
      `UPDATE battles SET status = ?, winner = ?, completed_at = strftime('%s', 'now') WHERE id = ?`,
      [status, winner, id]
    );
    saveDatabase();
  },

  createMarket(market: Omit<Market, 'id' | 'createdAt' | 'resolvedAt'>): number {
    const database = getDatabase();
    database.run(
      `INSERT INTO markets (battle_id, agent_a, agent_b, total_pool_a, total_pool_b, winner, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [market.battleId, market.agentA, market.agentB, market.totalPoolA, market.totalPoolB, market.winner, market.status]
    );
    const result = database.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    return result[0]?.values[0]?.[0] as number;
  },

  getMarket(id: number): Market | null {
    const database = getDatabase();
    const result = database.exec('SELECT * FROM markets WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return mapRowToMarket(result[0].columns, result[0].values[0]);
  },

  getAllMarkets(status?: string): Market[] {
    const database = getDatabase();
    let result;
    if (status) {
      result = database.exec('SELECT * FROM markets WHERE status = ? ORDER BY created_at DESC', [status]);
    } else {
      result = database.exec('SELECT * FROM markets ORDER BY created_at DESC');
    }
    if (result.length === 0) return [];
    return result[0].values.map(row => mapRowToMarket(result[0].columns, row));
  },

  updateMarketPool(marketId: number, poolA: string, poolB: string): void {
    const database = getDatabase();
    database.run('UPDATE markets SET total_pool_a = ?, total_pool_b = ? WHERE id = ?', [poolA, poolB, marketId]);
    saveDatabase();
  },

  resolveMarket(id: number, winner: number): void {
    const database = getDatabase();
    database.run(
      `UPDATE markets SET winner = ?, status = 'resolved', resolved_at = strftime('%s', 'now') WHERE id = ?`,
      [winner, id]
    );
    saveDatabase();
  },

  createBet(bet: Omit<Bet, 'id' | 'createdAt'>): number {
    const database = getDatabase();
    database.run(
      `INSERT INTO bets (market_id, bettor, agent_id, amount, claimed) VALUES (?, ?, ?, ?, ?)`,
      [bet.marketId, bet.bettor, bet.agentId, bet.amount, bet.claimed ? 1 : 0]
    );
    const result = database.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    return result[0]?.values[0]?.[0] as number;
  },

  getBetsByMarket(marketId: number): Bet[] {
    const database = getDatabase();
    const result = database.exec('SELECT * FROM bets WHERE market_id = ?', [marketId]);
    if (result.length === 0) return [];
    return result[0].values.map(row => mapRowToBet(result[0].columns, row));
  },

  getBetsByUser(bettor: string): Bet[] {
    const database = getDatabase();
    const result = database.exec('SELECT * FROM bets WHERE bettor = ?', [bettor]);
    if (result.length === 0) return [];
    return result[0].values.map(row => mapRowToBet(result[0].columns, row));
  },

  markBetClaimed(id: number): void {
    const database = getDatabase();
    database.run('UPDATE bets SET claimed = 1 WHERE id = ?', [id]);
    saveDatabase();
  },
};

function mapRowToAgent(columns: string[], row: (string | number | Uint8Array | null)[]): Agent {
  const obj: Record<string, unknown> = {};
  columns.forEach((col, i) => { obj[col] = row[i]; });
  return {
    id: obj.id as number,
    name: obj.name as string,
    owner: obj.owner as string,
    metadataURI: obj.metadata_uri as string || '',
    wins: obj.wins as number,
    losses: obj.losses as number,
    totalBattles: obj.total_battles as number,
    stakedAmount: obj.staked_amount as string,
    isActive: obj.is_active === 1,
    createdAt: obj.created_at as number,
  };
}

function mapRowToBattle(columns: string[], row: (string | number | Uint8Array | null)[]): Battle {
  const obj: Record<string, unknown> = {};
  columns.forEach((col, i) => { obj[col] = row[i]; });
  return {
    id: obj.id as number,
    agentA: obj.agent_a as number,
    agentB: obj.agent_b as number,
    winner: obj.winner as number | null,
    stakeAmount: obj.stake_amount as string,
    status: obj.status as Battle['status'],
    createdAt: obj.created_at as number,
    completedAt: obj.completed_at as number | null,
  };
}

function mapRowToMarket(columns: string[], row: (string | number | Uint8Array | null)[]): Market {
  const obj: Record<string, unknown> = {};
  columns.forEach((col, i) => { obj[col] = row[i]; });
  return {
    id: obj.id as number,
    battleId: obj.battle_id as number,
    agentA: obj.agent_a as number,
    agentB: obj.agent_b as number,
    totalPoolA: obj.total_pool_a as string,
    totalPoolB: obj.total_pool_b as string,
    winner: obj.winner as number | null,
    status: obj.status as Market['status'],
    createdAt: obj.created_at as number,
    resolvedAt: obj.resolved_at as number | null,
  };
}

function mapRowToBet(columns: string[], row: (string | number | Uint8Array | null)[]): Bet {
  const obj: Record<string, unknown> = {};
  columns.forEach((col, i) => { obj[col] = row[i]; });
  return {
    id: obj.id as number,
    marketId: obj.market_id as number,
    bettor: obj.bettor as string,
    agentId: obj.agent_id as number,
    amount: obj.amount as string,
    claimed: obj.claimed === 1,
    createdAt: obj.created_at as number,
  };
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}
