import type { Server } from 'socket.io';

/**
 * Sets up Socket.io event handlers.
 * This module intentionally contains NO business logic --
 * it only receives/sends socket events.
 *
 * @param io - The Socket.IO server instance
 */
export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
