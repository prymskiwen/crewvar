import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) return;

    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token: token
      }
    });

    // Join user's personal room
    socketRef.current.emit('join_user_room', currentUser.uid);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  const emitEvent = useCallback((event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const onEvent = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      console.log(`🎧 Listening for event: ${event}`);
      socketRef.current.on(event, (data) => {
        console.log(`📨 Received event: ${event}`, data);
        callback(data);
      });
    }
  }, []);

  const offEvent = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', roomId);
    }
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', roomId);
    }
  }, []);

  return {
    socket: socketRef.current,
    emitEvent,
    onEvent,
    offEvent,
    joinRoom,
    leaveRoom
  };
};
