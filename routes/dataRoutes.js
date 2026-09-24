const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Tokens (Mandi Gate Passes)
router.get('/tokens', dataController.getTokens);
router.post('/tokens', dataController.createToken);
router.put('/tokens/:id', dataController.updateTokenStatus);

// Transactions
router.get('/transactions', dataController.getTransactions);
router.post('/transactions', dataController.createTransaction);

// MSPs (support both /msp and /msp-rates)
router.get('/msp', dataController.getMsps);
router.get('/msp-rates', dataController.getMsps);
router.post('/msp', dataController.updateMsps);
router.post('/msp-rates', dataController.updateMsps);

// Quotas (Procurement Quotas for Central, State, and District levels)
router.get('/quotas', dataController.getQuotas);
router.post('/quotas', dataController.updateQuotas);

// Auctions & Bidding
router.get('/auctions', dataController.getAuctions);
router.get('/mandis/:mandiId/auctions', dataController.getAuctions);
router.post('/auctions', dataController.createAuction);
router.put('/auctions/:id/authorize', dataController.authorizeAuction);
router.put('/auctions/:id', dataController.authorizeAuction);
router.post('/auctions/:id/bids', dataController.placeBid);
router.post('/auctions/:auctionId/bids', dataController.placeBid);

// Inventory / Stock
router.get('/inventory', dataController.getInventory);
router.post('/inventory', dataController.createInventory);

// Statistics
router.get('/statistics', dataController.getStatistics);

// Mandis Directory
router.get('/mandis', dataController.getMandis);

// National Farmer Portal Live Stats & Verification
router.get('/farmers/national-stats', dataController.getNationalFarmerStats);
router.get('/farmers/verify-portal', dataController.verifyGovtFarmerPortal);

module.exports = router;
