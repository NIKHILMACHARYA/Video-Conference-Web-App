// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./authRoutes');
require('dotenv').config();

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use('/api/auth', authRoutes);

// Socket.IO for video/chat
io.on('connection', (socket) => {
  console.log('🟢 New socket connected');

  socket.on('join-room', (roomId, userId) => {
    console.log(`🔗 User ${userId} joined room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} left room ${roomId}`);
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
