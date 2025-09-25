import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

// Reports API
export const getReports = async (filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await api.get(`/admin/reports?${params.toString()}`);
  return response.data;
};

export const useReports = (filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['admin', 'reports', filters],
    queryFn: () => getReports(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const resolveReport = async ({ reportId, status, adminNotes, action, targetUserId }: {
  reportId: string;
  status: string;
  adminNotes: string;
  action: string;
  targetUserId: string;
}) => {
  const response = await api.post(`/admin/reports/${reportId}/resolve`, {
    status,
    adminNotes,
    action,
    targetUserId
  });
  return response.data;
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'actions'] });
    },
  });
};

// Flagged Messages API
export const getFlaggedMessages = async () => {
  const response = await api.get('/admin/flagged-messages');
  return response.data;
};

export const useFlaggedMessages = () => {
  return useQuery({
    queryKey: ['admin', 'flagged-messages'],
    queryFn: getFlaggedMessages,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const moderateMessage = async ({ messageId, action, reason, targetUserId }: {
  messageId: string;
  action: string;
  reason: string;
  targetUserId: string;
}) => {
  const response = await api.post(`/admin/flagged-messages/${messageId}/moderate`, {
    action,
    reason,
    targetUserId
  });
  return response.data;
};

export const useModerateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: moderateMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flagged-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'actions'] });
    },
  });
};

// Role Requests API
export const getRoleRequests = async () => {
  const response = await api.get('/admin/role-requests');
  return response.data;
};

export const useRoleRequests = () => {
  return useQuery({
    queryKey: ['admin', 'role-requests'],
    queryFn: getRoleRequests,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const handleRoleRequest = async ({ requestId, action, reason }: {
  requestId: string;
  action: string;
  reason: string;
}) => {
  const response = await api.post(`/admin/role-requests/${requestId}/handle`, {
    action,
    reason
  });
  return response.data;
};

export const useHandleRoleRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: handleRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'actions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};
