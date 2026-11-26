import { drillTiersText, drillTotalForCount } from './actionPlanCopy.ts';
/**
 * Deterministic, Holistic Checkpoint 1 SA Guideline Engine (Non-AI-Centered)
 *
 * Evaluates any student profile for Checkpoint 1:
 * - Stage 1: 15 TO trend patterns, foundation scores (including all < 500), swings, attendance
 * - Stage 2: Generic major rumpun (Saintek/Soshum), location check, weighted gap bands, sample size
 * - Stage 3: 7 drill/score subtest conditions (including high accuracy but low TO, and mastered 600+)
 * - Stage 4: Dynamic 4-item Action Plans auto-generated from student's priority subtests & weak topics
 */

export type TryoutPattern =
  | 'no_data'
  | 'one_result'
  | 'initial_up'
  | 'initial_down'
  | 'initial_flat'
  | 'steady_up'
  | 'steady_down'
  | 'steady_flat'
  | 'up_with_pauses'
  | 'down_with_pauses'
  | 'recovery'
  | 'reversal_down'
  | 'fluctuating_up'
  | 'fluctuating_down'
  | 'fluctuating_flat';

export type Stage3ConditionId =
  | 'no_drill'
  | 'low_vol_low_acc'
  | 'active_drill_low_to'
  | 'high_acc_low_to'
  | 'near_target'
  | 'mastered_above'
  | 'general_gap';

export interface RuleTrace {
  ruleId: string;
  ruleName: string;
  expression: string;
  matched: boolean;
  effect: string;
}

export interface EngineThresholds {
  toTolerancePts: number;
  foundationScoreTarget: number;
  subtestSwingPts: number;
  attendanceWarnPct: number;
  wideWeightedGapPts: number;
  remainingEpisodesToNextConsult: number;
  remainingEpisodesToUtbk: number;
  planBGainThresholdPts: number;
  minBenchmarkParticipants: number;
  drillLowQuestions: number;
  drillLowAccuracyPct: number;
  drillActiveHighGap: number;
  nearTargetGapPts: number;
  drillMismatchHighQ: number;
  drillMismatchLowQ: number;
  /** Kondisi "akurasi drill tinggi tapi TO masih jauh": minimal soal drill */
  drillHighAccQuestions: number;
  /** Kondisi "akurasi drill tinggi tapi TO masih jauh": minimal akurasi (%) */
  drillHighAccuracyPct: number;
  /** Kondisi "akurasi drill tinggi tapi TO masih jauh": selisih ke target (≤ poin, negatif) */
  drillHighAccGapPts: number;
  /** Tahap 4: jumlah sesi sakit + izin yang memicu pengingat mengejar materi (≥) */
  absenceWarnSessions: number;
  /** Tahap 4: cakupan catatan pengajar di bawah persen ini memicu rambu (<) */
  notesLowCoveragePct: number;
  /** Catatan Kakak Asuh lebih pendek dari jumlah karakter ini memicu pengingat lunak saat Kunci (<) */
  notesShortChars: number;
  /** Rencana aksi: acuan total soal benar per minggu bila semua subtes sudah tercapai (bila ada subtes lemah, total = jumlah target per subtes) */
  weeklyDrillTotal: number;
  /** Rencana aksi: soal benar per minggu untuk subtes dengan nilai terendah (urutan 1) */
  drillRank1: number;
  /** Rencana aksi: urutan 2 */
  drillRank2: number;
  /** Rencana aksi: urutan 3 */
  drillRank3: number;
  /** Rencana aksi: soal benar per minggu untuk subtes lain di bawah target (urutan 4 dan seterusnya) */
  minDrillPerSubtest: number;
}

/**
 * Catatan tambahan Tahap 2. Placeholder: {target} {above} {total} {swing} {names} {pct} {warn} {delta}
 */
export interface Stage1Templates {
  foundationAllBelow500: string;
  foundationAllAbove: string;
  foundationPartial: string;
  foundationNone: string;
  swing: string;
  attendance: string;
  /** Ditambahkan di akhir kalimat observasi bila ada ≥ 3 TO. */
  latestDeltaSuffix: string;
}

/**
 * Teks Tahap 4 (kelas TMB dan catatan pengajar).
 * Placeholder: {pct} {present} {total} {absent} {sick} {excused} {notes} {notesPct} {emptyNotes}
 */
export interface ClassroomTemplates {
  noSessions: string;
  lowAttendance: string;
  goodAttendance: string;
  repeatedAbsence: string;
  noNotes: string;
  lowNotes: string;
  /** Poin ke-2 bila catatan pengajar cukup dan tidak ada sesi terlewat berulang */
  notesOk: string;
  /** Poin ke-3 kartu panduan */
  agreeTask: string;
  guardrailMissingNotes: string;
  guardrailAllNotes: string;
}

/**
 * Arahan di bawah kotak Catatan Kakak Asuh. Catatan internal SA, tidak masuk PDF.
 * Placeholder: {student} (nama depan), {subtests} (subtes minim drill), {pct} (kehadiran kelas, %)
 */
export interface NotesGuidanceTemplates {
  placeholder: string;
  /** Satu poin per baris, selalu tampil di akhir daftar */
  points: string;
  /** Tampil hanya bila tidak ada baris sesuai kondisi siswa */
  fallbackLine: string;
  reminder: string;
  conflictLine: string;
  missingDrillLine: string;
  lowAttendanceLine: string;
  allAchievedLine: string;
  /** Pengingat lunak saat Kunci bila catatan sangat pendek; SA tetap bisa lanjut */
  lockNudge: string;
}

/**
 * Teks tetap di kartu "Panduan Kakak Asuh" per tahap: judul, target hasil, rambu komunikasi, dan catatan konteks.
 * Rambu: satu poin per baris. Format ringan: **teks** = tebal, `teks` = kode.
 * Placeholder: {target} (target fondasi), {subtest} {history} {median} (contoh median Tahap 2),
 * {prodi} (Pilihan 1), {nextTo} (TO berikutnya)
 */
export interface GuideCardTemplates {
  t1Title: string;
  t1Goal: string;
  t1Rambu: string;
  t1MedianContext: string;
  t2Title: string;
  t2Goal: string;
  t2Rambu: string;
  t3Title: string;
  t3Goal: string;
  t3Rambu: string;
  t3Base600Note: string;
  t4Title: string;
  t4Goal: string;
  t4Rambu: string;
  t5Title: string;
  t5Goal: string;
  t5Continuity: string;
}

/** Teks Tahap 3 (audit drill keseluruhan). Placeholder: {topName} {topQ} {lowNames} {lowQ} */
export interface Stage3OverallTemplates {
  mismatchNote: string;
  /** Poin panduan SA (kondisi biasa): satu poin per baris, urutan: target, dengarkan, sepakati */
  tasks: string;
  /** Poin panduan SA bila semua subtes sudah mencapai target: satu poin per baris */
  tasksAchieved: string;
  /** Pengganti poin ke-2 bila ada subtes di bawah target tanpa drill soal. Placeholder: {noDrillNames} */
  taskNoDrill: string;
  /** Pengganti poin ke-2 bila drill menumpuk di satu subtes. Placeholder: {topName} {topQ} {lowNames} {lowQ} */
  taskMismatch: string;
  /** Hindari bila ada subtes tanpa drill soal */
  rambuNoDrill: string;
  /** Hindari bila drill menumpuk di satu subtes */
  rambuMismatch: string;
  guardrail: string;
}

/**
 * Teks Tahap 5: rencana aksi 1–4 dan checklist penutup. SATU SUMBER untuk dashboard dan PDF halaman 3.
 * Format ringan: **teks** = tebal.
 * Placeholder: {student} {sa} {parent} {branch} {target} {weakCount} {drillWeekly} {drillPerSubtest}
 * {deepest} {nextEpisode} {episode} {avgScore}
 */
export interface ActionPlanTemplates {
  plan1Title: string;
  plan1Desc: string;
  plan1DescAchieved: string;
  plan1Pic: string;
  plan3Title: string;
  plan3Desc: string;
  plan3DescAchieved: string;
  /** Ditambahkan setelah isi rencana 3 bila ringkasan target per jurusan tersedia */
  plan3ProgramSuffix: string;
  plan3Pic: string;
  /** Butir Plan B (tampil bila belum ada pilihan jurusan yang mencapai target acuan) */
  planBTitle: string;
  planBDesc: string;
  planBPic: string;
  plan4Title: string;
  /** Kalimat pembuka rencana 4 (tebal) */
  plan4Desc: string;
  plan4Daily: string;
  /** Dipakai bila masih ada subtes di bawah target */
  plan4Weekly: string;
  /** Dipakai bila semua subtes sudah mencapai target */
  plan4WeeklyAchieved: string;
  plan4Fallback: string;
  plan4Pic: string;
  /** Checklist penutup: satu poin per baris */
  checklist: string;
}

/** Memecah isian teks menjadi daftar poin: satu poin per baris, baris kosong diabaikan. */
export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function fillTemplate(tpl: string, vars: Record<string, string | number>): string {
  return Object.keys(vars).reduce((s, k) => s.split(`{${k}}`).join(String(vars[k])), tpl);
}

export interface Stage2Templates {
  mixedOrDifferent: string;
  aligned: string;
  unconfirmed: string;
  locationCheck: string;
  wideGap: string;
  remainingGap: string;
  exceedTarget: string;
  lowParticipantsWarning: string;
  defaultBenchmarkNote: string;
  /** Semua pilihan masih di bawah target. Placeholder: {siswa} {far} (selisih terjauh) {near} (selisih terdekat) */
  observationRange: string;
  /** Semua pilihan sudah melewati target. Placeholder: {siswa} */
  observationAhead: string;
  /** Sebagian pilihan sudah melewati target. Placeholder: {siswa} {far} */
  observationMixed: string;
  /** Kalimat observasi bila data selisih kosong. */
  observationUnknown: string;
}

export interface EngineRuleConfig {
  version: number;
  thresholds: EngineThresholds;
  patternTemplates: Record<
    TryoutPattern,
    { label: string; observation: string; student: string; parent: string; nextStep: string }
  >;
  stage1Templates: Stage1Templates;
  classroomTemplates: ClassroomTemplates;
  stage2Templates: Stage2Templates;
  stage3SubtestTemplates: Record<
    Stage3ConditionId,
    { label: string; observation: string; saTask: string }
  >;
  stage4Templates: {
    scheduleTask: string;
    parentSupportTask: string;
    missingDrillTask: string;
    conflictOrLocationTask: string;
    /** Poin ke-3 kartu panduan Tahap 5 */
    closingTask: string;
  };
  stage3OverallTemplates: Stage3OverallTemplates;
  actionPlanTemplates: ActionPlanTemplates;
  notesGuidanceTemplates: NotesGuidanceTemplates;
  guideCardTemplates: GuideCardTemplates;
}

