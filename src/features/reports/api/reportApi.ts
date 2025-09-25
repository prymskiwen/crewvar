import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

// Submit a report
export const submitReport = async (reportData: {
  reportedUserId: string;
  reason: string;
  description: string;
}) => {
  const response = await api.post('/reports/submit', reportData);
  return response.data;
};

export const useSubmitReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'my-reports'] });
    },
  });
};

// Get user's reports
export const getUserReports = async () => {
  const response = await api.get('/reports/my-reports');
  return response.data;
};

export const useUserReports = () => {
  return useQuery({
    queryKey: ['reports', 'my-reports'],
    queryFn: getUserReports,
  });
};
