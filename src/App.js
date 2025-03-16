import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  Camera, Lock, Database, DownloadCloud, Upload, Users, Activity, Menu, 
  X, Home, Key, FileText, LogOut, ChevronRight, ChevronDown
} from 'lucide-react';

// AES encryption functions 
const aesEncrypt = async (plaintext, keyString, ivString) => {
  try {
    // Convert strings to byte arrays
    const textEncoder = new TextEncoder();
    const keyBytes = textEncoder.encode(keyString);
    const ivBytes = textEncoder.encode(ivString);
    const plaintextBytes = textEncoder.encode(plaintext);
    
    // Generate a key from the provided key bytes
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes.slice(0, 16), // AES-128 requires 16 bytes key
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );
    
    // Encrypt the data
    const encryptedBytes = await window.crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: ivBytes.slice(0, 16) // AES requires 16 bytes IV
      },
      cryptoKey,
      plaintextBytes
    );
    
    // Convert to Base64
    const encryptedBase64 = btoa(
      String.fromCharCode.apply(null, new Uint8Array(encryptedBytes))
    );
    
    return encryptedBase64;
  } catch (e) {
    throw new Error(`Encryption failed: ${e.message}`);
  }
};

const aesDecrypt = async (encryptedBase64, keyString, ivString) => {
  try {
    // Convert strings to byte arrays
    const textEncoder = new TextEncoder();
    const keyBytes = textEncoder.encode(keyString);
    const ivBytes = textEncoder.encode(ivString);
    
    // Convert Base64 to byte array
    const encryptedString = atob(encryptedBase64);
    const encryptedBytes = new Uint8Array(encryptedString.length);
    for (let i = 0; i < encryptedString.length; i++) {
      encryptedBytes[i] = encryptedString.charCodeAt(i);
    }
    
    // Generate a key from the provided key bytes
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes.slice(0, 16), // AES-128 requires 16 bytes key
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedBytes = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: ivBytes.slice(0, 16) // AES requires 16 bytes IV
      },
      cryptoKey,
      encryptedBytes
    );
    
    // Convert the decrypted bytes to a string
    const decryptedText = new TextDecoder().decode(decryptedBytes);
    
    return decryptedText;
  } catch (e) {
    throw new Error(`Decryption failed: ${e.message}`);
  }
};

// Validate Iranian phone numbers
const validatePhone = (phone) => {
  const phoneRegex = /^09([0-9]){9}$/;
  return phoneRegex.test(phone);
};

