import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import type { Message } from '../types/message.js';
import {
  activeMessages,
  alwaysFillActiveSlots,
  messageQueue,
} from './state.js';

export function setupSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:5173'
          : undefined,
    },
  });

  // Broadcast helper
  const broadcast = (msg: Message) => io.emit('message', msg);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send current active state
    socket.emit('initial-messages', Array.from(activeMessages.values()));

    socket.on('disconnect', () => {
      console.log('Client disconnected.');
    });
  });

  // Return API for backend to push new messages
  return {
    io,
    pushNewMessage: async (msg: Message) => {
      messageQueue.push(msg);
      await alwaysFillActiveSlots(broadcast);
    },
  };
}

export type SocketApi = ReturnType<typeof setupSocket>;
