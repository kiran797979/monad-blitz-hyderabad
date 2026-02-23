import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { dbOperations } from '../db/database.js';

const router = Router();

/* =========================
   Schemas
========================= */

const createMarketSchema = z.object({
  battleId: z.number().int().positive(),
  agentA: z.number().int().positive(),
  agentB: z.number().int().positive(),
});

const placeBetSchema = z.object({
  bettor: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  agentId: z.number().int().positive(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
});

const resolveSchema = z.object({
  winner: z.number().int().positive(),
});

/* =========================
   Create Market
   POST /markets
========================= */

router.post('/', (req: Request, res: Response) => {
  const parseResult = createMarketSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: parseResult.error.issues,
    });
  }

  const { battleId, agentA, agentB } = parseResult.data;

  if (agentA === agentB) {
    return res.status(400).json({
      success: false,
      error: 'Agents must be different',
    });
  }

  const marketId = dbOperations.createMarket({
    battleId,
    agentA,
    agentB,
    status: 'open',
    totalPoolA: '0',
    totalPoolB: '0',
    winner: null,
  });

  const market = dbOperations.getMarket(marketId);

  return res.status(201).json({
    success: true,
    data: market,
  });
});

/* =========================
   List Markets
   GET /markets
========================= */

router.get('/', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const markets = dbOperations.getAllMarkets(status);
  res.json({ success: true, data: markets });
});

/* =========================
   Get Market by ID
   GET /markets/:id
========================= */

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid market ID' });
  }

  const market = dbOperations.getMarket(id);

  if (!market) {
    return res.status(404).json({ success: false, error: 'Market not found' });
  }

  res.json({ success: true, data: market });
});

/* =========================
   Get Odds
   GET /markets/:id/odds
========================= */

router.get('/:id/odds', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid market ID' });
  }

  const market = dbOperations.getMarket(id);

  if (!market) {
    return res.status(404).json({ success: false, error: 'Market not found' });
  }

  const poolA = parseFloat(market.totalPoolA);
  const poolB = parseFloat(market.totalPoolB);
  const total = poolA + poolB;

  let oddsA = 0.5;
  let oddsB = 0.5;

  if (total > 0) {
    oddsA = poolA / total;
    oddsB = poolB / total;
  }

  res.json({
    success: true,
    data: {
      agentA: market.agentA,
      agentB: market.agentB,
      oddsA: oddsA.toFixed(4),
      oddsB: oddsB.toFixed(4),
      totalPoolA: market.totalPoolA,
      totalPoolB: market.totalPoolB,
      totalPool: total.toString(),
    },
  });
});

/* =========================
   Place Bet
   POST /markets/:id/bet
========================= */

router.post('/:id/bet', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid market ID' });
  }

  const market = dbOperations.getMarket(id);

  if (!market) {
    return res.status(404).json({ success: false, error: 'Market not found' });
  }

  if (market.status !== 'open') {
    return res.status(400).json({ success: false, error: 'Market is not open for betting' });
  }

  const parseResult = placeBetSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: parseResult.error.issues,
    });
  }

  const { bettor, agentId, amount } = parseResult.data;

  if (agentId !== market.agentA && agentId !== market.agentB) {
    return res.status(400).json({ success: false, error: 'Invalid agent for this market' });
  }

  const betId = dbOperations.createBet({
    marketId: id,
    bettor,
    agentId,
    amount,
    claimed: false,
  });

  const poolA = parseFloat(market.totalPoolA);
  const poolB = parseFloat(market.totalPoolB);
  const betAmount = parseFloat(amount);

  if (agentId === market.agentA) {
    dbOperations.updateMarketPool(id, (poolA + betAmount).toString(), market.totalPoolB);
  } else {
    dbOperations.updateMarketPool(id, market.totalPoolA, (poolB + betAmount).toString());
  }

  res.status(201).json({
    success: true,
    data: { betId, marketId: id, agentId, amount },
  });
});

/* =========================
   List Bets
   GET /markets/:id/bets
========================= */

router.get('/:id/bets', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid market ID' });
  }

  const market = dbOperations.getMarket(id);

  if (!market) {
    return res.status(404).json({ success: false, error: 'Market not found' });
  }

  const bets = dbOperations.getBetsByMarket(id);
  res.json({ success: true, data: bets });
});

/* =========================
   Resolve Market
   POST /markets/:id/resolve
========================= */

router.post('/:id/resolve', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid market ID' });
  }

  const parseResult = resolveSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: parseResult.error.issues,
    });
  }

  const market = dbOperations.getMarket(id);

  if (!market) {
    return res.status(404).json({ success: false, error: 'Market not found' });
  }

  if (market.status !== 'open') {
    return res.status(400).json({ success: false, error: 'Market already resolved or closed' });
  }

  const { winner } = parseResult.data;

  if (winner !== market.agentA && winner !== market.agentB) {
    return res.status(400).json({ success: false, error: 'Invalid winner for this market' });
  }

  dbOperations.resolveMarket(id, winner);
  const updatedMarket = dbOperations.getMarket(id);

  res.json({ success: true, data: updatedMarket });
});

export default router;