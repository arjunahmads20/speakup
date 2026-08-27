import http.server
import socketserver
import json
import urllib.request
import urllib.parse
import ssl
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'votes.json')

# Ensure data directory exists
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump({}, f)

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

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

class SpeakUpHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for all local requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        # 1. API: Get all public synchronized vote counts
        if parsed.path == '/api/votes':
            votes = get_saved_votes()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'success', 'votes': votes}).encode('utf-8'))
            return

        # 2. API: Live BMKG Real-time Earthquake API (AutoGempa, Gempa Terkini M5+, Gempa Dirasakan)
        elif parsed.path == '/api/live-bmkg':
            try:
                ctx = get_ssl_context()
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*'
                }

                # Fetch latest real-time auto earthquake
                req_auto = urllib.request.Request('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', headers=headers)
                autogempa = None
                with urllib.request.urlopen(req_auto, context=ctx, timeout=6) as res:
                    autogempa_data = json.loads(res.read().decode('utf-8'))
                    autogempa = autogempa_data.get('Infogempa', {}).get('gempa', None)

                # Fetch list of 15 recent earthquakes M 5.0+
                req_terkini = urllib.request.Request('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json', headers=headers)
                gempa_list = []
                with urllib.request.urlopen(req_terkini, context=ctx, timeout=6) as res:
                    terkini_data = json.loads(res.read().decode('utf-8'))
                    raw_list = terkini_data.get('Infogempa', {}).get('gempa', [])
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

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'success',
                    'source': 'BMKG Indonesia (Badan Meteorologi, Klimatologi, dan Geofisika) Realtime TEWS',
                    'autogempa': autogempa,
                    'gempa_list': gempa_list,
                    'total': len(gempa_list)
                }).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'fallback', 'error': str(e), 'gempa_list': []}).encode('utf-8'))
                return

        # 3. API: Live NASA FIRMS 24h Satellite Active Fire Detections (Direct Open Feed)
        elif parsed.path == '/api/live-karhutla':
            try:
                ctx = get_ssl_context()
                nasa_url = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_SouthEast_Asia_24h.csv'
                req = urllib.request.Request(nasa_url, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                })
                
                with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
                    csv_text = response.read().decode('utf-8')
                    lines = csv_text.strip().split('\n')
                    hotspots = []
                    
                    if len(lines) > 1:
                        headers = [h.strip() for h in lines[0].split(',')]
                        lat_idx = headers.index('latitude') if 'latitude' in headers else 0
                        lng_idx = headers.index('longitude') if 'longitude' in headers else 1
                        bright_idx = headers.index('bright_ti4') if 'bright_ti4' in headers else 2
                        date_idx = headers.index('acq_date') if 'acq_date' in headers else 5
                        time_idx = headers.index('acq_time') if 'acq_time' in headers else 6
                        
                        raw_hotspots = []
                        for line in lines[1:]:
                            parts = line.split(',')
                            if len(parts) >= 7:
                                try:
                                    lat = float(parts[lat_idx])
                                    lng = float(parts[lng_idx])
                                    # Filter strictly to Indonesia coordinates bounding box: lat -11.0 to 6.0, lng 95.0 to 141.0
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
                        
                        # Categorize by NASA VIIRS Kelvin brightness temperature thresholds:
                        # >= 350 K: Kritis (Api aktif berkobar hebat / suhu termal ekstrem) -> Prioritas Utama
                        # 332 K - 350 K: Tinggi (Gambut membara / intensitas tinggi) -> Prioritas Tinggi
                        # 318 K - 332 K: Sedang (Pembakaran semak / ladang pertanian)
                        # < 318 K: Rendah (Anomali suhu rendah / titik hangat)
                        kritis_hotspots = [h for h in raw_hotspots if h['bright'] >= 350.0]
                        tinggi_hotspots = [h for h in raw_hotspots if 332.0 <= h['bright'] < 350.0]
                        sedang_hotspots = [h for h in raw_hotspots if 318.0 <= h['bright'] < 332.0]
                        rendah_hotspots = [h for h in raw_hotspots if h['bright'] < 318.0]

                        # Heavily prioritize KRITIS (100) and TINGGI (85) for civic escalation and emergency response
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
                            
                            # Geographic locator
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

                            # Determine severity tier based on VIIRS brightness temperature
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
                                    'past': {'title': 'Katalog Satelit NASA', 'description': f"Sensor satelit merekam anomali termal pada lintasan orbit harian.", 'metrics': [{'label': 'Satelit', 'value': 'VIIRS NRT'}]},
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

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'status': 'success',
                        'source': 'NASA FIRMS (Fire Information for Resource Management System) Direct Satellite Stream',
                        'total_detected_in_indonesia': len(raw_hotspots),
                        'rendered_hotspots': len(hotspots),
                        'hotspots': hotspots
                    }).encode('utf-8'))
                    return
            except Exception as e:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e), 'hotspots': []}).encode('utf-8'))
                return

        # Serve normal static files
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        # 4. API: Vote / Speak Up for an incident (Increments public tally)
        if parsed.path == '/api/speakup':
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_len)
                data = json.loads(post_body.decode('utf-8'))
                incident_id = data.get('incidentId')

                if not incident_id:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'incidentId is required'}).encode('utf-8'))
                    return

                votes = get_saved_votes()
                current_val = votes.get(incident_id, 0)
                new_val = current_val + 1
                votes[incident_id] = new_val
                save_votes(votes)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'success',
                    'incidentId': incident_id,
                    'newCount': new_val
                }).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                return

        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    # Threading server so parallel API calls don't block
    class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True

    with ThreadingHTTPServer(("", PORT), SpeakUpHandler) as httpd:
        print(f">> SpeakUp Live API Server running on port {PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
