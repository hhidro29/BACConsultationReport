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
}

export interface EngineRuleConfig {
  version: number;
  thresholds: EngineThresholds;
  patternTemplates: Record<
    TryoutPattern,
    { label: string; student: string; parent: string; nextStep: string }
  >;
  stage2Templates: Stage2Templates;
  stage3SubtestTemplates: Record<
    Stage3ConditionId,
    { label: string; saTask: string }
  >;
  stage4Templates: {
    scheduleTask: string;
    parentSupportTask: string;
    missingDrillTask: string;
    conflictOrLocationTask: string;
  };
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
    drillMismatchLowQ: 5
  },
  patternTemplates: {
    no_data: {
      label: 'Belum ada nilai',
      student: 'Pastikan tryout yang diikuti dan ketersediaan hasilnya.',
      parent: 'Bahas pengalaman mengikuti tryout dan mengakses hasil, termasuk kendala jika ada.',
      nextStep: 'Lengkapi hasil yang tersedia sebelum membahas perkembangan nilai.'
    },
    one_result: {
      label: 'Baru satu nilai',
      student: 'Bahas persiapan dan pengalaman pengerjaan pada tryout yang tercatat.',
      parent: 'Identifikasi dukungan belajar yang tersedia serta kebutuhan siswa untuk tryout berikutnya.',
      nextStep: 'Catat pengalaman tryout ini sebagai konteks awal; perkembangan nilai menunggu pembanding.'
    },
    initial_up: {
      label: 'Baru 2 TO: naik',
      student: 'Bandingkan persiapan dan pengalaman pengerjaan pada dua tryout yang tercatat.',
      parent: 'Bahas rutinitas dan dukungan belajar di antara kedua tryout.',
      nextStep: 'Rangkum perbedaan pengalaman siswa dan hal yang ingin dievaluasi pada tryout berikutnya.'
    },
    initial_down: {
      label: 'Baru 2 TO: turun',
      student: 'Bandingkan persiapan, pengalaman pengerjaan, dan pembahasan hasil pada kedua tryout.',
      parent: 'Bahas rutinitas belajar di antara kedua tryout, termasuk perubahan atau kendala jika ada.',
      nextStep: 'Catat temuan dari kedua tryout tanpa menyimpulkan penyebab penurunan atau pola berulang.'
    },
    initial_flat: {
      label: 'Baru 2 TO: datar',
      student: 'Bandingkan jenis soal, pengalaman pengerjaan, dan pengelolaan waktu pada kedua tryout.',
      parent: 'Bahas rutinitas dan dukungan belajar di antara kedua tryout.',
      nextStep: 'Rangkum persamaan dan perbedaan pengalaman siswa meskipun kedua nilai serupa.'
    },
    steady_up: {
      label: 'Naik konsisten',
      student: 'Bahas persiapan dan pengerjaan tryout selama periode ini, serta cara siswa membahas hasilnya.',
      parent: 'Identifikasi rutinitas dan dukungan belajar yang berlangsung selama periode tersebut.',
      nextStep: 'Rangkum cara belajar yang dinilai membantu oleh siswa serta hal yang ingin dievaluasi.'
    },
    steady_down: {
      label: 'Turun konsisten',
      student: 'Bahas persiapan dan pengerjaan tryout selama periode ini, serta cara siswa membahas hasilnya.',
      parent: 'Bahas kondisi dan rutinitas belajar selama periode ini, termasuk perubahan jadwal/aktivitas jika ada.',
      nextStep: 'Sepakati tindak lanjut berdasarkan contoh pengerjaan dan penjelasan siswa, tanpa menetapkan penyebab dari tren nilai saja.'
    },
    steady_flat: {
      label: 'Stabil / datar',
      student: 'Bandingkan jenis soal dan cara pengerjaan antartryout, termasuk kesulitan atau perubahan yang dirasakan siswa.',
      parent: 'Identifikasi rutinitas, dukungan yang tersedia, dan kebutuhan belajar menurut siswa serta orang tua.',
      nextStep: 'Rangkum perkembangan dari contoh pengerjaan; nilai yang tetap belum menjelaskan penguasaan materi.'
    },
    up_with_pauses: {
      label: 'Cenderung naik',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai meningkat dan nilai tetap.',
      parent: 'Bahas rutinitas dan dukungan belajar selama periode tersebut.',
      nextStep: 'Catat persamaan dan perbedaan pengalaman serta hal yang ingin ditinjau pada hasil berikutnya.'
    },
    down_with_pauses: {
      label: 'Cenderung turun',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai menurun dan nilai tetap.',
      parent: 'Bahas rutinitas dan kondisi belajar selama periode tersebut, termasuk kendala jika ada.',
      nextStep: 'Sepakati fokus pembahasan berdasarkan contoh pengerjaan dan pengalaman siswa.'
    },
    recovery: {
      label: 'Kembali naik',
      student: 'Bandingkan persiapan dan pengalaman pada tryout terakhir dengan tryout sebelumnya.',
      parent: 'Bahas kondisi, rutinitas, dan dukungan belajar menjelang tryout terakhir.',
      nextStep: 'Catat perbedaan pengalaman untuk ditinjau pada hasil berikutnya; satu kenaikan belum menunjukkan konsistensi.'
    },
    reversal_down: {
      label: 'Menurun di akhir',
      student: 'Bandingkan persiapan dan pengalaman pada tryout terakhir dengan tryout sebelumnya.',
      parent: 'Bahas kondisi, rutinitas, dan dukungan belajar menjelang tryout terakhir.',
      nextStep: 'Catat perbedaan pengalaman untuk ditinjau pada hasil berikutnya; satu penurunan belum menunjukkan konsistensi.'
    },
    fluctuating_up: {
      label: 'Naik-turun, membaik',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih tinggi dan lebih rendah.',
      parent: 'Bahas rutinitas dan dukungan belajar antartryout, termasuk perbedaan jika ada.',
      nextStep: 'Rangkum persamaan dan perbedaan pengalaman di sepanjang riwayat, termasuk hal yang ingin dievaluasi.'
    },
    fluctuating_down: {
      label: 'Naik-turun, melemah',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih rendah dan lebih tinggi.',
      parent: 'Bahas rutinitas dan kondisi belajar antartryout, termasuk kendala jika ada.',
      nextStep: 'Sepakati fokus tindak lanjut berdasarkan pengalaman siswa dan contoh pengerjaan.'
    },
    fluctuating_flat: {
      label: 'Naik-turun, skor sama',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih tinggi dan lebih rendah di sepanjang riwayat.',
      parent: 'Bahas kondisi, rutinitas, dan dukungan belajar selama periode nilai naik-turun.',
      nextStep: 'Rangkum perbedaan pengalaman sepanjang riwayat; kesamaan nilai awal dan akhir belum menunjukkan kestabilan.'
    }
  },
  stage2Templates: {
    mixedOrDifferent:
      'Konfirmasi minat utama siswa dan harapan orang tua antarprodi yang berbeda rumpun sebelum membahas alternatif atau cadangan.',
    aligned:
      'Konfirmasi apakah urutan Pilihan 1–3 masih menjadi prioritas utama siswa dan keluarga.',
    unconfirmed:
      'Pastikan apakah pilihan yang tercatat sudah didiskusikan bersama orang tua dan sesuai dengan minat siswa.',
    locationCheck:
      'Pastikan kesepakatan batasan lokasi kampus (izin kuliah luar kota, biaya, dan preferensi wilayah keluarga).',
    wideGap:
      'Bahas komitmen progres bertahap menuju konsultasi berikutnya (Januari pasca Mega TO Vol. 2) untuk mengejar dan menembus target acuan. Siapkan opsi Plan B pada portofolio Pilihan 2–4 melalui Simulasi jika laju kenaikan per TO terasa terlalu berat, tanpa langsung mematahkan motivasi di Pilihan 1.',
    remainingGap:
      'Arahkan progres 3 TO ke depan agar skor terbobot melewati Target Acuan pada konsultasi berikutnya, sambil tetap menjaga margin terhadap pesaing di prodi tujuan.',
    exceedTarget:
      'Skor sudah melampaui Target Acuan. Arahkan fokus pada menjaga konsistensi dan memperlebar margin aman di atas pesaing hingga akhir rangkaian TO/UTBK (karena pesaing juga terus bertumbuh).',
    lowParticipantsWarning:
      'Data pembanding internal di bawah batas minimum peserta ({count} < {limit} pemilih); jangan dipakai sebagai klaim posisi aman maupun jaminan SNPMB.',
    defaultBenchmarkNote:
      'Target Acuan adalah patokan historis internal Ruangguru, bukan garis aman yang diam. Siswa perlu melewati acuan di konsultasi berikutnya lalu memaksimalkan margin skor di atas pesaing sampai akhir rangkaian TO/UTBK.'
  },
  stage3SubtestTemplates: {
    no_drill: {
      label: 'Belum Ada Data Drill Soal Aplikasi',
      saTask:
        'Konfirmasi apakah siswa drill soal mandiri dari sumber luar aplikasi atau menemui kendala membuka drill soal, tanpa menyimpulkan siswa belum belajar.'
    },
    low_vol_low_acc: {
      label: 'Volume Terbatas & Akurasi Rendah',
      saTask:
        'Tinjau topik akurasi terendah bersama siswa dan bahas rencana penguatan konsep dasar di Klinik PR.'
    },
    active_drill_low_to: {
      label: 'Drill Soal Aktif · Gap TO Masih Lebar',
      saTask:
        'Bandingkan cara siswa mengerjakan drill soal vs saat tryout (manajemen waktu, ketelitian premis, atau variasi soal).'
    },
    high_acc_low_to: {
      label: 'Akurasi Drill Soal Tinggi · Gap TO Masih Ada',
      saTask:
        'Konsep dasar drill soal sudah baik di aplikasi; evaluasi simulasi pengerjaan saat tryout (manajemen waktu, ketelitian membaca jebakan, atau mental ujian).'
    },
    near_target: {
      label: 'Mendekati Batas Target',
      saTask:
        'Pertahankan ritme drill soal pada topik yang masih salah agar stabil melampaui batas target acuan.'
    },
    mastered_above: {
      label: 'Target Terpenuhi (Maksimalkan Margin)',
      saTask:
        'Pertahankan konsistensi latihan dan dorong margin skor setinggi mungkin di atas target acuan untuk mengungguli pesaing, sambil tetap memantau subtes lain yang masih perlu penguatan.'
    },
    general_gap: {
      label: 'Perlu Penguatan Terarah',
      saTask:
        'Bahas kendala pada topik terlemah serta kecocokan topik drill soal di aplikasi.'
    }
  },
  stage4Templates: {
    scheduleTask:
      'Konfirmasi hari, jam, dan target drill soal harian yang realistis dijalankan siswa tanpa bentrok jadwal sekolah.',
    parentSupportTask:
      'Bahas bentuk dukungan dan pemantauan belajar yang paling nyaman dilakukan orang tua di rumah.',
    missingDrillTask:
      'Pastikan jadwal dan topik spesifik Klinik PR untuk subtes dengan data drill masih minim.',
    conflictOrLocationTask:
      'Catat poin pilihan prodi atau batasan lokasi yang belum final agar dapat dicek ulang pada sesi berikutnya.'
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
}

