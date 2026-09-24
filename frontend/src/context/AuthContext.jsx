import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load logged-in user from local session storage
    const storedUser = localStorage.getItem('agri_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Fetch all registered users from our new Node backend
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`);
      if (response.data && response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users from backend", error);
    }
  };

  const login = async (credentials) => {
    try {
      // The frontend historically used phone+@mandi.gov.in as username for farmers,
      // and ID/phone/licenseId for others. We preserve this for compatibility.
      const username = credentials.role === 'farmer' 
        ? `${credentials.phone}@mandi.gov.in` 
        : credentials.id || credentials.phone || credentials.licenseId;
        
      const password = credentials.password || credentials.phone;
        
      const payload = {
        username: username,
        password: password,
        role: credentials.role // Required by our new backend to pick the right table
      };

      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, payload);
      if (response.data && response.data.success) {
        // user data is spread in response.data, so we omit success and jwt to save the pure user doc
        const { success, jwt, ...userDoc } = response.data;
        const userObj = { ...userDoc, jwt };
        
        setUser(userObj);
        localStorage.setItem('agri_user', JSON.stringify(userObj));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed", error.response?.data?.message || error.message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const username = userData.role === 'farmer' 
        ? `${userData.phone}@mandi.gov.in` 
        : userData.id || userData.phone || userData.licenseId;

      const payload = {
        fullname: userData.name || userData.fullname || userData.businessName || "Unknown",
        phone: userData.phone,
        email: userData.email || `${userData.phone}@mandi.gov.in`,
        password: userData.password || userData.phone,
        role: userData.role || "farmer",
        username: username,
        khasra: userData.khasra,
        id: userData.id,
        district: userData.district,
        state: userData.state,
        village: userData.village,
        licenseId: userData.licenseId,
        businessName: userData.businessName,
        jurisdiction: userData.jurisdiction
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
      if (response.data && response.data.success) {
        await fetchUsers();
        return { success: true };
      }
      return { success: false, message: 'Registration failed.' };
    } catch (error) {
      console.error("Failed to register", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agri_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, users }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
