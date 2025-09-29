import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getRolesByDepartment, deleteRole, Role, getDepartments, Department } from '../../../firebase/firestore';

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({ isOpen, onClose }) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // Fetch roles when department changes
  useEffect(() => {
    if (selectedDepartmentId) {
      fetchRoles(selectedDepartmentId);
    } else {
      setRoles([]);
    }
  }, [selectedDepartmentId]);

  const fetchDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const departmentsData = await getDepartments();
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const fetchRoles = async (departmentId: string) => {
    setIsLoadingRoles(true);
    try {
      const rolesData = await getRolesByDepartment(departmentId);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const deleteRoleMutation = {
    mutateAsync: async (roleId: string) => {
      setIsDeleting(true);
      try {
        await deleteRole(roleId);
        console.log('Role deleted successfully:', roleId);
        toast.success('Role deleted successfully!');
        // Refresh the roles list
        if (selectedDepartmentId) {
          await fetchRoles(selectedDepartmentId);
        }
      } catch (error) {
        console.error('Error deleting role:', error);
        toast.error('Failed to delete role. Please try again.');
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    isLoading: isDeleting
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setSelectedRoleId(''); // Reset role selection when department changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      toast.error('Please select a role to delete.');
      return;
    }

    try {
      await deleteRoleMutation.mutateAsync(selectedRoleId);
      onClose();
      setSelectedDepartmentId('');
      setSelectedRoleId('');
    } catch (error) {
      // Error handled by useDeleteRole's onError
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        {/* Loading overlay for initial department loading */}
        {isLoadingDepartments && departments.length === 0 && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 font-medium">Loading departments...</p>
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600">Delete Role</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Select Department:
              </label>
              <div className="relative">
                <select
                  id="department"
                  value={selectedDepartmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                  disabled={isLoadingDepartments}
                >
                  <option value="">
                    {isLoadingDepartments ? 'Loading departments...' : 'Choose a department...'}
                  </option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {isLoadingDepartments && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Select Role to Delete:
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                  disabled={!selectedDepartmentId || isLoadingRoles}
                >
                  <option value="">
                    {!selectedDepartmentId
                      ? 'Select a department first...'
                      : isLoadingRoles
                        ? 'Loading roles...'
                        : 'Choose a role...'
                    }
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}{role.subcategoryId ? ` (${role.subcategoryId})` : ''}
                    </option>
                  ))}
                </select>
                {isLoadingRoles && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete the role. Users assigned to this role will need to be reassigned.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={deleteRoleMutation.isLoading || !selectedRoleId}
              >
                {deleteRoleMutation.isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>
                  {deleteRoleMutation.isLoading ? 'Deleting...' : 'Delete Role'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
