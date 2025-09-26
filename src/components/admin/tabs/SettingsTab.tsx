import React from 'react';

export const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
            <p className="text-sm text-gray-500">Configure system parameters and preferences</p>
          </div>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">General Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Site Name</label>
                <p className="text-xs text-gray-500">The name displayed on the site</p>
              </div>
              <input
                type="text"
                value="Crewvar"
                className="w-32 px-3 py-1 border border-gray-300 rounded-md text-sm"
                readOnly
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                <p className="text-xs text-gray-500">Enable maintenance mode</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">User Registration</label>
                <p className="text-xs text-gray-500">Allow new user registrations</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Require 2FA for admin users</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Session Timeout</label>
                <p className="text-xs text-gray-500">Auto-logout after inactivity</p>
              </div>
              <select className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm">
                <option>30 min</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Password Policy</label>
                <p className="text-xs text-gray-500">Minimum password requirements</p>
              </div>
              <select className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm">
                <option>8 characters</option>
                <option>12 characters</option>
                <option>16 characters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Send email alerts for admin actions</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-xs text-gray-500">Browser push notifications</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Report Alerts</label>
                <p className="text-xs text-gray-500">Immediate alerts for new reports</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Data Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Data Retention</label>
                <p className="text-xs text-gray-500">How long to keep user data</p>
              </div>
              <select className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm">
                <option>1 year</option>
                <option>2 years</option>
                <option>5 years</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Backup</label>
                <p className="text-xs text-gray-500">Automatic database backups</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Export Format</label>
                <p className="text-xs text-gray-500">Default export file format</p>
              </div>
              <select className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm">
                <option>CSV</option>
                <option>JSON</option>
                <option>Excel</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900">System Actions</h4>
            <p className="text-sm text-gray-500">Perform system maintenance and updates</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Save Settings
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Reset to Defaults
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

