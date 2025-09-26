import { useState, useEffect } from 'react';
import { getDepartments, getRolesByDepartment, Department, Role } from '../firebase/firestore';

export const useDepartments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                setError(null);
                const departmentsData = await getDepartments();
                setDepartments(departmentsData);
            } catch (err) {
                console.error('Error fetching departments:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch departments'));
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    return { departments, loading, error };
};

export const useRolesByDepartment = (departmentId: string) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!departmentId) {
            setRoles([]);
            return;
        }

        const fetchRoles = async () => {
            try {
                setLoading(true);
                setError(null);
                const rolesData = await getRolesByDepartment(departmentId);
                setRoles(rolesData);
            } catch (err) {
                console.error('Error fetching roles:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch roles'));
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, [departmentId]);

    return { roles, loading, error };
};
