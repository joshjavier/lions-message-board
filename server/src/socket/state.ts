import { getDb } from '../lib/mongodb.js';
import type { Message } from '../types/message.js';

export const MAX_ACTIVE = parseInt(process.env.MAX_ACTIVE || '10', 10);
export const DISPLAY_DURATION_MS = parseInt(
  process.env.DISPLAY_DURATION_MS || '60000',
  10,
);

export const messageQueue: Message[] = [];
export const activeMessages = new Map<string, Message>();

/**
 * Helper: get a random message from MongoDB
 */
export async function getRandomPastMessage(): Promise<Message | null> {
  const db = await getDb();
  const results = await db
    .collection<Message>('messages')
    .aggregate<Message>([{ $sample: { size: 1 } }])
    .toArray();

  return results[0] ?? null;
}

/**
 * Helper: set active state and schedule expiry
 */
export function trackActiveMessage(
  msg: Message,
  emitToAll: (msg: Message) => void,
  fillActive: () => void,
) {
  const id = msg._id.toString();
  activeMessages.set(id, msg);

  const now = new Date();
  msg.status = 'displaying';
  msg.displayedAt = now;
  msg.expiresAt = new Date(now.getTime() + DISPLAY_DURATION_MS);

  emitToAll(msg);

  // When bubble expires, remove and refill
  setTimeout(() => {
    activeMessages.delete(id);
    msg.status = 'expired';
    fillActive();
  }, DISPLAY_DURATION_MS);
}

/**
 * Ensures there are always MAX_ACTIVE messages active.
 */
export async function alwaysFillActiveSlots(emitToAll: (msg: Message) => void) {
  while (activeMessages.size < MAX_ACTIVE) {
    let next: Message | undefined | null = undefined;

    // 1. Prefer fresh queued messages
    if (messageQueue.length > 0) {
      next = messageQueue.shift()!;
    } else {
      // 2. No queued -> resurface an old message
      next = await getRandomPastMessage();
      if (!next) {
        return; // no messages at all yet
      }
    }

    trackActiveMessage(next, emitToAll, () => alwaysFillActiveSlots(emitToAll));
  }
}