export interface Stage1Output {
  pattern: TryoutPattern;
  patternLabel: string;
  observation: string;
  studentTask: string;
  parentTask: string;
  nextStep: string;
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

  const observations: Record<TryoutPattern, string> = {
    no_data: 'Belum ada nilai valid untuk membaca perkembangan skor total.',
    one_result: `Baru satu nilai tersedia (${a}). Perkembangan belum dapat disimpulkan.`,
    initial_up: `Skor naik dari ${a} menjadi ${b} (${netPhrase}). Baru dua hasil tersedia.`,
    initial_down: `Skor turun dari ${a} menjadi ${b} (${netPhrase}). Baru dua hasil tersedia.`,
    initial_flat: `Dua nilai berada pada rentang sama: ${a} → ${b}.`,
    steady_up: `Skor naik ${changes.length} kali berturut-turut, dari ${a} menjadi ${b} (${netPhrase}).`,
    steady_down: `Skor turun ${changes.length} kali berturut-turut, dari ${a} menjadi ${b} (${netPhrase}).`,
    steady_flat: `Skor sama/stabil pada setiap perpindahan hasil (${a} → ${b}).`,
    up_with_pauses: `Skor cenderung naik (${a} → ${b}), diselingi hasil yang datar.`,
    down_with_pauses: `Skor cenderung turun (${a} → ${b}), diselingi hasil yang datar.`,
    recovery: `Skor terakhir kembali naik setelah sempat turun (${a} → ${b}).`,
    reversal_down: `Skor terakhir kembali turun setelah sempat naik (${a} → ${b}).`,
    fluctuating_up: `Skor naik-turun; nilai akhir lebih tinggi daripada awal (${a} → ${b}).`,
    fluctuating_down: `Skor naik-turun; nilai akhir lebih rendah daripada awal (${a} → ${b}).`,
    fluctuating_flat: `Skor naik-turun, dengan nilai awal dan akhir serupa (${a} → ${b}).`
  };

