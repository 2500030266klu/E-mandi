const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.getUsers);
router.get('/me', authController.getCurrentUser);

module.exports = router;
