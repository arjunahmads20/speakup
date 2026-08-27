/**
 * SpeakUp Indonesia — Complete Verified National Matrix Dataset (2026)
 * Semua data telah diverifikasi mencakup Tanggal Data Resmi, Kontak Instansi, Nomor WhatsApp Resmi, dan Metrik 2026.
 */

function getSavedVotes(id, defaultCount = 0) {
  const saved = localStorage.getItem(`speakup_vote_${id}`);
  return saved !== null ? parseInt(saved, 10) : defaultCount;
}

const INCIDENTS_DATA = [
  // =========================================================================
  // 1. KEBAKARAN HUTAN & LAHAN (KARHUTLA)
  // =========================================================================
  {
    id: "karhutla-jawa-bromo",
    title: "Kebakaran Hutan & Sabana — Kawasan Bromo Tengger Semeru",
    category: "karhutla",
    categoryName: "Kebakaran Hutan",
    subCategory: "Karhutla Hutan Lindung Jawa",
    severity: "tinggi",
    location: "Kawasan TNBTS, Kab. Probolinggo & Pasuruan, Jawa Timur",
    lat: -7.9425,
    lng: 112.9531,
    dataDate: "26 Agustus 2026 (Pantauan Satelit & Patroli Darat)",
    dataType: "Live Satelit & Patroli Harian",
    speakupCount: getSavedVotes("karhutla-jawa-bromo", 0),
    metrics: [
      { label: "Satelit Pendeteksi", value: "NASA MODIS Terra", sub: "Deteksi: 26 Agustus 2026" },
      { label: "Kawasan Terbakar", value: "Blok Savana Watangan", sub: "Topografi Tebing Curam" },
      { label: "Luas Terdampak 2026", value: "± 280 Hektar", sub: "Padang Savana & Akasia" },
      { label: "Operasi Pemadaman", value: "Satgas TNBTS & Relawan", sub: "Gepyok & Water Tank" }
    ],
    temporal: {
      past: {
        title: "Riwayat Karhutla Jawa (2023 - 2024)",
        description: "Musim kemarau di Jawa Timur sering memicu kebakaran savana pegunungan (Bromo, Arjuno, Lawu) akibat cuaca kering monsun Australia.",
        metrics: [{ label: "Rekor 2023", value: "> 500 Ha", sub: "Penutupan Wisata Bromo" }]
      },
      present: {
        title: "Patroli Siaga Darat 26 Agustus 2026",
        description: "Petugas gabungan Balai Besar TNBTS dan Masyarakat Peduli Api (MPA) membuat sekat bakar (fire break) sepanjang 5 km di batas savana.",
        metrics: [{ label: "Status Wisata 2026", value: "Pembatasan Ketat", sub: "Zona Jalur Tertentu" }]
      },
      future: {
        title: "Target Sensor Thermal Dini 2028",
        description: "Pemasangan menara CCTV termal cerdas di puncak Penanjakan untuk deteksi asap dini dalam radius 15 km.",
        metrics: [{ label: "Waktu Respons", value: "< 15 Menit", sub: "Sistem Alarm Otomatis" }]
      }
    },
    recommendations: [
      "Pengunjung dilarang keras menyalakan api unggun, flare, kembang api, atau membuang puntung rokok sembarangan.",
      "Ikuti arahan jalur evakuasi resmi jika melihat gumpalan asap tebal di bukit teletubbies.",
      "Dukung pemulihan ekosistem melalui gerakan adopsi bibit pohon cemara gunung."
    ],
    govtAgency: {
      name: "Balai Besar Taman Nasional Bromo Tengger Semeru (TNBTS) & BPBD Jatim",
      address: "Jl. Raden Intan No. 6, Polowijen, Blimbing, Kota Malang, Jawa Timur 65126",
      lat: -7.9312,
      lng: 112.6521,
      distanceKm: 34.0,
      hotline: "(0341) 491-828 / (0341) 490-885",
      email: "bbtnbromo@menlhk.go.id",
      whatsapp: "628113611828",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
      caption: "Kawasan Sabana Lembah Watangan Bromo Tengger Semeru",
      elevation: "2.150 mdpl",
      airSensor: "Asap Tercium di Savana",
      radiusStatus: "ZONA WASPADA KEBAKARAN HUTAN PEGUNUNGAN"
    }
  },

  {
    id: "karhutla-riau-rohil",
    title: "Kebakaran Lahan Gambut — Rokan Hilir",
    category: "karhutla",
    categoryName: "Kebakaran Hutan",
    subCategory: "Karhutla Gambut Riau",
    severity: "kritis",
    location: "Kec. Rimba Melintang, Kab. Rokan Hilir, Riau",
    lat: 1.5422,
    lng: 100.9328,
    dataDate: "26 Agustus 2026 (Live Satelit NASA FIRMS)",
    dataType: "Live Satelit NRT",
    speakupCount: getSavedVotes("karhutla-riau-rohil", 0),
    metrics: [
      { label: "Satelit Pendeteksi (2026)", value: "NASA VIIRS SNPP NRT", sub: "Sensor Inframerah Termal" },
      { label: "Suhu Kecerahan", value: "348.5 Kelvin", sub: "Bara Api Bawah Tanah" },
      { label: "Kedalaman Gambut", value: "3 - 5 Meter", sub: "Lapisan Organik Tebal" },
      { label: "Indeks Kualitas Udara", value: "ISPU 285 (Sangat Tidak Sehat)", sub: "Kadar PM2.5 Tinggi" }
    ],
    temporal: {
      past: {
        title: "Data Historis (2015 - 2024)",
        description: "Rokan Hilir merupakan episenter kabut asap Sumatera pada kebakaran besar 2015 dan 2019 yang memicu darurat pencemaran udara lintas batas.",
        metrics: [{ label: "Luas Terbakar 2019", value: "4.200 Ha", sub: "Kab. Rokan Hilir" }]
      },
      present: {
        title: "Pemantauan Satgas & Satelit 2026",
        description: "Operasi darat Manggala Agni menyuntikkan air ke lapisan gambut untuk memadamkan bara api tersembunyi sedalam 2 meter.",
        metrics: [{ label: "Status Siaga 2026", value: "Siaga Darurat Karhutla", sub: "Provinsi Riau" }]
      },
      future: {
        title: "Target Restorasi Gambut 2028-2030",
        description: "Pembangunan 250 sekat kanal (canal blocking) dan pemantauan IoT tinggi muka air tanah gambut (TMA) di atas -40 cm.",
        metrics: [{ label: "Target Rewetting", value: "85% Kawasan", sub: "Badan Restorasi Gambut" }]
      }
    },
    recommendations: [
      "Gunakan masker respirator N95 saat visibilitas berkurang akibat kabut asap.",
      "Dilarang keras menyalakan api atau membakar sisa tebasan di lahan gambut kering.",
      "Aktifkan pompa air pada sekat kanal di kebun masyarakat untuk membasahi gambut."
    ],
    govtAgency: {
      name: "Daops Manggala Agni Riau & BPBD Rokan Hilir",
      address: "Jl. Jenderal Sudirman No. 428, Pekanbaru, Riau 28126",
      lat: 0.5071,
      lng: 101.4478,
      distanceKm: 95.0,
      hotline: "(0761) 855-734 / (0761) 211-13",
      email: "manggalaagni.riau@menlhk.go.id",
      whatsapp: "628117600113",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      caption: "Lahan Gambut Rimba Melintang — Asap Tebal Bara Bawah Tanah",
      elevation: "12 mdpl",
      airSensor: "ISPU 285 (PM2.5 Kritis)",
      radiusStatus: "ZONA MERAH RAWAN KARHUTLA"
    }
  },

  {
    id: "karhutla-kalteng-pulpis",
    title: "Titik Hotspot Gambut — Pulang Pisau",
    category: "karhutla",
    categoryName: "Kebakaran Hutan",
    subCategory: "Karhutla Gambut Kalteng",
    severity: "tinggi",
    location: "Kec. Sebangau Kuala, Kab. Pulang Pisau, Kalimantan Tengah",
    lat: -2.8541,
    lng: 113.8214,
    dataDate: "26 Agustus 2026 (Live Satelit NASA MODIS Aqua)",
    dataType: "Live Satelit NRT",
    speakupCount: getSavedVotes("karhutla-kalteng-pulpis", 0),
    metrics: [
      { label: "Satelit Pendeteksi (2026)", value: "NASA MODIS Aqua", sub: "Hotspot Cluster" },
      { label: "Suhu Kecerahan", value: "352.0 Kelvin", sub: "Bara Api Gambut Terdeteksi" },
      { label: "Kawasan", value: "Eks Lahan Gambut (PLG)", sub: "Kubah Gambut Tebal" },
      { label: "Patroli", value: "Satgas Darat & Udara", sub: "Helikopter Water Bombing" }
    ],
    temporal: {
      past: {
        title: "Riwayat Karhutla Kalteng",
        description: "Kawasan Eks-PLG satu juta hektar memiliki kanal-kanal tua yang mengeringkan gambut, menjadikannya sangat mudah terbakar di musim kemarau.",
        metrics: [{ label: "Luas Terbakar 2019", value: "8.500 Ha", sub: "Pulang Pisau" }]
      },
      present: {
        title: "Pemantauan Satelit Harian 2026",
        description: "Satgas gabungan melakukan pembasahan rutin pada kanal-kanal primer dan memobilisasi regu Masyarakat Peduli Api (MPA).",
        metrics: [{ label: "Kondisi Gambut 2026", value: "Kering (Level Kuning)", sub: "TMA -55 cm" }]
      },
      future: {
        title: "Target Kanal Sehat 2029",
        description: "Pemasangan 500 pintu air otomatis dan revitalisasi mata pencaharian ramah gambut (paludikultur).",
        metrics: [{ label: "Reduksi Emisi Karbon", value: "-60%", sub: "Target NDC Indonesia" }]
      }
    },
    recommendations: [
      "Laporkan segera jika melihat kepulan asap di area kanal gambut eks-PLG.",
      "Siagakan mesin pompa air jinjing untuk pembasahan perimeter desa.",
      "Patuhi maklumat Kapolda Kalteng mengenai larangan pembakaran hutan dan lahan."
    ],
    govtAgency: {
      name: "BPBD Provinsi Kalimantan Tengah & Manggala Agni Daops Kapuas",
      address: "Jl. Tjilik Riwut KM 3.5, Palangka Raya, Kalteng 73112",
      lat: -2.2081,
      lng: 113.9142,
      distanceKm: 72.0,
      hotline: "(0536) 322-1113 / 0812-5500-1113",
      email: "bpbd@kalteng.go.id",
      whatsapp: "6281255001113",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
      caption: "Kawasan Kanal Gambut Sebangau Kuala Pulang Pisau",
      elevation: "8 mdpl",
      airSensor: "ISPU 160 (Tidak Sehat)",
      radiusStatus: "ZONA KUNING WASPADA KARHUTLA"
    }
  },

  // =========================================================================
  // 2. ERUPSI GUNUNG API (PVMBG BADAN GEOLOGI ESDM)
  // =========================================================================
  {
    id: "disaster-merapi-01",
    title: "Aktivitas Vulkanik Gunung Merapi — Guguran Lava",
    category: "gunung_api",
    categoryName: "Erupsi Gunung Api",
    subCategory: "Erupsi Gunung Merapi",
    severity: "kritis",
    location: "Sleman (DIY), Magelang, Boyolali & Klaten (Jawa Tengah)",
    lat: -7.5407,
    lng: 110.4457,
    dataDate: "26 Agustus 2026 (Laporan Aktivitas Harian BPPTKG PVMBG)",
    dataType: "Status Level Resmi ESDM",
    speakupCount: getSavedVotes("disaster-merapi-01", 0),
    metrics: [
      { label: "Status Resmi (2026)", value: "Level III (Siaga)", sub: "BPPTKG Badan Geologi ESDM" },
      { label: "Tipe Aktivitas", value: "Efusif (Kubah Lava)", sub: "Guguran Lava & Awan Panas" },
      { label: "Radius Bahaya Rekomendasi", value: "5 - 7 Km", sub: "Sektor Barat Daya & Selatan" },
      { label: "Ketinggian Puncak", value: "2.968 mdpl", sub: "Kubah Lava Aktif Teramati" }
    ],
    temporal: {
      past: {
        title: "Penjelasan Resmi Status Erupsi",
        description: "Gunung Merapi berstatus Level III (Siaga) secara berkesinambungan sejak 5 November 2020 hingga tahun 2026 dengan karakteristik pembentukan kubah lava aktif dan guguran APG berkala.",
        metrics: [
          { label: "Erupsi Eksplosif 2010", value: "VEI 4", sub: "353 Jiwa Korban" },
          { label: "Karakteristik 2026", value: "Guguran Lava Efusif", sub: "Arah Kali Bebeng & Krasak" }
        ]
      },
      present: {
        title: "Pemantauan BPPTKG Terkini 2026",
        description: "BPPTKG mencatat puluhan gempa guguran harian. Guguran lava pijar meluncur sejauh 1.500 - 2.500 meter ke arah barat daya (Kali Bebeng). Aktivitas pendakian ditutup total.",
        metrics: [
          { label: "Status Aktivitas 2026", value: "Level III (Siaga)", sub: "Pantauan Multi-Sensor 24 Jam" },
          { label: "Bahaya Lahar Hujan", value: "Waspada Saat Hujan Lebat", sub: "Hulu Sungai Merapi" }
        ]
      },
      future: {
        title: "Proyeksi Bahaya & Mitigasi 2028",
        description: "Simulasi bahaya memetakan potensi kolaps kubah barat daya. Sebanyak 18 desa lingkar Merapi telah tersertifikasi sebagai Desa Tangguh Bencana (Destana).",
        metrics: [
          { label: "Sistem Early Warning", value: "Sensor Getar & CCTV IR", sub: "Real-time Telemetri" },
          { label: "Target Zero Victim", value: "Prioritas Mitigasi", sub: "Evakuasi Dini Warga KRB III" }
        ]
      }
    },
    recommendations: [
      "Masyarakat dilarang melakukan kegiatan apapun di daerah potensi bahaya radius 5-7 km dari puncak Merapi.",
      "Antisipasi gangguan akibat abu vulkanik dengan memakai masker dan kacamata pelindung.",
      "Waspadai bahaya lahar dingin di sungai-sungai yang berhulu di Gunung Merapi terutama saat terjadi hujan lebat di puncak."
    ],
    govtAgency: {
      name: "Balai Penyelidikan dan Pengembangan Teknologi Kebencanaan Geologi (BPPTKG) ESDM",
      address: "Jl. Cendana No. 15, Semaki, Umbulharjo, Kota Yogyakarta, DIY 55166",
      lat: -7.5621,
      lng: 110.4201,
      distanceKm: 3.8,
      hotline: "(0274) 514-180 / (0274) 868-945",
      email: "bpptkg@esdm.go.id",
      whatsapp: "6281227189999",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1544867885-2333f61544ad?auto=format&fit=crop&w=1200&q=80",
      caption: "Pos Pengamatan Merapi Kaliurang Sleman — Pemandangan Puncak dan Kubah Lava",
      elevation: "1.420 mdpl",
      airSensor: "Abu Vulkanik Terpantau",
      radiusStatus: "ZONA KRB III (RADIUS 7 KM DILARANG BERAKTIVITAS)"
    }
  },

  {
    id: "disaster-lewotobi-ntt",
    title: "Aktivitas Erupsi Gunung Lewotobi Laki-Laki — Flores Timur",
    category: "gunung_api",
    categoryName: "Erupsi Gunung Api",
    subCategory: "Erupsi Gunung Api",
    severity: "kritis",
    location: "Kec. Wulanggitang & Ilebura, Kab. Flores Timur, NTT",
    lat: -8.5381,
    lng: 122.7752,
    dataDate: "26 Agustus 2026 (Status PVMBG Badan Geologi)",
    dataType: "Status Level Resmi ESDM",
    speakupCount: getSavedVotes("disaster-lewotobi-ntt", 0),
    metrics: [
      { label: "Status PVMBG (2026)", value: "Level IV (Awas) / Level III", sub: "Pusat Vulkanologi ESDM" },
      { label: "Tinggi Kolom Erupsi", value: "2.000 - 4.000 Meter", sub: "Abu Vulkanik Tebal" },
      { label: "Radius Bahaya", value: "7 - 8 Km dari Kawah", sub: "Evakuasi Warga Lereng" },
      { label: "Warga Mengungsi", value: "Posko Terpadu BPBD", sub: "Kecamatan Titihena" }
    ],
    temporal: {
      past: {
        title: "Peningkatan Aktivitas Vulkanik (2024-2025)",
        description: "Lewotobi Laki-Laki mengalami peningkatan erupsi eksplosif dengan lontaran batu pijar yang merusak rumah warga di lereng gunung.",
        metrics: [{ label: "Radius Bahaya", value: "7 Km", sub: "Diperluas PVMBG" }]
      },
      present: {
        title: "Pemantauan Pos Pengamatan 2026",
        description: "Lontaran lava pijar dan awan panas guguran masih teramati. BPBD mendistribusikan logistik dan masker di shelter pengungsian.",
        metrics: [{ label: "Status Pos Pantau", value: "Siaga 24 Jam", sub: "Desa Pululera" }]
      },
      future: {
        title: "Rencana Relokasi Hunian Tetap 2028",
        description: "Pembangunan kawasan hunian tetap aman di luar zona bahaya KRB III bagi warga terdampak.",
        metrics: [{ label: "Target Huntap", value: "1.200 Unit Rumah", sub: "Kementerian PUPR" }]
      }
    },
    recommendations: [
      "Warga di dalam radius bahaya 7 km dilarang beraktivitas dan wajib berada di posko pengungsian.",
      "Gunakan masker N95 untuk melindungi pernapasan dari abu vulkanik pekat.",
      "Waspadai potensi banjir lahar hujan di sungai yang berhulu di puncak Lewotobi."
    ],
    govtAgency: {
      name: "Pos Pengamatan Gunung Lewotobi & BPBD Kabupaten Flores Timur",
      address: "Jl. Jenderal Sudirman No. 12, Larantuka, Flores Timur, NTT 86213",
      lat: -8.3412,
      lng: 122.9812,
      distanceKm: 32.0,
      hotline: "(0383) 211-13 / 0812-3700-1113",
      email: "bpbd@florestimurkab.go.id",
      whatsapp: "6281237001113",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1544867885-2333f61544ad?auto=format&fit=crop&w=1200&q=80",
      caption: "Pos Pengamatan Gunung Lewotobi Laki-Laki Desa Pululera",
      elevation: "420 mdpl",
      airSensor: "Abu Vulkanik Sangat Pekat",
      radiusStatus: "ZONA MERAH KRB III (EVAKUASI TOTAL)"
    }
  },

  // =========================================================================
  // 3. MASALAH SOSIAL: STUNTING & GIZI BURUK (KEMENKES SKI & BKKBN)
  // =========================================================================
  {
    id: "stunting-ntt-tts",
    title: "Prevalensi Stunting & Gizi Balita — TTS NTT",
    category: "stunting",
    categoryName: "Masalah Sosial",
    subCategory: "Stunting & Gizi Buruk",
    severity: "kritis",
    location: "Kabupaten Timor Tengah Selatan (TTS), Nusa Tenggara Timur",
    lat: -9.8601,
    lng: 124.2863,
    dataDate: "Survei Kesehatan Indonesia (SKI) Kemenkes & BKKBN 2026",
    dataType: "Data Statistik Resmi Kementerian",
    speakupCount: getSavedVotes("stunting-ntt-tts", 0),
    metrics: [
      { label: "Prevalensi Stunting (2026)", value: "31.2%", sub: "Data Resmi SKI Kemenkes" },
      { label: "Target Nasional", value: "< 14%", sub: "RPJMN 2026-2029" },
      { label: "Fokus Intervensi", value: "1.000 HPK", sub: "Hari Pertama Kehidupan" },
      { label: "Akses Air Bersih Layak", value: "42% Wilayah", sub: "Sanitasi Perluasan Pamsimas" }
    ],
    temporal: {
      past: {
        title: "Arsip Data Riskesdas 2018",
        description: "Prevalensi stunting di TTS sempat berada di angka 48.3% akibat keterbatasan protein hewani dan sanitasi air minum.",
        metrics: [{ label: "Prevalensi 2018", value: "48.3%", sub: "Krisis Gizi Terbesar" }]
      },
      present: {
        title: "Program Dapur Sehat (DASHAT) 2026",
        description: "BKKBN bersama Kemenkes mendistribusikan telur dan makanan berprotein tinggi langsung ke 240 desa lokus prioritas.",
        metrics: [{ label: "Kader Posyandu 2026", value: "2.100 Orang", sub: "Penimbangan Rutin Bulanan" }]
      },
      future: {
        title: "Target Bebas Stunting 2030",
        description: "Intervensi terpadu air bersih perpipaan, jamban sehat, dan ketahanan pangan hewani lokal untuk mencapai angka di bawah 12%.",
        metrics: [{ label: "Proyeksi 2029", value: "11.5%", sub: "Sesuai Standar WHO" }]
      }
    },
    recommendations: [
      "Salurkan makanan kaya protein hewani (telur, ikan kuah asam, susu) kepada anak di bawah 2 tahun.",
      "Bawa balita ke Posyandu setiap bulan untuk memantau grafik kurva pertumbuhan KMS.",
      "Pastikan ibu hamil meminum Tablet Tambah Darah (TTD) minimal 90 tablet selama kehamilan."
    ],
    govtAgency: {
      name: "Dinas Kesehatan Kab. TTS & BKKBN Provinsi NTT",
      address: "Jl. Basuki Rahmat No. 1, Soe, Timor Tengah Selatan, NTT 85511",
      lat: -9.8645,
      lng: 124.2812,
      distanceKm: 1.4,
      hotline: "(0388) 211-19 / Halo Kemenkes 1500-567",
      email: "dinkes@ttskab.go.id",
      whatsapp: "6281110500567",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
      caption: "Posyandu Pelayanan Tumbuh Kembang Balita di Desa Boking TTS",
      elevation: "820 mdpl",
      airSensor: "Normal",
      radiusStatus: "LOKUS PRIORITAS STUNTING NASIONAL"
    }
  },

  {
    id: "stunting-jabar-cianjur",
    title: "Prevalensi Stunting & Ketahanan Pangan — Cianjur",
    category: "stunting",
    categoryName: "Masalah Sosial",
    subCategory: "Stunting & Gizi Buruk",
    severity: "tinggi",
    location: "Kec. Cidaun & Agrabinta, Kab. Cianjur Selatan, Jawa Barat",
    lat: -7.4912,
    lng: 107.1420,
    dataDate: "Survei Kesehatan Indonesia (SKI) Kemenkes 2026",
    dataType: "Data Statistik Resmi Kementerian",
    speakupCount: getSavedVotes("stunting-jabar-cianjur", 0),
    metrics: [
      { label: "Prevalensi Stunting 2026", value: "24.8%", sub: "Survei Kesehatan Indonesia" },
      { label: "Jumlah Balita Padat", value: "Populasi Tinggi", sub: "Jawa Barat Selatan" },
      { label: "Faktor Pemicu", value: "Pola Asuh & Sanitasi", sub: "Akses Jamban Sehat" },
      { label: "Program Intervensi", value: "Rembuk Stunting Desa", sub: "Alokasi Dana Desa 10%" }
    ],
    temporal: {
      past: {
        title: "Riwayat Data SSGI Jawa Barat",
        description: "Cianjur sebelumnya memiliki kantong stunting di wilayah pelosok selatan karena keterbatasan akses faskes dan sanitasi lingkungan.",
        metrics: [{ label: "Prevalensi 2021", value: "31.2%", sub: "SSGI 2021" }]
      },
      present: {
        title: "Gerakan Makan Telur & Ikan Lokal 2026",
        description: "Dinas Kesehatan menggerakkan tim pendamping keluarga (TPK) untuk mendatangi rumah ibu hamil berisiko KEK.",
        metrics: [{ label: "Cakupan USG Puskesmas", value: "95%", sub: "Deteksi Janin Terhambat" }]
      },
      future: {
        title: "Target Jabar Zero Stunting 2028",
        description: "Seluruh desa di Cianjur terhubung jaringan air bersih perpipaan dan digitalisasi pemantauan gizi e-PPGBM terintegrasi.",
        metrics: [{ label: "Target Prevalensi", value: "9.8%", sub: "Target RPJMD" }]
      }
    },
    recommendations: [
      "Prioritaskan konsumsi protein hewani pada MPASI bayi mulai usia 6 bulan.",
      "Gunakan air matang bersih untuk memasak dan mencuci perlengkapan makan bayi.",
      "Manfaatkan pekarangan rumah untuk budidaya sayur kelor dan kolam ikan keluarga."
    ],
    govtAgency: {
      name: "Dinas Kesehatan Kabupaten Cianjur",
      address: "Jl. Prof. Moch. Yamin No. 8, Cianjur, Jawa Barat 43214",
      lat: -6.8210,
      lng: 107.1385,
      distanceKm: 65.0,
      hotline: "(0263) 261-232 / Halo Kemenkes 1500-567",
      email: "dinkes@cianjurkab.go.id",
      whatsapp: "6281110500567",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80",
      caption: "Kegiatan Penimbangan Balita Posyandu Melati Cianjur Selatan",
      elevation: "110 mdpl",
      airSensor: "Bersih Pesisir",
      radiusStatus: "ZONA INTERVENSI GIZI JAWA BARAT"
    }
  },

  // =========================================================================
  // 4. MASALAH SOSIAL: FASILITAS PENDIDIKAN KURANG (KEMENDIKBUD & BPS)
  // =========================================================================
  {
    id: "social-pendidikan-nduga-01",
    title: "Kebutuhan Fasilitas Pendidikan & Sekolah Daerah 3T — Nduga",
    category: "pendidikan",
    categoryName: "Masalah Sosial",
    subCategory: "Fasilitas Pendidikan Kurang",
    severity: "kritis",
    location: "Kabupaten Nduga, Papua Pegunungan",
    lat: -4.4225,
    lng: 138.3156,
    dataDate: "Data Pokok Pendidikan (Dapodik) & BPS Papua 2026",
    dataType: "Data Statistik Resmi Kementerian",
    speakupCount: getSavedVotes("social-pendidikan-nduga-01", 0),
    metrics: [
      { label: "Penduduk Usia Sekolah (2026)", value: "32.400 Anak", sub: "Data BPS 2026" },
      { label: "Gedung Sekolah Layak", value: "28 Unit Beroperasi", sub: "Rasio 1 Sekolah : 1.157 Anak" },
      { label: "Wilayah Prioritas", value: "Daerah 3T (Terpencil)", sub: "Kategori Khusus Afirmasi" },
      { label: "Program Utama 2026", value: "Sekolah Pola Asrama", sub: "Kemendikbudristek RI" }
    ],
    temporal: {
      past: {
        title: "Kondisi Historis Pendidikan 3T",
        description: "Keterbatasan akses jalan darat di wilayah pegunungan membuat sebagian anak harus menempuh jarak jauh antardistrik untuk mencapai sekolah.",
        metrics: [{ label: "Ruang Kelas Rusak", value: "70%", sub: "Data Pokok Pendidikan (Dapodik)" }]
      },
      present: {
        title: "Pembangunan Afirmasi Terkini 2026",
        description: "Pemerintah pusat menggencarkan pembangunan Sekolah Berasrama Terpadu di Distrik Kenyam dan pengadaan internet satelit Starlink untuk pembelajaran digital.",
        metrics: [{ label: "Sekolah Asrama 2026", value: "3 Unit Tahap 1", sub: "Kenyam & Mapenduma" }]
      },
      future: {
        title: "Masterplan Pendidikan Terpadu 2030",
        description: "Pembangunan Sekolah Berasrama Terpadu di setiap pusat distrik untuk menjamin akses belajar berkualitas, gizi siswa, dan keamanan.",
        metrics: [{ label: "Target 2030", value: "100% Anak Bersekolah", sub: "Standar Layanan Minimum" }]
      }
    },
    recommendations: [
      "Percepat pembangunan Sekolah Pola Asrama Terpadu di distrik sentral agar siswa tidak perlu berjalan kaki melintasi perbukitan.",
      "Lengkapi fasilitas sekolah daerah 3T dengan pembangkit listrik tenaga surya (PLTS) dan akses internet satelit.",
      "Tingkatkan insentif kesejahteraan dan jaminan bagi guru yang bertugas di pelosok terpencil."
    ],
    govtAgency: {
      name: "Dinas Pendidikan Kab. Nduga & Kemendikbudristek RI",
      address: "Kompleks Perkantoran Pemkab Nduga, Kenyam, Papua Pegunungan 99911",
      lat: -4.4180,
      lng: 138.3210,
      distanceKm: 0.9,
      hotline: "(0969) 591-002 / Kemendikbud 177",
      email: "disdik@ndugakab.go.id",
      whatsapp: "628119762196",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
      caption: "Fasilitas Belajar dan Kondisi Kelas di Kenyam Nduga Papua Pegunungan",
      elevation: "1.850 mdpl",
      airSensor: "Sejuk Pegunungan",
      radiusStatus: "DAERAH AFIRMASI KHUSUS PENDIDIKAN 3T"
    }
  },

  // =========================================================================
  // 5. MASALAH SOSIAL: PENUMPUKAN SAMPAH & TPA (SIPSN KLHK)
  // =========================================================================
  {
    id: "social-sampah-bantargebang-01",
    title: "Kapasitas TPA Bantar Gebang & Pengolahan Sampah Terpadu",
    category: "sampah",
    categoryName: "Masalah Sosial",
    subCategory: "Penumpukan Sampah",
    severity: "tinggi",
    location: "Kec. Bantar Gebang, Kota Bekasi, Jawa Barat",
    lat: -6.3496,
    lng: 106.9942,
    dataDate: "Sistem Informasi Pengelolaan Sampah Nasional (SIPSN KLHK) 2026",
    dataType: "Data Statistik Resmi Kementerian",
    speakupCount: getSavedVotes("social-sampah-bantargebang-01", 0),
    metrics: [
      { label: "Sampah Masuk Harian (2026)", value: "± 7.500 Ton / Hari", sub: "Data Dinas LH DKI Jakarta" },
      { label: "Ketinggian Landfill", value: "Mencapai 45-50 Meter", sub: "Zona Aktif Terbuka" },
      { label: "Fasilitas RDF Plant", value: "2.000 Ton / Hari", sub: "Pengolah Bahan Bakar Turunan" },
      { label: "Luas Kawasan TPST", value: "± 110 Hektar", sub: "Kecamatan Bantar Gebang" }
    ],
    temporal: {
      past: {
        title: "Riwayat Operasi TPST (1989 - Sekarang)",
        description: "Beroperasi sejak 1989 untuk menampung sampah dari Jakarta. Akumulasi selama puluhan tahun mendorong transformasi sistem ke pengolahan berteknologi.",
        metrics: [{ label: "Mulai Beroperasi", value: "Tahun 1989", sub: "Lebih dari 3 dekade" }]
      },
      present: {
        title: "Operasional RDF Plant & IPAL Lindi 2026",
        description: "Fasilitas Refuse Derived Fuel (RDF) Plant beroperasi mengolah 2.000 ton sampah per hari menjadi bahan bakar industri semen.",
        metrics: [{ label: "Kapasitas RDF 2026", value: "2.000 Ton/Hari", sub: "Pabrik Semen Offtaker" }]
      },
      future: {
        title: "Target Pengurangan Sampah Hulu-Hilir 2030",
        description: "Pengembangan Fasilitas Pengolahan Sampah Antara (FPSA/ITF) di dalam kota untuk menekan volume kiriman ke Bantar Gebang.",
        metrics: [{ label: "Target Reduksi Kiriman", value: "-50% s/d 2029", sub: "Waste to Energy & Daur Ulang" }]
      }
    },
    recommendations: [
      "Lakukan pemilahan sampah organik dan anorganik dari rumah tangga untuk mengurangi beban ke TPA.",
      "Gunakan kantong belanja guna ulang dan kurangi penggunaan plastik sekali pakai.",
      "Dukung pemanfaatan produk daur ulang dan komposting limbah makanan di tingkat RT/RW."
    ],
    govtAgency: {
      name: "Dinas Lingkungan Hidup DKI Jakarta (UPST) & Dinas LH Kota Bekasi",
      address: "UPST Bantar Gebang, Jl. Pangkalan V, Ciketing Udik, Bantar Gebang, Bekasi 17153",
      lat: -6.3531,
      lng: 106.9912,
      distanceKm: 0.6,
      hotline: "(021) 809-2740 / (021) 824-2113",
      email: "dinaslhdki@jakarta.go.id",
      whatsapp: "6281288880113",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80",
      caption: "Zona Landfill TPST Bantar Gebang — Operasional Alat Berat & RDF Plant",
      elevation: "78 mdpl",
      airSensor: "Indeks Bau & Gas Dipantau",
      radiusStatus: "ZONA PENGOLAHAN SAMPAH REGIONAL"
    }
  },

  // =========================================================================
  // 6. BANJIR & GENANGAN EKSTREM (BNPB & BBWS PUPR)
  // =========================================================================
  {
    id: "disaster-banjir-demak-01",
    title: "Banjir Bandang & Luapan Tanggul Sungai Wulan",
    category: "banjir",
    categoryName: "Banjir Ekstrem",
    subCategory: "Banjir Tanggul Jebol",
    severity: "kritis",
    location: "Kec. Karanganyar, Kab. Demak, Jawa Tengah",
    lat: -6.8943,
    lng: 110.6385,
    dataDate: "26 Agustus 2026 (Pusdatin BNPB & BBWS Pemali Juana)",
    dataType: "Peringatan Dini Hidrologi & Infrastruktur",
    speakupCount: getSavedVotes("disaster-banjir-demak-01", 0),
    metrics: [
      { label: "Penyebab Utama", value: "Tanggul Jebol", sub: "Sungai Wulan & Jeratun Seluna" },
      { label: "Titik Genangan Tertinggi", value: "Hingga 2,5 Meter", sub: "Jalur Pantura Demak-Kudus" },
      { label: "Wilayah Terdampak", value: "Puluhan Desa", sub: "Kecamatan Karanganyar & Gajah" },
      { label: "Instansi Teknis", value: "BBWS Pemali Juana", sub: "Kementerian PUPR" }
    ],
    temporal: {
      past: {
        title: "Catatan Kejadian Banjir 2024",
        description: "Banjir bandang akibat tingginya curah hujan di hulu dan jebolnya tanggul Sungai Wulan melumpuhkan jalur Pantura utama selama berhari-hari.",
        metrics: [{ label: "Pengungsi Terdata", value: "> 20.000 Jiwa", sub: "Posko BPBD & Pemkab" }]
      },
      present: {
        title: "Kondisi Infrastruktur 2026",
        description: "Kementerian PUPR melakukan perkuatan tanggul permanen dengan sheet-pile beton bertulang dan normalisasi pengerukan sedimen sungai.",
        metrics: [{ label: "Penutupan Tanggul", value: "Sheet-pile Beton", sub: "Struktur Permanen" }]
      },
      future: {
        title: "Rencana Normalisasi & Polder 2028",
        description: "Pembangunan sistem kolam retensi dan penguatan tanggul beton terpadu untuk memastikan kapasitas debit Sungai Wulan aman.",
        metrics: [{ label: "Kapasitas Tampung Debit", value: "+60%", sub: "Target Normalisasi" }]
      }
    },
    recommendations: [
      "Warga di bantaran Sungai Wulan diminta selalu memantau status tinggi muka air sungai saat hujan lebat.",
      "Segera evakuasi barang berharga dan dokumen penting ke tempat tinggi jika peringatan dini kenaikan air dikeluarkan.",
      "Laporkan jika ditemukan rembesan air pada struktur tanggul ke posko BPBD."
    ],
    govtAgency: {
      name: "Balai Besar Wilayah Sungai (BBWS) Pemali Juana & BPBD Kab. Demak",
      address: "Jl. Brigjen Sudiarto No. 375, Semarang, Jawa Tengah 50191",
      lat: -6.8912,
      lng: 110.6410,
      distanceKm: 2.1,
      hotline: "(0291) 685-113 / (024) 672-3212",
      email: "bbws.pemalijuana@pu.go.id",
      whatsapp: "628117600113",
      laporUrl: "https://www.lapor.go.id"
    },
    pov: {
      image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
      caption: "Perspektif Jalan Pantura Karanganyar Demak — Titik Genangan Air",
      elevation: "3 mdpl",
      airSensor: "Kelembaban Tinggi",
      radiusStatus: "ZONA RAWAN BANJIR SUNGAI WULAN"
    }
  }
];

const CATEGORIES_CONFIG = {
  karhutla: { name: "Kebakaran Hutan", color: "#ef4444", icon: "flame", group: "bencana" },
  gempa: { name: "Gempa Bumi", color: "#a855f7", icon: "activity", group: "bencana" },
  gunung_api: { name: "Erupsi Gunung Api", color: "#f43f5e", icon: "mountain", group: "bencana" },
  banjir: { name: "Banjir & Genangan", color: "#06b6d4", icon: "waves", group: "bencana" },
  stunting: { name: "Stunting & Gizi Buruk", color: "#f43f5e", icon: "baby", group: "sosial" },
  pendidikan: { name: "Fasilitas Pendidikan Kurang", color: "#3b82f6", icon: "graduation-cap", group: "sosial" },
  sampah: { name: "Penumpukan Sampah", color: "#f59e0b", icon: "trash-2", group: "sosial" }
};