// API service functions
const apiService = {
  baseUrl: 'https://aghayasserback.liara.run:8000', // Replace with your actual API base URL
  token: null,
  
  // Get JWT token
  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Authentication failed');
    }
    
    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('api_token', data.access_token);
    return data;
  },
  
  // Check if token exists in localStorage
  checkToken() {
    const token = localStorage.getItem('api_token');
    if (token) {
      this.token = token;
      return true;
    }
    return false;
  },
  
  // Logout - remove token
  logout() {
    localStorage.removeItem('api_token');
    this.token = null;
  },
  
  // Upload orders CSV file directly
  async uploadOrdersCSV(file) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/upload_orders_csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload orders CSV');
    }
    
    return await response.json();
  },
  
  // Get new users per day
  async getNewUsers(page = 1, size = 20) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseUrl}/new_users?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch new users data');
    }
    
    return await response.json();
  },
  
  // Get orders
  async getOrders(page = 1, size = 20) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseUrl}/orders?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    return await response.json();
  },
  
  // Export data as CSV
  async exportData(tableName) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${this.baseUrl}/export/${tableName}.csv`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to export ${tableName} data`);
    }
    
    return await response.blob();
  }
};

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiUsername, setApiUsername] = useState('admin');
  const [apiPassword, setApiPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState(['encryption']);
  
  // Application data state
  const [mode, setMode] = useState('encrypt');
  const [key, setKey] = useState("-VWdb-9Ha^NSGbb4");
  const [iv, setIV] = useState("?L$%!G-ADpj>ykP8");
  const [columnName, setColumnName] = useState('phone');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // API data state
  const [newUsers, setNewUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20
  });
  const [ordersFile, setOrdersFile] = useState(null);

  // Check for existing token on component mount
  useEffect(() => {
    const hasToken = apiService.checkToken();
    if (hasToken) {
      setIsAuthenticated(true);
      fetchInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch initial data when authenticated
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchNewUsers(),
        fetchOrders()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle sidebar menu expansion
  const toggleMenu = (menu) => {
    if (expandedMenus.includes(menu)) {
      setExpandedMenus(expandedMenus.filter(m => m !== menu));
    } else {
      setExpandedMenus([...expandedMenus, menu]);
    }
  };

  // Handle file change for encryption/decryption
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      previewFile(selectedFile);
    }
  };
  
  // Handle orders file selection
  const handleOrdersFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setOrdersFile(selectedFile);
      setError(''); // Clear any previous errors
    }
  };

  // Preview file for encryption/decryption
  const previewFile = (file) => {
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (result) => {
        setPreview(result);
        
        // Check if the selected column exists
        if (result.meta.fields && !result.meta.fields.includes(columnName)) {
          setError(`Warning: Column "${columnName}" not found in the file. Available columns: ${result.meta.fields.join(', ')}`);
        } else {
          setError('');
        }
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
        setPreview(null);
      }
    });
  };

  // Handle API login
  const handleApiLogin = async (e) => {
    e.preventDefault();
    
    if (!apiUsername || !apiPassword) {
      setError('Please enter username and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await apiService.login(apiUsername, apiPassword);
      setIsAuthenticated(true);
      fetchInitialData();
    } catch (err) {
      setError(err.message || 'Failed to authenticate with API');
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setSidebarOpen(false);
    setActiveSection('dashboard');
  };
  
  // Fetch new users data from API
  const fetchNewUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNewUsers(pagination.page, pagination.size);
      setNewUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders data from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrders(pagination.page, pagination.size);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setPagination({
      ...pagination,
      page: newPage
    });
    
    // Fetch data with new pagination
    if (activeSection === 'new-users') {
      fetchNewUsers();
    } else if (activeSection === 'orders') {
      fetchOrders();
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
      const result = await apiService.uploadOrdersCSV(ordersFile);
      
      // Show success message
      setError('');
      setOrdersFile(null);
      
      // Reset file input
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
  
  // Export data
  const exportData = async (tableName) => {
    try {
      setLoading(true);
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

  // Process file for encryption/decryption
  const processFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError('');
    setResults(null);

    Papa.parse(file, {
      header: true,
      complete: async (result) => {
        // Check if column exists
        if (!result.meta.fields.includes(columnName)) {
          setError(`Column "${columnName}" not found. Available columns: ${result.meta.fields.join(', ')}`);
          setProcessing(false);
          return;
        }

        try {
          const processedData = [];
          let successCount = 0;
          let errorCount = 0;
          
          // Process each row sequentially to handle the async encryption/decryption
          for (let i = 0; i < result.data.length; i++) {
            const row = result.data[i];
            const newRow = { ...row };
            const value = row[columnName];
            
            try {
              if (mode === 'encrypt') {
                // Validate phone number for encryption
                if (!validatePhone(value)) {
                  throw new Error(`Invalid phone number format`);
                }
                
                // Encrypt the phone number
                newRow[`${columnName}_encrypted`] = await aesEncrypt(value, key, iv);
                newRow.status = 'success';
                successCount++;
              } else {
                // Decrypt the encrypted value
                newRow[`${columnName}_decrypted`] = await aesDecrypt(value, key, iv);
                newRow.status = 'success';
                successCount++;
              }
            } catch (err) {
              newRow.status = 'error';
              newRow.error = err.message;
              errorCount++;
            }
            
            processedData.push(newRow);
          }
          
          // Update the results state with the processed data
          setResults({
            data: processedData,
            stats: {
              total: processedData.length,
              success: successCount,
              error: errorCount,
              successRate: processedData.length ? (successCount / processedData.length * 100).toFixed(2) : 0
            }
          });
          
        } catch (err) {
          setError(`Error processing file: ${err.message}`);
        } finally {
          setProcessing(false);
        }
      },
      error: (err) => {
        setError(`Error processing file: ${err.message}`);
        setProcessing(false);
      }
    });
  };

  // Download encryption/decryption results
  const downloadResults = () => {
    if (!results) return;
    
    const csv = Papa.unparse(results.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${mode === 'encrypt' ? 'encrypted' : 'decrypted'}_${fileName}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset form
  const resetForm = () => {
    setFile(null);
    setFileName('');
    setResults(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Login screen - only shown if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <Lock className="h-12 w-12 text-blue-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 text-center">Authentication</h1>
            <p className="text-gray-600 text-center mt-2">
              Enter your credentials to access the application.
            </p>
          </div>
          
          <form onSubmit={handleApiLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={apiUsername}
                onChange={(e) => setApiUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={apiPassword}
                onChange={(e) => setApiPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                required
              />
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-medium rounded focus:outline-none focus:ring-2 ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main application (only shown after authentication)
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button 
              className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="ml-4 text-xl font-bold text-gray-800">Agha Yasser</h1>
          </div>
          
          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-600">Logged in as {apiUsername}</span>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-red-600 hover:text-red-800"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`bg-white shadow-md fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile close button */}
          <div className="lg:hidden absolute right-0 top-0 p-2">
            <button 
              className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="p-4 h-full overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center mb-6 mt-4 lg:mt-0">
                <Camera className="h-6 w-6 text-blue-500 mr-3" />
                <span className="text-lg font-bold text-gray-800">Menu</span>
              </div>
              
              <nav className="space-y-1">
                {/* Dashboard */}
                <button 
                  className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                    activeSection === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveSection('dashboard');
                    setSidebarOpen(false);
                  }}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </button>
                
                {/* Encryption section */}
                <div>
                  <button 
                    className="flex items-center justify-between w-full px-3 py-2 text-left rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => toggleMenu('encryption')}
                  >
                    <div className="flex items-center">
                      <Key className="h-5 w-5 mr-3" />
                      Encryption Tools
                    </div>
                    {expandedMenus.includes('encryption') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedMenus.includes('encryption') && (
                    <div className="pl-11 pr-3 py-1 space-y-1">
                      <button 
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          activeSection === 'encrypt' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setActiveSection('encrypt');
                          setMode('encrypt');
                          setSidebarOpen(false);
                        }}
                      >
                        Encrypt
                      </button>
                      <button 
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          activeSection === 'decrypt' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setActiveSection('decrypt');
                          setMode('decrypt');
                          setSidebarOpen(false);
                        }}
                      >
                        Decrypt
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Data section */}
                <div>
                  <button 
                    className="flex items-center justify-between w-full px-3 py-2 text-left rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => toggleMenu('data')}
                  >
                    <div className="flex items-center">
                      <Database className="h-5 w-5 mr-3" />
                      Data Management
                    </div>
                    {expandedMenus.includes('data') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedMenus.includes('data') && (
                    <div className="pl-11 pr-3 py-1 space-y-1">
                      <button 
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          activeSection === 'new-users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setActiveSection('new-users');
                          setSidebarOpen(false);
                          fetchNewUsers();
                        }}
                      >
                        New Users
                      </button>
                      <button 
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          activeSection === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setActiveSection('orders');
                          setSidebarOpen(false);
                          fetchOrders();
                        }}
                      >
                        Orders
                      </button>
                      <button 
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          activeSection === 'upload-orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setActiveSection('upload-orders');
                          setSidebarOpen(false);
                        }}
                      >
                        Upload Orders
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Export section */}
                <button 
                  className={`flex items-center w-full px-3 py-2 text-left rounded-md ${
                    activeSection === 'export' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveSection('export');
                    setSidebarOpen(false);
                  }}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Export Data
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Error display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
              {error}
            </div>
          )}

          {/* Dashboard section */}
          {activeSection === 'dashboard' && (
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
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <Key className="inline-block mr-1 h-4 w-4" />
                        Encrypt Phone Numbers
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveSection('upload-orders');
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <Upload className="inline-block mr-1 h-4 w-4" />
                        Upload Orders
                      </button>
                      
                      <button
                        onClick={() => exportData('orders')}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                      >
                        <DownloadCloud className="inline-block mr-1 h-4 w-4" />
                        Export Orders
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Encrypt section */}
          {(activeSection === 'encrypt' || activeSection === 'decrypt') && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {activeSection === 'encrypt' ? 'Encrypt Phone Numbers' : 'Decrypt Phone Numbers'}
              </h2>
              
              {/* File Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">CSV File</label>
                <div className="flex items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  >
                    Select File
                  </label>
                  <span className="ml-3 text-gray-600">
                    {fileName || 'No file selected'}
                  </span>
                </div>
              </div>

              {/* Column Name */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="column-name">
                  Column Name
                </label>
                <input
                  id="column-name"
                  type="text"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Name of column containing phone numbers"
                />
              </div>

              {/* Advanced Options */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <input
                    id="advanced-toggle"
                    type="checkbox"
                    checked={showAdvanced}
                    onChange={() => setShowAdvanced(!showAdvanced)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <label htmlFor="advanced-toggle" className="ml-2 text-gray-700 font-semibold">
                    Show Advanced Options
                  </label>
                </div>
                
                {showAdvanced && (
                  <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2" htmlFor="key">
                        Encryption Key
                      </label>
                      <input
                        id="key"
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="iv">
                        Initialization Vector (IV)
                      </label>
                      <input
                        id="iv"
                        type="text"
                        value={iv}
                        onChange={(e) => setIV(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* File Preview */}
              {preview && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">File Preview</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          {preview.meta.fields.map((field) => (
                            <th key={field} className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.data.slice(0, 3).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {preview.meta.fields.map((field) => (
                              <td key={field} className="py-2 px-4 border-b text-sm">
                                {row[field]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={processFile}
                  disabled={!file || processing}
                  className={`py-2 px-4 rounded font-medium ${
                    !file || processing 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {processing ? 'Processing...' : activeSection === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                </button>
                
                <button
                  onClick={resetForm}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300"
                >
                  Reset
                </button>
                
                {results && (
                  <button
                    onClick={downloadResults}
                    className="py-2 px-4 bg-green-500 text-white rounded font-medium hover:bg-green-600"
                  >
                    Download Results
                  </button>
                )}
              </div>

              {/* Results */}
              {results && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Processing Results</h3>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <div className="text-sm text-blue-500 font-medium">Total Records</div>
                      <div className="text-2xl font-bold text-blue-600">{results.stats.total}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-100">
                      <div className="text-sm text-green-500 font-medium">Successful</div>
                      <div className="text-2xl font-bold text-green-600">{results.stats.success}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded border border-red-100">
                      <div className="text-sm text-red-500 font-medium">Errors</div>
                      <div className="text-2xl font-bold text-red-600">{results.stats.error}</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                      <div className="text-sm text-yellow-600 font-medium">Success Rate</div>
                      <div className="text-2xl font-bold text-yellow-600">{results.stats.successRate}%</div>
                    </div>
                  </div>
                  
                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            #
                          </th>
                          <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {columnName}
                          </th>
                          <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {activeSection === 'encrypt' ? `${columnName}_encrypted` : `${columnName}_decrypted`}
                          </th>
                          <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.data.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className={row.status === 'error' ? 'bg-red-50' : ''}>
                            <td className="py-2 px-4 border-b text-sm">{idx + 1}</td>
                            <td className="py-2 px-4 border-b text-sm">{row[columnName]}</td>
                            <td className="py-2 px-4 border-b text-sm">
                              {activeSection === 'encrypt' 
                                ? row[`${columnName}_encrypted`] 
                                : row[`${columnName}_decrypted`]}
                            </td>
                            <td className="py-2 px-4 border-b text-sm">
                              {row.status === 'success' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Success
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800" title={row.error}>
                                  Error
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {results.data.length > 10 && (
                      <div className="mt-2 text-sm text-gray-500">
                        Showing 10 of {results.data.length} rows. Download the results to see all data.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New Users section */}
          {activeSection === 'new-users' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">New Users per Day</h2>
              
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
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={newUsers.length < pagination.size || loading}
                          className={`px-3 py-1 rounded ${newUsers.length < pagination.size || loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                          Next
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => exportData('calc_new_users')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Export All New Users Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders section */}
          {activeSection === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders</h2>
              
              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Loading data...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
                    <h3 className="font-semibold text-lg text-gray-800">Orders Data</h3>
                    <button 
                      onClick={fetchOrders}
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {orders.length > 0 ? (
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User ID
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Market
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Side
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Coin Amount
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              IRR Amount
                            </th>
                            <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.id}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.date}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.user_id}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.market}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.order_side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {order.order_side}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.executed_price}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.coin_amount}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {order.irr_amount}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-600">No orders data available</p>
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
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={orders.length < pagination.size || loading}
                          className={`px-3 py-1 rounded ${orders.length < pagination.size || loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                          Next
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => exportData('orders')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Export All Orders
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Orders section */}
          {activeSection === 'upload-orders' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Orders</h2>
              
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
          )}

          {/* Export Data section */}
          {activeSection === 'export' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Export Data</h2>
              
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
          )}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;