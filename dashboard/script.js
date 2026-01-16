// LOGIN

function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    // giriş bilgileri
    const correctUser = "yonetici";
    const correctPass = "kds";

    if (!user || !pass) {
        alert("Lütfen kullanıcı adı ve şifre girin!");
        return;
    }

    if (user !== correctUser || pass !== correctPass) {
        alert("Kullanıcı adı veya şifre hatalı!");
        return;
    }

    //  Giriş başarılı
    history.pushState({}, "", "/dashboard");
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    loadDashboardData();
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}
// SAYFA GEÇİŞİ + URL DESTEKLİ

function showPage(pageId, element) {
    const urlMap = {
        "page-dashboard": "/dashboard",
        "page-aylik": "/aylik-satis",
        "page-sube": "/sube-performans",
        "page-kategori": "/kategori-satis",
        "page-musteri": "/musteri-trend",
        "page-kanal": "/kanal-analiz",
        "page-maliyet": "/maliyet-trend"
    };

    history.pushState({}, "", urlMap[pageId]);

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(pageId).classList.add('active-page');


    // Sayfa içeriğini yükleme
    if (pageId === "page-dashboard") {
        loadDashboardData();
    }
    if (pageId === "page-aylik") {
        loadAylikSatisPage(0);
    }
    if (pageId === "page-sube") {
        loadSubePerformans();
    }
    if (pageId === "page-kategori") {
        loadKategoriAylikGrafik();
    }
    if (pageId === "page-musteri") {
        loadSubeMusteriTrend();
    }
    if (pageId === "page-kanal") {
        loadKanalAnaliz();
    }
    if (pageId === "page-maliyet") {
        loadMaliyetTrend();
    }

    // Menü aktifliğini güncelleme
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
}

// GERİ TUŞU (BACK BUTTON) DESTEĞİ

window.onpopstate = () => {
    const path = window.location.pathname;

    if (path.includes("dashboard")) showPage("page-dashboard", document.querySelector('[onclick*="page-dashboard"]'));
    if (path.includes("aylik-satis")) showPage("page-aylik", document.querySelector('[onclick*="page-aylik"]'));
    if (path.includes("sube-performans")) showPage("page-sube", document.querySelector('[onclick*="page-sube"]'));
    if (path.includes("kategori-satis")) showPage("page-kategori", document.querySelector('[onclick*="page-kategori"]'));
    if (path.includes("musteri-trend")) showPage("page-musteri", document.querySelector('[onclick*="page-musteri"]'));
    if (path.includes("kanal-analiz")) showPage("page-kanal", document.querySelector('[onclick*="page-kanal"]'));
    if (path.includes("maliyet-trend")) showPage("page-maliyet", document.querySelector('[onclick*="page-maliyet"]'));
};

const API_BASE = "http://localhost:3000";

// DASHBOARD

function loadDashboardData(subeId = 0) {
    loadDashboardCards(subeId);
    loadDashboardDecisions(subeId);
    loadDssOzet(subeId);
    loadAylikSatisGrafik(subeId);
    loadKategoriDonutDashboard();
    loadKarAnalizi(subeId);
    refreshSimulationData(subeId);
    loadKdsStrategicCards(subeId);

    if (document.getElementById("page-dashboard").classList.contains("active-page")) {
        loadTahminler(subeId);
    }
}

// DSS KARAR METİNLERİ

function loadDssOzet(subeId = 0) {

    fetch(`${API_BASE}/dss/karar-oneri?sube_id=${subeId}`)
        .then(res => res.json())
        .then(data => {

            // güvenli yazma
            const setText = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val ?? "-";
            };

            setText("dss-satis", data.satis_karari);
            setText("dss-musteri", data.musteri_karari);
            setText("dss-maliyet", data.maliyet_karari);
            setText("dss-kategori", data.kategori_karari);
            setText("dss-kanal", data.kanal_karari);

            // asıl karar metni
            setText("dssOneriMetni", data.genel_karar ?? "Veri bulunamadı.");
        })
        .catch(err => {
            console.error("DSS verisi alınırken hata:", err);
        });
}

// DASHBOARD AYLIK SATIŞ

let dashboardChart = null;

function loadAylikSatisGrafik(subeId = 0) {
    fetch(`${API_BASE}/analiz/aylik-satis?sube_id=${subeId}`)
        .then(res => res.json())
        .then(data => {
            const labels = data.map(row => row.ay);
            const values = data.map(row => row.toplam_satis);

            const ctx = document.getElementById("dashboardSalesChart").getContext("2d");

            if (dashboardChart) dashboardChart.destroy();

            dashboardChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Aylık Satış',
                        data: values,
                        borderWidth: 2,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            //  Yorum sadece burada
            const yorum = yorumUret(labels, values);
            document.getElementById("yorum-aylik-satis").innerText = yorum;
        })
        .catch(err => console.error("Aylık satış verisi alınırken hata:", err));
}

// DASHBOARD KARTLARI 

async function loadDashboardCards(subeId = 0) {

    // 1) DSS veri çekme
    const res = await fetch(`${API_BASE}/dss/karar-oneri?sube_id=${subeId}`);
    const dss = await res.json();

    // 2) Satış Analizi
    document.getElementById("card-toplam-satis").innerText =
        dss.satis_karari ?? "Satış verisi yok.";

    // 3) Müşteri Analizi 
    document.getElementById("card-musteri").innerText =
        dss.musteri_karari ?? "Müşteri verisi yok.";

    // 4) Maliyet Analizi 
    document.getElementById("card-maliyet").innerText =
        dss.maliyet_karari ?? "Maliyet verisi yok.";

    // 5) Kategori lideri eskisi gibi kalsın
    fetch(`${API_BASE}/analiz/kategori-satis`)
        .then(res => res.json())
        .then(data => {
            const best = data.reduce((max, x) =>
                x.toplam_satis > max.toplam_satis ? x : max
            );
            document.getElementById("card-kategori").innerText =
                best.kategori;
        });
}

// AYLIK SATIŞ SAYFASI

let aylikSatisChart = null;

