/**
 * SpeakUp Indonesia — Map & 3D Globe Engine
 * Leaflet GIS Canvas + Photorealistic Three.js 3D Earth Globe with clickable 3D Hotspot Beacons.
 */

class MapEngine {
  constructor() {
    this.map = null;
    this.markersLayer = null;
    this.buffersLayer = null;
    this.showBuffers = true;
    this.is3DMode = false;
    this.activePointId = null;
    this.indonesiaCenter = [-2.5489, 118.0149];
    this.defaultZoom = 5;

    // Three.js 3D Globe State
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globeMesh = null;
    this.pinsGroup = null;
    this.isThreeInit = false;
    this.isDraggingGlobe = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.raycaster = null;
    this.mouse = null;
    this.globeRadius = 100;
  }

  init() {
    // 1. Initialize Leaflet Map
    this.map = L.map('mapContainer', {
      center: this.indonesiaCenter,
      zoom: this.defaultZoom,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: false
    });

    // High quality Dark Matter Tiles (No API key required, 100% free open tiles)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.buffersLayer = L.layerGroup().addTo(this.map);

    // 2. Initialize Three.js 3D Globe
    this.initThreeGlobe();

    // 3. Render initial markers
    this.renderMarkers(INCIDENTS_DATA);
  }

  renderMarkers(incidents, filterCategory = "all", filterSeverity = "all", autoFitBounds = false) {
    if (!this.markersLayer || !this.map) return 0;

    // Clear all existing markers and danger circles completely
    this.markersLayer.clearLayers();
    this.buffersLayer.clearLayers();

    const filtered = incidents.filter(inc => {
      const catMatch = filterCategory === "all" || inc.category === filterCategory;
      const sevMatch = filterSeverity === "all" || inc.severity === filterSeverity;
      return catMatch && sevMatch;
    });

    const bounds = [];

    const SEVERITY_COLORS = {
      kritis: "#ef4444",   // Red / Merah
      tinggi: "#f97316",   // Orange / Jingga
      sedang: "#eab308",   // Yellow / Kuning
      rendah: "#10b981"    // Green / Hijau
    };

    const isSingleCategory = filterCategory !== "all";

    filtered.forEach(inc => {
      const sevColor = SEVERITY_COLORS[inc.severity] || "#f97316";
      bounds.push([inc.lat, inc.lng]);
      
      const ringHtml = isSingleCategory
        ? `<div class="pulse-marker-ring ${inc.severity}" style="border-color: ${sevColor}; box-shadow: 0 0 10px ${sevColor};"></div>`
        : '';

      const customIcon = L.divIcon({
        className: 'custom-sonar-marker',
        html: `
          <div class="pulse-marker-wrapper" title="${inc.title}">
            ${ringHtml}
            <div class="pulse-marker-dot ${isSingleCategory ? 'focused' : ''}" style="background-color: ${sevColor}; box-shadow: 0 0 ${isSingleCategory ? '8px' : '4px'} ${sevColor};"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([inc.lat, inc.lng], { icon: customIcon });

      marker.on('click', () => {
        if (window.soundFx) window.soundFx.playRadarPing();
        this.selectIncident(inc.id);
      });

      marker.bindTooltip(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; padding: 2px 4px;">
          <strong style="color: ${sevColor}; font-size: 13px;">${inc.title}</strong><br>
          <span style="color: #94a3b8; font-size: 11px;">📍 ${inc.location}</span><br>
          <span style="display: inline-block; margin-top: 3px; font-size: 10px; font-weight: 700; color: #fff; background: ${sevColor}; padding: 1px 6px; border-radius: 4px; text-transform: uppercase;">Tingkat: ${inc.severity}</span>
        </div>
      `, { direction: 'top', offset: [0, -14], opacity: 0.95 });

      this.markersLayer.addLayer(marker);

      if (this.showBuffers) {
        let radiusMeter = 15000;
        if (inc.category === 'gunung_api') radiusMeter = 20000;
        if (inc.category === 'banjir') radiusMeter = 12000;
        if (inc.category === 'karhutla') radiusMeter = 25000;

        const circle = L.circle([inc.lat, inc.lng], {
          radius: radiusMeter,
          color: sevColor,
          weight: 1.5,
          opacity: 0.6,
          fillColor: sevColor,
          fillOpacity: 0.08,
          dashArray: "4, 6"
        });
        this.buffersLayer.addLayer(circle);
      }
    });

    // Auto-fit camera bounds to show ALL filtered markers across Indonesia
    if (autoFitBounds && bounds.length > 0) {
      if (bounds.length === 1) {
        this.map.flyTo(bounds[0], 7, { duration: 1.2 });
      } else {
        this.map.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 7,
          animate: true,
          duration: 1.2
        });
      }
    }

