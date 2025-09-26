import React, { useState } from 'react';
import { toast } from 'react-toastify';
// TODO: Implement Firebase data management functionality

interface AddShipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddShipModal: React.FC<AddShipModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [cruiseLineId, setCruiseLineId] = useState('');
  // TODO: Implement Firebase data management functionality
  const addShipMutation = {
    mutateAsync: async (shipData: { name: string; cruiseLineId: string }) => {
      // TODO: Implement Firebase add ship functionality
      console.log('Adding ship:', shipData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Ship added successfully!');
    },
    isLoading: false
  };
  const cruiseLinesData = {
    cruiseLines: [
      { id: '1', name: 'Carnival Cruise Line' },
      { id: '2', name: 'Royal Caribbean International' },
      { id: '3', name: 'Norwegian Cruise Line' }
    ]
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
            <h2 className="text-xl font-bold text-gray-900">Add Ship</h2>
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
              <select
                id="cruiseLine"
                value={cruiseLineId}
                onChange={(e) => setCruiseLineId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a cruise line</option>
                {cruiseLinesData?.cruiseLines?.map((cruiseLine: any) => (
                  <option key={cruiseLine.id} value={cruiseLine.id}>
                    {cruiseLine.name}
                  </option>
                ))}
              </select>
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
