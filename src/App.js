import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import apiService from './services/apiService';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Auth components
import Login from './components/auth/Login';

// Encryption components
import EncryptionForm from './components/encryption/EncryptionForm';

// Data components
import Dashboard from './components/data/Dashboard';
import NewUsers from './components/data/NewUsers';
import Orders from './components/data/Orders';
import UploadOrders from './components/data/UploadOrders';
import ExportData from './components/data/ExportData';

/**
 * Main application component
 * @returns {JSX.Element} - App component
 */
const AppContent = () => {
  const { isAuthenticated, username } = useAuth();
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState(['encryption']);
  const [mode, setMode] = useState('encrypt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Application data state
  const [newUsers, setNewUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20
  });

  // Check for existing token on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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
  
  // Fetch new users data from API
  const fetchNewUsers = async (page = pagination.page, size = pagination.size) => {
    try {
      setLoading(true);
      const data = await apiService.getNewUsers(page, size);
      setNewUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders data from API
  const fetchOrders = async (page = pagination.page, size = pagination.size) => {
    try {
      setLoading(true);
      const data = await apiService.getOrders(page, size);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login screen - only shown if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Main application (only shown after authentication)
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        username={username} 
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          expandedMenus={expandedMenus}
          toggleMenu={toggleMenu}
          setMode={setMode}
        />

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
            <Dashboard 
              newUsers={newUsers}
              orders={orders}
              setActiveSection={setActiveSection}
              setMode={setMode}
              loading={loading}
              setError={setError}
            />
          )}
          
          {/* Encrypt/Decrypt section */}
          {(activeSection === 'encrypt' || activeSection === 'decrypt') && (
            <EncryptionForm mode={mode} />
          )}

          {/* New Users section */}
          {activeSection === 'new-users' && (
            <NewUsers 
              newUsers={newUsers}
              loading={loading}
              error={error}
              setError={setError}
              pagination={pagination}
              setPagination={setPagination}
              fetchNewUsers={fetchNewUsers}
            />
          )}

          {/* Orders section */}
          {activeSection === 'orders' && (
            <Orders 
              orders={orders}
              loading={loading}
              error={error}
              setError={setError}
              pagination={pagination}
              setPagination={setPagination}
              fetchOrders={fetchOrders}
            />
          )}

          {/* Upload Orders section */}
          {activeSection === 'upload-orders' && (
            <UploadOrders 
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
              fetchNewUsers={fetchNewUsers}
              fetchOrders={fetchOrders}
            />
          )}

          {/* Export Data section */}
          {activeSection === 'export' && (
            <ExportData 
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
            />
          )}
        </main>
      </div>
    </div>
  );
};

/**
 * App component with AuthProvider
 * @returns {JSX.Element} - App component with AuthProvider
 */
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
