import React from 'react';
import { OverviewTabProps } from '../../../types';

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  supportStats,
  supportStatsLoading
}) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                <div className="flex space-x-2 mt-1">
                  <span className="text-xs text-green-600">Active: {stats.users.active}</span>
                  <span className="text-xs text-red-600">Banned: {stats.users.banned}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.messages.total}</p>
                <p className="text-xs text-gray-500">Today: {stats.messages.today}</p>
              </div>
            </div>
          </div>

          {/* Connections Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Connections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.connections.total}</p>
                <p className="text-xs text-gray-500">Pending: {stats.connections.pending}</p>
              </div>
            </div>
          </div>

          {/* Reports Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reports.total}</p>
                <p className="text-xs text-red-600">Pending: {stats.reports.pending}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Stats */}
      {supportStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Support Statistics</h3>
          {supportStatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{supportStats.openTickets}</p>
                <p className="text-sm text-gray-500">Open</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{supportStats.inProgressTickets}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{supportStats.resolvedTickets}</p>
                <p className="text-sm text-gray-500">Resolved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{supportStats.closedTickets}</p>
                <p className="text-sm text-gray-500">Closed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{supportStats.totalTickets}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{supportStats.resolvedToday}</p>
                <p className="text-sm text-gray-500">Resolved Today</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

