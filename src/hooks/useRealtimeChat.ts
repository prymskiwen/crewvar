import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextFirebase';
import {
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  subscribeToChatMessages,
  ChatMessage
} from '../firebase/firestore';

export const useRealtimeChat = (roomId: string) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Load initial messages
  useEffect(() => {
    if (!roomId || !currentUser) return;

    const loadMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const { messages: chatMessages } = await getChatMessages(roomId);
        setMessages(chatMessages);
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [roomId, currentUser]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!roomId || !currentUser) return;

    const unsubscribe = subscribeToChatMessages(roomId, (newMessages) => {
      setMessages(newMessages);
    });

    return unsubscribe;
  }, [roomId, currentUser]);

  // Mark messages as read when user views the chat
  useEffect(() => {
    if (!roomId || !currentUser || messages.length === 0) return;

    const markAsRead = async () => {
      try {
        await markMessagesAsRead(roomId, currentUser.uid);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    };

    markAsRead();
  }, [roomId, currentUser, messages.length]);

  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!currentUser || !content.trim()) return;

    setSending(true);
    try {
      await sendChatMessage(
        roomId,
        currentUser.uid,
        content.trim(),
        type
      );
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }, [roomId, currentUser]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage
  };
};
