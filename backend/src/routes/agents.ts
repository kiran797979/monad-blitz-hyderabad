import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { dbOperations } from '../db/database.js';

const router = Router();

const createAgentSchema = z.object({
  name: z.string().min(1).max(32),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  metadataURI: z.string().url().optional(),
});

router.get('/', (_req: Request, res: Response) => {
  try {
    const agents = dbOperations.getAllAgents();
    res.json({ success: true, data: agents });
  } catch (error) {
    console.error('Error listing agents:', error);
    res.status(500).json({ success: false, error: 'Failed to list agents' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid agent ID' });
      return;
    }

    const agent = dbOperations.getAgent(id);

    if (!agent) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    res.json({ success: true, data: agent });
  } catch (error) {
    console.error('Error getting agent:', error);
    res.status(500).json({ success: false, error: 'Failed to get agent' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const parseResult = createAgentSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.issues,
      });
      return;
    }

    const { name, owner, metadataURI } = parseResult.data;

    const agentId = dbOperations.createAgent({
      name,
      owner,
      metadataURI: metadataURI || '',
      wins: 0,
      losses: 0,
      totalBattles: 0,
      stakedAmount: '0',
      isActive: true,
    });

    const agent = dbOperations.getAgent(agentId);
    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ success: false, error: 'Failed to create agent' });
  }
});

router.get('/:id/stats', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid agent ID' });
      return;
    }

    const agent = dbOperations.getAgent(id);

    if (!agent) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    const winRate = agent.totalBattles > 0
      ? (agent.wins / agent.totalBattles) * 100
      : 0;

    res.json({
      success: true,
      data: {
        ...agent,
        winRate: winRate.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error getting agent stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get agent stats' });
  }
});

export default router;
