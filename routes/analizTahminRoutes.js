// routes/analizTahminRoutes.js
const express = require('express');
const router = express.Router();
const analizTahminController = require('../controllers/analizTahminController');

router.get('/', analizTahminController.getTahmin);

module.exports = router;
