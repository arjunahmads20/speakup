/**
 * SpeakUp Indonesia — Main Application Orchestrator
 * Coordinates Map, Data Layer, UI Drawers, Filters, Search, and Event Listeners.
 */

class SpeakUpApp {
  constructor() {
    this.currentTimeline = "present"; // past, present, future
    this.currentCategory = "all";
    this.currentSeverity = "all";
    this.activeIncident = null;
    this.tickerIndex = 0;
  }

  init() {
    console.log("🚀 Initializing SpeakUp Indonesia Application...");

    // 1. Initialize Sub-modules
    if (window.mapEngine) window.mapEngine.init();
    if (window.povViewer) window.povViewer.init();
    if (window.socialShare) window.socialShare.init();
    if (window.voiceAssistant) window.voiceAssistant.init();

    // 2. Setup Event Listeners
    this.setupEventListeners();

    // 3. Update Category Badges & Leaderboard
    this.updateStatsAndBadges();
    this.renderTopEscalatedList();

    // 4. Fetch Centralized Public Votes, Live BMKG & Live NASA FIRMS
    this.syncCentralizedVotes();
    this.syncLiveBMKG();
    this.syncLiveKarhutla();

    // 5. Start Live Alert Ticker
    this.startAlertTicker();

    // 6. Select default incident (Merapi) to showcase populated view
    const defaultIncident = INCIDENTS_DATA[0];
    if (defaultIncident) {
      setTimeout(() => {
        this.populateIncidentDrawer(defaultIncident);
      }, 500);
    }

    // 7. Refresh Lucide Icons
    if (window.lucide) window.lucide.createIcons();
  }

