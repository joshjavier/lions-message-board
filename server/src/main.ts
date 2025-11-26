import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : undefined,
  },
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

app.post('/messages', (req, res) => {
  const { author, body } = req.body;
  console.log({ author, body });

  // broadcast message
  io.emit('message', { author, body });

  // send response
  res.send({ message: 'Got a POST request' });
});

io.on('connection', (socket) => {
  console.log('user connected: ', socket.id);
  socket.on('foo', (message, callback) => {
    io.emit('foo', message);
    callback('got it');
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
