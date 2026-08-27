/**
 * SpeakUp Indonesia — Social Escalation & Viral Share System
 * Manages citizen upvoting, confetti celebrations, Twitter/WhatsApp broadcasts, and Story Card generation.
 */

class SocialShareSystem {
  constructor() {
    this.modal = null;
    this.currentIncident = null;
    this.votedPoints = new Set();
  }

  init() {
    this.modal = document.getElementById('speakUpModal');

    const closeBtn = document.getElementById('closeSpeakUpModalBtn');
    const twitterBtn = document.getElementById('shareTwitterBtn');
    const waBtn = document.getElementById('shareWhatsAppBtn');
    const copyBtn = document.getElementById('copyShareLinkBtn');
    const downloadBtn = document.getElementById('downloadCardImageBtn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (twitterBtn) twitterBtn.addEventListener('click', () => this.shareToTwitter());
    if (waBtn) waBtn.addEventListener('click', () => this.shareToWhatsApp());
    if (copyBtn) copyBtn.addEventListener('click', () => this.copyReportTemplate());
    if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadStoryCard());
  }

  open(incident) {
    if (!incident) return;
    this.currentIncident = incident;

    // Upvote incident citizen counter via centralized Server API
    if (!this.votedPoints.has(incident.id)) {
      this.votedPoints.add(incident.id);
      
      // Call Centralized Public API
      fetch('/api/speakup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: incident.id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          incident.speakupCount = data.new_count;
          if (window.app) window.app.updateIncidentCounters(incident);
          const cardVotes = document.getElementById('shareCardVotes');
          if (cardVotes) cardVotes.textContent = `${incident.speakupCount.toLocaleString()} Warga Telah Bersuara`;
        }
      })
      .catch(() => {
        // Fallback local increment if server unreachable
        incident.speakupCount = (incident.speakupCount || 0) + 1;
        if (window.app) window.app.updateIncidentCounters(incident);
      });
      
      // Trigger sound & confetti
      if (window.soundFx) window.soundFx.playSpeakUpSuccess();
      this.fireConfetti();

