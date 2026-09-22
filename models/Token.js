const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  farmerName: {
    type: String,
    required: true
  },
  state: String,
  district: String,
  mandi: String,
  date: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);
