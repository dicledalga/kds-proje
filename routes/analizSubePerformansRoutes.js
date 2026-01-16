// analizSubePerformansRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');

// Şube bazlı performans analizi
router.get('/', (req, res) => {

    const sql = `
       SELECT 
    s.id AS sube_id,
    s.sube_adi,

    SUM(sa.adet * sa.birim_fiyat) AS toplam_satis,
    SUM(sa.adet) AS toplam_adet,

    COALESCE(SUM(a.musteri_sayisi), 0) AS toplam_musteri,
    COALESCE(SUM(m.toplam_maliyet), 0) AS toplam_maliyet

FROM subeler s
LEFT JOIN satislar sa ON sa.sube_id = s.id
LEFT JOIN sube_musteri_analiz a ON a.sube_id = s.id
LEFT JOIN maliyetler m ON m.sube_id = s.id

GROUP BY s.id, s.sube_adi
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
