# kdsodev
# Starbucks İzmir Bölgesi Karar Destek Sistemi

# Proje Açıklaması
Bu proje, Starbucks İzmir Bölge Müdürlüğü için satış, maliyet ve satış kanalı verilerinin analiz edilerek yöneticilerin veri temelli kararlar almasını destekleyen bir Karar Destek Sistemi (KDS) uygulamasıdır.

Sistem; şube bazlı satış performanslarını karşılaştırmak, maliyetleri analiz etmek, satış kanallarının verimliliğini ölçmek ve geleceğe yönelik öngörüler sunmak amacıyla geliştirilmiştir. Dashboard yapısı sayesinde yöneticiler tüm analizleri tek bir ekran üzerinden görüntüleyebilmektedir.

# Senaryo Tanımı
Starbucks İzmir Bölge Müdürü, İzmir ilindeki şubelerin satış ve maliyet performanslarını manuel raporlar yerine tek bir sistem üzerinden takip etmek istemektedir.
Bu karar destek sistemi sayesinde yönetici;
Şubelerin satış performanslarını karşılaştırabilir
Aylık satış ve maliyet trendlerini inceleyebilir
Satış kanallarının (Getir, Trendyol vb.) verimliliğini analiz edebilir
Gelecekte satış düşüşü veya maliyet artışı riski olan şubeleri önceden tespit edebilir
6 aylık ve 1 yıllık dönemler için karar önerileri alabilir

# Kullanılan Teknolojiler

Backend: Node.js, Express.js
Veritabanı: MySQL
Frontend: HTML, CSS, JavaScript
Grafik: Chart.js
Mimari: REST API

# Kurulum Adımları
Projeyi klonlama
git clone https://github.com/kullaniciadi/starbucks-izmir-karar-destek-sistemi.git

Backend klasörüne girme
cd backend

Gerekli paketleri yükleme
npm install

.env dosyasını oluşturma
cp .env.example .env

MySQL veritabanını oluşturma
CREATE DATABASE kds_odev_db;

Sunucuyu başlatma
npm start

# API Endpoint Listesi

GET	/api/subeler	              Tüm şubeleri listeler
GET	/api/satislar	              Satış verilerini getirir
GET	/api/maliyetler	            Maliyet verilerini getirir
GET	/api/kanallar	              Satış kanalı performanslarını getirir
GET	/api/analiz/aylik	          Aylık satış ve maliyet trendleri
GET	/api/analiz/ongoru	        Gelecek dönem satış öngörüleri


# ER Diyagramı
<img width="930" height="587" alt="erdiyagram" src="https://github.com/user-attachments/assets/89fafb22-b186-43b8-876d-ab5abe9c52bb" />

