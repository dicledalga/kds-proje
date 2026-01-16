// analizMusteriTrendSubeRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');

// Şubelere Göre Aylık Müşteri Trend
router.get('/', (req, res) => {
    db.query(
        `
        SELECT
            a.sube_id,
            DATE_FORMAT(a.analiz_tarihi, '%Y-%m') AS ay,
            SUM(a.musteri_sayisi) AS musteri_sayisi
        FROM sube_musteri_analiz a
        GROUP BY a.sube_id, ay
        ORDER BY ay, a.sube_id;
        `,
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json(result);
        }
    );
});

module.exports = router;
