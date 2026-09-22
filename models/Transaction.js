const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  farmerName: {
    type: String,
    required: true
  },
  traderName: {
    type: String,
    required: true
  },
  grainType: String,
  quantity: Number,
  pricePerQuintal: Number,
  totalAmount: Number,
  date: String,
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Completed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
