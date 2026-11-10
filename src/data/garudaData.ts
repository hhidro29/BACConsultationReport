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
  status: 'TERCAPAI' | 'MENDEKATI 600' | 'PERLU DITINGKATKAN' | 'PRIORITAS UTAMA';
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
  attendanceDetail: "36 Hadir · 1 Telat · 6 Sakit · 2 Izin",
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
    supportSubjects: ["Kimia", "Biologi"]
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
    supportSubjects: ["Kimia", "Biologi"]
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
    supportSubjects: ["Fisika", "Matematika Tingkat Lanjut"]
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
    title: "Kesepakatan Drill Mandiri Subtes Prioritas",
    desc: "Sepakati target jumlah soal & jadwal latihan harian/mingguan bersama siswa di aplikasi untuk subtes dengan gap terbesar serta volume drill terendah (PK & Literasi).",
    pic: "Siswa (dipantau bersama Kakak Asuh)",
    accentColor: "#1078ca"
  },
  {
    num: 2,
    title: "Sesi Klinik Belajar & Bedah Topik Terendah",
    desc: "Jadwalkan sesi klinik belajar tatap muka untuk membahas topik dengan akurasi terendah pada Tryout terakhir (Aljabar, Peluang, Penalaran Induktif) sesuai ketersediaan jadwal siswa.",
    pic: "Kak William Candra (Kakak Asuh) & Siswa",
    accentColor: "#0284c7"
  },
  {
    num: 3,
    title: "Fokus Target Evaluasi Tryout Berikutnya (TO 5)",
    desc: "Tinjau kesiapan menghadapi TO 5 dengan memprioritaskan penahanan tren turun pada subtes pembobot utama (PK & PU) serta menjaga konsistensi subtes PM.",
    pic: "Siswa & Kakak Asuh",
    accentColor: "#f79009"
  },
  {
    num: 4,
    title: "Dukungan Kebiasaan & Lingkungan Belajar di Rumah",
    desc: "Konfirmasikan bentuk dukungan belajar di rumah yang realistis bersama orang tua (konsistensi jam belajar, pengawasan distraksi, dan kesesuaian dukungan target jurusan).",
    pic: "Orang Tua / Wali Siswa",
    accentColor: "#027a48"
  }
];
