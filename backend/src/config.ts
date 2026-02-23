import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  monadRpcUrl: process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz',
  privateKey: process.env.PRIVATE_KEY || '',
  databasePath: process.env.DATABASE_PATH || './data/coliseum.db',
  aiApiKey: process.env.AI_API_KEY || '',
  arenaContractAddress: process.env.ARENA_CONTRACT_ADDRESS || '',
  predictionMarketAddress: process.env.PREDICTION_MARKET_ADDRESS || '',
};

export function validateConfig(): void {
  const required: (keyof typeof config)[] = ['monadRpcUrl'];
  
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required config: ${key}`);
    }
  }
}
