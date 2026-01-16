// maliyetRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');

// Tüm sevkiyatları getir
router.get('/', (req, res) => {
    db.query('SELECT * FROM maliyetler', (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

module.exports = router;