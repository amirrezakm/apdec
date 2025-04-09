import React from 'react';
import { Key, Upload, DownloadCloud, Users, Activity } from 'lucide-react';
import apiService from '../../services/apiService';

/**
 * Dashboard component showing summary data and quick actions
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Dashboard component
 */
const Dashboard = ({ 
  newUsers, 
  orders, 
  setActiveSection, 
  setMode, 
  loading, 
  setError 
}) => {
  // Export data
  const exportData = async (tableName) => {
    try {
      setError('');
      const blob = await apiService.exportData(tableName);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tableName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Users Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-800">New Users</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {newUsers.reduce((sum, item) => sum + item.new_users, 0)}
            </div>
            
            <p className="text-gray-600 text-sm">
              Total new users across all dates
            </p>
          </div>
          
          {/* Orders Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-800">Orders</h3>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="text-3xl font-bold text-green-600 mb-2">
              {orders.length}
            </div>
            
            <p className="text-gray-600 text-sm">
              Total orders in the system
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Quick Actions</h3>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setActiveSection('encrypt');
                  setMode('encrypt');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              >
                <Key className="mr-1 h-4 w-4" />
                Encrypt Phone Numbers
              </button>
              
              <button
                onClick={() => {
                  setActiveSection('upload-orders');
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
              >
                <Upload className="mr-1 h-4 w-4" />
                Upload Orders
              </button>
              
              <button
                onClick={() => exportData('orders')}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center"
              >
                <DownloadCloud className="mr-1 h-4 w-4" />
                Export Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
