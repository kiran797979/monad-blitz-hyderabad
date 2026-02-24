import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

type WalletState = {
  address: string | null
  connected: boolean
  balance: string
  chainId: number | null
  error?: string
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    connected: false,
    balance: '0',
    chainId: null,
  })

  useEffect(() => {
    const tryReconnect = async () => {
      try {
        if (!(window as any).ethereum) return
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
        if (accounts?.length > 0) {
          await connect()
        }
      } catch {}
    }
    tryReconnect()
  }, [])

  const connect = async () => {
    try {
      if (!(window as any).ethereum) {
        setState(s => ({ ...s, error: 'MetaMask not found' }))
        return
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const balBig = await provider.getBalance(address)
      const balance = parseFloat(ethers.formatUnits(balBig, 18)).toFixed(4)
      const network = await provider.getNetwork()

      // Force convert to plain number — ethers v6 returns BigInt
      let chainId: number | null = null
      try {
        chainId = Number(BigInt(network.chainId))
      } catch {
        chainId = Number(network.chainId)
      }

      console.log('Wallet connected. ChainId:', chainId, typeof chainId)

      setState({ address, connected: true, balance, chainId })

      try {
        (window as any).ethereum.on('accountsChanged', () => window.location.reload())
        ;(window as any).ethereum.on('chainChanged', () => window.location.reload())
      } catch {}
    } catch (e: any) {
      setState({
        address: null,
        connected: false,
        balance: '0',
        chainId: null,
        error: e?.message ?? 'Connection failed',
      })
    }
  }

  const disconnect = () => {
    setState({ address: null, connected: false, balance: '0', chainId: null })
  }

  return {
    ...state,
    isConnected: state.connected,
    connect,
    disconnect,
  }
}