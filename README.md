<div align="center">

# ⚔️ AI Coliseum

### AI Agents Battle for MON. You Bet on Who Wins.

![Monad](https://img.shields.io/badge/Chain-Monad%20Testnet-8b5cf6?style=for-the-badge&logo=ethereum)
![Solidity](https://img.shields.io/badge/Contracts-Solidity%200.8.20-363636?style=for-the-badge&logo=solidity)
![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js)
![AI](https://img.shields.io/badge/AI-DeepSeek%20R1-06b6d4?style=for-the-badge)

**Deploy AI agents → Challenge opponents → Wager MON → AI resolves combat → Winners get paid**

[Live Demo](#demo) · [Architecture](#architecture) · [Quick Start](#quick-start) · [Smart Contracts](#smart-contracts)

</div>

---

## 🎯 What is AI Coliseum?

AI Coliseum is a **fully on-chain AI agent battle arena** with integrated **prediction markets**, built on **Monad testnet**.

- 🤖 **Deploy AI Agents** with unique combat stats (strength, speed, strategy, luck)
- ⚔️ **Create Challenges** and wager MON tokens on the outcome
- 🔮 **Prediction Markets** let anyone bet YES/NO on fight outcomes
- 🧠 **AI-Powered Combat** — DeepSeek R1 narrates multi-round battles
- 💰 **On-Chain Payouts** — Winners automatically receive MON from the smart contracts
- 🏆 **Leaderboard** — Track the top warriors by wins and earnings

---

## 🎮 Demo

### The Full User Flow
STEP 1: Connect Wallet
└── User opens site → connects MetaMask → switches to Monad testnet

STEP 2: Register AI Agent
└── Picks a name + avatar
└── Gets random combat stats (strength, speed, strategy, luck)
└── Saved in database

STEP 3: Create Challenge
└── Picks an opponent (or open challenge)
└── Sets wager amount (e.g., 10 MON)
└── MON gets locked in Arena smart contract

STEP 4: People Bet
└── Anyone can bet on who wins
└── Bets locked in PredictionMarket smart contract
└── Odds update in real time based on bet amounts

STEP 5: Fight Resolves (~5 seconds)
└── Backend runs AI fight resolver
└── DeepSeek R1 narrates the fight
└── Multi-round combat: attacks, dodges, critical hits
└── Winner decided

STEP 6: Payouts
└── Winner gets both wagers (minus 2.5% fee)
└── Correct bettors claim proportional share of losing pool
└── All on-chain, all automatic

text

### Screenshots

| Home | Arena | Markets | Leaderboard |
|------|-------|---------|-------------|
| Hero + Stats | Create & Resolve Fights | Bet on Outcomes | Top Champions |

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────┐
│ FRONTEND │
│ React + Vite + Tailwind │
│ │
│ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│ │ Home │ │ Arena │ │ Markets │ │
│ │ Dashboard│ │ Lobby │ │ (Bet YES/NO) │ │
│ └──────────┘ └──────────┘ └──────────────────┘ │
│ ┌──────────┐ ┌──────────┐ │
│ │ Agents │ │Leaderboard│ │
│ └──────────┘ └──────────┘ │
│ │ │
│ MetaMask Wallet │
└────────────────────┼─────────────────────────────┘
│ API calls (port 3001)
▼
┌─────────────────────────────────────────────────┐
│ BACKEND │
│ Node.js + Express + SQLite │
│ │
│ Routes: │
│ ├── POST /agents → register agent │
│ ├── GET /agents → list agents │
│ ├── POST /fights → create challenge │
│ ├── POST /fights/:id/resolve → AI combat │
│ ├── POST /markets → create market │
│ ├── POST /markets/:id/bet → place bet │
│ └── GET /markets/:id/odds → get live odds │
│ │
│ Services: │
│ ├── AI Combat (DeepSeek R1 via OpenRouter) │
│ ├── Stats-based Fallback (when AI unavailable) │
│ └── Blockchain Service (contract interactions) │
└────────────────────┼─────────────────────────────┘
│ ethers.js calls
▼
┌─────────────────────────────────────────────────┐
│ MONAD TESTNET │
│ ChainID: 10143 | ~1s blocks │
│ │
│ Contract 1: Arena.sol │
│ ├── createChallenge() → lock wager MON │
│ ├── acceptChallenge() → lock matching wager │
│ ├── resolveFight() → pay winner │
│ └── cancelChallenge() → refund │
│ │
│ Contract 2: PredictionMarket.sol │
│ ├── createMarket() → new YES/NO market │
│ ├── placeBet() → lock bet MON │
│ ├── resolveMarket() → set outcome │
│ └── claim() → pay winning bettors │
└─────────────────────────────────────────────────┘

text

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Chain** | Monad Testnet | Fast (1s blocks), EVM compatible |
| **Contracts** | Solidity 0.8.20 | Industry standard, no external deps |
| **Backend** | Node.js + Express | Simple, fast to build |
| **Database** | SQLite | Zero setup, file-based |
| **AI** | DeepSeek R1 (via OpenRouter) | Free tier, great narration |
| **Frontend** | React 18 + Vite | Fast dev, instant HMR |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Wallet** | MetaMask | Universal web3 wallet |
| **Chain Lib** | ethers.js v6 | Standard web3 library |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** v18+ [download](https://nodejs.org/)
- **pnpm** (`npm install -g pnpm`)
- **MetaMask** browser extension
- **Monad testnet MON** from [faucet](https://faucet.monad.xyz)
- **OpenRouter API key** from [openrouter.ai](https://openrouter.ai) (free)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-coliseum.git
cd ai-coliseum
2. Setup Backend
bash
cd backend
npm install
Create .env file:

bash
# backend/.env
PORT=3001
NODE_ENV=development

# Monad Testnet
MONAD_RPC=https://testnet-rpc.monad.xyz
CHAIN_ID=10143

# Contract Addresses (after deployment)
ARENA_ADDRESS=0xYOUR_ARENA_CONTRACT_ADDRESS
MARKET_ADDRESS=0xYOUR_MARKET_CONTRACT_ADDRESS

# Backend Wallet (for resolving fights on-chain)
PRIVATE_KEY=0xYOUR_BACKEND_WALLET_PRIVATE_KEY

# AI (free via OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
AI_MODEL=google/gemma-3-4b-it:free

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
Start backend:

bash
npm run dev
You should see:

text
✅ Database initialized
🚀 AI Coliseum API running on port 3001
3. Setup Frontend
bash
cd ../frontend
pnpm install
pnpm dev
You should see:

text
VITE ready in ~500ms
➜ Local: http://localhost:3000/
4. Open in Browser
text
http://localhost:3000
📖 API Reference
Health
Method	Endpoint	Description
GET	/health	Server health check
Agents
Method	Endpoint	Description
GET	/agents	List all agents
GET	/agents/:id	Get single agent
POST	/agents	Register new agent
POST /agents body:

json
{
  "name": "AlphaBot",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3a"
}
Fights
Method	Endpoint	Description
GET	/fights	List all fights
GET	/fights/:id	Get single fight
POST	/fights	Create challenge
POST	/fights/:id/resolve	Trigger AI combat
POST /fights body:

json
{
  "agentA": 1,
  "agentB": 2,
  "stakeAmount": "10"
}
Markets
Method	Endpoint	Description
GET	/markets	List all markets
GET	/markets/:id	Get single market
POST	/markets	Create prediction market
POST	/markets/:id/bet	Place a bet
GET	/markets/:id/odds	Get current odds
POST	/markets/:id/resolve	Resolve market
POST /markets body:

json
{
  "battleId": 1,
  "agentA": 1,
  "agentB": 2
}
POST /markets/:id/bet body:

json
{
  "bettor": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3a",
  "agentId": 1,
  "amount": "5"
}
📄 Smart Contracts
Arena.sol
Handles fight wagers and payouts.

Function	Description
createChallenge()	Lock MON as wager
acceptChallenge()	Opponent matches wager
resolveFight()	Pay winner (minus 2.5% fee)
cancelChallenge()	Refund if cancelled
PredictionMarket.sol
Handles binary outcome betting.

Function	Description
createMarket()	Create YES/NO market
placeBet()	Lock bet amount
resolveMarket()	Set winning outcome
claim()	Winners claim proportional payout
Money Flow
text
FIGHT FLOW:
  Agent1 wagers 10 MON → locked in Arena.sol
  Agent2 wagers 10 MON → locked in Arena.sol
  Total pot: 20 MON

  Winner gets: 19.5 MON (20 - 2.5% fee)
  Contract keeps: 0.5 MON (platform fee)

MARKET FLOW:
  Alice bets 10 MON on Agent A
  Bob bets 5 MON on Agent A
  Charlie bets 20 MON on Agent B
  Total pool: 35 MON

  If Agent A wins:
    Alice gets: 10 + (10/15 × 20) = 23.33 MON
    Bob gets:    5 + (5/15 × 20)  = 11.67 MON
    Charlie gets: nothing (lost)
Contract Addresses (Monad Testnet)
Contract	Address
Arena.sol	0xYOUR_ARENA_ADDRESS
PredictionMarket.sol	0xYOUR_MARKET_ADDRESS
📁 Project Structure
text
ai-coliseum/
├── contracts/
│   ├── Arena.sol                 ← Fight wagers + payouts
│   └── PredictionMarket.sol      ← Betting markets
│
├── backend/
│   ├── src/
│   │   ├── index.ts              ← Server entry point
│   │   ├── routes/
│   │   │   ├── agents.ts         ← Agent CRUD
│   │   │   ├── fights.ts         ← Fight creation + resolution
│   │   │   └── markets.ts        ← Market + betting
│   │   ├── data/
│   │   │   └── store.ts          ← SQLite database
│   │   └── utils/
│   │       └── helpers.ts        ← Utility functions
│   ├── .env                      ← Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts         ← API client (snake→camel mapping)
│   │   ├── hooks/
│   │   │   ├── useAgents.ts      ← Agent data hook
│   │   │   ├── useFights.ts      ← Fight data hook
│   │   │   ├── useMarkets.ts     ← Market data hook
│   │   │   └── useWallet.ts      ← MetaMask connection
│   │   ├── components/
│   │   │   ├── Navbar.tsx         ← Navigation bar
│   │   │   ├── WalletButton.tsx   ← Wallet connect/disconnect
│   │   │   ├── AgentCard.tsx      ← Agent display card
│   │   │   ├── FightCard.tsx      ← Fight display with resolve
│   │   │   ├── MarketCard.tsx     ← Market with betting UI
│   │   │   ├── BattleLog.tsx      ← Terminal-style combat log
│   │   │   ├── OddsBar.tsx        ← Visual odds percentage bar
│   │   │   ├── StatCard.tsx       ← Glass stat display
│   │   │   ├── Modal.tsx          ← Reusable modal
│   │   │   └── PixelBorder.tsx    ← Decorative pixel border
│   │   ├── pages/
│   │   │   ├── Home.tsx           ← Landing page + stats
│   │   │   ├── Arena.tsx          ← Fight creation + list
│   │   │   ├── Markets.tsx        ← Prediction markets
│   │   │   ├── Agents.tsx         ← Agent registry
│   │   │   └── Leaderboard.tsx    ← Rankings + podium
│   │   ├── utils/
│   │   │   ├── format.ts          ← Address truncation, MON formatting
│   │   │   └── constants.ts       ← Chain config constants
│   │   ├── App.tsx                ← Router + layout
│   │   ├── main.tsx               ← Entry point
│   │   ├── index.css              ← Tailwind + pixel art styles
│   │   └── types.ts               ← TypeScript interfaces
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
🎨 UI Design
The frontend uses a pixel art gaming aesthetic inspired by codedex.io:

🌑 Dark navy background (#0a0b1e)
🟣 Purple accent gradients with glow effects
🎮 Press Start 2P font for headings
📟 Terminal-style battle logs (green monospace on dark)
✨ Floating animated background orbs
🃏 Glass morphism stat cards
🖥️ Retro grid overlay with scanlines
🎯 Pixel borders and hover glow effects
📱 Fully responsive (mobile + desktop)
🧪 Testing
Test with curl
bash
# Health check
curl http://localhost:3001/health

# Register agents
curl -X POST http://localhost:3001/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"AlphaBot","owner":"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3a"}'

curl -X POST http://localhost:3001/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"OmegaUnit","owner":"0x1234567890abcdef1234567890abcdef12345678"}'

# Create fight
curl -X POST http://localhost:3001/fights \
  -H "Content-Type: application/json" \
  -d '{"agentA":1,"agentB":2,"stakeAmount":"10"}'

# Resolve fight (AI narration)
curl -X POST http://localhost:3001/fights/1/resolve

# Create prediction market
curl -X POST http://localhost:3001/markets \
  -H "Content-Type: application/json" \
  -d '{"battleId":1,"agentA":1,"agentB":2}'

# Place bet
curl -X POST http://localhost:3001/markets/1/bet \
  -H "Content-Type: application/json" \
  -d '{"bettor":"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3a","agentId":1,"amount":"5"}'

# Check odds
curl http://localhost:3001/markets/1/odds
Test in Browser
text
1. Open http://localhost:3000
2. Connect MetaMask → Switch to Monad testnet
3. Go to Agents → Register 3 agents
4. Go to Arena → Create Challenge → Pick agents → Start Fight
5. Click Resolve → Watch AI battle log
6. Go to Markets → Create Market from fight
7. Place bets → See odds update
8. Check Leaderboard → See rankings
💰 Money Flow
Fight Wagers
text
Agent A wagers 10 MON  ──→  Arena.sol (locked)
Agent B wagers 10 MON  ──→  Arena.sol (locked)
                              │
                        AI Resolves Fight
                              │
                    Winner gets 19.5 MON
                    Platform fee: 0.5 MON (2.5%)
Prediction Market Bets
text
Alice bets 10 MON on A  ──→  PredictionMarket.sol
Bob bets 5 MON on A     ──→  PredictionMarket.sol
Charlie bets 20 MON on B ──→  PredictionMarket.sol
                                │
                          Fight Resolves → A wins
                                │
                    Alice payout:   23.33 MON
                    Bob payout:     11.67 MON
                    Charlie payout:  0 MON
🔑 Environment Variables
Backend (.env)
Variable	Description	Example
PORT	Server port	3001
MONAD_RPC	Monad RPC URL	https://testnet-rpc.monad.xyz
CHAIN_ID	Monad chain ID	10143
ARENA_ADDRESS	Deployed Arena contract	0x...
MARKET_ADDRESS	Deployed Market contract	0x...
PRIVATE_KEY	Backend wallet key	0x...
OPENROUTER_API_KEY	AI API key	sk-or-v1-...
AI_MODEL	AI model name	google/gemma-3-4b-it:free
FRONTEND_URL	CORS origin	http://localhost:3000
🏆 What Makes This Win
Feature	Why It Matters
⚡ Monad Speed	1-second fight resolution — demo it live
💰 On-chain Money	Real MON wagers + bets flowing through contracts
🧠 AI Integration	DeepSeek R1 narrates epic multi-round battles
🔮 Prediction Markets	Polymarket-style betting on AI combat
🎮 Fun Demo	Register → Fight → Bet → Win → 2 minutes
📄 Multiple Contracts	Arena.sol + PredictionMarket.sol
🏗️ Full Stack	Contracts + Backend + Frontend
🎨 Pixel Art UI	Unique aesthetic, memorable demo
📱 Responsive	Works on mobile and desktop
🔐 No External Deps	Contracts use zero imports (no OpenZeppelin)
🚀 Deployment
Smart Contracts
Open Remix IDE
Create Arena.sol and PredictionMarket.sol
Compile with Solidity 0.8.20
Deploy to Monad testnet (ChainID: 10143)
Copy contract addresses to backend .env
Backend
bash
cd backend
npm install
npm run dev
Frontend
bash
cd frontend
pnpm install
pnpm dev
🔒 Security Notes
⚠️ Never commit .env files — they contain private keys
⚠️ Never use your personal wallet as the backend signer
⚠️ This is testnet only — not audited for mainnet
✅ Contracts use check-effects-interactions pattern
✅ No reentrancy vulnerabilities
✅ SQL injection protected (prepared statements)
✅ Input validation on all API endpoints
✅ CORS restricted to frontend origin
📜 License
MIT License — See LICENSE for details.

Built for Monad Blitz Hackathon 2025 🏗️

⚔️ Deploy. Fight. Bet. Win. ⚔️

⬆ Back to top