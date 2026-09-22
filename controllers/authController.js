const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Admin = require('../models/Admin');
const Management = require('../models/Management');

const getModelByRole = (role) => {
  if (role === 'farmer') return Farmer;
  if (role === 'trader') return Trader;
  if (role === 'district_admin' || role === 'auction_admin') return Admin;
  if (role === 'central_admin' || role === 'state_admin') return Management;
  return null;
};

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

    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const orConditions = [
      { username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } }
    ];

    if (req.body.phone) {
      orConditions.push({ phone: String(req.body.phone).trim() });
    }
    if (req.body.id) {
      const escapedId = String(req.body.id).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      orConditions.push({ id: { $regex: new RegExp(`^${escapedId}$`, 'i') } });
    }
    if (req.body.licenseId) {
      const escapedLicense = String(req.body.licenseId).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      orConditions.push({ licenseId: { $regex: new RegExp(`^${escapedLicense}$`, 'i') } });
    }

    const existingUser = await Model.findOne({ $or: orConditions });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this Phone or ID already exists. Please log in.' });
    }

    const newUser = await Model.create(req.body);
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with these credentials already exists. Please log in.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const Model = getModelByRole(role);
    if (!Model) {
       return res.status(400).json({ success: false, message: 'Invalid role specified for login' });
    }

    const cleanUsername = String(username || '').trim();
    const escaped = cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const orConditions = [
      { username: { $regex: new RegExp(`^${escaped}$`, 'i') } },
      { phone: cleanUsername }
    ];

    if (role === 'farmer') {
      orConditions.push({ username: `${cleanUsername}@mandi.gov.in` });
    }
    if (role === 'trader') {
      orConditions.push({ licenseId: { $regex: new RegExp(`^${escaped}$`, 'i') } });
    }
    if (role === 'district_admin' || role === 'auction_admin' || role === 'central_admin' || role === 'state_admin') {
      orConditions.push({ id: { $regex: new RegExp(`^${escaped}$`, 'i') } });
    }
    
    const user = await Model.findOne({
      $or: orConditions,
      password: password
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your details or register first.' });
    }

    // Mock JWT token
    const token = 'mock-jwt-token-12345';
    
    res.status(200).json({
      success: true,
      jwt: token,
      ...user._doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    // Return all users across all tables (useful for mock admin endpoints)
    const farmers = await Farmer.find().select('-password');
    const traders = await Trader.find().select('-password');
    const admins = await Admin.find().select('-password');
    const management = await Management.find().select('-password');
    
    res.status(200).json({ 
      success: true, 
      users: [...farmers, ...traders, ...admins, ...management] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
