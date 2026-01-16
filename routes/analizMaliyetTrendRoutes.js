// routes/analizMaliyetTrendRoutes.js
const express = require('express');
const router = express.Router();
const analizMaliyetTrendController = require('../controllers/analizMaliyetTrendController');

router.get('/', analizMaliyetTrendController.getMaliyetTrend);

module.exports = router;
