// Student Data Master: Garuda Mahawira Sena (NISN: 0068492011)

export interface SubtestV2 {
  id: string;
  name: string;
  to1: number;
  to2: number;
  to3: number;
  to4: number;
  median: number | string;
  gap: number;
  status: 'TERCAPAI' | 'MENDEKATI 600' | 'PERLU DITINGKATKAN' | 'PRIORITAS UTAMA' | 'Tercapai' | 'Hampir 600' | 'Perlu diperkuat' | 'Fokus utama';
  badgeClass: string;
  fillPct: number;
  barColor: string;
}

export interface ProgramChoice {
  priority: string;
  prodi: string;
  univ: string;
  degree: string;
  targetScore: number;
  weightedScore: number;
  gap: number;
  tightness: string;
  status: string;
  supportSubjects: string[];
  rumpun: 'saintek' | 'soshum' | 'campuran';
  city: string;
  isOutOfTown: boolean;
  participantsCount: number;
}

export interface PrioritySubtest {
  id: string;
  priorityLabel: string;
  name: string;
  toScore: string;
  toLatestNum: number;
  targetScore: number;
  gapText: string;
  gapNum: number;
  rgQuestionsDone: number;
  drillSessions: number;
  drillAccuracyPct: number;
  rgAccuracy: string;
  lowestTopics: string[];
  borderColor: string;
}

export interface ActionPlan {
  num: number;
  title: string;
  desc: string;
  pic: string;
  accentColor: string;
}

export const studentIdentity = {
  name: "Garuda Mahawira Sena",
  nisn: "0068492011",
  school: "SMA Negeri 1 Depok",
  curriculum: "Kurikulum Merdeka",
  major: "IPA / Peminatan Matematika & Sains",
  branch: "Depok - Margonda",
  sessionDate: "04 November 2026",
  sessionType: "Konsultasi Checkpoint 1 (Pasca 4 TO)",
  saName: "Kak William Candra",
  saEmail: "william.chandra@ruangguru.com",
  counselorName: "Sarah Az-Zahra, M.Psi.",
  parentName: "Bambang Sena (Ayah)",
  attendanceRate: "81.8%",
  attendanceDetail: "35 Hadir · 1 Telat · 6 Sakit · 2 Izin",
  toScores: [601, 576, 561, 546],
  toAverage: 571,
  toLabels: ["TO 1 (30 Agu)", "TO 2 (14 Sep)", "TO 3 (28 Sep)", "TO 4 (30 Okt)"]
};

// 8 Subtests for Academic Team IA (Versi 2) - Synchronized with V2 PDF
export const subtestsV2Data: SubtestV2[] = [
  {
    id: "pu",
    name: "Penalaran Umum (PU)",
    to1: 567, to2: 583, to3: 514, to4: 465,
    median: "540,5", gap: -135,
    status: "PRIORITAS UTAMA", badgeClass: "badge-p-high",
    fillPct: 21.7, barColor: "#d92d20"
  },
  {
    id: "pk",
    name: "Pengetahuan Kuantitatif (PK)",
    to1: 668, to2: 620, to3: 539, to4: 488,
    median: "579,5", gap: -112,
    status: "PRIORITAS UTAMA", badgeClass: "badge-p-high",
    fillPct: 29.3, barColor: "#d92d20"
  },
  {
    id: "lbi_a",
    name: "Literasi B. Indonesia (Saintek)",
    to1: 626, to2: 637, to3: 590, to4: 505,
    median: "608", gap: -95,
    status: "PRIORITAS UTAMA", badgeClass: "badge-p-high",
    fillPct: 35.0, barColor: "#d92d20"
  },
  {
    id: "lbe",
    name: "Literasi B. Inggris (LBING)",
    to1: 572, to2: 538, to3: 607, to4: 543,
    median: "557,5", gap: -57,
    status: "PERLU DITINGKATKAN", badgeClass: "badge-p-med",
    fillPct: 47.7, barColor: "#f79009"
  },
  {
    id: "pbm",
    name: "Pemahaman Bacaan & Menulis (PBM)",
    to1: 553, to2: 562, to3: 612, to4: 554,
    median: "558", gap: -46,
    status: "PERLU DITINGKATKAN", badgeClass: "badge-p-med",
    fillPct: 51.3, barColor: "#f79009"
  },
  {
    id: "lbi_s",
    name: "Literasi B. Indonesia (Soshum)",
    to1: 628, to2: 494, to3: 488, to4: 573,
    median: "533,5", gap: -27,
    status: "MENDEKATI 600", badgeClass: "badge-p-low",
    fillPct: 57.7, barColor: "#1078ca"
  },
  {
    id: "pm",
    name: "Penalaran Matematika (PM)",
    to1: 597, to2: 639, to3: 588, to4: 597,
    median: "597", gap: -3,
    status: "MENDEKATI 600", badgeClass: "badge-p-low",
    fillPct: 65.7, barColor: "#1078ca"
  },
  {
    id: "ppu",
    name: "Pengetahuan & Pemahaman Umum (PPU)",
    to1: 595, to2: 536, to3: 546, to4: 640,
    median: "570,5", gap: 40,
    status: "TERCAPAI", badgeClass: "badge-p-done",
    fillPct: 80.0, barColor: "#12b76a"
  }
];

