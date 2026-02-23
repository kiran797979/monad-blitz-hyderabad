import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import agentsRouter from './routes/agents.js';
import fightsRouter from './routes/fights.js';
import marketsRouter from './routes/markets.js';
import { config, validateConfig } from './config.js';
import { initDatabase, closeDatabase } from './db/database.js';
import { blockchainService } from './services/blockchain.js';

export async function createServer(): Promise<express.Application> {
  validateConfig();

  const app = express();

  app.use(cors({ origin: config.frontendUrl || 'http://localhost:5173', credentials: true }));
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/agents', agentsRouter);
  app.use('/fights', fightsRouter);
  app.use('/markets', marketsRouter);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({ success: false, error: 'Not found' });
  });

  console.log('✅ Database initializing...');
  await initDatabase();
  console.log('✅ Database initialized');

  await blockchainService.initialize();

  return app;
}

export async function startServer(): Promise<void> {
  const app = await createServer();

  const server = app.listen(config.port, () => {
    console.log(`🚀 AI Coliseum API running on port ${config.port}`);
    console.log(`📡 Health check: http://localhost:${config.port}/health`);
  });

  const shutdown = () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
      closeDatabase();
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
