/**
 * SpeakUp Indonesia — AI Voice Assistant (Garuda AI)
 * Speech-to-Text & Text-to-Speech in Indonesian with intelligent action intent parser.
 */

class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isRecording = false;
    this.isSupported = false;
    this.modal = null;
    this.statusText = null;
    this.dialogueBox = null;
    this.barsContainer = null;
  }

  init() {
    this.modal = document.getElementById('voiceAssistantModal');
    this.statusText = document.getElementById('voiceStatusText');
    this.dialogueBox = document.getElementById('assistantDialogueBox');
    this.barsContainer = document.querySelector('.voice-waveform-area');

    // Check Speech Recognition API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'id-ID';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.updateMicUi(true);
        if (this.statusText) this.statusText.textContent = "Mendengarkan suara Anda...";
        if (this.barsContainer) this.barsContainer.classList.add('voice-recording');
        if (window.soundFx) window.soundFx.playVoiceChime();
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.handleUserQuery(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (this.statusText) this.statusText.textContent = `Perekaman selesai. Tekan mic untuk mencoba lagi.`;
        this.isRecording = false;
        this.updateMicUi(false);
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.updateMicUi(false);
        if (this.barsContainer) this.barsContainer.classList.remove('voice-recording');
      };

      this.isSupported = true;
    }

    // Modal Trigger Buttons
    const headerVoiceBtn = document.getElementById('voiceAssistantHeaderBtn');
    const closeBtn = document.getElementById('closeVoiceAssistantBtn');
    const micRecordBtn = document.getElementById('toggleMicRecordingBtn');
    const sendVoiceTextBtn = document.getElementById('sendVoiceTextBtn');
    const voiceTextInput = document.getElementById('voiceTextInput');

    if (headerVoiceBtn) headerVoiceBtn.addEventListener('click', () => this.open());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (micRecordBtn) micRecordBtn.addEventListener('click', () => this.toggleListening());
    
    if (sendVoiceTextBtn && voiceTextInput) {
      sendVoiceTextBtn.addEventListener('click', () => {
        if (voiceTextInput.value.trim()) {
          this.handleUserQuery(voiceTextInput.value.trim());
          voiceTextInput.value = '';
        }
      });

      voiceTextInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && voiceTextInput.value.trim()) {
          this.handleUserQuery(voiceTextInput.value.trim());
          voiceTextInput.value = '';
        }
      });
    }

    // Quick Command Chips
    document.querySelectorAll('.cmd-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) this.handleUserQuery(cmd);
      });
    });
  }

  open() {
    if (this.modal) this.modal.classList.remove('hidden');
    if (window.soundFx) window.soundFx.playRadarPing();
  }

  close() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.modal) this.modal.classList.add('hidden');
  }

  toggleListening() {
    if (!this.isSupported) {
      this.addMessage("bot", "Fitur mikrofon tidak didukung di browser ini. Silakan gunakan kolom teks di bawah.");
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn("Speech recognition start failed", e);
      }
    }
  }

  updateMicUi(recording) {
    const btn = document.getElementById('toggleMicRecordingBtn');
    const label = document.getElementById('micBtnLabel');
    if (btn) {
      if (recording) {
        btn.classList.add('recording');
        if (label) label.textContent = "Sedang Mendengarkan...";
      } else {
        btn.classList.remove('recording');
        if (label) label.textContent = "Bicara Sekarang";
      }
    }
  }

  handleUserQuery(query) {
    this.addMessage("user", query);
    const lower = query.toLowerCase();

    let response = "";
    let actionExecuted = false;

    // 1. Navigation to Specific Incidents
    if (lower.includes("merapi") || lower.includes("gunung merapi")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "disaster-merapi-01");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Baik, saya telah mengarahkan peta ke Erupsi Gunung Merapi di Magelang dan Sleman. Status aktivitas saat ini adalah Level III Siaga.`;
        actionExecuted = true;
      }
    } else if (lower.includes("semeru") || lower.includes("lumajang")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "disaster-gunung-semeru-02");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Membawa Anda ke titik Erupsi Gunung Semeru di Jawa Timur dengan awan panas guguran.`;
        actionExecuted = true;
      }
    } else if (lower.includes("banjir demak") || lower.includes("demak") || lower.includes("kudus")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "disaster-banjir-demak-01");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Menampilkan titik banjir ekstrem tanggul jebol di Demak dan Kudus. Ketinggian air mencapai 2 meter lebih.`;
        actionExecuted = true;
      }
    } else if (lower.includes("jakarta") || lower.includes("ciliwung")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "disaster-banjir-jakarta-02");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Mengarahkan ke pemantauan banjir DAS Ciliwung Jakarta.`;
        actionExecuted = true;
      }
    } else if (lower.includes("cianjur") || lower.includes("gempa")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "disaster-gempa-cianjur-01");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Menampilkan data aktivitas seismik Sesar Cugenang di Cianjur.`;
        actionExecuted = true;
      }
    } else if (lower.includes("riau") || lower.includes("karhutla") || lower.includes("kebakaran")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "disaster-karhutla-riau-01");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Membuka titik kebakaran hutan gambut di Rokan Hilir Riau dengan ISPU 285.`;
        actionExecuted = true;
      }
    } else if (lower.includes("stunting") || lower.includes("gizi") || lower.includes("ntt")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "social-stunting-ntt-01");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Membuka data masalah sosial prevalensi stunting balita di Timor Tengah Selatan, NTT.`;
        actionExecuted = true;
      }
    } else if (lower.includes("sekolah") || lower.includes("pendidikan") || lower.includes("papua") || lower.includes("nduga")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "social-pendidikan-nduga-01");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Mengarahkan ke krisis fasilitas pendidikan di Nduga, Papua Pegunungan.`;
        actionExecuted = true;
      }
    } else if (lower.includes("sampah") || lower.includes("bantar gebang") || lower.includes("bekasi")) {
      const inc = INCIDENTS_DATA.find(i => i.id === "social-sampah-bantargebang-01");
      if (inc && window.mapEngine) {
        window.mapEngine.selectIncident(inc.id);
        response = `Menampilkan status kelebihan kapasitas gunungan sampah TPA Bantar Gebang Bekasi.`;
        actionExecuted = true;
      }
    }

    // 2. Action: Bring to Nearest Responsible Government Agency (As requested)
    if (lower.includes("lembaga") || lower.includes("instansi") || lower.includes("pemerintah") || lower.includes("bpbd") || lower.includes("penanggung jawab")) {
      const activeInc = window.app ? window.app.activeIncident : INCIDENTS_DATA[0];
      if (activeInc && activeInc.govtAgency) {
        if (window.mapEngine) window.mapEngine.flyToAgency(activeInc);
        response = `Saya telah membawa pandangan Anda ke kantor instansi penanggung jawab terdekat: ${activeInc.govtAgency.name}, berjarak ${activeInc.govtAgency.distanceKm} km dari lokasi insiden.`;
        actionExecuted = true;
      }
    }

    // 3. Action: Open POV / Street View
    if (lower.includes("pov") || lower.includes("street view") || lower.includes("lihat kondisi") || lower.includes("lapangan") || lower.includes("foto")) {
      const activeInc = window.app ? window.app.activeIncident : INCIDENTS_DATA[0];
      if (activeInc && window.povViewer) {
        window.povViewer.open(activeInc);
        response = `Membuka inspeksi Point of View 360 derajat kondisi lapangan untuk ${activeInc.title}.`;
        actionExecuted = true;
      }
    }

    // 4. Action: Temporal Change
    if (lower.includes("masa depan") || lower.includes("prediksi") || lower.includes("future")) {
      if (window.app) window.app.setTimeline("future");
      response = `Beralih ke model prediksi AI masa depan 2027-2030.`;
      actionExecuted = true;
    } else if (lower.includes("masa lalu") || lower.includes("sejarah") || lower.includes("past") || lower.includes("historis")) {
      if (window.app) window.app.setTimeline("past");
      response = `Menampilkan data historis dan arsip masa lalu 2018-2024.`;
      actionExecuted = true;
    } else if (lower.includes("sekarang") || lower.includes("present") || lower.includes("aktual") || lower.includes("saat ini")) {
      if (window.app) window.app.setTimeline("present");
      response = `Kembali ke data pemantauan langsung saat ini (Present).`;
      actionExecuted = true;
    }

    // 5. Action: Speak Up / Upvote
    if (lower.includes("speak up") || lower.includes("suara") || lower.includes("dukung") || lower.includes("viralkan")) {
      const activeInc = window.app ? window.app.activeIncident : INCIDENTS_DATA[0];
      if (activeInc && window.socialShare) {
        window.socialShare.open(activeInc);
        response = `Membuka form eskalasi Speak Up dan menambahkan suara Anda untuk titik ini!`;
        actionExecuted = true;
      }
    }

    // Fallback response if no specific keyword matched
    if (!actionExecuted) {
      response = `Saya memahami pertanyaan Anda. Anda dapat meminta saya: "Bawa saya ke Merapi", "Tunjukkan lembaga terdekat", "Buka POV", atau "Lihat prediksi masa depan".`;
    }

    this.addMessage("bot", response);
    this.speak(response);
  }

  addMessage(sender, text) {
    if (!this.dialogueBox) return;
    const bubble = document.createElement('div');
    bubble.className = `assistant-bubble ${sender}`;
    bubble.textContent = text;
    this.dialogueBox.appendChild(bubble);
    this.dialogueBox.scrollTop = this.dialogueBox.scrollHeight;
  }

  speak(text) {
    if (!this.synth) return;
    this.synth.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try to find Indonesian voice
    const voices = this.synth.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) utterance.voice = idVoice;

    this.synth.speak(utterance);
  }
}

window.voiceAssistant = new VoiceAssistant();
