import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import apiService from '../../services/apiService';

/**
 * UploadOrders component for uploading orders CSV files
 * @param {Object} props - Component props
 * @returns {JSX.Element} - UploadOrders component
 */
const UploadOrders = ({ 
  loading, 
  setLoading, 
  error, 
  setError, 
  fetchNewUsers, 
  fetchOrders 
}) => {
  const [ordersFile, setOrdersFile] = useState(null);

  // Handle file selection
  const handleOrdersFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setOrdersFile(selectedFile);
      setError(''); // Clear any previous errors
    }
  };

  // Submit orders CSV file to API
  const submitOrders = async () => {
    if (!ordersFile) {
      setError('Please select a CSV file to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const result = await apiService.uploadOrdersCSV(ordersFile);
      
      // Reset file input
      setOrdersFile(null);
      const fileInput = document.getElementById('orders-file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Refresh data
      await fetchNewUsers();
      await fetchOrders();
      
      // Alert with the message from the API
      alert(result.message || 'Orders uploaded successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Orders</h2>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Orders CSV File</label>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleOrdersFileChange}
              className="hidden"
              id="orders-file-upload"
            />
            <label
              htmlFor="orders-file-upload"
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-2 sm:mb-0 inline-block"
            >
              <Upload className="inline-block mr-1 h-4 w-4" />
              Select CSV File
            </label>
            <span className="ml-0 sm:ml-3 text-gray-600">
              {ordersFile ? ordersFile.name : 'No file selected'}
            </span>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">CSV Format Information</h3>
          <p className="text-blue-700 mb-2">
            The CSV file must have the following columns:
          </p>
          <ul className="list-disc list-inside text-blue-700 text-sm">
            <li>ID</li>
            <li>Date</li>
            <li>User ID</li>
            <li>Market</li>
            <li>Order Side (buy/sell)</li>
            <li>Executed Price</li>
            <li>Coin Amount</li>
            <li>IRR Amount</li>
            <li>Coin Commission</li>
            <li>IRR Commission</li>
            <li>Status</li>
            <li>Source</li>
            <li>Description</li>
          </ul>
          <p className="text-blue-700 mt-2 text-sm">
            The "Provider" column will be ignored if present.
          </p>
        </div>
        
        <button
          onClick={submitOrders}
          disabled={loading || !ordersFile}
          className={`py-2 px-4 rounded font-medium ${
            loading || !ordersFile
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </div>
    </div>
  );
};

export default UploadOrders;
