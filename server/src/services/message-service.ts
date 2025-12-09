import { MAX_ACTIVE } from '../lib/constants.js';
import { getDb } from '../lib/mongodb.js';
import type { Message } from '../types/message.js';

export async function getMessageCollection() {
  const db = await getDb();
  return db.collection<Message>('messages');
}

export async function fetchActiveMessages(limit = MAX_ACTIVE) {
  const col = await getMessageCollection();
  return col
    .find({ status: 'displaying' })
    .sort({ displayedAt: -1 })
    .limit(limit)
    .toArray();
}

export async function fetchQueuedMessages() {
  const col = await getMessageCollection();
  return col.find({ status: 'queued' }).toArray();
}

export async function fetchRandomPastMessage() {
  const col = await getMessageCollection();
  return col
    .aggregate([{ $match: { status: 'expired' } }, { $sample: { size: 1 } }])
    .next();
}

export async function insertMessage(
  body: string,
  author: string | null = null,
) {
  const col = await getMessageCollection();
  const doc: Omit<Message, '_id'> = {
    author,
    body,
    createdAt: new Date(),
    status: 'queued',
    displayedAt: null,
    expiresAt: null,
  };

  const result = await col.insertOne(doc as Message);
  return { _id: result.insertedId, ...doc };
}
