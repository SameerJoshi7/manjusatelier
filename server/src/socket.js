import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) return next(new Error('Authentication error'));
      
      const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).lean();
      if (!user) return next(new Error('User not found'));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id, 'User:', socket.user._id);

    // Clients can join specific rooms based on their roles or IDs
    socket.on('join', (room) => {
      if (room === 'admins' && socket.user?.role !== 'admin') {
        console.warn(`Unauthorized admin room join attempt by user ${socket.user._id}`);
        return;
      }
      if (room.startsWith('user_') && room !== `user_${socket.user._id.toString()}`) {
        console.warn(`Unauthorized user room join attempt by user ${socket.user._id}`);
        return;
      }

      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
