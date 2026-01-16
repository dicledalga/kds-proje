//server.js
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const subeRoutes = require('./routes/subeRoutes');
const kanalRoutes = require('./routes/kanalRoutes');
const satisRoutes = require('./routes/satisRoutes');
const sevkiyatRoutes = require('./routes/sevkiyatRoutes');
const yorumRoutes = require('./routes/yorumRoutes');
const analizRoutes = require('./routes/analizRoutes');
const aylikSatisRoutes = require('./routes/analizAylikSatisRoutes');
const subePerformansRoutes = require('./routes/analizSubePerformansRoutes');
const kategoriSatisRoutes = require('./routes/analizKategoriSatisRoutes');
const maliyetTrendRoutes = require('./routes/analizMaliyetTrendRoutes');
const kanalAnalizRoutes = require('./routes/analizKanalRoutes');
const kategoriAylikRoutes = require('./routes/analizKategoriAylikRoutes');
const musteriTrendSubeRoutes = require('./routes/analizMusteriTrendSubeRoutes');
const analizKarRoutes = require("./routes/analizKarRoutes");
const analizTahminRoutes = require('./routes/analizTahminRoutes');

const dssRoutes = require('./routes/dssRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/subeler', subeRoutes);
app.use('/kanallar', kanalRoutes);
app.use('/satislar', satisRoutes);
app.use('/sevkiyatlar', sevkiyatRoutes);
app.use('/yorumlar', yorumRoutes);

app.use('/analiz/aylik-satis', aylikSatisRoutes);
app.use('/analiz/sube-performans', subePerformansRoutes);
app.use('/analiz/kategori-satis', kategoriSatisRoutes);
app.use('/analiz/maliyet-trend', maliyetTrendRoutes);
app.use('/analiz/kanal-satis', kanalAnalizRoutes);
app.use("/analiz/kar", analizKarRoutes);
app.use('/analiz/kategori-aylik', kategoriAylikRoutes);
app.use('/analiz/tahmin', analizTahminRoutes);

app.use('/analiz', analizRoutes);

app.use('/dss', dssRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Server çalışıyor!');
});

// Sunucuyu başlat (.env ile)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend ${PORT} portunda çalışıyor...`);
});