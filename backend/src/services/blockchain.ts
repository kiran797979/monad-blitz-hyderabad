import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';
import { config } from '../config.js';

let provider: JsonRpcProvider | null = null;
let signer: Wallet | null = null;

const ARENA_ABI = [
  'function resolveFight(uint256 fightId, address winner)',
  'function fightCount() view returns (uint256)'
];

const MARKET_ABI = [
  'function resolveMarket(uint256 marketId, bool outcome)',
  'function marketCount() view returns (uint256)'
];

export const blockchainService = {
  async initialize(): Promise<void> {
    if (!config.monadRpc) {
      console.warn('MONAD_RPC not configured');
      return;
    }

    provider = new JsonRpcProvider(config.monadRpc);

    if (config.privateKey) {
      signer = new Wallet(config.privateKey, provider);
      console.log('Blockchain service initialized with signer');
    } else {
      console.warn('PRIVATE_KEY not configured - wallet operations disabled');
    }
  },

  async getBlockNumber(): Promise<number | null> {
    try {
      if (!provider) return null;
      return await provider.getBlockNumber();
    } catch (error) {
      console.error('Failed to get block number:', error);
      return null;
    }
  },

  async getBalance(address: string): Promise<string | null> {
    try {
      if (!provider) return null;
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  },

  async resolveFightOnChain(fightId: number, winner: string): Promise<string | null> {
    try {
      if (!signer || !config.arenaAddress) {
        console.warn('Signer or ARENA_ADDRESS not configured');
        return null;
      }

      const contract = new Contract(config.arenaAddress, ARENA_ABI, signer);
      const tx = await contract.resolveFight(fightId, winner);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to resolve fight on chain:', error);
      return null;
    }
  },

  async resolveMarketOnChain(marketId: number, outcome: boolean): Promise<string | null> {
    try {
      if (!signer || !config.marketAddress) {
        console.warn('Signer or MARKET_ADDRESS not configured');
        return null;
      }

      const contract = new Contract(config.marketAddress, MARKET_ABI, signer);
      const tx = await contract.resolveMarket(marketId, outcome);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to resolve market on chain:', error);
      return null;
    }
  },

  isInitialized(): boolean {
    return provider !== null;
  }
};
