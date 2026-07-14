import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export function useSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Only connect if the user is authenticated.
    // The server handles cors origin check, we use withCredentials for auth cookies.
    if (!user) return;

    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // We connect to the base URL since the socket is bound to the http server.
    const baseUrl = url.replace(/\/api$/, '');

    const newSocket = io(baseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      
      // Join roles/rooms
      if (user.role === 'admin') {
        newSocket.emit('join', 'admins');
      }
      newSocket.emit('join', `user_${user.id}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return socket;
}
