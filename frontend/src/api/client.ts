const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function get(path: string) {
  const res = await fetch(API_BASE + path)
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message || res.statusText)
  return json?.data ?? json
}

async function post(path: string, body?: any) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.message || res.statusText)
  return json?.data ?? json
}

function mapFight(f: any) {
  return {
    id: f.id,
    agentA: f.agent_a ?? f.agentA,
    agentB: f.agent_b ?? f.agentB,
    stakeAmount: f.stake_amount ?? f.stakeAmount ?? '0',
    status: f.status,
    winner: f.winner,
    battleLog: typeof f.battle_log === 'string' ? JSON.parse(f.battle_log) : (f.battle_log ?? f.battleLog ?? []),
    reasoning: f.reasoning,
  }
}

function mapMarket(m: any) {
  return {
    id: m.id,
    battleId: m.battle_id ?? m.battleId,
    question: m.question ?? `Who wins Fight #${m.battle_id ?? m.battleId}?`,
    status: m.status,
    winner: m.winner,
    totalPool: m.total_pool ?? m.totalPool ?? '0',
    agentA: m.agent_a ?? m.agentA,
    agentB: m.agent_b ?? m.agentB,
    totalPoolA: m.total_pool_a ?? m.totalPoolA ?? '0',
    totalPoolB: m.total_pool_b ?? m.totalPoolB ?? '0',
  }
}

export const getHealth = () => get('/health')
export const getAgents = () => get('/agents')
export const getAgent = (id: number) => get(`/agents/${id}`)
export const createAgent = (payload: any) => post('/agents', payload)
export const getAgentStats = (id: number) => get(`/agents/${id}/stats`)

export const getFights = async (status?: string) => {
  const path = status ? `/fights?status=${status}` : '/fights'
  const data = await get(path)
  return (Array.isArray(data) ? data : []).map(mapFight)
}
export const getFight = async (id: number) => mapFight(await get(`/fights/${id}`))
export const createFight = (payload: any) => post('/fights', payload)
export const resolveFight = (id: number) => post(`/fights/${id}/resolve`)

export const getMarkets = async () => {
  const data = await get('/markets')
  return (Array.isArray(data) ? data : []).map(mapMarket)
}
export const getMarket = async (id: number) => mapMarket(await get(`/markets/${id}`))
export const createMarket = (payload: any) => post('/markets', payload)
export const placeBet = async (marketId: number, payload: { bettor?: string; agentId: number; amount: string }) => {
  const body = {
    bettor: payload.bettor || '0x0000000000000000000000000000000000000000',
    agentId: Number(payload.agentId),
    amount: String(payload.amount),
  }
  console.log('Placing bet:', marketId, body) // Debug log
  const res = await fetch(API_BASE + `/markets/${marketId}/bet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  console.log('Bet response:', json) // Debug log
  if (!res.ok) throw new Error(json?.error || json?.message || res.statusText)
  return json?.data ?? json
}
export const getOdds = (marketId: number) => get(`/markets/${marketId}/odds`)
export const resolveMarket = (marketId: number, winner: number) => post(`/markets/${marketId}/resolve`, { winner })
export const getBets = (marketId: number) => get(`/markets/${marketId}/bets`)