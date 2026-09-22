const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true },
  role: { type: String, required: true }, // district_admin or auction_admin
  id: { type: String, required: true }, // Gov ID
  district: String,
  state: String,
  aadhaar: String,
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
