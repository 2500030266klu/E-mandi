const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  farmerName: {
    type: String,
    required: true
  },
  farmerPhone: String,
  khasra: String,
  crop: {
    type: String,
    required: true
  },
  variety: {
    type: String,
    default: 'Standard / FAQ'
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'Quintal'
  },
  basePrice: {
    type: Number,
    default: 0
  },
  tradeMode: {
    type: String,
    enum: ['mandi', 'farmgate', 'enwr'],
    default: 'mandi'
  },
  qualityGrade: {
    type: String,
    default: 'Grade-A'
  },
  moisture: {
    type: Number,
    default: 11.8
  },
  mandi: String,
  district: String,
  state: String,
  warehouseReceiptNumber: String,
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
