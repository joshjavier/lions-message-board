import type { Server } from 'socket.io';
import { getMessageCollection } from './message-service.js';
import { MAX_ACTIVE } from '../lib/constants.js';

export function startSchedulers(io: Server) {
  setInterval(() => expireDisplayedMessages(io), 2000);
  setInterval(() => maintainActiveMessageCount(io), 1500);
}

async function expireDisplayedMessages(io: Server) {
  const col = await getMessageCollection();
  const now = new Date();

  const expired = await col
    .find({ status: 'displaying', expiresAt: { $lte: now } })
    .toArray();

  if (expired.length === 0) {
    return;
  }

  const ids = expired.map((m) => m._id);

  await col.updateMany({ _id: { $in: ids } }, { $set: { status: 'expired' } });

  expired.forEach((msg) => {
    io.emit('message-expired', { _id: msg._id.toString() });
  });
}

async function maintainActiveMessageCount(io: Server) {
  const col = await getMessageCollection();

  const activeCount = await col.countDocuments({ status: 'displaying' });
  if (activeCount >= MAX_ACTIVE) {
    return;
  }

  const missing = MAX_ACTIVE - activeCount;

  // Fill from queued messages first
  const queued = await col.find({ status: 'queued' }).limit(missing).toArray();

  const toDisplay = [];

  if (queued.length < missing) {
    const needMore = missing - queued.length;
    const past = await col
      .aggregate([
        { $match: { status: 'expired' } },
        { $sample: { size: needMore } },
      ])
      .toArray();
    toDisplay.push(...past);
  }

  toDisplay.push(...queued);

  const now = new Date();
  const expiresAt = (mins: number) => new Date(Date.now() + mins * 60_000);

  for (const msg of toDisplay) {
    await col.updateOne(
      { _id: msg._id },
      {
        $set: {
          status: 'displaying',
          displayedAt: now,
          expiresAt: expiresAt(1),
        },
      },
    );

    io.emit('message-activated', msg);
  }
}
