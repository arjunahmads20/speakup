/**
 * SpeakUp Indonesia — Point of View (POV / Google Street View 360) Inspector
 * Mendukung Telemetri Panorama dan Integrasi Resmi Google Street View 360°.
 */

// =========================================================================
// KONFIGURASI GOOGLE MAPS API KEY
// =========================================================================
// Dapatkan API Key resmi di: https://console.cloud.google.com/google/maps-apis
// Aktifkan API: "Maps Embed API" & "Street View Static API"
const GOOGLE_MAPS_API_KEY = ""; // Masukkan API Key Anda di sini (Contoh: "AIzaSy...")

class PovViewer {
  constructor() {
    this.modal = null;
    this.canvas = null;
    this.image = null;
    this.streetViewIframe = null;
    this.compassNeedle = null;
    this.compassBearing = null;
    this.currentIncident = null;
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslateX = -15; // percent
    this.zoomLevel = 1.0;
    this.heading = 340;
    this.isGoogleStreetViewMode = false;
  }

  init() {
    this.modal = document.getElementById('povModal');
    this.canvas = document.getElementById('povCanvas');
    this.image = document.getElementById('povImage');
    this.compassNeedle = document.getElementById('compassNeedle');
    this.compassBearing = document.getElementById('compassBearing');

    if (!this.canvas) return;

    // Drag interaction for 360 panorama effect
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = (e.clientX - this.startX) * 0.15;
        this.currentTranslateX = Math.max(-30, Math.min(0, this.currentTranslateX + deltaX * 0.2));
        
        // Update compass heading
        this.heading = (this.heading - deltaX * 0.8 + 360) % 360;
        this.updateCompass();
        this.updateImageTransform();
        this.startX = e.clientX;
      }
    });

    // Touch support for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = (e.touches[0].clientX - this.startX) * 0.2;
        this.currentTranslateX = Math.max(-30, Math.min(0, this.currentTranslateX + deltaX * 0.2));
        this.heading = (this.heading - deltaX * 0.8 + 360) % 360;
        this.updateCompass();
        this.updateImageTransform();
        this.startX = e.touches[0].clientX;
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Zoom Buttons & Controls
    const zoomInBtn = document.getElementById('povZoomInBtn');
    const zoomOutBtn = document.getElementById('povZoomOutBtn');
    const resetBtn = document.getElementById('povResetBtn');
    const closeBtn = document.getElementById('closePovModalBtn');
    const toggleStreetViewBtn = document.getElementById('povToggleStreetViewBtn');

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoom(0.15));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoom(-0.15));
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetView());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (toggleStreetViewBtn) {
      toggleStreetViewBtn.addEventListener('click', () => this.toggleGoogleStreetView());
    }
  }

  toggleGoogleStreetView() {
    if (!this.currentIncident) return;
    const canvas = document.getElementById('povCanvas');
    if (!canvas) return;

    if (!GOOGLE_MAPS_API_KEY) {
      const gmapsUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${this.currentIncident.lat},${this.currentIncident.lng}`;
      const confirmed = confirm(
        "Google Maps API Key belum dimasukkan pada variabel GOOGLE_MAPS_API_KEY di file js/povViewer.js.\n\n" +
        "Apakah Anda ingin membuka Google Street View resmi secara langsung di tab baru secara gratis?"
      );
      if (confirmed) {
        window.open(gmapsUrl, '_blank');
      }
      return;
    }

    this.isGoogleStreetViewMode = !this.isGoogleStreetViewMode;
    const existingIframe = document.getElementById('povGoogleIframe');

    if (this.isGoogleStreetViewMode) {
      if (!existingIframe) {
        const iframe = document.createElement('iframe');
        iframe.id = 'povGoogleIframe';
        iframe.style.position = 'absolute';
        iframe.style.inset = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        iframe.style.zIndex = '15';
        iframe.loading = 'lazy';
        iframe.allowFullscreen = true;
        iframe.src = `https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_MAPS_API_KEY}&location=${this.currentIncident.lat},${this.currentIncident.lng}&heading=${this.heading}&pitch=10&fov=90`;
        canvas.appendChild(iframe);
      }
    } else {
      if (existingIframe) existingIframe.remove();
    }
  }

  open(incident) {
    if (!incident || !incident.pov) return;
    this.currentIncident = incident;

    const titleEl = document.getElementById('povModalTitle');
    const subTitleEl = document.getElementById('povModalSubtitle');
    const pinLabelEl = document.getElementById('arPinLabel');
    const agencyLabelEl = document.getElementById('arAgencyPinLabel');
    const radiusStatusEl = document.getElementById('povRadiusStatus');
    const elevationEl = document.getElementById('povElevation');
    const sensorAqiEl = document.getElementById('povSensorAqi');
    const gmapsBtn = document.getElementById('povOpenGoogleMapsBtn');

    if (titleEl) titleEl.textContent = `POV Ground Inspector: ${incident.title}`;
    if (subTitleEl) subTitleEl.textContent = incident.pov.caption || incident.location;
    if (this.image) this.image.src = incident.pov.image;
    if (pinLabelEl) pinLabelEl.textContent = `Pusat Insiden: ${incident.subCategory || incident.title}`;
    
    if (agencyLabelEl && incident.govtAgency) {
      agencyLabelEl.textContent = `Arah Kantor: ${incident.govtAgency.name.split(' ')[0]} (${incident.govtAgency.distanceKm} km)`;
    }

    if (radiusStatusEl) radiusStatusEl.textContent = incident.pov.radiusStatus || "ZONA WASPADA";
    if (elevationEl) elevationEl.textContent = incident.pov.elevation || "Elevasi Lapangan";
    if (sensorAqiEl) sensorAqiEl.textContent = incident.pov.airSensor || "Normal";

    if (gmapsBtn) {
      gmapsBtn.href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${incident.lat},${incident.lng}`;
    }

    const existingIframe = document.getElementById('povGoogleIframe');
    if (existingIframe) existingIframe.remove();
    this.isGoogleStreetViewMode = false;

    this.resetView();
    if (this.modal) this.modal.classList.remove('hidden');

    if (window.soundFx) window.soundFx.playRadarPing();
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }

  zoom(delta) {
    this.zoomLevel = Math.max(0.8, Math.min(2.0, this.zoomLevel + delta));
    this.updateImageTransform();
  }

  resetView() {
    this.zoomLevel = 1.0;
    this.currentTranslateX = -15;
    this.heading = 340;
    this.updateCompass();
    this.updateImageTransform();
  }

  updateImageTransform() {
    if (this.image) {
      this.image.style.transform = `scale(${this.zoomLevel}) translateX(${this.currentTranslateX}%)`;
    }
  }

  updateCompass() {
    if (this.compassNeedle) {
      this.compassNeedle.style.transform = `rotate(${this.heading}deg)`;
    }
    if (this.compassBearing) {
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dirIndex = Math.round(this.heading / 45) % 8;
      this.compassBearing.textContent = `Heading ${Math.round(this.heading)}° ${dirs[dirIndex]}`;
    }
  }
}

window.povViewer = new PovViewer();
