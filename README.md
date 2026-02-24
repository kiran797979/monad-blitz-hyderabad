<div align="center">

<img src="https://img.shields.io/badge/⚔️_AI_COLISEUM-Built_on_Monad-8b5cf6?style=for-the-badge&labelColor=0a0b1e" alt="AI Coliseum" />

<br /><br />

# ⚔️ AI Coliseum

### **AI Agents Battle for MON. You Bet on Who Wins.**

<br />

[![Monad](https://img.shields.io/badge/Chain-Monad_Testnet_(10143)-8b5cf6?style=flat-square&logo=ethereum&logoColor=white)](https://monad.xyz)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity_0.8.20-363636?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![AI](https://img.shields.io/badge/AI-DeepSeek_R1-06b6d4?style=flat-square)](https://openrouter.ai)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br />

**`Deploy AI agents`** → **`Challenge opponents`** → **`Wager MON`** → **`AI resolves combat`** → **`Winners get paid`**

<br />

[🎮 Live Demo](#-demo) · [🏗️ Architecture](#️-architecture) · [⚡ Quick Start](#-quick-start) · [📄 Smart Contracts](#-smart-contracts) · [📖 API Docs](#-api-reference)

---

</div>

<br />

## 🎯 What is AI Coliseum?

**AI Coliseum** is a fully on-chain AI agent battle arena with integrated prediction markets, purpose-built for **Monad's 1-second block times**.

> _Think "Pokémon battles meets Polymarket — but the fighters are AI and everything is on-chain."_

<table>
<tr>
<td width="50%">

### ⚔️ For Fighters
- Deploy AI agents with unique combat stats
- Challenge any opponent to a MON-wagered battle
- AI narrator creates epic multi-round fight stories
- Winner takes the pot (minus 2.5% fee)

</td>
<td width="50%">

### 🔮 For Bettors
- Prediction markets open for every fight
- Bet on which agent will win
- Odds update in real-time based on bet volume
- Proportional payouts from the losing pool

</td>
</tr>
</table>

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Agents** | Deploy fighters with randomized strength, speed, strategy & luck |
| ⚔️ **Wager Battles** | Stake MON on combat — winner takes all |
| 🧠 **AI Narration** | DeepSeek R1 writes dramatic multi-round fight stories |
| 🔮 **Prediction Markets** | Polymarket-style YES/NO betting on fight outcomes |
| 💰 **On-Chain Payouts** | Smart contracts handle all fund locking and distribution |
| 🏆 **Leaderboard** | Track top agents by wins, earnings, and win rate |
| ⚡ **1-Second Blocks** | Monad's speed makes fights resolve instantly |
| 🎮 **Pixel Art UI** | Retro gaming aesthetic with glow effects and animations |

---

## 🎮 Demo

### The Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 1 ─── Connect Wallet                                 │
│              └── MetaMask → Monad Testnet (ChainID: 10143) │
│                                                             │
│  STEP 2 ─── Register AI Agent                              │
│              ├── Choose a name + avatar                     │
│              └── Random stats: STR / SPD / STRAT / LCK     │
│                                                             │
│  STEP 3 ─── Create Challenge                               │
│              ├── Pick your opponent                         │
│              ├── Set wager amount (e.g. 10 MON)            │
│              └── MON locked in Arena.sol                    │
│                                                             │
│  STEP 4 ─── Prediction Market Opens                        │
│              ├── "Will Agent X beat Agent Y?"               │
│              ├── Anyone can bet YES or NO                   │
│              └── Odds shift with every bet                  │
│                                                             │
│  STEP 5 ─── AI Resolves Combat (~5 seconds)                │
│              ├── DeepSeek R1 narrates the battle            │
│              ├── Multi-round: attacks, dodges, crits        │
│              └── Winner declared                            │
│                                                             │
│  STEP 6 ─── Payouts                                        │
│              ├── Fighter: Winner gets 97.5% of pot          │
│              ├── Bettors: Winners split the losing pool     │
│              └── All automated via smart contracts          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 📸 Screenshots

| | | |
|:---:|:---:|:---:|
| **🏠 Home** | **⚔️ Arena** | **🔮 Markets** |
| Hero section with live stats | Create & resolve fights | Bet on outcomes with live odds |
| **🤖 Agents** | **🏆 Leaderboard** | **📜 Battle Log** |
| Register & manage fighters | Champions podium + rankings | Terminal-style AI narration |

---

## 🏗️ Architecture

```
                    ┌──────────────────────┐
                    │     USER BROWSER     │
                    │   MetaMask Wallet    │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      FRONTEND        │
                    │  React + Vite + TW   │
                    │                      │
                    │  Pages:              │
                    │  • Home (stats)      │
                    │  • Arena (fights)    │
                    │  • Markets (bets)    │
                    │  • Agents (registry) │
                    │  • Leaderboard       │
                    └──────────┬───────────┘
                               │ REST API
                    ┌──────────▼───────────┐
                    │      BACKEND         │
                    │  Node.js + Express   │
                    │                      │
                    │  Services:           │
                    │  • AI Combat Engine  │
                    │  • Fight Resolver    │
                    │  • Blockchain Calls  │
                    │                      │
                    │  Database: SQLite    │
                    │  • agents            │
                    │  • fights            │
                    │  • markets           │
                    │  • bets              │
                    └──────────┬───────────┘
                               │ ethers.js v6
                    ┌──────────▼───────────┐
                    │   MONAD TESTNET      │
                    │   ChainID: 10143     │
                    │   ~1 second blocks   │
                    │                      │
                    │  ┌─────────────────┐ │
                    │  │   Arena.sol     │ │
                    │  │  Fight wagers   │ │
                    │  │  + payouts      │ │
                    │  └─────────────────┘ │
                    │  ┌─────────────────┐ │
                    │  │ Prediction      │ │
                    │  │ Market.sol      │ │
                    │  │  Bet pools      │ │
                    │  │  + claims       │ │
                    │  └─────────────────┘ │
                    └──────────────────────┘
```

### Data Flow

```
Register Agent ──→ POST /agents ──→ SQLite
                                       │
Create Fight ───→ POST /fights ──→ SQLite + Arena.sol (lock MON)
                                       │
Create Market ──→ POST /markets ─→ SQLite + PredictionMarket.sol
                                       │
Place Bet ──────→ POST /markets/:id/bet → SQLite + PredictionMarket.sol
                                       │
Resolve Fight ──→ POST /fights/:id/resolve
                    ├── AI Service (DeepSeek R1)
                    ├── OR Stats Fallback
                    ├── Update SQLite
                    ├── Arena.sol → pay winner
                    └── PredictionMarket.sol → resolve market
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose | Why This Choice |
|-------|-----------|---------|-----------------|
| **⛓️ Chain** | Monad Testnet | Settlement layer | 1s blocks, EVM compatible, fast finality |
| **📜 Contracts** | Solidity 0.8.20 | Fund management | No external deps, fully self-contained |
| **🖥️ Backend** | Node.js + Express | API server | Fast to build, rich ecosystem |
| **🗄️ Database** | SQLite | Persistent storage | Zero config, file-based, ACID compliant |
| **🧠 AI** | DeepSeek R1 | Fight narration | Free via OpenRouter, great creative output |
| **⚛️ Frontend** | React 18 + Vite | User interface | Fast HMR, component-based, TypeScript |
| **🎨 Styling** | Tailwind CSS | UI design | Utility-first, rapid iteration |
| **🦊 Wallet** | MetaMask | Web3 connection | Universal, most-used wallet |
| **🔗 Chain Lib** | ethers.js v6 | Contract interaction | Industry standard, great TypeScript support |
| **📝 Language** | TypeScript | Type safety | Catch errors at compile time |

---

## ⚡ Quick Start

### Prerequisites

| Requirement | How to Get It |
|-------------|---------------|
| Node.js v18+ | [nodejs.org](https://nodejs.org/) |
| pnpm | `npm install -g pnpm` |
| MetaMask | [metamask.io](https://metamask.io/) |
| Test MON | [Monad Faucet](https://faucet.monad.xyz) |
| OpenRouter Key | [openrouter.ai](https://openrouter.ai) (free) |

### 1️⃣ Clone

```bash
git clone https://github.com/YOUR_USERNAME/ai-coliseum.git
cd ai-coliseum
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# ═══════════════════════════════
# SERVER
# ═══════════════════════════════
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ═══════════════════════════════
# MONAD TESTNET
# ═══════════════════════════════
MONAD_RPC=https://testnet-rpc.monad.xyz
CHAIN_ID=10143

# ═══════════════════════════════
# SMART CONTRACTS (after deploy)
# ═══════════════════════════════
ARENA_ADDRESS=0xYOUR_ARENA_ADDRESS
MARKET_ADDRESS=0xYOUR_MARKET_ADDRESS

# ═══════════════════════════════
# BACKEND WALLET (for resolving)
# ═══════════════════════════════
PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# ═══════════════════════════════
# AI (free tier)
# ═══════════════════════════════
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY
AI_MODEL=google/gemma-3-4b-it:free
```

Start:

```bash
npm run dev
# ✅ Database initialized
# 🚀 AI Coliseum API running on port 3001
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
pnpm install
pnpm dev
# VITE ready in ~500ms
# ➜ Local: http://localhost:3000/
```

### 4️⃣ Open Browser

```
http://localhost:3000
```

### 5️⃣ Connect MetaMask to Monad

The app will prompt you to switch. Or manually:

| Setting | Value |
|---------|-------|
| Network Name | Monad Testnet |
| RPC URL | `https://testnet-rpc.monad.xyz` |
| Chain ID | `10143` |
| Currency | MON |
| Explorer | `https://testnet.monadexplorer.com` |

---

## 📖 API Reference

### 🏥 Health

```http
GET /health
```

```json
{ "status": "ok" }
```

### 🤖 Agents

<details>
<summary><b>GET /agents</b> — List all agents</summary>

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "AlphaBot",
      "owner": "0x742d...bD3a",
      "wins": 5,
      "losses": 2,
      "totalBattles": 7,
      "isActive": true
    }
  ]
}
```
</details>

<details>
<summary><b>POST /agents</b> — Register new agent</summary>

**Request:**
```json
{
  "name": "AlphaBot",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3a"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "AlphaBot",
    "owner": "0x742d...bD3a",
    "strength": 78,
    "speed": 65,
    "strategy": 82,
    "luck": 45
  }
}
```
</details>

### ⚔️ Fights

<details>
<summary><b>POST /fights</b> — Create challenge</summary>

**Request:**
```json
{
  "agentA": 1,
  "agentB": 2,
  "stakeAmount": "10"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "agentA": 1,
    "agentB": 2,
    "stakeAmount": "10",
    "status": "pending"
  }
}
```
</details>

<details>
<summary><b>POST /fights/:id/resolve</b> — AI combat resolution</summary>

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "winner": 2,
    "status": "completed",
    "reasoning": "OmegaUnit's superior speed allowed it to dodge critical attacks...",
    "battleLog": [
      "⚔️ Battle begins: AlphaBot vs OmegaUnit!",
      "Round 1: AlphaBot opens with a devastating power strike...",
      "Round 2: OmegaUnit dodges and counters with precision...",
      "Round 3: A fierce exchange of blows...",
      "Round 4: AlphaBot staggers from a critical hit...",
      "Round 5: OmegaUnit delivers the finishing blow!",
      "🏆 Winner: OmegaUnit!"
    ]
  }
}
```
</details>

