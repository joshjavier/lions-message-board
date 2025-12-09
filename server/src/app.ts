import express from 'express';
import { createMessageRouter } from './routes/messages.js';
import path from 'node:path';

export function createApp() {
  const app = express();

  app.use(express.json());

  // Routes
  app.use('/messages', createMessageRouter());

  // Serve frontend
  const publicDir = path.join(import.meta.dirname, 'public');
  app.use(express.static(publicDir));

  // SPA fallback
  app.get('/*all', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  return app;
}
