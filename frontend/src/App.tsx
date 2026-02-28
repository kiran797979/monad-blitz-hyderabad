import { Routes, Route, Navigate } from 'react-router-dom'
import { Component, type ReactNode } from 'react'
import Home from './pages/Home'
import Arena from './pages/Arena'
import Markets from './pages/Markets'
import Agents from './pages/Agents'
import Leaderboard from './pages/Leaderboard'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'
import { warmup } from './api/client'

/* ═══════════════════════════════════════════
   ERROR BOUNDARY
   Catches crashes → shows styled error page
   instead of blank white screen during demo.
   ═══════════════════════════════════════════ */

type EBProps = { children: ReactNode }
type EBState = { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('AI Coliseum crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0b1e] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-6">⚔️</div>
            <h1
              className="text-2xl font-bold text-red-400 mb-3"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              CRITICAL HIT!
            </h1>
            <p className="text-gray-400 mb-2 text-sm">
              Something went wrong in the arena.
            </p>
            <div className="bg-black/40 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-400/70 text-xs font-mono break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/'
                }}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white hover:scale-105 transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                🔄 Return to Arena
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:scale-105 transition-all"
              >
                🔃 Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/* ═══════════════════════════════════════════
   Wake Render backend on app load
   ═══════════════════════════════════════════ */
warmup()

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0b1e] text-gray-200 relative">

        {/* Animated Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Floating orbs */}
          <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[120px] animate-float-slow" />
          <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] bg-cyan-500/[0.06] rounded-full blur-[100px] animate-float-medium" />
          <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-pink-500/[0.04] rounded-full blur-[80px] animate-float-fast" />
          <div className="absolute bottom-[10%] left-[25%] w-[350px] h-[350px] bg-yellow-500/[0.03] rounded-full blur-[90px] animate-float-medium" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Scanline effect */}
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Navbar />

          <main className="px-4 py-6 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/arena" element={<Arena />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>

        {/* Custom Toast Styling */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1b3e',
              color: '#e5e7eb',
              border: '1px solid #2a2b5e',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.1)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0a0b1e' },
              style: { borderColor: '#22c55e30' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0b1e' },
              style: { borderColor: '#ef444430' },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  )
}