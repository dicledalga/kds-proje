// analizRoutes.js

const express = require('express');
const router = express.Router();

// Aylık satış
router.use('/aylik-satis', require('./analizAylikSatisRoutes'));

// Şube performansı
router.use('/sube-performans', require('./analizSubePerformansRoutes'));

// Kategori satış
router.use('/kategori-satis', require('./analizKategoriSatisRoutes'));

// Kategori aylık satış
router.use('/kategori-aylik', require('./analizKategoriAylikRoutes'));

// Şubelere göre müşteri trend
router.use('/musteri-trend', require('./analizMusteriTrendSubeRoutes'));

// Maliyet trend burada yok çünkü server.js içinde zaten
router.use('/kanal-satis', require('./analizKanalRoutes'));

router.use('/kanal-ortalama-puan', require('./analizKanalOrtalamaPuanRoutes'));

module.exports = router;