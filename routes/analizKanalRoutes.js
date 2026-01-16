// routes/analizKanalRoutes.js
const express = require('express');
const router = express.Router();
const analizKanalController = require('../controllers/analizKanalController');

router.get('/', analizKanalController.getKanalAnaliz);

module.exports = router;
