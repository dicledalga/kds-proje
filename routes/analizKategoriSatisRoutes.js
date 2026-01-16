// analizKategoriSatisRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');

// Kategori bazlı satış analizi
router.get('/', (req, res) => {
    const sql = `
        SELECT 
            kategori,
            SUM(adet) AS toplam_satis
        FROM satislar
        GROUP BY kategori
        ORDER BY toplam_satis DESC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

module.exports = router;
