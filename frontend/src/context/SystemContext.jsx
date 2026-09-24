import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
  const [msps, setMsps] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [adminList, setAdminList] = useState([]);

  const fetchSystemData = async () => {
    try {
      // 1. Fetch system tables
      const [mspRes, txRes, tokenRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/msp`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/transactions`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/tokens`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/auth/users`).catch(() => ({ data: { users: [] } }))
      ]);
      
      setMsps(mspRes.data || []);
      setTransactions(txRes.data || []);
      setTokens(tokenRes.data || []);
      
      // 2. Build Admin List by filtering the users table
      const allUsers = usersRes.data.users || [];
      const admins = allUsers.filter(u => 
        ['district_admin', 'auction_admin', 'state_admin', 'central_admin'].includes(u.role)
      ).map(u => ({
        id: u.id || u._id,
        name: u.fullname,
        role: u.role,
        state: u.state,
        district: u.district,
        status: u.status || 'Active'
      }));
      setAdminList(admins);
      
    } catch (error) {
      console.error("Failed to load system data from backend", error);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const updateMsp = async (newMsps) => {
    try {
      await axios.post(`${API_BASE_URL}/api/msp`, newMsps);
      await fetchSystemData();
      return true;
    } catch (e) { return false; }
  };

  const updateQuotas = async (newQuotas) => {
    // We don't have a quota backend route yet, keep mock
    setQuotas(newQuotas);
    return true;
  };

  const addTransaction = async (tx) => {
    try {
      // make sure it has an ID
      if (!tx.id) tx.id = 'TXN-' + Math.floor(Math.random()*10000);
      await axios.post(`${API_BASE_URL}/api/transactions`, tx);
      await fetchSystemData();
      return true;
    } catch (e) { return false; }
  };

  const addToken = async (token) => {
    try {
      const payload = {
        ...token,
        id: 'TKN-' + Math.floor(Math.random()*10000),
        status: 'pending'
      };
      await axios.post(`${API_BASE_URL}/api/tokens`, payload);
      await fetchSystemData();
    } catch (e) {
      console.error("Failed to add token", e);
    }
  };

  const updateTokenStatus = async (tokenId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/tokens/${tokenId}`, { status: newStatus });
      await fetchSystemData();
    } catch (e) {
      console.error("Failed to update token status", e);
    }
  };

  return (
    <SystemContext.Provider value={{ msps, quotas, transactions, tokens, adminList, updateMsp, updateQuotas, addTransaction, addToken, updateTokenStatus, fetchSystemData }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
