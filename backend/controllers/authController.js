const mongoose = require('mongoose');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const Management = require('../models/Management');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getModelByRole = (role) => {
  if (role === 'farmer') return Farmer;
  if (role === 'trader') return Trader;
  if (role === 'district_admin' || role === 'auction_admin') return Admin;
  if (role === 'central_admin' || role === 'state_admin') return Management;
  return null;
};

// In-memory demo users
let memoryUsers = [
  {
    fullname: 'Ramesh Kumar',
    phone: '9876543210',
    username: '9876543210@mandi.gov.in',
    password: 'password123',
    role: 'farmer',
    khasra: 'UP-4592-88',
    district: 'Sonipat',
    village: 'Rampur',
    state: 'Haryana',
    aadhaar: 'XXXX-XXXX-9481',
    status: 'Active'
  },
  {
    fullname: 'Global Agri Corp',
    phone: '9812345678',
    username: 'TRD-8821',
    licenseId: 'TRD-8821',
    password: 'password123',
    role: 'trader',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    status: 'Active'
  },
  {
    fullname: 'Dr. Alok Verma',
    phone: '9823456789',
    username: 'ADM-DIST-01',
    id: 'ADM-DIST-01',
    password: 'password123',
    role: 'district_admin',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    status: 'Active'
  },
  {
    fullname: 'R. K. Meena',
    phone: '9834567890',
    username: 'ADM-AUC-01',
    id: 'ADM-AUC-01',
    password: 'password123',
    role: 'auction_admin',
    district: 'Indore',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    fullname: 'Smt. Sunita Rao (IAS)',
    phone: '9845678901',
    username: 'MGMT-CEN-01',
    id: 'MGMT-CEN-01',
    password: 'password123',
    role: 'central_admin',
    jurisdiction: 'National',
    status: 'Active'
  },
  {
    fullname: 'Shri Rajesh Pathak',
    phone: '9856789012',
    username: 'MGMT-STA-01',
    id: 'MGMT-STA-01',
    password: 'password123',
    role: 'state_admin',
    jurisdiction: 'Madhya Pradesh',
    status: 'Active'
  }
];

// Seed demo users if collections are empty
const seedDemoUsersIfEmpty = async () => {
  if (!isDbConnected()) return;
  try {
    const fCount = await Farmer.countDocuments();
    if (fCount === 0) {
      await Farmer.create(memoryUsers[0]);
    }
    const tCount = await Trader.countDocuments();
    if (tCount === 0) {
      await Trader.create(memoryUsers[1]);
    }
    const aCount = await Admin.countDocuments();
    if (aCount === 0) {
      await Admin.create([memoryUsers[2], memoryUsers[3]]);
    }
    const mCount = await Management.countDocuments();
    if (mCount === 0) {
      await Management.create([memoryUsers[4], memoryUsers[5]]);
    }
  } catch (e) {
    console.warn('Seed demo users notice:', e.message);
  }
};

setTimeout(seedDemoUsersIfEmpty, 2000);

exports.register = async (req, res) => {
  try {
    const { role } = req.body;
    const Model = getModelByRole(role);
    
    if (!Model) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    let username = req.body.username;
    if (!username) {
      if (role === 'farmer') {
        username = `${req.body.phone}@mandi.gov.in`;
      } else {
        username = req.body.id || req.body.licenseId || req.body.phone;
      }
    }
    username = (username || '').trim();
    req.body.username = username;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username / Phone / ID is required' });
    }

    // Save in memory
    memoryUsers.push({ ...req.body });

    if (isDbConnected()) {
      try {
        const newUser = await Model.create(req.body);
        return res.status(201).json({ success: true, user: newUser });
      } catch (e) {
        console.warn("DB register fallback:", e.message);
      }
    }

    res.status(201).json({ success: true, user: req.body });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const cleanUsername = String(username || '').trim();

    // Check DB first if connected
    if (isDbConnected()) {
      try {
        const Model = getModelByRole(role);
        if (Model) {
          const escaped = cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const orConditions = [
            { username: { $regex: new RegExp(`^${escaped}$`, 'i') } },
            { phone: cleanUsername }
          ];
          if (role === 'farmer') orConditions.push({ username: `${cleanUsername}@mandi.gov.in` });
          if (role === 'trader') orConditions.push({ licenseId: { $regex: new RegExp(`^${escaped}$`, 'i') } });
          if (role === 'district_admin' || role === 'auction_admin' || role === 'central_admin' || role === 'state_admin') {
            orConditions.push({ id: { $regex: new RegExp(`^${escaped}$`, 'i') } });
          }

          let user = await Model.findOne({ $or: orConditions, password });
          if (user) {
            return res.status(200).json({
              success: true,
              jwt: 'jwt-session-' + Date.now(),
              ...user._doc
            });
          }
        }
      } catch (e) {
        console.warn("DB login check fallback:", e.message);
      }
    }

    // Fallback to in-memory users
    const matchedUser = memoryUsers.find(u => {
      const matchIdentity = 
        u.username?.toLowerCase() === cleanUsername.toLowerCase() ||
        u.phone === cleanUsername ||
        u.licenseId === cleanUsername ||
        u.id === cleanUsername ||
        (cleanUsername.includes('@') && u.username === cleanUsername);
      const matchPass = u.password === password;
      return matchIdentity && matchPass;
    });

    if (matchedUser) {
      return res.status(200).json({
        success: true,
        jwt: 'jwt-session-token-' + Date.now(),
        ...matchedUser
      });
    }

    // Default lenient fallback for quick hackathon demo login if valid format
    if (password === 'admin123' || password === 'trader123' || password === 'farmer123' || password === 'mgmt123' || password === 'password123') {
      const demoUser = {
        fullname: cleanUsername,
        username: cleanUsername,
        role: role || 'farmer',
        district: 'Indore',
        state: 'Madhya Pradesh'
      };
      return res.status(200).json({
        success: true,
        jwt: 'jwt-demo-token-' + Date.now(),
        ...demoUser
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please verify your details or use demo credentials.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;
    if (!authHeader) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        message: 'No active session token'
      });
    }

    res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        role: 'farmer',
        fullname: 'Ramesh Kumar',
        phone: '9876543210',
        khasra: 'UP-4592-88'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const farmers = await Farmer.find().select('-password');
        const traders = await Trader.find().select('-password');
        const admins = await Admin.find().select('-password');
        const management = await Management.find().select('-password');
        const allUsers = [...farmers, ...traders, ...admins, ...management];
        if (allUsers.length > 0) {
          return res.status(200).json({
            success: true,
            users: allUsers,
            content: allUsers,
            total: allUsers.length
          });
        }
      } catch (e) {}
    }

    res.status(200).json({ 
      success: true, 
      users: memoryUsers,
      content: memoryUsers,
      total: memoryUsers.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
