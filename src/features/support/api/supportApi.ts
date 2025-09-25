import { api } from '../../../app/api';

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  admin_id?: string;
  admin_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface SupportStats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  resolvedToday: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export interface TicketsResponse {
  success: boolean;
  tickets: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User API functions
export const createSupportTicket = async (ticketData: CreateTicketRequest) => {
  const response = await api.post('/support/tickets', ticketData);
  return response.data;
};

export const getUserSupportTickets = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
}) => {
  const response = await api.get('/support/tickets', { params });
  return response.data;
};

export const getSupportTicket = async (ticketId: string) => {
  const response = await api.get(`/support/tickets/${ticketId}`);
  return response.data;
};

// Admin API functions
export const getAdminSupportTickets = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
}) => {
  const response = await api.get('/support/admin/tickets', { params });
  return response.data;
};

export const getAdminSupportTicket = async (ticketId: string) => {
  const response = await api.get(`/support/admin/tickets/${ticketId}`);
  return response.data;
};

export const updateTicketStatus = async (ticketId: string, status: string) => {
  const response = await api.put(`/support/admin/tickets/${ticketId}/status`, { status });
  return response.data;
};

export const addTicketResponse = async (ticketId: string, response: string) => {
  const apiResponse = await api.post(`/support/admin/tickets/${ticketId}/response`, { response });
  return apiResponse.data;
};

export const getSupportStats = async () => {
  const response = await api.get('/support/admin/stats');
  return response.data;
};
