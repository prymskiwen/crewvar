import React, { useState } from 'react';
import { useDeleteShip, useCruiseLines, useShipsByCruiseLine } from '../api/dataManagementApi';
import { toast } from 'react-toastify';

interface DeleteShipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteShipModal: React.FC<DeleteShipModalProps> = ({ isOpen, onClose }) => {
  const [selectedCruiseLineId, setSelectedCruiseLineId] = useState('');
  const [selectedShipId, setSelectedShipId] = useState('');
  const deleteShipMutation = useDeleteShip();
  const { data: cruiseLinesData } = useCruiseLines();
  const { data: shipsData } = useShipsByCruiseLine(selectedCruiseLineId || null);

  const handleCruiseLineChange = (cruiseLineId: string) => {
    setSelectedCruiseLineId(cruiseLineId);
    setSelectedShipId(''); // Reset ship selection when cruise line changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipId) {
      toast.error('Please select a ship to delete.');
      return;
    }

    try {
      await deleteShipMutation.mutateAsync(selectedShipId);
      onClose();
      setSelectedCruiseLineId('');
      setSelectedShipId('');
    } catch (error) {
      // Error handled by useDeleteShip's onError
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600">Delete Ship</h2>
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
                Select Cruise Line:
              </label>
              <select
                id="cruiseLine"
                value={selectedCruiseLineId}
                onChange={(e) => handleCruiseLineChange(e.target.value)}
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

            <div>
              <label htmlFor="ship" className="block text-sm font-medium text-gray-700 mb-1">
                Select Ship to Delete:
              </label>
              <select
                id="ship"
                value={selectedShipId}
                onChange={(e) => setSelectedShipId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                disabled={!selectedCruiseLineId}
              >
                <option value="">Choose a ship...</option>
                {shipsData?.ships?.map((ship: any) => (
                  <option key={ship.id} value={ship.id}>
                    {ship.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete the ship. Users assigned to this ship will need to be reassigned.
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
                disabled={deleteShipMutation.isLoading}
              >
                {deleteShipMutation.isLoading ? 'Deleting...' : 'Delete Ship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
