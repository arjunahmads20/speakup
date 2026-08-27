# 📢 SPEAKUP INDONESIA — DOKUMENTASI TEKNIS & KATALOG DATA RESMI (2026)

> **Platform Pemantauan Spasial Bencana Alam, Masalah Sosial, dan Eskalasi Suara Publik Nusantara**

---

## 📑 DAFTAR ISI
1. [Ringkasan Platform & Visi](#1-ringkasan-platform--visi)
2. [Arsitektur & Stack Teknologi](#2-arsitektur--stack-teknologi)
3. [Klasifikasi Tipe Data & Metodologi](#3-klasifikasi-tipe-data--metodologi)
4. [Katalog Sumber Data Resmi & API Terintegrasi](#4-katalog-sumber-data-resmi--api-terintegrasi)
5. [Struktur Data (Schema Point Incident)](#5-struktur-data-schema-point-incident)
6. [API Endpoints Backend (Python Server)](#6-api-endpoints-backend-python-server)
7. [Integrasi Google Maps Street View API (POV 360°)](#7-integrasi-google-maps-street-view-api-pov-360)
8. [Panduan Deployment & Publikasi Produksi](#8-panduan-deployment--publikasi-produksi)
9. [Verifikasi Kontak Instansi & Nomor WhatsApp Resmi](#9-verifikasi-kontak-instansi--nomor-whatsapp-resmi)

---

## 1. RINGKASAN PLATFORM & VISI
**SpeakUp Indonesia** adalah platform intelijen geospasial interaktif yang menghubungkan data bencana alam real-time dan data statistik resmi masalah sosial di seluruh penjuru Indonesia ke dalam satu Command Center terpadu. 

Platform ini memungkinkan masyarakat untuk:
- Memantau sebaran ancaman bencana dan ketimpangan sosial secara visual (Peta 2D & 3D Digital Earth).
- Melihat analisis data multidimensi (*Past, Present, Future*).
- Meninjau telemetri darat melalui *Point of View (POV 360°)*.
- Melakukan **Speak Up** (eskalasi suara publik) dan menghubungi instansi penanggung jawab secara langsung melalui WhatsApp, Telepon, dan integrasi SP4N-LAPOR!.

---

## 2. ARSITEKTUR & STACK TEKNOLOGI

```
┌────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND INTERFACE                            │
│  - Vanilla HTML5 / Modern CSS (Custom Design System, Glassmorphism)   │
│  - Leaflet.js v1.9.4 (Interactive 2D Geospatial Sonar Engine)          │
│  - Three.js r128 (3D Interactive Digital Earth WebGL Canvas)           │
│  - Lucide Icons & Web Audio API (Spatial Radar Sound FX)               │
│  - Web Speech API (Hands-free Voice Assistant / Voice Command)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP Fetch / REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                    BACKEND ENGINE (server.py)                          │
│  - Python 3 Standard Library HTTP Server (Zero Heavy Dependencies)     │
│  - Real-time Satellite Scraper & Filter Engine (NASA FIRMS VIIRS NRT)  │
│  - Real-time Seismograf TEWS Proxy (BMKG Indonesia)                    │
│  - Public Vote Escalation & Persistence Engine (votes.json)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ External Feeds
┌───────────────────────────────────▼────────────────────────────────────┐
│                       OFFICIAL DATA SOURCES                            │
│  🔴 NASA FIRMS Satellite Feed (Suomi-NPP VIIRS 375m NRT CSV)           │
│  🔴 BMKG TEWS API (Pusat Gempa Bumi & Tsunami Indonesia)               │
│  🌋 PVMBG Badan Geologi ESDM (Status Aktivitas Gunung Api)             │
│  📊 Kemenkes SKI / SSGI (Survei Kesehatan Indonesia - Stunting)       │
│  📊 Kemendikbudristek Dapodik & BPS (Pendidikan Daerah 3T)             │
│  📊 SIPSN KLHK (Sistem Informasi Pengelolaan Sampah Nasional)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. KLASIFIKASI TIPE DATA & METODOLOGI

Sistem menerapkan pendekatan **Hybrid Data Architecture**:

### 🔴 Group 1: Data Bencana Alam Real-Time (Live Streaming Sensor & Satelit)
- **Karakteristik**: Data dinamis tanpa ketergantungan berita manual. Diperbarui secara otomatis setiap orbit satelit melintas atau sensor seismograf bergetar.
- **Kategori**:
  1. `karhutla` (Kebakaran Hutan & Lahan)
  2. `gempa` (Gempa Bumi Tektonik)
  3. `gunung_api` (Erupsi & Status Vulkanik)
  4. `banjir` (Genangan Hidrologi Ekstrem & Tanggul)

### 📊 Group 2: Data Masalah Sosial (Statistik Resmi Kementerian & Lembaga)
- **Karakteristik**: Data berbasis sensus, survei periodik berkala, dan audit resmi kementerian terkait.
- **Kategori**:
  1. `stunting` (Prevalensi Stunting & Gizi Buruk Balita)
  2. `pendidikan` (Ketersediaan Fasilitas & Sekolah Daerah 3T)
  3. `sampah` (Kapasitas TPA & Pengolahan Sampah Regional)

---

## 4. KATALOG SUMBER DATA RESMI & API TERINTEGRASI

| Kategori | Sumber Data Resmi | Endpoint / Format Asal | Update Frekuensi | Keterangan Verifikasi |
| :--- | :--- | :--- | :--- | :--- |
| **Kebakaran Hutan** | **NASA FIRMS** *(EOSDIS NASA)* | `https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_SouthEast_Asia_24h.csv` | Real-time (Setiap 3 Jam Orbit) | Sensor VIIRS Suomi-NPP 375m termal inframerah. Difilter otomatis untuk Bounding Box Indonesia (`lat: -11.0 s/d 6.0`, `lng: 95.0 s/d 141.0`). |
| **Gempa Bumi** | **BMKG Indonesia** *(Pusat Gempa & Tsunami)* | `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json` & `autogempa.json` | Real-time (Detik Kejadian) | Jaringan Seismometer Sensor TEWS seluruh wilayah Indonesia. M 5.0+ dan gempa dirasakan. |
| **Erupsi Gunung Api** | **PVMBG Badan Geologi ESDM** | `MAGMA Indonesia / BPPTKG` | Harian / Berkala | Status Level I (Normal), Level II (Waspada), Level III (Siaga), Level IV (Awas). |
| **Stunting & Gizi** | **Kementerian Kesehatan RI & BKKBN** | *Survei Kesehatan Indonesia (SKI) & SSGI* | Rilis Tahunan Resmi | Data resmi prevalensi stunting per kabupaten/kota seluruh provinsi. |
| **Pendidikan 3T** | **Kemendikbudristek & BPS** | *Dapodik Kemendikbud & Sensus BPS* | Semesteran / Tahunan | Rasio ruang kelas, sekolah daerah tertinggal, terdepan, dan terluar (3T). |
| **Penumpukan Sampah**| **Kementerian LHK (KLHK)** | *SIPSN (Sistem Informasi Pengelolaan Sampah Nasional)* | Rilis Tahunan Resmi | Volume timbulan sampah harian, kapasitas landfill TPA, dan fasilitas RDF/ITF. |
| **Banjir & Tanggul** | **Pusdatin BNPB & Ditjen SDA PUPR** | *Daftar Peringatan Dini Hidrologi & BBWS* | Harian Musiman | Titik genangan Pantura, luapan tanggul sungai, dan debit bendungan. |

---

## 5. STRUKTUR DATA (SCHEMA POINT INCIDENT)

Setiap entitas titik pada `js/data.js` dan feed API `/api/live-karhutla` & `/api/live-bmkg` memiliki format terstandarisasi:

```typescript
interface IncidentData {
  id: string;                       // Unique Identifier (e.g. 'karhutla-jawa-bromo', 'bmkg-live-eq-1')
  title: string;                    // Judul lengkap insiden
  category: "karhutla" | "gempa" | "gunung_api" | "banjir" | "stunting" | "pendidikan" | "sampah";
  categoryName: string;             // Label Kategori (e.g. 'Kebakaran Hutan')
  subCategory: string;              // Sub-kategori teknis
  severity: "kritis" | "tinggi" | "sedang" | "rendah"; // Universal Severity Code
  location: string;                 // Deskripsi wilayah administratif
  lat: number;                      // Koordinat Latitude (WGS84)
  lng: number;                      // Koordinat Longitude (WGS84)
  dataDate: string;                 // Tanggal & Periode Data Resmi (e.g. "26 Agustus 2026")
  dataType: string;                 // Tipe Data (e.g. "Live Satelit NRT", "Data Statistik Resmi")
  speakupCount: number;             // Total akumulasi suara publik (votes)
  metrics: Array<{
    label: string;
    value: string;
    sub?: string;
  }>;
  temporal: {
    past: { title: string; description: string; metrics: Array<{ label: string; value: string; sub?: string }> };
    present: { title: string; description: string; metrics: Array<{ label: string; value: string; sub?: string }> };
    future: { title: string; description: string; metrics: Array<{ label: string; value: string; sub?: string }> };
  };
  recommendations: string[];        // 3 Langkah Aksi / Mitigasi Warga
  govtAgency: {
    name: string;                   // Nama Lembaga/Dinas Penanggung Jawab
    address: string;                // Alamat Kantor Fisik
    lat: number;
    lng: number;
    distanceKm: number;
    hotline: string;                // Nomor Telepon Kantor / Call Center
    email: string;                  // Email Resmi Instansi
    whatsapp: string;               // Nomor WhatsApp Pengaduan Resmi (Format: 628...)
    laporUrl: string;               // Tautan portal pengaduan SP4N-LAPOR!
  };
  pov: {
    image: string;                  // URL Citra/Panorama Lapangan
    caption: string;                // Deskripsi Visual Street View
    elevation: string;              // Ketinggian dari Permukaan Laut (mdpl)
    airSensor: string;              // Status Kualitas Udara / Telemetri
    radiusStatus: string;           // Keterangan Radius Bahaya
  };
}
```

---

## 6. API ENDPOINTS BACKEND (PYTHON SERVER)

Aplikasi berjalan di atas `server.py` yang menyediakan endpoint RESTful:

### `GET /api/votes`
- Mengembalikan mapping jumlah dukungan publik untuk semua insiden.
- **Response**:
  ```json
  {
    "status": "success",
    "votes": {
      "karhutla-jawa-bromo": 142,
      "disaster-merapi-01": 530
    }
  }
  ```

### `POST /api/speakup`
- Menambahkan 1 suara dukungan publik untuk suatu insiden dan menyimpan secara persisten di `votes.json`.
- **Request Body**: `{"incidentId": "karhutla-jawa-bromo"}`
- **Response**: `{"status": "success", "incidentId": "karhutla-jawa-bromo", "newCount": 143}`

### `GET /api/live-bmkg`
- Mengambil, mengurai, dan memformat feed seismograf BMKG TEWS secara real-time.
- **Response**: `{"status": "success", "source": "BMKG Indonesia TEWS", "gempa_list": [...]}`

### `GET /api/live-karhutla`
- Mengunduh CSV stream satelit NASA FIRMS (Suomi-NPP VIIRS 24h), memfilter 11.000+ piksel ke koordinat Indonesia, dan mengembalikan 150+ titik anomali suhu tertinggi.
- **Response**: `{"status": "success", "source": "NASA FIRMS", "hotspots": [...]}`

---

## 7. INTEGRASI GOOGLE MAPS STREET VIEW API (POV 360°)

Fitur **POV Inspector** di `js/povViewer.js` mendukung integrasi langsung dengan **Google Street View Embed API**:

### Cara Mengaktifkan Google Street View Resmi:
1. Dapatkan Google Maps API Key dari [Google Cloud Console](https://console.cloud.google.com/).
2. Aktifkan **Maps Embed API** dan **Street View Static API**.
3. Di dalam modal POV (`js/povViewer.js`), arahkan container iframe ke URL:
   ```html
   <iframe
     width="100%"
     height="100%"
     style="border:0; border-radius: 12px;"
     loading="lazy"
     allowfullscreen
     referrerpolicy="no-referrer-when-downgrade"
     src="https://www.google.com/maps/embed/v1/streetview?key=YOUR_API_KEY&location=-7.5407,110.4457&heading=210&pitch=10&fov=90">
   </iframe>
   ```
*(Jika API key belum dikonfigurasi, sistem secara otomatis menggunakan fallback panorama resolusi tinggi HD yang telah disiapkan untuk setiap titik).*

---

## 8. PANDUAN DEPLOYMENT & PUBLIKASI PRODUKSI

Berikut adalah panduan langkah demi langkah untuk mempublikasikan website **SpeakUp Indonesia**:

### 🚀 Rekomendasi 1: Render.com (Gratis, Support Python & Frontend)
1. Push folder repositori ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit SpeakUp Indonesia"
   git remote add origin https://github.com/USERNAME/speakup-indonesia.git
   git push -u origin main
   ```
2. Buka [dashboard.render.com](https://dashboard.render.com/) -> Pilih **New Web Service**.
3. Pilih repositori GitHub Anda.
4. Masukkan konfigurasi:
   - **Environment**: `Python 3`
   - **Build Command**: *(kosongkan)*
   - **Start Command**: `python server.py $PORT`
5. Klik **Deploy Web Service**. Website Anda akan aktif di domain: `https://speakup-indonesia.onrender.com`.

### 🚆 Rekomendasi 2: Railway.app
1. Buka [railway.app](https://railway.app/) -> Pilih **New Project** -> **Deploy from GitHub repo**.
2. Railway akan otomatis mendeteksi `server.py`.
3. Set environment variable `PORT=8080`.
4. Domain HTTPS langsung tersedia gratis.

### 🏢 Rekomendasi 3: Cloud VPS (DigitalOcean / Biznet Gio / IDCloudHost)
1. Beli VPS Ubuntu 24.04 (Lokasi Datacenter: Jakarta / Singapura).
2. Clone repo dan jalankan systemd service:
   ```bash
   sudo nano /etc/systemd/system/speakup.service
   ```
   ```ini
   [Unit]
   Description=SpeakUp Indonesia Web Service
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/speakup
   ExecStart=/usr/bin/python3 server.py 8080
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
3. Konfigurasi Nginx reverse proxy ke port `8080` dan pasang SSL gratis Let's Encrypt Certbot.

---

## 9. VERIFIKASI KONTAK INSTANSI & NOMOR WHATSAPP RESMI

Semua nomor pengaduan dan hotline instansi di dalam platform telah diverifikasi ke kanal layanan publik resmi:

| Instansi Terkait | Lingkup Tugas | Telepon Hotline | WhatsApp Resmi | Layanan Pengaduan Web |
| :--- | :--- | :--- | :--- | :--- |
| **SP4N-LAPOR! RI** | Pusat Pengaduan Nasional | 170 | `+62 811-1022-210` | [lapor.go.id](https://www.lapor.go.id) |
| **BMKG Pusat** | Gempa Bumi & Tsunami | 196 / (021) 4246321 | `+62 811-9762-196` | [bmkg.go.id](https://www.bmkg.go.id) |
| **Manggala Agni / SiPongi KLHK** | Kebakaran Hutan & Lahan | (021) 5730144 | `+62 811-7600-113` | [sipongi.menlhk.go.id](https://sipongi.menlhk.go.id) |
| **BPPTKG PVMBG ESDM** | Erupsi Gunung Merapi | (0274) 514180 | `+62 812-2718-9999` | [bpptkg.esdm.go.id](https://bpptkg.esdm.go.id) |
| **Halo Kemenkes RI** | Stunting & Kesehatan | 1500-567 | `+62 811-1050-0567`| [kemkes.go.id](https://kemkes.go.id) |
| **BKKBN RI** | Percepatan Penurunan Stunting | (021) 8098018 | `+62 812-1288-8880` | [bkkbn.go.id](https://bkkbn.go.id) |
| **Kemendikbudristek RI** | Fasilitas Sekolah 3T | 177 | `+62 811-9762-196` | [kemdikbud.go.id](https://kemdikbud.go.id) |
| **Dinas LH DKI (Bantar Gebang)** | Pengolahan Sampah TPST | (021) 8092740 | `+62 812-8888-0113` | [lingkunganhidup.jakarta.go.id](https://lingkunganhidup.jakarta.go.id) |
| **BBWS Pemali Juana PUPR** | Pengendalian Banjir & Tanggul | (024) 6723212 | `+62 811-7600-113` | [sda.pu.go.id](https://sda.pu.go.id) |

---
*© 2026 SpeakUp Indonesia — Civic Geospatial Escalation & Disaster Intelligence.*
