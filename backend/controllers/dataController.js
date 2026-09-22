const Token = require('../models/Token');
const Transaction = require('../models/Transaction');
const Msp = require('../models/Msp');

// --- Tokens ---
exports.getTokens = async (req, res) => {
  try {
    const tokens = await Token.find().sort({ createdAt: -1 });
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createToken = async (req, res) => {
  try {
    const newToken = await Token.create(req.body);
    res.status(201).json(newToken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTokenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedToken = await Token.findOneAndUpdate({ id }, { status }, { new: true });
    if (!updatedToken) {
      return res.status(404).json({ message: 'Token not found' });
    }
    res.status(200).json(updatedToken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Transactions ---
exports.getTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json(txs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const newTx = await Transaction.create(req.body);
    res.status(201).json(newTx);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- MSP ---
exports.getMsps = async (req, res) => {
  try {
    const msps = await Msp.find();
    res.status(200).json(msps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMsps = async (req, res) => {
  try {
    // Overwrite all MSPs (simple approach for mock)
    await Msp.deleteMany({});
    const newMsps = await Msp.insertMany(req.body);
    res.status(201).json(newMsps);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
