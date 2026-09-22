const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speechController');

router.post('/command', speechController.processCommand);
router.post('/transcribe', speechController.transcribeAudio);

module.exports = router;
