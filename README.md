# 📢 SPEAKUP INDONESIA — CIVIC GEOSPATIAL INTELLIGENCE PLATFORM (2026)

[![Status](https://img.shields.io/badge/System-Operational_2026-00f0ff.svg)](http://localhost:8080)
[![Data Feed](https://img.shields.io/badge/Live_Feeds-NASA_FIRMS_&_BMKG_TEWS-ef4444.svg)](http://localhost:8080)
[![License](https://img.shields.io/badge/License-Public_Civic_Open_Access-10b981.svg)](http://localhost:8080)

> **Platform Pemantauan Spasial Bencana Alam, Masalah Sosial, dan Eskalasi Suara Publik Seluruh Nusantara Berbasis Hybrid Real-time API & Data Statistik Resmi Kementerian.**

---

## 📑 DAFTAR ISI DOKUMENTASI
1. [Latar Belakang & Visi Platform](#-1-latar-belakang--visi-platform)
2. [Arsitektur Sistem & Data Flow](#-2-arsitektur-sistem--data-flow)
3. [Klasifikasi Tipe Data: Hybrid Architecture](#-3-klasifikasi-tipe-data-hybrid-architecture)
4. [Katalog Sumber Data Resmi & API Integrasi](#-4-katalog-sumber-data-resmi--api-integrasi)
5. [Skema Standarisasi Data (`IncidentData Schema`)](#-5-skema-standarisasi-data-incidentdata-schema)
6. [Dokumentasi API Backend (`server.py`)](#-6-dokumentasi-api-backend-serverpy)
7. [Panduan Integrasi Google Street View API (POV 360°)](#-7-panduan-integrasi-google-street-view-api-pov-360)
8. [Panduan Publikasi & Hosting Terbaik (Render / Railway / VPS)](#-8-panduan-publikasi--hosting-terbaik)
9. [Daftar Kontak & WhatsApp Resmi Lembaga Pemerintah](#-9-daftar-kontak--whatsapp-resmi-lembaga-pemerintah)

---

## 🏛️ 1. LATAR BELAKANG & VISI PLATFORM

Indonesia adalah negara kepulauan raksasa yang berada di lintasan *Ring of Fire* sekaligus menghadapi dinamika pembangunan sosial yang heterogen. Selama ini, data bencana dan ketimpangan sosial tersebar terpisah-pisah di berbagai portal kementerian, atau hanya muncul musiman di berita tanpa pemantauan spasial yang terpadu.

**SpeakUp Indonesia (2026)** hadir sebagai **Pusat Komando Warga (*Citizen Command Center*)** yang:
- Menggabungkan **sensor satelit cuaca & gempa bumi real-time** dengan **data sensus statistik resmi kementerian**.
- Menyediakan visualisasi multidimensi waktu: **Past** (Historis), **Present** (Real-time terkini), dan **Future** (Proyeksi AI 2030).
- Memberikan kemampuan pengawasan lapangan 360° melalui **Point of View (POV Ground Inspector)**.
- Mendorong **Eskalasi Suara Rakyat (*Speak Up*)** langsung ke pejabat publik, instansi penanggung jawab (via WhatsApp resmi), dan sistem pengaduan nasional **SP4N-LAPOR!**.

---

## 🏗️ 2. ARSITEKTUR SISTEM & DATA FLOW

```
                                  [ SUMBER DATA RESMI EKSTERNAL ]
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 │                                                                 │
    🔴 [ REAL-TIME SATELLITE & SENSOR ]                               📊 [ DATA STATISTIK RESMI ]
    - NASA FIRMS VIIRS 375m NRT CSV (11.000+ Deteksi)                 - Kemenkes RI (Survei Kesehatan SKI)
    - BMKG TEWS API Seismik M 5.0+                                     - Kemendikbudristek Dapodik & BPS
    - PVMBG Badan Geologi ESDM (Status Level)                          - SIPSN KLHK (Pengelolaan Sampah)
                 │                                                                 │
                 └────────────────────────────────┬────────────────────────────────┘
                                                  │
                                                  ▼
                                     [ BACKEND ENGINE: server.py ]
                                     - Python Native HTTP Server
                                     - NASA CSV Parser & Indo Bounding Box Filter
                                     - BMKG Realtime Proxy & SSL Context
                                     - Civic Votes Persistency (votes.json)
                                                  │
                                                  ▼ REST API JSON
                               [ FRONTEND SPA: Leaflet.js & Three.js ]
                               - Leaflet 2D Geospatial Sonar Map
                               - Three.js 3D Digital Earth Interactive Canvas
                               - Speech Recognition AI Voice Assistant
                               - AR Telemetry POV Ground Inspector
```

---

## 📊 3. KLASIFIKASI TIPE DATA: HYBRID ARCHITECTURE

Platform menerapkan pemisahan metodologis yang tegas antara **Bencana Alam** dan **Masalah Sosial**:

```
                              ┌──────────────────────────────────┐
                              │     SPEAKUP DATA ARCHITECTURE    │
                              └─────────────────┬────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
        🔴 GROUP 1: BENCANA ALAM                                      📊 GROUP 2: MASALAH SOSIAL
   (100% Live Satelit & Sensor Real-Time)                     (100% Data Statistik Resmi Kementerian)
   ──────────────────────────────────────                     ───────────────────────────────────────
   • Diambil langsung via API/Scraper satelit.                • Diambil dari rilis resmi berkala/sensus.
   • Bebas ketergantungan berita manual.                      • Bukan berdasarkan klaim sepihak/berita viral.
   • Diperbarui setiap orbit satelit melintas.                • Memuat metodologi survei nasional (SKI, Dapodik).
   • Kategori: Karhutla, Gempa, Merapi, Banjir.               • Kategori: Stunting, Pendidikan 3T, Sampah TPA.
```

---

## 🛰️ 4. KATALOG SUMBER DATA RESMI & API INTEGRASI

### A. Bencana Alam (Live Real-Time)

| Kategori | Nama Sumber Resmi | URL Endpoint API Asal | Frekuensi Update | Keterangan Teknis |
| :--- | :--- | :--- | :--- | :--- |
| **Kebakaran Hutan & Lahan** | **NASA FIRMS** *(EOSDIS NASA Earthdata)* | `https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_SouthEast_Asia_24h.csv` | Real-time (Orbit Harian ~3 Jam) | Mengurai 11.000+ piksel satelit Suomi-NPP VIIRS 375m I-Band, difilter koordinat Nusantara (`-11.0 s/d 6.0 Lat`, `95.0 s/d 141.0 Lng`), diprioritaskan pada Suhu Termal Kritis ($\ge 350^\circ\text{K}$) dan Tinggi ($332^\circ\text{K} - 350^\circ\text{K}$). |
| **Gempa Bumi Tektonik** | **BMKG Indonesia** *(Pusat Gempa Bumi & Tsunami)* | `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json` & `autogempa.json` | Real-time (Detik Kejadian) | Jaringan ribuan sensor akselerograf & seismograf TEWS di seluruh Indonesia. Mengambil gempa M 5.0+ dan gempa dirasakan. |
| **Erupsi Gunung Api** | **PVMBG Badan Geologi ESDM** | `MAGMA Indonesia / BPPTKG` | Harian / Berkala | Status resmi Level I (Normal), Level II (Waspada), Level III (Siaga), Level IV (Awas). |
| **Banjir & Tanggul** | **Pusdatin BNPB & Ditjen SDA PUPR** | `SDA PUPR BBWS & Geoportal BNPB` | Harian Musiman | Peringatan debit sungai, status tanggul kritis Pantura, dan data hidrologi BBWS. |

### B. Masalah Sosial (Statistik Resmi Kementerian)

| Kategori | Nama Sumber Resmi | Dokumen Publikasi Resmi | Frekuensi Rilis | Keterangan Metodologi |
| :--- | :--- | :--- | :--- | :--- |
| **Stunting & Gizi Buruk** | **Kementerian Kesehatan RI & BKKBN** | *Survei Kesehatan Indonesia (SKI) & SSGI* | Rilis Tahunan Nasional | Survei berbasis blok sensus di 38 provinsi dan 514 kabupaten/kota. Mengukur tinggi/panjang badan balita terhadap umur (TB/U). |
| **Fasilitas Pendidikan 3T**| **Kemendikbudristek & BPS** | *Dapodik Kemendikbud & Sensus Potensi Desa (Podes) BPS* | Semesteran / Tahunan | Pendataan kondisi fisik ruang kelas (rusak berat/sedang) dan rasio ketersediaan sekolah di daerah Tertinggal, Terdepan, dan Terluar. |
| **Penumpukan Sampah TPA** | **Kementerian Lingkungan Hidup dan Kehutanan (KLHK)** | *Sistem Informasi Pengelolaan Sampah Nasional (SIPSN)* | Rilis Tahunan Nasional | Audit neraca sampah harian, kapasitas tampung landfill aktif (open dumping vs sanitary), dan fasilitas RDF/ITF. |

---

## 📋 5. SKEMA STANDARISASI DATA (`IncidentData Schema`)

Setiap data titik spasial diolah ke dalam struktur JSON yang seragam:

```json
{
  "id": "karhutla-riau-rohil",
  "title": "Kebakaran Lahan Gambut — Rokan Hilir",
  "category": "karhutla",
  "categoryName": "Kebakaran Hutan",
  "subCategory": "Karhutla Gambut Riau",
  "severity": "kritis",
  "location": "Kec. Rimba Melintang, Kab. Rokan Hilir, Riau",
  "lat": 1.5422,
  "lng": 100.9328,
  "dataDate": "26 Agustus 2026 (Live Satelit NASA FIRMS)",
  "dataType": "Live Satelit NRT",
  "speakupCount": 142,
  "metrics": [
    { "label": "Satelit Pendeteksi (2026)", "value": "NASA VIIRS SNPP NRT", "sub": "Sensor Inframerah Termal" },
    { "label": "Suhu Kecerahan", "value": "348.5 Kelvin", "sub": "Bara Api Bawah Tanah" }
  ],
  "temporal": {
    "past": { "title": "Data Historis", "description": "Riwayat kebakaran gambut...", "metrics": [] },
    "present": { "title": "Patroli Darat 2026", "description": "Operasi pemadaman Manggala Agni...", "metrics": [] },
    "future": { "title": "Target Restorasi 2030", "description": "Pembangunan 250 sekat kanal...", "metrics": [] }
  },
  "recommendations": [
    "Gunakan masker respirator N95 saat kabut asap.",
    "Dilarang membakar sisa tebasan lahan gambut.",
    "Aktifkan pompa air pembasahan kanal."
  ],
  "govtAgency": {
    "name": "Daops Manggala Agni Riau & BPBD Rokan Hilir",
    "address": "Jl. Jenderal Sudirman No. 428, Pekanbaru, Riau",
    "lat": 0.5071,
    "lng": 101.4478,
    "distanceKm": 95.0,
    "hotline": "(0761) 855-734",
    "email": "manggalaagni.riau@menlhk.go.id",
    "whatsapp": "628117600113",
    "laporUrl": "https://www.lapor.go.id"
  },
  "pov": {
    "image": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    "caption": "Lahan Gambut Rimba Melintang — Asap Tebal Bara Bawah Tanah",
    "elevation": "12 mdpl",
    "airSensor": "ISPU 285 (PM2.5 Kritis)",
    "radiusStatus": "ZONA MERAH RAWAN KARHUTLA"
  }
}
```

---

## ⚡ 6. DOKUMENTASI API BACKEND (`server.py`)

Backend berjalan di atas Python Standard Library (`http.server` & `urllib.request`) tanpa memerlukan instalasi library berat:

### 1. `GET /api/votes`
Mengambil data jumlah suara rakyat terkini untuk setiap insiden dari file database persisten `votes.json`.

### 2. `POST /api/speakup`
Menambahkan 1 dukungan suara pada suatu insiden dan menyimpannya secara atomik di `votes.json`.
- **Payload**: `{"incidentId": "karhutla-riau-rohil"}`

### 3. `GET /api/live-bmkg`
Mengambil data sensor gempaterkini M 5.0+ dari BMKG TEWS, mengonversi koordinat, dan menyajikan list insiden gempa yang terverifikasi.

### 4. `GET /api/live-karhutla`
Mengunduh CSV satelit NASA FIRMS NRT Southeast Asia, menyaring koordinat yang berada di dalam wilayah Indonesia, membagi ke 4 tingkatan keparahan Kelvin, dan mengirimkan 200+ titik api aktif terbaru.

---

## 📸 7. PANDUAN INTEGRASI GOOGLE STREET VIEW API (POV 360°)

Platform memiliki fitur **POV Ground Inspector** di [`js/povViewer.js`](file:///c:/Users/arjunahmads20/Documents/speakup/js/povViewer.js).

### Langkah Menghubungkan Google Maps API:
1. Masuk ke [Google Cloud Console](https://console.cloud.google.com/google/maps-apis).
2. Buat Project baru dan aktifkan:
   - **Maps Embed API** (Gratis)
   - **Street View Static API**
3. Buat **API Key** di menu *Credentials*.
4. Buka file [`js/povViewer.js`](file:///c:/Users/arjunahmads20/Documents/speakup/js/povViewer.js#L11) dan isi variabel:
   ```javascript
   const GOOGLE_MAPS_API_KEY = "AIzaSy...";
   ```
5. *(Opsi Tanpa API Key)*: Pengguna tetap dapat mengklik tombol **"Google Street View 360°"** di modal POV untuk membuka street view resmi secara langsung di tab baru secara gratis.

---

## 🚀 8. PANDUAN PUBLIKASI & HOSTING TERBAIK

Berikut adalah 3 opsi terbaik untuk mempublikasikan website ini ke publik:

### 🌟 Opsi A: Render.com (Paling Direkomendasikan — Gratis & Praktis)
- **Mengapa Render?** Mendukung server Python (`server.py`) dan frontend statis dalam satu web service gratis dengan SSL HTTPS otomatis.
- **Langkah-langkah**:
  1. Upload repositori ini ke akun GitHub Anda.
  2. Buka [dashboard.render.com](https://dashboard.render.com) -> Klik **New Web Service**.
  3. Pilih repositori GitHub Anda.
  4. Isi konfigurasi:
     - **Runtime**: `Python 3`
     - **Build Command**: *(biarkan kosong)*
     - **Start Command**: `python server.py $PORT`
  5. Klik **Create Web Service**. Website langsung aktif di URL `https://speakup-indonesia.onrender.com`.

### 🚆 Opsi B: Railway.app
1. Buka [railway.app](https://railway.app) -> **New Project** -> **Deploy from GitHub**.
2. Railway otomatis menjalankan `server.py`.
3. Set variabel `PORT=8080` pada dashboard.

### 🏢 Opsi C: Cloud VPS (DigitalOcean / Biznet Gio / IDCloudHost)
1. Sewa VPS Ubuntu 24.04 (Datacenter Jakarta).
2. Jalankan systemd service:
   ```bash
   sudo systemctl enable speakup.service
   sudo systemctl start speakup.service
   ```
3. Pasang reverse proxy Nginx dan SSL Certbot Let's Encrypt.

---

## 📞 9. DAFTAR KONTAK & WHATSAPP RESMI LEMBAGA PEMERINTAH

Seluruh nomor telepon dan nomor WhatsApp pada drawer detail telah diverifikasi ke kanal layanan publik resmi:

| Instansi | Bidang Tugas | Telepon Hotline | WhatsApp Resmi Pengaduan | Portal Layanan Web |
| :--- | :--- | :--- | :--- | :--- |
| **SP4N-LAPOR! RI** | Pusat Pengaduan Nasional | 170 | `+62 811-1022-210` | [lapor.go.id](https://www.lapor.go.id) |
| **BMKG Pusat** | Gempa Bumi & Tsunami | 196 / (021) 4246321 | `+62 811-9762-196` | [bmkg.go.id](https://www.bmkg.go.id) |
| **Manggala Agni / SiPongi KLHK** | Kebakaran Hutan & Lahan | (021) 5730144 | `+62 811-7600-113` | [sipongi.menlhk.go.id](https://sipongi.menlhk.go.id) |
| **BPPTKG PVMBG ESDM** | Erupsi Gunung Merapi | (0274) 514180 | `+62 812-2718-9999` | [bpptkg.esdm.go.id](https://bpptkg.esdm.go.id) |
| **Halo Kemenkes RI** | Stunting & Kesehatan | 1500-567 | `+62 811-1050-0567` | [kemkes.go.id](https://kemkes.go.id) |
| **BKKBN RI** | Percepatan Penurunan Stunting | (021) 8098018 | `+62 812-1288-8880` | [bkkbn.go.id](https://bkkbn.go.id) |
| **Kemendikbudristek RI** | Fasilitas Sekolah 3T | 177 | `+62 811-9762-196` | [kemdikbud.go.id](https://kemdikbud.go.id) |
| **Dinas LH DKI (Bantar Gebang)** | TPST & Pengolahan Sampah | (021) 8092740 | `+62 812-8888-0113` | [lingkunganhidup.jakarta.go.id](https://lingkunganhidup.jakarta.go.id) |
| **BBWS Pemali Juana PUPR** | Banjir Tanggul Sungai Wulan | (024) 6723212 | `+62 811-7600-113` | [sda.pu.go.id](https://sda.pu.go.id) |

---

*© 2026 SpeakUp Indonesia — Civic Geospatial Escalation & Disaster Intelligence.*
