// satisRooutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');

// Tüm satışları getir
router.get('/', (req, res) => {
    db.query('SELECT * FROM satislar', (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

module.exports = router;
