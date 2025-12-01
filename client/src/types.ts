export interface Message {
  _id: string;
  author: string;
  body: string;
  createdAt?: string;
  displayedAt?: string;
  expiresAt?: string;
}
