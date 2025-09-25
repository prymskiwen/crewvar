import { api } from '../../../app/api';

export interface IDepartment {
  id: string;
  name: string;
  description?: string;
}

export interface ISubcategory {
  id: string;
  name: string;
  description?: string;
}

export interface IRole {
  id: string;
  name: string;
  description?: string;
}

// Get all departments
export const getDepartments = async (): Promise<IDepartment[]> => {
  const response = await api.get('/job-data/departments');
  return response.data.departments;
};

// Get subcategories by department
export const getSubcategories = async (departmentId: string): Promise<ISubcategory[]> => {
  const response = await api.get(`/job-data/subcategories/${departmentId}`);
  return response.data.subcategories;
};

// Get roles by subcategory
export const getRoles = async (subcategoryId: string): Promise<IRole[]> => {
  const response = await api.get(`/job-data/roles/${subcategoryId}`);
  return response.data.roles;
};

// React Query hooks
import { useQuery } from '@tanstack/react-query';

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!localStorage.getItem('token')
  });
};

export const useSubcategories = (departmentId: string) => {
  return useQuery({
    queryKey: ['subcategories', departmentId],
    queryFn: () => getSubcategories(departmentId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!departmentId && !!localStorage.getItem('token')
  });
};

export const useRoles = (subcategoryId: string) => {
  return useQuery({
    queryKey: ['roles', subcategoryId],
    queryFn: () => getRoles(subcategoryId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!subcategoryId && !!localStorage.getItem('token')
  });
};
