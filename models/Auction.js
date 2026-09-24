const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  trader: {
    type: String,
    default: 'Independent Trader'
  },
  farmer: {
    type: String,
    default: 'Direct Farmer Lot'
  },
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
  askPrice: {
    type: String,
    default: '₹2,275/Qtl'
  },
  basePricePerQuintal: {
    type: Number,
    default: 2275
  },
  currentHighestBid: {
    type: Number,
    default: 0
  },
  highestBidder: {
    type: String,
    default: null
  },
  mandiId: {
    type: String,
    default: 'MND-01'
  },
  mandiName: {
    type: String,
    default: 'Karnal APMC Market'
  },
  district: {
    type: String,
    default: 'Karnal'
  },
  state: {
    type: String,
    default: 'Haryana'
  },
  status: {
    type: String,
    enum: ['pending', 'authorized', 'active', 'completed', 'closed', 'rejected'],
    default: 'pending'
  },
  bids: [
    {
      bidder: { type: String, required: true },
      amount: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
