import 'dotenv/config';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { startSchedulers } from './services/scheduler.js';
import { setupSocket } from './socket.js';
import { Server } from 'socket.io';

// Host/port logic
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const HOST = isProd ? '0.0.0.0' : 'localhost';

async function start() {
  const app = createApp();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:5173'
          : undefined,
    },
  });

  setupSocket(io);
  startSchedulers(io);

  httpServer.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

start();
