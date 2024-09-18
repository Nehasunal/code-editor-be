const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Setup Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Allow any origin (you can restrict to specific domains)
        methods: ['GET', 'POST'], // Allowed methods
        allowedHeaders: ['my-custom-header'], // Optional: specify allowed headers
        credentials: true, // Allow cookies if needed
      }
});

// WebSocket setup
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining a room
  socket.on('joinRoom', (room) => {
    console.log(room,"==>room")
    socket.join(room);
    console.log(`User joined room: ${room}`);

    // Notify the user that they have joined the room
    socket.emit('joinedRoom', room);
  });

  // Handle incoming code changes from clients
  socket.on('codeChange', (data) => {
    const { room, codeUpdate } = data;
    console.log(`Code change in room ${room}:`, codeUpdate);

    // Broadcast the code update to all clients in the same room
    io.to(room).emit('codeChange', codeUpdate);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = 9000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
