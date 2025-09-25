import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

// Types
export interface IChatRoom {
  room_id: string;
  participant1_id: string;
  participant2_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string;
  other_user_role_id: string;
  other_user_department_id: string;
  other_user_ship_id: string;
  ship_name: string;
  cruise_line_name: string;
  department_name: string;
  role_name: string;
  last_message_content?: string;
  last_message_time?: string;
  last_message_status?: string;
  last_message_sender_id?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface IChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  sender_name: string;
  sender_avatar: string;
}

// API functions
const chatApi = {
  getChatRooms: async (): Promise<{ success: boolean; rooms: IChatRoom[] }> => {
    const response = await api.get('/chat/rooms');
    return response.data;
  },

  getChatMessages: async (roomId: string, page: number = 1, limit: number = 20): Promise<{
    success: boolean;
    messages: IChatMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> => {
    const response = await api.get(`/chat/messages/${roomId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getChatRoomByUserId: async (userId: string): Promise<{
    success: boolean;
    room: IChatRoom;
  }> => {
    const response = await api.get(`/chat/room/user/${userId}`);
    return response.data;
  },

  sendMessage: async (data: { roomId: string; content: string }): Promise<{
    success: boolean;
    message: IChatMessage;
  }> => {
    const response = await api.post('/chat/send', data);
    return response.data;
  },

  updateMessageStatus: async (data: { messageId: string; status: 'sent' | 'delivered' | 'read' }): Promise<{
    success: boolean;
  }> => {
    const response = await api.put('/chat/status', data);
    return response.data;
  },

  markMessagesAsRead: async (data: { roomId: string }): Promise<{
    success: boolean;
  }> => {
    const response = await api.post('/chat/mark-read', data);
    return response.data;
  }
};

// React Query hooks
export const useChatRooms = () => {
  return useQuery({
    queryKey: ['chatRooms'],
    queryFn: chatApi.getChatRooms,
    refetchInterval: 60000, // Refetch every 60 seconds (reduced from 30)
    enabled: !!localStorage.getItem('token')
  });
};

export const useChatMessages = (roomId: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['chatMessages', roomId, page, limit],
    queryFn: () => chatApi.getChatMessages(roomId, page, limit),
    enabled: !!roomId && !!localStorage.getItem('token'),
    refetchInterval: false, // Disable automatic refetching - rely on WebSocket
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (newMessage, variables) => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.roomId] });
      
      // Update chat rooms cache with real data
      queryClient.setQueryData(['chatRooms'], (oldData: { success: boolean; rooms: IChatRoom[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          rooms: oldData.rooms.map(room => {
            if (room.room_id === variables.roomId) {
              return {
                ...room,
                last_message_content: newMessage.message.content,
                last_message_time: newMessage.message.created_at,
                last_message_status: newMessage.message.status,
                last_message_sender_id: newMessage.message.sender_id,
                updated_at: newMessage.message.created_at
              };
            }
            return room;
          })
        };
      });
    },
  });
};

export const useUpdateMessageStatus = () => {
  return useMutation({
    mutationFn: chatApi.updateMessageStatus,
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.markMessagesAsRead,
    onSuccess: (_, variables) => {
      // Update chat rooms cache to reset unread count
      queryClient.setQueryData(['chatRooms'], (oldData: { success: boolean; rooms: IChatRoom[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          rooms: oldData.rooms.map(room => {
            if (room.room_id === variables.roomId) {
              return {
                ...room,
                unread_count: 0
              };
            }
            return room;
          })
        };
      });
    },
  });
};

export const useChatRoomByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['chatRoom', userId],
    queryFn: () => chatApi.getChatRoomByUserId(userId),
    enabled: !!userId && !!localStorage.getItem('token'),
  });
};
