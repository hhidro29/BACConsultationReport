/**
 * Deterministic, White-Box SA Guideline Engine (Non-AI-Centered)
 *
 * Every threshold and output wording template lives in `EngineRuleConfig` so
 * academic teams can inspect why rules trigger (`traces: RuleTrace[]`) and
 * directly override thresholds or output templates without touching code.
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
  | 'near_target'
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
  version: 1,
  thresholds: {
    toTolerancePts: 5,
    foundationScoreTarget: 600,
    subtestSwingPts: 100,
    attendanceWarnPct: 80,
    wideWeightedGapPts: -100,
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
      label: 'Dua hasil: naik',
      student: 'Bandingkan persiapan dan pengalaman pengerjaan pada dua tryout yang tercatat.',
      parent: 'Bahas rutinitas dan dukungan belajar di antara kedua tryout.',
      nextStep: 'Rangkum perbedaan pengalaman siswa dan hal yang ingin dievaluasi pada tryout berikutnya.'
    },
    initial_down: {
      label: 'Dua hasil: turun',
      student: 'Bandingkan persiapan, pengalaman pengerjaan, dan pembahasan hasil pada kedua tryout.',
      parent: 'Bahas rutinitas belajar di antara kedua tryout, termasuk perubahan atau kendala jika ada.',
      nextStep: 'Catat temuan dari kedua tryout tanpa menyimpulkan penyebab penurunan atau pola berulang.'
    },
    initial_flat: {
      label: 'Dua hasil: tetap',
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
      label: 'Tetap sepanjang riwayat',
      student: 'Bandingkan jenis soal dan cara pengerjaan antartryout, termasuk kesulitan atau perubahan yang dirasakan siswa.',
      parent: 'Identifikasi rutinitas, dukungan yang tersedia, dan kebutuhan belajar menurut siswa serta orang tua.',
      nextStep: 'Rangkum perkembangan dari contoh pengerjaan; nilai yang tetap belum menjelaskan penguasaan materi.'
    },
    up_with_pauses: {
      label: 'Cenderung naik, diselingi tetap',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai meningkat dan nilai tetap.',
      parent: 'Bahas rutinitas dan dukungan belajar selama periode tersebut.',
      nextStep: 'Catat persamaan dan perbedaan pengalaman serta hal yang ingin ditinjau pada hasil berikutnya.'
    },
    down_with_pauses: {
      label: 'Cenderung turun, diselingi tetap',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai menurun dan nilai tetap.',
      parent: 'Bahas rutinitas dan kondisi belajar selama periode tersebut, termasuk kendala jika ada.',
      nextStep: 'Sepakati fokus pembahasan berdasarkan contoh pengerjaan dan pengalaman siswa.'
    },
    recovery: {
      label: 'Terakhir berbalik naik',
      student: 'Bandingkan persiapan dan pengalaman pada tryout terakhir dengan tryout sebelumnya.',
      parent: 'Bahas kondisi, rutinitas, dan dukungan belajar menjelang tryout terakhir.',
      nextStep: 'Catat perbedaan pengalaman untuk ditinjau pada hasil berikutnya; satu kenaikan belum menunjukkan konsistensi.'
    },
    reversal_down: {
      label: 'Terakhir berbalik turun',
      student: 'Bandingkan persiapan dan pengalaman pada tryout terakhir dengan tryout sebelumnya.',
      parent: 'Bahas kondisi, rutinitas, dan dukungan belajar menjelang tryout terakhir.',
      nextStep: 'Catat perbedaan pengalaman untuk ditinjau pada hasil berikutnya; satu penurunan belum menunjukkan konsistensi.'
    },
    fluctuating_up: {
      label: 'Naik-turun, akhir lebih tinggi',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih tinggi dan lebih rendah.',
      parent: 'Bahas rutinitas dan dukungan belajar antartryout, termasuk perbedaan jika ada.',
      nextStep: 'Rangkum persamaan dan perbedaan pengalaman di sepanjang riwayat, termasuk hal yang ingin dievaluasi.'
    },
    fluctuating_down: {
      label: 'Naik-turun, akhir lebih rendah',
      student: 'Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih rendah dan lebih tinggi.',
      parent: 'Bahas rutinitas dan kondisi belajar antartryout, termasuk kendala jika ada.',
      nextStep: 'Sepakati fokus tindak lanjut berdasarkan pengalaman siswa dan contoh pengerjaan.'
    },
    fluctuating_flat: {
      label: 'Naik-turun, kembali mendekati awal',
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
      'Bahas kesiapan komitmen latihan untuk memperkecil gap secara bertahap; hindari memaksa penurunan target prodi di Checkpoint 1 sebelum pondasi subtes dibenahi.',
    remainingGap:
      'Bandingkan progres subtes penentu bobot jurusan dengan gap yang tersisa menuju checkpoint berikutnya.',
    exceedTarget:
      'Bahas strategi menjaga konsistensi skor dan tinjau apakah siswa ingin membandingkan opsi alternatif melalui Simulasi.',
    lowParticipantsWarning:
      'Data pembanding internal di bawah batas minimum peserta ({count} < {limit} pemilih); jangan dipakai sebagai klaim posisi aman maupun jaminan SNPMB.',
    defaultBenchmarkNote:
      'Angka target skor adalah acuan latihan internal Ruangguru, bukan passing grade resmi SNPMB atau jaminan kelolosan.'
  },
  stage3SubtestTemplates: {
    no_drill: {
      label: 'Belum Ada Data Drill Aplikasi',
      saTask:
        'Konfirmasi apakah siswa berlatih dari sumber luar aplikasi atau menemui kendala membuka drill, tanpa menyimpulkan siswa belum belajar.'
    },
    low_vol_low_acc: {
      label: 'Volume Terbatas & Akurasi Rendah',
      saTask:
        'Tinjau topik akurasi terendah bersama siswa dan bahas rencana penguatan konsep dasar di Klinik PR.'
    },
    active_drill_low_to: {
      label: 'Drill Aktif · Gap TO Masih Lebar',
      saTask:
        'Bandingkan cara siswa mengerjakan latihan vs saat tryout (manajemen waktu, ketelitian premis, atau variasi soal).'
    },
    near_target: {
      label: 'Mendekati Batas 600',
      saTask:
        'Pertahankan ritme latihan pada topik yang masih salah agar stabil melampaui 600.'
    },
    general_gap: {
      label: 'Perlu Penguatan Terarah',
      saTask:
        'Bahas kendala pada topik terlemah serta kecocokan topik yang dilatih di aplikasi.'
    }
  },
  stage4Templates: {
    scheduleTask:
      'Konfirmasi hari, jam, dan target latihan harian yang realistis dijalankan siswa tanpa bentrok jadwal sekolah.',
    parentSupportTask:
      'Bahas bentuk dukungan dan pemantauan belajar yang paling nyaman dilakukan orang tua di rumah.',
    missingDrillTask:
      'Pastikan jadwal dan topik spesifik Klinik PR untuk subtes dengan data drill masih minim.',
    conflictOrLocationTask:
      'Catat poin pilihan prodi atau batasan lokasi yang belum final agar dapat dicek ulang pada sesi berikutnya.'
  }
};

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
  traces: RuleTrace[];
}

export function analyzeStage1(
  input: Stage1Input,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): Stage1Output {
  const th = config.thresholds;
  const tolerance = input.tolerance ?? th.toTolerancePts;
  const values = input.toScores.filter((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0);
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

  if (totalSub > 0 && aboveCount === totalSub) {
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
      expression: `subtes ≥ ${th.foundationScoreTarget} = ${aboveCount} dari ${totalSub}`,
      matched: totalSub > 0,
      effect:
        aboveCount === totalSub && totalSub > 0
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

  return {
    pattern,
    patternLabel: tpl.label,
    observation,
    studentTask: tpl.student,
    parentTask: tpl.parent,
    nextStep: tpl.nextStep,
    extraNotes,
    traces
  };
}

export interface Stage2Input {
  hasMixedRumpun: boolean;
  familyAlignment: 'aligned' | 'different_major' | 'location_limit' | 'unconfirmed';
  minGapToTarget: number;
  maxGapToTarget: number;
  minParticipantsCount: number;
}

export interface Stage2Output {
  conditionLabel: string;
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

  const isConflict = input.hasMixedRumpun || input.familyAlignment === 'different_major';
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
    expression: `mixedRumpun=${input.hasMixedRumpun}, status="${input.familyAlignment}"`,
    matched: true,
    effect: isConflict
      ? 'Pakai panduan konflik/perbedaan rumpun'
      : input.familyAlignment === 'aligned'
      ? 'Pakai panduan konfirmasi prioritas selaras'
      : 'Pakai panduan konfirmasi kesepakatan keluarga'
  });

  const needsLocation = input.familyAlignment === 'location_limit' || input.hasMixedRumpun;
  if (needsLocation) {
    saTasks.push(tpl.locationCheck);
  }
  traces.push({
    ruleId: 's2_location',
    ruleName: 'Pengecekan Izin Lokasi Kuliah',
    expression: `status="${input.familyAlignment}" || mixedRumpun=${input.hasMixedRumpun}`,
    matched: needsLocation,
    effect: needsLocation ? 'Tambahkan tugas konfirmasi izin lokasi/merantau' : 'Tidak perlu tugas khusus lokasi'
  });

  const isWideGap = input.minGapToTarget <= th.wideWeightedGapPts;
  if (isWideGap) {
    flags.push('Gap Masih Lebar');
    saTasks.push(tpl.wideGap);
  } else if (input.minGapToTarget < 0) {
    saTasks.push(tpl.remainingGap);
  } else {
    flags.push('Melampaui Target Acuan');
    saTasks.push(tpl.exceedTarget);
  }
  traces.push({
    ruleId: 's2_gap',
    ruleName: `Band Gap Skor Terbobot (Batas ≤ ${th.wideWeightedGapPts})`,
    expression: `minGap (${input.minGapToTarget}) vs batas (${th.wideWeightedGapPts})`,
    matched: true,
    effect: isWideGap
      ? 'Gap lebar → fokus bangun komitmen tanpa memaksa turun prodi di CP1'
      : input.minGapToTarget < 0
      ? 'Gap moderat → bandingkan progres subtes bobot utama'
      : 'Sudah melampaui target → tawarkan eksplorasi Simulasi jika minat'
  });

  const lowSample = input.minParticipantsCount < th.minBenchmarkParticipants;
  const guardrailNote = lowSample
    ? tpl.lowParticipantsWarning
        .replace('{count}', String(input.minParticipantsCount))
        .replace('{limit}', String(th.minBenchmarkParticipants))
    : tpl.defaultBenchmarkNote;

  traces.push({
    ruleId: 's2_sample',
    ruleName: `Kecukupan Pembanding (< ${th.minBenchmarkParticipants})`,
    expression: `minParticipants (${input.minParticipantsCount}) < ${th.minBenchmarkParticipants}`,
    matched: lowSample,
    effect: lowSample
      ? 'Aktifkan peringatan jumlah pembanding terlalu kecil'
      : 'Pakai catatan standar acuan internal non-SNPMB'
  });

  return {
    conditionLabel: flags.join(' · '),
    observation: `Jarak skor terbobot terhadap target acuan berada pada rentang ${input.maxGapToTarget} s.d. ${input.minGapToTarget} poin.`,
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

  const isNoDrill = sub.drillQuestions === 0;
  const isLowVolLowAcc = !isNoDrill && sub.drillQuestions < th.drillLowQuestions && sub.drillAccuracyPct < th.drillLowAccuracyPct;
  const isActiveLowTo = !isNoDrill && !isLowVolLowAcc && sub.drillQuestions >= th.drillLowQuestions && sub.gapTo600 <= th.drillActiveHighGap;
  const isNearTarget = !isNoDrill && !isLowVolLowAcc && !isActiveLowTo && sub.gapTo600 >= th.nearTargetGapPts;

  let conditionId: Stage3ConditionId = 'general_gap';
  if (isNoDrill) conditionId = 'no_drill';
  else if (isLowVolLowAcc) conditionId = 'low_vol_low_acc';
  else if (isActiveLowTo) conditionId = 'active_drill_low_to';
  else if (isNearTarget) conditionId = 'near_target';

  const traces: RuleTrace[] = [
    {
      ruleId: 's3_r1_nodrill',
      ruleName: '1. Belum Ada Drill',
      expression: `drillQuestions (${sub.drillQuestions}) === 0`,
      matched: isNoDrill,
      effect: isNoDrill ? 'Terpilih: konfirmasi sumber luar tanpa label malas' : 'Lanjut cek aturan ke-2'
    },
    {
      ruleId: 's3_r2_lowvol',
      ruleName: '2. Volume & Akurasi Rendah',
      expression: `questions (${sub.drillQuestions}) < ${th.drillLowQuestions} && akurasi (${sub.drillAccuracyPct}%) < ${th.drillLowAccuracyPct}%`,
      matched: isLowVolLowAcc,
      effect: isLowVolLowAcc ? 'Terpilih: tinjau topik terendah & Klinik PR' : 'Lanjut cek aturan ke-3'
    },
    {
      ruleId: 's3_r3_active_gap',
      ruleName: '3. Drill Aktif Tapi Gap TO Lebar',
      expression: `questions (${sub.drillQuestions}) ≥ ${th.drillLowQuestions} && gap (${sub.gapTo600}) ≤ ${th.drillActiveHighGap}`,
      matched: isActiveLowTo,
      effect: isActiveLowTo ? 'Terpilih: evaluasi cara mengerjakan latihan vs TO' : 'Lanjut cek aturan ke-4'
    },
    {
      ruleId: 's3_r4_near',
      ruleName: '4. Mendekati Batas Target',
      expression: `gap (${sub.gapTo600}) ≥ ${th.nearTargetGapPts}`,
      matched: isNearTarget,
      effect: isNearTarget ? 'Terpilih: jaga ritme latihan stabilkan ≥ 600' : 'Fallback ke Penguatan Terarah'
    }
  ];

  const obsMap: Record<Stage3ConditionId, string> = {
    no_drill: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}), aktivitas drill di aplikasi tercatat 0 soal.`,
    low_vol_low_acc: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}); tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar).`,
    active_drill_low_to: `Tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar), namun skor TO ${sub.toLatest} (jarak ${sub.gapTo600}).`,
    near_target: `Skor ${sub.toLatest} (jarak ${sub.gapTo600} ke 600); tercatat ${sub.drillQuestions} soal (${sub.drillAccuracyPct}% benar).`,
    general_gap: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}); tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar).`
  };

  return {
    conditionId,
    conditionLabel: tpl[conditionId].label,
    observation: obsMap[conditionId],
    saTask: tpl[conditionId].saTask,
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
    ? `Terdeteksi ketimpangan fokus latihan: drill terbanyak ada di ${highestDrill.name} (${highestDrill.drillQuestions} soal), sedangkan ${zeroOrLowInPriority.map((s) => s.name).join(' & ')} baru ≤ ${th.drillMismatchLowQ} soal.`
    : null;

  const saTasks = [
    'Tinjau cara siswa memilih subtes saat berlatih di aplikasi dan pastikan apakah latihan diarahkan pada subtes dengan gap terbesar.',
    'Konfirmasi apakah ada latihan dari buku/sumber di luar aplikasi serta bagaimana siswa membahas soal yang dijawab salah.',
    'Sepakati 1–2 topik akurasi terendah yang akan diprioritaskan pada sesi Klinik PR cabang.'
  ];

  const traces: RuleTrace[] = [
    {
      ruleId: 's3_mismatch',
      ruleName: 'Deteksi Ketimpangan / Latihan Semu',
      expression: `maxDrill (${highestDrill?.drillQuestions ?? 0} ≥ ${th.drillMismatchHighQ}) && subtesGap≤${th.drillActiveHighGap}_drill≤${th.drillMismatchLowQ} (${zeroOrLowInPriority.length})`,
      matched: hasMismatch,
      effect: hasMismatch
        ? 'Munculkan alert ketimpangan drill agar fokus pindah ke subtes prioritas'
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

export interface Stage4Output {
  saTasks: string[];
  checklist: string[];
  traces: RuleTrace[];
}

export function analyzeStage4(
  hasConflictOrLocationCheck: boolean,
  hasMissingDrill: boolean,
  config: EngineRuleConfig = DEFAULT_ENGINE_CONFIG
): Stage4Output {
  const tpl = config.stage4Templates;
  const saTasks = [tpl.scheduleTask, tpl.parentSupportTask];

  if (hasMissingDrill) {
    saTasks.push(tpl.missingDrillTask);
  }
  if (hasConflictOrLocationCheck) {
    saTasks.push(tpl.conflictOrLocationTask);
  }

  const checklist = [
    'Jadwal hadir Klinik PR cabang minggu ini sudah disepakati bersama siswa.',
    'Ringkasan keputusan dan pengingat sesi berikutnya sudah ditulis di Catatan SA & diklik Simpan Draft.',
    'Buka Preview & Download PDF di bar atas (tombol Download PDF ada di dalam modal) untuk diserahkan ke keluarga.'
  ];

  const traces: RuleTrace[] = [
    {
      ruleId: 's4_drill',
      ruleName: 'Tindak Lanjut Drill Minim',
      expression: `hasMissingDrill = ${hasMissingDrill}`,
      matched: hasMissingDrill,
      effect: hasMissingDrill ? 'Tambahkan penguncian jadwal Klinik PR subtes minim drill' : 'Tidak dipicu'
    },
    {
      ruleId: 's4_prodi',
      ruleName: 'Pencatatan Konflik Prodi / Lokasi',
      expression: `hasConflictOrLocationCheck = ${hasConflictOrLocationCheck}`,
      matched: hasConflictOrLocationCheck,
      effect: hasConflictOrLocationCheck ? 'Tambahkan tugas pencatatan status prodi/lokasi untuk review berikut' : 'Tidak dipicu'
    }
  ];

  return { saTasks, checklist, traces };
}
