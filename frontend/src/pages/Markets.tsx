import { useState, useEffect, useCallback } from 'react'
import {
  getMarkets,
  getFights,
  getAgents,
  createMarket,
  placeBet,
} from '../api/client'
import OddsBar from '../components/OddsBar'
import toast from 'react-hot-toast'
import type { Market, Fight, Agent } from '../types'

/* ─── Filter config ─── */
const FILTERS = [
  { key: 'all', label: '🌐 All' },
  { key: 'open', label: '🟢 Open' },
  { key: 'resolved', label: '✅ Resolved' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

export default function Markets() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [fights, setFights] = useState<Fight[]>([])
  const [_agents, setAgents] = useState<Agent[]>([])
  const [agentMap, setAgentMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedFight, setSelectedFight] = useState('')
  const [creating, setCreating] = useState(false)

  // Bet modal state
  const [betMarket, setBetMarket] = useState<Market | null>(null)
  const [betSide, setBetSide] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState('5')
  const [betting, setBetting] = useState(false)

  /* ─── Fetch data ─── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [m, f, a] = await Promise.all([
        getMarkets(),
        getFights(),
        getAgents(),
      ])
      setMarkets(m || [])
      setFights(f || [])
      setAgents(a || [])
      const map: Record<number, string> = {}
      ;(a || []).forEach((ag) => {
        map[ag.id] = ag.name
      })
      setAgentMap(map)
    } catch {
      toast.error('Failed to load markets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ─── ESC key + scroll lock for modals ─── */
  const anyModalOpen = showCreate || betMarket !== null
  useEffect(() => {
    if (!anyModalOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreate(false)
        setBetMarket(null)
        setBetSide(null)
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [anyModalOpen])

  /* ─── Helpers ─── */
  const getName = useCallback(
    (id: number) => agentMap[id] || `Agent #${id}`,
    [agentMap]
  )

  // Compute odds from market's own pool data (no extra API call needed)
  const getOddsPct = (market: Market) => {
    const poolA = parseFloat(market.totalPoolA || '0')
    const poolB = parseFloat(market.totalPoolB || '0')
    const total = poolA + poolB
    if (total === 0) return { pctA: 50, pctB: 50, total: 0, poolA: 0, poolB: 0 }
    return {
      pctA: Math.round((poolA / total) * 100),
      pctB: 100 - Math.round((poolA / total) * 100),
      total,
      poolA,
      poolB,
    }
  }

  const getPayout = () => {
    if (!betMarket || betSide === null || !betAmount) return '0.00'
    const myAmount = parseFloat(betAmount)
    if (isNaN(myAmount) || myAmount <= 0) return '0.00'

    const poolA = parseFloat(betMarket.totalPoolA || '0')
    const poolB = parseFloat(betMarket.totalPoolB || '0')
    const winPool =
      betSide === betMarket.agentA ? poolA : poolB
    const losePool =
      betSide === betMarket.agentA ? poolB : poolA

    if (winPool + myAmount === 0) return myAmount.toFixed(2)
    const payout =
      myAmount + (myAmount / (winPool + myAmount)) * losePool
    return payout.toFixed(2)
  }

  /* ─── Create market ─── */
  const handleCreateMarket = async () => {
    if (!selectedFight) return toast.error('Select a fight')
    const fight = fights.find((f) => f.id === Number(selectedFight))
    if (!fight) return toast.error('Fight not found')
    setCreating(true)
    try {
      await createMarket({
        battleId: fight.id,
        agentA: fight.agentA,
        agentB: fight.agentB,
      })
      toast.success('Market created! 🔮')
      setShowCreate(false)
      setSelectedFight('')
      fetchData()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create market')
    } finally {
      setCreating(false)
    }
  }

  /* ─── Bet flow ─── */
  const openBetModal = (market: Market, side: number) => {
    setBetMarket(market)
    setBetSide(side)
    setBetAmount('5')
  }

  const closeBetModal = () => {
    setBetMarket(null)
    setBetSide(null)
  }

  const handlePlaceBet = async () => {
    if (!betMarket || betSide === null) return
    const amt = parseFloat(betAmount)
    if (!betAmount || isNaN(amt) || amt <= 0)
      return toast.error('Enter a valid amount')
    setBetting(true)
    try {
      let bettor = '0x0000000000000000000000000000000000000000'
      try {
        if ((window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts',
          })
          if (accounts?.[0]) bettor = accounts[0]
        }
      } catch {}
      await placeBet(betMarket.id, {
        bettor,
        agentId: betSide,
        amount: betAmount,
      })
      toast.success('Bet placed! 🎲')
      closeBetModal()
      fetchData()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to place bet')
    } finally {
      setBetting(false)
    }
  }

  /* ─── Filter ─── */
  const filtered = markets.filter((m) => {
    if (filter === 'all') return true
    return m.status === filter
  })

  const getFilterCount = (key: FilterKey) => {
    if (key === 'all') return markets.length
    return markets.filter((m) => m.status === key).length
  }

  /* ─── Safe payout display ─── */
  const payoutStr = getPayout()
  const betAmtNum = parseFloat(betAmount) || 0
  const payoutNum = parseFloat(payoutStr) || 0
  const profitPct =
    betAmtNum > 0 && payoutNum > 0
      ? ((payoutNum / betAmtNum - 1) * 100).toFixed(0)
      : '0'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      {/* ══════ Header ══════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-px-heading text-xl sm:text-2xl text-white mb-2">
            🔮 Prediction Markets
          </h1>
          <p className="text-gray-400 text-sm">
            Bet on AI combat outcomes. Winners take the pool.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-shine px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 hover:shadow-glow-cyan"
        >
          + Create Market
        </button>
      </div>

      {/* ══════ Quick Stats ══════ */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-white">{markets.length}</p>
          <p className="text-gray-500 text-xs mt-0.5">Total Markets</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-cyan-400">
            {markets.filter((m) => m.status === 'open').length}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Open</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {markets
              .reduce((s, m) => s + parseFloat(m.totalPool || '0'), 0)
              .toFixed(1)}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Total VOL (MON)</p>
        </div>
      </div>

      {/* ══════ Filter Tabs ══════ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === key
                ? 'bg-cyan-600 text-white shadow-glow-cyan'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-60">
              ({getFilterCount(key)})
            </span>
          </button>
        ))}
      </div>

      <hr className="divider-glow mb-6" />

      {/* ══════ Loading ══════ */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="loading-spinner large" />
          <p className="text-gray-500 text-sm mt-4 font-mono">
            Loading markets...
          </p>
        </div>
      )}

      {/* ══════ Empty State ══════ */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state game-card game-card-cyan p-12">
          <div className="empty-state-icon">🔮</div>
          <p className="empty-state-title">No markets found</p>
          <p className="empty-state-text mb-6">
            {filter === 'all'
              ? 'Create a market from a fight to start betting!'
              : `No ${filter} markets. Try a different filter.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-shine px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold hover:scale-105 transition-all"
            >
              🔮 Create First Market
            </button>
          )}
        </div>
      )}

      {/* ══════ Market Cards ══════ */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((market, idx) => {
            const { pctA, pctB, total } = getOddsPct(market)
            const isOpen = market.status === 'open'
            const isResolved = market.status === 'resolved'
            const agentAName = getName(market.agentA ?? 0)
            const agentBName = getName(market.agentB ?? 0)

            return (
              <div
                key={market.id}
                className={`game-card ${
                  isOpen ? 'game-card-cyan' : 'game-card-green'
                } p-6 animate-fade-in-up`}
                style={{
                  animationDelay: `${Math.min(idx * 0.08, 0.4)}s`,
                  animationFillMode: 'both',
                }}
              >
                {/* Status Badge + ID */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`status-badge ${
                      isOpen ? 'open' : 'completed'
                    }`}
                  >
                    <span className="status-dot" />
                    {isOpen ? 'OPEN' : 'RESOLVED'}
                  </div>
                  <span className="text-gray-600 text-xs font-mono">
                    #{market.id}
                  </span>
                </div>

                {/* Question */}
                <h3 className="text-white font-bold text-lg mb-4 leading-tight">
                  {market.question ||
                    `Who wins: ${agentAName} vs ${agentBName}?`}
                </h3>

                {/* Odds Bar — uses OddsBar component with real agent names */}
                <div className="mb-4">
                  <OddsBar
                    yesPct={pctA}
                    noPct={pctB}
                    yesLabel={agentAName}
                    noLabel={agentBName}
                    size="md"
                  />
                </div>

                {/* Pool Info */}
                <div className="flex justify-between items-center mb-4 py-3 px-4 bg-black/30 rounded-xl">
                  <div>
                    <span className="text-gray-500 text-xs">Total Pool</span>
                    <p className="mon-amount text-yellow-400 font-bold">
                      💰 {total > 0 ? total.toFixed(1) : market.totalPool || '0'}{' '}
                      <span className="mon-symbol">MON</span>
                    </p>
                  </div>
                  {isResolved && market.winner && (
                    <div className="text-right">
                      <span className="text-gray-500 text-xs">Winner</span>
                      <p className="text-yellow-400 font-bold">
                        🏆 {getName(market.winner)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bet Buttons */}
                {isOpen && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        openBetModal(market, market.agentA ?? 0)
                      }
                      className="btn-shine py-3 bg-gradient-to-r from-green-600/80 to-emerald-700/80 border border-green-500/30 rounded-xl text-white font-bold transition-all hover:from-green-500 hover:to-emerald-600 hover:shadow-glow-green hover:scale-105"
                    >
                      <span className="text-lg">📈</span>
                      <br />
                      <span className="text-sm">
                        Bet {agentAName}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        openBetModal(market, market.agentB ?? 0)
                      }
                      className="btn-shine py-3 bg-gradient-to-r from-red-600/80 to-rose-700/80 border border-red-500/30 rounded-xl text-white font-bold transition-all hover:from-red-500 hover:to-rose-600 hover:shadow-glow-red hover:scale-105"
                    >
                      <span className="text-lg">📉</span>
                      <br />
                      <span className="text-sm">
                        Bet {agentBName}
                      </span>
                    </button>
                  </div>
                )}

                {isResolved && (
                  <div className="text-center py-3 bg-green-900/20 border border-green-800/30 rounded-xl">
                    <span className="text-green-400 font-bold">
                      ✅ Market Resolved
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          CREATE MARKET MODAL
         ══════════════════════════════════════════ */}
      {showCreate && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCreate(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Create Market"
        >
          <div
            className="modal-content animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-px-heading text-sm text-white">
                  🔮 Create Market
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Select a fight to create a prediction market
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Fight Selection */}
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              ⚔️ Select Fight
            </label>
            <select
              value={selectedFight}
              onChange={(e) => setSelectedFight(e.target.value)}
              className="select-game mb-4"
            >
              <option value="">-- Choose a fight --</option>
              {fights.map((f) => (
                <option key={f.id} value={f.id}>
                  Fight #{f.id}: {getName(f.agentA)} vs{' '}
                  {getName(f.agentB)} ({f.stakeAmount} MON)
                </option>
              ))}
            </select>

            {/* Preview */}
            {selectedFight &&
              (() => {
                const f = fights.find(
                  (fi) => fi.id === Number(selectedFight)
                )
                if (!f) return null
                return (
                  <div className="glass-card p-4 mb-6 text-center animate-scale-in">
                    <p className="text-gray-500 text-xs mb-2 font-mono">
                      MARKET QUESTION
                    </p>
                    <p className="text-white font-bold">
                      "Who will win:{' '}
                      <span className="text-green-400">
                        {getName(f.agentA)}
                      </span>{' '}
                      vs{' '}
                      <span className="text-red-400">
                        {getName(f.agentB)}
                      </span>
                      ?"
                    </p>
                    <p className="mon-amount text-yellow-400 text-sm mt-2">
                      💰 {f.stakeAmount}{' '}
                      <span className="mon-symbol">MON</span> at stake
                    </p>
                  </div>
                )
              })()}

            <button
              onClick={handleCreateMarket}
              disabled={creating || !selectedFight}
              className="btn-shine w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all"
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="loading-spinner"
                    style={{ width: 18, height: 18, borderWidth: 2 }}
                  />
                  Creating...
                </span>
              ) : (
                '🔮 Create Market'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          BET MODAL
         ══════════════════════════════════════════ */}
      {betMarket && betSide !== null && (
        <div
          className="modal-backdrop"
          onClick={closeBetModal}
          role="dialog"
          aria-modal="true"
          aria-label="Place Bet"
        >
          <div
            className="modal-content animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-px-heading text-sm text-white">
                  🎲 Place Bet
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Bet on the outcome of this fight
                </p>
              </div>
              <button
                onClick={closeBetModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Market Info */}
            <div className="glass-card p-4 mb-4">
              <p className="text-gray-500 text-xs mb-1 font-mono">MARKET</p>
              <p className="text-white font-bold text-sm">
                {betMarket.question ||
                  `${getName(betMarket.agentA ?? 0)} vs ${getName(
                    betMarket.agentB ?? 0
                  )}`}
              </p>
            </div>

            {/* Your Pick */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-4 text-center">
              <p className="text-gray-500 text-xs mb-1 font-mono">
                YOUR PICK
              </p>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="agent-avatar"
                  style={{
                    width: 36,
                    height: 36,
                    fontSize: '1rem',
                    background:
                      betSide === betMarket.agentA
                        ? 'rgba(34,197,94,0.2)'
                        : 'rgba(239,68,68,0.2)',
                  }}
                >
                  🤖
                </div>
                <p className="text-purple-400 font-bold text-lg">
                  {getName(betSide)}
                </p>
              </div>
            </div>

            {/* Current Odds */}
            {(() => {
              const { pctA, pctB } = getOddsPct(betMarket)
              return (
                <div className="mb-4">
                  <OddsBar
                    yesPct={pctA}
                    noPct={pctB}
                    yesLabel={getName(betMarket.agentA ?? 0)}
                    noLabel={getName(betMarket.agentB ?? 0)}
                    size="sm"
                  />
                </div>
              )
            })()}

            {/* Amount Input */}
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              💰 Bet Amount (MON)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="5"
              min="0.1"
              step="0.1"
              className="input-game mb-3"
            />

            {/* Quick Amounts */}
            <div className="flex gap-2 mb-5">
              {['1', '5', '10', '25', '50'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    betAmount === amt
                      ? 'bg-purple-600 text-white shadow-glow-purple'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            {/* Potential Payout */}
            <div className="glass-card p-4 mb-6 text-center border-yellow-500/20">
              <p className="text-gray-500 text-xs mb-1 font-mono">
                POTENTIAL PAYOUT
              </p>
              <p className="text-yellow-400 font-bold text-2xl font-mono">
                💰 {payoutStr} MON
              </p>
              {betAmtNum > 0 && payoutNum > betAmtNum && (
                <p className="text-green-400/70 text-xs mt-1">
                  +{profitPct}% potential profit
                </p>
              )}
            </div>

            {/* Place Bet Button */}
            <button
              onClick={handlePlaceBet}
              disabled={betting || !betAmount || betAmtNum <= 0}
              className="btn-battle btn-shine w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all"
            >
              {betting ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="loading-spinner"
                    style={{ width: 18, height: 18, borderWidth: 2 }}
                  />
                  Placing bet...
                </span>
              ) : (
                `🎲 Bet ${betAmount} MON on ${getName(betSide)}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
