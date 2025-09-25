import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useBanNotifications = () => {
  const socketRef = useRef<Socket | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) return;

    console.log('🔌 Setting up ban notification socket for user:', currentUser.uid);

    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token: token
      }
    });

    // Join user's personal room
    socketRef.current.emit('join_user_room', currentUser.uid);

    // Listen for ban events
    socketRef.current.on('account_banned', (data: any) => {
      console.log('🚫 Ban notification received:', data);
      // Trigger a custom event that AuthContext can listen to
      window.dispatchEvent(new CustomEvent('userBanned', { detail: data }));
    });

    socketRef.current.on('account_unbanned', (data: any) => {
      console.log('✅ Unban notification received:', data);
      // Trigger a custom event that AuthContext can listen to
      window.dispatchEvent(new CustomEvent('userUnbanned', { detail: data }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  return socketRef.current;
};
