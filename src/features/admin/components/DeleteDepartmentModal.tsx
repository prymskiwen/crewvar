import React, { useState } from 'react';
// TODO: Implement Firebase data management functionality
import { toast } from 'react-toastify';

interface DeleteDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteDepartmentModal: React.FC<DeleteDepartmentModalProps> = ({ isOpen, onClose }) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  // TODO: Implement Firebase data management functionality
  const deleteDepartmentMutation = {
    mutateAsync: async (departmentId: string) => {
      // TODO: Implement Firebase delete department functionality
      console.log('Deleting department:', departmentId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Department deleted successfully!');
    },
    isLoading: false
  };
  const departmentsData = {
    departments: [
      { id: '1', name: 'Entertainment' },
      { id: '2', name: 'Food & Beverage' },
      { id: '3', name: 'Housekeeping' }
    ]
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
              <select
                id="department"
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Choose a department...</option>
                {departmentsData?.departments?.map((department: any) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
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
