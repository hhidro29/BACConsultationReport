// V1 Detailed Tryout Series and Program Catalog

export interface TopicDrill {
  name: string;
  toAcc: string;
  drillDone: number;
  drillAcc: string;
}

export interface SubtestSeriesItem {
  id: string;
  name: string;
  scores: number[];
  minY: number;
  maxY: number;
  drillSessions: number;
  drillQuestions: number;
  drillCorrect: number;
  drillAcc: string;
  topics: TopicDrill[];
}

export const studentToSeriesV1: Record<string, SubtestSeriesItem | any> = {
  total: { name: "Skor Rata-rata UTBK", scores: [601, 576, 561, 546], minY: 450, maxY: 700 },
  pu: {
    id: "pu",
    name: "Penalaran Umum (PU)",
    scores: [567, 583, 514, 465],
    minY: 400,
    maxY: 900,
    drillSessions: 7,
    drillQuestions: 35,
    drillCorrect: 22,
    drillAcc: "62.9%",
    topics: [
      { name: "Penalaran Induktif", toAcc: "32% benar", drillDone: 15, drillAcc: "60% benar" },
      { name: "Silogisme & Logika Deduktif", toAcc: "41% benar", drillDone: 12, drillAcc: "67% benar" },
      { name: "Penalaran Kuantitatif Simbolik", toAcc: "45% benar", drillDone: 8, drillAcc: "62% benar" }
    ]
  },
  pk: {
    id: "pk",
    name: "Pengetahuan Kuantitatif (PK)",
    scores: [668, 620, 539, 488],
    minY: 400,
    maxY: 950,
    drillSessions: 1,
    drillQuestions: 5,
    drillCorrect: 2,
    drillAcc: "40.0%",
    topics: [
      { name: "Aljabar & Fungsi Pecahan", toAcc: "28% benar", drillDone: 5, drillAcc: "40% benar" },
      { name: "Statistika & Peluang Dasar", toAcc: "38% benar", drillDone: 0, drillAcc: "Belum drill" },
      { name: "Geometri Sudut & Bidang", toAcc: "42% benar", drillDone: 0, drillAcc: "Belum drill" }
    ]
  },
  pm: {
    id: "pm",
    name: "Penalaran Matematika (PM)",
    scores: [597, 639, 588, 597],
    minY: 450,
    maxY: 900,
    drillSessions: 2,
    drillQuestions: 10,
    drillCorrect: 5,
    drillAcc: "50.0%",
    topics: [
      { name: "Pemodelan Persamaan Linear", toAcc: "40% benar", drillDone: 4, drillAcc: "50% benar" },
      { name: "Aritmatika Sosial & Rasio", toAcc: "46% benar", drillDone: 4, drillAcc: "50% benar" },
      { name: "Barisan dan Deret Kontekstual", toAcc: "50% benar", drillDone: 2, drillAcc: "50% benar" }
    ]
  },
  lbi_a: {
    id: "lbi_a",
    name: "Literasi B. Indonesia (Teks Akademik)",
    scores: [626, 637, 590, 505],
    minY: 400,
    maxY: 750,
    drillSessions: 0,
    drillQuestions: 0,
    drillCorrect: 0,
    drillAcc: "Belum drill",
    topics: [
      { name: "Mengevaluasi Bias Penulis", toAcc: "35% benar", drillDone: 0, drillAcc: "Belum drill" },
      { name: "Memahami Makna Tersirat Kalimat", toAcc: "40% benar", drillDone: 0, drillAcc: "Belum drill" },
      { name: "Hubungan Logika Antarparagraf", toAcc: "44% benar", drillDone: 0, drillAcc: "Belum drill" }
    ]
  },
  lbi_s: {
    id: "lbi_s",
    name: "Literasi B. Indonesia (Teks Sastra)",
    scores: [628, 494, 488, 573],
    minY: 400,
    maxY: 750,
    drillSessions: 0,
    drillQuestions: 0,
    drillCorrect: 0,
    drillAcc: "Belum drill",
    topics: [
      { name: "Unsur Intrinsik Cerita", toAcc: "42% benar", drillDone: 0, drillAcc: "Belum drill" },
      { name: "Interpretasi Karakter & Konflik", toAcc: "46% benar", drillDone: 0, drillAcc: "Belum drill" },
      { name: "Gaya Bahasa & Majas", toAcc: "51% benar", drillDone: 0, drillAcc: "Belum drill" }
    ]
  },
  pbm: {
    id: "pbm",
    name: "Pemahaman Bacaan & Menulis (PBM)",
    scores: [553, 562, 612, 554],
    minY: 450,
    maxY: 750,
    drillSessions: 2,
    drillQuestions: 6,
    drillCorrect: 3,
    drillAcc: "50.0%",
    topics: [
      { name: "Kepaduan Paragraf & Konjungsi", toAcc: "48% benar", drillDone: 3, drillAcc: "33% benar" },
      { name: "Kalimat Efektif & EYD", toAcc: "52% benar", drillDone: 3, drillAcc: "67% benar" },
      { name: "Inti Kalimat Kompleks", toAcc: "55% benar", drillDone: 0, drillAcc: "Belum drill" }
    ]
  },
  lbe: {
    id: "lbe",
    name: "Literasi B. Inggris (LBIN)",
    scores: [572, 538, 607, 543],
    minY: 450,
    maxY: 750,
    drillSessions: 0,
    drillQuestions: 0,
    drillCorrect: 0,
    drillAcc: "Belum drill",
    topics: [
      { name: "Inference & Implied Detail", toAcc: "50% benar", drillDone: 0, drillAcc: "Belum drill" },
      { name: "Author's Tone & Attitude", toAcc: "54% benar", drillDone: 0, drillAcc: "Belum drill" },
      { name: "Main Idea Synthesis", toAcc: "60% benar", drillDone: 0, drillAcc: "Belum drill" }
    ]
  },
  ppu: {
    id: "ppu",
    name: "Pengetahuan & Pemahaman Umum (PPU)",
    scores: [595, 536, 546, 640],
    minY: 450,
    maxY: 750,
    drillSessions: 7,
    drillQuestions: 18,
    drillCorrect: 4,
    drillAcc: "22.2%",
    topics: [
      { name: "Makna Kata Kontekstual", toAcc: "65% benar", drillDone: 8, drillAcc: "25% benar" },
      { name: "Sinonim & Antonim Akademik", toAcc: "68% benar", drillDone: 6, drillAcc: "17% benar" },
      { name: "Gagasan Utama Wacana", toAcc: "72% benar", drillDone: 4, drillAcc: "25% benar" }
    ]
  }
};

