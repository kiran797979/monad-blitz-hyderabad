import { useState, useEffect, useCallback } from 'react'
import { getAgents, createAgent } from '../api/client'
import toast from 'react-hot-toast'
import type { Agent } from '../types'
import { getWinRate, getRankTier, RANK_COLORS } from '../types'

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAgents()
      setAgents(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  // Auto-fill wallet address
  useEffect(() => {
    const getWallet = async () => {
      try {
        if ((window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts',
          })
          if (accounts?.[0]) setOwner(accounts[0])
        }
      } catch {}
    }
    getWallet()
  }, [])

  // ESC key + scroll lock
  useEffect(() => {
    if (!showModal) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [showModal])

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Enter a name')
    if (!owner.trim()) return toast.error('Enter an owner address')
    setCreating(true)
    try {
      await createAgent({ name: name.trim(), owner: owner.trim() })
      toast.success('Agent deployed! 🤖')
      setShowModal(false)
      setName('')
      fetchAgents()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create agent')
    } finally {
      setCreating(false)
    }
  }

  const truncate = (addr: string) => {
    if (!addr || addr.length < 10) return addr || '—'
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  /* ─── Stat bar helper ─── */
  const StatBar = ({
    label,
    value,
    color,
  }: {
    label: string
    value: number
    color: string
  }) => {
    const colorMap: Record<string, string> = {
      red: 'from-red-500 to-red-400',
      blue: 'from-blue-500 to-cyan-400',
      purple: 'from-purple-500 to-violet-400',
      yellow: 'from-yellow-500 to-amber-400',
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-[10px] font-mono w-10 text-right uppercase">
          {label}
        </span>
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${
              colorMap[color] || colorMap.purple
            } rounded-full transition-all duration-700`}
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-gray-400 text-[10px] font-mono w-6">
          {value}
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ══════ Header ══════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-px-heading text-xl sm:text-2xl text-white mb-2">
            🤖 Agent Registry
          </h1>
          <p className="text-gray-400 text-sm">
            Deploy AI fighters with unique combat stats.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-battle btn-shine px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all hover:shadow-glow-purple hover:-translate-y-0.5"
        >
          + Deploy New Agent
        </button>
      </div>

      {/* ══════ Quick Stats ══════ */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-white">{agents.length}</p>
          <p className="text-gray-500 text-xs mt-0.5">Total Agents</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-green-400">
            {agents.filter((a) => (a.wins || 0) > 0).length}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">With Wins</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {agents.reduce(
              (s, a) => s + (a.wins || 0) + (a.losses || 0),
              0
            )}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Total Battles</p>
        </div>
      </div>

      <hr className="divider-glow mb-6" />

      {/* ══════ Loading ══════ */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="loading-spinner large" />
          <p className="text-gray-500 text-sm mt-4 font-mono">
            Loading agents...
          </p>
        </div>
      )}

      {/* ══════ Empty State ══════ */}
      {!loading && agents.length === 0 && (
        <div className="empty-state game-card p-12">
          <div className="empty-state-icon">🤖</div>
          <p className="empty-state-title">No Agents Deployed</p>
          <p className="empty-state-text mb-6">
            Deploy your first AI fighter to enter the arena
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-battle btn-shine px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold hover:scale-105 transition-all"
          >
            🤖 Deploy First Agent
          </button>
        </div>
      )}

      {/* ══════ Agent Grid ══════ */}
      {!loading && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent, idx) => {
            const wr = getWinRate(agent)
            const tier = getRankTier(agent)
            const tierInfo = RANK_COLORS[tier]

            return (
              <div
                key={agent.id}
                className="game-card p-5 group animate-fade-in-up hover:shadow-glow-purple"
                style={{
                  animationDelay: `${Math.min(idx * 0.06, 0.5)}s`,
                  animationFillMode: 'both',
                }}
              >
                {/* Rank tier badge */}
                <div className="flex justify-between items-center mb-3">
                  <span
                    className="rank-badge text-[10px] px-2 py-0.5"
                    style={{
                      color: tierInfo.text,
                      borderColor: tierInfo.glow,
                      textShadow: `0 0 8px ${tierInfo.glow}`,
                    }}
                  >
                    {tierInfo.emoji} {tier.toUpperCase()}
                  </span>
                  <span className="text-gray-600 text-xs font-mono">
                    #{agent.id}
                  </span>
                </div>

                {/* Avatar + Name */}
                <div className="text-center mb-4">
                  <div
                    className="agent-avatar mx-auto mb-2 group-hover:scale-110 transition-transform"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                    }}
                  >
                    🤖
                  </div>
                  <h3 className="text-lg font-bold text-white mb-0.5">
                    {agent.name}
                  </h3>
                  <p className="text-gray-600 text-xs font-mono">
                    {truncate(agent.owner)}
                  </p>
                </div>

                {/* Combat Stats */}
                <div className="space-y-1.5 mb-4">
                  <StatBar
                    label="STR"
                    value={agent.strength ?? 50}
                    color="red"
                  />
                  <StatBar
                    label="SPD"
                    value={agent.speed ?? 50}
                    color="blue"
                  />
                  <StatBar
                    label="STRAT"
                    value={agent.strategy ?? 50}
                    color="purple"
                  />
                  <StatBar
                    label="LCK"
                    value={agent.luck ?? 50}
                    color="yellow"
                  />
                </div>

                {/* Win/Loss + Rate */}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-400 font-mono font-bold">
                    {agent.wins ?? 0}W
                  </span>
                  <span className="text-red-400 font-mono font-bold">
                    {agent.losses ?? 0}L
                  </span>
                  <span className="text-yellow-400 font-mono font-bold">
                    {wr}% WR
                  </span>
                </div>

                {/* Win Rate Bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      wr >= 60
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                        : wr >= 40
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                        : 'bg-gradient-to-r from-red-500 to-rose-400'
                    }`}
                    style={{ width: `${Math.max(wr, 2)}%` }}
                  />
                </div>

                {/* Status */}
                <div className="text-center">
                  <span className="status-badge open">
                    <span className="status-dot" />
                    ACTIVE
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          REGISTER AGENT MODAL
         ══════════════════════════════════════════ */}
      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Register Agent"
        >
          <div
            className="modal-content animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-px-heading text-sm text-white">
                  🤖 Deploy New Agent
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Stats are randomly generated on creation
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Agent Name */}
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              🏷️ Agent Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ShadowBlade, NeonWraith..."
              maxLength={30}
              className="input-game mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() && owner.trim())
                  handleCreate()
              }}
            />

            {/* Owner Address */}
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              👛 Owner Wallet
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="0x..."
              className="input-game mb-2 font-mono text-sm"
            />
            <p className="text-gray-600 text-xs mb-5">
              {owner
                ? `✅ Connected: ${truncate(owner)}`
                : '🔗 Connect MetaMask to auto-fill'}
            </p>

            {/* Preview */}
            {name.trim() && (
              <div className="glass-card p-4 mb-5 text-center animate-scale-in">
                <div
                  className="agent-avatar mx-auto mb-2"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                  }}
                >
                  🤖
                </div>
                <p className="text-purple-400 font-bold">{name}</p>
                <p className="text-gray-600 text-xs font-mono mt-1">
                  {truncate(owner) || 'No owner set'}
                </p>
                <p className="text-gray-500 text-[10px] mt-2">
                  ⚡ Random stats will be generated on deploy
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="btn-battle btn-shine w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all"
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="loading-spinner"
                    style={{ width: 18, height: 18, borderWidth: 2 }}
                  />
                  Deploying...
                </span>
              ) : (
                '🚀 Deploy Agent'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}