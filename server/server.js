// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: '*' }));

// server/server.js
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('sendMessage', (data) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    io.emit('message', { ...data, timestamp });
  });

  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});