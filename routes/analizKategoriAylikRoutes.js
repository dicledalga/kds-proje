// analizKategoriAylikRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');

// promise tabanlı küçük query fonksiyonu
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// Aylara göre kategori satış
router.get('/', async (req, res) => {
    try {
        const results = await query(`
            SELECT 
                ay,
                kategori,
                SUM(adet) AS toplam_satis
            FROM satislar
            GROUP BY ay, kategori
            ORDER BY ay ASC, kategori ASC;
        `);

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

module.exports = router;