// 3 Target Choices for V2 & V1
export const targetPrograms: ProgramChoice[] = [
  {
    priority: "Pilihan 1",
    prodi: "S1 Farmasi",
    univ: "Universitas Gadjah Mada (UGM)",
    degree: "S1",
    targetScore: 694,
    weightedScore: 538,
    gap: -156,
    tightness: "3.85%",
    status: "Butuh Peningkatan Signifikan",
    supportSubjects: ["Kimia", "Biologi"],
    rumpun: "saintek",
    city: "Yogyakarta",
    isOutOfTown: true,
    participantsCount: 642
  },
  {
    priority: "Pilihan 2",
    prodi: "S1 Farmasi",
    univ: "Universitas Indonesia (UI)",
    degree: "S1",
    targetScore: 686,
    weightedScore: 542,
    gap: -144,
    tightness: "5.11%",
    status: "Butuh Peningkatan Signifikan",
    supportSubjects: ["Kimia", "Biologi"],
    rumpun: "saintek",
    city: "Depok",
    isOutOfTown: false,
    participantsCount: 710
  },
  {
    priority: "Pilihan 3",
    prodi: "S1 Teknik Mesin",
    univ: "Institut Teknologi Bandung (ITB)",
    degree: "S1",
    targetScore: 660,
    weightedScore: 565,
    gap: -95,
    tightness: "4.63%",
    status: "Butuh Peningkatan",
    supportSubjects: ["Fisika", "Matematika Tingkat Lanjut"],
    rumpun: "saintek",
    city: "Bandung",
    isOutOfTown: true,
    participantsCount: 520
  }
];

// 4 Subtests Prioritas for V2 - Authentic Tryout & Drill Data (No AI Diagnosis)
export const prioritySubtestsV2: PrioritySubtest[] = [
  {
    id: "pk",
    priorityLabel: "BOBOT TERTINGGI #1",
    name: "Pengetahuan Kuantitatif (PK)",
    toScore: "488",
    toLatestNum: 488,
    targetScore: 600,
    gapText: "-112",
    gapNum: -112,
    rgQuestionsDone: 5,
    drillSessions: 1,
    drillAccuracyPct: 40,
    rgAccuracy: "40% benar (1 sesi)",
    lowestTopics: [
      "Aljabar & Fungsi Pecahan (28% benar)",
      "Statistika & Peluang Dasar (38% benar)",
      "Geometri Bidang (42% benar)"
    ],
    borderColor: "#fda29b"
  },
  {
    id: "pu",
    priorityLabel: "BOBOT TERTINGGI #2",
    name: "Penalaran Umum (PU)",
    toScore: "465",
    toLatestNum: 465,
    targetScore: 600,
    gapText: "-135",
    gapNum: -135,
    rgQuestionsDone: 35,
    drillSessions: 7,
    drillAccuracyPct: 63,
    rgAccuracy: "63% benar (7 sesi)",
    lowestTopics: [
      "Penalaran Induktif (32% benar)",
      "Silogisme & Logika Deduktif (41% benar)",
      "Penalaran Analitik Simbolik (45% benar)"
    ],
    borderColor: "#fda29b"
  },
  {
    id: "pm",
    priorityLabel: "BOBOT TERTINGGI #3",
    name: "Penalaran Matematika (PM)",
    toScore: "597",
    toLatestNum: 597,
    targetScore: 600,
    gapText: "-3",
    gapNum: -3,
    rgQuestionsDone: 10,
    drillSessions: 2,
    drillAccuracyPct: 50,
    rgAccuracy: "50% benar (2 sesi)",
    lowestTopics: [
      "Pemodelan Linear (40% benar)",
      "Aritmatika Sosial & Rasio (46% benar)",
      "Barisan & Deret (50% benar)"
    ],
    borderColor: "#b2ddff"
  },
  {
    id: "lbi",
    priorityLabel: "SUBTES PENDUKUNG",
    name: "Literasi B. Indo (Saintek) & B. Inggris",
    toScore: "505 / 543",
    toLatestNum: 505,
    targetScore: 600,
    gapText: "-95 / -57",
    gapNum: -95,
    rgQuestionsDone: 0,
    drillSessions: 0,
    drillAccuracyPct: 0,
    rgAccuracy: "0% (belum ada drill)",
    lowestTopics: [
      "Evaluasi Bias Penulis (35% benar)",
      "Memahami Makna Tersirat (40% benar)",
      "Logika Antarparagraf (44% benar)"
    ],
    borderColor: "#fedf89"
  }
];

