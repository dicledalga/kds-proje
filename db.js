//db.js
const mysql = require('mysql2');

// .env'den okuyor
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log('MySQL bağlantı hatası:', err);
        return;
    }
    console.log('MySQL bağlantısı başarılı!');
});

module.exports = db;