import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

io.on('connection', (socket) => {
  // ...
});

httpServer.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
