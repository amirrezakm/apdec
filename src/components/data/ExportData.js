import React from 'react';
import { DownloadCloud, Users, Activity } from 'lucide-react';
import apiService from '../../services/apiService';

/**
 * ExportData component for exporting data as CSV
 * @param {Object} props - Component props
 * @returns {JSX.Element} - ExportData component
 */
const ExportData = ({ loading, setLoading, error, setError }) => {
  // Export data
  const exportData = async (tableName) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Export Data</h2>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Orders</h3>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-gray-600 mb-6">
            Export all orders data as a CSV file, including transaction details, user information, and market data.
          </p>
          <button
            onClick={() => exportData('orders')}
            disabled={loading}
            className={`w-full py-2 px-4 rounded font-medium flex items-center justify-center ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <DownloadCloud className="h-5 w-5 mr-2" />
            {loading ? 'Exporting...' : 'Export Orders Data'}
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800">New Users</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-gray-600 mb-6">
            Export new users data as a CSV file, including daily user acquisition metrics and trends.
          </p>
          <button
            onClick={() => exportData('calc_new_users')}
            disabled={loading}
            className={`w-full py-2 px-4 rounded font-medium flex items-center justify-center ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <DownloadCloud className="h-5 w-5 mr-2" />
            {loading ? 'Exporting...' : 'Export New Users Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
