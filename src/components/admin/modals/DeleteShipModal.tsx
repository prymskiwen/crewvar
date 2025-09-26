import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getShips, deleteShip, getCruiseLines, Ship, CruiseLine } from '../../../firebase/firestore';

interface DeleteShipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteShipModal: React.FC<DeleteShipModalProps> = ({ isOpen, onClose }) => {
  const [selectedCruiseLineId, setSelectedCruiseLineId] = useState('');
  const [selectedShipId, setSelectedShipId] = useState('');
  const [cruiseLines, setCruiseLines] = useState<CruiseLine[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch cruise lines when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCruiseLines();
    }
  }, [isOpen]);

  // Fetch ships when cruise line changes
  useEffect(() => {
    if (selectedCruiseLineId) {
      fetchShips(selectedCruiseLineId);
    } else {
      setShips([]);
    }
  }, [selectedCruiseLineId]);

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

  const fetchShips = async (cruiseLineId: string) => {
    try {
      const shipsData = await getShips();
      // Filter ships by cruise line
      const filteredShips = shipsData.filter(ship => ship.cruiseLineId === cruiseLineId);
      setShips(filteredShips);
    } catch (error) {
      console.error('Error fetching ships:', error);
      toast.error('Failed to load ships');
    }
  };

  const handleCruiseLineChange = (cruiseLineId: string) => {
    setSelectedCruiseLineId(cruiseLineId);
    setSelectedShipId(''); // Reset ship selection when cruise line changes
  };

  const deleteShipMutation = {
    mutateAsync: async (shipId: string) => {
      setIsDeleting(true);
      try {
        await deleteShip(shipId);
        console.log('Ship deleted successfully:', shipId);
        toast.success('Ship deleted successfully!');
        // Refresh the ships list
        if (selectedCruiseLineId) {
          await fetchShips(selectedCruiseLineId);
        }
      } catch (error) {
        console.error('Error deleting ship:', error);
        toast.error('Failed to delete ship. Please try again.');
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
      toast.error('Please select a cruise line.');
      return;
    }
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
              {isLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
                  Loading cruise lines...
                </div>
              ) : (
                <select
                  id="cruiseLine"
                  value={selectedCruiseLineId}
                  onChange={(e) => handleCruiseLineChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                  disabled={cruiseLines.length === 0}
                >
                  <option value="">
                    {cruiseLines.length === 0 ? 'No cruise lines available' : 'Choose a cruise line...'}
                  </option>
                  {cruiseLines.map((cruiseLine) => (
                    <option key={cruiseLine.id} value={cruiseLine.id}>
                      {cruiseLine.name}
                    </option>
                  ))}
                </select>
              )}
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
                disabled={!selectedCruiseLineId || ships.length === 0}
              >
                <option value="">
                  {!selectedCruiseLineId ? 'Select a cruise line first' :
                    ships.length === 0 ? 'No ships available' : 'Choose a ship...'}
                </option>
                {ships.map((ship) => (
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
