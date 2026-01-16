// controllers/analizKanalController.js

const db = require('../db');

exports.getKanalAnaliz = (req, res) => {

    // 1TOPLAM SATIŞ (Kanal Bazlı)
    const toplamSql = `
        SELECT 
            k.kanal_adi,
            SUM(s.adet) AS toplam_satis
        FROM satislar s
        JOIN kanallar k ON k.id = s.kanal_id
        GROUP BY k.kanal_adi
        ORDER BY toplam_satis DESC;
    `;

    //  AYLIK TREND
    const trendSql = `
        SELECT 
            k.kanal_adi,
            s.ay AS ay,
            SUM(s.adet) AS toplam_satis
        FROM satislar s
        JOIN kanallar k ON k.id = s.kanal_id
        GROUP BY k.kanal_adi, s.ay
        ORDER BY s.ay ASC, k.kanal_adi ASC;
    `;

    db.query(toplamSql, (err, toplam) => {
        if (err) return res.status(500).send(err);

        db.query(trendSql, (err2, trend) => {
            if (err2) return res.status(500).send(err2);

            res.json({
                toplam,
                trend
            });
        });
    });
};