// controllers/analizKarController.js
const db = require("../db");

exports.getKarAnaliz = (req, res) => {

    // Aylık Kâr (Genel)
    const aylikKarSql = `
        SELECT 
            s.ay,
            SUM(s.adet * s.birim_fiyat) AS toplam_satis,
            IFNULL(m.toplam_maliyet, 0) AS toplam_maliyet,
            SUM(s.adet * s.birim_fiyat) - IFNULL(m.toplam_maliyet, 0) AS kar
        FROM satislar s
        LEFT JOIN (
            SELECT 
                ay,
                SUM(toplam_maliyet) AS toplam_maliyet
            FROM maliyetler
            GROUP BY ay
        ) m ON m.ay = s.ay
        GROUP BY s.ay
        ORDER BY s.ay;
    `;

    // Şubeye Göre Kâr
    const subeKarSql = `
        SELECT 
            sb.sube_adi,
            SUM(sa.adet * sa.birim_fiyat) AS toplam_satis,
            IFNULL(m.toplam_maliyet, 0) AS toplam_maliyet,
            SUM(sa.adet * sa.birim_fiyat) - IFNULL(m.toplam_maliyet, 0) AS kar
        FROM subeler sb
        LEFT JOIN satislar sa ON sa.sube_id = sb.id
        LEFT JOIN (
            SELECT 
                sube_id,
                SUM(toplam_maliyet) AS toplam_maliyet
            FROM maliyetler
            GROUP BY sube_id
        ) m ON m.sube_id = sb.id
        GROUP BY sb.id, sb.sube_adi
        ORDER BY kar DESC;
    `;

    //  Query zinciri
    db.query(aylikKarSql, (err, aylikKar) => {
        if (err) return res.status(500).send(err);

        db.query(subeKarSql, (err2, subeKar) => {
            if (err2) return res.status(500).send(err2);

            res.json({
                aylik: aylikKar,
                subeler: subeKar
            });
        });
    });
};

