const mongoose = require('mongoose');

const mspSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'Quintal'
  }
}, { timestamps: true });

module.exports = mongoose.model('Msp', mspSchema);
