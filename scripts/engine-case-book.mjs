#!/usr/bin/env node
/**
 * Buku Kasus Engine Aturan (untuk review Tim Kesiswaan / Akademik).
 *
 * Menjalankan engine deterministik (src/utils/saGuidelineEngine.ts, tanpa AI) pada daftar skenario
 * tetap, lalu menulis tabel CSV: tiap baris = satu skenario + output lengkap yang akan tampil di laporan.
 * Skenario mencakup setiap aturan minimal sekali dan kasus tepat di batas ambang (dihitung dari
 * ambang bawaan, jadi tetap valid bila ambang bawaan berubah).
 *
 *   npm run casebook          -> review/buku-kasus-engine.csv
 *
 * Skrip memakai konfigurasi BAWAAN (DEFAULT_ENGINE_CONFIG), bukan hasil edit di localStorage browser.
 * Keluar dengan kode 1 bila ada aturan yang tidak tercakup skenario atau pola contoh tidak sesuai.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---- muat engine langsung dari .ts (butuh Node 22.18+ / 24, type stripping bawaan) ----
let E;
try {
  E = await import(pathToFileURL(path.join(root, 'src/utils/saGuidelineEngine.ts')).href);
} catch (err) {
  console.error(`Gagal memuat engine .ts. Pakai Node 22.18 atau lebih baru (sekarang ${process.version}).\n${err.message}`);
  process.exit(2);
}

const cfg = E.DEFAULT_ENGINE_CONFIG;
const TH = cfg.thresholds;
const TPL2 = cfg.stage2Templates;
const TPL4 = cfg.stage4Templates;

// ---- util ----
const rows = [];
const covered = new Set();
const problems = [];
const bullets = (arr) => arr.filter(Boolean).map((l) => `• ${l}`).join('\n');
const sgn = (n) => (n > 0 ? `+${n}` : String(n));
const matchedIds = (traces) => traces.filter((t) => t.matched).map((t) => t.ruleId).join(', ') || '-';

function add(stage, test, input, outputLines, traces, covers) {
  const id = `K${String(rows.length + 1).padStart(3, '0')}`;
  covers.forEach((c) => covered.add(c));
  rows.push([id, stage, test, input, bullets(outputLines), matchedIds(traces), '', '', '']);
}

const SUB_NAMES = ['PU', 'PK', 'PM', 'LBI-A', 'LBI-S', 'PBM', 'LBE', 'PPU'];
const subRows = (latests, swing) =>
  latests.map((v, i) => ({
    id: SUB_NAMES[i].toLowerCase(),
    name: SUB_NAMES[i],
    scores: swing && i === 0 ? [v, v + swing] : [v],
    toLatest: swing && i === 0 ? v + swing : v
  }));

// =====================================================================
// TAHAP 1 — Evaluasi Tryout
// =====================================================================
const MIXED_SUBS = subRows([640, 610, 560, 540, 520, 500, 480, 450]);

function runS1(test, scores, rowsIn, attendance, expectPattern) {
  const out = E.analyzeStage1({ toScores: scores, subtestRows: rowsIn, attendanceRatePct: attendance }, cfg);
  if (expectPattern && out.pattern !== expectPattern) {
    problems.push(`Pola contoh tidak sesuai: ${test} -> diharapkan ${expectPattern}, hasil ${out.pattern}`);
  }
  const notes = out.extraNotes;
  const covers = [`T1 pola: ${out.pattern}`];
  if (notes.some((n) => n.startsWith('Seluruh subtes saat ini masih'))) covers.push('T1 fondasi: semua < 500');
  if (notes.some((n) => n.startsWith('Seluruh subtes telah mencapai'))) covers.push('T1 fondasi: semua >= target');
  if (notes.some((n) => n.startsWith('Terdapat ') && n.includes('di atas'))) covers.push('T1 fondasi: sebagian >= target');
  if (notes.some((n) => n.startsWith('Belum ada subtes yang menyentuh'))) covers.push('T1 fondasi: belum ada >= target');
  if (notes.some((n) => n.includes('fluktuasi'))) covers.push('T1 fluktuasi subtes');
  if (notes.some((n) => n.startsWith('Kehadiran kelas tercatat'))) covers.push('T1 kehadiran rendah');
  add(
    'T1 Evaluasi TO',
    test,
    `Skor TO: ${scores.length ? scores.join(' → ') : '(kosong)'}; kehadiran ${attendance}%; ${rowsIn.length} subtes`,
    [
      `Observasi: ${out.observation}`,
      `Tugas siswa: ${out.studentTask}`,
      `Tugas orang tua: ${out.parentTask}`,
      `Tindak lanjut: ${out.nextStep}`,
      ...notes.map((n) => `Catatan tambahan: ${n}`)
    ],
    out.traces,
    covers
  );
}

const PATTERN_CASES = [
  ['no_data', []],
  ['one_result', [518]],
  ['initial_up', [530, 565]],
  ['initial_down', [570, 535]],
  ['initial_flat', [550, 553]],
  ['steady_up', [520, 545, 575, 602]],
  ['steady_down', [601, 576, 561, 546]],
  ['steady_flat', [552, 554, 550, 553]],
  ['up_with_pauses', [530, 532, 565, 590]],
  ['down_with_pauses', [590, 560, 558, 532]],
  ['recovery', [590, 552, 540, 586]],
  ['reversal_down', [530, 575, 595, 555]],
  ['fluctuating_up', [580, 540, 575, 610]],
  ['fluctuating_down', [540, 580, 545, 520]],
  ['fluctuating_flat', [560, 520, 540, 562]]
];
for (const [pattern, scores] of PATTERN_CASES) {
  runS1(`Pola TO: ${cfg.patternTemplates[pattern].label}`, scores, pattern === 'no_data' ? [] : MIXED_SUBS, 90, pattern);
}
runS1(`Batas toleransi: selisih tepat +${TH.toTolerancePts} dianggap datar`, [500, 500 + TH.toTolerancePts], MIXED_SUBS, 90, 'initial_flat');
runS1(`Batas toleransi: selisih +${TH.toTolerancePts + 1} dianggap naik`, [500, 500 + TH.toTolerancePts + 1], MIXED_SUBS, 90, 'initial_up');

const STEADY = [520, 545, 575, 602];
runS1('Fondasi: semua subtes < 500', STEADY, subRows([450, 430, 480, 470, 440, 490, 460, 420]), 90);
runS1(`Fondasi: semua subtes ≥ ${TH.foundationScoreTarget}`, STEADY, subRows(Array(8).fill(TH.foundationScoreTarget + 20)), 90);
runS1(`Fondasi: sebagian subtes ≥ ${TH.foundationScoreTarget}`, STEADY, MIXED_SUBS, 90);
runS1(`Fondasi: belum ada yang ≥ ${TH.foundationScoreTarget} (tapi tidak semua < 500)`, STEADY, subRows([580, 560, 540, 520, 500, 480, 460, 440]), 90);
runS1(`Fluktuasi subtes tepat ${TH.subtestSwingPts} poin`, STEADY, subRows([500, 520, 540, 560, 580, 500, 520, 540], TH.subtestSwingPts), 90);
runS1(`Fluktuasi subtes ${TH.subtestSwingPts - 1} poin (di bawah batas)`, STEADY, subRows([500, 520, 540, 560, 580, 500, 520, 540], TH.subtestSwingPts - 1), 90);
runS1(`Kehadiran tepat ${TH.attendanceWarnPct}% (tidak memicu)`, STEADY, MIXED_SUBS, TH.attendanceWarnPct);
runS1(`Kehadiran ${TH.attendanceWarnPct - 0.1}% (memicu)`, STEADY, MIXED_SUBS, TH.attendanceWarnPct - 0.1);

// =====================================================================
// TAHAP 2 — Analisis Jurusan
// =====================================================================
const prog = (gap, extra = {}) => ({
  priority: 'Pilihan 1',
  prodi: 'Prodi Contoh',
  univ: 'Kampus Contoh',
  rumpun: 'saintek',
  city: 'Depok',
  gap,
  participantsCount: TH.minBenchmarkParticipants + 300,
  ...extra
});

function runS2(test, input, describe) {
  const out = E.analyzeStage2({ studentHomeCity: 'Depok', ...input }, cfg);
  const t = out.saTasks;
  const covers = [];
  if (t.includes(TPL2.mixedOrDifferent)) covers.push('T2 keselarasan: konflik/campuran');
  else if (t.includes(TPL2.aligned)) covers.push('T2 keselarasan: selaras');
  else if (t.includes(TPL2.unconfirmed)) covers.push('T2 keselarasan: belum konfirmasi');
  if (t.includes(TPL2.locationCheck)) covers.push('T2 cek lokasi');
  if (t.includes(TPL2.wideGap)) covers.push('T2 gap: lebar');
  else if (t.includes(TPL2.remainingGap)) covers.push('T2 gap: moderat');
  else if (t.includes(TPL2.exceedTarget)) covers.push('T2 gap: melampaui');
  else covers.push('T2 gap: tidak diketahui');
  covers.push(out.guardrailNote === TPL2.defaultBenchmarkNote ? 'T2 pembanding: cukup' : 'T2 pembanding: sedikit');
  add(
    'T2 Analisis Jurusan',
    test,
    describe,
    [`Label kondisi: ${out.conditionLabel}`, `Observasi: ${out.observation}`, ...t.map((x) => `Tugas SA: ${x}`), `Catatan acuan: ${out.guardrailNote}`],
    out.traces,
    covers
  );
}

const W = TH.wideWeightedGapPts;
runS2('Melampaui target (gap +20)', { familyAlignment: 'aligned', programs: [prog(20)] }, 'Pilihan selaras; gap +20; 1 prodi');
runS2('Tepat di target (gap 0)', { familyAlignment: 'aligned', programs: [prog(0)] }, 'Pilihan selaras; gap 0');
runS2('Gap moderat (gap -1)', { familyAlignment: 'aligned', programs: [prog(-1)] }, 'Pilihan selaras; gap -1');
runS2(`Satu poin di atas batas lebar (gap ${W + 1})`, { familyAlignment: 'aligned', programs: [prog(W + 1)] }, `Pilihan selaras; gap ${W + 1}`);
runS2(`Tepat di batas lebar (gap ${W})`, { familyAlignment: 'aligned', programs: [prog(W)] }, `Pilihan selaras; gap ${W}`);
runS2('Gap sangat lebar (gap -135)', { familyAlignment: 'aligned', programs: [prog(-135)] }, 'Pilihan selaras; gap -135');
runS2('Belum konfirmasi keluarga', { familyAlignment: 'unconfirmed', programs: [prog(-50)] }, 'Belum konfirmasi; gap -50');
runS2('Orang tua memilih jurusan berbeda', { familyAlignment: 'different_major', programs: [prog(-50)] }, 'Beda jurusan; gap -50');
runS2('Keluarga membatasi lokasi', { familyAlignment: 'location_limit', programs: [prog(-50)] }, 'Batas lokasi; gap -50');
runS2('Prodi di luar kota asal', { familyAlignment: 'aligned', programs: [prog(-50, { city: 'Bandung' })] }, 'Selaras; prodi di Bandung, siswa di Depok; gap -50');
runS2('Rumpun campuran (Saintek + Soshum)', { familyAlignment: 'aligned', programs: [prog(-50), prog(-20, { rumpun: 'soshum', prodi: 'Prodi Soshum' })] }, 'Selaras; 2 prodi beda rumpun');
runS2('Gap berbeda antar pilihan (memakai yang terendah)', { familyAlignment: 'aligned', programs: [prog(-20), prog(W - 5), prog(10)] }, `3 pilihan, gap -20 / ${W - 5} / +10`);
runS2(`Pembanding tepat ${TH.minBenchmarkParticipants} peserta (cukup)`, { familyAlignment: 'aligned', programs: [prog(-50, { participantsCount: TH.minBenchmarkParticipants })] }, `Peserta ${TH.minBenchmarkParticipants}`);
runS2(`Pembanding ${TH.minBenchmarkParticipants - 1} peserta (sedikit)`, { familyAlignment: 'aligned', programs: [prog(-50, { participantsCount: TH.minBenchmarkParticipants - 1 })] }, `Peserta ${TH.minBenchmarkParticipants - 1}`);
runS2('Data gap kosong', { familyAlignment: 'aligned', programs: [{ priority: 'Pilihan 1', prodi: 'Prodi Contoh', univ: 'Kampus Contoh', rumpun: 'saintek', city: 'Depok' }] }, 'Selaras; gap dan peserta tidak tersedia');

// laju kenaikan per TO (Plan B)
function runPacing(test, gap) {
  const target = 700;
  const out = E.computeProgramPacing(target + gap, target, gap, cfg);
  add(
    'T2 Laju per TO',
    test,
    `Target acuan ${target}; skor terbobot ${target + gap}; gap ${gap}`,
    [
      out.isAchieved
        ? 'Target sudah tercapai (tanpa kenaikan per TO)'
        : `Kenaikan per TO ke konsultasi berikutnya: +${out.gainPerToNextConsult}; per TO sampai UTBK: +${out.gainPerToUtbk}`,
      `Sinyal Plan B: ${out.needsPlanB ? 'ya' : 'tidak'} (batas > ${TH.planBGainThresholdPts} poin/TO)`
    ],
    [{ ruleId: 'pacing_planB', matched: out.needsPlanB }],
    [out.needsPlanB ? 'T2 laju: Plan B ya' : 'T2 laju: Plan B tidak']
  );
}
runPacing('Sudah tercapai', 0);
runPacing('Gap kecil', -30);
runPacing(`Kenaikan tepat ${TH.planBGainThresholdPts} poin/TO (belum Plan B)`, -TH.planBGainThresholdPts * TH.remainingEpisodesToNextConsult);
runPacing(`Kenaikan ${TH.planBGainThresholdPts + 1} poin/TO (Plan B)`, -(TH.planBGainThresholdPts * TH.remainingEpisodesToNextConsult + 1));

// =====================================================================
// TAHAP 3 — Subtes & Drill
// =====================================================================
function runS3(test, gap, q, sessions, acc) {
  const sub = { id: 'pk', name: 'PK', toLatest: 600 + gap, gapTo600: gap, drillQuestions: q, drillSessions: sessions, drillAccuracyPct: acc };
  const out = E.analyzeStage3Subtest(sub, cfg);
  add(
    'T3 Subtes & Drill',
    test,
    `Skor TO ${600 + gap} (selisih ${sgn(gap)}); drill ${q} soal, ${sessions} sesi, akurasi ${acc}%`,
    [`Kondisi: ${out.conditionLabel}`, `Observasi: ${out.observation}`, `Tugas SA: ${out.saTask}`],
    out.traces,
    [`T3 kondisi: ${out.conditionId}`]
  );
}
runS3('Sudah ≥ target', 15, 30, 6, 80);
runS3('Belum ada data drill', -80, 0, 0, 0);
runS3('Volume dan akurasi rendah', -60, TH.drillLowQuestions - 1, 2, TH.drillLowAccuracyPct - 1);
runS3(`Batas volume: tepat ${TH.drillLowQuestions} soal (tidak lagi "volume rendah")`, -60, TH.drillLowQuestions, 3, TH.drillLowAccuracyPct - 1);
runS3(`Batas akurasi: tepat ${TH.drillLowAccuracyPct}% (tidak lagi "akurasi rendah")`, -60, TH.drillLowQuestions - 1, 2, TH.drillLowAccuracyPct);
runS3('Akurasi tinggi, selisih TO masih ada (tepat di ketiga batas)', TH.drillHighAccGapPts, TH.drillHighAccQuestions, 5, TH.drillHighAccuracyPct);
runS3('Akurasi tinggi tapi soal 1 di bawah batas (tidak masuk kondisi)', TH.drillHighAccGapPts, TH.drillHighAccQuestions - 1, 5, TH.drillHighAccuracyPct);
runS3('Akurasi 1% di bawah batas (tidak masuk kondisi akurasi tinggi)', TH.drillHighAccGapPts, TH.drillHighAccQuestions, 5, TH.drillHighAccuracyPct - 1);
runS3('Selisih 1 poin di atas batas (tidak masuk kondisi akurasi tinggi)', TH.drillHighAccGapPts + 1, TH.drillHighAccQuestions, 5, TH.drillHighAccuracyPct);
runS3('Akurasi tinggi dan selisih sangat lebar (kondisi akurasi tinggi menang atas drill aktif)', TH.drillActiveHighGap - 20, 30, 6, 80);
runS3('Drill aktif, selisih lebar', TH.drillActiveHighGap - 10, 30, 6, 55);
runS3(`Batas selisih lebar: tepat ${TH.drillActiveHighGap}`, TH.drillActiveHighGap, TH.drillLowQuestions, 3, 55);
runS3(`Batas selisih lebar: ${TH.drillActiveHighGap + 1} (tidak lagi "drill aktif")`, TH.drillActiveHighGap + 1, TH.drillLowQuestions, 3, 55);
runS3(`Mendekati target: tepat ${TH.nearTargetGapPts}`, TH.nearTargetGapPts, 20, 4, 60);
runS3(`Batas mendekati target: ${TH.nearTargetGapPts - 1} (tidak lagi "dekat")`, TH.nearTargetGapPts - 1, 20, 4, 60);
runS3('Selisih menengah, drill cukup (kondisi umum)', -60, 20, 4, 60);

function runS3Overall(test, subs) {
  const input = subs.map(([name, gap, q]) => ({ id: name.toLowerCase(), name, toLatest: 600 + gap, gapTo600: gap, drillQuestions: q, drillSessions: Math.min(q, 5), drillAccuracyPct: 60 }));
  const out = E.analyzeStage3Overall(input, cfg);
  add(
    'T3 Audit Drill Keseluruhan',
    test,
    input.map((s) => `${s.name}: selisih ${sgn(s.gapTo600)}, ${s.drillQuestions} soal`).join('; '),
    [`Temuan ketimpangan: ${out.mismatchNote ?? '(tidak ada)'}`, ...out.saTasks.map((x) => `Tugas SA: ${x}`), `Catatan acuan: ${out.guardrailNote}`],
    out.traces,
    [out.hasDrillMismatch ? 'T3 ketimpangan: ya' : 'T3 ketimpangan: tidak']
  );
}
runS3Overall('Ketimpangan terdeteksi', [['PU', -20, TH.drillMismatchHighQ], ['PK', TH.drillActiveHighGap - 30, TH.drillMismatchLowQ]]);
runS3Overall(`Drill terbanyak ${TH.drillMismatchHighQ - 1} soal (di bawah batas)`, [['PU', -20, TH.drillMismatchHighQ - 1], ['PK', TH.drillActiveHighGap - 30, TH.drillMismatchLowQ]]);
runS3Overall(`Subtes prioritas ${TH.drillMismatchLowQ + 1} soal (di atas batas)`, [['PU', -20, TH.drillMismatchHighQ], ['PK', TH.drillActiveHighGap - 30, TH.drillMismatchLowQ + 1]]);
runS3Overall(`Selisih ${TH.drillActiveHighGap + 1} (belum masuk subtes prioritas)`, [['PU', -20, TH.drillMismatchHighQ], ['PK', TH.drillActiveHighGap + 1, 0]]);

// =====================================================================
// TAHAP 4 — Kelas TMB & catatan pengajar
// =====================================================================
function runClass(test, total, present, sick, excused, notes) {
  const out = E.analyzeStageClassroom({ totalSessions: total, presentSessions: present, lateSessions: 0, sickSessions: sick, excusedSessions: excused, notesCount: notes }, cfg);
  const covers = [];
  const t = out.saTasks.join(' ');
  if (total === 0) covers.push('T4 kelas: belum ada sesi');
  else if (t.includes('Gali kendala jadwal, kesehatan')) covers.push('T4 kelas: kehadiran rendah');
  else covers.push('T4 kelas: kehadiran baik');
  if (t.includes('mengejar materi')) covers.push('T4 kelas: sesi terlewat >= 5');
  if (t.includes('Belum ada catatan tertulis pengajar')) covers.push('T4 kelas: catatan 0');
  else if (t.includes('Jangan menyimpulkan siswa pasif')) covers.push('T4 kelas: catatan < 25%');
  covers.push(out.guardrailNote.startsWith('Seluruh') ? 'T4 kelas: semua sesi punya catatan' : 'T4 kelas: ada sesi tanpa catatan');
  add(
    'T4 Kelas TMB & Catatan',
    test,
    `${total} sesi; hadir ${present}; sakit ${sick}; izin ${excused}; catatan ${notes}`,
    [...out.saTasks.map((x) => `Tugas SA: ${x}`), `Catatan acuan: ${out.guardrailNote}`],
    out.traces,
    covers
  );
}
runClass('Belum ada sesi kelas', 0, 0, 0, 0, 0);
runClass('Kehadiran rendah', 44, 30, 3, 2, 20);
runClass(`Kehadiran tepat ${TH.attendanceWarnPct}% (tidak memicu)`, 100, TH.attendanceWarnPct, 0, 0, 50);
runClass(`Kehadiran ${TH.attendanceWarnPct - 1}% (memicu)`, 100, TH.attendanceWarnPct - 1, 0, 0, 50);
runClass('Kehadiran baik, sebagian sesi belum ada catatan', 44, 40, 1, 1, 30);
runClass('Kehadiran baik, semua sesi punya catatan', 44, 44, 0, 0, 44);
runClass(`Sakit + izin ${TH.absenceWarnSessions - 1} sesi (di bawah batas)`, 44, 38, 2, TH.absenceWarnSessions - 3, 30);
runClass(`Sakit + izin ${TH.absenceWarnSessions} sesi (memicu)`, 44, 37, 3, TH.absenceWarnSessions - 3, 30);
runClass('Belum ada catatan pengajar', 44, 40, 1, 1, 0);
runClass(`Catatan di bawah batas ${TH.notesLowCoveragePct}% (memicu)`, 44, 40, 1, 1, Math.ceil((44 * TH.notesLowCoveragePct) / 100) - 1);
runClass(`Catatan tepat ${TH.notesLowCoveragePct}% (tidak memicu)`, 44, 40, 1, 1, Math.ceil((44 * TH.notesLowCoveragePct) / 100));

// =====================================================================
// TAHAP 5 — Rencana aksi & penutupan
// =====================================================================
const SUBS8 = (vals) => ['PU', 'PK', 'PM', 'LBI-A', 'LBI-S', 'PBM', 'LBE', 'PPU'].map((name, i) => ({ name, to4: vals[i], gap: vals[i] - TH.foundationScoreTarget }));
const NAMES = { studentName: 'Siswa Contoh', saName: 'Kakak Asuh Contoh', parentName: 'Orang Tua Contoh' };

function runS5(test, flags, subtests, episode = 4) {
  const out = E.analyzeStage4(
    { ...NAMES, hasConflictOrLocationCheck: flags.conflict, hasMissingDrill: flags.missing, nextEpisode: episode + 1, planData: { subtests, branch: 'Depok - Margonda', avgScore: 546, episode, needsPlanB: true } },
    cfg
  );
  const covers = [];
  const weak = subtests.filter((x) => x.to4 < TH.foundationScoreTarget).length;
  covers.push(weak === 0 ? 'T5 rencana: semua subtes tercapai' : 'T5 rencana: ada subtes di bawah target');
  if (weak > 0) covers.push(weak >= 4 ? 'T5 rencana: minimal per subtes berlaku' : 'T5 rencana: pembagian merata');
  if (out.saTasks.includes(TPL4.missingDrillTask)) covers.push('T5 tugas: subtes minim drill');
  if (out.saTasks.includes(TPL4.conflictOrLocationTask)) covers.push('T5 tugas: konflik/lokasi');
  add(
    'T5 Rencana Aksi',
    test,
    `Konflik/lokasi: ${flags.conflict ? 'ya' : 'tidak'}; subtes minim drill: ${flags.missing ? 'ya' : 'tidak'}; skor TO4 per subtes: ${subtests.map((x) => `${x.name} ${x.to4}`).join(', ')}; episode ${episode}`,
    [
      ...out.saTasks.map((x) => `Tugas SA: ${x}`),
      ...out.actionPlans.map((a) => `Rencana ${a.num} — ${a.title}: ${a.desc} [PIC dashboard: ${a.pic}]`)
    ],
    out.traces,
    covers
  );
}
runS5('Dasar: 7 subtes di bawah target (pembagian dikunci minimal per subtes)', { conflict: false, missing: false }, SUBS8([465, 488, 597, 505, 573, 554, 543, 640]));
runS5('3 subtes di bawah target (pembagian merata)', { conflict: false, missing: false }, SUBS8([480, 590, 610, 620, 700, 640, 630, 650]));
runS5('1 subtes di bawah target', { conflict: false, missing: false }, SUBS8([590, 610, 620, 630, 650, 640, 700, 660]));
runS5('Ada konflik/lokasi', { conflict: true, missing: false }, SUBS8([465, 488, 597, 505, 573, 554, 543, 640]));
runS5('Ada subtes minim drill', { conflict: false, missing: true }, SUBS8([465, 488, 597, 505, 573, 554, 543, 640]));
runS5('Konflik/lokasi dan minim drill', { conflict: true, missing: true }, SUBS8([465, 488, 597, 505, 573, 554, 543, 640]));
runS5('Semua subtes tercapai', { conflict: false, missing: false }, SUBS8([620, 640, 650, 700, 660, 680, 690, 710]));
runS5('Nomor TO berbeda (episode 6)', { conflict: false, missing: false }, SUBS8([465, 488, 597, 505, 573, 554, 543, 640]), 6);

// =====================================================================
// Arahan di bawah kotak Catatan Kakak Asuh (internal SA)
// =====================================================================
function runGuidance(test, input) {
  const out = E.analyzeNotesGuidance(input, cfg);
  const g = cfg.notesGuidanceTemplates;
  const covers = [];
  const has = (tpl) => {
    const head = tpl.split('{')[0];
    return out.lines.some((l) => l.startsWith(head));
  };
  const nConditional = out.lines.length - E.splitLines(g.points).length - (out.lines.includes(g.fallbackLine) ? 1 : 0);
  if (out.lines.includes(g.fallbackLine)) covers.push('T5 arahan: pengganti');
  if (has(g.conflictLine)) covers.push('T5 arahan: konflik');
  if (has(g.missingDrillLine)) covers.push('T5 arahan: minim drill');
  if (has(g.lowAttendanceLine)) covers.push('T5 arahan: kehadiran rendah');
  if (has(g.allAchievedLine)) covers.push('T5 arahan: semua tercapai');
  if (nConditional === 2) covers.push('T5 arahan: dibatasi 2 baris');
  add(
    'T5 Arahan Catatan Kakak Asuh (sementara tidak ditampilkan)',
    test,
    `Siswa: ${input.studentName}; konflik/lokasi: ${input.hasConflictOrLocationCheck ? 'ya' : 'tidak'}; subtes minim drill: ${input.minDrillSubtests.join(', ') || '(tidak ada)'}; kehadiran ${input.attendancePct}%; semua tercapai: ${input.allAchieved ? 'ya' : 'tidak'}`,
    [
      `Placeholder: ${out.placeholder}`,
      ...out.lines.map((l) => `Arahan: ${l}`),
      `Pengingat: ${out.reminder}`,
      `Pengingat saat Kunci (catatan < ${TH.notesShortChars} karakter): ${out.lockNudge}`
    ],
    [],
    covers
  );
}
const NO = { hasConflictOrLocationCheck: false, minDrillSubtests: [], attendancePct: 90, allAchieved: false, studentName: 'Garuda' };
runGuidance('Tanpa kondisi khusus (arahan pengganti)', NO);
runGuidance('Beda pilihan atau batasan lokasi', { ...NO, hasConflictOrLocationCheck: true });
runGuidance('Subtes prioritas minim drill (satu subtes)', { ...NO, minDrillSubtests: ['Pengetahuan Kuantitatif (PK)'] });
runGuidance('Subtes prioritas minim drill (dua subtes)', { ...NO, minDrillSubtests: ['Pengetahuan Kuantitatif (PK)', 'Penalaran Matematika (PM)'] });
runGuidance('Kehadiran kelas rendah', { ...NO, attendancePct: 72.5 });
runGuidance(`Kehadiran tepat ${TH.attendanceWarnPct}% (tidak memicu)`, { ...NO, attendancePct: TH.attendanceWarnPct });
runGuidance('Semua subtes prioritas tercapai', { ...NO, allAchieved: true });
runGuidance('Semua kondisi aktif (hanya 2 arahan pertama tampil)', { hasConflictOrLocationCheck: true, minDrillSubtests: ['Pengetahuan Kuantitatif (PK)'], attendancePct: 72.5, allAchieved: true, studentName: 'Rizky' });

// =====================================================================
// Teks tetap kartu "Panduan Kakak Asuh" per tahap
// =====================================================================
function runGuideCards(test, input) {
  const out = E.analyzeGuideCards(input, cfg);
  add(
    'Kartu Panduan Kakak Asuh',
    test,
    `Target fondasi ${input.foundationTarget}; contoh median ${input.medianSubtest} ${input.medianHistory} = ${input.median}; Pilihan 1: ${input.prodi}; TO berikutnya: ${input.nextEpisode}`,
    [
      `T1 judul: ${out.t1.title}`,
      ...out.t1.rambu.map((r) => `T1 rambu: ${r}`),
      `T1 konteks median: ${out.t1.medianContext}`,
      `T2 judul: ${out.t2.title}`,
      ...out.t2.rambu.map((r) => `T2 rambu: ${r}`),
      `T3 judul: ${out.t3.title}`,
      `T3 target hasil: ${out.t3.goal}`,
      ...out.t3.rambu.map((r) => `T3 rambu: ${r}`),
      `T3 catatan target dasar: ${out.t3.base600Note}`,
      `T4 judul: ${out.t4.title}`,
      `T4 target hasil: ${out.t4.goal}`,
      ...out.t4.rambu.map((r) => `T4 rambu: ${r}`),
      `T5 judul: ${out.t5.title}`,
      `T5 target hasil: ${out.t5.goal}`,
      `T5 kesinambungan: ${out.t5.continuity}`
    ],
    [],
    ['Kartu panduan: semua teks']
  );
}
runGuideCards('Contoh siswa dengan target fondasi bawaan', { foundationTarget: TH.foundationScoreTarget, medianSubtest: 'PU', medianHistory: '480→560→470→520', median: 500, prodi: 'Prodi Contoh', nextEpisode: 5 });
runGuideCards('Target fondasi dan nomor TO berbeda', { foundationTarget: 650, medianSubtest: 'PK', medianHistory: '600→640→590', median: 600, prodi: 'Prodi Lain', nextEpisode: 7 });

// =====================================================================
// Cakupan aturan
// =====================================================================
const EXPECTED = [
  ...Object.keys(cfg.patternTemplates).map((p) => `T1 pola: ${p}`),
  'T1 fondasi: semua < 500', 'T1 fondasi: semua >= target', 'T1 fondasi: sebagian >= target', 'T1 fondasi: belum ada >= target',
  'T1 fluktuasi subtes', 'T1 kehadiran rendah',
  'T2 keselarasan: konflik/campuran', 'T2 keselarasan: selaras', 'T2 keselarasan: belum konfirmasi', 'T2 cek lokasi',
  'T2 gap: lebar', 'T2 gap: moderat', 'T2 gap: melampaui', 'T2 gap: tidak diketahui',
  'T2 pembanding: cukup', 'T2 pembanding: sedikit', 'T2 laju: Plan B ya', 'T2 laju: Plan B tidak',
  ...Object.keys(cfg.stage3SubtestTemplates).map((c) => `T3 kondisi: ${c}`),
  'T3 ketimpangan: ya', 'T3 ketimpangan: tidak',
  'T4 kelas: belum ada sesi', 'T4 kelas: kehadiran rendah', 'T4 kelas: kehadiran baik', 'T4 kelas: sesi terlewat >= 5',
  'T4 kelas: catatan 0', 'T4 kelas: catatan < 25%', 'T4 kelas: semua sesi punya catatan', 'T4 kelas: ada sesi tanpa catatan',
  'T5 rencana: semua subtes tercapai', 'T5 rencana: ada subtes di bawah target',
  'T5 rencana: minimal per subtes berlaku', 'T5 rencana: pembagian merata',
  'T5 tugas: subtes minim drill', 'T5 tugas: konflik/lokasi',
  'T5 arahan: pengganti', 'T5 arahan: konflik', 'T5 arahan: minim drill', 'T5 arahan: kehadiran rendah',
  'T5 arahan: semua tercapai', 'T5 arahan: dibatasi 2 baris',
  'Kartu panduan: semua teks'
];
const missing = EXPECTED.filter((k) => !covered.has(k));

// =====================================================================
// Tulis CSV
// =====================================================================
const esc = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const header = [
  'ID', 'Tahap', 'Kondisi yang diuji', 'Input skenario', 'Output yang tampil di laporan', 'Aturan terpicu',
  'Keputusan reviewer (Setuju / Revisi / Hapus)', 'Catatan atau teks usulan', 'Nama reviewer'
];
const csv = '﻿' + [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
const outDir = path.join(root, 'review');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'buku-kasus-engine.csv');
fs.writeFileSync(outFile, csv);

console.log(`Buku kasus: ${rows.length} skenario -> ${path.relative(root, outFile)}`);
console.log(`Cakupan aturan: ${EXPECTED.length - missing.length}/${EXPECTED.length}`);
if (missing.length) console.log('Belum tercakup:\n  - ' + missing.join('\n  - '));
if (problems.length) console.log('Masalah:\n  - ' + problems.join('\n  - '));
process.exit(missing.length || problems.length ? 1 : 0);
