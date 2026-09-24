import apiClient from '../utils/apiClient';

export const mandiService = {
  // Get all MSP rates
  getMspRates: async () => {
    const response = await apiClient.get('/msp-rates');
    return response.data;
  },

  // Get active auctions (all or by mandi)
  getAuctions: async (mandiId) => {
    const endpoint = mandiId ? `/mandis/${mandiId}/auctions` : '/auctions';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // Place a bid (Trader)
  placeBid: async (auctionId, amount, bidder) => {
    const response = await apiClient.post(`/auctions/${auctionId}/bids`, { amount, bidder });
    return response.data;
  },

  // Add stock/inventory (Farmer)
  addStock: async (stockData) => {
    const response = await apiClient.post('/inventory', stockData);
    return response.data;
  },

  // Get stock/inventory
  getStock: async (farmerName) => {
    const response = await apiClient.get('/inventory', { params: { farmerName } });
    return response.data;
  },

  // Get transactions
  getTransactions: async () => {
    const response = await apiClient.get('/transactions');
    return response.data;
  },
  
  // Get system statistics (Management)
  getStatistics: async () => {
    const response = await apiClient.get('/statistics');
    return response.data;
  },

  // Get procurement quotas
  getQuotas: async () => {
    const response = await apiClient.get('/quotas');
    return response.data;
  },

  // Update procurement quotas
  updateQuotas: async (quotas) => {
    const response = await apiClient.post('/quotas', quotas);
    return response.data;
  },

  // Get registered mandis
  getMandis: async () => {
    const response = await apiClient.get('/mandis');
    return response.data;
  },

  // Get National Farmer Portal Live Stats
  getNationalStats: async () => {
    const response = await apiClient.get('/farmers/national-stats');
    return response.data;
  },

  // Verify farmer across National AgriStack Registry
  verifyFarmer: async (query) => {
    const response = await apiClient.get('/farmers/verify-portal', { params: { q: query } });
    return response.data;
  }
};