  let observation = observations[pattern];
  if (n >= 3 && latestDelta !== null) {
    observation += ` Perubahan terakhir: ${latestDelta > 0 ? '+' : ''}${latestDelta} poin.`;
  }

  const extraNotes: string[] = [];
  const aboveCount = input.subtestRows.filter((s) => s.toLatest >= th.foundationScoreTarget).length;
  const totalSub = input.subtestRows.length;
  const allBelow500 = totalSub > 0 && input.subtestRows.every((s) => s.toLatest < 500);

  if (allBelow500) {
    extraNotes.push(
      'Seluruh subtes saat ini masih berada di bawah 500 (tahap fondasi awal). Fokuskan target jangka pendek pada 2–3 subtes terdekat sebelum membidik 600 di semua subtes.'
    );
  } else if (totalSub > 0 && aboveCount === totalSub) {
    extraNotes.push(
      `Seluruh subtes telah mencapai batas acuan ≥ ${th.foundationScoreTarget}. Fokus pembahasan dapat diarahkan ke pemantapan subtes berbobot prodi.`
    );
  } else if (totalSub > 0 && aboveCount > 0) {
    extraNotes.push(
      `Terdapat ${aboveCount} dari ${totalSub} subtes di atas ${th.foundationScoreTarget}. Soroti kekuatan tersebut sebelum membahas subtes dengan gap terbesar.`
    );
  } else if (totalSub > 0) {
    extraNotes.push(
      `Belum ada subtes yang menyentuh ${th.foundationScoreTarget}. Jadikan target bertahap tiap subtes sebagai fokus awal.`
    );
  }

