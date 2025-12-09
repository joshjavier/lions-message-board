import { Router } from 'express';
import type { SocketApi } from '../socket/index.js';
import {
  fetchActiveMessages,
  insertMessage,
} from '../services/message-service.js';

export function createMessageRouter(socketApi: SocketApi) {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const { author = null, body } = req.body;
      if (!body || typeof body !== 'string' || body.trim().length === 0) {
        return res.status(400).json({ error: 'body is required' });
      }

      const saved = await insertMessage(body, author);

      await socketApi.pushNewMessage(saved);

      res.json({ ok: true, message: saved });
    } catch (err) {
      next(err);
    }
  });

  router.get('/active', async (_req, res) => {
    const messages = await fetchActiveMessages(10);
    res.json({ ok: true, messages });
  });

  return router;
}
