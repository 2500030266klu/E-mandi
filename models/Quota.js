const mongoose = require('mongoose');

const quotaSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['Central', 'State', 'District'],
    default: 'Central'
  },
  state: {
    type: String,
    default: 'All'
  },
  district: {
    type: String,
    default: 'All'
  },
  target: {
    type: String,
    enum: ['Farmer', 'Trader'],
    required: true
  },
  maxQtl: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'Quintal'
  },
  effectiveSeason: {
    type: String,
    default: 'Kharif & Rabi 2024-25'
  }
}, { timestamps: true });

module.exports = mongoose.model('Quota', quotaSchema);
