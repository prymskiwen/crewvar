import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCruiseLines, deleteCruiseLine, CruiseLine } from '../../../firebase/firestore';

interface DeleteCruiseLineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteCruiseLineModal: React.FC<DeleteCruiseLineModalProps> = ({ isOpen, onClose }) => {
  const [selectedCruiseLineId, setSelectedCruiseLineId] = useState('');
  const [cruiseLines, setCruiseLines] = useState<CruiseLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch cruise lines when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCruiseLines();
    }
  }, [isOpen]);

  const fetchCruiseLines = async () => {
    setIsLoading(true);
    try {
      const cruiseLinesData = await getCruiseLines();
      setCruiseLines(cruiseLinesData);
    } catch (error) {
      console.error('Error fetching cruise lines:', error);
      toast.error('Failed to load cruise lines');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCruiseLineMutation = {
    mutateAsync: async (cruiseLineId: string) => {
      setIsDeleting(true);
      try {
        await deleteCruiseLine(cruiseLineId);
        console.log('Cruise line deleted successfully:', cruiseLineId);
        toast.success('Cruise line deleted successfully!');
        // Refresh the cruise lines list
        await fetchCruiseLines();
      } catch (error) {
        console.error('Error deleting cruise line:', error);
        toast.error('Failed to delete cruise line. Please try again.');
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    isLoading: isDeleting
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCruiseLineId) {
      toast.error('Please select a cruise line to delete.');
      return;
    }

    try {
      await deleteCruiseLineMutation.mutateAsync(selectedCruiseLineId);
      onClose();
      setSelectedCruiseLineId('');
    } catch (error) {
      // Error handled by useDeleteCruiseLine's onError
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600">Delete Cruise Line</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cruiseLine" className="block text-sm font-medium text-gray-700 mb-1">
                Select Cruise Line to Delete:
              </label>
              <select
                id="cruiseLine"
                value={selectedCruiseLineId}
                onChange={(e) => setSelectedCruiseLineId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Choose a cruise line...</option>
                {cruiseLinesData?.cruiseLines?.map((cruiseLine: any) => (
                  <option key={cruiseLine.id} value={cruiseLine.id}>
                    {cruiseLine.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete the cruise line and ALL associated ships.
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
                disabled={deleteCruiseLineMutation.isLoading}
              >
                {deleteCruiseLineMutation.isLoading ? 'Deleting...' : 'Delete Cruise Line'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
