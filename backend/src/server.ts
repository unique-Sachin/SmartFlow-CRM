import app from './app';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { ChatMessage } from './models/ChatMessage';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // Adjust as needed for security
    methods: ['GET', 'POST'],
  },
});

// Attach io to app for controller access
(app as any).io = io;

// Socket.IO chat logic
const onlineUsers = new Map(); // userId -> socket.id
const socketUserIds = new WeakMap(); // socket -> userId

io.on('connection', (socket) => {
  // User joins with their userId
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socketUserIds.set(socket, userId);
  });

  // Handle sending a chat message
  socket.on('chatMessage', async (msg) => {
    // msg: { sender, receiver, content }
    const { sender, receiver, content } = msg;
    if (!sender || !receiver || !content) return;
    const chatMsg = new ChatMessage({ sender, receiver, content });
    await chatMsg.save();
    // Emit to receiver if online
    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('chatMessage', chatMsg);
    }
    // Also emit to sender for confirmation
    socket.emit('chatMessage', chatMsg);
  });

  // Handle chat history request
  socket.on('getChatHistory', async ({ userId, otherUserId }) => {
    if (!userId || !otherUserId) return;
    const history = await ChatMessage.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });
    socket.emit('chatHistory', history);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = socketUserIds.get(socket);
    if (userId) {
      onlineUsers.delete(userId);
      socketUserIds.delete(socket);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Optional: Basic connection log
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
}); 