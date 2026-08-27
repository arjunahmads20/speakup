import json
import os
import sys
import httpx
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ==========================================
# 1. KONFIGURASI AWAL
# ==========================================
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'votes.json')

# Pastikan direktori dan file data votes.json tersedia
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump({}, f)

def get_saved_votes():
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return {}

def save_votes(votes):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(votes, f, indent=2)
    except Exception as e:
        print(f"Error saving votes: {e}")

# ==========================================
# 2. INISIALISASI FASTAPI & MIDDLEWARE
# ==========================================
app = FastAPI(title="SpeakUp Live API")

# Konfigurasi CORS: Mengizinkan seluruh domain, metode (GET/POST/dll), dan header
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model Pydantic untuk request POST Speak Up
class SpeakUpRequest(BaseModel):
    incidentId: str

# ==========================================
# 3. ROUTES / API ENDPOINTS
# ==========================================

@app.get("/api/votes")
def get_votes():
    """API: Get all public synchronized vote counts"""
    votes = get_saved_votes()
    return {'status': 'success', 'votes': votes}


@app.get("/api/live-bmkg")
async def get_live_bmkg():
    """API: Live BMKG Real-time Earthquake API"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*'
        }

        # Menggunakan httpx.AsyncClient agar penarikan data bersifat non-blocking
        async with httpx.AsyncClient(verify=False, timeout=15.0) as client:
            # 1. Fetch latest real-time auto earthquake
            res_auto = await client.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', headers=headers)
            autogempa_data = res_auto.json()
            autogempa = autogempa_data.get('Infogempa', {}).get('gempa', None)

            # 2. Fetch list of 20 recent earthquakes M 5.0+
            res_terkini = await client.get('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json', headers=headers)
            terkini_data = res_terkini.json()
            raw_list = terkini_data.get('Infogempa', {}).get('gempa', [])
            
            gempa_list = []
            for idx, g in enumerate(raw_list[:20]):
                try:
                    coords = g.get('Coordinates', '').split(',')
                    lat = float(coords[0])
                    lng = float(coords[1])
                    mag = float(g.get('Magnitude', '5.0'))
                    gempa_list.append({
                        'id': f"bmkg-live-eq-{idx+1}",
                        'title': f"Gempa M {g.get('Magnitude')} — {g.get('Wilayah')}",
                        'category': 'gempa',
                        'categoryName': 'Gempa Bumi',
                        'subCategory': 'Sensor Seismik BMKG TEWS',
                        'severity': 'kritis' if mag >= 6.0 else ('tinggi' if mag >= 5.0 else 'sedang'),
                        'location': f"{g.get('Wilayah')} ({g.get('Tanggal')}, {g.get('Jam')})",
                        'dataDate': f"Waktu Kejadian: {g.get('Tanggal')} pk {g.get('Jam')} WIB (Live BMKG)",
                        'dataType': 'Live Sensor Seismik BMKG TEWS',
                        'lat': lat,
                        'lng': lng,
                        'speakupCount': 0,
                        'metrics': [
                            {'label': 'Magnitudo (BMKG)', 'value': f"M {g.get('Magnitude')}", 'sub': 'Skala Richter'},
                            {'label': 'Kedalaman Gempa', 'value': g.get('Kedalaman'), 'sub': 'Hiposentrum'},
                            {'label': 'Potensi Tsunami', 'value': g.get('Potensi', 'Tidak berpotensi tsunami'), 'sub': 'Analisis TEWS BMKG'},
                            {'label': 'Waktu Kejadian', 'value': f"{g.get('Jam')} WIB", 'sub': g.get('Tanggal')}
                        ],
                        'temporal': {
                            'past': {'title': 'Katalog Seismik', 'description': 'Data gempa bumi tektonik otomatis dari jaringan sensor BMKG.', 'metrics': [{'label': 'Waktu', 'value': g.get('Jam')}]},
                            'present': {'title': 'Peringatan Dini BMKG', 'description': f"Gempa bumi M {g.get('Magnitude')} dengan kedalaman {g.get('Kedalaman')}. {g.get('Potensi')}", 'metrics': [{'label': 'Status', 'value': 'Aktif Terverifikasi'}]},
                            'future': {'title': 'Pemantauan Gempa Susulan', 'description': 'BMKG memonitor gelombang seismik susulan (aftershocks).', 'metrics': [{'label': 'Sensor', 'value': '24 Jam Aktif'}]}
                        },
                        'recommendations': [
                            'Jauhi bangunan retak atau struktur yang berpotensi runtuh.',
                            'Jika berada di tepi pantai dan merasakan gempa kuat berdurasi lama, segera evakuasi ke bukit atau tempat tinggi.',
                            'Pantau informasi resmi dari aplikasi BMKG atau @infoBMKG.'
                        ],
                        'govtAgency': {
                            'name': 'Pusat Gempa Bumi dan Tsunami — BMKG Pusat',
                            'address': 'Jl. Angkasa I No. 2 Kemayoran, Jakarta Pusat 10720',
                            'lat': -6.1554,
                            'lng': 106.8402,
                            'distanceKm': 10.0,
                            'hotline': '196 / (021) 4246321',
                            'email': 'kontak@bmkg.go.id',
                            'whatsapp': '628119762196',
                            'laporUrl': 'https://www.lapor.go.id'
                        },
                        'pov': {
                            'image': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
                            'caption': f"Lokasi Pusat Seismik BMKG — {g.get('Wilayah')}",
                            'elevation': '0 mdpl',
                            'airSensor': 'Normal',
                            'radiusStatus': 'ZONA SEISMIK AKTIF TEKTONIK'
                        }
                    })
                except Exception:
                    pass

        return {
            'status': 'success',
            'source': 'BMKG Indonesia (Badan Meteorologi, Klimatologi, dan Geofisika) Realtime TEWS',
            'autogempa': autogempa,
            'gempa_list': gempa_list,
            'total': len(gempa_list)
        }

    except Exception as e:
        print(f"Gagal mengambil data BMKG: {str(e)}") # Log ke terminal
        return {'status': 'fallback', 'error': str(e), 'gempa_list': []}


@app.get("/api/live-karhutla")
async def get_live_karhutla():
    """API: Live NASA FIRMS 24h Satellite Active Fire Detections"""
    try:
        nasa_url = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_SouthEast_Asia_24h.csv'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
        
        async with httpx.AsyncClient(verify=False, timeout=20.0) as client:
            response = await client.get(nasa_url, headers=headers)
            
            csv_text = response.text
            lines = csv_text.strip().split('\n')
            hotspots = []
            
            if len(lines) > 1:
                headers_csv = [h.strip() for h in lines[0].split(',')]
                lat_idx = headers_csv.index('latitude') if 'latitude' in headers_csv else 0
                lng_idx = headers_csv.index('longitude') if 'longitude' in headers_csv else 1
                bright_idx = headers_csv.index('bright_ti4') if 'bright_ti4' in headers_csv else 2
                date_idx = headers_csv.index('acq_date') if 'acq_date' in headers_csv else 5
                time_idx = headers_csv.index('acq_time') if 'acq_time' in headers_csv else 6
                
                raw_hotspots = []
                for line in lines[1:]:
                    parts = line.split(',')
                    if len(parts) >= 7:
                        try:
                            lat = float(parts[lat_idx])
                            lng = float(parts[lng_idx])
                            # Filter strictly to Indonesia coordinates
                            if -11.0 <= lat <= 6.0 and 95.0 <= lng <= 141.0:
                                bright = float(parts[bright_idx])
                                acq_date = parts[date_idx]
                                acq_time = parts[time_idx]
                                raw_hotspots.append({
                                    'lat': lat,
                                    'lng': lng,
                                    'bright': bright,
                                    'date': acq_date,
                                    'time': acq_time
                                })
                        except Exception:
                            pass
                
                kritis_hotspots = [h for h in raw_hotspots if h['bright'] >= 350.0]
                tinggi_hotspots = [h for h in raw_hotspots if 332.0 <= h['bright'] < 350.0]
                sedang_hotspots = [h for h in raw_hotspots if 318.0 <= h['bright'] < 332.0]
                rendah_hotspots = [h for h in raw_hotspots if h['bright'] < 318.0]

                # Heavily prioritize KRITIS (100) and TINGGI (85)
                sampled_hotspots = (
                    kritis_hotspots[:100] +
                    tinggi_hotspots[:85] +
                    sedang_hotspots[:20] +
                    rendah_hotspots[:10]
                )
                if len(sampled_hotspots) < 120:
                    sampled_hotspots = raw_hotspots[:200]

                for idx, h in enumerate(sampled_hotspots):
                    lat = h['lat']
                    lng = h['lng']
                    bright = h['bright']
                    acq_date = h['date']
                    acq_time = h['time']
                    
                    region_label = "Indonesia"
                    if lng < 105.0:
                        region_label = "Sumatera"
                    elif lng < 114.5 and lat < -5.5:
                        region_label = "Jawa"
                    elif lng < 118.0 and lat > -5.5:
                        region_label = "Kalimantan"
                    elif lng < 125.0 and lat > -6.0:
                        region_label = "Sulawesi"
                    elif lng < 126.0 and lat <= -6.0:
                        region_label = "Bali / Nusa Tenggara"
                    elif lng < 131.0:
                        region_label = "Kepulauan Maluku"
                    else:
                        region_label = "Wilayah Papua"

                    if bright >= 355.0:
                        sev = 'kritis'
                        sev_desc = 'Suhu Ekstrem / Kobaran Api Aktif'
                    elif bright >= 335.0:
                        sev = 'tinggi'
                        sev_desc = 'Intensitas Tinggi / Gambut Membara'
                    elif bright >= 318.0:
                        sev = 'sedang'
                        sev_desc = 'Intensitas Sedang / Pembakaran Lahan'
                    else:
                        sev = 'rendah'
                        sev_desc = 'Intensitas Rendah / Titik Hangat'

                    hotspots.append({
                        'id': f"nasa-firms-live-{idx+1}",
                        'title': f"Titik Api Satelit NASA — {region_label} ({bright:.1f}°K)",
                        'category': 'karhutla',
                        'categoryName': 'Kebakaran Hutan',
                        'subCategory': f"Sensor Satelit VIIRS ({sev_desc})",
                        'severity': sev,
                        'location': f"{region_label} ({lat:.4f}° Lat, {lng:.4f}° Lng) — Waktu: {acq_date} {acq_time} UTC",
                        'dataDate': f"Deteksi Satelit: {acq_date} {acq_time} UTC (Live 24 Jam Terakhir)",
                        'dataType': 'Live Sensor Satelit NASA FIRMS NRT',
                        'lat': lat,
                        'lng': lng,
                        'speakupCount': 0,
                        'metrics': [
                            {'label': 'Satelit Pendeteksi', 'value': 'NASA VIIRS SNPP NRT', 'sub': 'Sensor Inframerah Termal 375m'},
                            {'label': 'Suhu Kecerahan Termal', 'value': f"{bright:.1f} Kelvin", 'sub': f"Status: {sev.upper()}"},
                            {'label': 'Waktu Deteksi Satelit', 'value': f"{acq_date} {acq_time} UTC", 'sub': 'Orbit Satelit NRT'},
                            {'label': 'Kategori Intensitas', 'value': sev_desc, 'sub': 'Thermal Fire Pixel'}
                        ],
                        'temporal': {
                            'past': {'title': 'Katalog Satelit NASA', 'description': 'Sensor satelit merekam anomali termal pada lintasan orbit harian.', 'metrics': [{'label': 'Satelit', 'value': 'VIIRS NRT'}]},
                            'present': {'title': 'Live Telemetri NASA FIRMS', 'description': f"Satelit NASA mendeteksi anomali suhu api {bright:.1f}°K di koordinat {lat:.4f}, {lng:.4f} wilayah {region_label}.", 'metrics': [{'label': 'Suhu Kecerahan', 'value': f"{bright:.1f} K"}]},
                            'future': {'title': 'Ground-Check Satgas', 'description': 'Verifikasi lapangan satgas darat Manggala Agni dan pemadaman water bombing.', 'metrics': [{'label': 'Satgas', 'value': 'Manggala Agni'}]}
                        },
                        'recommendations': [
                            'Regu Manggala Agni dan Masyarakat Peduli Api (MPA) terdekat diinstruksikan memverifikasi titik koordinat ini.',
                            'Dilarang melakukan aktivitas pembakaran hutan, sisa tebasan, atau lahan terbuka.',
                            'Gunakan masker jika asap tipis mulai menyebar ke pemukiman terdekat.'
                        ],
                        'govtAgency': {
                            'name': 'Direktorat Pengendalian Kebakaran Hutan dan Lahan (PKHL) — KLHK RI',
                            'address': 'Gedung Manggala Wanabakti, Blok I Lt. 14, Jl. Jend. Gatot Subroto, Jakarta',
                            'lat': lat + 0.05,
                            'lng': lng + 0.05,
                            'distanceKm': 12.0,
                            'hotline': '(021) 573-0144 / 0811-7600-113',
                            'email': 'sipongi@menlhk.go.id',
                            'whatsapp': '628117600113',
                            'laporUrl': 'https://www.lapor.go.id'
                        },
                        'pov': {
                            'image': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
                            'caption': f"Deteksi Satelit NASA FIRMS ({lat:.4f}, {lng:.4f}) di {region_label}",
                            'elevation': '15 mdpl',
                            'airSensor': f"Thermal Anomaly: {bright:.1f} K",
                            'radiusStatus': 'ZONA SIAGA ANOMALI SUHU TERMAL SATELIT'
                        }
                    })

            return {
                'status': 'success',
                'source': 'NASA FIRMS (Fire Information for Resource Management System) Direct Satellite Stream',
                'total_detected_in_indonesia': len(raw_hotspots),
                'rendered_hotspots': len(hotspots),
                'hotspots': hotspots
            }

    except Exception as e:
        print(f"Gagal mengambil data NASA: {str(e)}") # Log ke terminal
        return {'status': 'error', 'message': str(e), 'hotspots': []}


@app.post("/api/speakup")
def speak_up(req: SpeakUpRequest):
    """API: Vote / Speak Up for an incident"""
    incident_id = req.incidentId
    
    if not incident_id:
        raise HTTPException(status_code=400, detail="incidentId cannot be empty")

    votes = get_saved_votes()
    current_val = votes.get(incident_id, 0)
    new_val = current_val + 1
    votes[incident_id] = new_val
    save_votes(votes)

    return {
        'status': 'success',
        'incidentId': incident_id,
        'newCount': new_val
    }


# ==========================================
# 4. STATIS FILES ROUTING (WAJIB DI BAWAH)
# ==========================================
# Melayani file HTML, CSS, JS dari direktori tempat file Python ini berada
app.mount("/", StaticFiles(directory=".", html=True), name="static")


# ==========================================
# 5. ENTRY POINT RUNNER SERVER
# ==========================================
if __name__ == '__main__':
    print(f"\n=======================================================")
    print(f"🚀 Server SpeakUp Live (FastAPI) berjalan di port {PORT}")
    print(f"🌍 Buka browser di: http://localhost:{PORT}")
    print(f"=======================================================\n")
    
    # Menjalankan server melalui Uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
