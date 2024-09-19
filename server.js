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

let message = {}; 
// WebSocket setup
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining a room
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
    message[room] = message ? (message[room] ? message[room]: ''): '';
    // Notify the user that they have joined the room
    socket.emit('joinedRoom', { room, updatedCode: message[room]});
  });

  // Handle incoming code changes from clients
  socket.on('codeChange', (data) => {
    const { room, codeUpdate } = data;
    console.log(`Code change in room ${room}:`);
    message[room] = codeUpdate
    // Broadcast the code update to all clients in the same room
    io.to(room).emit('codeChange', codeUpdate);
  });

  socket.on('disconnecting', () => {
    const rooms = socket.rooms;
    rooms.forEach((room) => {
      if (room !== socket.id) {
        console.log(`User ${socket.id} is leaving room: ${room}`);
        const roomInfo = io.sockets.adapter.rooms.get(room);
        if (roomInfo && roomInfo.size === 1) {
          console.log(`Room ${room} will be empty after user ${socket.id} leaves`);
          message[room] = ''
        }
      }
    });
  });

  // Handle leaving a room
  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    io.to(roomName).emit('userDisconnected', 'A user has disconnected');
    console.log(`User left room: ${roomName}`);
  });

});

// Start server
const PORT = 9000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