studentToSeriesV1.lbi = studentToSeriesV1.lbi_a;

export const programCatalogV1: Record<string, any> = {
  ugm_farmasi: {
    id: "ugm_farmasi",
    prodi: "Farmasi",
    univ: "Universitas Gadjah Mada (UGM)",
    shortTitle: "Farmasi — UGM",
    fullTitle: "S1 Farmasi — Universitas Gadjah Mada (UGM)",
    degree: "S1",
    city: "Sleman, D.I. Yogyakarta",
    rumpun: "Sains & Kesehatan (Farmasi)",
    quota2026: 72,
    applicants2025: 1868,
    tightness: "3.85%",
    pgWeighted: 668.41,
    targetScore: 694,
    leaderboardRank: "17 dari 69 pemilih",
    leaderboardPercentile: "Masuk Top 25% pemilih di Ruangguru",
    leaderboardTop: 713,
    supportSubjects: ["Kimia", "Biologi"],
    prioritySubtests: ["pk", "pu", "pm"],
    pgSubtests: { pk: 937, pu: 844, pm: 750, pbm: 562, lbe: 516, ppu: 500, lbi: 500 },
    leaderboardSubtests: { pu: 734, ppu: 669, pbm: 685, pk: 768, lbi: 653, lbe: 574, pm: 770 },
    saPrompt: "Peringkat 17 dari 69 pemilih di Ruangguru. Nilai Garuda saat ini 546, masih kurang 148 poin untuk mencapai target kelulusan Farmasi UGM (694). Tiga subtes penentu utama adalah PK (target 937), PU (target 844), dan PM (target 750). Sepakati target bertahap TO 5 di angka 585+.",
    conclusionText: "<strong>Status Pilihan 1:</strong> Garuda berada di peringkat 17 dari 69 pemilih di Ruangguru (Top 25%). Nilai Garuda saat ini (546) masih kurang 148 poin dari target kelulusan Farmasi UGM (694). Fokus perbaikan utama pada 3 subtes penentu: <strong>Pengetahuan Kuantitatif (PK)</strong>, <strong>Penalaran Umum (PU)</strong>, dan <strong>Penalaran Matematika (PM)</strong>, serta konsistensi drill soal mandiri di Student Tower.",
    peerIds: ["ugm_farmasi", "ui_farmasi", "unpad_farmasi", "ub_farmasi", "ui_kimia", "ipb_tekpang"]
  },
  ui_farmasi: {
    id: "ui_farmasi",
    prodi: "Farmasi",
    univ: "Universitas Indonesia (UI)",
    shortTitle: "Farmasi — UI",
    fullTitle: "S1 Farmasi — Universitas Indonesia (UI)",
    degree: "S1",
    city: "Depok, Jawa Barat",
    rumpun: "Sains & Kesehatan (Farmasi)",
    quota2026: 59,
    applicants2025: 1154,
    tightness: "5.11%",
    pgWeighted: 655.56,
    targetScore: 686,
    leaderboardRank: "10 dari 41 pemilih",
    leaderboardPercentile: "Masuk Top 25% pemilih di Ruangguru",
    leaderboardTop: 718,
    supportSubjects: ["Kimia", "Biologi"],
    prioritySubtests: ["pk", "pu", "pm"],
    pgSubtests: { pk: 919, pu: 827, pm: 736, pbm: 552, lbe: 506, ppu: 500, lbi: 500 },
    leaderboardSubtests: { pu: 772, ppu: 725, pbm: 739, pk: 734, lbi: 604, lbe: 664, pm: 731 },
    saPrompt: "Peringkat 10 dari 41 pemilih di Ruangguru. Nilai Garuda saat ini 546, masih kurang 140 poin dari target kelulusan Farmasi UI (686). Tiga subtes penentu utama adalah PK (target 919), PU (target 827), dan PM (target 736).",
    conclusionText: "<strong>Status Pilihan 2:</strong> Target kelulusan Farmasi UI adalah 686 (kurang 140 poin dari nilai TO 4: 546). Disarankan menguji coba simulasi kampus alternatif serumpun di Seksi 4.",
    peerIds: ["ui_farmasi", "ugm_farmasi", "unpad_farmasi", "ub_farmasi", "ui_kimia", "ipb_tekpang"]
  },
  itb_mesin: {
    id: "itb_mesin",
    prodi: "Teknik Mesin (FTMD)",
    univ: "Institut Teknologi Bandung (ITB)",
    shortTitle: "Teknik Mesin — ITB",
    fullTitle: "S1 Teknik Mesin (FTMD) — Institut Teknologi Bandung (ITB)",
    degree: "S1",
    city: "Bandung, Jawa Barat",
    rumpun: "Sains & Rekayasa Teknik",
    quota2026: 75,
    applicants2025: 1620,
    tightness: "4.63%",
    pgWeighted: 642.50,
    targetScore: 660,
    leaderboardRank: "22 dari 85 pemilih",
    leaderboardPercentile: "Masuk Top 26% pemilih di Ruangguru",
    leaderboardTop: 698,
    supportSubjects: ["Fisika", "Matematika Tingkat Lanjut"],
    prioritySubtests: ["pm", "pk", "pu"],
    pgSubtests: { pm: 890, pk: 865, pu: 810, pbm: 540, lbe: 530, ppu: 500, lbi: 500 },
    leaderboardSubtests: { pu: 715, ppu: 640, pbm: 650, pk: 742, lbi: 610, lbe: 668, pm: 755 },
    saPrompt: "Peringkat 22 dari 85 pemilih di Ruangguru. Nilai Garuda saat ini 546, masih kurang 114 poin dari target kelulusan Teknik Mesin ITB (660). Subtes penentu utama bergeser ke Penalaran Matematika (PM target 890, PK target 865, PU target 810).",
    conclusionText: "<strong>Status Pilihan 3:</strong> Daya tampung 75 kursi (keketatan 4.63%). Subtes penentu utama bergeser ke <strong>Penalaran Matematika (PM target 890)</strong> dan <strong>Pengetahuan Kuantitatif (PK target 865)</strong>.",
    peerIds: ["itb_mesin", "ugm_farmasi", "unpad_farmasi", "ui_kimia", "ipb_tekpang"]
  },
  unpad_farmasi: {
    id: "unpad_farmasi",
    prodi: "Farmasi",
    univ: "Universitas Padjadjaran (UNPAD)",
    shortTitle: "Farmasi — UNPAD",
    fullTitle: "S1 Farmasi — Universitas Padjadjaran (UNPAD)",
    degree: "S1",
    city: "Sumedang / Bandung, Jawa Barat",
    rumpun: "Sains & Kesehatan (Farmasi)",
    quota2026: 66,
    applicants2025: 2140,
    tightness: "3.08%",
    pgWeighted: 659.67,
    targetScore: 675,
    leaderboardRank: "14 dari 62 pemilih",
    leaderboardPercentile: "Masuk Top 23% pemilih di Ruangguru",
    leaderboardTop: 705,
    supportSubjects: ["Kimia", "Biologi"],
    prioritySubtests: ["pk", "pu", "pm"],
    pgSubtests: { pk: 925, pu: 833, pm: 741, pbm: 555, lbe: 510, ppu: 500, lbi: 500 },
    leaderboardSubtests: { pu: 720, ppu: 660, pbm: 670, pk: 745, lbi: 635, lbe: 610, pm: 740 },
    saPrompt: "Alternatif Farmasi di Jawa Barat (sesuai harapan lokasi orang tua) dengan target kelulusan 675.",
    conclusionText: "Alternatif farmasi terdekat di Jawa Barat.",
    peerIds: ["unpad_farmasi", "ugm_farmasi", "ui_farmasi", "ub_farmasi", "ui_kimia"]
  },
  ub_farmasi: {
    id: "ub_farmasi",
    prodi: "Farmasi",
    univ: "Universitas Brawijaya (UB)",
    shortTitle: "Farmasi — UB",
    fullTitle: "S1 Farmasi — Universitas Brawijaya (UB)",
    degree: "S1",
    city: "Malang, Jawa Timur",
    rumpun: "Sains & Kesehatan (Farmasi)",
    quota2026: 54,
    applicants2025: 1490,
    tightness: "3.62%",
    pgWeighted: 634.97,
    targetScore: 650,
    leaderboardRank: "9 dari 48 pemilih",
    leaderboardPercentile: "Masuk Top 19% pemilih di Ruangguru",
    leaderboardTop: 688,
    supportSubjects: ["Kimia", "Biologi"],
    prioritySubtests: ["pk", "pu", "pm"],
    pgSubtests: { pk: 890, pu: 801, pm: 712, pbm: 534, lbe: 500, ppu: 500, lbi: 500 },
    leaderboardSubtests: { pu: 695, ppu: 650, pbm: 645, pk: 715, lbi: 620, lbe: 605, pm: 710 },
    saPrompt: "Pilihan Farmasi dengan target nilai lebih moderat (650, kurang 104 poin). Opsi menarik jika keluarga membuka izin lokasi Jawa Timur.",
    conclusionText: "Pilihan farmasi moderat di klaster PTN Jawa.",
    peerIds: ["ub_farmasi", "ugm_farmasi", "ui_farmasi", "unpad_farmasi", "ui_kimia"]
  },
  ui_kimia: {
    id: "ui_kimia",
    prodi: "Kimia",
    univ: "Universitas Indonesia (UI)",
    shortTitle: "Kimia — UI",
    fullTitle: "S1 Kimia — Universitas Indonesia (UI)",
    degree: "S1",
    city: "Depok, Jawa Barat",
    rumpun: "Sains Murni (Serumpun Farmasi)",
    quota2026: 48,
    applicants2025: 820,
    tightness: "5.85%",
    pgWeighted: 585.00,
    targetScore: 605,
    leaderboardRank: "4 dari 29 pemilih",
    leaderboardPercentile: "Masuk Top 14% pemilih di Ruangguru",
    leaderboardTop: 654,
    supportSubjects: ["Kimia", "Matematika Tingkat Lanjut"],
    prioritySubtests: ["pk", "pm", "pu"],
    pgSubtests: { pk: 680, pm: 660, pu: 640, lbi: 560, pbm: 550, lbe: 540, ppu: 520 },
    leaderboardSubtests: { pu: 645, ppu: 650, pbm: 630, pk: 675, lbi: 620, lbe: 635, pm: 665 },
    saPrompt: "Pilihan cadangan ideal di UI Depok! Serumpun sains farmasi, dan target kelulusan (605) hanya berjarak 59 poin dari nilai Garuda saat ini (546).",
    conclusionText: "Pilihan cadangan paling strategis dan realistis di UI Depok.",
    peerIds: ["ui_kimia", "ugm_farmasi", "ui_farmasi", "unpad_farmasi", "ipb_tekpang"]
  },
  ipb_tekpang: {
    id: "ipb_tekpang",
    prodi: "Teknologi Pangan",
    univ: "Institut Pertanian Bogor (IPB)",
    shortTitle: "Teknologi Pangan — IPB",
    fullTitle: "S1 Teknologi Pangan — Institut Pertanian Bogor (IPB)",
    degree: "S1",
    city: "Bogor, Jawa Barat",
    rumpun: "Sains Hayati & Pangan",
    quota2026: 68,
    applicants2025: 1380,
    tightness: "4.93%",
    pgWeighted: 575.00,
    targetScore: 595,
    leaderboardRank: "3 dari 34 pemilih",
    leaderboardPercentile: "Masuk Top 9% pemilih di Ruangguru",
    leaderboardTop: 642,
    supportSubjects: ["Kimia", "Biologi"],
    prioritySubtests: ["pu", "pk", "lbi"],
    pgSubtests: { pu: 650, pk: 645, lbi: 610, pm: 605, pbm: 550, lbe: 540, ppu: 525 },
    leaderboardSubtests: { pu: 640, ppu: 645, pbm: 625, pk: 655, lbi: 615, lbe: 620, pm: 640 },
    saPrompt: "Pilihan cadangan sangat aman (target 595). Rata-rata 4 TO Garuda (571) sudah mendekati target prodi ini (hanya berjarak 24 poin dari rata-rata).",
    conclusionText: "Pilihan cadangan sangat aman di koridor Jabodetabek/Bogor.",
    peerIds: ["ipb_tekpang", "ui_kimia", "ugm_farmasi", "ui_farmasi"]
  }
};
