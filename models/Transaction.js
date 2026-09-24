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
  crop: {
    type: String
  },
  grainType: {
    type: String
  },
  quantity: {
    type: mongoose.Schema.Types.Mixed // supports both number (45.5) or formatted string ("45.50 Qtl")
  },
  price: {
    type: Number
  },
  pricePerQuintal: {
    type: Number
  },
  total: {
    type: Number
  },
  totalAmount: {
    type: Number
  },
  district: {
    type: String,
    default: 'National'
  },
  state: {
    type: String,
    default: 'National'
  },
  mandi: {
    type: String
  },
  date: {
    type: String
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'Authorized'],
    default: 'Completed'
  }
}, { timestamps: true });

// Pre-save hook to ensure backward-compatibility between crop/grainType and total/totalAmount
transactionSchema.pre('save', function (next) {
  if (!this.crop && this.grainType) this.crop = this.grainType;
  if (!this.grainType && this.crop) this.grainType = this.crop;
  if (!this.price && this.pricePerQuintal) this.price = this.pricePerQuintal;
  if (!this.pricePerQuintal && this.price) this.pricePerQuintal = this.price;
  if (!this.total && this.totalAmount) this.total = this.totalAmount;
  if (!this.totalAmount && this.total) this.totalAmount = this.total;
  if (!this.date) this.date = new Date().toISOString();
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
