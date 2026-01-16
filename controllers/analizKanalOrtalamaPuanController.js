// controllers/analizKanalOrtalamaPuanController.js

const db = require("../db");

exports.getKanalOrtalamaPuan = (req, res) => {
    const sql = `
        SELECT 
            k.kanal_adi,
            ROUND(AVG(sky.ortalama_puan), 2) AS ortalama_puan
        FROM sube_kanal_yorum sky
        JOIN kanallar k ON k.id = sky.kanal_id
        GROUP BY k.kanal_adi
        ORDER BY ortalama_puan DESC;
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json(rows);
    });
};