      const banner = document.getElementById('supportSuccessBanner');
      if (banner) banner.classList.remove('hidden');
    }

    // Populate Share Card Preview
    const cardSeverity = document.getElementById('shareCardSeverity');
    const cardTitle = document.getElementById('shareCardTitle');
    const cardLocation = document.getElementById('shareCardLocation');
    const cardMetrics = document.getElementById('shareCardMetrics');
    const cardGovt = document.getElementById('shareCardGovt');
    const cardVotes = document.getElementById('shareCardVotes');

    if (cardSeverity) cardSeverity.textContent = incident.severity.toUpperCase();
    if (cardTitle) cardTitle.textContent = incident.title;
    if (cardLocation) cardLocation.innerHTML = `<i data-lucide="map-pin" class="w-3.5 h-3.5 inline text-rose-400"></i> ${incident.location}`;
    
    if (cardMetrics && incident.metrics) {
      cardMetrics.innerHTML = incident.metrics.slice(0, 2).map(m => `
        <div>
          <span style="font-size: 10px; color: #94a3b8; display: block;">${m.label}</span>
          <strong style="font-size: 13px; color: #00f0ff;">${m.value}</strong>
        </div>
      `).join('');
    }

    if (cardGovt && incident.govtAgency) {
      cardGovt.textContent = `${incident.govtAgency.name} (${incident.govtAgency.distanceKm} km)`;
    }

    if (cardVotes) {
      cardVotes.textContent = `${incident.speakupCount.toLocaleString()} Warga Telah Bersuara`;
    }

    if (window.lucide) window.lucide.createIcons();

    if (this.modal) this.modal.classList.remove('hidden');

    // Update app UI counters
    if (window.app) {
      window.app.updateIncidentCounters(incident);
    }
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }

  fireConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff2a55', '#ff9900', '#00e676']
      });
    }
  }

  shareToTwitter() {
    if (!this.currentIncident) return;
    const inc = this.currentIncident;
    const text = `📢 SAYA BERSUARA (SPEAK UP) UNTUK: ${inc.title} di ${inc.location}!\n\n` +
      `🔥 Sudah ${inc.speakupCount.toLocaleString()} warga menuntut transparansi & penanganan cepat dari instansi terkait: ${inc.govtAgency ? inc.govtAgency.name : 'Pemerintah'}.\n\n` +
      `Kawal bersama di SpeakUp Indonesia: https://speakup.id/bencana #${inc.category} #SpeakUpID #KawalBencana #SuaraRakyat`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  shareToWhatsApp() {
    if (!this.currentIncident) return;
    const inc = this.currentIncident;
    const text = `*🚨 SPEAKUP INDONESIA — LAPORAN SUARA RAKYAT*\n\n` +
      `*${inc.title}*\n` +
      `📍 Lokasi: ${inc.location}\n` +
      `⚠️ Tingkat Keparahan: ${inc.severity.toUpperCase()}\n` +
      `🏛️ Lembaga Terdekat: ${inc.govtAgency ? inc.govtAgency.name : '-'}\n` +
      `🔥 Popularitas: ${inc.speakupCount.toLocaleString()} warga telah meng-speakup titik ini!\n\n` +
      `Mari bantu viralkan agar pemerintah segera bertindak cepat!\n` +
      `Pantau titik & rekomendasinya di: https://speakup.id`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  copyReportTemplate() {
    if (!this.currentIncident) return;
    const inc = this.currentIncident;
    const text = `[LAPORAN PUBLIK SPEAKUP INDONESIA]\n` +
      `Topik: ${inc.title}\n` +
      `Lokasi: ${inc.location} (Lat: ${inc.lat}, Lng: ${inc.lng})\n` +
      `Status: ${inc.severity.toUpperCase()}\n` +
      `Instansi Berwenang: ${inc.govtAgency ? inc.govtAgency.name : '-'}\n` +
      `Kontak Hotline: ${inc.govtAgency ? inc.govtAgency.hotline : '-'}\n` +
      `Rekomendasi Utama: ${inc.recommendations ? inc.recommendations[0] : '-'}\n` +
      `Dukungan Suara: ${inc.speakupCount} warga.\n` +
      `Tautan Pemantauan: https://speakup.id`;

    navigator.clipboard.writeText(text).then(() => {
      const copyTextEl = document.getElementById('copyLinkText');
      if (copyTextEl) {
        copyTextEl.textContent = "✅ Berhasil Disalin ke Clipboard!";
        setTimeout(() => {
          copyTextEl.textContent = "Salin Tautan & Template Laporan";
        }, 3000);
      }
    });
  }

  downloadStoryCard() {
    if (!this.currentIncident) return;
    const inc = this.currentIncident;

    // Create offscreen canvas for crisp Instagram Story export
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#060a12');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative Neon Border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(60, 60, 960, 1800);

    // App Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 56px 'Outfit', sans-serif";
    ctx.fillText("SPEAK", 100, 160);
    ctx.fillStyle = '#00f0ff';
    ctx.fillText("UP", 300, 160);
    ctx.fillStyle = '#94a3b8';
    ctx.font = "32px 'JetBrains Mono', monospace";
    ctx.fillText("INDONESIA — SUARA RAKYAT", 100, 210);

    // Severity Tag
    ctx.fillStyle = '#ff2a55';
    ctx.fillRect(100, 270, 240, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 30px 'JetBrains Mono', monospace";
    ctx.fillText(inc.severity.toUpperCase(), 130, 312);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 64px 'Outfit', sans-serif";
    this.wrapText(ctx, inc.title, 100, 420, 880, 80);

    // Location
    ctx.fillStyle = '#38bdf8';
    ctx.font = "40px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`📍 ${inc.location}`, 100, 620);

    // Metrics Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(100, 680, 880, 260);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 680, 880, 260);

    if (inc.metrics && inc.metrics[0]) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = "32px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(inc.metrics[0].label, 140, 750);
      ctx.fillStyle = '#00f0ff';
      ctx.font = "bold 56px 'Outfit', sans-serif";
      ctx.fillText(inc.metrics[0].value, 140, 820);
    }

    if (inc.metrics && inc.metrics[1]) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = "32px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(inc.metrics[1].label, 560, 750);
      ctx.fillStyle = '#ff9900';
      ctx.font = "bold 56px 'Outfit', sans-serif";
      ctx.fillText(inc.metrics[1].value, 560, 820);
    }

    // Govt Agency
    ctx.fillStyle = '#e2e8f0';
    ctx.font = "34px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("🏛️ Instansi Penanggung Jawab Terdekat:", 100, 1020);
    ctx.fillStyle = '#f59e0b';
    ctx.font = "bold 42px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(inc.govtAgency ? inc.govtAgency.name : "-", 100, 1080);
    ctx.fillStyle = '#94a3b8';
    ctx.font = "32px 'JetBrains Mono', monospace";
    ctx.fillText(`Hotline: ${inc.govtAgency ? inc.govtAgency.hotline : '-'} | Jarak: ${inc.govtAgency ? inc.govtAgency.distanceKm : 0} km`, 100, 1140);

    // Citizen Upvote Badge
    ctx.fillStyle = 'rgba(255, 42, 85, 0.2)';
    ctx.fillRect(100, 1260, 880, 160);
    ctx.strokeStyle = '#ff2a55';
    ctx.strokeRect(100, 1260, 880, 160);

    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 48px 'Outfit', sans-serif";
    ctx.fillText(`🔥 ${inc.speakupCount.toLocaleString()} Warga Telah Meng-SpeakUp!`, 140, 1360);

    // Call to Action
    ctx.fillStyle = '#38bdf8';
    ctx.font = "36px 'JetBrains Mono', monospace";
    ctx.fillText("#SpeakUpID #KawalBencana #SuaraRakyat", 100, 1600);
    ctx.fillStyle = '#64748b';
    ctx.font = "30px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Pantau langsung di https://speakup.id", 100, 1660);

    // Download trigger
    const link = document.createElement('a');
    link.download = `SpeakUp_${inc.id}_StoryCard.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }
}

window.socialShare = new SocialShareSystem();
