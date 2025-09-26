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
  const [shipCode, setShipCode] = useState('');
  const [lengthMeters, setLengthMeters] = useState('');
  const [widthMeters, setWidthMeters] = useState('');
  const [grossTonnage, setGrossTonnage] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [refurbishedYear, setRefurbishedYear] = useState('');
  const [homePort, setHomePort] = useState('');
  const [shipType, setShipType] = useState('');
  const [company, setCompany] = useState('');
  const [capacity, setCapacity] = useState('');
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
      shipCode?: string;
      lengthMeters?: number;
      widthMeters?: number;
      grossTonnage?: number;
      yearBuilt?: number;
      refurbishedYear?: number;
      homePort?: string;
      shipType?: string;
      company?: string;
      capacity?: number;
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
        cruiseLineId,
        shipCode: shipCode.trim() || undefined,
        lengthMeters: lengthMeters ? parseFloat(lengthMeters) : undefined,
        widthMeters: widthMeters ? parseFloat(widthMeters) : undefined,
        grossTonnage: grossTonnage ? parseInt(grossTonnage) : undefined,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
        refurbishedYear: refurbishedYear ? parseInt(refurbishedYear) : undefined,
        homePort: homePort.trim() || undefined,
        shipType: shipType.trim() || undefined,
        company: company.trim() || undefined,
        capacity: capacity ? parseInt(capacity) : undefined
      });
      setName('');
      setCruiseLineId('');
      setShipCode('');
      setLengthMeters('');
      setWidthMeters('');
      setGrossTonnage('');
      setYearBuilt('');
      setRefurbishedYear('');
      setHomePort('');
      setShipType('');
      setCompany('');
      setCapacity('');
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Ship</h2>
              <p className="text-sm text-gray-600">Complete ship information</p>
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

            <div>
              <label htmlFor="shipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Ship Code
              </label>
              <input
                type="text"
                id="shipCode"
                value={shipCode}
                onChange={(e) => setShipCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., OTS"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="lengthMeters" className="block text-sm font-medium text-gray-700 mb-1">
                  Length (meters)
                </label>
                <input
                  type="number"
                  id="lengthMeters"
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 362.0"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="widthMeters" className="block text-sm font-medium text-gray-700 mb-1">
                  Width (meters)
                </label>
                <input
                  type="number"
                  id="widthMeters"
                  value={widthMeters}
                  onChange={(e) => setWidthMeters(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 47.0"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="grossTonnage" className="block text-sm font-medium text-gray-700 mb-1">
                  Gross Tonnage
                </label>
                <input
                  type="number"
                  id="grossTonnage"
                  value={grossTonnage}
                  onChange={(e) => setGrossTonnage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 225282"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Passenger Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 6680"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built
                </label>
                <input
                  type="number"
                  id="yearBuilt"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2018"
                  min="1800"
                  max="2024"
                />
              </div>
              <div>
                <label htmlFor="refurbishedYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Refurbished Year
                </label>
                <input
                  type="number"
                  id="refurbishedYear"
                  value={refurbishedYear}
                  onChange={(e) => setRefurbishedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2022"
                  min="1800"
                  max="2024"
                />
              </div>
            </div>

            <div>
              <label htmlFor="homePort" className="block text-sm font-medium text-gray-700 mb-1">
                Home Port
              </label>
              <input
                type="text"
                id="homePort"
                value={homePort}
                onChange={(e) => setHomePort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Miami, Florida"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="shipType" className="block text-sm font-medium text-gray-700 mb-1">
                  Ship Type
                </label>
                <input
                  type="text"
                  id="shipType"
                  value={shipType}
                  onChange={(e) => setShipType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Oasis Class"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Royal Caribbean"
                />
              </div>
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