function loadAylikSatisPage(subeId = 0) {
    fetch(`${API_BASE}/analiz/aylik-satis?sube_id=${subeId}`)
        .then(res => res.json())
        .then(data => {

            const labels = data.map(x => x.ay);
            const values = data.map(x => x.toplam_satis);

            const ctx = document
                .getElementById("aylikSatisChart")
                .getContext("2d");

            if (aylikSatisChart) aylikSatisChart.destroy();

            aylikSatisChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Aylık Satış",
                        data: values,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });

            // otomatik yorum
            const yorum = yorumUretSatis(labels, values);
            document.getElementById("yorum-aylik-satis").innerText = yorum;
        })
        .catch(err => console.error("Aylık satış hatası:", err));
}

// ŞUBE PERFORMANSI

let subeChart = null;
let currentMetric = "satis";
let subeRawData = [];

function loadSubePerformans() {
    fetch(`${API_BASE}/analiz/sube-performans`)
        .then(res => res.json())
        .then(data => {
            subeRawData = data;

            // 🔒 varsayılan metric
            currentMetric = "satis";

            drawSubeChart();
        })
        .catch(err => {
            console.error("Şube performansı alınamadı:", err);
        });
}

function changeSubeMetric(metric, btn) {
    currentMetric = metric;

    // buton aktifliği
    document.querySelectorAll(".metric-btn")
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    drawSubeChart();
}

function drawSubeChart() {

    // ❗️GÜVENLİ FİLTRE
    const temizData = subeRawData.filter(x =>
        x.sube_adi &&
        x.toplam_satis !== null &&
        x.toplam_adet !== null &&
        x.toplam_adet > 0
    );

    if (temizData.length === 0) {
        document.getElementById("sube-yorum").innerText =
            "Şube verileri eksik olduğu için analiz yapılamadı.";
        return;
    }

    const labels = temizData.map(x => x.sube_adi);
    let values = [];
    let labelText = "";

    if (currentMetric === "satis") {
        values = temizData.map(x => x.toplam_satis);
        labelText = "Toplam Satış (₺)";
    }

    if (currentMetric === "adet") {
        values = temizData.map(x => x.toplam_adet);
        labelText = "Toplam Satılan Adet";
    }

    if (currentMetric === "sepet") {
        values = temizData.map(x =>
            Math.round(x.toplam_satis / x.toplam_adet)
        );
        labelText = "Ortalama Sepet Tutarı (₺)";
    }

    const ctx = document
        .getElementById("subePerformansChart")
        .getContext("2d");

    if (subeChart) subeChart.destroy();

    subeChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: labelText,
                data: values,
                backgroundColor: "rgba(0, 120, 60, 0.5)",
                borderColor: "#006241",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // Mouse sadece sütunun tam üzerindeyken bilgiyi gösterir
            interaction: {
                mode: 'index',
                intersect: true
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    intersect: true // Sadece üzerine gelince tetiklenmesini sağlar
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }

    });

    generateSubeYorum(labels, values);
}

// OTOMATİK DSS YORUM

function generateSubeYorum(labels, values) {
    const yorumDiv = document.getElementById("sube-yorum");
    if (!yorumDiv) return;

    // Veri yoksa veya boşsa işlemi durdur
    if (!labels || labels.length === 0 || !values || values.length === 0) {
        yorumDiv.innerText = "Veriler analiz edilirken bir hata oluştu.";
        return;
    }

    // Değerleri sayıya çevirerek en yüksek ve en düşük olanı bul
    const numericValues = values.map(v => parseFloat(v) || 0);
    const maxVal = Math.max(...numericValues);
    const minVal = Math.min(...numericValues);

    const bestIndex = numericValues.indexOf(maxVal);
    const worstIndex = numericValues.indexOf(minVal);

    // İsimleri diziden çek (Undefined kontrolü ile)
    const bestSubeName = labels[bestIndex] || "Belirlenemeyen Şube";
    const worstSubeName = labels[worstIndex] || "Belirlenemeyen Şube";

    const farkYuzde = minVal > 0
        ? Math.round(((maxVal - minVal) / minVal) * 100)
        : 0;

    let yorum = "";

    // Metrik tipine göre şube ismini yerleştirerek yorumu oluştur
    if (currentMetric === "satis") {
        yorum = `${bestSubeName} şubesi, toplam satışlarda diğer şubelere kıyasla %${farkYuzde} daha yüksek performans göstermiştir. <br>
                 ${worstSubeName} şubesinde satış hacmi görece düşüktür; kampanya önerilir.`;
    } else if (currentMetric === "adet") {
        yorum = `${bestSubeName} şubesi en yüksek ürün satış adedine sahiptir. <br>
                 ${worstSubeName} şubesinde ürün sirkülasyonu düşüktür; ürün çeşitliliği artırılabilir.`;
    } else if (currentMetric === "sepet") {
        yorum = `${bestSubeName} şubesinde ortalama sepet tutarı daha yüksektir. <br>
                 ${worstSubeName} şubesinde çapraz satış (bundle) stratejileri uygulanabilir.`;
    }

    yorumDiv.innerHTML = yorum;
}

// KATEGORİ AYLIK SATIŞ
let kategoriAylikChart = null;

function loadKategoriAylikGrafik() {
    fetch(`${API_BASE}/analiz/kategori-aylik`)
        .then(res => res.json())
        .then(data => {

            const kategoriler = [...new Set(data.map(x => x.kategori))];
            const aylar = [...new Set(data.map(x => x.ay))];

            const datasets = kategoriler.map(kat => ({
                label: kat,
                data: aylar.map(ay => {
                    const row = data.find(r => r.ay == ay && r.kategori == kat);
                    return row ? row.toplam_satis : 0;
                }),
                borderWidth: 2,
                tension: 0.3
            }));

            const ctx = document.getElementById("kategoriAylikChart").getContext("2d");

            if (kategoriAylikChart) kategoriAylikChart.destroy();

            kategoriAylikChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: aylar,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        })
        .catch(err => console.error("Kategori aylık satış hatası:", err));
}

let aktifMaliyetFiltreleri = {
    iscilik: true,
    lojistik: true,
    diger: true
};

let maliyetHamData = null;

// MÜŞTERİ TREND
let musteriChart = null;

