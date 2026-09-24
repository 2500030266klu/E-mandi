const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Tokens
router.get('/tokens', dataController.getTokens);
router.post('/tokens', dataController.createToken);
router.put('/tokens/:id', dataController.updateTokenStatus);

// Transactions
router.get('/transactions', dataController.getTransactions);
router.post('/transactions', dataController.createTransaction);

// MSPs
router.get('/msp', dataController.getMsps);
router.post('/msp', dataController.updateMsps);

// National Farmer Portal Live Stats & Verification
router.get('/farmers/national-stats', dataController.getNationalFarmerStats);
router.get('/farmers/verify-portal', dataController.verifyGovtFarmerPortal);

module.exports = router;
