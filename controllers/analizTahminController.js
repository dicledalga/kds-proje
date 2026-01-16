// controllers/analizTahminController.js
const db = require('../db');

function query(sql) {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

exports.getTahmin = async (req, res) => {
    try {

        // 1) SATIŞ TAHMİNİ (son 3 ay ortalaması)
        const satis = await query(`
            SELECT SUM(adet * birim_fiyat) AS aylik_toplam_tutar
            FROM satislar
            GROUP BY ay
            ORDER BY ay DESC
            LIMIT 3;
        `);

        const tahminiSatis = Math.round(
            satis.reduce((s, x) => s + Number(x.aylik_toplam_tutar), 0) / satis.length
        );

        // 2) MÜŞTERİ TAHMİNİ
        const musteri = await query(`
            SELECT SUM(musteri_sayisi) AS aylik_toplam_musteri
            FROM sube_musteri_analiz
            GROUP BY DATE_FORMAT(analiz_tarihi, '%Y-%m')
            ORDER BY analiz_tarihi DESC
            LIMIT 3;
        `);

        const tahminiMusteri = Math.round(
            musteri.reduce((s, x) => s + Number(x.aylik_toplam_musteri), 0) / musteri.length
        );

        // 3) MALİYET TAHMİNİ
        const maliyet = await query(`
            SELECT SUM(toplam_maliyet) AS aylik_toplam
            FROM maliyetler
            GROUP BY ay
            ORDER BY ay DESC
            LIMIT 3;
        `);

        const tahminiMaliyet = Math.round(
            maliyet.reduce((s, x) => s + Number(x.aylik_toplam), 0) / maliyet.length
        );

        // 6 aylık projeksiyonlar
        const satis6Ay = Array.from({ length: 6 }, (_, i) =>
            Math.round(tahminiSatis * (1 + (i + 1) * 0.03))
        );

        const musteri6Ay = Array.from({ length: 6 }, (_, i) =>
            Math.round(tahminiMusteri * (1 + (i + 1) * 0.02))
        );

        const maliyet6Ay = Array.from({ length: 6 }, (_, i) =>
            Math.round(tahminiMaliyet * (1 + (i + 1) * 0.04))
        );

        //  response
        res.json({
            tahmini_satis: tahminiSatis,
            tahmini_musteri: tahminiMusteri,
            tahmini_maliyet: tahminiMaliyet,
            satis_6ay: satis6Ay,
            musteri_6ay: musteri6Ay,
            maliyet_6ay: maliyet6Ay
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Tahmin hesaplanamadı");
    }
};