### 🔮 Markets

<details>
<summary><b>POST /markets</b> — Create prediction market</summary>

**Request:**
```json
{
  "battleId": 1,
  "agentA": 1,
  "agentB": 2
}
```
</details>

<details>
<summary><b>POST /markets/:id/bet</b> — Place a bet</summary>

**Request:**
```json
{
  "bettor": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3a",
  "agentId": 1,
  "amount": "5"
}
```
</details>

<details>
<summary><b>GET /markets/:id/odds</b> — Get live odds</summary>

**Response:**
```json
{
  "success": true,
  "data": {
    "oddsA": 15,
    "oddsB": 20,
    "totalPool": 35
  }
}
```
</details>

---

## 📄 Smart Contracts

### Arena.sol — Fight Wagers

> Handles locking and distributing MON for agent battles.

| Function | Access | Description |
|----------|--------|-------------|
| `createChallenge()` | Public | Lock MON as wager, create fight |
| `acceptChallenge()` | Public | Match the wager to accept fight |
| `resolveFight()` | Owner | Declare winner, distribute funds |
| `cancelChallenge()` | Challenger | Cancel and refund locked MON |

```
Fee Structure: 2.5% platform fee on total pot
Example: 20 MON pot → Winner gets 19.5 MON, Platform gets 0.5 MON
```

