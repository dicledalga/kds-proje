// routes/dssRoutes.js
const express = require('express');
const router = express.Router();
const dssController = require('../controllers/dssController');

router.get('/karar-oneri', dssController.getKararOneri);

module.exports = router;