export const DEFAULT_ENGINE_CONFIG: EngineRuleConfig = {
  version: 2,
  thresholds: {
    toTolerancePts: 5,
    foundationScoreTarget: 600,
    subtestSwingPts: 100,
    attendanceWarnPct: 80,
    wideWeightedGapPts: -90,
    remainingEpisodesToNextConsult: 3,
    remainingEpisodesToUtbk: 6,
    planBGainThresholdPts: 35,
    minBenchmarkParticipants: 500,
    drillLowQuestions: 15,
    drillLowAccuracyPct: 50,
    drillActiveHighGap: -90,
    nearTargetGapPts: -30,
    drillMismatchHighQ: 20,
    drillMismatchLowQ: 5,
    drillHighAccQuestions: 25,
    drillHighAccuracyPct: 70,
    drillHighAccGapPts: -35,
    absenceWarnSessions: 5,
    notesLowCoveragePct: 25,
    notesShortChars: 30,
    weeklyDrillTotal: 60,
    drillRank1: 20,
    drillRank2: 15,
    drillRank3: 12,
    minDrillPerSubtest: 10
  },
  patternTemplates: {
    no_data: {
      observation: 'Sampaikan hasil tryout {siswa} belum tersedia, jadi perkembangan nilai belum bisa dibaca.',
      label: 'Belum ada nilai',
      student: 'Tanyakan ke {siswa} tryout mana yang sudah diikuti dan apakah hasilnya bisa dibuka.',
      parent: 'Dengarkan orang tua soal kendala mengikuti tryout atau membuka hasilnya.',
      nextStep: 'Sepakati langkah melengkapi hasil tryout sebelum membahas perkembangan nilai.'
    },
    one_result: {
      observation: 'Sampaikan baru satu nilai tryout {siswa} yang tersedia ({a}), jadi perkembangan belum bisa disimpulkan.',
      label: 'Baru satu nilai',
      student: 'Dengarkan cerita {siswa} soal persiapan dan cara mengerjakan tryout ini.',
      parent: 'Dengarkan orang tua soal dukungan belajar yang ada dan yang dibutuhkan untuk tryout berikutnya.',
      nextStep: 'Sepakati tryout ini sebagai titik awal; perkembangan dibaca setelah ada pembanding.'
    },
    initial_up: {
      observation: 'Sampaikan nilai {siswa} naik dari {a} menjadi {b} ({selisih}). Baru dua tryout, jadi belum bisa disebut tren.',
      label: 'Baru 2 TO: naik',
      student: 'Dengarkan {siswa} membandingkan persiapan dan cara mengerjakan di dua tryout ini.',
      parent: 'Dengarkan orang tua soal rutinitas dan dukungan belajar di antara dua tryout.',
      nextStep: 'Sepakati hal yang ingin dievaluasi di tryout berikutnya.'
    },
    initial_down: {
      observation: 'Sampaikan nilai {siswa} turun dari {a} menjadi {b} ({selisih}). Baru dua tryout, jadi belum bisa disebut tren.',
      label: 'Baru 2 TO: turun',
      student: 'Dengarkan {siswa} membandingkan persiapan, cara mengerjakan, dan pembahasan hasil di dua tryout ini.',
      parent: 'Dengarkan orang tua soal rutinitas belajar di antara dua tryout, termasuk kendala bila ada.',
      nextStep: 'Sepakati hal yang ingin dievaluasi di tryout berikutnya, tanpa menyimpulkan penyebab penurunan.'
    },
    initial_flat: {
      observation: 'Sampaikan nilai {siswa} relatif sama di dua tryout ({a} dan {b}).',
      label: 'Baru 2 TO: datar',
      student: 'Dengarkan {siswa} soal jenis soal dan pengelolaan waktu di dua tryout ini.',
      parent: 'Dengarkan orang tua soal rutinitas dan dukungan belajar di antara dua tryout.',
      nextStep: 'Sepakati hal yang ingin dibedakan di tryout berikutnya, walau nilainya serupa.'
    },
    steady_up: {
      observation: 'Sampaikan nilai {siswa} naik {jumlah} kali berturut-turut, dari {a} menjadi {b} ({selisih}).',
      label: 'Naik konsisten',
      student: 'Dengarkan {siswa} soal persiapan, cara mengerjakan tryout, dan cara ia membahas hasilnya.',
      parent: 'Dengarkan orang tua soal rutinitas dan dukungan belajar selama periode ini.',
      nextStep: 'Sepakati cara belajar yang membantu menurut {siswa} dan hal yang ingin dievaluasi.'
    },
    steady_down: {
      observation: 'Sampaikan nilai {siswa} turun {jumlah} kali berturut-turut, dari {a} menjadi {b} ({selisih}).',
      label: 'Turun konsisten',
      student: 'Dengarkan {siswa} soal persiapan, cara mengerjakan tryout, dan cara ia membahas hasilnya.',
      parent: 'Dengarkan orang tua soal kondisi dan rutinitas belajar selama periode ini, termasuk perubahan jadwal.',
      nextStep: 'Sepakati tindak lanjut dari cerita {siswa} dan contoh pengerjaannya, tanpa menetapkan penyebab dari tren nilai saja.'
    },
    steady_flat: {
      observation: 'Sampaikan nilai {siswa} stabil di setiap tryout ({a} sampai {b}).',
      label: 'Stabil / datar',
      student: 'Dengarkan {siswa} soal jenis soal dan cara mengerjakan antartryout, termasuk kesulitan yang dirasakan.',
      parent: 'Dengarkan orang tua soal rutinitas dan kebutuhan belajar {siswa}.',
      nextStep: 'Sepakati langkah dari contoh pengerjaan; nilai yang tetap belum menjelaskan penguasaan materi.'
    },
    up_with_pauses: {
      observation: 'Sampaikan nilai {siswa} cenderung naik ({a} menjadi {b}), diselingi hasil yang datar.',
      label: 'Cenderung naik',
      student: 'Dengarkan {siswa} membandingkan persiapan di tryout yang nilainya naik dan yang tetap.',
      parent: 'Dengarkan orang tua soal rutinitas dan dukungan belajar selama periode ini.',
      nextStep: 'Sepakati hal yang ingin ditinjau di hasil berikutnya.'
    },
    down_with_pauses: {
      observation: 'Sampaikan nilai {siswa} cenderung turun ({a} menjadi {b}), diselingi hasil yang datar.',
      label: 'Cenderung turun',
      student: 'Dengarkan {siswa} membandingkan persiapan di tryout yang nilainya turun dan yang tetap.',
      parent: 'Dengarkan orang tua soal kondisi belajar selama periode ini, termasuk kendala bila ada.',
      nextStep: 'Sepakati fokus pembahasan dari pengalaman {siswa} dan contoh pengerjaannya.'
    },
    recovery: {
      observation: 'Sampaikan nilai terakhir {siswa} naik lagi setelah sempat turun ({a} menjadi {b}).',
      label: 'Kembali naik',
      student: 'Dengarkan {siswa} membandingkan persiapan di tryout terakhir dengan tryout sebelumnya.',
      parent: 'Dengarkan orang tua soal kondisi dan dukungan belajar menjelang tryout terakhir.',
      nextStep: 'Sepakati untuk memantau hasil berikutnya; satu kenaikan belum berarti konsisten.'
    },
    reversal_down: {
      observation: 'Sampaikan nilai terakhir {siswa} turun lagi setelah sempat naik ({a} menjadi {b}).',
      label: 'Menurun di akhir',
      student: 'Dengarkan {siswa} membandingkan persiapan di tryout terakhir dengan tryout sebelumnya.',
      parent: 'Dengarkan orang tua soal kondisi dan dukungan belajar menjelang tryout terakhir.',
      nextStep: 'Sepakati untuk memantau hasil berikutnya; satu penurunan belum berarti konsisten.'
    },
    fluctuating_up: {
      observation: 'Sampaikan nilai {siswa} naik-turun, tetapi nilai akhir lebih tinggi dari awal ({a} menjadi {b}).',
      label: 'Naik-turun, membaik',
      student: 'Dengarkan {siswa} membandingkan persiapan di tryout yang nilainya tinggi dan rendah.',
      parent: 'Dengarkan orang tua soal rutinitas dan dukungan belajar antartryout.',
      nextStep: 'Sepakati hal yang ingin dievaluasi dari perbedaan pengalaman {siswa} di tiap tryout.'
    },
    fluctuating_down: {
      observation: 'Sampaikan nilai {siswa} naik-turun, dan nilai akhir lebih rendah dari awal ({a} menjadi {b}).',
      label: 'Naik-turun, melemah',
      student: 'Dengarkan {siswa} membandingkan persiapan di tryout yang nilainya rendah dan tinggi.',
      parent: 'Dengarkan orang tua soal rutinitas dan kondisi belajar antartryout, termasuk kendala bila ada.',
      nextStep: 'Sepakati fokus tindak lanjut dari pengalaman {siswa} dan contoh pengerjaannya.'
    },
    fluctuating_flat: {
      observation: 'Sampaikan nilai {siswa} naik-turun, dengan nilai awal dan akhir serupa ({a} dan {b}).',
      label: 'Naik-turun, skor sama',
      student: 'Dengarkan {siswa} membandingkan persiapan di tryout yang nilainya tinggi dan rendah.',
      parent: 'Dengarkan orang tua soal kondisi dan dukungan belajar selama periode naik-turun ini.',
      nextStep: 'Sepakati hal yang ingin dievaluasi dari perbedaan pengalaman di tiap tryout.'
    }
  },
  stage2Templates: {
    mixedOrDifferent:
      'Sepakati satu jurusan utama yang benar-benar ingin dikejar {siswa}, dengan mempertimbangkan harapan orang tua.',
    aligned:
      'Sepakati urutan pilihan jurusan {siswa} yang akan dikejar bersama keluarga.',
    unconfirmed:
      'Sepakati bersama {siswa} dan orang tua bahwa pilihan jurusan yang tercatat sudah sesuai.',
    locationCheck:
      'Sepakati batas lokasi kuliah dan biaya yang sanggup ditanggung keluarga, supaya pilihan jurusan realistis.',
    wideGap:
      'Sampaikan nilai {siswa} masih kurang {far} poin dari target jurusan terjauh. Sepakati kenaikan per TO yang realistis, dan jelaskan jurusan cadangan (Plan B) sebagai pengaman.',
    remainingGap:
      'Sampaikan nilai {siswa} sudah dekat dengan target jurusan. Sepakati kenaikan per TO sampai nilai jurusan melewati target.',
    exceedTarget:
      'Sampaikan nilai {siswa} sudah melewati target jurusan. Sepakati cara menjaga konsistensi supaya selisihnya tetap aman.',
    lowParticipantsWarning:
      'Pembanding hanya {count} peserta (di bawah batas {limit}), jadi jangan dipakai untuk menyebut posisi aman atau menjamin lolos SNPMB.',
    defaultBenchmarkNote:
      'Target ini acuan latihan internal Ruangguru, bukan jaminan lolos SNPMB.',
    observationRange: 'Nilai {siswa} masih kurang {near} sampai {far} poin dari target jurusan.',
    observationAhead: 'Nilai {siswa} sudah melewati target jurusan.',
    observationMixed: 'Sebagian pilihan sudah melewati target, yang lain masih kurang {far} poin.',
    observationUnknown: 'Selisih nilai ke target jurusan belum tersedia.'
  },
  stage3SubtestTemplates: {
    no_drill: {
      observation: 'Skor {toLatest} (jarak {gap}), aktivitas drill soal di aplikasi tercatat 0 soal.',
      label: 'Belum Ada Data Drill Soal Aplikasi',
      saTask:
        'Konfirmasi apakah siswa drill soal mandiri dari sumber luar aplikasi atau menemui kendala membuka drill soal, tanpa menyimpulkan siswa belum belajar.'
    },
    low_vol_low_acc: {
      observation: 'Skor {toLatest} (jarak {gap}); tercatat {questions} soal ({sessions} sesi, {accuracy}% benar).',
      label: 'Volume Terbatas & Akurasi Rendah',
      saTask:
        'Tinjau topik akurasi terendah bersama siswa dan bahas rencana penguatan konsep dasar.'
    },
    active_drill_low_to: {
      observation: 'Tercatat {questions} soal ({sessions} sesi, {accuracy}% benar), namun skor TO {toLatest} (jarak {gap}).',
      label: 'Drill Soal Aktif · Gap TO Masih Lebar',
      saTask:
        'Bandingkan cara siswa mengerjakan drill soal vs saat tryout (manajemen waktu, ketelitian premis, atau variasi soal).'
    },
    high_acc_low_to: {
      observation: 'Akurasi drill soal tinggi di aplikasi ({accuracy}% benar dari {questions} soal), namun skor TO {toLatest} (jarak {gap}).',
      label: 'Akurasi Drill Soal Tinggi · Gap TO Masih Ada',
      saTask:
        'Konsep dasar drill soal sudah baik di aplikasi; evaluasi simulasi pengerjaan saat tryout (manajemen waktu, ketelitian membaca jebakan, atau mental ujian).'
    },
    near_target: {
      observation: 'Skor {toLatest} (jarak {gap} ke target); tercatat {questions} soal ({accuracy}% benar).',
      label: 'Mendekati Batas Target',
      saTask:
        'Pertahankan ritme drill soal pada topik yang masih salah agar stabil melampaui batas target acuan.'
    },
    mastered_above: {
      observation: 'Skor {toLatest} (melampaui target +{gap}); tercatat {questions} soal ({accuracy}% benar).',
      label: 'Target Terpenuhi (Maksimalkan Margin)',
      saTask:
        'Pertahankan konsistensi latihan dan dorong margin skor setinggi mungkin di atas target acuan untuk mengungguli pesaing, sambil tetap memantau subtes lain yang masih perlu penguatan.'
    },
    general_gap: {
      observation: 'Skor {toLatest} (jarak {gap}); tercatat {questions} soal ({sessions} sesi, {accuracy}% benar).',
      label: 'Perlu Penguatan Terarah',
      saTask:
        'Bahas kendala pada topik terlemah serta kecocokan topik drill soal di aplikasi.'
    }
  },
  stage4Templates: {
    scheduleTask:
      'Sepakati hari dan jam drill soal {siswa} yang tidak bentrok dengan jadwal sekolah, dengan target minimal {drillWeekly} soal benar per minggu.',
    parentSupportTask:
      'Tanyakan ke orang tua bentuk dukungan dan pemantauan belajar yang paling nyaman dilakukan di rumah.',
    missingDrillTask:
      'Sepakati jadwal dan topik latihan untuk subtes yang drill soalnya masih sedikit.',
    conflictOrLocationTask:
      'Catat pilihan jurusan atau batas lokasi yang belum final, agar bisa dicek ulang di sesi berikutnya.',
    closingTask:
      'Tulis di Catatan Kakak Asuh apa yang disepakati, siapa mengerjakan apa, dan kapan dicek. Lalu serahkan PDF laporan ke {siswa} dan orang tua.'
  },
  stage1Templates: {
    foundationAllBelow500:
      'Sampaikan semua subtes {siswa} masih di bawah 500, jadi targetnya bertahap: kejar 2–3 subtes terdekat dulu sebelum semua subtes mencapai {target}.',
    foundationAllAbove:
      'Sampaikan semua subtes {siswa} sudah mencapai {target}. Fokus berikutnya memantapkan subtes yang berbobot untuk jurusan pilihan.',
    foundationPartial:
      'Sampaikan {above} dari {total} subtes {siswa} sudah mencapai {target}. Apresiasi dulu kekuatan itu sebelum membahas subtes yang masih jauh.',
    foundationNone:
      'Sampaikan belum ada subtes {siswa} yang mencapai {target}. Sepakati target bertahap per subtes sebagai langkah awal.',
    swing:
      'Sampaikan nilai {names} naik-turun lebih dari {swing} poin, jadi baca nilai tengah (median) sebagai gambaran sehari-hari {siswa}.',
    attendance:
      'Tanyakan ke {siswa} kendala jadwal atau kehadiran kelas (tercatat {pct}%, di bawah {warn}%) sebelum menyusun target baru.',
    latestDeltaSuffix: ' Perubahan terakhir: {delta} poin.'
  },
  classroomTemplates: {
    noSessions: 'Sampaikan belum ada sesi kelas TMB {siswa} yang tercatat pada periode ini, jadi kehadiran belum bisa dibaca.',
    lowAttendance:
      'Tanyakan ke {siswa} kendala jadwal atau kehadiran kelas TMB (tercatat {pct}%, {present} dari {total} sesi) sebelum menambah target belajar baru.',
    goodAttendance:
      'Sampaikan kehadiran kelas TMB {siswa} sudah baik ({pct}%, {present} dari {total} sesi). Apresiasi konsistensinya.',
    repeatedAbsence:
      'Pastikan {siswa} mengejar materi dari {absent} sesi yang tidak hadir ({sick} sakit, {excused} izin) lewat rekaman kelas.',
    noNotes:
      'Tanyakan ke {siswa} materi kelas mana yang masih terasa sulit, karena belum ada catatan tertulis pengajar pada periode ini.',
    lowNotes:
      'Tanyakan ke {siswa} materi kelas mana yang masih terasa sulit, karena baru {notes} dari {total} sesi ({notesPct}%) yang punya catatan tertulis pengajar.',
    notesOk:
      'Bahas catatan pengajar bersama {siswa}, lalu cocokkan dengan subtes yang nilainya masih perlu penguatan.',
    agreeTask: 'Sepakati satu hal yang akan dilakukan {siswa} agar tidak tertinggal materi kelas.',
    guardrailMissingNotes:
      'Data menampilkan rekaman asli Student Tower tanpa pemrosesan AI. Dari {total} sesi tercatat, {emptyNotes} sesi belum memiliki catatan tertulis — artinya belum diisi pengajar, bukan berarti siswa pasif.',
    guardrailAllNotes:
      'Seluruh {total} sesi tercatat menampilkan catatan asli pengajar langsung dari Student Tower tanpa pemrosesan AI.'
  },
  stage3OverallTemplates: {
    mismatchNote:
      'Terdeteksi ketimpangan fokus drill soal: drill soal terbanyak ada di {topName} ({topQ} soal), sedangkan {lowNames} baru ≤ {lowQ} soal.',
    tasks:
      'Sampaikan target drill soal {siswa}: {drillWeekly} soal benar per minggu, dibagi ke {weakCount} subtes yang masih di bawah {target}.\n' +
      'Dengarkan {siswa} soal cara ia memilih subtes saat drill dan membahas soal yang dijawab salah.\n' +
      'Sepakati 1–2 topik dengan akurasi terendah yang diprioritaskan di latihan berikutnya.',
    tasksAchieved:
      'Sampaikan semua subtes {siswa} sudah mencapai {target}. Apresiasi konsistensinya.\n' +
      'Dengarkan {siswa} soal cara ia menjaga ritme drill soal selama ini.\n' +
      'Sepakati target berikutnya agar nilai tetap di atas {target}.',
    taskNoDrill:
      'Tanyakan ke {siswa} apakah ada drill soal di luar aplikasi atau kendala membuka drill soal di {noDrillNames}.',
    taskMismatch:
      'Sampaikan drill soal {siswa} paling banyak di {topName} ({topQ} soal), sedangkan {lowNames} baru {lowQ} soal atau kurang. Sepakati sebagian drill dialihkan ke subtes tersebut.',
    rambuNoDrill:
      'Menyimpulkan {siswa} malas karena data drill tercatat 0; data kosong hanya berarti belum tercatat di aplikasi.',
    rambuMismatch:
      'Menegur {siswa} karena drill menumpuk di satu subtes; apresiasi konsistensinya dulu, lalu arahkan ke subtes dengan nilai terendah.',
    guardrail:
      '1 sesi dapat tercatat meskipun kurang dari 10 soal. Selalu baca jumlah sesi bersama total butir soal & akurasinya, dan jangan memarahi siswa saat data aplikasi bernilai 0.'
  },
  actionPlanTemplates: {
    plan1Title: 'Latihan mingguan',
    plan1Desc: 'Minimal {drillWeekly} soal benar per minggu di aplikasi Ruangguru: {drillTiers}.',
    plan1DescAchieved: 'Pertahankan konsistensi latihan mingguan di aplikasi Ruangguru.',
    plan1Pic: '{student} (dipantau bersama {sa})',
    plan3Title: 'Target Tryout {nextEpisode}',
    plan3Desc: 'Semua subtes minimal {target}.',
    plan3ProgramSuffix: ' Nilai jurusan:',
    plan3DescAchieved: 'Pertahankan semua subtes di atas {target}.',
    plan3Pic: 'Siswa & Tim Akademik Cabang',
    planBTitle: 'Plan B',
    planBDesc: 'Siapkan jurusan cadangan bersama Kakak Asuh bila target belum tercapai pada konsultasi berikutnya.',
    planBPic: '{sa} & Siswa',
    plan4Title: 'Dukungan Orang Tua',
    plan4Desc: 'Dampingi proses belajar {siswa}',
    plan4Daily:
      'Berikan dukungan kepada {siswa} agar terbiasa belajar secara mandiri di rumah dan tetap memiliki waktu istirahat yang cukup.',
    plan4Weekly:
      'Luangkan waktu untuk mengevaluasi progres belajar {siswa} melalui aplikasi Ruangguru. Dukung {siswa} dalam mencapai target {drillWeekly} soal benar setiap minggu, sesuai pembagian target masing-masing subtes.',
    plan4WeeklyAchieved:
      'Luangkan waktu untuk mengevaluasi progres belajar {siswa} melalui aplikasi Ruangguru. Dukung {siswa} agar tetap konsisten berlatih setiap minggu.',
    plan4Fallback:
      'Ajak {siswa} berdiskusi mengenai kesulitan yang dialami, berikan motivasi, dan komunikasikan perkembangannya kepada Kakak Asuh.',
    plan4Pic: '{parent}',
    checklist:
      'Ringkasan keputusan dan pengingat sesi berikutnya sudah ditulis di Catatan Kakak Asuh.\n' +
      'Buka tombol Download PDF di bar atas untuk diserahkan ke keluarga.'
  },
  notesGuidanceTemplates: {
    placeholder: 'Tulis catatan untuk sesi berikutnya.',
    points: 'Kapan sesi berikutnya dicek?',
    fallbackLine: 'Apa yang disepakati hari ini dan siapa mengerjakan apa?',
    reminder: 'Tulis kutipan, bukan penilaian.',
    conflictLine: 'Pilihan prodi dan lokasi: apa yang disepakati dengan {student} dan orang tua?',
    missingDrillLine: 'Drill di {subtests} masih minim: berapa target latihannya?',
    lowAttendanceLine: 'Kehadiran kelas {pct}%: apa kendala yang disebut {student}?',
    allAchievedLine: 'Semua subtes prioritas sudah melampaui target: bagaimana {student} menjaga konsistensinya?',
    lockNudge:
      'Catatan masih singkat. Sudah memuat apa yang disepakati, siapa mengerjakan apa, dan kapan dicek? Tetap kunci?'
  },
  guideCardTemplates: {
    t1Title: 'Hasil tryout',
    t1Goal: 'Pada tahap ini, Kakak Asuh perlu membahas hasil tryout {siswa} bersama siswa dan orang tua, lalu menyepakati tindak lanjutnya.',
    t1Rambu: 'Menyimpulkan penyebab naik atau turunnya nilai sebelum {siswa} bercerita soal pengalaman mengerjakan tryout.',
    t1MedianContext:
      'Median (contoh {subtest} `{history}` = **{median}**) berasal dari **riwayat pribadi siswa** untuk melihat skor tipikal saat hasil berfluktuasi, bukan ranking nasional.',
    t2Title: 'Pilihan jurusan',
    t2Goal: 'Pada tahap ini, Kakak Asuh perlu memastikan pilihan jurusan {siswa} sudah sejalan dengan keluarga dan target TO berikutnya sudah jelas.',
    t2Rambu: 'Mematahkan semangat {siswa} di Pilihan 1 saat membahas jurusan cadangan.',
    t3Title: 'Drill soal dan topik prioritas',
    t3Goal: 'Pada tahap ini, Kakak Asuh perlu menyepakati bersama {siswa} target drill soal mingguan dan topik yang diprioritaskan.',
    t3Rambu:
      '**Hindari drill semu:** Apresiasi konsistensi di subtes yang sudah aktif, lalu ajak mengalihkan porsi drill soal ke subtes dengan gap terbesar.\n' +
      '**Jangan menyimpulkan "malas" dari angka 0:** Data kosong hanya berarti belum tercatat di aplikasi—gali dulu kendala atau drill soal mandiri di luar sistem.',
    t3Base600Note:
      '**Mengapa semua subtes ditargetkan {target} lebih dulu?** Satu subtes yang rendah menurunkan nilai akhir di jurusan mana pun. Di Semester 1 semua subtes dikejar ke **{target}**; pembobotan jurusan hanya menjadi label subtes prioritas per jurusan, bukan target belajar yang berbeda.',
    t4Title: 'Kelas dan catatan pengajar',
    t4Goal: 'Pada tahap ini, Kakak Asuh perlu memastikan {siswa} bisa mengikuti kelas dengan baik dan membahas catatan pengajar bersama siswa.',
    t4Rambu:
      'Menyimpulkan {siswa} pasif di kelas hanya karena catatan pengajar sedikit; catatan kosong berarti belum diisi pengajar.',
    t5Title: 'Rencana belajar dan penutup',
    t5Goal: 'Pada tahap ini, Kakak Asuh perlu menyepakati rencana belajar {siswa} sampai tryout berikutnya, lalu menyimpan catatan dan menyerahkan PDF laporan.',
    t5Continuity:
      'Catatan di formulir atas berfungsi sebagai **pengingat untuk pertemuan selanjutnya** agar evaluasi progres di {nextTo} tidak mengulang pembicaraan dari awal.'
  }
};

