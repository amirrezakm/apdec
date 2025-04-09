/**
 * API Service for handling all API requests
 */

class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:8000'; // Replace with your actual API base URL
    this.token = null;
    this.checkToken();
  }

  /**
   * Get JWT token (Mock implementation)
   * @param {string} username - Username for authentication
   * @param {string} password - Password for authentication
   * @returns {Promise<Object>} - Authentication response
   */
  async login(username, password) {
    // For demo purposes, accept any username/password
    // In a real app, this would validate credentials with the server
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Mock successful response
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.nF8CjTXUM5C8jq2JuCbPW0VDfPBM9yPLSbHe5W-nyqc';
    this.token = mockToken;
    localStorage.setItem('api_token', mockToken);
    
    return {
      access_token: mockToken,
      token_type: 'bearer'
    };
  }
  
  /**
   * Check if token exists in localStorage
   * @returns {boolean} - True if token exists, false otherwise
   */
  checkToken() {
    const token = localStorage.getItem('api_token');
    if (token) {
      this.token = token;
      return true;
    }
    return false;
  }
  
  /**
   * Logout - remove token
   */
  logout() {
    localStorage.removeItem('api_token');
    this.token = null;
  }
  
  /**
   * Upload orders CSV file directly (Mock implementation)
   * @param {File} file - CSV file to upload
   * @returns {Promise<Object>} - Upload response
   */
  async uploadOrdersCSV(file) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    // Validate file
    if (!file || file.type !== 'text/csv') {
      throw new Error('Please upload a valid CSV file');
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful response
    return {
      success: true,
      message: `Successfully processed ${file.name} with ${Math.floor(Math.random() * 100) + 20} orders`,
      processed: Math.floor(Math.random() * 100) + 20,
      errors: 0
    };
  }
  
  /**
   * Get new users per day (Mock implementation)
   * @param {number} page - Page number for pagination
   * @param {number} size - Page size for pagination
   * @returns {Promise<Array>} - New users data
   */
  async getNewUsers(page = 1, size = 20) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate mock data
    const mockData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      mockData.push({
        id: i + 1,
        transaction_date: date.toISOString().split('T')[0],
        new_users: Math.floor(Math.random() * 100) + 10
      });
    }
    
    // Apply pagination
    const start = (page - 1) * size;
    const end = start + size;
    return mockData.slice(start, end);
  }
  
  /**
   * Get orders (Mock implementation)
   * @param {number} page - Page number for pagination
   * @param {number} size - Page size for pagination
   * @returns {Promise<Array>} - Orders data
   */
  async getOrders(page = 1, size = 20) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate mock data
    const mockData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    const markets = ['BTC/IRR', 'ETH/IRR', 'USDT/IRR', 'BNB/IRR'];
    const statuses = ['completed', 'pending', 'completed', 'completed']; // More completed than pending
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      
      const market = markets[Math.floor(Math.random() * markets.length)];
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const price = Math.floor(Math.random() * 10000) + 1000;
      const coinAmount = (Math.random() * 10).toFixed(4);
      const irrAmount = (price * coinAmount).toFixed(0);
      
      mockData.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        user_id: Math.floor(Math.random() * 1000) + 1,
        market: market,
        order_side: side,
        executed_price: price,
        coin_amount: coinAmount,
        irr_amount: irrAmount,
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
    
    // Apply pagination
    const start = (page - 1) * size;
    const end = start + size;
    return mockData.slice(start, end);
  }
  
  /**
   * Export data as CSV (Mock implementation)
   * @param {string} tableName - Name of the table to export
   * @returns {Promise<Blob>} - CSV data as blob
   */
  async exportData(tableName) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock CSV data
    let csvContent = '';
    
    if (tableName === 'orders') {
      csvContent = 'id,date,user_id,market,order_side,executed_price,coin_amount,irr_amount,status\n';
      for (let i = 0; i < 100; i++) {
        csvContent += `${i+1},2025-04-0${Math.floor(Math.random() * 9) + 1},${Math.floor(Math.random() * 1000) + 1},BTC/IRR,${Math.random() > 0.5 ? 'buy' : 'sell'},${Math.floor(Math.random() * 10000) + 1000},${(Math.random() * 10).toFixed(4)},${Math.floor(Math.random() * 1000000) + 100000},completed\n`;
      }
    } else if (tableName === 'calc_new_users') {
      csvContent = 'id,transaction_date,new_users\n';
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        csvContent += `${i+1},${date.toISOString().split('T')[0]},${Math.floor(Math.random() * 100) + 10}\n`;
      }
    }
    
    // Create a blob from the CSV content
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
