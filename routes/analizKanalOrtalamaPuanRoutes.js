// routes/analizKanalOrtalamaPuanRoutes.js
const express = require("express");
const router = express.Router();
const analizKanalOrtalamaPuanController = require("../controllers/analizKanalOrtalamaPuanController");

router.get("/", analizKanalOrtalamaPuanController.getKanalOrtalamaPuan);

module.exports = router;
