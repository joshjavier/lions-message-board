import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { getDb } from './lib/mongodb.js';
import path from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = isProduction ? '0.0.0.0' : 'localhost';
const DISPLAY_DURATION_MS = parseInt(
  process.env.DISPLAY_DURATION_MS || '60000',
  10,
);
const MAX_ACTIVE = parseInt(process.env.MAX_ACTIVE || '10', 10);
const ACTIVATION_INTERVAL_MS = parseInt(
  process.env.ACTIVATION_INTERVAL_MS || '2000',
  10,
);

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : undefined,
  },
});

/**
 * Message document shape expectation
 * {
 *  _id,
 *  author,
 *  body,
 *  createdAt,
 *  status: "queued" | "displaying" | "expired",
 *  displayedAt: Date | null,
 *  expiresAt: Date | null
 * }
 */

// --- API: create message ---
app.post('/messages', async (req, res) => {
  try {
    const { author, body } = req.body;
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return res.status(400).json({ error: 'body is required' });
    }

    const db = await getDb();
    const doc = {
      author: author ? String(author).slice(0, 100) : 'Anonymous',
      body: String(body).slice(0, 140),
      createdAt: new Date(),
      status: 'queued',
      displayedAt: null,
      expiresAt: null,
    };

    const result = await db.collection('messages').insertOne(doc);

    // Emit a lightweight event so nodes know there's new queued content
    io.emit('message-created', {
      _id: result.insertedId,
      author: doc.author,
      body: doc.body,
      createdAt: doc.createdAt,
    });

    return res.status(201).json({ ok: true, id: result.insertedId });
  } catch (err) {
    console.error('POST /messages error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// Optional: fetch current active messages (for clients that prefer REST on connect)
app.get('/messages/active', async (_req, res) => {
  try {
    const db = await getDb();
    const active = await db
      .collection('messages')
      .find({ status: 'displaying' })
      .sort({ displayedAt: 1 })
      .toArray();
    return res.json(active);
  } catch (err) {
    console.error('GET /messages/active', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// Serve static frontend files
app.use(express.static('public'));

// SPA fallback
app.get('/*all', (_req, res) => {
  res.sendFile(path.join(import.meta.dirname, 'public', 'index.html'));
});

// --- Socket.io connection ---
io.on('connection', async (socket) => {
  console.log('client connected:', socket.id);

  // On connect, send current active messages
  try {
    const db = await getDb();
    const active = await db
      .collection('messages')
      .find({ status: 'displaying' })
      .sort({ displayedAt: 1 })
      .toArray();

    socket.emit('initial-state', active);
  } catch (err) {
    console.error('Error sending initial-state', err);
  }

  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
});

// --- Queue management logic ---
// 1) Expire messages whose expiresAt <= now
// 2) Activate queued messages up to MAX_ACTIVE using atomic findOneAndUpdate (FIFO)

async function expireDisplayedMessages() {
  try {
    const db = await getDb();
    const now = new Date();

    // Atomically mark one expired message at a time and broadcast; loop to expire all matching
    while (true) {
      const result = await db
        .collection('messages')
        .findOneAndUpdate(
          { status: 'displaying', expiresAt: { $lte: now } },
          { $set: { status: 'expired', updatedAt: new Date() } },
          { returnDocument: 'after' },
        );

      if (!result) {
        break;
      }

      io.emit('message-expired', { _id: result._id.toString() });
      console.log('Expired message', result._id.toString());
    }
  } catch (err) {
    console.error('expireDisplayedMessages error', err);
  }
}

async function activateQueuedMessages() {
  try {
    const db = await getDb();

    // Count current active
    const activeCount = await db
      .collection('messages')
      .countDocuments({ status: 'displaying' });
    const slots = Math.max(0, MAX_ACTIVE - activeCount);
    if (slots <= 0) {
      return;
    }

    for (let i = 0; i < slots; i++) {
      // Atomically pick the oldest queued message and mark it as displaying
      const now = new Date();
      const expiresAt = new Date(now.getTime() + DISPLAY_DURATION_MS);

      const result = await db.collection('messages').findOneAndUpdate(
        { status: 'queued' },
        {
          $set: {
            status: 'displaying',
            displayedAt: now,
            expiresAt,
            updatedAt: new Date(),
          },
        },
        {
          sort: { createdAt: 1 }, // FIFO
          returnDocument: 'after',
        },
      );

      if (!result) {
        break;
      }

      // Broadcast authoritative activation (all nodes will get this)
      io.emit('message-activated', {
        _id: result._id.toString(),
        author: result.author,
        body: result.body,
        displayedAt: result.displayedAt,
        expiresAt: result.expiresAt,
      });

      console.log('Activated message', result._id.toString());
    }
  } catch (err) {
    console.error('activateQueuedMessages error', err);
  }
}

// Run sweeping tasks periodically
setInterval(async () => {
  await expireDisplayedMessages();
  await activateQueuedMessages();
}, ACTIVATION_INTERVAL_MS);

// Also react to immediate creation to try activation fast
io.on('connection', (socket) => {
  socket.on('try-activate', async () => {
    await activateQueuedMessages();
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
