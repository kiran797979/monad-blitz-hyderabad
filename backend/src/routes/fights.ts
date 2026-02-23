import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { dbOperations } from '../db/database.js';
import { resolveFight } from '../services/fightResolver.js';

const router = Router();

const createFightSchema = z.object({
  agentA: z.number().int().positive(),
  agentB: z.number().int().positive(),
  stakeAmount: z.string().regex(/^\d+(\.\d+)?$/),
});

router.get('/', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const fights = dbOperations.getAllBattles(status);
  res.json({ success: true, data: fights });
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid fight ID' });
    return;
  }

  const fight = dbOperations.getBattle(id);
  
  if (!fight) {
    res.status(404).json({ success: false, error: 'Fight not found' });
    return;
  }

  res.json({ success: true, data: fight });
});

router.post('/', async (req: Request, res: Response) => {
  const parseResult = createFightSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: parseResult.error.issues 
    });
    return;
  }

  const { agentA, agentB, stakeAmount } = parseResult.data;

  if (agentA === agentB) {
    res.status(400).json({ success: false, error: 'Agents must be different' });
    return;
  }

  const agentAData = dbOperations.getAgent(agentA);
  const agentBData = dbOperations.getAgent(agentB);

  if (!agentAData || !agentBData) {
    res.status(404).json({ success: false, error: 'One or both agents not found' });
    return;
  }

  if (!agentAData.isActive || !agentBData.isActive) {
    res.status(400).json({ success: false, error: 'Both agents must be active' });
    return;
  }

  const battleId = dbOperations.createBattle({
    agentA,
    agentB,
    winner: null,
    stakeAmount,
    status: 'pending',
  });

  const battle = dbOperations.getBattle(battleId);
  res.status(201).json({ success: true, data: battle });
});

router.post('/:id/resolve', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'Invalid fight ID' });
    return;
  }

  const fight = dbOperations.getBattle(id);
  
  if (!fight) {
    res.status(404).json({ success: false, error: 'Fight not found' });
    return;
  }

  if (fight.status !== 'pending') {
    res.status(400).json({ success: false, error: 'Fight already resolved or in progress' });
    return;
  }

  const agentA = dbOperations.getAgent(fight.agentA);
  const agentB = dbOperations.getAgent(fight.agentB);

  if (!agentA || !agentB) {
    res.status(500).json({ success: false, error: 'Agent data missing' });
    return;
  }

  dbOperations.updateBattleStatus(id, 'in_progress', null);

  try {
    const result = await resolveFight(agentA, agentB);
    
    dbOperations.updateBattleStatus(id, 'completed', result.winnerId);

    const winner = dbOperations.getAgent(result.winnerId);
    const loser = dbOperations.getAgent(result.loserId);
    
    if (winner && loser) {
      dbOperations.updateAgentStats(
        result.winnerId,
        winner.wins + 1,
        winner.losses,
        winner.totalBattles + 1
      );
      dbOperations.updateAgentStats(
        result.loserId,
        loser.wins,
        loser.losses + 1,
        loser.totalBattles + 1
      );
    }

    res.json({ 
      success: true, 
      data: {
        winner: result.winnerId,
        reasoning: result.reasoning,
        battleLog: result.battleLog,
      }
    });
  } catch (error) {
    dbOperations.updateBattleStatus(id, 'cancelled', null);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Fight resolution failed' 
    });
  }
});

export default router;
