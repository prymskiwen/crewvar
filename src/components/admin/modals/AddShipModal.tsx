import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { addShip, getCruiseLines, CruiseLine } from '../../../firebase/firestore';

interface AddShipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddShipModal: React.FC<AddShipModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [cruiseLineId, setCruiseLineId] = useState('');
  const [cruiseLines, setCruiseLines] = useState<CruiseLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCruiseLines, setIsLoadingCruiseLines] = useState(false);

  // Fetch cruise lines when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCruiseLines();
    }
  }, [isOpen]);

  const fetchCruiseLines = async () => {
    setIsLoadingCruiseLines(true);
    try {
      const cruiseLinesData = await getCruiseLines();
      setCruiseLines(cruiseLinesData);
    } catch (error) {
      console.error('Error fetching cruise lines:', error);
      toast.error('Failed to load cruise lines');
    } finally {
      setIsLoadingCruiseLines(false);
    }
  };

  const addShipMutation = {
    mutateAsync: async (shipData: {
      name: string;
      cruiseLineId: string;
    }) => {
      setIsLoading(true);
      try {
        const shipId = await addShip(shipData);
        console.log('Ship added successfully with ID:', shipId);
        toast.success('Ship added successfully!');
      } catch (error) {
        console.error('Error adding ship:', error);
        toast.error('Failed to add ship. Please try again.');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    isLoading
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cruiseLineId) return;

    try {
      await addShipMutation.mutateAsync({
        name: name.trim(),
        cruiseLineId
      });
      setName('');
      setCruiseLineId('');
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Ship</h2>
              <p className="text-sm text-gray-600">Add a new ship to the system</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ship Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Harmony of the Seas"
                required
              />
            </div>

            <div>
              <label htmlFor="cruiseLine" className="block text-sm font-medium text-gray-700 mb-1">
                Cruise Line *
              </label>
              {isLoadingCruiseLines ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                  Loading cruise lines...
                </div>
              ) : (
                <select
                  id="cruiseLine"
                  value={cruiseLineId}
                  onChange={(e) => setCruiseLineId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={cruiseLines.length === 0}
                >
                  <option value="">
                    {cruiseLines.length === 0 ? 'No cruise lines available' : 'Select a cruise line'}
                  </option>
                  {cruiseLines.map((cruiseLine) => (
                    <option key={cruiseLine.id} value={cruiseLine.id}>
                      {cruiseLine.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addShipMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {addShipMutation.isLoading ? 'Adding...' : 'Add Ship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
