import express from 'express';
import type { SocketApi } from './socket/index.js';
import { createMessageRouter } from './routes/messages.js';
import path from 'node:path';

export function createApp(socketApi: SocketApi) {
  const app = express();

  app.use(express.json());

  // Routes
  app.use('/messages', createMessageRouter(socketApi));

  // Serve frontend
  const publicDir = path.join(import.meta.dirname, '../public');
  app.use(express.static(publicDir));

  // SPA fallback
  app.get('/*all', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  return app;
}
