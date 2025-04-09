import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

// Create the context
const AuthContext = createContext();

/**
 * AuthProvider component to wrap the application and provide authentication state
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for existing token on component mount
  useEffect(() => {
    const hasToken = apiService.checkToken();
    if (hasToken) {
      setIsAuthenticated(true);
    }
  }, []);

  /**
   * Handle login
   * @param {Event} e - Form submit event
   * @returns {Promise<void>}
   */
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await apiService.login(username, password);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || 'Failed to authenticate with API');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle logout
   */
  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
  };

  // Context value
  const value = {
    isAuthenticated,
    username,
    setUsername,
    password,
    setPassword,
    loading,
    error,
    setError,
    handleLogin,
    handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 * @returns {Object} - Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