### PredictionMarket.sol — Betting

> Handles binary outcome prediction markets for fights.

| Function | Access | Description |
|----------|--------|-------------|
| `createMarket()` | Owner | Create YES/NO market for a fight |
| `placeBet()` | Public | Bet MON on an outcome |
| `resolveMarket()` | Owner | Set the winning outcome |
| `claim()` | Public | Winners claim proportional payout |

```
Payout Formula:
  userPayout = userBet + (userBet / winningPool) × losingPool

Example:
  Alice bets 10 MON on A (total A pool: 15 MON)
  B pool: 20 MON
  A wins → Alice gets: 10 + (10/15 × 20) = 23.33 MON
```

### 💰 Money Flow Diagram

```
FIGHT WAGERS                          PREDICTION BETS
═══════════                          ═══════════════

Agent A ──┐                          Alice (10 on A) ──┐
  10 MON  │                          Bob (5 on A)   ───┤
          ├──→ Arena.sol              Charlie (20 on B)─┤──→ PredictionMarket.sol
Agent B ──┘    (20 MON locked)                         │    (35 MON locked)
  10 MON                                               │
                                                       │
         AI Resolves → Agent A Wins                    │
                                                       │
Arena.sol ──→ Agent A gets 19.5 MON   Market Resolves──┘
              Platform gets 0.5 MON
                                      Alice  gets 23.33 MON ✅
                                      Bob    gets 11.67 MON ✅
                                      Charlie gets  0.00 MON ❌
```

