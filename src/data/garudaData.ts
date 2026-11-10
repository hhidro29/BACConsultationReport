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
  targetScore: number;
  gapText: string;
  rgQuestionsDone: number;
  rgAccuracy: string;
  diagnosis: string;
  targetTo5: string;
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
  attendanceDetail: "36 Hadir • 1 Terlambat • 6 Sakit • 2 Izin",
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

// 4 Subtests Prioritas for V2 - Synchronized with V2 PDF Section 4
export const prioritySubtestsV2: PrioritySubtest[] = [
  {
    id: "pk",
    priorityLabel: "BOBOT TERTINGGI #1",
    name: "Pengetahuan Kuantitatif (PK)",
    toScore: "488",
    targetScore: 600,
    gapText: "-112",
    rgQuestionsDone: 5,
    rgAccuracy: "40% benar (1 sesi)",
    diagnosis: "Kritis. Baru mengerjakan 5 soal di aplikasi. Drill harian dan perkuat konsep dasar Aljabar, Peluang Dasar, dan Geometri di Klinik PR.",
    targetTo5: "Naik minimal +42 poin (Skor ≥ 530)",
    borderColor: "#fda29b"
  },
  {
    id: "pu",
    priorityLabel: "BOBOT TERTINGGI #2",
    name: "Penalaran Umum (PU)",
    toScore: "465",
    targetScore: 600,
    gapText: "-135",
    rgQuestionsDone: 35,
    rgAccuracy: "63% benar (7 sesi)",
    diagnosis: "Rutinitas drill sudah terbentuk. Fokus perbaikan pada ketelitian membaca premis silogisme dan pola penalaran induktif.",
    targetTo5: "Naik minimal +45 poin (Skor ≥ 510)",
    borderColor: "#fda29b"
  },
  {
    id: "pm",
    priorityLabel: "BOBOT TERTINGGI #3",
    name: "Penalaran Matematika (PM)",
    toScore: "597",
    targetScore: 600,
    gapText: "-3",
    rgQuestionsDone: 10,
    rgAccuracy: "50% benar (2 sesi)",
    diagnosis: "Skor relatif stabil dan hanya terpaut -3 poin dari target 600. Jaga ritme latihan mingguan pada model aljabar kontekstual.",
    targetTo5: "Stabil menembus ≥ 610",
    borderColor: "#b2ddff"
  },
  {
    id: "lbi",
    priorityLabel: "SUBTES PENDUKUNG",
    name: "Literasi B. Indo (Saintek) & B. Inggris",
    toScore: "505 / 543",
    targetScore: 600,
    gapText: "-95 / -57",
    rgQuestionsDone: 0,
    rgAccuracy: "0% (belum ada drill)",
    diagnosis: "Belum pernah membuka drill literasi di aplikasi. Biasakan membaca minimal 1 teks ilmiah akademik per hari untuk menajamkan ide pokok.",
    targetTo5: "Naik ke kisaran 550+",
    borderColor: "#fedf89"
  }
];

// 4 Action Plans toward TO 5
export const actionPlansV2: ActionPlan[] = [
  {
    num: 1,
    title: "Drill Mandiri Aplikasi Ruangguru",
    desc: "Target: Menyelesaikan minimal 25 soal per hari khusus subtes prioritas (PK dan PU). Fokus pada bab dengan akurasi terendah di Student Tower setiap malam setelah belajar sekolah.",
    pic: "Garuda Mahawira Sena (Siswa)",
    accentColor: "#1078ca"
  },
  {
    num: 2,
    title: "Klinik Belajar Tatap Muka Bersama SA",
    desc: "Target: Hadir minimal 1x seminggu di Cabang Depok Margonda untuk sesi bedah soal jebakan UTBK, teknik cepat penalaran analitis, dan manajemen alokasi waktu ujian.",
    pic: "Kak William Candra (Kakak Asuh) & Siswa",
    accentColor: "#0284c7"
  },
  {
    num: 3,
    title: "Evaluasi Peningkatan di Tryout 5",
    desc: "Target: Mengikuti TO 5 tepat waktu dengan target perbaikan skor: PU ≥ 510 (+45), PK ≥ 530 (+42), dan rata-rata keseluruhan naik kembali menuju batas aman ≥ 580.",
    pic: "Siswa & Tim Akademik Ruangguru",
    accentColor: "#f79009"
  },
  {
    num: 4,
    title: "Pendampingan Lingkungan Belajar di Rumah",
    desc: "Target: Orang tua membantu menjaga waktu belajar tenang minimal 1.5 jam setiap malam (20.00 - 21.30) tanpa distraksi gawai non-belajar, serta memastikan nutrisi & waktu tidur cukup.",
    pic: "Bapak Bambang Sena (Orang Tua)",
    accentColor: "#027a48"
  }
];
