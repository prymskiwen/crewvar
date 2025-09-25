import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../../app/api';
import { toast } from 'react-toastify';

// Send bulk message to multiple users
export const sendBulkMessage = async (data: {
  userIds: string[];
  message: string;
  subject?: string;
}) => {
  const response = await api.post('/admin-messaging/bulk-message', data);
  return response.data;
};

export const useSendBulkMessage = () => {
  return useMutation({
    mutationFn: sendBulkMessage,
    onSuccess: (data) => {
      toast.success(data.message || 'Bulk message sent successfully!');
      // Invalidate any relevant queries if needed
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send bulk message');
    },
  });
};

// Get users for messaging
export const getUsersForMessaging = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);

  const response = await api.get(`/admin-messaging/users?${searchParams}`);
  return response.data;
};

export const useUsersForMessaging = (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin-messaging', 'users', params],
    queryFn: () => getUsersForMessaging(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