function loadSubeMusteriTrend() {
    fetch(`${API_BASE}/analiz/musteri-trend`)
        .then(res => res.json())
        .then(data => {

            const aylar = [...new Set(data.map(row => row.ay))];

            const subeler = {
                1: { label: "Starbucks Kordon", data: [] },
                2: { label: "Starbucks Küçükpark", data: [] },
                3: { label: "Starbucks Karşıyaka Çarşı", data: [] },
                4: { label: "Starbucks Optimum", data: [] },
                5: { label: "Starbucks Buca", data: [] }
            };

            data.forEach(row => {
                subeler[row.sube_id].data.push(row.musteri_sayisi);
            });

            const renkler = [
                "#3b82f6",
                "#ec4899",
                "#f97316",
                "#22c55e",
                "#8b5cf6"
            ];

            const datasets = Object.values(subeler).map((sube, index) => ({
                label: sube.label,
                data: sube.data,
                borderColor: renkler[index],
                borderWidth: 2,
                tension: 0.4,
                fill: false
            }));

            const ctx = document.getElementById("musteriTrendChart").getContext("2d");

            if (musteriChart) musteriChart.destroy();

            musteriChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: aylar,
                    datasets: datasets
                }
            });
            // GENEL GELECEK DÖNEM ÖNERİSİ
            const oneriDiv = document.getElementById("musteri-gelecek-oneri");
            if (!oneriDiv) return;

            // tüm şubelerin müşteri verilerini dizi olarak topla
            const tumSubelerData = Object.values(subeler).map(s => s.data);

            // tek ve genel karar metni üret
            const genelOneri = musteriGenelGelecekOnerisi(aylar, tumSubelerData);

            oneriDiv.innerHTML = `
    <div class="kds-oneri-box">
        ${genelOneri}
    </div>
`;

        })
        .catch(err => console.error("Müşteri trend hata:", err));
}

//maliyet trend //

let maliyetToplamChart = null;
let maliyetSubeChart = null;
let aktifMaliyetKatmanlari = { iscilik: true, lojistik: true, diger: true };

