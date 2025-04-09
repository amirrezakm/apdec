import React from 'react';
import { 
  X, Home, Key, Database, FileText, 
  Camera, ChevronRight, ChevronDown 
} from 'lucide-react';

/**
 * Sidebar component for navigation
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Sidebar component
 */
const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  activeSection, 
  setActiveSection, 
  expandedMenus, 
  toggleMenu,
  setMode
}) => {
  return (
    <>
      <aside 
        className={`bg-white shadow-md fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute right-0 top-0 p-2">
          <button 
            className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
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
                  setIsOpen(false);
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
                  aria-expanded={expandedMenus.includes('encryption')}
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
                        setIsOpen(false);
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
                        setIsOpen(false);
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
                  aria-expanded={expandedMenus.includes('data')}
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
                        setIsOpen(false);
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
                        setIsOpen(false);
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
                        setIsOpen(false);
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
                  setIsOpen(false);
                }}
              >
                <FileText className="h-5 w-5 mr-3" />
                Export Data
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
