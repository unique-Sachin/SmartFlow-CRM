import app from './app';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

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

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Optional: Basic connection log
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
}); 