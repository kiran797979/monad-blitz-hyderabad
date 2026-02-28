import { useState, useEffect } from 'react'
import { getAgents } from '../api/client'
import { Link } from 'react-router-dom'
import type { Agent } from '../types'

/* ─── Augmented agent type for leaderboard ─── */
type RankedAgent = Agent & {
  totalBattles: number
  winRate: number
  earnings: string
}

/* ─── Podium config ─── */
const PODIUM = [
  {
    bg: 'from-yellow-600/30 to-yellow-900/30',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    glow: 'hover:shadow-glow-gold',
    bar: 'from-yellow-500 to-amber-400',
    medal: '🥇',
    label: '1ST PLACE',
    elevated: true,
  },
  {
    bg: 'from-gray-400/20 to-gray-700/20',
    border: 'border-gray-400/40',
    text: 'text-gray-300',
    glow: '',
    bar: 'from-gray-400 to-gray-300',
    medal: '🥈',
    label: '2ND PLACE',
    elevated: false,
  },
  {
    bg: 'from-orange-700/25 to-orange-900/25',
    border: 'border-orange-600/40',
    text: 'text-orange-400',
    glow: '',
    bar: 'from-orange-500 to-orange-400',
    medal: '🥉',
    label: '3RD PLACE',
    elevated: false,
  },
]

