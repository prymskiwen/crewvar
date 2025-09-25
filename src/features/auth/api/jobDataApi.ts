import { api } from '../../../app/api';

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  department_id?: string;
}

// Get all departments
export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get('/job-data/departments');
  return response.data.departments;
};

// Get roles by department
export const getRolesByDepartment = async (departmentId: string): Promise<Role[]> => {
  const response = await api.get(`/job-data/roles/${departmentId}`);
  return response.data.roles;
};

// Get all roles
export const getAllRoles = async (): Promise<Role[]> => {
  const response = await api.get('/job-data/roles');
  return response.data.roles;
};
