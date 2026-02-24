import { useWallet } from '../hooks/useWallet'

const MONAD_CHAIN_ID_HEX = '0x279F'
const MONAD_CHAIN_ID_NUM = 10143

export default function WalletButton() {
  const { address, connected, balance, connect, disconnect, chainId } = useWallet()

  const short = (addr: string | null) => {
    if (!addr) return ''
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  // Accept both decimal variations just in case
  const currentChain = Number(chainId)
  const isMonad = currentChain === MONAD_CHAIN_ID_NUM || currentChain === 10143

  const switchToMonad = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    // First try switching
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_CHAIN_ID_HEX }],
      })
      return
    } catch (switchError: any) {
      // 4902 = chain not added yet
      if (switchError.code !== 4902) {
        console.log('Switch failed, trying to add network...', switchError)
      }
    }

    // If switch failed, try adding the network
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: MONAD_CHAIN_ID_HEX,
          chainName: 'Monad Testnet',
          nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
          rpcUrls: ['https://testnet-rpc.monad.xyz'],
          blockExplorerUrls: ['https://testnet.monadexplorer.com'],
        }],
      })
    } catch (addError: any) {
      console.log('Add network failed:', addError)

      // If it says "same RPC endpoint", the network exists with a different chainId
      // Just tell user to switch manually
      if (addError?.message?.includes('same RPC endpoint') || addError?.code === -32603) {
        alert('Monad Testnet is already in your MetaMask.\n\nPlease switch to it manually:\n1. Click MetaMask icon\n2. Click network dropdown at top\n3. Select "Monad Testnet"')
      }
    }
  }

  // Not connected
  if (!connected) {
    return (
      <button
        onClick={connect}
        className="group relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <span className="relative flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M22 10H18a2 2 0 000 4h4" />
          </svg>
          Connect Wallet
        </span>
      </button>
    )
  }

  // Wrong network — show switch button (no animate-pulse to stop the blinking)
  if (!isMonad) {
    return (
      <button
        onClick={switchToMonad}
        className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse" />
          ⚠️ Switch to Monad
        </span>
      </button>
    )
  }

  // Connected to Monad
  return (
    <div className="flex items-center gap-2">
      {/* Balance pill */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-xs">
        <span className="text-yellow-400 font-mono font-bold">{parseFloat(balance || '0').toFixed(2)}</span>
        <span className="text-gray-500">MON</span>
      </div>

      {/* Address pill */}
      <button
        onClick={disconnect}
        className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-xl transition-all hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
        title="Click to disconnect"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-xs font-mono text-gray-300 group-hover:text-purple-300 transition-colors">
          {short(address)}
        </span>
        <span className="sm:hidden text-xs text-yellow-400 font-mono">
          {parseFloat(balance || '0').toFixed(1)}
        </span>
        <span className="hidden sm:inline-flex px-1.5 py-0.5 bg-purple-900/50 border border-purple-700/50 rounded text-[10px] text-purple-400 font-bold">
          MONAD
        </span>
      </button>
    </div>
  )
}