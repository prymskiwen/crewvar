import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../app/api';

interface AdminStats {
  users: {
    total: number;
    active: number;
    banned: number;
    unverified: number;
  };
  messages: {
    total: number;
    today: number;
  };
  connections: {
    total: number;
    pending: number;
  };
}

export const AdminTestPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAdminAPIs = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Test 1: Get system stats
      console.log('Testing admin stats API...');
      const { data: statsData } = await api.get('/admin/stats');
      setStats(statsData.stats);
      console.log('✅ Stats API working:', statsData);

      // Test 2: Get users list
      console.log('Testing admin users API...');
      const { data: usersData } = await api.get('/admin/users', { params: { limit: 10 } });
      setUsers(usersData.users);
      console.log('✅ Users API working:', usersData);

    } catch (err: any) {
      console.error('Admin API test failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = () => {
    if (!currentUser) {
      return <div className="text-red-600">❌ Not logged in</div>;
    }

    // Check if user is admin
    const isAdmin = currentUser.email === 'admin@crewvar.com';
    
    if (!isAdmin) {
      return <div className="text-red-600">❌ Not an admin user</div>;
    }

    return <div className="text-green-600">✅ Admin user detected</div>;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel Test</h1>
        
        {/* Admin Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Admin Status</h2>
          {checkAdminStatus()}
          <div className="mt-2 text-sm text-gray-600">
            Current user: {currentUser?.email || 'Not logged in'}
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Admin APIs</h2>
          <button
            onClick={testAdminAPIs}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Admin APIs'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Stats Display */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.users.total}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.users.active}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.users.banned}</div>
                <div className="text-sm text-gray-600">Banned Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.messages.total}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        {users.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Users List (Sample)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.display_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_banned ? 'bg-red-100 text-red-800' : 
                          user.is_active ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_banned ? 'Banned' : user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Make sure you're logged in as admin@crewvar.com</li>
            <li>Complete the signup process to set your password</li>
            <li>Click "Test Admin APIs" button above</li>
            <li>Check the console for detailed API responses</li>
            <li>Verify that stats and users data are displayed</li>
          </ol>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Go to Admin Dashboard
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};