  const extremeSubtests = input.subtestRows.filter(
    (s) => s.scores.length >= 2 && Math.max(...s.scores) - Math.min(...s.scores) >= th.subtestSwingPts
  );
  if (extremeSubtests.length > 0) {
    extraNotes.push(
      `Terdapat fluktuasi ≥ ${th.subtestSwingPts} poin pada ${extremeSubtests.map((s) => s.name).slice(0, 2).join(', ')}. Gunakan nilai Median pribadi siswa untuk melihat performa tipikal.`
    );
  }

  const attendanceWarn = input.attendanceRatePct < th.attendanceWarnPct;
  if (attendanceWarn) {
    extraNotes.push(
      `Kehadiran kelas tercatat ${input.attendanceRatePct}% (< ${th.attendanceWarnPct}%). Konfirmasi kendala jadwal atau kehadiran sebelum menyusun target baru.`
    );
  }

  const tpl = config.patternTemplates[pattern];
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
    studentTask: tpl.student,
    parentTask: tpl.parent,
    nextStep: tpl.nextStep,
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
    saTasks.push(tpl.mixedOrDifferent);
  } else if (input.familyAlignment === 'aligned') {
    flags.push('Pilihan Selaras');
    saTasks.push(tpl.aligned);
  } else {
    flags.push('Perlu Konfirmasi Keluarga');
    saTasks.push(tpl.unconfirmed);
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
    saTasks.push(tpl.locationCheck);
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
    saTasks.push(tpl.wideGap);
  } else if ((minGap as number) < 0) {
    saTasks.push(tpl.remainingGap);
  } else {
    flags.push('Melampaui Target Acuan');
    saTasks.push(tpl.exceedTarget);
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
    observation:
      minGap !== null && maxGap !== null
        ? `Jarak skor terbobot terhadap target acuan berada pada rentang ${maxGap} s.d. ${minGap} poin.`
        : 'Data jarak skor terbobot terhadap target acuan belum tersedia.',
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
  const isHighAccLowTo = !isMastered && !isNoDrill && !isLowVolLowAcc && sub.drillQuestions >= 25 && sub.drillAccuracyPct >= 70 && sub.gapTo600 <= -35;
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
      effect: isLowVolLowAcc ? 'Terpilih: tinjau topik terendah & Klinik PR' : 'Lanjut cek aturan berikutnya'
    },
    {
      ruleId: 's3_r2b_highacc_lowto',
      ruleName: '3. Akurasi Drill Tinggi Tapi Skor TO Masih Jauh',
      expression: `questions (${sub.drillQuestions}) ≥ 25 && akurasi (${sub.drillAccuracyPct}%) ≥ 70% && gap (${sub.gapTo600}) ≤ -35`,
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

  const obsMap: Record<Stage3ConditionId, string> = {
    mastered_above: `Skor ${sub.toLatest} (melampaui target +${sub.gapTo600}); tercatat ${sub.drillQuestions} soal (${sub.drillAccuracyPct}% benar).`,
    no_drill: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}), aktivitas drill soal di aplikasi tercatat 0 soal.`,
    low_vol_low_acc: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}); tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar).`,
    high_acc_low_to: `Akurasi drill soal tinggi di aplikasi (${sub.drillAccuracyPct}% benar dari ${sub.drillQuestions} soal), namun skor TO ${sub.toLatest} (jarak ${sub.gapTo600}).`,
    active_drill_low_to: `Tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar), namun skor TO ${sub.toLatest} (jarak ${sub.gapTo600}).`,
    near_target: `Skor ${sub.toLatest} (jarak ${sub.gapTo600} ke target); tercatat ${sub.drillQuestions} soal (${sub.drillAccuracyPct}% benar).`,
    general_gap: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}); tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar).`
  };

  return {
    conditionId,
    conditionLabel: tpl[conditionId]?.label || 'Penguatan Terarah',
    observation: obsMap[conditionId],
    saTask: tpl[conditionId]?.saTask || 'Bahas topik lemah serta kecocokan pola drill soal.',
    traces
  };
}

export interface Stage3OverallOutput {
  hasDrillMismatch: boolean;
  mismatchNote: string | null;
  saTasks: string[];
  guardrailNote: string;
  traces: RuleTrace[];
}

export function analyzeStage3Overall(
  subtests: Stage3SubtestInput[],
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
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

  const mismatchNote = hasMismatch
    ? `Terdeteksi ketimpangan fokus drill soal: drill soal terbanyak ada di ${highestDrill.name} (${highestDrill.drillQuestions} soal), sedangkan ${zeroOrLowInPriority.map((s) => s.name).join(' & ')} baru ≤ ${th.drillMismatchLowQ} soal.`
    : null;

  const saTasks = [
    'Tinjau cara siswa memilih subtes saat drill soal di aplikasi dan pastikan apakah drill soal diarahkan pada subtes dengan gap terbesar.',
    'Konfirmasi apakah ada drill soal mandiri dari buku/sumber di luar aplikasi serta bagaimana siswa membahas soal yang dijawab salah.',
    'Sepakati 1–2 topik akurasi terendah yang akan diprioritaskan pada sesi Klinik PR cabang.'
  ];

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
    guardrailNote:
      '1 sesi dapat tercatat meskipun kurang dari 10 soal. Selalu baca jumlah sesi bersama total butir soal & akurasinya, dan jangan memarahi siswa saat data aplikasi bernilai 0.',
    traces
  };
}

export interface ActionPlanItem {
  num: number;
  title: string;
  desc: string;
  pic: string;
  accentColor: string;
}

export interface Stage4Input {
  hasConflictOrLocationCheck?: boolean;
  hasMissingDrill?: boolean;
  prioritySubtests?: {
    id: string;
    name: string;
    gapNum: number;
    rgQuestionsDone: number;
    lowestTopics: string[];
  }[];
  studentName?: string;
  saName?: string;
  parentName?: string;
  targetToScore?: number;
}

export interface Stage4Output {
  saTasks: string[];
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
  const saTasks = [tpl.scheduleTask, tpl.parentSupportTask];

  if (isMissingDrill) {
    saTasks.push(tpl.missingDrillTask);
  }
  if (isConflict) {
    saTasks.push(tpl.conflictOrLocationTask);
  }

  const checklist = [
    'Jadwal hadir Klinik PR cabang minggu ini sudah disepakati bersama siswa.',
    'Ringkasan keputusan dan pengingat sesi berikutnya sudah ditulis di Catatan Kakak Asuh.',
    'Buka tombol Download PDF di bar atas untuk diserahkan ke keluarga.'
  ];

  // Dynamic Holistic Action Plans for Checkpoint 1
  const pSub = studentInput?.prioritySubtests || [];
  // gapNum is negative when below target, so the largest gap is the most negative value
  const largestGapEntry = [...pSub].sort((a, b) => a.gapNum - b.gapNum)[0];
  const largestGapSub = largestGapEntry?.name || 'Subtes Prioritas #1';
  // pick the lowest-drill subtest that is not the same subtest, so the sentence never reads "PK dan PK"
  const lowestDrillEntry =
    [...pSub]
      .filter((s) => s.id !== largestGapEntry?.id)
      .sort((a, b) => a.rgQuestionsDone - b.rgQuestionsDone)[0] ||
    [...pSub].sort((a, b) => a.rgQuestionsDone - b.rgQuestionsDone)[0];
  const lowestDrillSub = lowestDrillEntry?.name || 'Subtes Minim Drill Soal';
  const sameSub = Boolean(largestGapEntry && lowestDrillEntry && largestGapEntry.id === lowestDrillEntry.id);
  // weak topics come from the two subtests named in plan 1 first, then the rest
  const topicSources = [largestGapEntry, lowestDrillEntry].filter(
    (s, i, arr): s is NonNullable<typeof s> => Boolean(s) && arr.indexOf(s) === i
  );
  const otherSources = pSub.filter((s) => !topicSources.includes(s));
  const weakTopics = [...topicSources, ...otherSources].flatMap((s) => s.lowestTopics || []).slice(0, 3);
  const topicsSummary = weakTopics.length ? weakTopics.map((t) => t.split('(')[0].trim()).join(', ') : 'materi dasar subtes prioritas';

  const allAchieved = pSub.length > 0 && pSub.every((s) => s.gapNum >= 0);

  const actionPlans: ActionPlanItem[] = [
    {
      num: 1,
      title: allAchieved
        ? 'Pemeliharaan & Penguatan Margin Subtes Bobot Utama'
        : 'Kesepakatan Drill Soal Mandiri Subtes Prioritas',
      desc: allAchieved
        ? `Seluruh subtes prioritas sudah melampaui target acuan. Sepakati latihan soal tingkat lanjut untuk memperlebar margin aman di atas pesaing pada ${largestGapSub}.`
        : sameSub
        ? `Sepakati target jumlah soal & jadwal drill soal mandiri di aplikasi untuk ${largestGapSub} yang memiliki gap terbesar sekaligus riwayat drill soal terendah.`
        : `Sepakati target jumlah soal & jadwal drill soal mandiri di aplikasi untuk ${largestGapSub} dan ${lowestDrillSub} yang memiliki gap terbesar atau riwayat drill soal terendah.`,
      pic: `${studentInput?.studentName || 'Siswa'} (dipantau bersama ${studentInput?.saName || 'Kakak Asuh'})`,
      accentColor: '#2d7684'
    },
    {
      num: 2,
      title: 'Sesi Klinik Belajar Tatap Muka di Cabang',
      desc: allAchieved
        ? `Jadwalkan klinik pengayaan/bedah soal HOTS bersama Master Teacher pada topik akurasi terendah (${topicsSummary}) untuk menjaga konsistensi skor.`
        : `Jadwalkan sesi klinik tatap muka bersama Master Teacher / Kakak Asuh untuk membedah topik akurasi terendah di TO: ${topicsSummary} sesuai ketersediaan waktu siswa.`,
      pic: `${studentInput?.saName || 'Kakak Asuh'} & Siswa`,
      accentColor: '#245f5a'
    },
    {
      num: 3,
      title: allAchieved
        ? 'Maksimalkan Margin Skor di Atas Pesaing Menuju UTBK'
        : 'Fokus Target Evaluasi Tryout Berikutnya (TO 5)',
      desc: allAchieved
        ? `Pertahankan performa puncak serta perlebar selisih skor di atas passing grade acuan untuk mengantisipasi kenaikan persaingan hingga akhir sesi TO.`
        : `Prioritaskan penahanan tren turun dan kenaikan bertahap agar skor melewati passing grade acuan pada konsultasi berikutnya.`,
      pic: 'Siswa & Tim Akademik Cabang',
      accentColor: '#b54708'
    },
    {
      num: 4,
      title: 'Dukungan Kebiasaan & Lingkungan Belajar di Rumah',
      desc: isConflict
        ? `Konfirmasikan dukungan jam belajar tenang di rumah serta ruang dialog keluarga mengenai kesepakatan pilihan jurusan dan perizinan kampus.`
        : `Orang tua mendampingi konsistensi jam belajar mandiri tanpa distraksi serta memastikan istirahat dan nutrisi cukup menjelang TO berikutnya.`,
      pic: studentInput?.parentName || 'Orang Tua / Wali Siswa',
      accentColor: '#027a48'
    }
  ];

  const traces: RuleTrace[] = [
    {
      ruleId: 's4_drill',
      ruleName: 'Tindak Lanjut Drill Minim',
      expression: `isMissingDrill = ${isMissingDrill}`,
      matched: isMissingDrill,
      effect: isMissingDrill ? 'Tambahkan penguncian jadwal Klinik PR subtes minim drill' : 'Tidak dipicu'
    },
    {
      ruleId: 's4_prodi',
      ruleName: 'Pencatatan Konflik Prodi / Lokasi',
      expression: `isConflict = ${isConflict}`,
      matched: isConflict,
      effect: isConflict ? 'Tambahkan tugas pencatatan status prodi/lokasi untuk review berikut' : 'Tidak dipicu'
    }
  ];

  return { saTasks, checklist, actionPlans, traces };
}

export interface StageClassroomInput {
  totalSessions: number;
  presentSessions: number;
  lateSessions: number;
  sickSessions: number;
  excusedSessions: number;
  notesCount: number;
}

export interface StageClassroomOutput {
  saTasks: string[];
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

  const saTasks: string[] = [];
  const noSessions = total === 0;
  const lowAttendance = !noSessions && attendancePct < th.attendanceWarnPct;

  if (noSessions) {
    saTasks.push('Belum ada sesi kelas TMB yang tercatat pada periode ini; kehadiran belum dapat dinilai.');
  } else if (lowAttendance) {
    saTasks.push(
      `Kehadiran kelas TMB tercatat ${pctLabel}% (${input.presentSessions}/${total} sesi). Gali kendala jadwal, kesehatan, atau perjalanan terlebih dahulu sebelum menambah target belajar baru.`
    );
  } else {
    saTasks.push(
      `Kehadiran kelas TMB sudah baik (${pctLabel}%, ${input.presentSessions}/${total} sesi). Cocokkan catatan pengajar di tabel dengan subtes yang skor TO-nya masih perlu penguatan.`
    );
  }

  const hasRepeatedAbsence = absentCount >= 5;
  if (hasRepeatedAbsence) {
    saTasks.push(
      `Pastikan siswa sudah mengejar materi dari ${absentCount} sesi tidak hadir (${input.sickSessions} sakit, ${input.excusedSessions} izin) melalui rekaman kelas atau Klinik PR cabang.`
    );
  }

  const lowNotesCoverage = input.notesCount === 0 || notesRatioPct < 25;
  if (input.notesCount === 0) {
    saTasks.push(
      'Belum ada catatan tertulis pengajar pada periode ini; tanyakan langsung ke siswa materi kelas mana yang masih terasa sulit.'
    );
  } else if (notesRatioPct < 25) {
    saTasks.push(
      `Baru ${input.notesCount} dari ${total} sesi (${notesPct}%) yang memiliki catatan tertulis pengajar. Jangan menyimpulkan siswa pasif dari sedikitnya catatan; validasi langsung bersama siswa.`
    );
  }

  const guardrailNote =
    emptyNotesCount > 0
      ? `Data menampilkan rekaman asli Student Tower tanpa pemrosesan AI. Dari ${total} sesi tercatat, ${emptyNotesCount} sesi belum memiliki catatan tertulis — artinya belum diisi pengajar, bukan berarti siswa pasif.`
      : `Seluruh ${total} sesi tercatat menampilkan catatan asli pengajar langsung dari Student Tower tanpa pemrosesan AI.`;

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
      ruleName: 'Tindak Lanjut Sesi Terlewat (Sakit + Izin ≥ 5)',
      expression: `sakit+izin (${absentCount}) ≥ 5`,
      matched: hasRepeatedAbsence,
      effect: hasRepeatedAbsence ? 'Ingatkan kejar materi via rekaman/Klinik PR' : 'Tidak dipicu'
    },
    {
      ruleId: 's4c_notes_coverage',
      ruleName: 'Cakupan Catatan Pengajar (< 25%)',
      expression: `catatan (${notesPct}%) < 25%`,
      matched: lowNotesCoverage,
      effect: lowNotesCoverage
        ? 'Tambahkan rambu agar catatan sedikit tidak ditafsirkan pasif'
        : 'Cakupan catatan cukup representatif'
    }
  ];

  return { saTasks, guardrailNote, traces };
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
    { key: 'toTolerancePts', label: 'Toleransi TO Datar (±poin)', stage: 'Tahap 1' },
    { key: 'foundationScoreTarget', label: 'Target Fondasi Subtes Minimum', stage: 'Tahap 1 & 3' },
    { key: 'subtestSwingPts', label: 'Batas Fluktuasi Subtes Ekstrem (poin)', stage: 'Tahap 1' },
    { key: 'attendanceWarnPct', label: 'Ambang Peringatan Kehadiran TMB (%)', stage: 'Tahap 1 & 4' },
    { key: 'wideWeightedGapPts', label: 'Gap Terbobot Lebar (≤ poin)', stage: 'Tahap 2' },
    { key: 'remainingEpisodesToNextConsult', label: 'Sisa TO Menuju Konsultasi Berikutnya (Januari)', stage: 'Tahap 2' },
    { key: 'remainingEpisodesToUtbk', label: 'Total Sisa TO Menuju UTBK', stage: 'Tahap 2' },
    { key: 'planBGainThresholdPts', label: 'Ambang Kenaikan/TO Trigger Plan B (> poin/TO)', stage: 'Tahap 2' },
    { key: 'minBenchmarkParticipants', label: 'Min. Peserta Pembanding Internal', stage: 'Tahap 2' },
    { key: 'drillLowQuestions', label: 'Batas Drill Soal Minim (< soal)', stage: 'Tahap 3' },
    { key: 'drillLowAccuracyPct', label: 'Batas Akurasi Drill Rendah (< %)', stage: 'Tahap 3' },
    { key: 'drillActiveHighGap', label: 'Gap Subtes Prioritas Tinggi (≤ poin)', stage: 'Tahap 3' },
    { key: 'nearTargetGapPts', label: 'Batas Mendekati Target (≥ poin)', stage: 'Tahap 3' },
    { key: 'drillMismatchHighQ', label: 'Ketimpangan Drill: Subtes Aktif (≥ soal)', stage: 'Tahap 3' },
    { key: 'drillMismatchLowQ', label: 'Ketimpangan Drill: Prioritas Minim (≤ soal)', stage: 'Tahap 3' }
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
      'Tahap 1 (Pola TO)',
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
    { key: 'wideGap', name: 'Gap Terbobot Masih Lebar (Trigger Plan B)', cond: `minGap ≤ ${th.wideWeightedGapPts} atau gain/TO > ${th.planBGainThresholdPts}` },
    { key: 'remainingGap', name: 'Gap Terbobot Moderat (< 0)', cond: `${th.wideWeightedGapPts} < minGap < 0` },
    { key: 'exceedTarget', name: 'Skor Melampaui Target Acuan (≥ 0)', cond: 'minGap ≥ 0 (Siswa Achieve)' },
    { key: 'lowParticipantsWarning', name: 'Pembanding Peserta Terlalu Sedikit', cond: `minParticipants < ${th.minBenchmarkParticipants}` },
    { key: 'defaultBenchmarkNote', name: 'Guardrail Standar Target & Persaingan', cond: 'Selalu tampil sebagai konteks acuan non-SNPMB' }
  ];
  stage2Meta.forEach((m) => {
    rows.push([
      'Tahap 2 (Jurusan & Progres)',
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
    high_acc_low_to: 'gapToTarget ≤ -35 && questions ≥ 25 && accuracy ≥ 70%',
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
  rows.push([
    'Tahap 3 (Audit Drill Overall)',
    's3_mismatch',
    'Deteksi Ketimpangan / Drill Semu',
    `maxDrill ≥ ${th.drillMismatchHighQ} && ada subtes prioritas gap ≤ ${th.drillActiveHighGap} dengan drill ≤ ${th.drillMismatchLowQ}`,
    'Temuan Pola Drill Soal',
    'Arahkan pengalihan porsi drill ke subtes prioritas dengan gap terdalam.',
    '-',
    '1 sesi dapat tercatat walau < 10 soal; baca bersama total butir soal & akurasi.'
  ]);

  // 5. Stage 4 (Classroom) & Stage 5 (Action Plan & Locking)
  rows.push([
    'Tahap 4 (Kelas TMB & Catatan)',
    's4c_attendance',
    'Kehadiran Kelas TMB & Catatan Pengajar',
    `hadir < ${th.attendanceWarnPct}% || sakit+izin ≥ 5 || cakupan catatan < 25%`,
    'Audit Kelas TMB',
    'Gali kendala jadwal/materi dari sesi tidak hadir & cocokkan catatan asli pengajar + riwayat Catatan Kakak Asuh.',
    '-',
    'Tampilkan teks asli pengajar & riwayat Student Tower tanpa pemrosesan AI.'
  ]);
  const stage4Meta: { key: keyof EngineRuleConfig['stage4Templates']; name: string; cond: string }[] = [
    { key: 'scheduleTask', name: 'Penguncian Jadwal Drill & Klinik', cond: 'Selalu tampil di Tahap 5' },
    { key: 'parentSupportTask', name: 'Dukungan Belajar Orang Tua', cond: 'Selalu tampil di Tahap 5' },
    { key: 'missingDrillTask', name: 'Tindak Lanjut Subtes Minim Drill', cond: `Ada subtes prioritas dengan drill ≤ ${th.drillMismatchLowQ}` },
    { key: 'conflictOrLocationTask', name: 'Review Konflik Prodi / Lokasi', cond: 'isConflict || location_limit || different_major' }
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

  return '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
}
