// controllers/dssController.js

const db = require('../db');

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

exports.getKararOneri = async (req, res) => {
    try {
        const subeId = Number(req.query.sube_id || 0);

        console.log("📌 DSS ÇAĞRILDI — Seçilen Şube:", subeId);

        // Şube filtresi
        const whereSube = subeId !== 0 ? `WHERE sube_id = ${subeId}` : "";
        const whereSubeMusteri = subeId !== 0 ? `WHERE a.sube_id = ${subeId}` : "";

        // 1) Aylık satış trendi
        const aylikSatis = await query(`
            SELECT ay, SUM(adet) AS toplam_satis
            FROM satislar
            ${whereSube}
            GROUP BY ay
            ORDER BY ay ASC;
        `);

        // 2) Müşteri Trend
        const musteriTrend = await query(`
            SELECT 
                DATE_FORMAT(a.analiz_tarihi, '%Y-%m') AS ay,
                SUM(a.musteri_sayisi) AS toplam_musteri
            FROM sube_musteri_analiz a
            ${whereSubeMusteri}
            GROUP BY ay
            ORDER BY ay ASC;
        `);

        // Maliyet Trend
        const maliyetTrend = await query(`
            SELECT 
                ay,
                SUM(toplam_maliyet) AS toplam_maliyet
            FROM maliyetler
            ${whereSube}
            GROUP BY ay
            ORDER BY ay ASC;
        `);

        // Kategori Satışları
        const kategoriSatis = await query(`
            SELECT kategori, SUM(adet) AS toplam_satis
            FROM satislar
            ${whereSube}
            GROUP BY kategori
            ORDER BY toplam_satis DESC;
        `);

        //  Şube Performansı
        const subePerformans = await query(`
            SELECT 
                s.id AS sube_id,
                s.sube_adi,
                COALESCE(SUM(sa.adet), 0) AS toplam_satis
            FROM subeler s
            LEFT JOIN satislar sa ON sa.sube_id = s.id
            ${subeId !== 0 ? `WHERE s.id = ${subeId}` : ""}
            GROUP BY s.id, s.sube_adi
            ORDER BY toplam_satis DESC;
        `);

        // KARAR METİNLERİ

        // SATIŞ KARARI
        let satisKarari = "Satış verisi bulunamadı.";
        if (aylikSatis.length >= 2) {
            const ilk = aylikSatis[0].toplam_satis;
            const son = aylikSatis[aylikSatis.length - 1].toplam_satis;

            if (son > ilk * 1.05) satisKarari = "Satışlarda artış var. Kapasite artırılabilir.";
            else if (son < ilk * 0.95) satisKarari = "Satışlarda düşüş var. Kampanya önerilir.";
            else satisKarari = "Satışlar stabil.";
        }

        // MÜŞTERİ KARARI
        let musteriKarari = "Müşteri verisi yok.";
        if (musteriTrend.length >= 2) {
            const ilk = musteriTrend[0].toplam_musteri;
            const son = musteriTrend[musteriTrend.length - 1].toplam_musteri;

            if (son > ilk * 1.10) musteriKarari = "Müşteri artışı güçlü. Personel artırılabilir.";
            else if (son < ilk * 0.90) musteriKarari = "Müşteri sayısı düşüyor. Şube analizi önerilir.";
            else musteriKarari = "Müşteri sayısı stabil.";
        }

        // MALİYET KARARI
        let maliyetKarari = "Maliyet verisi yok.";
        if (maliyetTrend.length >= 2) {
            const ilk = maliyetTrend[0].toplam_maliyet;
            const son = maliyetTrend[maliyetTrend.length - 1].toplam_maliyet;

            if (son > ilk * 1.10) maliyetKarari = "Maliyetler artıyor. Gider kalemleri incelenmeli.";
            else if (son < ilk * 0.95) maliyetKarari = "Maliyetler azalıyor. Süreç olumlu.";
            else maliyetKarari = "Maliyetler stabil.";
        }

        // KANAL BAZLI ANALİZ
        const kanalSatis = await query(`
            SELECT k.id, k.kanal_adi, SUM(s.adet) AS toplam_satis
            FROM kanallar k
            LEFT JOIN satislar s ON s.kanal_id = k.id
            ${whereSube} 
            GROUP BY k.id, k.kanal_adi
            ORDER BY toplam_satis DESC;
        `);

        const kanalPuan = await query(`
            SELECT k.id, k.kanal_adi, AVG(y.ortalama_puan) AS ortalama_puan
            FROM kanallar k
            LEFT JOIN sube_kanal_yorum y ON y.kanal_id = k.id
            GROUP BY k.id, k.kanal_adi
            ORDER BY ortalama_puan DESC;
        `);

        let kanalKarari = "Kanal verileri bulunamadı.";
        if (kanalSatis.length > 0 && kanalPuan.length > 0) {
            const enIyiSatis = kanalSatis[0];
            const enIyiPuan = kanalPuan[0];
            const enDusukPuan = kanalPuan[kanalPuan.length - 1];

            kanalKarari =
                `${enIyiSatis.kanal_adi} satış hacmi açısından en güçlü kanal. ` +
                `${enIyiPuan.kanal_adi} müşteri memnuniyeti açısından en yüksek puana sahip. ` +
                `${enDusukPuan.kanal_adi} ise memnuniyet açısından zayıf. İyileştirme önerilir.`;
        }

        // KATEGORİ KARARI
        let kategoriKarari = "Kategori analizi yok.";
        if (kategoriSatis.length > 0) {
            kategoriKarari = `En güçlü kategori: ${kategoriSatis[0].kategori}`;
        }

        // ŞUBE KARARI
        let subeKarari = "Şube verisi yok.";
        if (subePerformans.length > 0) {
            const s = subePerformans[0];
            subeKarari = `${s.sube_adi} performansı değerlendirilmiştir.`;
        }

        // GENEL KARAR
        const genelKarar =
            "Önümüzdeki 6 ay için satış, maliyet ve müşteri eğilimleri düzenli takip edilmelidir.";

        res.json({
            satis_karari: satisKarari,
            musteri_karari: musteriKarari,
            maliyet_karari: maliyetKarari,
            kategori_karari: kategoriKarari,
            sube_karari: subeKarari,
            kanal_karari: kanalKarari,
            genel_karar: genelKarar
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};