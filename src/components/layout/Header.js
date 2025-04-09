import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Header component for the application
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Header component
 */
const Header = ({ toggleSidebar, username }) => {
  const { handleLogout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button 
            className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="ml-4 text-xl font-bold text-gray-800">Agha Yasser</h1>
        </div>
        
        <div className="flex items-center">
          <span className="mr-4 text-sm text-gray-600">Logged in as {username}</span>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm text-red-600 hover:text-red-800"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
