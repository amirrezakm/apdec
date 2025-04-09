import React from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Login component for authentication
 * @returns {JSX.Element} - Login component
 */
const Login = () => {
  const { 
    username, 
    setUsername, 
    password, 
    setPassword, 
    loading, 
    error, 
    handleLogin 
  } = useAuth();

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
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
};

export default Login;
