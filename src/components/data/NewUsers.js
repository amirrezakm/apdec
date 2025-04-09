import React from 'react';
import { DownloadCloud } from 'lucide-react';
import apiService from '../../services/apiService';

/**
 * NewUsers component for displaying new users data
 * @param {Object} props - Component props
 * @returns {JSX.Element} - NewUsers component
 */
const NewUsers = ({ 
  newUsers, 
  loading, 
  error, 
  setError, 
  pagination, 
  setPagination, 
  fetchNewUsers 
}) => {
  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
    fetchNewUsers(newPage, pagination.size);
  };
  
  // Export data
  const exportData = async () => {
    try {
      setError('');
      const blob = await apiService.exportData('calc_new_users');
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'new_users.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">New Users per Day</h2>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
            <h3 className="font-semibold text-lg text-gray-800">New Users Data</h3>
            <button 
              onClick={fetchNewUsers}
              className="text-blue-500 hover:text-blue-700 flex items-center"
              aria-label="Refresh data"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {newUsers.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Users
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {newUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.transaction_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.new_users}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">No new users data available</p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1 || loading}
                  className={`px-3 py-1 rounded ${pagination.page === 1 || loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={newUsers.length < pagination.size || loading}
                  className={`px-3 py-1 rounded ${newUsers.length < pagination.size || loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
              
              <button 
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Export all new users data"
              >
                <DownloadCloud className="h-4 w-4 mr-2" />
                Export All New Users Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewUsers;
