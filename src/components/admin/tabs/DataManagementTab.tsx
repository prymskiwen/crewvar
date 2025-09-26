import React, { useState } from 'react';
import { AddDepartmentModal } from '../modals/AddDepartmentModal';
import { DeleteDepartmentModal } from '../modals/DeleteDepartmentModal';
import { AddCruiseLineModal } from '../modals/AddCruiseLineModal';
import { DeleteCruiseLineModal } from '../modals/DeleteCruiseLineModal';
import { AddShipModal } from '../modals/AddShipModal';
import { DeleteShipModal } from '../modals/DeleteShipModal';
import { AddRoleModal } from '../modals/AddRoleModal';
import { DeleteRoleModal } from '../modals/DeleteRoleModal';

export const DataManagementTab: React.FC = () => {
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showDeleteDepartment, setShowDeleteDepartment] = useState(false);
  const [showAddCruiseLine, setShowAddCruiseLine] = useState(false);
  const [showDeleteCruiseLine, setShowDeleteCruiseLine] = useState(false);
  const [showAddShip, setShowAddShip] = useState(false);
  const [showDeleteShip, setShowDeleteShip] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [showDeleteRole, setShowDeleteRole] = useState(false);

  return (
    <div className="space-y-6">
      {/* Data Management Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
            <p className="text-sm text-gray-500">Manage departments, cruise lines, ships, and roles</p>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Departments</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddDepartment(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowDeleteDepartment(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">Manage department categories for user roles</p>
        </div>

        {/* Cruise Lines Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Cruise Lines</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddCruiseLine(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowDeleteCruiseLine(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">Manage cruise line companies and their information</p>
        </div>

        {/* Ships Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Ships</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddShip(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowDeleteShip(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">Manage ship information and specifications</p>
        </div>

        {/* Roles Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Roles</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddRole(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowDeleteRole(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">Manage job roles and positions within departments</p>
        </div>
      </div>

      {/* Modals */}
      {showAddDepartment && (
        <AddDepartmentModal
          isOpen={showAddDepartment}
          onClose={() => setShowAddDepartment(false)}
        />
      )}

      {showDeleteDepartment && (
        <DeleteDepartmentModal
          isOpen={showDeleteDepartment}
          onClose={() => setShowDeleteDepartment(false)}
        />
      )}

      {showAddCruiseLine && (
        <AddCruiseLineModal
          isOpen={showAddCruiseLine}
          onClose={() => setShowAddCruiseLine(false)}
        />
      )}

      {showDeleteCruiseLine && (
        <DeleteCruiseLineModal
          isOpen={showDeleteCruiseLine}
          onClose={() => setShowDeleteCruiseLine(false)}
        />
      )}

      {showAddShip && (
        <AddShipModal
          isOpen={showAddShip}
          onClose={() => setShowAddShip(false)}
        />
      )}

      {showDeleteShip && (
        <DeleteShipModal
          isOpen={showDeleteShip}
          onClose={() => setShowDeleteShip(false)}
        />
      )}

      {showAddRole && (
        <AddRoleModal
          isOpen={showAddRole}
          onClose={() => setShowAddRole(false)}
        />
      )}

      {showDeleteRole && (
        <DeleteRoleModal
          isOpen={showDeleteRole}
          onClose={() => setShowDeleteRole(false)}
        />
      )}
    </div>
  );
};

