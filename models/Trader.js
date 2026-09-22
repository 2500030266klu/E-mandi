const mongoose = require('mongoose');

const traderSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true },
  role: { type: String, default: 'trader' },
  licenseId: String,
  businessName: String,
  district: String,
  state: String,
  aadhaar: String,
  gstin: String,
  bankGateway: String,
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Trader', traderSchema);