function loadMaliyetTrend() {
    fetch(`${API_BASE}/analiz/maliyet-trend`)
        .then(res => res.json())
        .then(data => {
            const toplam = data.toplam;
            const subeler = data.subeler;

            const aylar = toplam.map(x => x.ay);

            // FİLTRELEME MANTIĞI 

            const filtrelenmişDegerler = toplam.map(x => {
                let toplamSatir = 0;
                if (aktifMaliyetKatmanlari.iscilik) toplamSatir += (x.toplam_maliyet * 0.5);
                if (aktifMaliyetKatmanlari.lojistik) toplamSatir += (x.toplam_maliyet * 0.3);
                if (aktifMaliyetKatmanlari.diger) toplamSatir += (x.toplam_maliyet * 0.2);
                return Math.round(toplamSatir);
            });

            // 1) GENEL TOPLAM MALİYET GRAFİĞİ
            const ctxToplam = document.getElementById("maliyetToplamChart").getContext("2d");

            if (maliyetToplamChart) maliyetToplamChart.destroy();

            maliyetToplamChart = new Chart(ctxToplam, {
                type: "line",
                data: {
                    labels: aylar,
                    datasets: [{
                        label: "Seçili Maliyet Kalemleri Toplamı",
                        data: filtrelenmişDegerler,
                        borderColor: "#dc2626",
                        backgroundColor: "rgba(220, 38, 38, 0.1)",
                        fill: true,
                        borderWidth: 3,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            document.getElementById("maliyetYorum").innerText =
                yorumUretMaliyet(aylar, filtrelenmişDegerler);

            // 2) ŞUBE BAZLI MALİYET KARŞILAŞTIRMASI
            const renkler = ["#3b82f6", "#ec4899", "#f97316", "#22c55e", "#8b5cf6"];
            const subeGruplari = {};

            subeler.forEach(row => {
                if (!subeGruplari[row.sube_adi]) {
                    subeGruplari[row.sube_adi] = [];
                }

                // Şube grafiklerine de filtreyi uygula
                let subeSatirMaliyet = 0;
                if (aktifMaliyetKatmanlari.iscilik) subeSatirMaliyet += (row.toplam_maliyet * 0.5);
                if (aktifMaliyetKatmanlari.lojistik) subeSatirMaliyet += (row.toplam_maliyet * 0.3);
                if (aktifMaliyetKatmanlari.diger) subeSatirMaliyet += (row.toplam_maliyet * 0.2);

                subeGruplari[row.sube_adi].push(Math.round(subeSatirMaliyet));
            });

            const datasets = Object.keys(subeGruplari).map((subeAdi, i) => ({
                label: subeAdi,
                data: subeGruplari[subeAdi],
                borderColor: renkler[i % renkler.length],
                borderWidth: 2,
                tension: 0.4
            }));

            const ctxSube = document.getElementById("maliyetSubeChart").getContext("2d");
            if (maliyetSubeChart) maliyetSubeChart.destroy();

            maliyetSubeChart = new Chart(ctxSube, {
                type: "line",
                data: {
                    labels: aylar,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

        })
        .catch(err => console.error("Maliyet trend hatası:", err));
}

// Checkbox tıklandığında çalışacak olan yardımcı fonksiyon
function toggleMaliyetLayer(tur, element) {
    aktifMaliyetKatmanlari[tur] = element.checked;
    loadMaliyetTrend();
}

let kanalPieChart = null;
let kanalPuanPieChart = null;
let kanalTrendChart = null;

function loadKanalAnaliz() {
    fetch(`${API_BASE}/analiz/kanal-satis`)
        .then(res => res.json())
        .then(data => {

            // 1) TOPLAM SATIŞ PASTA GRAFİĞİ

            const toplamLabels = data.toplam.map(x => x.kanal_adi);
            const toplamValues = data.toplam.map(x => x.toplam_satis);

            const ctxPie = document.getElementById("kanalPieChart").getContext("2d");
            if (kanalPieChart) kanalPieChart.destroy();

            kanalPieChart = new Chart(ctxPie, {
                type: "pie",
                data: {
                    labels: toplamLabels,
                    datasets: [{
                        data: toplamValues
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });

            document.getElementById("yorum-kanal").innerText =
                yorumUretKanal(data.toplam);

            //ORTALAMA PUAN PIE CHART

            fetch(`${API_BASE}/analiz/kanal-ortalama-puan`)
                .then(res => res.json())
                .then(puanData => {

                    const labels = puanData.map(x => x.kanal_adi);
                    const values = puanData.map(x => x.ortalama_puan);

                    const ctx = document
                        .getElementById("kanalPuanPieChart")
                        .getContext("2d");

                    if (kanalPuanPieChart) kanalPuanPieChart.destroy();

                    kanalPuanPieChart = new Chart(ctx, {
                        type: "pie",
                        data: {
                            labels,
                            datasets: [{
                                data: values,
                                backgroundColor: [
                                    "#3b82f6",
                                    "#ef4444",
                                    "#22c55e",
                                    "#f59e0b",
                                    "#8b5cf6"
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: (ctx) =>
                                            `${ctx.label}: ⭐ ${ctx.parsed}`
                                    }
                                }
                            }
                        }
                    });

                    document.getElementById("yorum-kanal-puan").innerText =
                        yorumUretKanalPuan(puanData);
                })
                .catch(err =>
                    console.error("Ortalama puan pie chart hatası:", err)
                );

            //AYLIK TREND GRAFİĞİ

            const aylar = [...new Set(data.trend.map(x => x.ay))];

            const kanalMap = {};
            data.trend.forEach(r => {
                if (!kanalMap[r.kanal_adi]) kanalMap[r.kanal_adi] = [];
                kanalMap[r.kanal_adi].push(r.toplam_satis);
            });

            const renkler = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"];

            const datasets = Object.keys(kanalMap).map((kanal, i) => ({
                label: kanal,
                data: kanalMap[kanal],
                borderColor: renkler[i % renkler.length],
                borderWidth: 2,
                tension: 0.4,

                pointRadius: 4,
                pointHoverRadius: 6,
                pointHitRadius: 1,
                hitRadius: 1,
                hoverRadius: 6
            }));

            const ctxTrend = document.getElementById("kanalTrendChart").getContext("2d");
            if (kanalTrendChart) kanalTrendChart.destroy();

            kanalTrendChart = new Chart(ctxTrend, {
                type: "line",
                data: { labels: aylar, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    devicePixelRatio: 1,
                    interaction: {
                        mode: "nearest",
                        intersect: true,
                        axis: "x"
                    },

                    plugins: {
                        legend: {
                            position: "top",
                            labels: { padding: 20, boxWidth: 18 }
                        },
                        tooltip: {
                            enabled: true,
                            mode: "nearest",
                            intersect: true
                        }
                    },

                    scales: { y: { beginAtZero: false } }
                }
            });

            // 3) KANAL İSTATİSTİKLERİ (kartlar)

            if (data.toplam && data.toplam.length > 0) {
                const enCok = data.toplam[0];
                const enAz = data.toplam[data.toplam.length - 1];

                document.getElementById("kanal-en-cok").innerText =
                    `${enCok.kanal_adi} – ${enCok.toplam_satis} adet`;

                document.getElementById("kanal-en-az").innerText =
                    `${enAz.kanal_adi} – ${enAz.toplam_satis} adet`;
            }

            // Trend artış hesaplama
            const kanalArtis = {};

            data.trend.forEach(r => {
                if (!kanalArtis[r.kanal_adi]) {
                    kanalArtis[r.kanal_adi] = { ilk: r.toplam_satis, son: r.toplam_satis };
                } else {
                    kanalArtis[r.kanal_adi].son = r.toplam_satis;
                }
            });

            let artisKanal = "-";
            let artisDeger = -Infinity;

            Object.keys(kanalArtis).forEach(k => {
                const fark = kanalArtis[k].son - kanalArtis[k].ilk;
                if (fark > artisDeger) {
                    artisDeger = fark;
                    artisKanal = k;
                }
            });

            document.getElementById("kanal-artis").innerText =
                artisDeger > -Infinity
                    ? `${artisKanal} – +${artisDeger} artış`
                    : "-";

        })
        .catch(err => console.error("Kanal analizi hatası:", err));
}

let tahminSatisChart = null;
let tahminMusteriChart = null;
let tahminMaliyetChart = null;

let karAylikChart = null;
let karSubeChart = null;

function loadTahminler() {
    fetch(`${API_BASE}/analiz/tahmin`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("tahmin-satis").innerText =
                data.tahmini_satis.toLocaleString("tr-TR") + " ₺";

            document.getElementById("tahmin-musteri").innerText =
                data.tahmini_musteri.toLocaleString("tr-TR") + " kişi";

            document.getElementById("tahmin-maliyet").innerText =
                data.tahmini_maliyet.toLocaleString("tr-TR") + " ₺";

            // 6 AY etiketleri
            const labels6Ay = ["Ay 1", "Ay 2", "Ay 3", "Ay 4", "Ay 5", "Ay 6"];

            // === 6 Aylık Satış Tahmini Grafiği ===
            if (tahminSatisChart) {
                tahminSatisChart.destroy();
            }

            tahminSatisChart = new Chart(
                document.getElementById("tahminSatis6AyChart"),
                {
                    type: "line",
                    data: {
                        labels: labels6Ay,
                        datasets: [{
                            label: "Satış Tahmini",
                            data: data.satis_6ay,
                            borderColor: "#006241",
                            borderWidth: 2,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                }
            );

            // 6 Aylık Müşteri Tahmini Grafiği
            if (tahminMusteriChart) {
                tahminMusteriChart.destroy();
            }

            tahminMusteriChart = new Chart(
                document.getElementById("tahminMusteri6AyChart"),
                {
                    type: "line",
                    data: {
                        labels: labels6Ay,
                        datasets: [{
                            label: "Müşteri Tahmini",
                            data: data.musteri_6ay,
                            borderColor: "#1d4ed8",
                            borderWidth: 2,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                }
            );


            // 6 Aylık Maliyet Tahmini Grafiği
            if (tahminMaliyetChart) {
                tahminMaliyetChart.destroy();
            }

            tahminMaliyetChart = new Chart(
                document.getElementById("tahminMaliyet6AyChart"),
                {
                    type: "line",
                    data: {
                        labels: labels6Ay,
                        datasets: [{
                            label: "Maliyet Tahmini",
                            data: data.maliyet_6ay,
                            borderColor: "#dc2626",
                            borderWidth: 2,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                }
            );

        })
        .catch(err => console.error("Tahmin verisi hatası:", err));
}


function loadKarAnalizi(subeId = 0) {

    fetch(`${API_BASE}/analiz/kar?sube_id=${subeId}`)
        .then(res => res.json())
        .then(data => {

            // AYLIK KÂR GRAFİĞİ
            const aylar = data.aylik.map(x => x.ay);
            const karlar = data.aylik.map(x => x.kar);
            if (karAylikChart) karAylikChart.destroy();
            karAylikChart = new Chart(
                document.getElementById("karAylikChart"),
                {
                    type: "line",
                    data: {
                        labels: aylar,
                        datasets: [{
                            label: "Aylık Kâr",
                            data: karlar,
                            borderColor: "#16a34a",
                            borderWidth: 3,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                }
            );

            //ŞUBEYE GÖRE KÂ
            const subeler = data.subeler.map(x => x.sube_adi);
            const subeKar = data.subeler.map(x => x.kar);

            if (karSubeChart) karSubeChart.destroy();

            karSubeChart = new Chart(
                document.getElementById("karSubeChart"),
                {
                    type: "bar",
                    data: {
                        labels: subeler,
                        datasets: [{
                            label: "Şube Kârı",
                            data: subeKar,
                            backgroundColor: "#22c55e"
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                }
            );
        })
        .catch(err => {
            console.error("Kâr analizi alınamadı:", err);
        });
}

function yorumUret(labels, values) {
    // son 3 ay trend
    const n = values.length;
    const son3 = values.slice(n - 3);
    const artis = son3[2] > son3[0];
    const dusus = son3[2] < son3[0];
    const yazVar = labels.includes("2025-06") && labels.includes("2025-08");
    if (artis && yazVar) {
        return "Haziran–Ağustos döneminde satışlarda belirgin artış gözlenmiştir. Mevsimsel etki olduğu değerlendirilmektedir.";
    }
    if (dusus) {
        return "Son dönemde satışlarda düşüş eğilimi görülmektedir. Kampanya / fiyat / ürün stoğu etkileri incelenmelidir.";
    }
    return "Satışlar genel olarak stabil seyretmektedir. Trendin sürdürülmesi önerilir.";
}

function maliyetYorumUret(maliyetler, aylar) {
    let artisAylar = [];

    for (let i = 1; i < maliyetler.length; i++) {
        const artisOrani =
            (maliyetler[i] - maliyetler[i - 1]) / maliyetler[i - 1];

        if (artisOrani > 0.15) { // %15 üzeri ani artış
            artisAylar.push(aylar[i]);
        }
    }

    if (artisAylar.length > 0) {
        return `${artisAylar.join(" ve ")} aylarında maliyetlerde ani artış gözlemlenmiştir. Tedarik ve enerji giderleri incelenmelidir.`;
    } else {
        return "Maliyetlerde belirgin bir sıçrama gözlemlenmemiştir. Mevcut gider yapısı sürdürülebilir görünmektedir.";
    }
}
function loadDashboardDecisions() {
    fetch(`${API_BASE}/dss/karar-oneri?sube_id=0`)
        .then(res => res.json())
        .then(data => {

            document.getElementById("card-toplam-satis").innerText =
                data.satis_karari ?? "-";

            document.getElementById("card-musteri").innerText =
                data.musteri_karari ?? "-";

            document.getElementById("dss-kanal").innerText =
                data.kanal_karari ?? "-";

            document.getElementById("card-maliyet").innerText =
                data.maliyet_karari ?? "-";
            // TRAFFIC LIGH
            const satis = data.satis_karari?.toLowerCase() || "";
            const musteri = data.musteri_karari?.toLowerCase() || "";
            const maliyet = data.maliyet_karari?.toLowerCase() || "";

            // SATIŞ
            if (satis.includes("art")) {
                setTrafficLight("status-satis", "green", "Satışlar artıyor");
            } else if (satis.includes("düş")) {
                setTrafficLight("status-satis", "red", "Satışlarda düşüş var");
            } else {
                setTrafficLight("status-satis", "yellow", "Satışlar stabil");
            }

            // MÜŞTERİ
            if (musteri.includes("art")) {
                setTrafficLight("status-musteri", "green", "Müşteri artışı güçlü");
            } else if (musteri.includes("düş")) {
                setTrafficLight("status-musteri", "red", "Müşteri kaybı var");
            } else {
                setTrafficLight("status-musteri", "yellow", "Müşteri sayısı stabil");
            }

            // MALİYET
            if (maliyet.includes("art")) {
                setTrafficLight("status-maliyet", "red", "Maliyet riski var");
            } else if (maliyet.includes("azal")) {
                setTrafficLight("status-maliyet", "green", "Maliyetler düşüyor");
            } else {
                setTrafficLight("status-maliyet", "yellow", "Maliyetler kontrol altında");
            }
        });
}

function setTrafficLight(id, durum, metin) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove("status-green", "status-yellow", "status-red");

    if (durum === "green") el.classList.add("status-green");
    if (durum === "yellow") el.classList.add("status-yellow");
    if (durum === "red") el.classList.add("status-red");

    const p = el.querySelector("p");
    if (p) p.innerText = metin;
}

function yorumUretSatis(labels, values) {
    const n = values.length;
    if (n < 2) return "Yeterli veri yok.";

    const ilk = values[0];
    const son = values[n - 1];
    if (ilk === 0) return "Başlangıç satış değeri 0 olduğu için trend hesaplanamadı.";

    const oran = (son - ilk) / ilk;

    if (oran > 0.10) return "Satışlarda güçlü artış trendi var. Stok/kapasite planı gözden geçirilebilir.";
    if (oran < -0.10) return "Satışlarda düşüş trendi var. Kampanya/fiyat/ürün karması incelenmeli.";
    return "Satışlar stabil seyrediyor. Mevcut strateji sürdürülebilir görünüyor.";
}

function yorumUretMaliyet(aylar, maliyetler) {
    if (maliyetler.length < 2) return "Yeterli maliyet verisi yok.";

    const esik = 0.15; // %15 ani artış
    const artisAylar = [];

    for (let i = 1; i < maliyetler.length; i++) {
        const onceki = maliyetler[i - 1] || 0;
        const simdiki = maliyetler[i] || 0;
        if (onceki === 0) continue;

        const oran = (simdiki - onceki) / onceki;
        if (oran > esik) artisAylar.push(aylar[i]);
    }

    if (artisAylar.length > 0) {
        return `${artisAylar.join(", ")} döneminde maliyetlerde ani artış tespit edildi. Tedarik/enerji giderleri analiz edilmeli.`;
    }

    return "Maliyetlerde olağan dışı sıçrama görülmedi. Gider yapısı kontrol altında.";
}

function yorumUretKanal(toplamArr) {
    if (!toplamArr || toplamArr.length < 2) return "Kanal verisi yetersiz.";

    const enCok = toplamArr[0];
    const enAz = toplamArr[toplamArr.length - 1];

    return `${enCok.kanal_adi} kanalında satışlar en yüksek. ${enAz.kanal_adi} kanalında satışlar düşük; iyileştirme/teşvik önerilir.`;
}

function onSubeChange() {
    const subeId = document.getElementById("subeFiltre").value;

    loadDashboardData(subeId);
}

function onAylikSubeChange() {
    const subeId = document.getElementById("aylikSubeFiltre").value;
    loadAylikSatisPage(subeId);
}

function yorumUretKanalPuan(puanArr) {
    if (!puanArr || puanArr.length < 2) return "Yeterli puan verisi bulunmamaktadır.";

    // yüksekten düşüğe sırala
    const sirali = [...puanArr].sort((a, b) => b.ortalama_puan - a.ortalama_puan);

    const enIyi = sirali[0];
    const enDusuk = sirali[sirali.length - 1];

    return `${enIyi.kanal_adi} ve benzeri kanallarda müşteri memnuniyeti yüksektir. 
${enDusuk.kanal_adi} kanalında ortalama puan görece düşüktür; hizmet süresi, paketleme ve teslimat kalitesi gözden geçirilebilir.`;
}

const ctxBar = document.getElementById("monthlyCategoryChart").getContext("2d");

let barChart = new Chart(ctxBar, {
    type: "bar",
    data: {
        labels: ["Sandviç", "Sıcak İçecek", "Soğuk İçecek", "Tatlı"],
        datasets: [{
            label: "Kategori Satışları",
            data: [0, 0, 0, 0],
            backgroundColor: ["#5d77c2ff", "#b38581ff", "#e8ce8aff", "#7ad0ddff"]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (ctx) {
                        return ctx.raw.toLocaleString() + " ₺";
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
let globalKategoriData = [];
async function fetchKategoriAylikData() {
    try {
        const response = await fetch(`${API_BASE}/analiz/kategori-aylik`);
        globalKategoriData = await response.json();
    } catch (err) {
        console.error("Kategori verisi çekilemedi:", err);
    }
}

// Seçilen aya göre grafiği ve yorumu güncelleyen ana fonksiyon
document.getElementById("monthSelect").addEventListener("change", async function () {
    const selectedMonthIndex = this.value; // 0, 1, 2...
    if (selectedMonthIndex === "") return;

    // 1) Veritabanından güncel kategori verilerini çek
    let categoryData = [];
    try {
        const response = await fetch(`${API_BASE}/analiz/kategori-aylik`);
        categoryData = await response.json();
    } catch (err) {
        console.error("Veri çekme hatası:", err);
        return;
    }
    // 2) Ay formatı
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const monthMap = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const targetMonth = "2025-" + monthMap[selectedMonthIndex];

    const categories = ["Sandviç", "Sıcak İçecek", "Soğuk İçecek", "Tatlı"];

    // 3) Verileri eşleştirme
    const filteredValues = categories.map(cat => {
        const row = categoryData.find(d => d.ay === targetMonth && d.kategori === cat);
        return row ? parseInt(row.toplam_satis) : 0;
    });

    // 4) Grafiği Güncelle
    barChart.data.datasets[0].data = filteredValues;
    barChart.data.datasets[0].label = monthNames[selectedMonthIndex] + " Ayı Satış Adetleri";
    barChart.update();

    // 5) Otomatik Analiz ve Karar Destek Metni Üret
    const yorumDiv = document.getElementById("kategori-dinamik-yorum");
    if (!yorumDiv) return;

    const maxVal = Math.max(...filteredValues);
    const enCokSatan = categories[filteredValues.indexOf(maxVal)];
    const toplamAdet = filteredValues.reduce((a, b) => a + b, 0);

    let oneri = "";
    if (enCokSatan === "Sıcak İçecek") {
        oneri = "Kış sezonu etkisiyle sıcak içecek talebi yüksektir. Kahve çekirdeği stokları %15 artırılmalı ve 'Tatlı-Kahve' ikili menüleri öne çıkarılmalıdır.";
    } else if (enCokSatan === "Soğuk İçecek") {
        oneri = "Yaz sezonu geçişi nedeniyle soğuk içecek operasyonu yoğunlaşmıştır. Buz makinesi bakımları yapılmalı ve soğuk zincir tedariği sıkılaştırılmalıdır.";
    } else {
        oneri = "Gıda grubu satışları stabil seyretmektedir. İsrafı önlemek için 'Son Saat İndirimleri' uygulanarak ciro artırılabilir.";
    }

    yorumDiv.innerHTML = `
        <div style="background: #f0fdf4; border-left: 5px solid #006241; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <strong>🔍 ${monthNames[selectedMonthIndex]} Ayı Otomatik Analizi:</strong><br>
            Veritabanı kayıtlarına göre bu ay toplam <strong>${toplamAdet} adet</strong> ürün satılmıştır. <br>
            Lider kategori: <strong>${enCokSatan}</strong> (${maxVal} adet). <br><br>
            <strong>💡 KDS Karar Önerisi:</strong> ${oneri}
        </div>
    `;
});

function musteriGenelGelecekOnerisi(labels, tumSubelerData) {

    // son 3 ay ortalama müşteri sayısı
    const sonAylar = tumSubelerData.map(arr => arr.slice(-3));
    const ortalamalar = sonAylar.map(arr =>
        arr.reduce((a, b) => a + b, 0) / arr.length
    );

    const artisVar = ortalamalar.some((v, i, arr) =>
        i > 0 && v > arr[i - 1]
    );

    const dususVar = ortalamalar.some((v, i, arr) =>
        i > 0 && v < arr[i - 1]
    );

    if (artisVar && !dususVar) {
        return `
📈 <strong>Gelecek Dönem Müşteri Öngörüsü:</strong><br>
Şubeler genelinde müşteri sayısında artış eğilimi gözlemlenmektedir.
Önümüzdeki dönemde yoğun saatlerde personel planlaması optimize edilmeli,
hızlı servis ve mobil sipariş kanalları desteklenmelidir.
        `;
    }

    if (dususVar && !artisVar) {
        return `
📉 <strong>Gelecek Dönem Müşteri Öngörüsü:</strong><br>
Müşteri trafiğinde genel bir yavaşlama eğilimi tespit edilmiştir.
Saat bazlı kampanyalar, sadakat programları ve bundle menüler
ile talep artırıcı aksiyonlar önerilmektedir.
        `;
    }

    return `
➖ <strong>Gelecek Dönem Müşteri Öngörüsü:</strong><br>
Müşteri trafiği genel olarak stabil seyretmektedir.
Mevcut operasyon yapısı korunmalı, çapraz satış stratejileri
(kahve + tatlı) ile sepet tutarı artırılmalıdır.
    `;
}


function runSimulation() {
    const satisDegisim = parseFloat(document.getElementById('slider-satis').value);
    const maliyetDegisim = parseFloat(document.getElementById('slider-maliyet').value);

    document.getElementById('val-satis').innerText = (satisDegisim > 0 ? "+" : "") + satisDegisim + "%";
    document.getElementById('val-maliyet').innerText = (maliyetDegisim > 0 ? "+" : "") + maliyetDegisim + "%";

    const mevcutSatis = parseFloat(document.getElementById('card-toplam-satis').innerText.replace(/[^0-9]/g, "")) || 1000000;
    const mevcutMaliyet = parseFloat(document.getElementById('card-maliyet').innerText.replace(/[^0-9]/g, "")) || 700000;

    const yeniSatis = mevcutSatis * (1 + satisDegisim / 100);
    const yeniMaliyet = mevcutMaliyet * (1 + maliyetDegisim / 100);
    const yeniKar = yeniSatis - yeniMaliyet;
    const eskiKar = mevcutSatis - mevcutMaliyet;
    const fark = yeniKar - eskiKar;

    const resultDiv = document.getElementById('sim-profit-result');
    const resultBox = document.getElementById('sim-result-box');
    const adviceP = document.getElementById('sim-advice');

    resultDiv.innerText = (fark > 0 ? "+" : "") + Math.round(fark).toLocaleString() + " ₺";

    if (fark > 0) {
        resultBox.style.background = "#e6f4ea";
        resultDiv.style.color = "#1e8e3e";
        adviceP.innerText = "✅ Bu senaryo karlılığı artırıyor. Operasyonel olarak desteklenebilir.";
    } else if (fark < 0) {
        resultBox.style.background = "#fce8e6";
        resultDiv.style.color = "#d93025";
        adviceP.innerText = "⚠️ Bu senaryo zarar riski taşıyor. Maliyet kontrolü şart!";
    } else {
        resultBox.style.background = "#eee";
        resultDiv.style.color = "#333";
        adviceP.innerText = "Nötr durum.";
    }
}

// Simülasyon verisini güncelleyen bağımsız fonksiyon
function refreshSimulationData(subeId = 0) {
    fetch(`${API_BASE}/analiz/aylik-satis?sube_id=${subeId}`)
        .then(res => res.json())
        .then(data => {
            // Toplam yıllık ciroyu hesaplama
            simulasyonVerisi = data.reduce((toplam, ay) => toplam + ay.toplam_satis, 0);

            // Veri güncellendiği anda arayüzdeki rakamları ve simülasyonu tazeleme
            updateWhatIf();
        })
        .catch(err => console.error("Simülasyon verisi çekilirken hata:", err));
}

let simulasyonVerisi = 0; // Gerçek ciro

function updateWhatIf() {
    const zam = parseFloat(document.getElementById('slider-zam').value);
    const churn = parseFloat(document.getElementById('slider-churn').value);

    // Etiketleri Güncelle
    document.getElementById('val-zam').innerText = `%${zam}`;
    document.getElementById('val-churn').innerText = `%${churn}`;

    // HESAPLAMA MANTIĞI
    // Yeni Ciro = Mevcut Ciro * (1 + Zam/100) * (1 - Churn/100)
    const yeniCiro = simulasyonVerisi * (1 + zam / 100) * (1 - churn / 100);
    const fark = yeniCiro - simulasyonVerisi;
    const varyasyon = simulasyonVerisi > 0 ? (fark / simulasyonVerisi) * 100 : 0;

    // UI Güncelleme
    const badge = document.getElementById('badge-container');
    const reportEl = document.getElementById('report-text');

    document.getElementById('res-fark').innerText =
        (fark >= 0 ? "+" : "-") + Math.abs(Math.round(fark)).toLocaleString('tr-TR') + " ₺";

    document.getElementById('res-varyasyon').innerText = `%${varyasyon.toFixed(1)} Varyasyon`;

    // Alt kartlar (Tam rakam gösterimi: 47.125.000 ₺)
    document.getElementById('curr-val').innerText = Math.round(simulasyonVerisi).toLocaleString('tr-TR') + " ₺";
    document.getElementById('new-val').innerText = Math.round(yeniCiro).toLocaleString('tr-TR') + " ₺";

    // Rapor ve Renk Yönetimi
    if (fark > 0) {
        badge.style.background = "#006241"; // Starbucks Yeşili
        reportEl.innerHTML = `<strong>Uygulanabilir Senaryo:</strong> %${zam} zam yapıldığında beklenen %${churn} müşteri kaybına rağmen yıllık cironuzda <strong>${Math.round(fark).toLocaleString('tr-TR')} ₺</strong> artış öngörülüyor.`;
    } else if (fark < 0) {
        badge.style.background = "#d93025"; // Negatifse Kırmızı
        reportEl.innerHTML = `<strong>Kritik Uyarı:</strong> %${churn} oranındaki müşteri kaybı, yapılan zammın etkisini tamamen yok ediyor. Yıllık <strong>${Math.round(Math.abs(fark)).toLocaleString('tr-TR')} ₺</strong> kayıp riski tespit edildi.`;
    } else {
        badge.style.background = "#555";
        reportEl.innerText = "Stratejik kararların etkisini görmek için sürgüleri hareket ettirin.";
    }
}

async function loadKdsStrategicCards(subeId = 0) {
    try {
        // 1) SATIŞ VERİSİ
        const resSatis = await fetch(`${API_BASE}/analiz/aylik-satis?sube_id=${subeId}`);
        const satisData = await resSatis.json();

        const yillikSatis = satisData.reduce((sum, x) => sum + Number(x.toplam_satis || 0), 0);
        document.getElementById("val-satis-yillik").innerText = Math.round(yillikSatis).toLocaleString("tr-TR") + " ₺";

        if (satisData.length >= 2) {
            const buAySatis = Number(satisData[satisData.length - 1].toplam_satis || 0);
            const gecenAySatis = Number(satisData[satisData.length - 2].toplam_satis || 0);
            renderKdsTrend("trend-satis-v2", buAySatis, gecenAySatis, true);
        }

        // 2) KÂR VE VERİMLİLİK VERİSİ
        const resKar = await fetch(`${API_BASE}/analiz/kar?sube_id=${subeId}`);
        const karData = await resKar.json();

        if (karData.aylik && karData.aylik.length >= 2) {
            const aylik = karData.aylik;
            const buAy = aylik[aylik.length - 1];
            const gecenAy = aylik[aylik.length - 2];

            // Kâr Hesaplama
            const yillikKar = aylik.reduce((sum, x) => sum + Number(x.kar || 0), 0);
            document.getElementById("val-kar-yillik").innerText = Math.round(yillikKar).toLocaleString("tr-TR") + " ₺";
            renderKdsTrend("trend-kar-v2", Number(buAy.kar || 0), Number(gecenAy.kar || 0), true);

            // Verimlilik Hesaplama (Maliyet / Satış)
            const vBuAy = (Number(buAy.toplam_maliyet || 0) / Number(buAy.toplam_satis || 1)) * 100;
            const vGecenAy = (Number(gecenAy.toplam_maliyet || 0) / Number(gecenAy.toplam_satis || 1)) * 100;

            document.getElementById("val-verimlilik-yillik").innerText = "%" + vBuAy.toFixed(1);
            // Verimlilikte DÜŞÜŞ iyidir (isUpGood = false)
            renderKdsTrend("trend-verimlilik-v2", vBuAy, vGecenAy, true);
        }

        // 3) NPS (MÜŞTERİ MEMNUNİYETİ)
        const resPuan = await fetch(`${API_BASE}/analiz/kanal-ortalama-puan`);
        const puanData = await resPuan.json();

        if (puanData && puanData.length > 0) {
            const ortPuanBuAy = puanData.reduce((s, x) => s + Number(x.ortalama_puan || 0), 0) / puanData.length;
            const hedefPuan = 4.0; // Karşılaştırma baz puanı

            document.getElementById("val-nps-yillik").innerText = ortPuanBuAy.toFixed(1) + " / 5.0";
            // NPS artışı iyidir (isUpGood = true)
            renderKdsTrend("trend-nps-v2", ortPuanBuAy, hedefPuan, true);
        }

    } catch (err) {
        console.error("KDS stratejik kartlar yüklenirken hata oluştu:", err);
    }
}
// Yeni Sistem İçin Trend Fonksiyonu
function renderKdsTrend(containerId, current, previous, isUpGood) {
    const container = document.getElementById(containerId);
    if (!container) return;

    current = Number(current || 0);
    previous = Number(previous || 0);

    // Eğer veri yoksa veya değerler eşitse trendi gizle veya nötr yap
    if (previous === 0 || current === previous) {
        container.innerHTML = `<span class="kds-trend-percent">%0.0 stabil</span>`;
        container.className = "kds-trend-container"; // Nötr renk
        return;
    }

    const diff = ((current - previous) / Math.abs(previous)) * 100;
    const isUp = current > previous;

    const arrow = isUp ? "▲" : "▼";
    const trendText = isUp ? "artış" : "düşüş";

    container.innerHTML = `
        <span class="kds-trend-arrow">${arrow}</span>
        <span class="kds-trend-percent">%${Math.abs(diff).toFixed(1)} ${trendText}</span>
    `;

    //REnk

    const isActuallyGood = (isUp && isUpGood) || (!isUp && !isUpGood);

    if (isActuallyGood) {
        container.className = "kds-trend-container kds-positive"; // Yeşil
    } else {
        container.className = "kds-trend-container kds-negative"; // Kırmızı
    }
}

let kategoriDonutChart = null;

function loadKategoriDonutDashboard() {
    const labels = ["Sıcak İçecek", "Soğuk İçecek", "Tatlı", "Sandviç"];
    const values = [42, 25, 18, 15];

    const ctx = document
        .getElementById("kategoriDonutChart")
        .getContext("2d");

    if (kategoriDonutChart) kategoriDonutChart.destroy();

    kategoriDonutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#15803d", // sıcak
                    "#14532d", // soğuk
                    "#f59e0b", // tatlı
                    "#eab308"  // sandviç
                ],
                borderWidth: 4,
                borderColor: "#fff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: %${ctx.parsed}`
                    }
                }
            }
        }
    });
}

function logout() {
    // URL'i temizle
    history.pushState({}, "", "/");

    // Dashboard'u kapat
    document.getElementById("dashboard").style.display = "none";

    // Login ekranını aç
    document.getElementById("login-screen").style.display = "flex";
}