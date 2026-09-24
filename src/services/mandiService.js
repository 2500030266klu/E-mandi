import apiClient from '../utils/apiClient';

export const mandiService = {
  // Get all MSP rates
  getMspRates: async () => {
    const response = await apiClient.get('/msp-rates');
    return response.data;
  },

  // Get active auctions for a specific mandi
  getAuctions: async (mandiId) => {
    const response = await apiClient.get(`/mandis/${mandiId}/auctions`);
    return response.data;
  },

  // Place a bid (Trader)
  placeBid: async (auctionId, amount) => {
    const response = await apiClient.post(`/auctions/${auctionId}/bids`, { amount });
    return response.data;
  },

  // Add stock/inventory (Farmer)
  addStock: async (stockData) => {
    const response = await apiClient.post('/inventory', stockData);
    return response.data;
  },

  // Get transactions for the current user
  getTransactions: async () => {
    const response = await apiClient.get('/transactions');
    return response.data;
  },
  
  // Get system statistics (Management)
  getStatistics: async () => {
    const response = await apiClient.get('/statistics');
    return response.data;
  }
};
