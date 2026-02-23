import { useState, useEffect } from 'react';

interface Agent {
  id: number;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  totalBattles: number;
  isActive: boolean;
}

interface Battle {
  id: number;
  agentA: number;
  agentB: number;
  winner: number | null;
  status: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedTab, setSelectedTab] = useState<'arena' | 'markets' | 'leaderboard'>('arena');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [agentsRes, battlesRes] = await Promise.all([
        fetch(`${API_URL}/agents`),
        fetch(`${API_URL}/fights`),
      ]);
      const agentsData = await agentsRes.json();
      const battlesData = await battlesRes.json();
      
      if (agentsData.success) setAgents(agentsData.data);
      if (battlesData.success) setBattles(battlesData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const activeAgents = agents.filter(a => a.isActive);
  const topAgents = [...agents].sort((a, b) => b.wins - a.wins).slice(0, 5);

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚔️</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-arena-primary to-arena-secondary bg-clip-text text-transparent">
                AI Coliseum
              </h1>
            </div>
            <nav className="flex gap-2">
              {(['arena', 'markets', 'leaderboard'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTab === tab
                      ? 'bg-arena-primary text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arena-primary"></div>
          </div>
        ) : (
          <>
            {selectedTab === 'arena' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="card">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span>🏟️</span> Battle Arena
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm text-slate-400 mb-2">Agent A</h3>
                        <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white">
                          <option value="">Select Agent</option>
                          {activeAgents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm text-slate-400 mb-2">Agent B</h3>
                        <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white">
                          <option value="">Select Agent</option>
                          {activeAgents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button className="btn-primary w-full mt-4 py-3 text-lg glow">
                      ⚔️ Start Battle
                    </button>
                  </div>

                  <div className="card mt-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span>📜</span> Recent Battles
                    </h2>
                    <div className="space-y-3">
                      {battles.slice(0, 5).map(battle => (
                        <div key={battle.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-arena-primary font-bold">#{battle.id}</span>
                            <span>Agent {battle.agentA} vs Agent {battle.agentB}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            battle.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                            battle.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-slate-700 text-slate-400'
                          }`}>
                            {battle.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span>🤖</span> Registered Agents
                    </h2>
                    <div className="space-y-2">
                      {agents.slice(0, 8).map(agent => (
                        <div key={agent.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{agent.name}</span>
                            <span className="text-xs text-green-400">Active</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span>W: {agent.wins}</span>
                            <span>L: {agent.losses}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn-secondary w-full mt-4">
                      + Register New Agent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'markets' && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📊</span> Prediction Markets
                </h2>
                <p className="text-slate-400">Place bets on upcoming battles. Markets will be available once battles are scheduled.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-dashed border-slate-600 text-center">
                    <span className="text-4xl">🎯</span>
                    <p className="text-slate-400 mt-2">No active markets</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'leaderboard' && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🏆</span> Leaderboard
                </h2>
                <div className="space-y-3">
                  {topAgents.map((agent, index) => (
                    <div key={agent.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 flex items-center gap-4">
                      <div className={`text-2xl font-bold w-8 ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-slate-300' :
                        index === 2 ? 'text-amber-600' :
                        'text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-slate-400">
                          {agent.totalBattles} battles
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-arena-primary">{agent.wins}W</div>
                        <div className="text-sm text-slate-400">{agent.losses}L</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          AI Coliseum - Powered by Monad
        </div>
      </footer>
    </div>
  );
}

export default App;
