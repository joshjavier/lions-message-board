import { Router } from 'express';
import {
  fetchActiveMessages,
  insertMessage,
} from '../services/message-service.js';

export function createMessageRouter() {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const { author = null, body } = req.body;
      if (!body || typeof body !== 'string' || body.trim().length === 0) {
        return res.status(400).json({ error: 'body is required' });
      }

      const saved = await insertMessage(body, author);

      res.json({ ok: true, message: saved });
    } catch (err) {
      next(err);
    }
  });

  router.get('/active', async (_req, res) => {
    const messages = await fetchActiveMessages(10);
    res.json(messages);
  });

  return router;
}
