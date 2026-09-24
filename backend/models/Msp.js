const mongoose = require('mongoose');

const mspSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true
  },
  cropType: {
    type: String,
    default: 'Kharif'
  },
  price: {
    type: Number,
    required: true
  },
  previousPrice: {
    type: Number,
    default: 0
  },
  increase: {
    type: Number,
    default: 0
  },
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
  unit: {
    type: String,
    default: 'Quintal'
  },
  season: {
    type: String,
    default: '2024-25'
  }
}, { timestamps: true });

module.exports = mongoose.model('Msp', mspSchema);