### Contract Addresses

| Contract | Network | Address |
|----------|---------|---------|
| Arena.sol | Monad Testnet | `0xYOUR_ARENA_ADDRESS` |
| PredictionMarket.sol | Monad Testnet | `0xYOUR_MARKET_ADDRESS` |

---

## 📁 Project Structure

```
ai-coliseum/
│
├── 📜 contracts/
│   ├── Arena.sol                    # Fight wagers + payouts
│   └── PredictionMarket.sol         # Prediction market betting
│
├── 🖥️ backend/
│   ├── src/
│   │   ├── index.ts                 # Entry point
│   │   ├── server.ts                # Express app + CORS + routes
│   │   ├── config.ts                # Environment config
│   │   ├── routes/
│   │   │   ├── agents.ts            # POST/GET /agents
│   │   │   ├── fights.ts            # POST/GET /fights + resolve
│   │   │   └── markets.ts           # POST/GET /markets + bet + odds
│   │   ├── services/
│   │   │   ├── ai.ts                # DeepSeek R1 via OpenRouter
│   │   │   ├── fightResolver.ts     # AI combat + stats fallback
│   │   │   └── blockchain.ts        # ethers.js contract calls
│   │   └── db/
│   │       └── database.ts          # SQLite: agents, fights, markets, bets
│   ├── .env                         # Secrets (never committed)
│   ├── .env.example                 # Template
│   └── package.json
│
├── ⚛️ frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts            # API client (snake_case → camelCase)
│   │   ├── hooks/
│   │   │   ├── useAgents.ts         # Fetch + refetch agents
│   │   │   ├── useFights.ts         # Fetch + filter fights
│   │   │   ├── useMarkets.ts        # Fetch + refetch markets
│   │   │   └── useWallet.ts         # MetaMask connect/disconnect
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Nav with active states + mobile menu
│   │   │   ├── WalletButton.tsx      # Connect / Switch Network / Address
│   │   │   ├── AgentCard.tsx         # Agent with rank badge + win rate
│   │   │   ├── FightCard.tsx         # VS layout + resolve + battle log
│   │   │   ├── MarketCard.tsx        # Odds bar + bet buttons + modal
│   │   │   ├── BattleLog.tsx         # Terminal-style typing animation
│   │   │   ├── OddsBar.tsx           # Green/red split bar
│   │   │   ├── StatCard.tsx          # Glass morphism stat display
│   │   │   ├── Modal.tsx             # Reusable modal (ESC + click-outside)
│   │   │   └── PixelBorder.tsx       # Decorative pixel shadow border
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Hero + stats + recent fights
│   │   │   ├── Arena.tsx             # Create/filter/resolve fights
│   │   │   ├── Markets.tsx           # Create markets + bet + odds
│   │   │   ├── Agents.tsx            # Register + grid display
│   │   │   └── Leaderboard.tsx       # Podium + full rankings table
│   │   ├── utils/
│   │   │   ├── format.ts             # Address truncation + MON format
│   │   │   └── constants.ts          # Chain config constants
│   │   ├── App.tsx                   # Router + animated background
│   │   ├── main.tsx                  # Entry + BrowserRouter
│   │   ├── index.css                 # Tailwind + animations + pixel art
│   │   └── types.ts                  # Agent, Fight, Market, Bet types
│   ├── tailwind.config.js            # Custom animations + colors
│   ├── postcss.config.js
│   ├── vite.config.ts                # Port 3000 + API proxy
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md                         # ← You are here
```

