/**
 * Deterministic SA Guideline Engine (Non-AI-Centered)
 *
 * Translates raw tryout, drill, attendance, and program-choice metrics into
 * neutral observations and concrete SA facilitation tasks ("Bahas", "Bandingkan",
 * "Pastikan", "Konfirmasi") without inventing causes or forcing student decisions.
 *
 * Adapted and extended from `report-logic/tryout-wording.js` & `report-logic/report-insights.js`.
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
}

const PATTERN_TEMPLATES: Record<
  TryoutPattern,
  { label: string; student: string; parent: string; nextStep: string }
> = {
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
};

export function analyzeStage1(input: Stage1Input): Stage1Output {
  const tolerance = input.tolerance ?? 0;
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
    steady_flat: `Skor sama pada setiap perpindahan hasil (${a}).`,
    up_with_pauses: `Skor cenderung naik (${a} → ${b}), diselingi hasil yang sama.`,
    down_with_pauses: `Skor cenderung turun (${a} → ${b}), diselingi hasil yang sama.`,
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
  const aboveCount = input.subtestRows.filter((s) => s.toLatest >= 600).length;
  const totalSub = input.subtestRows.length;

  if (totalSub > 0 && aboveCount === totalSub) {
    extraNotes.push('Seluruh subtes telah mencapai batas acuan ≥ 600. Fokus pembahasan dapat diarahkan ke pemantapan subtes berbobot prodi.');
  } else if (totalSub > 0 && aboveCount > 0) {
    extraNotes.push(`Terdapat ${aboveCount} dari ${totalSub} subtes di atas 600. Soroti kekuatan tersebut sebelum membahas subtes dengan gap terbesar.`);
  } else if (totalSub > 0) {
    extraNotes.push('Belum ada subtes yang menyentuh 600. Jadikan target bertahap tiap subtes sebagai fokus awal.');
  }

  const extremeSubtests = input.subtestRows.filter(
    (s) => s.scores.length >= 2 && Math.max(...s.scores) - Math.min(...s.scores) >= 100
  );
  if (extremeSubtests.length > 0) {
    extraNotes.push(
      `Terdapat fluktuasi ≥ 100 poin pada ${extremeSubtests.map((s) => s.name).slice(0, 2).join(', ')}. Gunakan nilai Median pribadi siswa untuk melihat performa tipikal.`
    );
  }

  if (input.attendanceRatePct < 80) {
    extraNotes.push(`Kehadiran kelas tercatat ${input.attendanceRatePct}% (< 80%). Konfirmasi kendala jadwal atau kehadiran sebelum menyusun target baru.`);
  }

  const tpl = PATTERN_TEMPLATES[pattern];
  return {
    pattern,
    patternLabel: tpl.label,
    observation,
    studentTask: tpl.student,
    parentTask: tpl.parent,
    nextStep: tpl.nextStep,
    extraNotes
  };
}

export interface Stage2Input {
  hasMixedRumpun: boolean;
  familyAlignment: 'aligned' | 'different_major' | 'location_limit' | 'unconfirmed';
  minGapToTarget: number; // e.g. -95
  maxGapToTarget: number; // e.g. -156
  minParticipantsCount: number; // e.g. 41
}

export interface Stage2Output {
  conditionLabel: string;
  observation: string;
  saTasks: string[];
  guardrailNote: string;
}

export function analyzeStage2(input: Stage2Input): Stage2Output {
  const saTasks: string[] = [];
  const flags: string[] = [];

  if (input.hasMixedRumpun || input.familyAlignment === 'different_major') {
    flags.push('Rumpun Campuran / Perbedaan Pilihan');
    saTasks.push(
      'Konfirmasi minat utama siswa dan harapan orang tua antarprodi yang berbeda rumpun sebelum membahas alternatif atau cadangan.'
    );
  } else if (input.familyAlignment === 'aligned') {
    flags.push('Pilihan Selaras');
    saTasks.push(
      'Konfirmasi apakah urutan Pilihan 1–3 masih menjadi prioritas utama siswa dan keluarga.'
    );
  } else {
    flags.push('Perlu Konfirmasi Keluarga');
    saTasks.push(
      'Pastikan apakah pilihan yang tercatat sudah didiskusikan bersama orang tua dan sesuai dengan minat siswa.'
    );
  }

  if (input.familyAlignment === 'location_limit' || input.hasMixedRumpun) {
    saTasks.push(
      'Pastikan kesepakatan batasan lokasi kampus (izin kuliah luar kota, biaya, dan preferensi wilayah keluarga).'
    );
  }

  if (input.minGapToTarget <= -100) {
    flags.push('Gap Masih Lebar');
    saTasks.push(
      'Bahas kesiapan komitmen latihan untuk memperkecil gap secara bertahap; hindari memaksa penurunan target prodi di Checkpoint 1 sebelum pondasi subtes dibenahi.'
    );
  } else if (input.minGapToTarget < 0) {
    saTasks.push(
      'Bandingkan progres subtes penentu bobot jurusan dengan gap yang tersisa menuju checkpoint berikutnya.'
    );
  } else {
    flags.push('Melampaui Target Acuan');
    saTasks.push(
      'Bahas strategi menjaga konsistensi skor dan tinjau apakah siswa ingin membandingkan opsi alternatif melalui Simulasi.'
    );
  }

  const benchmarkWarning =
    input.minParticipantsCount < 500
      ? `Data pembanding internal di bawah 500 peserta (min. ${input.minParticipantsCount} pemilih); jangan dipakai sebagai klaim posisi aman maupun jaminan SNPMB.`
      : 'Angka target skor adalah acuan latihan internal Ruangguru, bukan passing grade resmi SNPMB atau jaminan kelolosan.';

  return {
    conditionLabel: flags.join(' · '),
    observation: `Jarak skor terbobot terhadap target acuan berada pada rentang ${input.maxGapToTarget} s.d. ${input.minGapToTarget} poin.`,
    saTasks,
    guardrailNote: benchmarkWarning
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
  conditionId: 'no_drill' | 'low_vol_low_acc' | 'active_drill_low_to' | 'near_target' | 'general_gap';
  conditionLabel: string;
  observation: string;
  saTask: string;
}

export function analyzeStage3Subtest(sub: Stage3SubtestInput): Stage3SubtestOutput {
  if (sub.drillQuestions === 0) {
    return {
      conditionId: 'no_drill',
      conditionLabel: 'Belum Ada Data Drill Aplikasi',
      observation: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}), aktivitas drill di aplikasi tercatat 0 soal.`,
      saTask:
        'Konfirmasi apakah siswa berlatih dari sumber luar aplikasi atau menemui kendala membuka drill, tanpa menyimpulkan siswa belum belajar.'
    };
  }
  if (sub.drillQuestions < 15 && sub.drillAccuracyPct < 50) {
    return {
      conditionId: 'low_vol_low_acc',
      conditionLabel: 'Volume Terbatas & Akurasi Rendah',
      observation: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}); tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar).`,
      saTask:
        'Tinjau topik akurasi terendah bersama siswa dan bahas rencana penguatan konsep dasar di Klinik PR.'
    };
  }
  if (sub.drillQuestions >= 15 && sub.gapTo600 <= -90) {
    return {
      conditionId: 'active_drill_low_to',
      conditionLabel: 'Drill Aktif · Gap TO Masih Lebar',
      observation: `Tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar), namun skor TO ${sub.toLatest} (jarak ${sub.gapTo600}).`,
      saTask:
        'Bandingkan cara siswa mengerjakan latihan vs saat tryout (manajemen waktu, ketelitian premis, atau variasi soal).'
    };
  }
  if (sub.gapTo600 >= -30) {
    return {
      conditionId: 'near_target',
      conditionLabel: 'Mendekati Batas 600',
      observation: `Skor ${sub.toLatest} (jarak ${sub.gapTo600} ke 600); tercatat ${sub.drillQuestions} soal (${sub.drillAccuracyPct}% benar).`,
      saTask:
        'Pertahankan ritme latihan pada topik yang masih salah agar stabil melampaui 600.'
    };
  }
  return {
    conditionId: 'general_gap',
    conditionLabel: 'Perlu Penguatan Terarah',
    observation: `Skor ${sub.toLatest} (jarak ${sub.gapTo600}); tercatat ${sub.drillQuestions} soal (${sub.drillSessions} sesi, ${sub.drillAccuracyPct}% benar).`,
    saTask:
      'Bahas kendala pada topik terlemah serta kecocokan topik yang dilatih di aplikasi.'
  };
}

export interface Stage3OverallOutput {
  hasDrillMismatch: boolean;
  mismatchNote: string | null;
  saTasks: string[];
  guardrailNote: string;
}

export function analyzeStage3Overall(subtests: Stage3SubtestInput[]): Stage3OverallOutput {
  const sortedByQuestions = [...subtests].sort((a, b) => b.drillQuestions - a.drillQuestions);
  const highestDrill = sortedByQuestions[0];
  const zeroOrLowInPriority = subtests.filter((s) => s.gapTo600 <= -90 && s.drillQuestions <= 5);

  const hasMismatch = Boolean(
    highestDrill && highestDrill.drillQuestions >= 20 && zeroOrLowInPriority.length > 0
  );

  const mismatchNote = hasMismatch
    ? `Terdeteksi ketimpangan fokus latihan: drill terbanyak ada di ${highestDrill.name} (${highestDrill.drillQuestions} soal), sedangkan ${zeroOrLowInPriority.map((s) => s.name).join(' & ')} baru ≤ 5 soal.`
    : null;

  const saTasks = [
    'Tinjau cara siswa memilih subtes saat berlatih di aplikasi dan pastikan apakah latihan diarahkan pada subtes dengan gap terbesar.',
    'Konfirmasi apakah ada latihan dari buku/sumber di luar aplikasi serta bagaimana siswa membahas soal yang dijawab salah.',
    'Sepakati 1–2 topik akurasi terendah yang akan diprioritaskan pada sesi Klinik PR cabang.'
  ];

  return {
    hasDrillMismatch: hasMismatch,
    mismatchNote,
    saTasks,
    guardrailNote:
      '1 sesi dapat tercatat meskipun kurang dari 10 soal. Selalu baca jumlah sesi bersama total butir soal & akurasinya, dan jangan memarahi siswa saat data aplikasi bernilai 0.'
  };
}

export interface Stage4Output {
  saTasks: string[];
  checklist: string[];
}

export function analyzeStage4(hasConflictOrLocationCheck: boolean, hasMissingDrill: boolean): Stage4Output {
  const saTasks = [
    'Konfirmasi hari, jam, dan target latihan harian yang realistis dijalankan siswa tanpa bentrok jadwal sekolah.',
    'Bahas bentuk dukungan dan pemantauan belajar yang paling nyaman dilakukan orang tua di rumah.'
  ];

  if (hasMissingDrill) {
    saTasks.push('Pastikan jadwal dan topik spesifik Klinik PR untuk subtes dengan data drill masih minim.');
  }
  if (hasConflictOrLocationCheck) {
    saTasks.push('Catat poin pilihan prodi atau batasan lokasi yang belum final agar dapat dicek ulang pada sesi berikutnya.');
  }

  const checklist = [
    'Jadwal hadir Klinik PR cabang minggu ini sudah disepakati bersama siswa.',
    'Ringkasan keputusan dan pengingat sesi berikutnya sudah ditulis di Catatan SA & diklik Simpan Draft.',
    'Buka Preview & Download PDF di bar atas (tombol Download PDF ada di dalam modal) untuk diserahkan ke keluarga.'
  ];

  return { saTasks, checklist };
}
