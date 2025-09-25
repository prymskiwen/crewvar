import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';
import { toast } from 'react-toastify';

// Add Cruise Line
export const addCruiseLine = async (data: { name: string }) => {
  const response = await api.post('/data-management/cruise-lines', data);
  return response.data;
};

export const useAddCruiseLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCruiseLine,
    onSuccess: () => {
      queryClient.invalidateQueries(['data-management', 'cruise-lines']);
      toast.success('Cruise line added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add cruise line');
    },
  });
};

// Add Ship
export const addShip = async (data: { name: string; cruiseLineId: string }) => {
  const response = await api.post('/data-management/ships', data);
  return response.data;
};

export const useAddShip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addShip,
    onSuccess: () => {
      queryClient.invalidateQueries(['data-management', 'ships']);
      toast.success('Ship added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add ship');
    },
  });
};

// Add Department
export const addDepartment = async (data: { name: string; description?: string }) => {
  const response = await api.post('/data-management/departments', data);
  return response.data;
};

export const useAddDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['data-management', 'departments']);
      toast.success('Department added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add department');
    },
  });
};

// Add Role
export const addRole = async (data: { name: string; departmentId: string; description?: string }) => {
  const response = await api.post('/data-management/roles', data);
  return response.data;
};

export const useAddRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['data-management', 'roles']);
      toast.success('Role added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add role');
    },
  });
};

// Get Cruise Lines
export const getCruiseLines = async () => {
  const response = await api.get('/data-management/cruise-lines');
  return response.data;
};

export const useCruiseLines = () => {
  return useQuery({
    queryKey: ['data-management', 'cruise-lines'],
    queryFn: getCruiseLines,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Departments
export const getDepartments = async () => {
  const response = await api.get('/data-management/departments');
  return response.data;
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['data-management', 'departments'],
    queryFn: getDepartments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Ships by Cruise Line
export const getShipsByCruiseLine = async (cruiseLineId: string) => {
  const response = await api.get(`/data-management/cruise-lines/${cruiseLineId}/ships`);
  return response.data;
};

export const useShipsByCruiseLine = (cruiseLineId: string | null) => {
  return useQuery({
    queryKey: ['data-management', 'shipsByCruiseLine', cruiseLineId],
    queryFn: () => getShipsByCruiseLine(cruiseLineId!),
    enabled: !!cruiseLineId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Roles by Department
export const getRolesByDepartment = async (departmentId: string) => {
  const response = await api.get(`/data-management/departments/${departmentId}/roles`);
  return response.data;
};

export const useRolesByDepartment = (departmentId: string | null) => {
  return useQuery({
    queryKey: ['data-management', 'rolesByDepartment', departmentId],
    queryFn: () => getRolesByDepartment(departmentId!),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Delete Cruise Line
export const deleteCruiseLine = async (cruiseLineId: string) => {
  const response = await api.delete(`/data-management/cruise-lines/${cruiseLineId}`);
  return response.data;
};

export const useDeleteCruiseLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCruiseLine,
    onSuccess: () => {
      queryClient.invalidateQueries(['data-management', 'cruise-lines']);
      toast.success('Cruise line deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete cruise line');
    },
  });
};

// Delete Ship
export const deleteShip = async (shipId: string) => {
  const response = await api.delete(`/data-management/ships/${shipId}`);
  return response.data;
};

export const useDeleteShip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteShip,
    onSuccess: () => {
      queryClient.invalidateQueries(['data-management', 'ships']);
      toast.success('Ship deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete ship');
    },
  });
};

// Delete Department
export const deleteDepartment = async (departmentId: string) => {
  const response = await api.delete(`/data-management/departments/${departmentId}`);
  return response.data;
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['data-management', 'departments']);
      toast.success('Department deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete department');
    },
  });
};

// Delete Role
export const deleteRole = async (roleId: string) => {
  const response = await api.delete(`/data-management/roles/${roleId}`);
  return response.data;
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['data-management', 'roles']);
      toast.success('Role deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete role');
    },
  });
};