---

## 🎨 UI Design

The frontend uses a **pixel art gaming aesthetic** inspired by [codedex.io](https://codedex.io):

| Element | Implementation |
|---------|---------------|
| **Background** | Dark navy `#0a0b1e` with floating animated orbs |
| **Grid Overlay** | Subtle retro grid pattern with scanlines |
| **Typography** | `Press Start 2P` for headings, `Space Grotesk` for body |
| **Cards** | Glass morphism with gradient borders and hover glow |
| **Colors** | Purple `#8b5cf6`, Cyan `#06b6d4`, Gold `#f59e0b`, Pink `#ec4899` |
| **Animations** | Float, shimmer, pulse-glow, slide-up, sword-clash |
| **Battle Log** | Terminal style: dark `#0d1117` bg, green `#22c55e` text, monospace |
| **Pixel Borders** | CSS box-shadow based pixel effect |
| **Status Badges** | Color-coded: Open=yellow, Fighting=red pulse, Done=green |
| **Responsive** | Mobile-first with desktop enhancements |

---

## 🧪 Testing

### Quick Smoke Test (curl)

```bash
# 1. Health check
curl http://localhost:3001/health
# → {"status":"ok"}

# 2. Register agents
curl -X POST http://localhost:3001/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"AlphaBot","owner":"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3a"}'

curl -X POST http://localhost:3001/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"OmegaUnit","owner":"0x1234567890abcdef1234567890abcdef12345678"}'

# 3. Create fight
curl -X POST http://localhost:3001/fights \
  -H "Content-Type: application/json" \
  -d '{"agentA":1,"agentB":2,"stakeAmount":"10"}'

# 4. Resolve with AI
curl -X POST http://localhost:3001/fights/1/resolve

# 5. Create market
curl -X POST http://localhost:3001/markets \
  -H "Content-Type: application/json" \
  -d '{"battleId":1,"agentA":1,"agentB":2}'

# 6. Place bet
curl -X POST http://localhost:3001/markets/1/bet \
  -H "Content-Type: application/json" \
  -d '{"bettor":"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD3a","agentId":1,"amount":"5"}'

# 7. Check odds
curl http://localhost:3001/markets/1/odds
```

### Browser Test Flow

```
1. Open http://localhost:3000
2. Connect MetaMask → Switch to Monad Testnet
3. Agents → Register 3 agents (AlphaBot, OmegaUnit, ShadowBlade)
4. Arena → Create Challenge → Pick 2 agents → 10 MON stake
5. Click "⚡ Resolve Fight" → Watch AI battle log appear
6. Markets → Create Market from the fight
7. "Bet Agent A" → 5 MON → Place Bet → See odds change
8. Leaderboard → See ranked agents with win rates
```

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
# ─────────── Server ───────────
PORT=3001                              # API server port
NODE_ENV=development                   # development | production
FRONTEND_URL=http://localhost:3000     # CORS allowed origin

# ─────────── Monad ────────────
MONAD_RPC=https://testnet-rpc.monad.xyz
CHAIN_ID=10143

# ─────────── Contracts ────────
ARENA_ADDRESS=0x...                    # Deployed Arena.sol address
MARKET_ADDRESS=0x...                   # Deployed PredictionMarket.sol address

# ─────────── Wallet ───────────
PRIVATE_KEY=0x...                      # Backend signer (NOT your personal wallet)

# ─────────── AI ───────────────
OPENROUTER_API_KEY=sk-or-v1-...        # From openrouter.ai (free)
AI_MODEL=google/gemma-3-4b-it:free     # Free model for narration
```

### Frontend (`.env` — optional)

```env
VITE_API_URL=http://localhost:3001     # Backend URL (default in code)
```

> ⚠️ **Never commit `.env` files.** They are in `.gitignore`.

---

## 🏆 What Makes This Win

| Criteria | How We Nail It |
|----------|---------------|
| **⚡ Monad Usage** | 1-second fight resolution — demo it live, feels instant |
| **💰 On-Chain Value** | Real MON flowing through 2 smart contracts |
| **🧠 AI Integration** | DeepSeek R1 creates unique fight narratives every time |
| **🔮 Trending Topic** | Prediction markets (Polymarket-style) on AI combat |
| **🎮 Demo Factor** | Register → Fight → Bet → Win in under 2 minutes |
| **📄 Contract Depth** | Arena.sol + PredictionMarket.sol (not just one contract) |
| **🏗️ Full Stack** | Smart Contracts + Backend API + React Frontend |
| **🎨 Visual Polish** | Pixel art UI, glow effects, terminal battle logs |
| **📱 Responsive** | Works on mobile and desktop |
| **🔐 Security** | Check-effects-interactions, prepared statements, input validation |
| **🧹 Code Quality** | TypeScript throughout, clean architecture, proper error handling |
| **📖 Documentation** | This README + API docs + inline comments |

---

## 🚀 Deployment

### Smart Contracts

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `Arena.sol` and `PredictionMarket.sol`
3. Compiler: Solidity `0.8.20`, EVM: `paris`
4. Deploy tab → Environment: "Injected Provider (MetaMask)"
5. Ensure MetaMask is on **Monad Testnet (10143)**
6. Deploy each contract → Copy addresses to `backend/.env`

### Backend (Production)

```bash
cd backend
npm install
npm run build     # Compile TypeScript
npm start         # Start production server
```

### Frontend (Production)

```bash
cd frontend
pnpm install
pnpm build        # Output to dist/
pnpm preview      # Preview production build
```

---

## 🔒 Security

| Category | Status | Details |
|----------|--------|---------|
| **Smart Contracts** | ✅ | Check-effects-interactions pattern, no reentrancy |
| **SQL Injection** | ✅ | All queries use prepared statements |
| **Input Validation** | ✅ | Zod/regex validation on all endpoints |
| **CORS** | ✅ | Restricted to frontend origin |
| **Private Keys** | ✅ | `.env` only, never committed, never in frontend |
| **Wallet Separation** | ✅ | Backend signer ≠ personal wallet |
| **Testnet Only** | ⚠️ | Not audited for mainnet deployment |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

### Built for **Monad Blitz Hackathon 2025** 🏗️

<br />

```
 ╔═══════════════════════════════════════╗
 ║                                       ║
 ║   ⚔️  DEPLOY. FIGHT. BET. WIN.  ⚔️   ║
 ║                                       ║
 ╚═══════════════════════════════════════╝
```

<br />

**[⬆ Back to Top](#️-ai-coliseum)**

</div>