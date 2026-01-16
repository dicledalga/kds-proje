// routes/analizKarRoutes.js
const express = require("express");
const router = express.Router();
const analizKarController = require("../controllers/analizKarController");

router.get("/", analizKarController.getKarAnaliz);

module.exports = router;
