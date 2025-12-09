import 'dotenv/config';
import { createServer } from 'node:http';
import { setupSocket } from './socket/index.js';
import { createApp } from './app.js';
import { startSchedulers } from './services/scheduler.js';

// Host/port logic
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const HOST = isProd ? '0.0.0.0' : 'localhost';

async function start() {
  const httpServer = createServer();
  const socketApi = setupSocket(httpServer);
  const app = createApp(socketApi);

  startSchedulers(socketApi.io);

  httpServer.on('request', app);

  httpServer.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

start();
