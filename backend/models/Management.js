const mongoose = require('mongoose');

const managementSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true },
  role: { type: String, required: true }, // central_admin or state_admin
  id: { type: String, required: true }, // Gov ID
  jurisdiction: String,
  aadhaar: String,
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Management', managementSchema);
