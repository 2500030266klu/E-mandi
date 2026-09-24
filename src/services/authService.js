import apiClient from '../utils/apiClient';

export const authService = {
  login: async (credentials, role) => {
    // In a real scenario, role might determine the endpoint (e.g., /auth/farmer/login)
    const response = await apiClient.post('/auth/login', { ...credentials, role });
    return response.data;
  },

  register: async (userData, role) => {
    const response = await apiClient.post('/auth/register', { ...userData, role });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
