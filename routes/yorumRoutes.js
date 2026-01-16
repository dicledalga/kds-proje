// yorumRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');

// Şube-kanal yorumlarını getir
router.get('/', (req, res) => {
    db.query('SELECT * FROM sube_kanal_yorum', (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

module.exports = router;
