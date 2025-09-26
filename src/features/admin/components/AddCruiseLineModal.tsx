import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { addCruiseLine } from '../../../firebase/firestore';

interface AddCruiseLineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCruiseLineModal: React.FC<AddCruiseLineModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [fleetSize, setFleetSize] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addCruiseLineMutation = {
    mutateAsync: async (cruiseLineData: {
      name: string;
      companyCode?: string;
      headquarters?: string;
      foundedYear?: number;
      fleetSize?: number;
      website?: string;
      logoUrl?: string;
    }) => {
      setIsLoading(true);
      try {
        const cruiseLineId = await addCruiseLine(cruiseLineData);
        console.log('Cruise line added successfully with ID:', cruiseLineId);
        toast.success('Cruise line added successfully!');
      } catch (error) {
        console.error('Error adding cruise line:', error);
        toast.error('Failed to add cruise line. Please try again.');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    isLoading
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addCruiseLineMutation.mutateAsync({
        name: name.trim(),
        companyCode: companyCode.trim() || undefined,
        headquarters: headquarters.trim() || undefined,
        foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
        fleetSize: fleetSize ? parseInt(fleetSize) : undefined,
        website: website.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined
      });
      setName('');
      setCompanyCode('');
      setHeadquarters('');
      setFoundedYear('');
      setFleetSize('');
      setWebsite('');
      setLogoUrl('');
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
              <h2 className="text-xl font-bold text-gray-900">Add Cruise Line</h2>
              <p className="text-sm text-gray-600">Complete cruise line information</p>
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
                Cruise Line Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Royal Caribbean"
                required
              />
            </div>

            <div>
              <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700 mb-1">
                Company Code
              </label>
              <input
                type="text"
                id="companyCode"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., RCL"
              />
            </div>

            <div>
              <label htmlFor="headquarters" className="block text-sm font-medium text-gray-700 mb-1">
                Headquarters
              </label>
              <input
                type="text"
                id="headquarters"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Miami, Florida"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Founded Year
                </label>
                <input
                  type="number"
                  id="foundedYear"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1968"
                  min="1800"
                  max="2024"
                />
              </div>
              <div>
                <label htmlFor="fleetSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Fleet Size
                </label>
                <input
                  type="number"
                  id="fleetSize"
                  value={fleetSize}
                  onChange={(e) => setFleetSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 25"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., https://www.royalcaribbean.com"
              />
            </div>

            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., https://example.com/logo.png"
              />
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
                disabled={addCruiseLineMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {addCruiseLineMutation.isLoading ? 'Adding...' : 'Add Cruise Line'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
