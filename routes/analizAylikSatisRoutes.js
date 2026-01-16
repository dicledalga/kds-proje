// analizAylikSatisRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {

    const subeId = Number(req.query.sube_id || 0);
    const whereSube = subeId !== 0 ? `WHERE sube_id = ${subeId}` : "";

    const sql = `
        SELECT 
            ay,
            CAST(SUM(adet * birim_fiyat) AS UNSIGNED) AS toplam_satis

        FROM satislar
          ${whereSube}
        GROUP BY ay
        ORDER BY ay;
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

module.exports = router;
