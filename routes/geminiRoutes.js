const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');

router.post('/chat', geminiController.chat);
router.post('/query', geminiController.chat);

module.exports = router;