export interface SubtestPatternInfo {
  pattern: TryoutPattern;
  label: string;
  tone: 'up' | 'down' | 'neutral';
  color: string;
  bg: string;
  border: string;
}

export interface Stage1Input {
  toScores: number[];
  subtestRows: { id: string; name: string; scores: number[]; toLatest: number }[];
  attendanceRatePct: number;
  tolerance?: number;
  /** Nama depan siswa (placeholder {siswa}) */
  studentFirstName?: string;
}

export interface Stage1Output {
  pattern: TryoutPattern;
  patternLabel: string;
  observation: string;
  studentTask: string;
  parentTask: string;
  nextStep: string;
  /** true bila pola nilai menurun (memunculkan baris "Hindari" di kartu Tahap 2) */
  isDecline: boolean;
  extraNotes: string[];
  subtestPatterns: Record<string, SubtestPatternInfo>;
  traces: RuleTrace[];
}

export function classifyScorePattern(scores: number[], tolerance: number): {
  pattern: TryoutPattern;
  values: number[];
  changes: number[];
  net: number;
  latestDelta: number | null;
} {
  const values = scores.filter((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0);
  const n = values.length;
  const sign = (delta: number) => (delta > tolerance ? 1 : delta < -tolerance ? -1 : 0);
  const changes = values.slice(1).map((v, i) => v - values[i]);
  const signs = changes.map(sign);
  const nonzero = signs.filter((s) => s !== 0);
  const net = n > 1 ? values[n - 1] - values[0] : 0;
  const latestDelta = changes.length ? changes[changes.length - 1] : null;

  let pattern: TryoutPattern = 'no_data';
  if (!n) pattern = 'no_data';
  else if (n === 1) pattern = 'one_result';
  else if (n === 2) pattern = sign(net) > 0 ? 'initial_up' : sign(net) < 0 ? 'initial_down' : 'initial_flat';
  else if (!nonzero.length) pattern = 'steady_flat';
  else if (nonzero.every((s) => s > 0)) pattern = signs.includes(0) ? 'up_with_pauses' : 'steady_up';
  else if (nonzero.every((s) => s < 0)) pattern = signs.includes(0) ? 'down_with_pauses' : 'steady_down';
  else if (signs[signs.length - 1] !== 0 && nonzero[nonzero.length - 1] !== nonzero[nonzero.length - 2]) {
    pattern = nonzero[nonzero.length - 1] > 0 ? 'recovery' : 'reversal_down';
  } else {
    pattern = sign(net) > 0 ? 'fluctuating_up' : sign(net) < 0 ? 'fluctuating_down' : 'fluctuating_flat';
  }

  return { pattern, values, changes, net, latestDelta };
}

export function classifySubtestPattern(
  scores: number[],
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): SubtestPatternInfo {
  const { pattern } = classifyScorePattern(scores, config.thresholds.toTolerancePts);
  const label = config.patternTemplates[pattern]?.label || pattern;

  if (
    pattern === 'steady_up' ||
    pattern === 'up_with_pauses' ||
    pattern === 'initial_up' ||
    pattern === 'recovery' ||
    pattern === 'fluctuating_up'
  ) {
    return {
      pattern,
      label,
      tone: 'up',
      color: '#027a48',
      bg: '#ecfdf3',
      border: '#a6f4c5'
    };
  }

  if (
    pattern === 'steady_down' ||
    pattern === 'down_with_pauses' ||
    pattern === 'initial_down' ||
    pattern === 'reversal_down' ||
    pattern === 'fluctuating_down'
  ) {
    return {
      pattern,
      label,
      tone: 'down',
      color: '#b42318',
      bg: '#fef3f2',
      border: '#fecdca'
    };
  }

  return {
    pattern,
    label,
    tone: 'neutral',
    color: '#b54708',
    bg: '#fffaeb',
    border: '#fedf89'
  };
}

export function analyzeStage1(
  input: Stage1Input,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): Stage1Output {
  const th = config.thresholds;
  const tolerance = input.tolerance ?? th.toTolerancePts;
  const { pattern, values, changes, net, latestDelta } = classifyScorePattern(input.toScores, tolerance);
  const n = values.length;

  const a = n ? values[0] : 0;
  const b = n ? values[n - 1] : 0;
  const netPhrase =
    n > 1 ? `${net < 0 ? 'turun' : net > 0 ? 'naik' : 'selisih'} ${Math.abs(net)} poin` : '';

  const tpl = config.patternTemplates[pattern];
  const s1 = config.stage1Templates;
  const siswa = input.studentFirstName?.trim() || 'siswa';
  const fillS1 = (t: string, vars: Record<string, string | number>) => fillTemplate(t, { siswa, ...vars });

  let observation = fillS1(tpl.observation, { a, b, selisih: netPhrase, jumlah: changes.length });
  if (n >= 3 && latestDelta !== null) {
    observation += fillS1(s1.latestDeltaSuffix, { delta: `${latestDelta > 0 ? '+' : ''}${latestDelta}` });
  }

  const extraNotes: string[] = [];
  // Urutan prioritas catatan tambahan: kehadiran, fondasi, lalu fluktuasi (kartu menampilkan dua teratas).
  const attendanceWarn = input.attendanceRatePct < th.attendanceWarnPct;
  if (attendanceWarn) {
    extraNotes.push(fillS1(s1.attendance, { pct: input.attendanceRatePct, warn: th.attendanceWarnPct }));
  }
  const aboveCount = input.subtestRows.filter((s) => s.toLatest >= th.foundationScoreTarget).length;
  const totalSub = input.subtestRows.length;
  const allBelow500 = totalSub > 0 && input.subtestRows.every((s) => s.toLatest < 500);
  const foundationVars = { target: th.foundationScoreTarget, above: aboveCount, total: totalSub };

  if (allBelow500) {
    extraNotes.push(fillS1(s1.foundationAllBelow500, foundationVars));
  } else if (totalSub > 0 && aboveCount === totalSub) {
    extraNotes.push(fillS1(s1.foundationAllAbove, foundationVars));
  } else if (totalSub > 0 && aboveCount > 0) {
    extraNotes.push(fillS1(s1.foundationPartial, foundationVars));
  } else if (totalSub > 0) {
    extraNotes.push(fillS1(s1.foundationNone, foundationVars));
  }

  const extremeSubtests = input.subtestRows.filter(
    (s) => s.scores.length >= 2 && Math.max(...s.scores) - Math.min(...s.scores) >= th.subtestSwingPts
  );
  if (extremeSubtests.length > 0) {
    extraNotes.push(
      fillS1(s1.swing, {
        swing: th.subtestSwingPts,
        names: extremeSubtests.map((s) => s.name).slice(0, 2).join(', ')
      })
    );
  }

  const traces: RuleTrace[] = [
    {
      ruleId: 's1_pattern',
      ruleName: 'Klasifikasi Pola Skor TO',
      expression:
        n < 2
          ? `jumlah TO = ${n}, toleransi ±${tolerance} poin`
          : `delta antar-TO = [${changes.map((c) => (c > 0 ? `+${c}` : c)).join(', ')}] (toleransi ±${tolerance})`,
      matched: true,
      effect: `Memilih template pola "${tpl.label}" (${pattern})`
    },
    {
      ruleId: 's1_foundation',
      ruleName: `Capaian Fondasi ≥ ${th.foundationScoreTarget}`,
      expression: `subtes ≥ ${th.foundationScoreTarget} = ${aboveCount} dari ${totalSub}${allBelow500 ? ' (semua < 500)' : ''}`,
      matched: totalSub > 0,
      effect: allBelow500
        ? 'Tahap fondasi awal (semua < 500) → target bertahap'
        : aboveCount === totalSub && totalSub > 0
        ? 'Semua subtes di atas target → fokus bobot prodi'
        : aboveCount > 0
        ? `Apresiasi ${aboveCount} subtes kuat sebelum bahas gap`
        : 'Mulai dengan penguatan bertahap dari gap terdekat'
    },
    {
      ruleId: 's1_swing',
      ruleName: `Deteksi Fluktuasi Subtes ≥ ${th.subtestSwingPts}`,
      expression: `max(skor) - min(skor) ≥ ${th.subtestSwingPts} (${extremeSubtests.length} subtes)`,
      matched: extremeSubtests.length > 0,
      effect:
        extremeSubtests.length > 0
          ? `Munculkan catatan baca Median (${extremeSubtests.map((s) => s.name).slice(0, 2).join(', ')})`
          : 'Tidak ada ayunan ekstrem antar-TO'
    },
    {
      ruleId: 's1_attendance',
      ruleName: `Ambang Kehadiran < ${th.attendanceWarnPct}%`,
      expression: `kehadiran (${input.attendanceRatePct}%) < ${th.attendanceWarnPct}%`,
      matched: attendanceWarn,
      effect: attendanceWarn
        ? 'Tambah tugas konfirmasi kendala jadwal/kehadiran sebelum target baru'
        : 'Tidak memicu peringatan absensi'
    }
  ];

  const subtestPatterns: Record<string, SubtestPatternInfo> = {};
  for (const row of input.subtestRows) {
    subtestPatterns[row.id] = classifySubtestPattern(row.scores, {
      ...config,
      thresholds: { ...config.thresholds, toTolerancePts: tolerance }
    });
  }

  return {
    pattern,
    patternLabel: tpl.label,
    observation,
    studentTask: fillS1(tpl.student, {}),
    parentTask: fillS1(tpl.parent, {}),
    nextStep: fillS1(tpl.nextStep, {}),
    isDecline: ['steady_down', 'initial_down', 'down_with_pauses', 'reversal_down', 'fluctuating_down'].includes(pattern),
    extraNotes,
    subtestPatterns,
    traces
  };
}

export interface ProgramPacingResult {
  isAchieved: boolean;
  /** Kenaikan bertahap per TO jika dibagi total sisa episode hingga akhir TO/UTBK */
  gainPerToUtbk: number;
  /** Kenaikan per TO untuk melewati Target Acuan pada konsultasi berikutnya */
  gainPerToNextConsult: number;
  /** Target skor terbobot langsung untuk TO berikutnya (skor sekarang + kenaikan/TO) */
  nextToTargetScore: number;
  /** Target skor terbobot pada konsultasi berikutnya */
  nextConsultMilestoneScore: number;
  /** True jika laju per TO menuju konsultasi berikutnya melebihi batas realistis */
  needsPlanB: boolean;
}

/**
 * Menghitung target kenaikan per TO untuk melewati Target Acuan pada konsultasi berikutnya
 * serta sinyal awal pertimbangan Plan B jika kenaikan per TO terasa terlalu berat.
 */
export function computeProgramPacing(
  weightedScore: number,
  targetScore: number,
  gap: number,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): ProgramPacingResult {
  const th = config.thresholds;
  const nextEpisodes = Math.max(1, th.remainingEpisodesToNextConsult || 3);
  const totalEpisodes = Math.max(nextEpisodes, th.remainingEpisodesToUtbk || 6);

  if (gap >= 0) {
    return {
      isAchieved: true,
      gainPerToUtbk: 0,
      gainPerToNextConsult: 0,
      nextToTargetScore: Math.max(weightedScore, targetScore),
      nextConsultMilestoneScore: Math.max(weightedScore, targetScore),
      needsPlanB: false
    };
  }

  const absGap = Math.abs(gap);
  const gainPerToUtbk = Math.ceil(absGap / totalEpisodes);
  const gainPerToNextConsult = Math.ceil(absGap / nextEpisodes);
  const nextToTargetScore = Math.min(targetScore, weightedScore + gainPerToNextConsult);
  const nextConsultMilestoneScore = targetScore;
  const needsPlanB = gainPerToNextConsult > th.planBGainThresholdPts;

  return {
    isAchieved: false,
    gainPerToUtbk,
    gainPerToNextConsult,
    nextToTargetScore,
    nextConsultMilestoneScore,
    needsPlanB
  };
}

export interface Stage2ProgramItem {
  priority: string;
  prodi: string;
  univ: string;
  rumpun?: 'saintek' | 'soshum' | 'campuran';
  city?: string;
  isOutOfTown?: boolean;
  gap?: number;
  participantsCount?: number;
}

export interface Stage2Input {
  programs?: Stage2ProgramItem[];
  familyAlignment: 'aligned' | 'different_major' | 'location_limit' | 'unconfirmed';
  studentHomeCity?: string;
  /** Nama depan siswa untuk kalimat panduan (placeholder {siswa}) */
  studentFirstName?: string;
  // Fallbacks if programs array is omitted
  hasMixedRumpun?: boolean;
  minGapToTarget?: number;
  maxGapToTarget?: number;
  minParticipantsCount?: number;
}

export interface Stage2Output {
  conditionLabel: string;
  /** true when program rumpun are mixed or the family chose a different major */
  isConflict: boolean;
  /** true bila selisih nilai ke target masih lebar (memunculkan baris "Hindari" di kartu Tahap 1) */
  isWideGap: boolean;
  observation: string;
  saTasks: string[];
  guardrailNote: string;
  traces: RuleTrace[];
}

export function analyzeStage2(
  input: Stage2Input,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): Stage2Output {
  const th = config.thresholds;
  const tpl = config.stage2Templates;
  const siswa = input.studentFirstName?.trim() || 'siswa';
  // {far} = selisih terjauh ke target (positif); dipakai pada kalimat selisih lebar.
  const fillS = (t: string) => fillTemplate(t, { siswa, far: minGap !== null ? Math.abs(minGap) : 0 });
  const saTasks: string[] = [];
  const flags: string[] = [];
  const traces: RuleTrace[] = [];

  // Dynamic generic calculation from programs if present
  let hasMixed = input.hasMixedRumpun ?? false;
  let hasOutOfTown = false;
  // null = unknown. Unknown values must not be read as "target reached" (gap 0) or as "enough participants".
  let minGap: number | null = input.minGapToTarget ?? null;
  let maxGap: number | null = input.maxGapToTarget ?? null;
  let minParticipants: number | null = input.minParticipantsCount ?? null;

  if (input.programs && input.programs.length > 0) {
    const rumpuns = input.programs.map((p) => p.rumpun).filter(Boolean);
    const distinctRumpuns = Array.from(new Set(rumpuns));
    hasMixed = distinctRumpuns.length > 1;

    hasOutOfTown = input.programs.some(
      (p) =>
        p.isOutOfTown ||
        (input.studentHomeCity && p.city && p.city.toLowerCase() !== input.studentHomeCity.toLowerCase())
    );

    const gaps = input.programs
      .map((p) => p.gap)
      .filter((g): g is number => typeof g === 'number' && Number.isFinite(g));
    if (gaps.length > 0) {
      minGap = Math.min(...gaps);
      maxGap = Math.max(...gaps);
    }

    const counts = input.programs
      .map((p) => p.participantsCount)
      .filter((c): c is number => typeof c === 'number' && Number.isFinite(c));
    if (counts.length > 0) minParticipants = Math.min(...counts);
  }

  const isConflict = hasMixed || input.familyAlignment === 'different_major';
  if (isConflict) {
    flags.push('Rumpun Campuran / Perbedaan Pilihan');
    saTasks.push(fillS(tpl.mixedOrDifferent));
  } else if (input.familyAlignment === 'aligned') {
    flags.push('Pilihan Selaras');
    saTasks.push(fillS(tpl.aligned));
  } else {
    flags.push('Perlu Konfirmasi Keluarga');
    saTasks.push(fillS(tpl.unconfirmed));
  }

  traces.push({
    ruleId: 's2_alignment',
    ruleName: 'Keselarasan Pilihan & Rumpun',
    expression: `mixedRumpun=${hasMixed}, status="${input.familyAlignment}"`,
    matched: true,
    effect: isConflict
      ? 'Pakai panduan konflik/perbedaan rumpun'
      : input.familyAlignment === 'aligned'
      ? 'Pakai panduan konfirmasi prioritas selaras'
      : 'Pakai panduan konfirmasi kesepakatan keluarga'
  });

  const needsLocation = input.familyAlignment === 'location_limit' || hasOutOfTown || hasMixed;
  if (needsLocation) {
    saTasks.push(fillS(tpl.locationCheck));
  }
  traces.push({
    ruleId: 's2_location',
    ruleName: 'Pengecekan Izin Lokasi Kuliah',
    expression: `outOfTown=${hasOutOfTown} || status="${input.familyAlignment}"`,
    matched: needsLocation,
    effect: needsLocation ? 'Tambahkan tugas konfirmasi izin lokasi/merantau' : 'Tidak perlu tugas khusus lokasi'
  });

  const gapKnown = minGap !== null;
  const isWideGap = gapKnown && (minGap as number) <= th.wideWeightedGapPts;
  if (!gapKnown) {
    // no gap data: make no claim about the target
  } else if (isWideGap) {
    flags.push('Gap Masih Lebar');
    saTasks.push(fillS(tpl.wideGap));
  } else if ((minGap as number) < 0) {
    saTasks.push(fillS(tpl.remainingGap));
  } else {
    flags.push('Melampaui Target Acuan');
    saTasks.push(fillS(tpl.exceedTarget));
  }
  traces.push({
    ruleId: 's2_gap',
    ruleName: `Band Gap Skor Terbobot (Batas ≤ ${th.wideWeightedGapPts})`,
    expression: gapKnown
      ? `minGap (${minGap}) vs batas (${th.wideWeightedGapPts})`
      : 'minGap tidak tersedia (data gap kosong)',
    matched: gapKnown,
    effect: !gapKnown
      ? 'Data gap tidak tersedia → tidak ada klaim terhadap target'
      : isWideGap
      ? 'Gap lebar → fokus bangun komitmen tanpa memaksa turun prodi di CP1'
      : (minGap as number) < 0
      ? 'Gap moderat → bandingkan progres subtes bobot utama'
      : 'Sudah melampaui target → tawarkan eksplorasi Simulasi jika minat'
  });

  const lowSample = minParticipants !== null && minParticipants < th.minBenchmarkParticipants;
  const guardrailNote = lowSample
    ? tpl.lowParticipantsWarning
        .split('{count}')
        .join(String(minParticipants))
        .split('{limit}')
        .join(String(th.minBenchmarkParticipants))
    : tpl.defaultBenchmarkNote;

  traces.push({
    ruleId: 's2_sample',
    ruleName: `Kecukupan Pembanding (< ${th.minBenchmarkParticipants})`,
    expression:
      minParticipants === null
        ? 'minParticipants tidak tersedia'
        : `minParticipants (${minParticipants}) < ${th.minBenchmarkParticipants}`,
    matched: lowSample,
    effect: lowSample
      ? 'Aktifkan peringatan jumlah pembanding terlalu kecil'
      : 'Pakai catatan standar acuan internal non-SNPMB'
  });

  return {
    conditionLabel: flags.join(' · '),
    isConflict,
    isWideGap,
    observation:
      minGap === null || maxGap === null
        ? tpl.observationUnknown
        : minGap >= 0
        ? fillTemplate(tpl.observationAhead, { siswa })
        : maxGap >= 0
        ? fillTemplate(tpl.observationMixed, { far: Math.abs(minGap) })
        : fillTemplate(tpl.observationRange, { siswa, far: Math.abs(minGap), near: Math.abs(maxGap) }),
    saTasks,
    guardrailNote,
    traces
  };
}

export interface Stage3SubtestInput {
  id: string;
  name: string;
  toLatest: number;
  gapTo600: number;
  drillQuestions: number;
  drillSessions: number;
  drillAccuracyPct: number;
}

export interface Stage3SubtestOutput {
  conditionId: Stage3ConditionId;
  conditionLabel: string;
  observation: string;
  saTask: string;
  traces: RuleTrace[];
}

export function analyzeStage3Subtest(
  sub: Stage3SubtestInput,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): Stage3SubtestOutput {
  const th = config.thresholds;
  const tpl = config.stage3SubtestTemplates;

  const isMastered = sub.gapTo600 >= 0;
  const isNoDrill = !isMastered && sub.drillQuestions === 0;
  const isLowVolLowAcc = !isMastered && !isNoDrill && sub.drillQuestions < th.drillLowQuestions && sub.drillAccuracyPct < th.drillLowAccuracyPct;
  const isHighAccLowTo = !isMastered && !isNoDrill && !isLowVolLowAcc && sub.drillQuestions >= th.drillHighAccQuestions && sub.drillAccuracyPct >= th.drillHighAccuracyPct && sub.gapTo600 <= th.drillHighAccGapPts;
  const isActiveLowTo = !isMastered && !isNoDrill && !isLowVolLowAcc && !isHighAccLowTo && sub.drillQuestions >= th.drillLowQuestions && sub.gapTo600 <= th.drillActiveHighGap;
  const isNearTarget = !isMastered && !isNoDrill && !isLowVolLowAcc && !isHighAccLowTo && !isActiveLowTo && sub.gapTo600 >= th.nearTargetGapPts;

  let conditionId: Stage3ConditionId = 'general_gap';
  if (isMastered) conditionId = 'mastered_above';
  else if (isNoDrill) conditionId = 'no_drill';
  else if (isLowVolLowAcc) conditionId = 'low_vol_low_acc';
  else if (isHighAccLowTo) conditionId = 'high_acc_low_to';
  else if (isActiveLowTo) conditionId = 'active_drill_low_to';
  else if (isNearTarget) conditionId = 'near_target';

  const traces: RuleTrace[] = [
    {
      ruleId: 's3_r0_mastered',
      ruleName: '0. Skor Telah Mencapai Target 600+',
      expression: `gapTo600 (${sub.gapTo600}) ≥ 0`,
      matched: isMastered,
      effect: isMastered ? 'Terpilih: mode pemeliharaan skor & fokus ke subtes lain' : 'Lanjut cek aturan berikutnya'
    },
    {
      ruleId: 's3_r1_nodrill',
      ruleName: '1. Belum Ada Drill',
      expression: `drillQuestions (${sub.drillQuestions}) === 0`,
      matched: isNoDrill,
      effect: isNoDrill ? 'Terpilih: konfirmasi sumber luar tanpa label malas' : 'Lanjut cek aturan berikutnya'
    },
    {
      ruleId: 's3_r2_lowvol',
      ruleName: '2. Volume & Akurasi Rendah',
      expression: `questions (${sub.drillQuestions}) < ${th.drillLowQuestions} && akurasi (${sub.drillAccuracyPct}%) < ${th.drillLowAccuracyPct}%`,
      matched: isLowVolLowAcc,
      effect: isLowVolLowAcc ? 'Terpilih: tinjau topik terendah & rencana penguatan konsep' : 'Lanjut cek aturan berikutnya'
    },
    {
      ruleId: 's3_r2b_highacc_lowto',
      ruleName: '3. Akurasi Drill Tinggi Tapi Skor TO Masih Jauh',
      expression: `questions (${sub.drillQuestions}) ≥ ${th.drillHighAccQuestions} && akurasi (${sub.drillAccuracyPct}%) ≥ ${th.drillHighAccuracyPct}% && gap (${sub.gapTo600}) ≤ ${th.drillHighAccGapPts}`,
      matched: isHighAccLowTo,
      effect: isHighAccLowTo ? 'Terpilih: cek simulasi waktu & jebakan ujian' : 'Lanjut cek aturan berikutnya'
    },
    {
      ruleId: 's3_r3_active_gap',
      ruleName: '4. Drill Soal Aktif Tapi Gap TO Lebar',
      expression: `questions (${sub.drillQuestions}) ≥ ${th.drillLowQuestions} && gap (${sub.gapTo600}) ≤ ${th.drillActiveHighGap}`,
      matched: isActiveLowTo,
      effect: isActiveLowTo ? 'Terpilih: evaluasi cara mengerjakan drill soal vs TO' : 'Lanjut cek aturan berikutnya'
    },
    {
      ruleId: 's3_r4_near',
      ruleName: '5. Mendekati Batas Target',
      expression: `gap (${sub.gapTo600}) ≥ ${th.nearTargetGapPts}`,
      matched: isNearTarget,
      effect: isNearTarget ? 'Terpilih: jaga ritme drill soal stabilkan ≥ 600' : 'Fallback ke Penguatan Terarah'
    }
  ];

  const observation = fillTemplate(tpl[conditionId]?.observation ?? '', {
    toLatest: sub.toLatest,
    gap: sub.gapTo600,
    questions: sub.drillQuestions,
    sessions: sub.drillSessions,
    accuracy: sub.drillAccuracyPct
  });

  return {
    conditionId,
    conditionLabel: tpl[conditionId]?.label || 'Penguatan Terarah',
    observation,
    saTask: tpl[conditionId]?.saTask || 'Bahas topik lemah serta kecocokan pola drill soal.',
    traces
  };
}

export interface Stage3OverallOutput {
  hasDrillMismatch: boolean;
  mismatchNote: string | null;
  saTasks: string[];
  /** Maksimal 3 poin untuk kartu panduan: temuan/target, dengarkan atau tanyakan, sepakati */
  guidePoints: string[];
  /** Hindari: hanya terisi bila ada subtes tanpa drill soal atau drill menumpuk */
  rambu: string | null;
  guardrailNote: string;
  traces: RuleTrace[];
}

export function analyzeStage3Overall(
  subtests: Stage3SubtestInput[],
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG,
  ctx: { studentFirstName?: string; weakCount?: number } = {}
): Stage3OverallOutput {
  const th = config.thresholds;
  const sortedByQuestions = [...subtests].sort((a, b) => b.drillQuestions - a.drillQuestions);
  const highestDrill = sortedByQuestions[0];
  const zeroOrLowInPriority = subtests.filter(
    (s) => s.gapTo600 <= th.drillActiveHighGap && s.drillQuestions <= th.drillMismatchLowQ
  );

  const hasMismatch = Boolean(
    highestDrill &&
      highestDrill.drillQuestions >= th.drillMismatchHighQ &&
      zeroOrLowInPriority.length > 0
  );

  const t3 = config.stage3OverallTemplates;
  const mismatchNote = hasMismatch
    ? fillTemplate(t3.mismatchNote, {
        topName: highestDrill.name,
        topQ: highestDrill.drillQuestions,
        lowNames: zeroOrLowInPriority.map((s) => s.name).join(' & '),
        lowQ: th.drillMismatchLowQ
      })
    : null;

  const saTasks = splitLines(t3.tasks);

  const weak = subtests.filter((x) => x.gapTo600 < 0);
  const noDrill = weak.filter((x) => x.drillQuestions === 0);
  // subtests hanya berisi subtes prioritas; jumlah subtes di bawah target seluruhnya bisa dikirim lewat ctx
  const weakTotal = ctx.weakCount ?? weak.length;
  const vars = {
    siswa: ctx.studentFirstName?.trim() || 'siswa',
    target: th.foundationScoreTarget,
    weakCount: weakTotal,
    drillWeekly: drillTotalForCount(weakTotal, th),
    noDrillNames: noDrill.slice(0, 2).map((x) => x.name).join(' dan '),
    topName: highestDrill?.name ?? '',
    topQ: highestDrill?.drillQuestions ?? 0,
    lowNames: zeroOrLowInPriority.map((x) => x.name).join(' dan '),
    lowQ: th.drillMismatchLowQ
  };
  const base = splitLines(weakTotal === 0 ? t3.tasksAchieved : t3.tasks).map((l) => fillTemplate(l, vars));
  let guidePoints = base.slice(0, 3);
  let rambu: string | null = null;
  if (weakTotal > 0 && guidePoints.length >= 3) {
    if (noDrill.length > 0) {
      guidePoints = [base[0], fillTemplate(t3.taskNoDrill, vars), base[2]];
      rambu = fillTemplate(t3.rambuNoDrill, vars);
    } else if (hasMismatch) {
      guidePoints = [base[0], fillTemplate(t3.taskMismatch, vars), base[2]];
      rambu = fillTemplate(t3.rambuMismatch, vars);
    }
  }

  const traces: RuleTrace[] = [
    {
      ruleId: 's3_mismatch',
      ruleName: 'Deteksi Ketimpangan / Drill Semu',
      expression: `maxDrill (${highestDrill?.drillQuestions ?? 0} ≥ ${th.drillMismatchHighQ}) && subtesGap≤${th.drillActiveHighGap}_drill≤${th.drillMismatchLowQ} (${zeroOrLowInPriority.length})`,
      matched: hasMismatch,
      effect: hasMismatch
        ? 'Munculkan alert ketimpangan drill soal agar fokus pindah ke subtes prioritas'
        : 'Tidak terdeteksi ketimpangan mencolok'
    }
  ];

  return {
    hasDrillMismatch: hasMismatch,
    mismatchNote,
    saTasks,
    guidePoints,
    rambu,
    guardrailNote: t3.guardrail,
    traces
  };
}

export interface ActionPlanItem {
  num: number;
  title: string;
  desc: string;
  pic: string;
  accentColor: string;
  /** Poin rinci di bawah deskripsi (rencana dukungan orang tua) */
  bullets?: { label: string; text: string }[];
}

export interface Stage4Input {
  hasConflictOrLocationCheck?: boolean;
  hasMissingDrill?: boolean;
  /** Data siswa untuk rencana aksi (dipakai dashboard dan PDF halaman 3) */
  planData?: {
    /** Seluruh subtes: nama, skor TO terakhir, selisih ke target fondasi */
    subtests: { name: string; to4: number; gap: number }[];
    branch: string;
    /** Skor rata-rata TO terakhir */
    avgScore: number;
    /** Nomor TO terakhir (episode) */
    episode: number;
    /** True bila belum ada pilihan jurusan yang mencapai target acuan (menampilkan butir Plan B) */
    needsPlanB?: boolean;
    /** Target TO berikutnya per jurusan: nama jurusan + kampus lengkap dan targetnya, misalnya "≥ 588" atau "Terlewati" */
    programTargetList?: { name: string; target: string }[];
  };
  studentName?: string;
  saName?: string;
  parentName?: string;
  /** Nama depan siswa untuk kalimat panduan */
  studentFirstName?: string;
  /** Nomor TO berikutnya; bawaan episode + 1 */
  nextEpisode?: number;
}

export interface Stage4Output {
  saTasks: string[];
  /** Maksimal 3 poin untuk kartu panduan Tahap 5: jadwal drill, dukungan orang tua atau catatan prioritas, penutup */
  guidePoints: string[];
  checklist: string[];
  actionPlans: ActionPlanItem[];
  traces: RuleTrace[];
}

export function analyzeStage4(
  inputOrConflict: boolean | Stage4Input,
  hasMissingDrillOrConfig?: boolean | EngineRuleConfig,
  maybeConfig?: EngineRuleConfig
): Stage4Output {
  let isConflict = false;
  let isMissingDrill = false;
  let cfg = DEFAULT_ENGINE_CONFIG;
  let studentInput: Stage4Input | undefined;

  if (typeof inputOrConflict === 'boolean') {
    isConflict = inputOrConflict;
    isMissingDrill = typeof hasMissingDrillOrConfig === 'boolean' ? hasMissingDrillOrConfig : false;
    cfg = maybeConfig || DEFAULT_ENGINE_CONFIG;
  } else {
    studentInput = inputOrConflict;
    isConflict = studentInput.hasConflictOrLocationCheck ?? false;
    isMissingDrill = studentInput.hasMissingDrill ?? false;
    cfg = (hasMissingDrillOrConfig as EngineRuleConfig) || DEFAULT_ENGINE_CONFIG;
  }

  const tpl = cfg.stage4Templates;
  const saTasksRaw = [tpl.scheduleTask, tpl.parentSupportTask];

  if (isMissingDrill) {
    saTasksRaw.push(tpl.missingDrillTask);
  }
  if (isConflict) {
    saTasksRaw.push(tpl.conflictOrLocationTask);
  }

  const ap = cfg.actionPlanTemplates;
  const checklist = splitLines(ap.checklist);

  // Rencana aksi: satu sumber untuk dashboard dan PDF halaman 3
  const th4 = cfg.thresholds;
  const pd = studentInput?.planData;
  const subs = pd?.subtests ?? [];
  const weakCount = subs.filter((x) => x.to4 < th4.foundationScoreTarget).length;
  const deepest = [...subs]
    .sort((x, y) => x.gap - y.gap || x.to4 - y.to4)
    .filter((x) => x.gap < 0)
    .slice(0, 2)
    .map((x) => `${x.name} (${x.gap})`);
  const drillPerSubtest = th4.minDrillPerSubtest;
  const drillWeekly = drillTotalForCount(weakCount, th4);
  const drillTiers = drillTiersText(th4);
  const allAchieved = subs.length > 0 && weakCount === 0;
  const episode = pd?.episode ?? 4;
  const planVars = {
    student: studentInput?.studentName || 'Siswa',
    sa: studentInput?.saName || 'Kakak Asuh',
    parent: studentInput?.parentName || 'Orang Tua / Wali Siswa',
    siswa: studentInput?.studentFirstName?.trim() || 'siswa',
    branch: pd?.branch ?? '',
    target: th4.foundationScoreTarget,
    weakCount,
    drillWeekly,
    drillPerSubtest,
    drillTiers,
    deepest: deepest.join('; '),
    nextEpisode: studentInput?.nextEpisode ?? episode + 1,
    episode,
    avgScore: pd?.avgScore ?? 0,
    programTargets: (pd?.programTargetList ?? []).map((x) => `${x.name} ${x.target}`).join('; ')
  };
  const fill = (t: string) => fillTemplate(t, planVars);
  // Tugas SA memakai angka drill dari konfigurasi; bila semua subtes sudah tercapai, pakai acuan bawaan agar tidak tertulis 0.
  const taskVars = {
    ...planVars,
    siswa: studentInput?.studentFirstName?.trim() || 'siswa',
    drillWeekly: weakCount > 0 ? drillWeekly : th4.weeklyDrillTotal,
    drillPerSubtest: weakCount > 0 ? drillPerSubtest : th4.minDrillPerSubtest
  };
  const saTasks = saTasksRaw.map((t) => fillTemplate(t, taskVars));
  const guidePoints = [
    fillTemplate(tpl.scheduleTask, taskVars),
    fillTemplate(isConflict ? tpl.conflictOrLocationTask : isMissingDrill ? tpl.missingDrillTask : tpl.parentSupportTask, taskVars),
    fillTemplate(tpl.closingTask, taskVars)
  ];

  const actionPlans: ActionPlanItem[] = [
    {
      num: 1,
      title: fill(ap.plan1Title),
      desc: fill(allAchieved ? ap.plan1DescAchieved : ap.plan1Desc),
      pic: fill(ap.plan1Pic),
      accentColor: '#2d7684'
    },
    {
      num: 3,
      title: fill(ap.plan3Title),
      desc: fill((allAchieved ? ap.plan3DescAchieved : ap.plan3Desc) + ((pd?.programTargetList?.length ?? 0) > 0 ? ap.plan3ProgramSuffix : '')),
      pic: fill(ap.plan3Pic),
      accentColor: '#b54708',
      bullets: (pd?.programTargetList ?? []).map((x) => ({ label: x.name, text: x.target }))
    },
    ...(pd?.needsPlanB
      ? [
          {
            num: 4,
            title: fill(ap.planBTitle),
            desc: fill(ap.planBDesc),
            pic: fill(ap.planBPic),
            accentColor: '#b42318'
          }
        ]
      : []),
    {
      num: 4,
      title: fill(ap.plan4Title),
      desc: fill(ap.plan4Desc),
      pic: fill(ap.plan4Pic),
      accentColor: '#027a48',
      bullets: [
        { label: 'Setiap hari', text: fill(ap.plan4Daily) },
        { label: 'Setiap akhir pekan', text: fill(weakCount > 0 ? ap.plan4Weekly : ap.plan4WeeklyAchieved) },
        { label: 'Jika target belum tercapai', text: fill(ap.plan4Fallback) }
      ]
    }
  ];

  actionPlans.forEach((p, i) => {
    p.num = i + 1;
  });

  const traces: RuleTrace[] = [
    {
      ruleId: 's4_drill',
      ruleName: 'Tindak Lanjut Drill Minim',
      expression: `isMissingDrill = ${isMissingDrill}`,
      matched: isMissingDrill,
      effect: isMissingDrill ? 'Tambahkan penguncian jadwal dan topik latihan subtes minim drill' : 'Tidak dipicu'
    },
    {
      ruleId: 's4_prodi',
      ruleName: 'Pencatatan Konflik Prodi / Lokasi',
      expression: `isConflict = ${isConflict}`,
      matched: isConflict,
      effect: isConflict ? 'Tambahkan tugas pencatatan status prodi/lokasi untuk review berikut' : 'Tidak dipicu'
    }
  ];

  return { saTasks, guidePoints, checklist, actionPlans, traces };
}

export interface StageClassroomInput {
  totalSessions: number;
  presentSessions: number;
  lateSessions: number;
  sickSessions: number;
  excusedSessions: number;
  notesCount: number;
  /** Nama depan siswa */
  studentFirstName?: string;
}

export interface StageClassroomOutput {
  saTasks: string[];
  /** Maksimal 3 poin untuk kartu panduan: kehadiran, sesi terlewat atau catatan, kesepakatan */
  guidePoints: string[];
  /** True bila catatan pengajar kosong atau sedikit (memicu baris Hindari) */
  hasLowNotes: boolean;
  guardrailNote: string;
  traces: RuleTrace[];
}

export function analyzeStageClassroom(
  input: StageClassroomInput,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): StageClassroomOutput {
  const th = config.thresholds;
  const total = Math.max(0, input.totalSessions);
  const attendancePct = total > 0 ? (input.presentSessions / total) * 100 : 0;
  const pctLabel = attendancePct.toFixed(1).replace('.', ',');
  const absentCount = input.sickSessions + input.excusedSessions;
  const notesRatioPct = total > 0 ? (input.notesCount / total) * 100 : 0;
  const notesPct = Math.round(notesRatioPct);
  const emptyNotesCount = Math.max(0, total - input.notesCount);

  const ct = config.classroomTemplates;
  const classVars = {
    siswa: input.studentFirstName?.trim() || 'siswa',
    pct: pctLabel,
    present: input.presentSessions,
    total,
    absent: absentCount,
    sick: input.sickSessions,
    excused: input.excusedSessions,
    notes: input.notesCount,
    notesPct,
    emptyNotes: emptyNotesCount
  };
  const fillC = (t: string) => fillTemplate(t, classVars);

  const saTasks: string[] = [];
  const noSessions = total === 0;
  const lowAttendance = !noSessions && attendancePct < th.attendanceWarnPct;

  if (noSessions) {
    saTasks.push(fillC(ct.noSessions));
  } else if (lowAttendance) {
    saTasks.push(fillC(ct.lowAttendance));
  } else {
    saTasks.push(fillC(ct.goodAttendance));
  }

  const hasRepeatedAbsence = absentCount >= th.absenceWarnSessions;
  if (hasRepeatedAbsence) {
    saTasks.push(fillC(ct.repeatedAbsence));
  }

  const lowNotesCoverage = input.notesCount === 0 || notesRatioPct < th.notesLowCoveragePct;
  if (input.notesCount === 0) {
    saTasks.push(fillC(ct.noNotes));
  } else if (notesRatioPct < th.notesLowCoveragePct) {
    saTasks.push(fillC(ct.lowNotes));
  }

  const guardrailNote = fillC(emptyNotesCount > 0 ? ct.guardrailMissingNotes : ct.guardrailAllNotes);

  const notesLine = input.notesCount === 0 ? ct.noNotes : lowNotesCoverage ? ct.lowNotes : ct.notesOk;
  const guidePoints = [saTasks[0], fillC(hasRepeatedAbsence ? ct.repeatedAbsence : notesLine), fillC(ct.agreeTask)];

  const traces: RuleTrace[] = [
    {
      ruleId: 's4c_attendance',
      ruleName: `Ambang Kehadiran Kelas (< ${th.attendanceWarnPct}%)`,
      expression: `hadir (${pctLabel}%) < ${th.attendanceWarnPct}%`,
      matched: lowAttendance,
      effect: lowAttendance
        ? 'Fokus gali kendala jadwal/kehadiran sebelum tambah target'
        : 'Apresiasi kehadiran & cocokkan catatan dengan mapel TO'
    },
    {
      ruleId: 's4c_absences',
      ruleName: `Tindak Lanjut Sesi Terlewat (Sakit + Izin ≥ ${th.absenceWarnSessions})`,
      expression: `sakit+izin (${absentCount}) ≥ ${th.absenceWarnSessions}`,
      matched: hasRepeatedAbsence,
      effect: hasRepeatedAbsence ? 'Ingatkan kejar materi via rekaman kelas' : 'Tidak dipicu'
    },
    {
      ruleId: 's4c_notes_coverage',
      ruleName: `Cakupan Catatan Pengajar (< ${th.notesLowCoveragePct}%)`,
      expression: `catatan (${notesPct}%) < ${th.notesLowCoveragePct}%`,
      matched: lowNotesCoverage,
      effect: lowNotesCoverage
        ? 'Tambahkan rambu agar catatan sedikit tidak ditafsirkan pasif'
        : 'Cakupan catatan cukup representatif'
    }
  ];

  return { saTasks, guidePoints, hasLowNotes: lowNotesCoverage, guardrailNote, traces };
}

export interface NotesGuidanceInput {
  hasConflictOrLocationCheck: boolean;
  /** Nama subtes prioritas dengan drill minim; kosong bila tidak ada */
  minDrillSubtests: string[];
  attendancePct: number;
  allAchieved: boolean;
  /** Nama depan siswa */
  studentName: string;
}

export interface NotesGuidanceOutput {
  placeholder: string;
  /** Daftar pertanyaan: baris sesuai kondisi siswa (maks 2), baris pengganti bila tidak ada, lalu butir tetap. */
  lines: string[];
  reminder: string;
  lockNudge: string;
}

/**
 * Arahan di bawah kotak Catatan Kakak Asuh: pertanyaan pendek yang menyebut data siswa itu.
 * Urutan prioritas baris sesuai kondisi: konflik, drill minim, kehadiran, semua tercapai (maks 2).
 */
export function analyzeNotesGuidance(
  input: NotesGuidanceInput,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): NotesGuidanceOutput {
  const g = config.notesGuidanceTemplates;
  const th = config.thresholds;
  const vars = {
    student: input.studentName,
    subtests: input.minDrillSubtests.join(', '),
    pct: input.attendancePct.toFixed(1).replace('.', ',')
  };
  const conditional: string[] = [];
  if (input.hasConflictOrLocationCheck) conditional.push(fillTemplate(g.conflictLine, vars));
  if (input.minDrillSubtests.length > 0) conditional.push(fillTemplate(g.missingDrillLine, vars));
  if (input.attendancePct < th.attendanceWarnPct) conditional.push(fillTemplate(g.lowAttendanceLine, vars));
  if (input.allAchieved) conditional.push(fillTemplate(g.allAchievedLine, vars));
  const shown = conditional.slice(0, 2);
  const lines = [...(shown.length === 0 ? [g.fallbackLine] : shown), ...splitLines(g.points)];
  return { placeholder: g.placeholder, lines, reminder: g.reminder, lockNudge: g.lockNudge };
}

export interface GuideCardsInput {
  foundationTarget: number;
  /** Contoh median Tahap 2 (subtes dengan fluktuasi terbesar) */
  medianSubtest: string;
  medianHistory: string;
  median: number | string;
  /** Nama prodi Pilihan 1 */
  prodi: string;
  /** Nama depan siswa (placeholder {siswa}) */
  studentFirstName?: string;
  /** Nomor TO berikutnya */
  nextEpisode: number;
}

export interface GuideCardsOutput {
  t1: { title: string; goal: string; rambu: string[]; medianContext: string };
  t2: { title: string; goal: string; rambu: string[] };
  t3: { title: string; goal: string; rambu: string[]; base600Note: string };
  t4: { title: string; goal: string; rambu: string[] };
  t5: { title: string; goal: string; continuity: string };
}

/** Teks tetap kartu "Panduan Kakak Asuh" per tahap, dengan placeholder diisi dari data. */
export function analyzeGuideCards(
  input: GuideCardsInput,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): GuideCardsOutput {
  const g = config.guideCardTemplates;
  const vars = {
    target: input.foundationTarget,
    subtest: input.medianSubtest,
    history: input.medianHistory,
    median: input.median,
    prodi: input.prodi,
    siswa: input.studentFirstName?.trim() || 'siswa',
    nextTo: `TO ${input.nextEpisode}`
  };
  const f = (t: string) => fillTemplate(t, vars);
  const fl = (t: string) => splitLines(t).map(f);
  return {
    t1: { title: f(g.t1Title), goal: f(g.t1Goal), rambu: fl(g.t1Rambu), medianContext: f(g.t1MedianContext) },
    t2: { title: f(g.t2Title), goal: f(g.t2Goal), rambu: fl(g.t2Rambu) },
    t3: { title: f(g.t3Title), goal: f(g.t3Goal), rambu: fl(g.t3Rambu), base600Note: f(g.t3Base600Note) },
    t4: { title: f(g.t4Title), goal: f(g.t4Goal), rambu: fl(g.t4Rambu) },
    t5: { title: f(g.t5Title), goal: f(g.t5Goal), continuity: f(g.t5Continuity) }
  };
}

function escapeCsvCell(val: unknown): string {
  const s = String(val ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Mengekspor seluruh rule, ambang batas, dan template output /engine ke CSV (UTF-8 BOM)
 * agar siap dibuka di Google Sheets / Excel untuk review Tim Akademik.
 */
export function generateEngineCsv(config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG): string {
  const th = config.thresholds;
  const rows: string[][] = [
    [
      'Tahap',
      'Rule ID / Kode',
      'Nama Kondisi / Parameter',
      'Logika / Ambang Aktif',
      'Label Badge / Status',
      'Output Ke Siswa / Utama',
      'Output Ke Orang Tua / Tambahan',
      'Arah Tindak Lanjut / Guardrail'
    ]
  ];

  // 1. Thresholds
  const thresholdMeta: { key: keyof EngineThresholds; label: string; stage: string }[] = [
    { key: 'toTolerancePts', label: 'Toleransi TO Datar (±poin)', stage: 'Tahap 2' },
    { key: 'foundationScoreTarget', label: 'Target Fondasi Subtes Minimum', stage: 'Tahap 2 & 3' },
    { key: 'subtestSwingPts', label: 'Batas Fluktuasi Subtes Ekstrem (poin)', stage: 'Tahap 2' },
    { key: 'attendanceWarnPct', label: 'Ambang Peringatan Kehadiran TMB (%)', stage: 'Tahap 2 & 4' },
    { key: 'wideWeightedGapPts', label: 'Gap Terbobot Lebar (≤ poin)', stage: 'Tahap 1' },
    { key: 'remainingEpisodesToNextConsult', label: 'Sisa TO Menuju Konsultasi Berikutnya (Januari)', stage: 'Tahap 1' },
    { key: 'remainingEpisodesToUtbk', label: 'Total Sisa TO Menuju UTBK', stage: 'Tahap 1' },
    { key: 'planBGainThresholdPts', label: 'Ambang Kenaikan/TO Trigger Plan B (> poin/TO)', stage: 'Tahap 1' },
    { key: 'minBenchmarkParticipants', label: 'Min. Peserta Pembanding Internal', stage: 'Tahap 1' },
    { key: 'drillLowQuestions', label: 'Batas Drill Soal Minim (< soal)', stage: 'Tahap 3' },
    { key: 'drillLowAccuracyPct', label: 'Batas Akurasi Drill Rendah (< %)', stage: 'Tahap 3' },
    { key: 'drillActiveHighGap', label: 'Gap Subtes Prioritas Tinggi (≤ poin)', stage: 'Tahap 3' },
    { key: 'nearTargetGapPts', label: 'Batas Mendekati Target (≥ poin)', stage: 'Tahap 3' },
    { key: 'drillMismatchHighQ', label: 'Ketimpangan Drill: Subtes Aktif (≥ soal)', stage: 'Tahap 3' },
    { key: 'drillMismatchLowQ', label: 'Ketimpangan Drill: Prioritas Minim (≤ soal)', stage: 'Tahap 3' },
    { key: 'drillHighAccQuestions', label: 'Akurasi Drill Tinggi: Minimal Soal (≥)', stage: 'Tahap 3' },
    { key: 'drillHighAccuracyPct', label: 'Akurasi Drill Tinggi: Minimal Akurasi (≥ %)', stage: 'Tahap 3' },
    { key: 'drillHighAccGapPts', label: 'Akurasi Drill Tinggi: Selisih ke Target (≤ poin)', stage: 'Tahap 3' },
    { key: 'absenceWarnSessions', label: 'Pengingat Sesi Terlewat: Sakit + Izin (≥ sesi)', stage: 'Tahap 4' },
    { key: 'notesLowCoveragePct', label: 'Rambu Catatan Pengajar Sedikit: Cakupan (< %)', stage: 'Tahap 4' },
    { key: 'notesShortChars', label: 'Pengingat Catatan Kakak Asuh Singkat saat Kunci (< karakter)', stage: 'Tahap 5' },
    { key: 'weeklyDrillTotal', label: 'Rencana Aksi: Acuan Total Soal Benar per Minggu (bila semua subtes sudah tercapai)', stage: 'Tahap 5' },
    { key: 'drillRank1', label: 'Rencana Aksi: Soal Benar per Minggu, Subtes Nilai Terendah (urutan 1)', stage: 'Tahap 5' },
    { key: 'drillRank2', label: 'Rencana Aksi: Soal Benar per Minggu, Urutan 2', stage: 'Tahap 5' },
    { key: 'drillRank3', label: 'Rencana Aksi: Soal Benar per Minggu, Urutan 3', stage: 'Tahap 5' },
    { key: 'minDrillPerSubtest', label: 'Rencana Aksi: Soal Benar per Minggu, Subtes Lainnya (urutan 4 dst.)', stage: 'Tahap 5' }
  ];
  thresholdMeta.forEach((m) => {
    rows.push([
      `${m.stage} (Threshold)`,
      m.key,
      m.label,
      String(th[m.key]),
      '-',
      '-',
      '-',
      'Dapat diatur di /engine (Tab Kontrol)'
    ]);
  });

  // 2. Stage 1 - 15 Tryout Patterns
  const patternConditions: Record<TryoutPattern, string> = {
    no_data: 'Belum ada skor valid (0 TO)',
    one_result: 'Baru 1 skor TO tersedia',
    initial_up: `2 skor TO, kenaikan > +${th.toTolerancePts}`,
    initial_down: `2 skor TO, penurunan < -${th.toTolerancePts}`,
    initial_flat: `2 skor TO, selisih dalam ±${th.toTolerancePts}`,
    steady_up: `≥ 3 TO, seluruh transisi naik (> +${th.toTolerancePts})`,
    steady_down: `≥ 3 TO, seluruh transisi turun (< -${th.toTolerancePts})`,
    steady_flat: `≥ 3 TO, seluruh transisi datar (dalam ±${th.toTolerancePts})`,
    up_with_pauses: '≥ 3 TO, cenderung naik diselingi datar',
    down_with_pauses: '≥ 3 TO, cenderung turun diselingi datar',
    recovery: '≥ 3 TO, sempat turun lalu TO terakhir berbalik naik',
    reversal_down: '≥ 3 TO, sempat naik lalu TO terakhir berbalik turun',
    fluctuating_up: '≥ 3 TO, naik-turun, TO akhir lebih tinggi dari awal',
    fluctuating_down: '≥ 3 TO, naik-turun, TO akhir lebih rendah dari awal',
    fluctuating_flat: '≥ 3 TO, naik-turun, TO akhir mendekati awal'
  };
  (Object.keys(config.patternTemplates) as TryoutPattern[]).forEach((pat) => {
    const t = config.patternTemplates[pat];
    rows.push([
      'Tahap 2 (Pola TO)',
      pat,
      t.label,
      patternConditions[pat],
      t.label,
      t.student,
      t.parent,
      t.nextStep
    ]);
  });

  // 3. Stage 2 Templates
  const stage2Meta: { key: keyof Stage2Templates; name: string; cond: string }[] = [
    { key: 'mixedOrDifferent', name: 'Rumpun Campuran / Konflik Pilihan', cond: 'distinctRumpuns > 1 || familyAlignment === different_major' },
    { key: 'aligned', name: 'Pilihan Selaras Keluarga', cond: 'familyAlignment === aligned && !mixedRumpun' },
    { key: 'unconfirmed', name: 'Belum Konfirmasi Keluarga', cond: 'familyAlignment === unconfirmed' },
    { key: 'locationCheck', name: 'Pengecekan Izin Lokasi Kuliah', cond: 'outOfTown || location_limit || mixedRumpun' },
    { key: 'wideGap', name: 'Gap Terbobot Masih Lebar (Trigger Plan B)', cond: `minGap ≤ ${th.wideWeightedGapPts} (sinyal Plan B dihitung terpisah: kenaikan/TO > ${th.planBGainThresholdPts})` },
    { key: 'remainingGap', name: 'Gap Terbobot Moderat (< 0)', cond: `${th.wideWeightedGapPts} < minGap < 0` },
    { key: 'exceedTarget', name: 'Skor Melampaui Target Acuan (≥ 0)', cond: 'minGap ≥ 0 (Siswa Achieve)' },
    { key: 'lowParticipantsWarning', name: 'Pembanding Peserta Terlalu Sedikit', cond: `minParticipants < ${th.minBenchmarkParticipants}` },
    { key: 'defaultBenchmarkNote', name: 'Guardrail Standar Target & Persaingan', cond: 'Selalu tampil sebagai konteks acuan non-SNPMB' },
    { key: 'observationRange', name: 'Kalimat Observasi Selisih (semua pilihan masih di bawah target)', cond: 'maxGap < 0. Placeholder: {siswa} {near} {far}' },
    { key: 'observationAhead', name: 'Kalimat Observasi Selisih (semua pilihan melewati target)', cond: 'minGap ≥ 0. Placeholder: {siswa}' },
    { key: 'observationMixed', name: 'Kalimat Observasi Selisih (sebagian melewati target)', cond: 'minGap < 0 ≤ maxGap. Placeholder: {far}' },
    { key: 'observationUnknown', name: 'Kalimat Observasi Selisih (data kosong)', cond: 'Data selisih tidak tersedia' }
  ];
  stage2Meta.forEach((m) => {
    rows.push([
      'Tahap 1 (Jurusan & Progres)',
      `s2_${m.key}`,
      m.name,
      m.cond,
      m.name,
      config.stage2Templates[m.key],
      '-',
      m.key === 'defaultBenchmarkNote' ? config.stage2Templates[m.key] : config.stage2Templates.defaultBenchmarkNote
    ]);
  });

  // 4. Stage 3 Subtest Templates & Overall
  const stage3Conds: Record<Stage3ConditionId, string> = {
    mastered_above: 'gapToTarget ≥ 0 (sudah melampaui target subtes ≥ 600)',
    no_drill: 'gapToTarget < 0 && drillQuestions === 0',
    low_vol_low_acc: `gapToTarget < 0 && questions < ${th.drillLowQuestions} && accuracy < ${th.drillLowAccuracyPct}%`,
    high_acc_low_to: `gapToTarget ≤ ${th.drillHighAccGapPts} && questions ≥ ${th.drillHighAccQuestions} && accuracy ≥ ${th.drillHighAccuracyPct}%`,
    active_drill_low_to: `questions ≥ ${th.drillLowQuestions} && gapToTarget ≤ ${th.drillActiveHighGap}`,
    near_target: `gapToTarget ≥ ${th.nearTargetGapPts} && gapToTarget < 0`,
    general_gap: 'Kondisi gap lainnya di bawah target'
  };
  (Object.keys(config.stage3SubtestTemplates) as Stage3ConditionId[]).forEach((cid) => {
    const t = config.stage3SubtestTemplates[cid];
    rows.push([
      'Tahap 3 (Kartu Subtes Prioritas)',
      `s3_${cid}`,
      t.label,
      stage3Conds[cid],
      t.label,
      t.saTask,
      '-',
      'Acuan dikunci ke Pilihan 1 (maks 3 subtes), target = max(600, targetJurusan)'
    ]);
  });
  (Object.keys(config.stage3SubtestTemplates) as Stage3ConditionId[]).forEach((cid) => {
    rows.push([
      'Tahap 3 (Kalimat Observasi Subtes)',
      `s3_obs_${cid}`,
      `Observasi · ${config.stage3SubtestTemplates[cid].label}`,
      stage3Conds[cid],
      config.stage3SubtestTemplates[cid].label,
      config.stage3SubtestTemplates[cid].observation,
      '-',
      'Placeholder: {toLatest} {gap} {questions} {sessions} {accuracy}'
    ]);
  });
  rows.push([
    'Tahap 3 (Audit Drill Overall)',
    's3_mismatch',
    'Deteksi Ketimpangan / Drill Semu',
    `maxDrill ≥ ${th.drillMismatchHighQ} && ada subtes prioritas gap ≤ ${th.drillActiveHighGap} dengan drill ≤ ${th.drillMismatchLowQ}`,
    'Temuan Pola Drill Soal',
    config.stage3OverallTemplates.mismatchNote,
    '-',
    config.stage3OverallTemplates.guardrail
  ]);
  rows.push([
    'Tahap 3 (Audit Drill Overall)',
    's3_overall_tasks',
    'Tugas SA Tahap 3 keseluruhan',
    'Selalu tampil di Tahap 3',
    'Daftar tugas SA',
    splitLines(config.stage3OverallTemplates.tasks).map((l) => `• ${l}`).join('\n'),
    '-',
    'Satu poin per baris (target, dengarkan, sepakati). Placeholder: {siswa} {drillWeekly} {weakCount} {target}'
  ]);
  [
    ['s3_overall_achieved', 'Poin bila semua subtes sudah mencapai target', 'Semua subtes ≥ target', splitLines(config.stage3OverallTemplates.tasksAchieved).map((l) => `• ${l}`).join('\n')],
    ['s3_overall_nodrill', 'Poin ke-2 bila ada subtes tanpa drill soal', 'Subtes di bawah target dengan 0 soal', config.stage3OverallTemplates.taskNoDrill],
    ['s3_overall_mismatch_task', 'Poin ke-2 bila drill menumpuk', 'Deteksi ketimpangan drill', config.stage3OverallTemplates.taskMismatch],
    ['s3_overall_rambu_nodrill', 'Hindari bila ada subtes tanpa drill soal', 'Subtes di bawah target dengan 0 soal', config.stage3OverallTemplates.rambuNoDrill],
    ['s3_overall_rambu_mismatch', 'Hindari bila drill menumpuk', 'Deteksi ketimpangan drill', config.stage3OverallTemplates.rambuMismatch]
  ].forEach(([id, name, cond, text]) => {
    rows.push(['Tahap 3 (Audit Drill Overall)', id, name, cond, name, text, '-', '-']);
  });

  // 5. Stage 4 (Classroom) & Stage 5 (Action Plan & Locking)
  rows.push([
    'Tahap 4 (Kelas TMB & Catatan)',
    's4c_attendance',
    'Kehadiran Kelas TMB & Catatan Pengajar',
    `hadir < ${th.attendanceWarnPct}% || sakit+izin ≥ ${th.absenceWarnSessions} || cakupan catatan < ${th.notesLowCoveragePct}%`,
    'Audit Kelas TMB',
    'Gali kendala jadwal/materi dari sesi tidak hadir & cocokkan catatan asli pengajar + riwayat Catatan Kakak Asuh.',
    '-',
    'Tampilkan teks asli pengajar & riwayat Student Tower tanpa pemrosesan AI.'
  ]);
  const stage4Meta: { key: keyof EngineRuleConfig['stage4Templates']; name: string; cond: string }[] = [
    { key: 'scheduleTask', name: 'Penguncian Jadwal Drill', cond: 'Selalu tampil di Tahap 5' },
    { key: 'parentSupportTask', name: 'Dukungan Belajar Orang Tua', cond: 'Selalu tampil di Tahap 5' },
    { key: 'missingDrillTask', name: 'Tindak Lanjut Subtes Minim Drill', cond: `Ada subtes prioritas dengan drill ≤ ${th.drillMismatchLowQ}` },
    { key: 'conflictOrLocationTask', name: 'Review Konflik Prodi / Lokasi', cond: 'isConflict || location_limit || different_major' },
    { key: 'closingTask', name: 'Poin penutup: catatan dan PDF', cond: 'Selalu tampil di Tahap 5' }
  ];
  stage4Meta.forEach((m) => {
    rows.push([
      'Tahap 5 (Rencana Aksi & Kunci)',
      `s5_${m.key}`,
      m.name,
      m.cond,
      m.name,
      config.stage4Templates[m.key],
      '-',
      'Wajib isi Catatan Khusus Kakak Asuh sebelum tombol Kunci dapat diaktifkan.'
    ]);
  });

  // 5b. Kalimat observasi per pola, catatan tambahan Tahap 2, dan teks kelas Tahap 4
  (Object.keys(config.patternTemplates) as TryoutPattern[]).forEach((pat) => {
    rows.push([
      'Tahap 2 (Kalimat Observasi)',
      `s1_obs_${pat}`,
      `Observasi · ${config.patternTemplates[pat].label}`,
      patternConditions[pat],
      config.patternTemplates[pat].label,
      config.patternTemplates[pat].observation,
      '-',
      'Placeholder: {a} {b} {selisih} {jumlah}'
    ]);
  });
  const s1Meta: { key: keyof Stage1Templates; name: string; cond: string }[] = [
    { key: 'foundationAllBelow500', name: 'Catatan fondasi: semua < 500', cond: 'Semua subtes < 500' },
    { key: 'foundationAllAbove', name: 'Catatan fondasi: semua ≥ target', cond: `Semua subtes ≥ ${th.foundationScoreTarget}` },
    { key: 'foundationPartial', name: 'Catatan fondasi: sebagian ≥ target', cond: `Sebagian subtes ≥ ${th.foundationScoreTarget}` },
    { key: 'foundationNone', name: 'Catatan fondasi: belum ada ≥ target', cond: `Belum ada subtes ≥ ${th.foundationScoreTarget}, tidak semua < 500` },
    { key: 'swing', name: 'Catatan fluktuasi subtes', cond: `max(skor) - min(skor) ≥ ${th.subtestSwingPts}` },
    { key: 'attendance', name: 'Catatan kehadiran rendah', cond: `kehadiran < ${th.attendanceWarnPct}%` },
    { key: 'latestDeltaSuffix', name: 'Tambahan akhir observasi', cond: '≥ 3 TO' }
  ];
  s1Meta.forEach((m) => {
    rows.push([
      'Tahap 2 (Catatan Tambahan)',
      `s1_${m.key}`,
      m.name,
      m.cond,
      m.name,
      config.stage1Templates[m.key],
      '-',
      'Placeholder: {target} {above} {total} {swing} {names} {pct} {warn} {delta}'
    ]);
  });
  const clMeta: { key: keyof ClassroomTemplates; name: string; cond: string }[] = [
    { key: 'noSessions', name: 'Belum ada sesi kelas', cond: 'totalSessions = 0' },
    { key: 'lowAttendance', name: 'Kehadiran rendah', cond: `hadir < ${th.attendanceWarnPct}%` },
    { key: 'goodAttendance', name: 'Kehadiran baik', cond: `hadir ≥ ${th.attendanceWarnPct}%` },
    { key: 'repeatedAbsence', name: 'Sesi terlewat banyak', cond: `sakit+izin ≥ ${th.absenceWarnSessions}` },
    { key: 'noNotes', name: 'Belum ada catatan pengajar', cond: 'catatan = 0' },
    { key: 'lowNotes', name: 'Cakupan catatan rendah', cond: `0 < cakupan catatan < ${th.notesLowCoveragePct}%` },
    { key: 'notesOk', name: 'Catatan pengajar cukup (poin ke-2)', cond: `cakupan catatan ≥ ${th.notesLowCoveragePct}%, sesi terlewat < ${th.absenceWarnSessions}` },
    { key: 'agreeTask', name: 'Poin kesepakatan (poin ke-3)', cond: 'Selalu tampil di Tahap 4' },
    { key: 'guardrailMissingNotes', name: 'Catatan acuan: ada sesi tanpa catatan', cond: 'sesi tanpa catatan > 0' },
    { key: 'guardrailAllNotes', name: 'Catatan acuan: semua sesi punya catatan', cond: 'sesi tanpa catatan = 0' }
  ];
  clMeta.forEach((m) => {
    rows.push([
      'Tahap 4 (Kelas TMB & Catatan)',
      `s4c_${m.key}`,
      m.name,
      m.cond,
      m.name,
      config.classroomTemplates[m.key],
      '-',
      'Placeholder: {siswa} {pct} {present} {total} {absent} {sick} {excused} {notes} {notesPct} {emptyNotes}'
    ]);
  });

  // 6. Rencana aksi 1–4 dan checklist penutup (Tahap 5)
  const apMeta: { key: keyof ActionPlanTemplates; name: string; cond: string }[] = [
    { key: 'plan1Title', name: 'Rencana 1 · judul', cond: 'Selalu' },
    { key: 'plan1Desc', name: 'Rencana 1 · isi', cond: 'Ada subtes di bawah target fondasi' },
    { key: 'plan1DescAchieved', name: 'Rencana 1 · isi', cond: 'Semua subtes ≥ target fondasi' },
    { key: 'plan1Pic', name: 'Rencana 1 · penanggung jawab (dashboard)', cond: 'Selalu' },
    { key: 'plan3Title', name: 'Rencana 3 · judul', cond: 'Selalu' },
    { key: 'plan3Desc', name: 'Rencana 3 · isi', cond: 'Ada subtes di bawah target fondasi' },
    { key: 'plan3DescAchieved', name: 'Rencana 3 · isi', cond: 'Semua subtes ≥ target fondasi' },
    { key: 'plan3ProgramSuffix', name: 'Rencana 3 · tambahan nilai target per jurusan', cond: 'Ringkasan target per jurusan tersedia' },
    { key: 'plan3Pic', name: 'Rencana 3 · penanggung jawab (dashboard)', cond: 'Selalu' },
    { key: 'planBTitle', name: 'Plan B · judul', cond: 'Belum ada pilihan jurusan yang mencapai target acuan' },
    { key: 'planBDesc', name: 'Plan B · isi', cond: 'Belum ada pilihan jurusan yang mencapai target acuan' },
    { key: 'planBPic', name: 'Plan B · penanggung jawab (dashboard)', cond: 'Belum ada pilihan jurusan yang mencapai target acuan' },
    { key: 'plan4Title', name: 'Rencana 4 · judul', cond: 'Selalu' },
    { key: 'plan4Desc', name: 'Rencana 4 · isi', cond: 'Selalu' },
    { key: 'plan4Daily', name: 'Rencana 4 · poin setiap hari', cond: 'Selalu' },
    { key: 'plan4Weekly', name: 'Rencana 4 · poin setiap akhir pekan', cond: 'Ada subtes di bawah target fondasi' },
    { key: 'plan4WeeklyAchieved', name: 'Rencana 4 · poin setiap akhir pekan', cond: 'Semua subtes ≥ target fondasi' },
    { key: 'plan4Fallback', name: 'Rencana 4 · poin bila target belum tercapai', cond: 'Selalu' },
    { key: 'plan4Pic', name: 'Rencana 4 · penanggung jawab (dashboard)', cond: 'Selalu' },
    { key: 'checklist', name: 'Checklist penutup (satu poin per baris)', cond: 'Selalu' }
  ];
  apMeta.forEach((m) => {
    rows.push([
      'Tahap 5 (Rencana Aksi & Kunci)',
      `s5_${m.key}`,
      m.name,
      m.cond,
      m.name,
      m.key === 'checklist'
        ? splitLines(config.actionPlanTemplates.checklist).map((l) => `• ${l}`).join('\n')
        : config.actionPlanTemplates[m.key],
      '-',
      'SATU SUMBER dashboard dan PDF hal. 3. Format: **tebal**. Placeholder: {student} {sa} {parent} {branch} {target} {weakCount} {drillWeekly} {drillPerSubtest} {drillTiers} {deepest} {nextEpisode} {episode} {avgScore}'
    ]);
  });

  // 7. Arahan di bawah kotak Catatan Kakak Asuh (internal SA, tidak masuk PDF)
  const ngMeta: { key: keyof NotesGuidanceTemplates; name: string; cond: string }[] = [
    { key: 'placeholder', name: 'Placeholder kotak catatan', cond: 'Saat kotak kosong' },
    { key: 'conflictLine', name: 'Arahan: beda pilihan atau lokasi', cond: 'isConflict || location_limit || different_major. Placeholder: {student}' },
    { key: 'missingDrillLine', name: 'Arahan: subtes minim drill', cond: `Ada subtes prioritas dengan drill ≤ ${th.drillMismatchLowQ}. Placeholder: {subtests}` },
    { key: 'lowAttendanceLine', name: 'Arahan: kehadiran rendah', cond: `kehadiran < ${th.attendanceWarnPct}%. Placeholder: {student} {pct}` },
    { key: 'allAchievedLine', name: 'Arahan: semua subtes prioritas tercapai', cond: 'Semua subtes prioritas ≥ target. Placeholder: {student}' },
    { key: 'fallbackLine', name: 'Arahan pengganti', cond: 'Tampil hanya bila tidak ada baris sesuai kondisi di atas' },
    { key: 'points', name: 'Arahan tetap (satu poin per baris)', cond: 'Selalu tampil di akhir daftar' },
    { key: 'reminder', name: 'Pengingat penutup', cond: 'Selalu' },
    { key: 'lockNudge', name: 'Pengingat lunak saat Kunci', cond: `Catatan < ${th.notesShortChars} karakter; SA tetap bisa melanjutkan` }
  ];
  ngMeta.forEach((m) => {
    rows.push([
      'Tahap 5 (Arahan Catatan Kakak Asuh, sementara tidak ditampilkan)',
      `s5_notes_${m.key}`,
      m.name,
      m.cond + (/Line$/.test(m.key) && m.key !== 'fallbackLine' ? '. Maksimal 2 baris sesuai kondisi tampil, urutan: konflik, drill, kehadiran, tercapai' : ''),
      m.name,
      m.key === 'points'
        ? splitLines(config.notesGuidanceTemplates.points).map((l) => `• ${l}`).join('\n')
        : config.notesGuidanceTemplates[m.key],
      '-',
      'Catatan internal SA, tidak ikut PDF'
    ]);
  });

  // 8. Teks tetap kartu "Panduan Kakak Asuh" per tahap
  const gcMeta: { key: keyof GuideCardTemplates; stage: string; name: string }[] = [
    { key: 't1Title', stage: 'Tahap 2', name: 'Judul kartu' },
    { key: 't1Goal', stage: 'Tahap 2', name: 'Tugas Kakak Asuh di tahap ini (satu kalimat)' },
    { key: 't1Rambu', stage: 'Tahap 2', name: 'Hindari (satu baris)' },
    { key: 't1MedianContext', stage: 'Tahap 2', name: 'Konteks data median' },
    { key: 't2Title', stage: 'Tahap 1', name: 'Judul kartu' },
    { key: 't2Goal', stage: 'Tahap 1', name: 'Tugas Kakak Asuh di tahap ini (satu kalimat)' },
    { key: 't2Rambu', stage: 'Tahap 1', name: 'Hindari (satu baris, tampil bila selisih nilai masih lebar)' },
    { key: 't3Title', stage: 'Tahap 3', name: 'Judul kartu' },
    { key: 't3Goal', stage: 'Tahap 3', name: 'Tugas Kakak Asuh di tahap ini (satu kalimat)' },
    { key: 't3Base600Note', stage: 'Tahap 3', name: 'Catatan alasan target dasar' },
    { key: 't4Title', stage: 'Tahap 4', name: 'Judul kartu' },
    { key: 't4Goal', stage: 'Tahap 4', name: 'Tugas Kakak Asuh di tahap ini (satu kalimat)' },
    { key: 't4Rambu', stage: 'Tahap 4', name: 'Hindari (satu baris, tampil bila catatan pengajar kosong atau sedikit)' },
    { key: 't5Title', stage: 'Tahap 5', name: 'Judul kartu' },
    { key: 't5Goal', stage: 'Tahap 5', name: 'Tugas Kakak Asuh di tahap ini (satu kalimat)' }
  ];
  gcMeta.forEach((m) => {
    const raw = config.guideCardTemplates[m.key];
    rows.push([
      `${m.stage} (Kartu Panduan Kakak Asuh)`,
      `guide_${m.key}`,
      m.name,
      'Selalu tampil',
      m.name,
      /Rambu$/.test(m.key) ? splitLines(raw).map((l) => `• ${l}`).join('\n') : raw,
      '-',
      'Format: **tebal**, `kode`. Placeholder: {target} {subtest} {history} {median} {prodi} {nextTo}'
    ]);
  });

  return '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
}
