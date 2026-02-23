import dotenv from 'dotenv';
dotenv.config();

export const config = {
  monadRpc: process.env.MONAD_RPC || 'https://testnet-rpc.monad.xyz',
  chainId: parseInt(process.env.CHAIN_ID || '10143', 10),
  arenaAddress: process.env.ARENA_ADDRESS || '',
  marketAddress: process.env.MARKET_ADDRESS || '',
  privateKey: process.env.PRIVATE_KEY || '',
  port: parseInt(process.env.PORT || '3001', 10),
  databasePath: process.env.DATABASE_PATH || './data/arena.db',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  openrouterKey: process.env.OPENROUTER_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'deepseek/deepseek-r1:free',
};

export function validateConfig(): void {
  if (!config.arenaAddress) {
    console.warn('⚠️  Missing ARENA_ADDRESS in config');
  }
  if (!config.marketAddress) {
    console.warn('⚠️  Missing MARKET_ADDRESS in config');
  }
  if (!config.privateKey) {
    console.warn('⚠️  Missing PRIVATE_KEY in config');
  }
}