// 4 Kerangka Tindak Lanjut menuju TO 5 (untuk disepakati bersama dalam sesi)
export const actionPlansV2: ActionPlan[] = [
  {
    num: 1,
    title: "Kesepakatan Drill Soal Mandiri Subtes Prioritas",
    desc: "Sepakati target jumlah soal & jadwal drill soal harian/mingguan bersama siswa di aplikasi untuk subtes dengan gap terbesar serta volume drill soal terendah (PK & Literasi).",
    pic: "Siswa (dipantau bersama Kakak Asuh)",
    accentColor: "#1078ca"
  },
  {
    num: 2,
    title: "Sesi Klinik Belajar & Bedah Topik Terendah",
    desc: "Jadwalkan sesi klinik belajar tatap muka untuk membahas topik dengan akurasi terendah pada Tryout terakhir (Aljabar, Peluang, Penalaran Induktif) sesuai ketersediaan jadwal siswa.",
    pic: "Kak William Candra (Kakak Asuh) & Siswa",
    accentColor: "#0369a1"
  },
  {
    num: 3,
    title: "Fokus Target Evaluasi Tryout Berikutnya (TO 5)",
    desc: "Tinjau kesiapan menghadapi TO 5 dengan memprioritaskan penahanan tren turun pada subtes pembobot utama (PK & PU) serta menjaga konsistensi subtes PM.",
    pic: "Siswa & Kakak Asuh",
    accentColor: "#b54708"
  },
  {
    num: 4,
    title: "Dukungan Kebiasaan & Lingkungan Belajar di Rumah",
    desc: "Konfirmasikan bentuk dukungan belajar di rumah yang realistis bersama orang tua (konsistensi jam belajar, pengawasan distraksi, dan kesesuaian dukungan target jurusan).",
    pic: "Orang Tua / Wali Siswa",
    accentColor: "#027a48"
  }
];

// Holistik CP1 Student Profiles (untuk memvalidasi engine pada beragam tipe siswa)
export interface Checkpoint1Student {
  id: string;
  name: string;
  tagline: string;
  identity: typeof studentIdentity;
  subtests: SubtestV2[];
  targetPrograms: ProgramChoice[];
  prioritySubtests: PrioritySubtest[];
  familyAlignment: 'aligned' | 'different_major' | 'location_limit' | 'unconfirmed';
}