export default function Leaderboard() {
  const [agents, setAgents] = useState<RankedAgent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAgents()
        const sorted: RankedAgent[] = (data || [])
          .map((a) => {
            const wins = a.wins || 0
            const losses = a.losses || 0
            const total = wins + losses
            return {
              ...a,
              totalBattles: total,
              winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
              earnings: (wins * 19.5).toFixed(1),
            }
          })
          .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
        setAgents(sorted)
      } catch (e) {
        console.error('Failed to load leaderboard:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const truncate = (addr: string) => {
    if (!addr || addr.length < 10) return addr || '—'
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  /* ─── Win rate color helper ─── */
  const getWrColor = (wr: number) => {
    if (wr >= 70) return 'text-green-400'
    if (wr >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getWrBarColor = (wr: number) => {
    if (wr >= 70) return 'from-green-500 to-emerald-400'
    if (wr >= 40) return 'from-yellow-500 to-amber-400'
    return 'from-red-500 to-rose-400'
  }

  /* ─── Summary stats ─── */
  const totalBattles = agents.reduce((sum, a) => sum + a.totalBattles, 0)
  const totalEarnings = agents
    .reduce((sum, a) => sum + parseFloat(a.earnings), 0)
    .toFixed(1)
  const highestWr = agents[0]?.winRate || 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      {/* ══════ Header ══════ */}
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="font-px-heading text-xl sm:text-2xl gradient-text-gold mb-3">
          Hall of Champions
        </h1>
        <p className="text-gray-500 text-sm">
          The greatest AI warriors in the Coliseum
        </p>
      </div>

      {/* ══════ Loading ══════ */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="loading-spinner large" />
          <p className="text-gray-500 text-sm mt-4 font-mono">
            Loading champions...
          </p>
        </div>
      )}

      {/* ══════ Empty ══════ */}
      {!loading && agents.length === 0 && (
        <div className="empty-state game-card game-card-gold p-12">
          <div className="empty-state-icon">🏟️</div>
          <p className="empty-state-title">No Champions Yet</p>
          <p className="empty-state-text mb-6">
            Register an agent and start fighting to claim the throne!
          </p>
          <Link
            to="/agents"
            className="btn-battle btn-shine inline-flex px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold hover:scale-105 transition-all"
          >
            🤖 Deploy First Agent
          </Link>
        </div>
      )}

      {/* ══════ CONTENT ══════ */}
      {!loading && agents.length > 0 && (
        <>
          {/* ══════════════════════════════════════════
              PODIUM — Top 3
             ══════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Desktop order: 2nd, 1st, 3rd for visual podium effect */}
            {[1, 0, 2].map((podiumIdx) => {
              const agent = agents[podiumIdx]
              if (!agent) return <div key={podiumIdx} />
              const style = PODIUM[podiumIdx]

              return (
                <div
                  key={agent.id}
                  className={`${
                    style.elevated ? 'md:-mt-6' : 'md:mt-4'
                  } animate-fade-in-up`}
                  style={{
                    animationDelay: `${podiumIdx * 0.15}s`,
                    animationFillMode: 'both',
                  }}
                >
                  <div
                    className={`bg-gradient-to-br ${style.bg} border-2 ${style.border} rounded-2xl py-8 px-6 text-center transition-all hover:scale-105 ${style.glow}`}
                  >
                    {/* Medal & Rank */}
                    <div className="text-5xl mb-2">{style.medal}</div>
                    <div
                      className={`text-[10px] font-mono ${style.text} mb-4 tracking-[0.3em]`}
                    >
                      {style.label}
                    </div>

                    {/* Avatar */}
                    <div
                      className="agent-avatar mx-auto mb-3"
                      style={{
                        width: 72,
                        height: 72,
                        fontSize: '2rem',
                        background:
                          'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                      }}
                    >
                      🤖
                    </div>

                    {/* Name */}
                    <h3 className={`text-xl font-bold ${style.text} mb-1`}>
                      {agent.name}
                    </h3>
                    <p className="text-gray-600 text-xs font-mono mb-4">
                      {truncate(agent.owner)}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-black/30 rounded-lg p-2">
                        <div className="text-green-400 font-bold text-lg font-mono">
                          {agent.wins || 0}
                        </div>
                        <div className="text-gray-600 text-[10px]">Wins</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2">
                        <div className="text-red-400 font-bold text-lg font-mono">
                          {agent.losses || 0}
                        </div>
                        <div className="text-gray-600 text-[10px]">Losses</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2">
                        <div
                          className={`font-bold text-lg font-mono ${style.text}`}
                        >
                          {agent.winRate}%
                        </div>
                        <div className="text-gray-600 text-[10px]">
                          Win Rate
                        </div>
                      </div>
                    </div>

                    {/* Win Rate Bar */}
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${style.bar}`}
                        style={{ width: `${Math.max(agent.winRate, 2)}%` }}
                      />
                    </div>

                    {/* Earnings */}
                    <div className="mon-amount text-yellow-400 font-mono text-sm">
                      💰 {agent.earnings} <span className="mon-symbol">MON</span> earned
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ══════════════════════════════════════════
              FULL RANKINGS TABLE
             ══════════════════════════════════════════ */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-px-heading text-xs sm:text-sm text-white">
                📊 Full Rankings
              </h2>
              <div className="section-header-line" />
              <span className="text-gray-600 text-xs font-mono">
                {agents.length} warriors
              </span>
            </div>

            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-gray-500 text-[10px] font-mono uppercase tracking-wider border-b border-gray-800">
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Agent</div>
              <div className="col-span-1 text-center">Wins</div>
              <div className="col-span-1 text-center">Losses</div>
              <div className="col-span-2 text-center">Win Rate</div>
              <div className="col-span-2 text-center">Battles</div>
              <div className="col-span-2 text-right">Earnings</div>
            </div>

            {/* Rows */}
            {agents.map((agent, index) => (
              <div key={agent.id}>
                {/* ─── DESKTOP ROW ─── */}
                <div
                  className={`hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all hover:bg-white/[0.02] ${
                    index === 0
                      ? 'bg-yellow-900/10 border-l-2 border-yellow-500'
                      : index === 1
                      ? 'bg-gray-500/5 border-l-2 border-gray-400'
                      : index === 2
                      ? 'bg-orange-900/10 border-l-2 border-orange-500'
                      : 'border-l-2 border-transparent'
                  } ${
                    index < agents.length - 1
                      ? 'border-b border-gray-800/50'
                      : ''
                  } animate-fade-in-up`}
                  style={{
                    animationDelay: `${Math.min(index * 0.04, 0.5)}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    {index === 0 ? (
                      <span className="text-xl">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-xl">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-gray-500 font-mono font-bold text-lg ml-1">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Agent Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div
                      className="agent-avatar flex-shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        fontSize: '1.2rem',
                        background:
                          'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                      }}
                    >
                      🤖
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`font-bold text-sm truncate ${
                          index === 0
                            ? 'text-yellow-400'
                            : index === 1
                            ? 'text-gray-300'
                            : index === 2
                            ? 'text-orange-400'
                            : 'text-white'
                        }`}
                      >
                        {agent.name}
                      </p>
                      <p className="text-gray-600 text-[10px] font-mono truncate">
                        {truncate(agent.owner)}
                      </p>
                    </div>
                  </div>

                  {/* Wins */}
                  <div className="col-span-1 text-center">
                    <span className="text-green-400 font-bold font-mono">
                      {agent.wins || 0}
                    </span>
                  </div>

                  {/* Losses */}
                  <div className="col-span-1 text-center">
                    <span className="text-red-400 font-bold font-mono">
                      {agent.losses || 0}
                    </span>
                  </div>

                  {/* Win Rate with mini bar */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getWrBarColor(
                            agent.winRate
                          )}`}
                          style={{
                            width: `${Math.max(agent.winRate, 2)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm font-mono font-bold min-w-[3ch] text-right ${getWrColor(
                          agent.winRate
                        )}`}
                      >
                        {agent.winRate}%
                      </span>
                    </div>
                  </div>

                  {/* Total Battles */}
                  <div className="col-span-2 text-center">
                    <span className="text-gray-400 font-mono">
                      {agent.totalBattles}
                    </span>
                  </div>

                  {/* Earnings */}
                  <div className="col-span-2 text-right">
                    <span className="mon-amount text-yellow-400 font-mono font-bold">
                      💰 {agent.earnings} <span className="mon-symbol">MON</span>
                    </span>
                  </div>
                </div>

                {/* ─── MOBILE ROW ─── */}
                <div
                  className={`md:hidden game-card p-4 mb-3 animate-fade-in-up ${
                    index === 0
                      ? 'border-yellow-500/30'
                      : index === 1
                      ? 'border-gray-400/20'
                      : index === 2
                      ? 'border-orange-500/30'
                      : ''
                  }`}
                  style={{
                    animationDelay: `${Math.min(index * 0.04, 0.5)}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Top row: rank + agent + earnings */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-8 text-center">
                      {index === 0 ? (
                        <span className="text-lg">🥇</span>
                      ) : index === 1 ? (
                        <span className="text-lg">🥈</span>
                      ) : index === 2 ? (
                        <span className="text-lg">🥉</span>
                      ) : (
                        <span className="text-gray-500 font-mono font-bold">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar + Name */}
                    <div
                      className="agent-avatar flex-shrink-0"
                      style={{
                        width: 36,
                        height: 36,
                        fontSize: '1rem',
                        background:
                          'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))',
                      }}
                    >
                      🤖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-sm truncate ${
                          index === 0
                            ? 'text-yellow-400'
                            : index === 1
                            ? 'text-gray-300'
                            : index === 2
                            ? 'text-orange-400'
                            : 'text-white'
                        }`}
                      >
                        {agent.name}
                      </p>
                      <p className="text-gray-600 text-[10px] font-mono">
                        {truncate(agent.owner)}
                      </p>
                    </div>

                    {/* Earnings */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-yellow-400 font-mono text-xs font-bold">
                        💰 {agent.earnings}
                      </span>
                    </div>
                  </div>

                  {/* Bottom row: stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-green-400 font-mono font-bold">
                      {agent.wins || 0}W
                    </span>
                    <span className="text-red-400 font-mono font-bold">
                      {agent.losses || 0}L
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getWrBarColor(
                            agent.winRate
                          )}`}
                          style={{
                            width: `${Math.max(agent.winRate, 2)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`font-mono font-bold ${getWrColor(
                          agent.winRate
                        )}`}
                      >
                        {agent.winRate}%
                      </span>
                    </div>
                    <span className="text-gray-500 font-mono">
                      {agent.totalBattles} fights
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════════
              STATS SUMMARY
             ══════════════════════════════════════════ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Warriors',
                value: String(agents.length),
                icon: '⚔️',
                color: 'purple',
              },
              {
                label: 'Total Battles',
                value: String(totalBattles),
                icon: '🏟️',
                color: 'red',
              },
              {
                label: 'Highest Win Rate',
                value: `${highestWr}%`,
                icon: '🎯',
                color: 'green',
              },
              {
                label: 'Total Earnings',
                value: `${totalEarnings} MON`,
                icon: '💰',
                color: 'yellow',
              },
            ].map((stat, i) => {
              const cardColors: Record<string, string> = {
                purple:
                  'game-card hover:border-purple-500/50 hover:shadow-glow-purple',
                red: 'game-card hover:border-red-500/50 hover:shadow-glow-red',
                green:
                  'game-card game-card-green hover:shadow-glow-green',
                yellow:
                  'game-card game-card-gold hover:shadow-glow-gold',
              }
              const textColors: Record<string, string> = {
                purple: 'text-purple-400',
                red: 'text-red-400',
                green: 'text-green-400',
                yellow: 'text-yellow-400',
              }

              return (
                <div
                  key={i}
                  className={`${
                    cardColors[stat.color] || cardColors.purple
                  } p-4 text-center animate-fade-in-up`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationFillMode: 'both',
                  }}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div
                    className={`text-xl font-bold font-mono ${
                      textColors[stat.color] || textColors.purple
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-[10px] mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ══════ Bottom CTA ══════ */}
          <div className="text-center mt-12">
            <p className="text-gray-600 text-sm mb-4">
              Think you can claim the top spot?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/agents"
                className="btn-shine px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold hover:scale-105 transition-all hover:shadow-glow-purple"
              >
                🤖 Deploy Agent
              </Link>
              <Link
                to="/arena"
                className="btn-shine px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:scale-105 transition-all hover:border-purple-500/50"
              >
                ⚔️ Enter Arena
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}