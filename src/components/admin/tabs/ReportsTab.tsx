import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';

interface MissingReport {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  status: string;
  createdAt: any;
}

export const ReportsTab: React.FC = () => {
  const [missingReports, setMissingReports] = useState<MissingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissingReports = async () => {
      try {
        const reportsQuery = query(
          collection(db, 'reports'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(reportsQuery);
        const reports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MissingReport[];
        
        // Filter for missing item reports
        const missingItemReports = reports.filter(report => report.type === 'missing_item');
        setMissingReports(missingItemReports);
      } catch (error) {
        console.error('Error fetching missing reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissingReports();
  }, []);

  const pendingCount = missingReports.filter(report => report.status === 'pending').length;
  const resolvedCount = missingReports.filter(report => report.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Missing Item Reports</h3>
            <p className="text-sm text-gray-500">Review and manage missing ship/role reports</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Pending: {pendingCount}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Resolved: {resolvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Missing Item Reports</h3>
        </div>
        
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#069B93] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading reports...</p>
          </div>
        ) : missingReports.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No missing item reports</h3>
            <p className="mt-1 text-sm text-gray-500">No missing item reports have been submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {missingReports.map((report) => (
              <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.category === 'ship' ? 'bg-blue-100 text-blue-800' :
                        report.category === 'role' ? 'bg-green-100 text-green-800' :
                        report.category === 'department' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-medium text-gray-900">{report.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Submitted: {report.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Missing Ships</p>
              <p className="text-2xl font-bold text-gray-900">
                {missingReports.filter(r => r.category === 'ship').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Missing Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {missingReports.filter(r => r.category === 'role').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Missing Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {missingReports.filter(r => r.category === 'department').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Missing Cruise Lines</p>
              <p className="text-2xl font-bold text-gray-900">
                {missingReports.filter(r => r.category === 'cruise_line').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

