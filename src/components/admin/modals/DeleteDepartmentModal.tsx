import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getDepartments, deleteDepartment, Department } from '../../../firebase/firestore';

import { DeleteDepartmentModalProps } from '../../../types';

export const DeleteDepartmentModal: React.FC<DeleteDepartmentModalProps> = ({ isOpen, onClose }) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const departmentsData = await getDepartments();
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDepartmentMutation = {
    mutateAsync: async (departmentId: string) => {
      setIsDeleting(true);
      try {
        await deleteDepartment(departmentId);
        console.log('Department deleted successfully:', departmentId);
        toast.success('Department deleted successfully!');
        // Refresh the departments list
        await fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department. Please try again.');
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    isLoading: isDeleting
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartmentId) {
      toast.error('Please select a department to delete.');
      return;
    }

    try {
      await deleteDepartmentMutation.mutateAsync(selectedDepartmentId);
      onClose();
      setSelectedDepartmentId('');
    } catch (error) {
      // Error handled by useDeleteDepartment's onError
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600">Delete Department</h2>
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
                Select Department to Delete:
              </label>
              {isLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
                  Loading departments...
                </div>
              ) : (
                <select
                  id="department"
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                  disabled={departments.length === 0}
                >
                  <option value="">
                    {departments.length === 0 ? 'No departments available' : 'Choose a department...'}
                  </option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete the department and ALL associated roles. Users assigned to this department will need to be reassigned.
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={deleteDepartmentMutation.isLoading}
              >
                {deleteDepartmentMutation.isLoading ? 'Deleting...' : 'Delete Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
