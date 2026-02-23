/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MONAD_RPC: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_ARENA_ADDRESS: string;
  readonly VITE_MARKET_ADDRESS: string;
  readonly VITE_EXPLORER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  };
}