  setupEventListeners() {
    // Show All Categories Reset Button
    const showAllBtn = document.getElementById('showAllCategoriesBtn');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        this.resetCategoryFilter();
      });
    }

    // Temporal Tabs (Past, Present, Future)
    document.querySelectorAll('.temporal-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const timeline = tab.getAttribute('data-timeline');
        if (timeline) {
          this.setTimeline(timeline);
          if (window.soundFx) window.soundFx.playClick();
        }
      });
    });

    // Severity Filter Chips
    document.querySelectorAll('.severity-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.severity-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentSeverity = chip.getAttribute('data-severity') || "all";
        this.updateStatsAndBadges();
        this.applyFilters(true);
        if (window.soundFx) window.soundFx.playClick();
      });
    });

    const resetSeverityBtn = document.getElementById('resetSeverityFilter');
    if (resetSeverityBtn) {
      resetSeverityBtn.addEventListener('click', () => {
        document.querySelectorAll('.severity-chip').forEach(c => c.classList.remove('active'));
        const allChip = document.querySelector('.severity-chip[data-severity="all"]');
        if (allChip) allChip.classList.add('active');
        this.currentSeverity = "all";
        this.updateStatsAndBadges();
        this.applyFilters(true);
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    // Category Buttons — EXCLUSIVE ISOLATION MODE
    document.querySelectorAll('.category-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');

        // If already active, clicking again resets to all
        if (this.currentCategory === cat) {
          this.resetCategoryFilter();
        } else {
          // EXCLUSIVE MODE: Only show points in this category
          this.currentCategory = cat;

          document.querySelectorAll('.category-item-btn').forEach(b => {
            if (b.getAttribute('data-category') === cat) {
              b.classList.add('active');
              b.classList.remove('inactive');
            } else {
              b.classList.remove('active');
              b.classList.add('inactive');
            }
          });

          if (showAllBtn) showAllBtn.classList.remove('hidden');

          // Apply filter on map and 3D globe with auto-framing bounds across Indonesia
          this.applyFilters(true);

          // Update drawer info to the first incident of this category without forceful single-point zoom
          const matchingIncident = INCIDENTS_DATA.find(i => i.category === cat);
          if (matchingIncident) {
            this.populateIncidentDrawer(matchingIncident);
          }
        }

        if (window.soundFx) window.soundFx.playClick();
      });
    });

    // HUD Controls
    const recenterBtn = document.getElementById('recenterIndonesiaBtn');
    const toggleHeatmapBtn = document.getElementById('toggleHeatmapBtn');
    const locateMeBtn = document.getElementById('locateMeBtn');
    const viewModeToggleBtn = document.getElementById('viewModeToggleBtn');
    const sfxToggleBtn = document.getElementById('sfxToggleBtn');
    const sfxIcon = document.getElementById('sfxIcon');

    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => {
        if (window.mapEngine) window.mapEngine.recenterIndonesia();
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    if (toggleHeatmapBtn) {
      toggleHeatmapBtn.addEventListener('click', () => {
        if (window.mapEngine) {
          const active = window.mapEngine.toggleBuffers();
          toggleHeatmapBtn.style.color = active ? '#00f0ff' : '#cbd5e1';
        }
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    if (locateMeBtn) {
      locateMeBtn.addEventListener('click', () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
            if (window.mapEngine && window.mapEngine.map) {
              window.mapEngine.map.flyTo([pos.coords.latitude, pos.coords.longitude], 10);
            }
          }, () => {
            alert("Tidak dapat mengakses GPS browser Anda. Menampilkan peta Jawa.");
          });
        }
      });
    }

    if (viewModeToggleBtn) {
      viewModeToggleBtn.addEventListener('click', () => {
        if (window.mapEngine) window.mapEngine.toggleViewMode();
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    if (sfxToggleBtn) {
      sfxToggleBtn.addEventListener('click', () => {
        if (window.soundFx) {
          const enabled = window.soundFx.toggle();
          if (sfxIcon) {
            sfxIcon.setAttribute('data-lucide', enabled ? 'volume-2' : 'volume-x');
            if (window.lucide) window.lucide.createIcons();
          }
        }
      });
    }

    // Drawer Action Buttons
    const triggerSpeakUpBtn = document.getElementById('triggerSpeakUpBtn');
    const openPovModalBtn = document.getElementById('openPovModalBtn');
    const focusGovtAgencyBtn = document.getElementById('focusGovtAgencyBtn');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');

    if (triggerSpeakUpBtn) {
      triggerSpeakUpBtn.addEventListener('click', () => {
        if (this.activeIncident && window.socialShare) {
          window.socialShare.open(this.activeIncident);
        }
      });
    }

    if (openPovModalBtn) {
      openPovModalBtn.addEventListener('click', () => {
        if (this.activeIncident && window.povViewer) {
          window.povViewer.open(this.activeIncident);
        }
      });
    }

    if (focusGovtAgencyBtn) {
      focusGovtAgencyBtn.addEventListener('click', () => {
        if (this.activeIncident && window.mapEngine) {
          window.mapEngine.flyToAgency(this.activeIncident);
        }
      });
    }

    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        const emptyState = document.getElementById('drawerEmptyState');
        const content = document.getElementById('drawerContent');
        if (emptyState) emptyState.classList.remove('hidden');
        if (content) content.classList.add('hidden');
      });
    }

    // Sidebar Collapsing & Expanding Controls
    const sidebarLeft = document.getElementById('sidebarLeft');
    const collapseLeftBtn = document.getElementById('collapseLeftSidebarBtn');
    const expandLeftBtn = document.getElementById('expandLeftSidebarBtn');

    const inspectorDrawer = document.getElementById('inspectorDrawer');
    const collapseRightBtn = document.getElementById('collapseRightDrawerBtn');
    const expandRightBtn = document.getElementById('expandRightDrawerBtn');

    if (collapseLeftBtn && sidebarLeft) {
      collapseLeftBtn.addEventListener('click', () => {
        sidebarLeft.classList.add('collapsed');
        if (expandLeftBtn) expandLeftBtn.classList.remove('hidden');
        setTimeout(() => {
          if (window.mapEngine && window.mapEngine.map) window.mapEngine.map.invalidateSize();
        }, 320);
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    if (expandLeftBtn && sidebarLeft) {
      expandLeftBtn.addEventListener('click', () => {
        sidebarLeft.classList.remove('collapsed');
        expandLeftBtn.classList.add('hidden');
        setTimeout(() => {
          if (window.mapEngine && window.mapEngine.map) window.mapEngine.map.invalidateSize();
        }, 320);
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    if (collapseRightBtn && inspectorDrawer) {
      collapseRightBtn.addEventListener('click', () => {
        inspectorDrawer.classList.add('collapsed');
        if (expandRightBtn) expandRightBtn.classList.remove('hidden');
        setTimeout(() => {
          if (window.mapEngine && window.mapEngine.map) window.mapEngine.map.invalidateSize();
        }, 320);
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    if (expandRightBtn && inspectorDrawer) {
      expandRightBtn.addEventListener('click', () => {
        inspectorDrawer.classList.remove('collapsed');
        expandRightBtn.classList.add('hidden');
        setTimeout(() => {
          if (window.mapEngine && window.mapEngine.map) window.mapEngine.map.invalidateSize();
        }, 320);
        if (window.soundFx) window.soundFx.playClick();
      });
    }

    // Global Search Autocomplete
    this.setupSearch();
  }

  syncCentralizedVotes() {
    fetch('/api/votes')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.votes) {
          INCIDENTS_DATA.forEach(inc => {
            if (data.votes[inc.id] !== undefined) {
              inc.speakupCount = data.votes[inc.id];
            }
          });
          if (this.activeIncident) {
            this.updateIncidentCounters(this.activeIncident);
          }
          this.renderTopEscalatedList();
        }
      })
      .catch(err => console.warn('Sync votes error', err));

    // Poll periodically every 5 seconds for live real-time sync across all users
    setInterval(() => {
      fetch('/api/votes')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.votes) {
            INCIDENTS_DATA.forEach(inc => {
              if (data.votes[inc.id] !== undefined) {
                inc.speakupCount = data.votes[inc.id];
              }
            });
            if (this.activeIncident) {
              this.updateIncidentCounters(this.activeIncident);
            }
            this.renderTopEscalatedList();
          }
        })
        .catch(() => { });
    }, 5000);
  }

  syncLiveBMKG() {
    fetch('/api/live-bmkg')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.gempa_list && data.gempa_list.length > 0) {
          // Remove old mock gempa points and inject live BMKG verified earthquakes
          const nonGempa = INCIDENTS_DATA.filter(i => i.category !== 'gempa');
          data.gempa_list.forEach(eq => {
            eq.speakupCount = (window.publicVotes && window.publicVotes[eq.id]) || 0;
          });
          INCIDENTS_DATA.length = 0;
          INCIDENTS_DATA.push(...nonGempa, ...data.gempa_list);
          this.updateStatsAndBadges();
          this.applyFilters();
        }
      })
      .catch(err => console.warn('Live BMKG stream notice:', err));
  }

  resetCategoryFilter() {
    this.currentCategory = "all";
    document.querySelectorAll('.category-item-btn').forEach(b => {
      b.classList.remove('inactive');
      b.classList.add('active');
    });
    const showAllBtn = document.getElementById('showAllCategoriesBtn');
    if (showAllBtn) showAllBtn.classList.add('hidden');
    this.updateStatsAndBadges();
    this.applyFilters();
    if (window.mapEngine) window.mapEngine.recenterIndonesia();
  }

  syncLiveKarhutla() {
    fetch('/api/live-karhutla')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.hotspots && data.hotspots.length > 0) {
          // Remove old mock karhutla points and inject all live NASA satellite hotspots across Indonesia
          const nonKarhutla = INCIDENTS_DATA.filter(i => i.category !== 'karhutla');
          data.hotspots.forEach(hotspot => {
            hotspot.speakupCount = (window.publicVotes && window.publicVotes[hotspot.id]) || 0;
          });
          INCIDENTS_DATA.length = 0;
          INCIDENTS_DATA.push(...nonKarhutla, ...data.hotspots);
          this.updateStatsAndBadges();
          this.applyFilters();
        }
      })
      .catch(err => console.warn('Live NASA FIRMS satellite stream notice:', err));
  }

  updateCategoryBadges() {
    this.updateStatsAndBadges();
  }

  setTimeline(timeline) {
    this.currentTimeline = timeline;

    document.querySelectorAll('.temporal-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-timeline') === timeline);
    });

    const pill = document.getElementById('temporalStatusPill');
    const desc = document.getElementById('temporalDesc');

    if (timeline === 'past') {
      if (pill) pill.textContent = "Past (Historis 2018-2024)";
      if (desc) desc.textContent = "Menampilkan arsip historis, siklus bencana masa lalu, dan catatan dampak kerugian.";
    } else if (timeline === 'present') {
      if (pill) pill.textContent = "Present (Real-time)";
      if (desc) desc.textContent = "Menampilkan kejadian aktif yang diverifikasi satelit dan laporan masyarakat saat ini.";
    } else if (timeline === 'future') {
      if (pill) pill.textContent = "Future (Prediksi AI 2027-2030)";
      if (desc) desc.textContent = "Model proyeksi machine learning: mitigasi, risiko iklim, dan estimasi beban wilayah 2030.";
    }

    // Update active incident drawer if open
    if (this.activeIncident) {
      this.populateIncidentDrawer(this.activeIncident);
    }
  }

  applyFilters(autoFitBounds = false) {
    if (window.mapEngine) {
      const count = window.mapEngine.renderMarkers(INCIDENTS_DATA, this.currentCategory, this.currentSeverity, autoFitBounds);
      const totalBadge = document.getElementById('totalActivePointsBadge');
      if (totalBadge) totalBadge.textContent = `${count} Titik`;
    }
  }

  populateIncidentDrawer(inc) {
    this.activeIncident = inc;

    // Auto expand right drawer if collapsed
    const inspectorDrawer = document.getElementById('inspectorDrawer');
    const expandRightBtn = document.getElementById('expandRightDrawerBtn');
    if (inspectorDrawer && inspectorDrawer.classList.contains('collapsed')) {
      inspectorDrawer.classList.remove('collapsed');
      if (expandRightBtn) expandRightBtn.classList.add('hidden');
      setTimeout(() => {
        if (window.mapEngine && window.mapEngine.map) window.mapEngine.map.invalidateSize();
      }, 320);
    }

    const emptyState = document.getElementById('drawerEmptyState');
    const content = document.getElementById('drawerContent');
    if (emptyState) emptyState.classList.add('hidden');
    if (content) content.classList.remove('hidden');

    // Title & Meta
    const badge = document.getElementById('drawerCategoryBadge');
    const sevBadge = document.getElementById('drawerSeverityBadge');
    const title = document.getElementById('drawerTitle');
    const loc = document.getElementById('drawerLocation');
    const coords = document.getElementById('drawerCoordinates');

    // Data Source Tagging
    let sourceOriginTag = "📊 Data Statistik Resmi (Kemenkes/BPS/KLHK)";
    if (inc.category === 'karhutla') {
      sourceOriginTag = "🔴 Live Stream Satelit NASA FIRMS VIIRS NRT";
    } else if (inc.category === 'gempa') {
      sourceOriginTag = "🔴 Live Real-time Seismograf BMKG TEWS";
    } else if (inc.category === 'gunung_api') {
      sourceOriginTag = "🌋 Status Resmi PVMBG Badan Geologi ESDM";
    } else if (inc.category === 'banjir') {
      sourceOriginTag = "🌊 Peringatan Dini Pusdatin BNPB & PUPR";
    }

    if (badge) badge.textContent = `${inc.categoryName || inc.category.toUpperCase()} • ${sourceOriginTag}`;
    if (sevBadge) {
      sevBadge.textContent = inc.severity.toUpperCase();
      sevBadge.className = `severity-badge ${inc.severity}`;
    }
    if (title) title.textContent = inc.title;
    if (loc) loc.textContent = inc.location;
    if (coords) coords.textContent = `Lat: ${inc.lat.toFixed(4)}, Lng: ${inc.lng.toFixed(4)}`;

    const dateEl = document.getElementById('drawerDataDate');
    if (dateEl) {
      dateEl.textContent = `Tanggal & Sumber Data: ${inc.dataDate || "26 Agustus 2026 (Live Terverifikasi)"}`;
    }

    // Metrics (Adapting to active timeline: past / present / future)
    const metricsGrid = document.getElementById('drawerMetricsGrid');
    const temporalHeading = document.getElementById('drawerTemporalHeading');
    const temporalText = document.getElementById('drawerTemporalText');

    const temporalData = inc.temporal ? inc.temporal[this.currentTimeline] : null;

    if (metricsGrid) {
      const activeMetrics = (temporalData && temporalData.metrics) ? temporalData.metrics : inc.metrics;
      metricsGrid.innerHTML = activeMetrics.map(m => `
        <div class="metric-card">
          <span class="m-label">${m.label}</span>
          <span class="m-value">${m.value}</span>
          <span class="m-sub">${m.sub || ''}</span>
        </div>
      `).join('');
    }

    if (temporalHeading && temporalText && temporalData) {
      temporalHeading.textContent = `${temporalData.title} (${this.currentTimeline.toUpperCase()})`;
      temporalText.textContent = temporalData.description;
    }

    // Popularity & Speak Up
    this.updateIncidentCounters(inc);

    // Recommendations
    const stepsList = document.getElementById('drawerActionSteps');
    if (stepsList && inc.recommendations) {
      stepsList.innerHTML = inc.recommendations.map((rec, idx) => `
        <div class="action-step-item">
          <span class="action-step-num">${idx + 1}</span>
          <span>${rec}</span>
        </div>
      `).join('');
    }

    // Government Agency Details
    if (inc.govtAgency) {
      const g = inc.govtAgency;
      const gName = document.getElementById('govtName');
      const gDist = document.getElementById('govtDistance');
      const gAddr = document.getElementById('govtAddress');
      const gCoords = document.getElementById('govtCoords');
      const gHotline = document.getElementById('govtHotline');
      const gEmail = document.getElementById('govtEmail');
      const gCall = document.getElementById('govtCallLink');
      const gWa = document.getElementById('govtWaLink');

      if (gName) gName.textContent = g.name;
      if (gDist) gDist.textContent = `${g.distanceKm} km dari lokasi`;
      if (gAddr) gAddr.textContent = g.address;
      if (gCoords) gCoords.textContent = `Koordinat: ${g.lat.toFixed(4)}, ${g.lng.toFixed(4)}`;
      if (gHotline) gHotline.textContent = `Hotline: ${g.hotline}`;
      if (gEmail) gEmail.textContent = g.email;
      if (gCall) gCall.href = `tel:${g.hotline.split('/')[0].replace(/[^0-9]/g, '')}`;
      if (gWa) gWa.href = `https://wa.me/${g.whatsapp}?text=${encodeURIComponent(`Halo ${g.name}, saya melaporkan perkembangan insiden ${inc.title} di ${inc.location} melalui platform SpeakUp Indonesia.`)}`;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  updateIncidentCounters(inc) {
    const speakupCountEl = document.getElementById('drawerSpeakupCount');
    const meterFill = document.getElementById('drawerSpeakupMeterFill');
    const urgencyText = document.getElementById('drawerUrgencyText');

    const count = inc.speakupCount || 0;
    if (speakupCountEl) speakupCountEl.textContent = `${count.toLocaleString()} Suara`;

    // Scale meter fill based on initial goal of 100 votes for a new point
    const targetGoal = 100;
    const percent = Math.min(100, Math.max(count > 0 ? 5 : 0, Math.round((count / targetGoal) * 100)));
    if (meterFill) meterFill.style.width = `${percent}%`;

    if (urgencyText) {
      if (count === 0) {
        urgencyText.textContent = "Jadilah orang pertama yang meng-SpeakUp titik ini untuk menarik perhatian instansi penanggung jawab!";
        urgencyText.style.color = "#94a3b8";
      } else if (count < 10) {
        urgencyText.textContent = `Titik ini mulai mendapat atensi (${count} suara). Sebarkan ke warga lainnya!`;
        urgencyText.style.color = "#ffb703";
      } else {
        urgencyText.textContent = `🔥 Tingkat atensi tinggi (${count} suara)! Telah diteruskan dalam radar pemantauan publik.`;
        urgencyText.style.color = "#ff2a55";
      }
    }

    this.renderTopEscalatedList();
  }

  updateStatsAndBadges() {
    // Count per category taking active severity filter into account
    const counts = {};
    Object.keys(CATEGORIES_CONFIG).forEach(k => counts[k] = 0);

    let socialTotal = 0;
    let disasterTotal = 0;
    const activeSev = this.currentSeverity || "all";

    INCIDENTS_DATA.forEach(inc => {
      const matchesSeverity = activeSev === "all" || inc.severity === activeSev;
      if (matchesSeverity) {
        counts[inc.category] = (counts[inc.category] || 0) + 1;
        const config = CATEGORIES_CONFIG[inc.category];
        if (config && config.group === 'sosial') socialTotal++;
        if (config && config.group === 'bencana') disasterTotal++;
      }
    });

    Object.keys(CATEGORIES_CONFIG).forEach(cat => {
      const badge = document.getElementById(`count-${cat}`);
      if (badge) {
        const val = counts[cat] || 0;
        badge.textContent = val;
        badge.style.opacity = val === 0 ? "0.45" : "1";
      }
    });

    const totalActiveMatching = Object.values(counts).reduce((a, b) => a + b, 0);
    const totalBadge = document.getElementById('totalActivePointsBadge');
    const socialBadge = document.getElementById('socialCountBadge');
    const disasterBadge = document.getElementById('disasterCountBadge');

    if (totalBadge) totalBadge.textContent = `${totalActiveMatching} Titik`;
    if (socialBadge) socialBadge.textContent = socialTotal;
    if (disasterBadge) disasterBadge.textContent = disasterTotal;
  }

  renderTopEscalatedList() {
    const listEl = document.getElementById('topEscalatedList');
    if (!listEl) return;

    // Sort by speakupCount descending
    const sorted = [...INCIDENTS_DATA].sort((a, b) => b.speakupCount - a.speakupCount).slice(0, 3);

    listEl.innerHTML = sorted.map(inc => `
      <div class="top-item" onclick="window.mapEngine.selectIncident('${inc.id}')">
        <span class="t-name">📢 ${inc.title.split('—')[0].trim()}</span>
        <span class="t-votes">${inc.speakupCount.toLocaleString()} ↗</span>
      </div>
    `).join('');
  }

  startAlertTicker() {
    const tickerContent = document.getElementById('alertTickerContent');
    if (!tickerContent) return;

    const alerts = [
      "🚨 ERUPSI MERAPI: Guguran awan panas 2.800m ke Kali Krasak. Status Level III Siaga.",
      "🌊 BANJIR DEMAK-KUDUS: Tanggul Sungai Wulan jebol, jalur Pantura lumpuh 2 meter.",
      "⚠️ TPA BANTAR GEBANG: Volume sampah tembus 55 juta ton, desakan RDF Plant & ITF.",
      "👶 STUNTING TTS NTT: 14.200 balita dalam program percepatan Dapur Sehat DASHAT.",
      "🔥 KARHUTLA RIAU: 86 titik hotspot gambut terpantau, ISPU 285 Sangat Tidak Sehat.",
      "📚 PENDIDIKAN NDUGA: Rasio 1 sekolah : 1.157 anak, tuntutan Sekolah Asrama Terpadu."
    ];

    setInterval(() => {
      this.tickerIndex = (this.tickerIndex + 1) % alerts.length;
      tickerContent.textContent = alerts[this.tickerIndex];
    }, 6000);

    tickerContent.textContent = alerts[0];
  }

  setupSearch() {
    const input = document.getElementById('globalSearchInput');
    const dropdown = document.getElementById('searchResultsDropdown');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (!input || !dropdown) return;

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
      }
    });

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        dropdown.classList.add('hidden');
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
      }

      if (clearBtn) clearBtn.classList.remove('hidden');

      const matches = INCIDENTS_DATA.filter(inc => {
        return inc.title.toLowerCase().includes(q) ||
          inc.location.toLowerCase().includes(q) ||
          inc.categoryName.toLowerCase().includes(q) ||
          (inc.govtAgency && inc.govtAgency.name.toLowerCase().includes(q));
      });

      if (matches.length === 0) {
        dropdown.innerHTML = `<div style="padding: 12px; font-size: 12px; color: #94a3b8; text-align: center;">Tidak ditemukan titik bencana atau lembaga untuk "${input.value}"</div>`;
      } else {
        dropdown.innerHTML = matches.map(inc => `
          <div class="search-result-item" onclick="window.app.handleSearchResultClick('${inc.id}')">
            <div class="s-title">${inc.title}</div>
            <div class="s-meta">
              <span>📍 ${inc.location}</span>
              <span>•</span>
              <span style="color: #ff9900;">🔥 ${inc.speakupCount.toLocaleString()} Suara</span>
            </div>
          </div>
        `).join('');
      }

      dropdown.classList.remove('hidden');
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        dropdown.classList.add('hidden');
        clearBtn.classList.add('hidden');
      });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-box')) {
        dropdown.classList.add('hidden');
      }
    });
  }

  handleSearchResultClick(id) {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (dropdown) dropdown.classList.add('hidden');
    if (window.mapEngine) window.mapEngine.selectIncident(id);
  }
}

// Global Startup
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SpeakUpApp();
  window.app.init();
});
