// controllers/analizMaliyetTrendController.js
const db = require('../db');

exports.getMaliyetTrend = (req, res) => {

  //  Toplam Maliyet (Aylık)
  const toplamSql = `
        SELECT 
        ay,
        SUM(isci_maliyet) AS isci,
        SUM(lojistik_maliyet) AS lojistik,
        SUM(diger_giderler) AS diger,
        SUM(toplam_maliyet) AS toplam_maliyet
    FROM maliyetler
    GROUP BY ay
    ORDER BY ay;
`;
  //  Şubeye Göre Maliyet Trend
  const subeSql = `
        SELECT 
            m.sube_id,
            s.sube_adi,
            m.ay,
            SUM(m.toplam_maliyet) AS toplam_maliyet
        FROM maliyetler m
        JOIN subeler s ON s.id = m.sube_id
        GROUP BY m.sube_id, s.sube_adi, m.ay
        ORDER BY m.sube_id, m.ay;
    `;

  const analizSql = `
       SELECT 
  m.ay,
  SUM(m.isci_maliyet) AS isci,
  SUM(m.lojistik_maliyet) AS lojistik,
  SUM(m.toplam_maliyet) AS toplam,
  COALESCE(
    (SELECT SUM(adet * birim_fiyat) 
     FROM satislar s 
     WHERE s.ay = m.ay), 0
  ) AS ciro
FROM maliyetler m
WHERE m.ay IN ('2025-11','2025-12')
GROUP BY m.ay
ORDER BY m.ay DESC;

    `;
  db.query(toplamSql, (err, toplam) => {
    if (err) return res.status(500).json(err);

    db.query(subeSql, (err, sube) => {
      if (err) return res.status(500).json(err);

      db.query(analizSql, (err, analiz) => {
        if (err) return res.status(500).json(err);

        res.json({
          toplam,
          subeler: sube,
          analiz
        });
      });
    });
  });
}
