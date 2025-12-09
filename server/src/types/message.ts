import type { ObjectId } from 'mongodb';

export type MessageStatus = 'queued' | 'displaying' | 'expired';

export interface Message {
  _id: ObjectId;
  author: string | null;
  body: string;
  createdAt: Date;
  status: MessageStatus;
  displayedAt: Date | null;
  expiresAt: Date | null;
}