    // Also update Three.js 3D Globe Pins strictly to the filtered set
    this.updateThreePins(filtered);

    return filtered.length;
  }

  toggleBuffers() {
    this.showBuffers = !this.showBuffers;
    if (this.showBuffers) {
      this.map.addLayer(this.buffersLayer);
    } else {
      this.map.removeLayer(this.buffersLayer);
    }
    return this.showBuffers;
  }

  selectIncident(id) {
    const inc = INCIDENTS_DATA.find(item => item.id === id);
    if (!inc) return;

    this.activePointId = id;
    
    // Smooth camera fly
    this.map.flyTo([inc.lat, inc.lng], 12, {
      duration: 1.4,
      easeLinearity: 0.25
    });

    if (window.app) {
      window.app.populateIncidentDrawer(inc);
    }
  }

  flyToAgency(inc) {
    if (!inc || !inc.govtAgency) return;
    const { lat, lng } = inc.govtAgency;
    
    this.map.flyTo([lat, lng], 14, {
      duration: 1.6,
      easeLinearity: 0.25
    });

    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
    }

    this.routePolyline = L.polyline([[inc.lat, inc.lng], [lat, lng]], {
      color: '#00f0ff',
      weight: 3,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(this.map);

    const agencyIcon = L.divIcon({
      className: 'agency-marker',
      html: `
        <div style="background: #0284c7; border: 2px solid #00f0ff; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; box-shadow: 0 0 15px rgba(0,240,255,0.6); display: flex; align-items: center; gap: 4px;">
          🏛️ ${inc.govtAgency.name.split(' ')[0]} (${inc.govtAgency.distanceKm} km)
        </div>
      `,
      iconSize: [140, 30],
      iconAnchor: [70, 15]
    });

    L.marker([lat, lng], { icon: agencyIcon })
      .bindPopup(`<strong>${inc.govtAgency.name}</strong><br>${inc.govtAgency.address}<br>Telp: ${inc.govtAgency.hotline}`)
      .addTo(this.map)
      .openPopup();

    setTimeout(() => {
      if (this.routePolyline) this.map.removeLayer(this.routePolyline);
    }, 15000);
  }

  recenterIndonesia() {
    this.map.flyTo(this.indonesiaCenter, this.defaultZoom, {
      duration: 1.2
    });
  }

  // =========================================================================
  // PHOTOREALISTIC THREE.JS 3D EARTH GLOBE SYSTEM
  // =========================================================================
  initThreeGlobe() {
    const container = document.getElementById('globe3DContainer');
    const canvas = document.getElementById('threeGlobeCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.z = 280;

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x334155, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight.position.set(150, 100, 150);
    this.scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x3b82f6, 0.8);
    backLight.position.set(-150, -50, -100);
    this.scene.add(backLight);

    // 4. Earth Sphere
    const sphereGeo = new THREE.SphereGeometry(this.globeRadius, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x090d16,
      emissive: 0x020617,
      specular: 0x00f0ff,
      shininess: 25,
      wireframe: false
    });

    this.globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    this.scene.add(this.globeMesh);

    // 5. Latitude / Longitude Glowing Wireframe Shell
    const wireGeo = new THREE.SphereGeometry(this.globeRadius + 0.5, 36, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    this.globeMesh.add(wireMesh);

    // 6. Atmospheric Glow Ring
    const ringGeo = new THREE.RingGeometry(this.globeRadius * 1.05, this.globeRadius * 1.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    this.scene.add(ringMesh);

    // 7. Group for 3D Hotspot Pins
    this.pinsGroup = new THREE.Group();
    this.globeMesh.add(this.pinsGroup);

    // Initial position pointing towards Indonesia (Lat: -2.5, Lng: 118)
    this.globeMesh.rotation.y = -Math.PI / 1.7;
    this.globeMesh.rotation.x = 0.2;

    // 8. Raycasting for Click Interactions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Mouse Drag Rotation
    canvas.addEventListener('mousedown', (e) => {
      this.isDraggingGlobe = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingGlobe = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isDraggingGlobe) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.globeMesh.rotation.y += deltaX * 0.005;
        this.globeMesh.rotation.x += deltaY * 0.005;

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Zoom on wheel
    canvas.addEventListener('wheel', (e) => {
      this.camera.position.z = Math.max(160, Math.min(450, this.camera.position.z + e.deltaY * 0.2));
    });

    // Click on 3D Pin
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.pinsGroup.children, true);

      if (intersects.length > 0) {
        const selectedPin = intersects[0].object;
        if (selectedPin.userData && selectedPin.userData.incidentId) {
          if (window.soundFx) window.soundFx.playRadarPing();
          this.selectIncident(selectedPin.userData.incidentId);
        }
      }
    });

    // Resize handler
    window.addEventListener('resize', () => {
      if (container && this.renderer && this.camera) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });

    this.isThreeInit = true;
    this.animateThreeGlobe();
  }

  latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
  }

  updateThreePins(incidents) {
    if (!this.pinsGroup) return;

    // Clear old pins
    while (this.pinsGroup.children.length > 0) {
      const obj = this.pinsGroup.children[0];
      this.pinsGroup.remove(obj);
    }

    const SEVERITY_COLORS = {
      kritis: "#ef4444",
      tinggi: "#f97316",
      sedang: "#eab308",
      rendah: "#10b981"
    };

    incidents.forEach(inc => {
      const pos = this.latLngToVector3(inc.lat, inc.lng, this.globeRadius);
      const sevColor = SEVERITY_COLORS[inc.severity] || "#f97316";
      const colorHex = parseInt(sevColor.replace('#', '0x'), 16);

      // Pin Base Spike
      const pinGeo = new THREE.CylinderGeometry(0.5, 2.5, 12, 16);
      pinGeo.translate(0, 6, 0);
      pinGeo.rotateX(Math.PI / 2);
      
      const pinMat = new THREE.MeshPhongMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6
      });

      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.lookAt(0, 0, 0);
      pinMesh.userData = { incidentId: inc.id };

      // Glowing Beacon Sphere atop the pin
      const beaconGeo = new THREE.SphereGeometry(3.5, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 0, -12);
      beacon.userData = { incidentId: inc.id };
      pinMesh.add(beacon);

      this.pinsGroup.add(pinMesh);
    });
  }

  animateThreeGlobe() {
    requestAnimationFrame(() => this.animateThreeGlobe());

    if (this.is3DMode && this.renderer && this.scene && this.camera) {
      if (!this.isDraggingGlobe && this.globeMesh) {
        this.globeMesh.rotation.y += 0.0012; // Slow auto rotation
      }
      this.renderer.render(this.scene, this.camera);
    }
  }

  toggleViewMode() {
    this.is3DMode = !this.is3DMode;
    const globeContainer = document.getElementById('globe3DContainer');
    const toggleBtn = document.getElementById('viewModeToggleBtn');
    
    if (this.is3DMode) {
      globeContainer.classList.remove('hidden');
      if (toggleBtn) toggleBtn.innerHTML = `<i data-lucide="map"></i><span class="btn-text">Peta 2D</span>`;
      // Trigger canvas resize
      if (this.renderer && this.camera) {
        const w = globeContainer.clientWidth;
        const h = globeContainer.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    } else {
      globeContainer.classList.add('hidden');
      if (toggleBtn) toggleBtn.innerHTML = `<i data-lucide="globe"></i><span class="btn-text">Globe 3D</span>`;
    }
    
    if (window.lucide) window.lucide.createIcons();
    return this.is3DMode;
  }
}

window.mapEngine = new MapEngine();
