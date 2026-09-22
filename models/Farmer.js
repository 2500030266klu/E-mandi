const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true },
  role: { type: String, default: 'farmer' },
  khasra: String,
  district: String,
  village: String,
  state: String,
  aadhaar: String,
  accountNumber: String,
  ifsc: String,
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
