// Student Data Master: Garuda Mahawira Sena (NISN: 0068492011)

export interface SubtestV2 {
  id: string;
  name: string;
  to1: number;
  to2: number;
  to3: number;
  to4: number;
  median: number;
  gap: number;
  status: 'SUDAH AMAN' | 'CUKUP AMAN' | 'PERLU DITINGKATKAN' | 'PRIORITAS SEDANG' | 'PRIORITAS TINGGI';
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
  toScore: number;
  targetScore: number;
  gap: number;
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

// 8 Subtests for Academic Team IA (Versi 2)
export const subtestsV2Data: SubtestV2[] = [
  {
    id: "pm",
    name: "Penalaran Matematika (PM)",
    to1: 615, to2: 602, to3: 592, to4: 580,
    median: 597, gap: -3,
    status: "SUDAH AMAN", badgeClass: "badge-p-done",
    fillPct: 65.6, barColor: "#12b76a"
  },
  {
    id: "lbi",
    name: "Literasi Bahasa Inggris (LBI)",
    to1: 590, to2: 585, to3: 572, to4: 558,
    median: 571, gap: -29,
    status: "CUKUP AMAN", badgeClass: "badge-p-low",
    fillPct: 57.0, barColor: "#1078ca"
  },
  {
    id: "lbind",
    name: "Literasi Bahasa Indonesia (LBIND)",
    to1: 575, to2: 568, to3: 552, to4: 540,
    median: 555, gap: -45,
    status: "CUKUP AMAN", badgeClass: "badge-p-low",
    fillPct: 51.7, barColor: "#1078ca"
  },
  {
    id: "pi",
    name: "Penalaran Induktif (PI)",
    to1: 560, to2: 550, to3: 544, to4: 530,
    median: 542, gap: -58,
    status: "PERLU DITINGKATKAN", badgeClass: "badge-p-med",
    fillPct: 47.3, barColor: "#f79009"
  },
  {
    id: "kmb",
    name: "Kemampuan Memahami Bacaan (KMB)",
    to1: 548, to2: 536, to3: 525, to4: 515,
    median: 528, gap: -72,
    status: "PRIORITAS SEDANG", badgeClass: "badge-p-med",
    fillPct: 42.7, barColor: "#f79009"
  },
  {
    id: "ppu",
    name: "Pengetahuan & Pemahaman Umum (PPU)",
    to1: 535, to2: 524, to3: 512, to4: 502,
    median: 515, gap: -85,
    status: "PRIORITAS SEDANG", badgeClass: "badge-p-med",
    fillPct: 38.3, barColor: "#f79009"
  },
  {
    id: "pk",
    name: "Pengetahuan Kuantitatif (PK)",
    to1: 510, to2: 495, to3: 485, to4: 470,
    median: 488, gap: -112,
    status: "PRIORITAS TINGGI", badgeClass: "badge-p-high",
    fillPct: 29.3, barColor: "#d92d20"
  },
  {
    id: "pu",
    name: "Penalaran Umum (PU)",
    to1: 490, to2: 472, to3: 460, to4: 445,
    median: 465, gap: -135,
    status: "PRIORITAS TINGGI", badgeClass: "badge-p-high",
    fillPct: 21.7, barColor: "#d92d20"
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

// 4 Subtests Prioritas for V2
export const prioritySubtestsV2: PrioritySubtest[] = [
  {
    id: "pu",
    priorityLabel: "PRIORITAS TINGGI #1",
    name: "Penalaran Umum (PU)",
    toScore: 465,
    targetScore: 600,
    gap: -135,
    rgQuestionsDone: 142,
    rgAccuracy: "58% (Rendah)",
    diagnosis: "Siswa sering terkecoh pada logika silogisme majemuk dan premis negatif. Butuh pembiasaan teknik eliminasi premis.",
    targetTo5: "Naik minimal +45 poin (Skor ≥ 510)",
    borderColor: "#fda29b"
  },
  {
    id: "pk",
    priorityLabel: "PRIORITAS TINGGI #2",
    name: "Pengetahuan Kuantitatif (PK)",
    toScore: 488,
    targetScore: 600,
    gap: -112,
    rgQuestionsDone: 98,
    rgAccuracy: "52% (Kritis)",
    diagnosis: "Kecepatan hitung lambat (>90 detik/soal). Konsep aljabar dasar dan geometri analitik butuh review intensif di klinik PR.",
    targetTo5: "Naik minimal +42 poin (Skor ≥ 530)",
    borderColor: "#fda29b"
  },
  {
    id: "ppu",
    priorityLabel: "PRIORITAS SEDANG #3",
    name: "Pengetahuan & Pemahaman Umum (PPU)",
    toScore: 515,
    targetScore: 600,
    gap: -85,
    rgQuestionsDone: 110,
    rgAccuracy: "64% (Sedang)",
    diagnosis: "Kosakata serapan dan makna bertingkat konteks kalimat sering salah tebak. Perlu pembiasaan membaca artikel editorial formal.",
    targetTo5: "Naik minimal +30 poin (Skor ≥ 545)",
    borderColor: "#fedf89"
  },
  {
    id: "kmb",
    priorityLabel: "PRIORITAS SEDANG #4",
    name: "Kemampuan Memahami Bacaan & Menulis (KMB)",
    toScore: 528,
    targetScore: 600,
    gap: -72,
    rgQuestionsDone: 125,
    rgAccuracy: "67% (Sedang)",
    diagnosis: "Kecepatan membaca teks panjang (skimming) masih kurang terlatih, sering kehabisan waktu di paragraf terakhir.",
    targetTo5: "Naik minimal +32 poin (Skor ≥ 560)",
    borderColor: "#fedf89"
  }
];

// 4 Action Plans toward TO 5
export const actionPlansV2: ActionPlan[] = [
  {
    num: 1,
    title: "Drill Mandiri Aplikasi Ruangguru",
    desc: "Target: Menyelesaikan minimal 25 soal per hari khusus subtes prioritas (PU dan PK). Fokus pada bab dengan akurasi terendah di Student Tower setiap malam setelah belajar sekolah.",
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
    desc: "Target: Mengikuti TO 5 tepat waktu dengan target perbaikan skor: PU ≥ 510 (+45), PK ≥ 530 (+42), dan rata-rata keseluruhan naik kembali ke batas aman ≥ 580.",
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