export const CHECKPOINT1_STUDENTS: Checkpoint1Student[] = [
  {
    id: "garuda",
    name: "Garuda Mahawira Sena",
    tagline: "Saintek · Konflik Rumpun & Lokasi · Tren TO Turun",
    identity: studentIdentity,
    subtests: subtestsV2Data,
    targetPrograms: targetPrograms,
    prioritySubtests: prioritySubtestsV2,
    familyAlignment: "different_major"
  },
  {
    id: "nadira",
    name: "Nadira Alisya Putri",
    tagline: "Soshum · Pilihan Selaras · Tren Naik · Drill Aktif",
    identity: {
      name: "Nadira Alisya Putri",
      nisn: "0071294821",
      school: "SMA Negeri 8 Jakarta",
      curriculum: "Kurikulum Merdeka",
      major: "IPS / Peminatan Sosial & Humaniora",
      branch: "Jakarta - Tebet",
      sessionDate: "05 November 2026",
      sessionType: "Konsultasi Checkpoint 1 (Pasca 4 TO)",
      saName: "Kak William Candra",
      saEmail: "william.chandra@ruangguru.com",
      counselorName: "Sarah Az-Zahra, M.Psi.",
      parentName: "Dra. Rina Suryani (Ibu)",
      attendanceRate: "95.5%",
      attendanceDetail: "41 Hadir · 1 Telat · 2 Sakit · 0 Izin",
      toScores: [520, 548, 575, 608],
      toAverage: 563,
      toLabels: ["TO 1 (30 Agu)", "TO 2 (14 Sep)", "TO 3 (28 Sep)", "TO 4 (30 Okt)"]
    },
    subtests: [
      { id: "pk", name: "Pengetahuan Kuantitatif (PK)", to1: 480, to2: 505, to3: 520, to4: 535, median: "512,5", gap: -65, status: "PERLU DITINGKATKAN", badgeClass: "badge-p-med", fillPct: 45.0, barColor: "#f79009" },
      { id: "pm", name: "Penalaran Matematika (PM)", to1: 490, to2: 520, to3: 545, to4: 560, median: "532,5", gap: -40, status: "PERLU DITINGKATKAN", badgeClass: "badge-p-med", fillPct: 53.3, barColor: "#f79009" },
      { id: "lbi_a", name: "Literasi B. Indonesia (Saintek)", to1: 505, to2: 520, to3: 550, to4: 575, median: "535", gap: -25, status: "MENDEKATI 600", badgeClass: "badge-p-low", fillPct: 58.3, barColor: "#1078ca" },
      { id: "pu", name: "Penalaran Umum (PU)", to1: 510, to2: 535, to3: 560, to4: 582, median: "547,5", gap: -18, status: "MENDEKATI 600", badgeClass: "badge-p-low", fillPct: 60.7, barColor: "#1078ca" },
      { id: "ppu", name: "Pengetahuan & Pemahaman Umum (PPU)", to1: 520, to2: 540, to3: 565, to4: 590, median: "552,5", gap: -10, status: "MENDEKATI 600", badgeClass: "badge-p-low", fillPct: 63.3, barColor: "#1078ca" },
      { id: "lbi_s", name: "Literasi B. Indonesia (Soshum)", to1: 540, to2: 562, to3: 590, to4: 615, median: "576", gap: 15, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 71.7, barColor: "#12b76a" },
      { id: "lbe", name: "Literasi B. Inggris (LBING)", to1: 550, to2: 570, to3: 595, to4: 625, median: "582,5", gap: 25, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 75.0, barColor: "#12b76a" },
      { id: "pbm", name: "Pemahaman Bacaan & Menulis (PBM)", to1: 560, to2: 585, to3: 610, to4: 632, median: "597,5", gap: 32, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 77.3, barColor: "#12b76a" }
    ],
    targetPrograms: [
      {
        priority: "Pilihan 1",
        prodi: "S1 Ilmu Hukum",
        univ: "Universitas Indonesia (UI)",
        degree: "S1",
        targetScore: 685,
        weightedScore: 615,
        gap: -70,
        tightness: "3.12%",
        status: "Peluang Cukup Terbuka",
        supportSubjects: ["Sosiologi", "Pendidikan Pancasila"],
        rumpun: "soshum",
        city: "Depok",
        isOutOfTown: false,
        participantsCount: 890
      },
      {
        priority: "Pilihan 2",
        prodi: "S1 Hubungan Internasional",
        univ: "Universitas Gadjah Mada (UGM)",
        degree: "S1",
        targetScore: 692,
        weightedScore: 608,
        gap: -84,
        tightness: "2.45%",
        status: "Butuh Peningkatan",
        supportSubjects: ["Bahasa Inggris", "Sosiologi"],
        rumpun: "soshum",
        city: "Yogyakarta",
        isOutOfTown: true,
        participantsCount: 620
      },
      {
        priority: "Pilihan 3",
        prodi: "S1 Ilmu Komunikasi",
        univ: "Universitas Padjadjaran (Unpad)",
        degree: "S1",
        targetScore: 655,
        weightedScore: 618,
        gap: -37,
        tightness: "4.10%",
        status: "Mendekati Aman",
        supportSubjects: ["Bahasa Indonesia", "Sosiologi"],
        rumpun: "soshum",
        city: "Bandung",
        isOutOfTown: true,
        participantsCount: 740
      }
    ],
    prioritySubtests: [
      {
        id: "pk",
        priorityLabel: "GAP TERBESAR #1",
        name: "Pengetahuan Kuantitatif (PK)",
        toScore: "535",
        toLatestNum: 535,
        targetScore: 600,
        gapText: "-65",
        gapNum: -65,
        rgQuestionsDone: 42,
        drillSessions: 8,
        drillAccuracyPct: 71,
        rgAccuracy: "71% benar (8 sesi)",
        lowestTopics: [
          "Statistika Dasar (45% benar)",
          "Aritmatika Pecahan & Rasio (52% benar)",
          "Himpunan & Operasi Logika (58% benar)"
        ],
        borderColor: "#fedf89"
      },
      {
        id: "pm",
        priorityLabel: "GAP TERBESAR #2",
        name: "Penalaran Matematika (PM)",
        toScore: "560",
        toLatestNum: 560,
        targetScore: 600,
        gapText: "-40",
        gapNum: -40,
        rgQuestionsDone: 30,
        drillSessions: 6,
        drillAccuracyPct: 67,
        rgAccuracy: "67% benar (6 sesi)",
        lowestTopics: [
          "Soal Cerita Aritmatika Sosial (48% benar)",
          "Pola Grafik Linear (55% benar)",
          "Peluang Sederhana (60% benar)"
        ],
        borderColor: "#fedf89"
      },
      {
        id: "pu",
        priorityLabel: "BOBOT UTAMA HUKUM",
        name: "Penalaran Umum (PU)",
        toScore: "582",
        toLatestNum: 582,
        targetScore: 600,
        gapText: "-18",
        gapNum: -18,
        rgQuestionsDone: 55,
        drillSessions: 11,
        drillAccuracyPct: 78,
        rgAccuracy: "78% benar (11 sesi)",
        lowestTopics: [
          "Silogisme Negatif (60% benar)",
          "Penalaran Induktif Teks Hukum (65% benar)",
          "Analisis Premis Tersembunyi (68% benar)"
        ],
        borderColor: "#b2ddff"
      },
      {
        id: "pbm",
        priorityLabel: "SUBTES UNGGULAN",
        name: "Pemahaman Bacaan & Menulis (PBM)",
        toScore: "632",
        toLatestNum: 632,
        targetScore: 600,
        gapText: "+32",
        gapNum: 32,
        rgQuestionsDone: 25,
        drillSessions: 5,
        drillAccuracyPct: 84,
        rgAccuracy: "84% benar (5 sesi)",
        lowestTopics: [
          "PUEBI Kata Serapan (70% benar)",
          "Kohesi Paragraf Kompleks (75% benar)",
          "Konjungsi Antarkalimat (80% benar)"
        ],
        borderColor: "#a6f4c5"
      }
    ],
    familyAlignment: "aligned"
  },
  {
    id: "rizky",
    name: "Rizky Pratama",
    tagline: "Saintek · Fondasi Sangat Awal (Semua < 500) · Drill 0 Soal · Absensi 72%",
    identity: {
      name: "Rizky Pratama",
      nisn: "0069812415",
      school: "SMA Negeri 3 Surabaya",
      curriculum: "Kurikulum Merdeka",
      major: "IPA / Peminatan Matematika & Sains",
      branch: "Surabaya - Gubeng",
      sessionDate: "06 November 2026",
      sessionType: "Konsultasi Checkpoint 1 (Pasca 4 TO)",
      saName: "Kak William Candra",
      saEmail: "william.chandra@ruangguru.com",
      counselorName: "Sarah Az-Zahra, M.Psi.",
      parentName: "H. Bambang Irawan (Ayah)",
      attendanceRate: "76.2%",
      attendanceDetail: "29 Hadir · 3 Telat · 6 Sakit · 4 Izin",
      toScores: [465, 452, 445, 430],
      toAverage: 448,
      toLabels: ["TO 1 (30 Agu)", "TO 2 (14 Sep)", "TO 3 (28 Sep)", "TO 4 (30 Okt)"]
    },
    subtests: [
      { id: "lbi_s", name: "Literasi B. Indonesia (Soshum)", to1: 450, to2: 445, to3: 438, to4: 418, median: "441,5", gap: -182, status: "PRIORITAS UTAMA", badgeClass: "badge-p-high", fillPct: 6.0, barColor: "#d92d20" },
      { id: "pk", name: "Pengetahuan Kuantitatif (PK)", to1: 455, to2: 440, to3: 435, to4: 420, median: "437,5", gap: -180, status: "PRIORITAS UTAMA", badgeClass: "badge-p-high", fillPct: 6.7, barColor: "#d92d20" },
      { id: "lbe", name: "Literasi B. Inggris (LBING)", to1: 460, to2: 448, to3: 440, to4: 425, median: "444", gap: -175, status: "PRIORITAS UTAMA", badgeClass: "badge-p-high", fillPct: 8.3, barColor: "#d92d20" },
      { id: "pu", name: "Penalaran Umum (PU)", to1: 465, to2: 450, to3: 445, to4: 430, median: "447,5", gap: -170, status: "PRIORITAS UTAMA", badgeClass: "badge-p-high", fillPct: 10.0, barColor: "#d92d20" },
      { id: "lbi_a", name: "Literasi B. Indonesia (Saintek)", to1: 468, to2: 450, to3: 440, to4: 435, median: "445", gap: -165, status: "PRIORITAS UTAMA", badgeClass: "badge-p-high", fillPct: 11.7, barColor: "#d92d20" },
      { id: "pbm", name: "Pemahaman Bacaan & Menulis (PBM)", to1: 470, to2: 455, to3: 445, to4: 440, median: "450", gap: -160, status: "PRIORITAS UTAMA", badgeClass: "badge-p-high", fillPct: 13.3, barColor: "#d92d20" },
      { id: "pm", name: "Penalaran Matematika (PM)", to1: 475, to2: 460, to3: 450, to4: 445, median: "455", gap: -155, status: "PRIORITAS UTAMA", badgeClass: "badge-p-high", fillPct: 15.0, barColor: "#d92d20" },
      { id: "ppu", name: "Pengetahuan & Pemahaman Umum (PPU)", to1: 480, to2: 470, to3: 460, to4: 455, median: "465", gap: -145, status: "PRIORITAS UTAMA", badgeClass: "badge-p-high", fillPct: 18.3, barColor: "#d92d20" }
    ],
    targetPrograms: [
      {
        priority: "Pilihan 1",
        prodi: "S1 Teknik Informatika",
        univ: "Institut Teknologi Sepuluh Nopember (ITS)",
        degree: "S1",
        targetScore: 705,
        weightedScore: 428,
        gap: -277,
        tightness: "2.15%",
        status: "Gap Sangat Lebar",
        supportSubjects: ["Matematika Tingkat Lanjut", "Fisika"],
        rumpun: "saintek",
        city: "Surabaya",
        isOutOfTown: false,
        participantsCount: 920
      },
      {
        priority: "Pilihan 2",
        prodi: "S1 Sistem Informasi",
        univ: "Universitas Airlangga (Unair)",
        degree: "S1",
        targetScore: 678,
        weightedScore: 435,
        gap: -243,
        tightness: "3.40%",
        status: "Gap Sangat Lebar",
        supportSubjects: ["Matematika", "Ekonomi"],
        rumpun: "saintek",
        city: "Surabaya",
        isOutOfTown: false,
        participantsCount: 680
      },
      {
        priority: "Pilihan 3",
        prodi: "D4 Teknik Rekayasa Perangkat Lunak",
        univ: "Politeknik Elektronika Negeri Surabaya (PENS)",
        degree: "D4",
        targetScore: 615,
        weightedScore: 442,
        gap: -173,
        tightness: "6.20%",
        status: "Peluang Realistis Bertahap",
        supportSubjects: ["Matematika", "Informatika"],
        rumpun: "saintek",
        city: "Surabaya",
        isOutOfTown: false,
        participantsCount: 480
      }
    ],
    prioritySubtests: [
      {
        id: "pk",
        priorityLabel: "BOBOT TERTINGGI INFORMATIKA",
        name: "Pengetahuan Kuantitatif (PK)",
        toScore: "420",
        toLatestNum: 420,
        targetScore: 600,
        gapText: "-180",
        gapNum: -180,
        rgQuestionsDone: 0,
        drillSessions: 0,
        drillAccuracyPct: 0,
        rgAccuracy: "0% (belum ada drill)",
        lowestTopics: [
          "Operasi Pecahan & Desimal (22% benar)",
          "Persamaan Linear Sederhana (28% benar)",
          "Sudut & Segitiga Dasar (30% benar)"
        ],
        borderColor: "#fda29b"
      },
      {
        id: "pu",
        priorityLabel: "BOBOT UTAMA UTBK",
        name: "Penalaran Umum (PU)",
        toScore: "430",
        toLatestNum: 430,
        targetScore: 600,
        gapText: "-170",
        gapNum: -170,
        rgQuestionsDone: 2,
        drillSessions: 1,
        drillAccuracyPct: 50,
        rgAccuracy: "50% benar (1 sesi)",
        lowestTopics: [
          "Penalaran Induktif Angka (25% benar)",
          "Membaca Fakta vs Opini (30% benar)",
          "Silogisme Logika Dasar (35% benar)"
        ],
        borderColor: "#fda29b"
      },
      {
        id: "pm",
        priorityLabel: "FONDASI SAINTEK",
        name: "Penalaran Matematika (PM)",
        toScore: "445",
        toLatestNum: 445,
        targetScore: 600,
        gapText: "-155",
        gapNum: -155,
        rgQuestionsDone: 0,
        drillSessions: 0,
        drillAccuracyPct: 0,
        rgAccuracy: "0% (belum ada drill)",
        lowestTopics: [
          "Aritmatika Sosial Dasar (30% benar)",
          "Perbandingan & Rasio (35% benar)",
          "Membaca Grafik Data (38% benar)"
        ],
        borderColor: "#fda29b"
      },
      {
        id: "ppu",
        priorityLabel: "POTENSI GAP TERDEKAT",
        name: "Pengetahuan & Pemahaman Umum (PPU)",
        toScore: "455",
        toLatestNum: 455,
        targetScore: 600,
        gapText: "-145",
        gapNum: -145,
        rgQuestionsDone: 3,
        drillSessions: 1,
        drillAccuracyPct: 33,
        rgAccuracy: "33% benar (1 sesi)",
        lowestTopics: [
          "Makna Kata Kontekstual (32% benar)",
          "Ide Pokok Paragraf (36% benar)",
          "Sinonim & Antonim Kalimat (40% benar)"
        ],
        borderColor: "#fda29b"
      }
    ],
    familyAlignment: "unconfirmed"
  },
  {
    id: "alya",
    name: "Alya Kirana Putri",
    tagline: "Saintek · Profil Uji Achieve Semua (≥ 600 & Lolos Target Pilihan)",
    identity: {
      name: "Alya Kirana Putri",
      nisn: "0072419083",
      school: "SMA Negeri 3 Bandung",
      curriculum: "Kurikulum Merdeka",
      major: "IPA / Peminatan Biologi & Kimia",
      branch: "Bandung - Dago",
      sessionDate: "07 November 2026",
      sessionType: "Konsultasi Checkpoint 1 (Pasca 4 TO)",
      saName: "Kak William Candra",
      saEmail: "william.chandra@ruangguru.com",
      counselorName: "Sarah Az-Zahra, M.Psi.",
      parentName: "Ir. Hendra Kusuma (Ayah)",
      attendanceRate: "95.5%",
      attendanceDetail: "42 Hadir · 0 Telat · 2 Sakit · 0 Izin",
      toScores: [692, 709, 725, 741],
      toAverage: 717,
      toLabels: ["TO 1 (30 Agu)", "TO 2 (14 Sep)", "TO 3 (28 Sep)", "TO 4 (30 Okt)"]
    },
    subtests: [
      { id: "ppu", name: "Pengetahuan & Pemahaman Umum (PPU)", to1: 620, to2: 638, to3: 652, to4: 668, median: "645", gap: 68, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 89.3, barColor: "#12b76a" },
      { id: "pbm", name: "Pemahaman Bacaan & Menulis (PBM)", to1: 628, to2: 644, to3: 660, to4: 674, median: "652", gap: 74, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 91.3, barColor: "#12b76a" },
      { id: "lbi_s", name: "Literasi B. Indonesia (Soshum)", to1: 632, to2: 648, to3: 662, to4: 676, median: "655", gap: 76, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 92.0, barColor: "#12b76a" },
      { id: "lbi_a", name: "Literasi B. Indonesia (Saintek)", to1: 636, to2: 652, to3: 666, to4: 680, median: "659", gap: 80, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 93.3, barColor: "#12b76a" },
      { id: "pm", name: "Penalaran Matematika (PM)", to1: 698, to2: 716, to3: 734, to4: 752, median: "725", gap: 152, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 100.0, barColor: "#12b76a" },
      { id: "pk", name: "Pengetahuan Kuantitatif (PK)", to1: 880, to2: 898, to3: 916, to4: 934, median: "907", gap: 334, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 100.0, barColor: "#12b76a" },
      { id: "lbe", name: "Literasi B. Inggris (LBING)", to1: 648, to2: 666, to3: 682, to4: 698, median: "674", gap: 98, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 99.3, barColor: "#12b76a" },
      { id: "pu", name: "Penalaran Umum (PU)", to1: 792, to2: 810, to3: 826, to4: 844, median: "818", gap: 244, status: "TERCAPAI", badgeClass: "badge-p-done", fillPct: 100.0, barColor: "#12b76a" }
    ],
    targetPrograms: [
      {
        priority: "Pilihan 1",
        prodi: "S1 Farmasi",
        univ: "Universitas Padjadjaran (Unpad)",
        degree: "S1",
        targetScore: 668,
        weightedScore: 772,
        gap: 104,
        tightness: "3.08%",
        status: "Melampaui Target Acuan",
        supportSubjects: ["Kimia", "Biologi"],
        rumpun: "saintek",
        city: "Bandung",
        isOutOfTown: false,
        participantsCount: 515
      },
      {
        priority: "Pilihan 2",
        prodi: "S1 Farmasi",
        univ: "Universitas Brawijaya (UB)",
        degree: "S1",
        targetScore: 645,
        weightedScore: 772,
        gap: 127,
        tightness: "3.62%",
        status: "Melampaui Target Acuan",
        supportSubjects: ["Kimia", "Biologi"],
        rumpun: "saintek",
        city: "Malang",
        isOutOfTown: true,
        participantsCount: 410
      },
      {
        priority: "Pilihan 3",
        prodi: "D4 Teknologi Laboratorium Medis",
        univ: "Poltekkes Kemenkes Jakarta III",
        degree: "D4",
        targetScore: 582,
        weightedScore: 769,
        gap: 187,
        tightness: "4.90%",
        status: "Melampaui Target Acuan",
        supportSubjects: ["Biologi", "Kimia"],
        rumpun: "saintek",
        city: "Jakarta",
        isOutOfTown: true,
        participantsCount: 210
      }
    ],
    prioritySubtests: [
      {
        id: "pk",
        priorityLabel: "BOBOT TERTINGGI #1",
        name: "Pengetahuan Kuantitatif (PK)",
        toScore: "934",
        toLatestNum: 934,
        targetScore: 925,
        gapText: "+9",
        gapNum: 9,
        rgQuestionsDone: 64,
        drillSessions: 12,
        drillAccuracyPct: 86,
        rgAccuracy: "86% benar (12 sesi)",
        lowestTopics: [
          "Fungsi Komposisi & Invers HOTS (72% benar)",
          "Geometri Ruang & Transformasi (76% benar)",
          "Kombinatorika Bersyarat (78% benar)"
        ],
        borderColor: "#a6f4c5"
      },
      {
        id: "pu",
        priorityLabel: "BOBOT TERTINGGI #2",
        name: "Penalaran Umum (PU)",
        toScore: "844",
        toLatestNum: 844,
        targetScore: 833,
        gapText: "+11",
        gapNum: 11,
        rgQuestionsDone: 58,
        drillSessions: 11,
        drillAccuracyPct: 88,
        rgAccuracy: "88% benar (11 sesi)",
        lowestTopics: [
          "Silogisme Majemuk (75% benar)",
          "Evaluasi Kecukupan Premis (79% benar)",
          "Penalaran Kuantitatif Berpola (82% benar)"
        ],
        borderColor: "#a6f4c5"
      },
      {
        id: "pm",
        priorityLabel: "BOBOT TERTINGGI #3",
        name: "Penalaran Matematika (PM)",
        toScore: "752",
        toLatestNum: 752,
        targetScore: 740,
        gapText: "+12",
        gapNum: 12,
        rgQuestionsDone: 52,
        drillSessions: 10,
        drillAccuracyPct: 84,
        rgAccuracy: "84% benar (10 sesi)",
        lowestTopics: [
          "Optimasi Kontekstual (70% benar)",
          "Peluang Bersyarat & Data (74% benar)",
          "Pemodelan Laju Perubahan (77% benar)"
        ],
        borderColor: "#a6f4c5"
      }
    ],
    familyAlignment: "aligned"
  }
];

