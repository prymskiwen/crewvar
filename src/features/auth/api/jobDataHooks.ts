import { useQuery } from '@tanstack/react-query';
import { 
  getDepartments, 
  getRolesByDepartment, 
  getAllRoles,
  Department,
  Role
} from './jobDataApi';

// Hook for fetching all departments
export const useDepartments = () => {
  return useQuery<Department[], Error>({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching roles by department
export const useRolesByDepartment = (departmentId: string) => {
  return useQuery<Role[], Error>({
    queryKey: ['roles', departmentId],
    queryFn: () => getRolesByDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching all roles
export const useAllRoles = () => {
  return useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: getAllRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
