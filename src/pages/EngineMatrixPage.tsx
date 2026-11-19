import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppTopbar } from '../components/AppTopbar';
import {
  ArrowLeft,
  GitBranch,
  Sliders,
  Info,
  Building2,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Save,
  Download,
  Upload,
  Table2
} from 'lucide-react';
import {
  DEFAULT_ENGINE_CONFIG,
  EngineRuleConfig,
  Stage3ConditionId,
  TryoutPattern,
  analyzeStage1,
  analyzeStage2,
  analyzeStage3Subtest,
  analyzeStage3Overall,
  analyzeStage4,
  generateEngineCsv
} from '../utils/saGuidelineEngine';
import { mergeWithDefault, useRuleConfig } from '../utils/saRuleStore';
import { RuleTraceBox } from '../components/RuleTraceBox';

interface PresetConfig {
  id: string;
  label: string;
  desc: string;
  toScores: string[];
  attendanceRatePct: number;
  hasLargeSubtestSwing: boolean;
  hasMixedRumpun: boolean;
  familyAlignment: 'aligned' | 'different_major' | 'location_limit' | 'unconfirmed';
  minGapToTarget: number;
  maxGapToTarget: number;
  minParticipantsCount: number;
  subtestName: string;
  toLatest: number;
  drillQuestions: number;
  drillSessions: number;
  drillAccuracyPct: number;
}

const PRESETS: PresetConfig[] = [
  {
    id: 'garuda',
    label: 'Garuda (Saintek: Beda Rumpun & Lokasi · Tren Turun)',
    desc: 'Farmasi UGM/UI vs Teknik Mesin ITB, skor TO turun (601→546), PU drill 35 soal tapi PK 5 soal.',
    toScores: ['601', '576', '561', '546'],
    attendanceRatePct: 81.8,
    hasLargeSubtestSwing: true,
    hasMixedRumpun: true,
    familyAlignment: 'different_major',
    minGapToTarget: -156,
    maxGapToTarget: -95,
    minParticipantsCount: 520,
    subtestName: 'Pengetahuan Kuantitatif (PK)',
    toLatest: 488,
    drillQuestions: 5,
    drillSessions: 1,
    drillAccuracyPct: 40
  },
  {
    id: 'nadira',
    label: 'Nadira (Soshum: Pilihan Selaras · Tren Naik · Drill Aktif)',
    desc: 'Hukum UI / HI UGM / Ilkom Unpad, skor TO naik (520→608), 3 subtes ≥ 600, drill aktif di semua subtes.',
    toScores: ['520', '548', '575', '608'],
    attendanceRatePct: 95.5,
    hasLargeSubtestSwing: false,
    hasMixedRumpun: false,
    familyAlignment: 'aligned',
    minGapToTarget: -84,
    maxGapToTarget: -37,
    minParticipantsCount: 620,
    subtestName: 'Penalaran Umum (PU)',
    toLatest: 582,
    drillQuestions: 55,
    drillSessions: 11,
    drillAccuracyPct: 78
  },
  {
    id: 'rizky',
    label: 'Rizky (Saintek: Semua Subtes < 500 · Drill 0 Soal · Absensi 72.5%)',
    desc: 'Informatika ITS / SI Unair / RPL PENS, semua subtes < 500 (fondasi awal), drill 0 soal, kehadiran < 80%.',
    toScores: ['465', '452', '445', '430'],
    attendanceRatePct: 76.2,
    hasLargeSubtestSwing: false,
    hasMixedRumpun: false,
    familyAlignment: 'unconfirmed',
    minGapToTarget: -277,
    maxGapToTarget: -173,
    minParticipantsCount: 480,
    subtestName: 'Pengetahuan Kuantitatif (PK)',
    toLatest: 420,
    drillQuestions: 0,
    drillSessions: 0,
    drillAccuracyPct: 0
  },
  {
    id: 'high_acc_edge',
    label: 'Akurasi Drill Tinggi (71%) Tapi Gap TO -65 Poin',
    desc: 'Drill sudah 42 soal dan akurasi 71%, namun skor TO masih 535 (evaluasi manajemen waktu ujian & transfer soal).',
    toScores: ['530', '545', '540', '535'],
    attendanceRatePct: 90,
    hasLargeSubtestSwing: false,
    hasMixedRumpun: false,
    familyAlignment: 'aligned',
    minGapToTarget: -65,
    maxGapToTarget: -25,
    minParticipantsCount: 450,
    subtestName: 'Pengetahuan Kuantitatif (PK)',
    toLatest: 535,
    drillQuestions: 42,
    drillSessions: 8,
    drillAccuracyPct: 71
  },
  {
    id: 'alya',
    label: 'Alya (Achieve Semua ≥ 600 & Lolos Target Pilihan)',
    desc: 'Semua 8 subtes ≥ 668, tren naik konsisten (638→688), semua pilihan lolos target (+22 s.d. +107), drill aktif & akurasi > 84%.',
    toScores: ['638', '656', '672', '688'],
    attendanceRatePct: 95.5,
    hasLargeSubtestSwing: false,
    hasMixedRumpun: false,
    familyAlignment: 'aligned',
    minGapToTarget: 22,
    maxGapToTarget: 107,
    minParticipantsCount: 515,
    subtestName: 'Pengetahuan Kuantitatif (PK)',
    toLatest: 692,
    drillQuestions: 64,
    drillSessions: 12,
    drillAccuracyPct: 86
  }
];

type ThresholdKey = keyof EngineRuleConfig['thresholds'];

const THRESHOLD_FIELDS: Record<ThresholdKey, { label: string; also?: string }> = {
  toTolerancePts: { label: 'Toleransi TO Datar (±poin)' },
  foundationScoreTarget: { label: 'Target Fondasi Subtes', also: 'Tahap 3' },
  subtestSwingPts: { label: 'Batas Fluktuasi Subtes (poin)' },
  attendanceWarnPct: { label: 'Ambang Peringatan Absensi (%)', also: 'Tahap 4' },
  wideWeightedGapPts: { label: 'Gap Terbobot Lebar (≤ poin)' },
  minBenchmarkParticipants: { label: 'Min. Peserta Pembanding' },
  remainingEpisodesToNextConsult: { label: 'Sisa TO ke Konsultasi Berikutnya' },
  remainingEpisodesToUtbk: { label: 'Total Sisa TO Menuju UTBK' },
  planBGainThresholdPts: { label: 'Ambang Kenaikan Plan B (> poin/TO)' },
  drillLowQuestions: { label: 'Batas Drill Minim (< soal)' },
  drillLowAccuracyPct: { label: 'Batas Akurasi Rendah (< %)' },
  drillHighAccQuestions: { label: 'Min. Soal Drill (≥)' },
  drillHighAccuracyPct: { label: 'Min. Akurasi (≥ %)' },
  drillHighAccGapPts: { label: 'Selisih ke Target (≤ poin)' },
  drillActiveHighGap: { label: 'Gap Subtes Prioritas (≤ poin)' },
  nearTargetGapPts: { label: 'Batas Dekat Target (≥ poin)' },
  drillMismatchHighQ: { label: 'Subtes Paling Aktif (≥ soal)' },
  drillMismatchLowQ: { label: 'Subtes Prioritas Minim (≤ soal)' },
  absenceWarnSessions: { label: 'Sakit + Izin (≥ sesi)' },
  notesLowCoveragePct: { label: 'Cakupan Catatan Rendah (< %)' },
  notesShortChars: { label: 'Catatan Kakak Asuh Singkat (< karakter)' },
  weeklyDrillTotal: { label: 'Acuan Total Soal Benar per Minggu (bila semua subtes sudah tercapai)' },
  drillRank1: { label: 'Soal Benar per Minggu: Subtes Nilai Terendah (urutan 1)' },
  drillRank2: { label: 'Soal Benar per Minggu: Urutan 2' },
  drillRank3: { label: 'Soal Benar per Minggu: Urutan 3' },
  minDrillPerSubtest: { label: 'Soal Benar per Minggu: Subtes Lainnya (urutan 4 dst.)' }
};

const THRESHOLD_GROUPS: {
  id: string;
  title: string;
  desc: string;
  subgroups: { title: string; note?: string; keys: ThresholdKey[] }[];
}[] = [
  {
    id: 't2',
    title: 'Tahap 1 · Analisis Jurusan',
    desc: 'Membaca selisih skor terbobot terhadap target acuan dan kecukupan data pembanding.',
    subgroups: [
      { title: 'Selisih terhadap target', note: 'memilih teks gap lebar, moderat, atau melampaui', keys: ['wideWeightedGapPts'] },
      { title: 'Data pembanding', note: 'peringatan jika peserta terlalu sedikit', keys: ['minBenchmarkParticipants'] },
      {
        title: 'Laju kenaikan per TO dan Plan B',
        note: 'menghitung target per TO dan sinyal Plan B',
        keys: ['remainingEpisodesToNextConsult', 'remainingEpisodesToUtbk', 'planBGainThresholdPts']
      }
    ]
  },
  {
    id: 't1',
    title: 'Tahap 2 · Evaluasi Tryout',
    desc: 'Membaca pola skor TO, capaian fondasi subtes, dan kehadiran.',
    subgroups: [
      { title: 'Pola skor TO', note: 'memilih satu dari 15 pola', keys: ['toTolerancePts'] },
      { title: 'Capaian subtes', note: 'catatan fondasi dan fluktuasi', keys: ['foundationScoreTarget', 'subtestSwingPts'] },
      { title: 'Kehadiran kelas', keys: ['attendanceWarnPct'] }
    ]
  },
  {
    id: 't3',
    title: 'Tahap 3 · Subtes & Drill Soal',
    desc: 'Kondisi per subtes diperiksa berurutan, yang pertama cocok dipakai: tercapai, belum drill, volume rendah, akurasi tinggi, drill aktif, dekat target, umum.',
    subgroups: [
      { title: 'Kondisi "Volume terbatas & akurasi rendah"', note: 'keduanya harus terpenuhi', keys: ['drillLowQuestions', 'drillLowAccuracyPct'] },
      { title: 'Kondisi "Akurasi drill tinggi, gap TO masih ada"', note: 'ketiganya harus terpenuhi', keys: ['drillHighAccQuestions', 'drillHighAccuracyPct', 'drillHighAccGapPts'] },
      { title: 'Kondisi "Drill aktif, gap TO lebar"', note: 'dipakai juga untuk subtes prioritas di audit', keys: ['drillActiveHighGap'] },
      { title: 'Kondisi "Mendekati target"', keys: ['nearTargetGapPts'] },
      { title: 'Audit ketimpangan drill (seluruh subtes)', note: 'drill terbanyak jauh melebihi subtes prioritas', keys: ['drillMismatchHighQ', 'drillMismatchLowQ'] }
    ]
  },
  {
    id: 't4',
    title: 'Tahap 4 · Kelas TMB & Catatan Pengajar',
    desc: 'Membaca kehadiran kelas dan kelengkapan catatan pengajar.',
    subgroups: [
      { title: 'Sesi terlewat', keys: ['absenceWarnSessions'] },
      { title: 'Catatan pengajar', keys: ['notesLowCoveragePct'] },
      { title: 'Catatan Kakak Asuh', note: 'pengingat lunak saat Kunci', keys: ['notesShortChars'] }
    ]
  },
  {
    id: 't5',
    title: 'Tahap 5 · Rencana Aksi',
    desc: 'Target drill mingguan di rencana aksi (dashboard dan PDF halaman 3).',
    subgroups: [{ title: 'Drill soal mingguan', note: 'target per subtes menurut urutan nilai TO terendah (20 / 15 / 12, sisanya 10)', keys: ['drillRank1', 'drillRank2', 'drillRank3', 'minDrillPerSubtest', 'weeklyDrillTotal'] }]
  }
];

const STAGE1_FIELD_TITLES: Record<keyof EngineRuleConfig['stage1Templates'], string> = {
  foundationAllBelow500: 'Catatan: semua subtes < 500',
  foundationAllAbove: 'Catatan: semua subtes ≥ target fondasi',
  foundationPartial: 'Catatan: sebagian subtes ≥ target fondasi',
  foundationNone: 'Catatan: belum ada subtes ≥ target fondasi',
  swing: 'Catatan: fluktuasi subtes ekstrem',
  attendance: 'Catatan: kehadiran di bawah ambang',
  latestDeltaSuffix: 'Tambahan di akhir observasi (≥ 3 TO)'
};

const CLASSROOM_FIELD_TITLES: Record<keyof EngineRuleConfig['classroomTemplates'], string> = {
  noSessions: 'Belum ada sesi kelas',
  lowAttendance: 'Kehadiran di bawah ambang',
  goodAttendance: 'Kehadiran baik',
  repeatedAbsence: 'Sakit + izin mencapai ambang',
  noNotes: 'Belum ada catatan pengajar',
  lowNotes: 'Cakupan catatan pengajar rendah',
  guardrailMissingNotes: 'Catatan acuan: ada sesi tanpa catatan',
  guardrailAllNotes: 'Catatan acuan: semua sesi punya catatan'
};

const GUIDE_CARD_FIELD_GROUPS: { title: string; keys: (keyof EngineRuleConfig['guideCardTemplates'])[] }[] = [
  { title: 'Kartu Tahap 1 · Analisis Jurusan', keys: ['t2Title', 't2Rambu'] },
  { title: 'Kartu Tahap 2 · Evaluasi Tryout', keys: ['t1Title', 't1Rambu', 't1MedianContext'] },
  { title: 'Kartu Tahap 3 · Subtes & Drill Soal', keys: ['t3Title', 't3Goal', 't3Rambu', 't3Base600Note'] },
  { title: 'Kartu Tahap 4 · Kelas TMB & Catatan', keys: ['t4Title', 't4Goal', 't4Rambu'] },
  { title: 'Kartu Tahap 5 · Rencana Aksi', keys: ['t5Title', 't5Goal', 't5Continuity'] }
];

const GUIDE_CARD_FIELD_TITLES: Record<keyof EngineRuleConfig['guideCardTemplates'], string> = {
  t1Title: 'Judul kartu (setelah "Panduan Kakak Asuh:")',
  t1Rambu: 'Rambu komunikasi (satu poin per baris)',
  t1MedianContext: 'Konteks data median',
  t2Title: 'Judul kartu (setelah "Panduan Kakak Asuh:")',
  t2Rambu: 'Rambu progres holistik (satu poin per baris)',
  t3Title: 'Judul kartu (setelah "Panduan Kakak Asuh:")',
  t3Goal: 'Target hasil',
  t3Rambu: 'Rambu komunikasi (satu poin per baris)',
  t3Base600Note: 'Catatan alasan target dasar (di atas kartu subtes)',
  t4Title: 'Judul kartu (setelah "Panduan Kakak Asuh:")',
  t4Goal: 'Target hasil',
  t4Rambu: 'Rambu komunikasi (satu poin per baris)',
  t5Title: 'Judul kartu (setelah "Panduan Kakak Asuh:")',
  t5Goal: 'Target hasil',
  t5Continuity: 'Kesinambungan sesi berikutnya'
};

const NOTES_GUIDANCE_FIELD_TITLES: Record<keyof EngineRuleConfig['notesGuidanceTemplates'], string> = {
  placeholder: 'Placeholder kotak catatan (saat kosong)',
  conflictLine: 'Arahan: beda pilihan atau batasan lokasi ({student})',
  missingDrillLine: 'Arahan: subtes prioritas minim drill ({subtests})',
  lowAttendanceLine: 'Arahan: kehadiran rendah ({student}, {pct})',
  allAchievedLine: 'Arahan: semua subtes prioritas tercapai ({student})',
  fallbackLine: 'Arahan pengganti (tampil bila tidak ada arahan sesuai kondisi)',
  points: 'Arahan tetap di akhir daftar (satu poin per baris)',
  reminder: 'Pengingat penutup (tebal, di bawah daftar)',
  lockNudge: 'Pengingat lunak saat Kunci bila catatan singkat'
};

const ACTION_PLAN_FIELD_TITLES: Record<keyof EngineRuleConfig['actionPlanTemplates'], string> = {
  plan1Title: 'Rencana 1 · Judul',
  plan1Desc: 'Rencana 1 · Isi (ada subtes di bawah target)',
  plan1DescAchieved: 'Rencana 1 · Isi (semua subtes tercapai)',
  plan1Pic: 'Rencana 1 · Penanggung jawab (hanya dashboard)',
  plan3Title: 'Rencana 3 · Judul',
  plan3Desc: 'Rencana 3 · Isi (ada subtes di bawah target)',
  plan3DescAchieved: 'Rencana 3 · Isi (semua subtes tercapai)',
  plan3ProgramSuffix: 'Rencana 3 · Tambahan skor target per jurusan',
  plan3Pic: 'Rencana 3 · Penanggung jawab (hanya dashboard)',
  planBTitle: 'Plan B · Judul (tampil bila belum ada pilihan yang mencapai target)',
  planBDesc: 'Plan B · Isi',
  planBPic: 'Plan B · Penanggung jawab (hanya dashboard)',
  plan4Title: 'Rencana 4 · Judul',
  plan4Desc: 'Rencana 4 · Isi',
  plan4DrillSuffix: 'Rencana 4 · Tambahan cek progres drill',
  plan4Pic: 'Rencana 4 · Penanggung jawab (hanya dashboard)',
  checklist: 'Checklist Penutup (satu poin per baris)'
};

const ALL_15_PATTERNS: { pattern: TryoutPattern; condition: string; scoresExample: string }[] = [
  { pattern: 'no_data', condition: 'Jumlah skor TO = 0', scoresExample: '—' },
  { pattern: 'one_result', condition: 'Jumlah skor TO = 1', scoresExample: '518' },
  { pattern: 'initial_up', condition: '2 TO, selisih > +toleransi', scoresExample: '530 → 565' },
  { pattern: 'initial_down', condition: '2 TO, selisih < -toleransi', scoresExample: '570 → 535' },
  { pattern: 'initial_flat', condition: '2 TO, selisih dalam ±toleransi', scoresExample: '550 → 553' },
  { pattern: 'steady_up', condition: '≥ 3 TO, semua perubahan > +toleransi', scoresExample: '520 → 545 → 575 → 602' },
  { pattern: 'steady_down', condition: '≥ 3 TO, semua perubahan < -toleransi', scoresExample: '601 → 576 → 561 → 546' },
  { pattern: 'steady_flat', condition: '≥ 3 TO, semua perubahan dalam ±toleransi', scoresExample: '552 → 554 → 550 → 553' },
  { pattern: 'up_with_pauses', condition: '≥ 3 TO, ada naik & datar tanpa turun', scoresExample: '530 → 532 → 565 → 590' },
  { pattern: 'down_with_pauses', condition: '≥ 3 TO, ada turun & datar tanpa naik', scoresExample: '590 → 560 → 558 → 532' },
  { pattern: 'recovery', condition: 'Ada penurunan lalu TO terakhir naik', scoresExample: '590 → 552 → 540 → 586' },
  { pattern: 'reversal_down', condition: 'Ada kenaikan lalu TO terakhir turun', scoresExample: '530 → 575 → 595 → 555' },
  { pattern: 'fluctuating_up', condition: 'Berganti arah, TO akhir > awal', scoresExample: '580 → 540 → 575 → 610' },
  { pattern: 'fluctuating_down', condition: 'Berganti arah, TO akhir < awal', scoresExample: '540 → 580 → 545 → 520' },
  { pattern: 'fluctuating_flat', condition: 'Berganti arah, awal & akhir serupa', scoresExample: '560 → 520 → 540 → 562' }
];

export const EngineMatrixPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { config, isCustomized, updateAndSave, resetToDefault } = useRuleConfig();
  const [draftConfig, setDraftConfig] = useState<EngineRuleConfig>(config);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [showImportBox, setShowImportBox] = useState<boolean>(false);

  const initialTabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'simulator' | 'controls' | 'matrix'>(
    initialTabParam === 'controls' ? 'controls' : initialTabParam === 'matrix' ? 'matrix' : 'simulator'
  );
  const [editorStage, setEditorStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4' | 'guides'>('stage1');
  const [selectedPatternEdit, setSelectedPatternEdit] = useState<TryoutPattern>('steady_down');

  useEffect(() => {
    setDraftConfig(config);
  }, [config]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'controls' || t === 'matrix' || t === 'simulator') {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Simulator states
  const [selectedPreset, setSelectedPreset] = useState<string>('garuda');
  const [toScores, setToScores] = useState<string[]>(PRESETS[0].toScores);
  const [attendanceRatePct, setAttendanceRatePct] = useState<number>(PRESETS[0].attendanceRatePct);
  const [hasLargeSubtestSwing, setHasLargeSubtestSwing] = useState<boolean>(PRESETS[0].hasLargeSubtestSwing);
  const [aboveTargetCount, setAboveTargetCount] = useState<number>(1);
  const [hasMixedRumpun, setHasMixedRumpun] = useState<boolean>(PRESETS[0].hasMixedRumpun);
  const [familyAlignment, setFamilyAlignment] = useState<PresetConfig['familyAlignment']>(PRESETS[0].familyAlignment);
  const [minGapToTarget, setMinGapToTarget] = useState<number>(PRESETS[0].minGapToTarget);
  const [maxGapToTarget, setMaxGapToTarget] = useState<number>(PRESETS[0].maxGapToTarget);
  const [minParticipantsCount, setMinParticipantsCount] = useState<number>(PRESETS[0].minParticipantsCount);
  const [subtestName, setSubtestName] = useState<string>(PRESETS[0].subtestName);
  const [toLatest, setToLatest] = useState<number>(PRESETS[0].toLatest);
  const [drillQuestions, setDrillQuestions] = useState<number>(PRESETS[0].drillQuestions);
  const [drillSessions, setDrillSessions] = useState<number>(PRESETS[0].drillSessions);
  const [drillAccuracyPct, setDrillAccuracyPct] = useState<number>(PRESETS[0].drillAccuracyPct);

  const applyPreset = (p: PresetConfig) => {
    setSelectedPreset(p.id);
    setToScores(p.toScores);
    setAttendanceRatePct(p.attendanceRatePct);
    setHasLargeSubtestSwing(p.hasLargeSubtestSwing);
    setAboveTargetCount(p.id === 'four_above' ? 4 : p.id === 'garuda' ? 1 : 2);
    setHasMixedRumpun(p.hasMixedRumpun);
    setFamilyAlignment(p.familyAlignment);
    setMinGapToTarget(p.minGapToTarget);
    setMaxGapToTarget(p.maxGapToTarget);
    setMinParticipantsCount(p.minParticipantsCount);
    setSubtestName(p.subtestName);
    setToLatest(p.toLatest);
    setDrillQuestions(p.drillQuestions);
    setDrillSessions(p.drillSessions);
    setDrillAccuracyPct(p.drillAccuracyPct);
  };

  // Use live draftConfig when user is previewing in simulator too, or saved config — using draftConfig lets immediate testing!
  const activeEvalConfig = draftConfig;

  const numericScores = toScores.map((s) => Number(s)).filter((n) => !Number.isNaN(n) && n > 0);
  const sampleNames = ['PPU', 'PM', 'PBM', 'LBING', 'LBI Soshum', 'LBI Saintek', 'PU', 'PK'];
  const targetBasis = activeEvalConfig.thresholds.foundationScoreTarget;
  const syntheticSubtests = sampleNames.map((name, idx) => {
    const isAbove = idx < aboveTargetCount;
    const latest = isAbove ? targetBasis + 15 + idx * 5 : targetBasis - 70 - idx * 8;
    const scores =
      idx === sampleNames.length - 1 && hasLargeSubtestSwing
        ? [668, 620, 539, 488]
        : [latest - 10, latest];
    return {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      scores,
      toLatest: idx === sampleNames.length - 1 && hasLargeSubtestSwing ? 488 : latest
    };
  });

  const stage1Out = analyzeStage1(
    { toScores: numericScores, subtestRows: syntheticSubtests, attendanceRatePct },
    activeEvalConfig
  );

  const stage2Out = analyzeStage2(
    {
      hasMixedRumpun,
      familyAlignment,
      minGapToTarget,
      maxGapToTarget,
      minParticipantsCount
    },
    activeEvalConfig
  );

  const simulatedSubInput = {
    id: 'sim_sub',
    name: subtestName,
    toLatest,
    gapTo600: toLatest - activeEvalConfig.thresholds.foundationScoreTarget,
    drillQuestions,
    drillSessions,
    drillAccuracyPct
  };

  const stage3SubOut = analyzeStage3Subtest(simulatedSubInput, activeEvalConfig);
  const stage3OverallOut = analyzeStage3Overall(
    [
      {
        id: 'pu',
        name: 'Penalaran Umum (PU)',
        toLatest: 465,
        gapTo600: 465 - activeEvalConfig.thresholds.foundationScoreTarget,
        drillQuestions: 35,
        drillSessions: 7,
        drillAccuracyPct: 63
      },
      simulatedSubInput
    ],
    activeEvalConfig
  );

  const stage4Out = analyzeStage4(
    {
      hasConflictOrLocationCheck:
        hasMixedRumpun || familyAlignment === 'location_limit' || familyAlignment === 'unconfirmed',
      hasMissingDrill: drillQuestions <= activeEvalConfig.thresholds.drillMismatchLowQ,
      planData: {
        subtests: [
          { name: subtestName, to4: toLatest, gap: toLatest - activeEvalConfig.thresholds.foundationScoreTarget }
        ],
        branch: 'Cabang Contoh',
        avgScore: toLatest,
        episode: 4,
        needsPlanB: true
      },
      studentName: 'Siswa Contoh',
      saName: 'Kakak Asuh',
      parentName: 'Orang Tua Siswa'
    },
    activeEvalConfig
  );

  const hasUnsavedDraft = JSON.stringify(draftConfig) !== JSON.stringify(config);

  const handleSaveConfig = () => {
    updateAndSave(draftConfig);
    setSaveToast('Pengaturan aturan & wording disimpan dan langsung aktif di Dashboard V2.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleResetConfig = () => {
    if (!window.confirm('Kembalikan semua ambang batas dan wording ke default sistem? Perubahan kustom akan hilang.')) return;
    const def = resetToDefault();
    setDraftConfig(def);
    setSaveToast('Semua ambang batas & wording dikembalikan ke default sistem.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(draftConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sa-guideline-engine-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csv = generateEngineCsv(activeEvalConfig);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sa-guideline-engine-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
    setSaveToast('Matriks rule & template /engine berhasil diekspor ke CSV (siap dibuka di Google Sheets / Excel).');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const merged = mergeWithDefault(parsed);
      setDraftConfig(merged);
      updateAndSave(merged);
      setShowImportBox(false);
      setImportJsonText('');
      setSaveToast('Konfigurasi JSON berhasil diimpor & diterapkan.');
      setTimeout(() => setSaveToast(null), 3500);
    } catch {
      setSaveToast('Format JSON tidak valid. Periksa sintaks JSON Anda.');
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  const updateThreshold = (key: keyof EngineRuleConfig['thresholds'], value: number) => {
    setDraftConfig((prev) => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value }
    }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', paddingBottom: 64 }}>
      {/* Topbar */}
      <AppTopbar
        crumbs={[
          { label: 'Home', to: '/v2' },
          { label: 'Konsultasi - Checkpoint', to: '/v2' },
          { label: 'Detail Checkpoint 1', to: '/v2' },
          { label: 'Kontrol Engine Panduan SA (White-Box)' }
        ]}
      >
        {isCustomized && <span className="engine-chip engine-chip--custom">Aturan Custom Aktif</span>}
        <Link to="/v2" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Kembali ke Dashboard V2
        </Link>
      </AppTopbar>

      <main className="container" style={{ paddingTop: 20 }}>
        {/* Header Banner */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-strong)',
            borderRadius: 12,
            padding: '18px 22px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--tosca-dark)',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  padding: '2px 10px',
                  borderRadius: 9999
                }}
              >
                WHITE-BOX · DETERMINISTIK · TERKONTROL
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Inspeksi alasan tiap aturan terpicu sekaligus ubah ambang batas &amp; output wording secara langsung
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
              Engine Panduan SA: Simulator, Jejak Aturan &amp; Kontrol Output
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              style={{
                border: 'none',
                borderRadius: 6,
                padding: '7px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: activeTab === 'simulator' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'simulator' ? '#ffffff' : '#475569'
              }}
            >
              <GitBranch size={14} /> 1. Simulator &amp; Jejak Aturan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('controls')}
              style={{
                border: 'none',
                borderRadius: 6,
                padding: '7px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: activeTab === 'controls' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'controls' ? '#ffffff' : '#475569'
              }}
            >
              <Sliders size={14} /> 2. Kontrol Ambang &amp; Output
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              style={{
                border: 'none',
                borderRadius: 6,
                padding: '7px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: activeTab === 'matrix' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'matrix' ? '#ffffff' : '#475569'
              }}
            >
              <Table2 size={14} /> 3. Matriks 15 Pola
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="btn btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: 12,
                color: 'var(--tosca-dark)',
                background: 'var(--primary-light)',
                borderColor: 'var(--primary-border)'
              }}
              title="Ekspor seluruh rule & template teks ke file CSV siap buka di Google Sheets / Excel"
            >
              <Download size={14} /> Export CSV (Spreadsheet)
            </button>
          </div>
        </div>

        {saveToast && (
          <div
            style={{
              background: '#ecfdf3',
              border: '1px solid #a6f4c5',
              color: 'var(--green-ink)',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              marginBottom: 16
            }}
          >
            ✓ {saveToast}
          </div>
        )}

        {activeTab === 'simulator' && (
          <div>
            {/* Preset Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                Pilih Skenario Cepat (atau ubah angka secara manual di panel kiri untuk melihat jejak evaluasi tiap aturan):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {PRESETS.map((p) => {
                  const isActive = selectedPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      style={{
                        textAlign: 'left',
                        background: isActive ? '#eff8ff' : '#ffffff',
                        border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-strong)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: isActive ? 'var(--primary)' : 'var(--ink-strong)', marginBottom: 4 }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Grid: Left Controls, Right Deterministic Outputs + White-Box Trace */}
            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 18, alignItems: 'start' }}>
              {/* Left Input Panel */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 10,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
                    1. DATA TAHAP 1 (TRYOUT &amp; KEHADIRAN)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                    {toScores.map((val, idx) => (
                      <div key={idx}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                          TO {idx + 1}
                        </label>
                        <input
                          type="number"
                          value={val}
                          placeholder="-"
                          onChange={(e) => {
                            const next = [...toScores];
                            next[idx] = e.target.value;
                            setToScores(next);
                            setSelectedPreset('custom');
                          }}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12.5 }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                        Subtes ≥ {targetBasis}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={8}
                        value={aboveTargetCount}
                        onChange={(e) => setAboveTargetCount(Math.max(0, Math.min(8, Number(e.target.value) || 0)))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12.5 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                        Kehadiran Kelas (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={attendanceRatePct}
                        onChange={(e) => setAttendanceRatePct(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12.5 }}
                      />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-soft)', marginTop: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasLargeSubtestSwing}
                      onChange={(e) => setHasLargeSubtestSwing(e.target.checked)}
                    />
                    Ada subtes berfluktuasi ≥ {activeEvalConfig.thresholds.subtestSwingPts} poin
                  </label>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', marginBottom: 8 }}>
                    2. DATA TAHAP 2 (JURUSAN &amp; KELUARGA)
                  </div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                    Keselarasan Pilihan Siswa &amp; Orang Tua
                  </label>
                  <select
                    value={familyAlignment}
                    onChange={(e) => setFamilyAlignment(e.target.value as PresetConfig['familyAlignment'])}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12, marginBottom: 8 }}
                  >
                    <option value="different_major">Konflik / Beda Rumpun Prodi</option>
                    <option value="aligned">Selaras antara Siswa &amp; Ortu</option>
                    <option value="location_limit">Terbatas Izin Lokasi / Luar Kota</option>
                    <option value="unconfirmed">Belum Terkonfirmasi Keluarga</option>
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasMixedRumpun}
                      onChange={(e) => setHasMixedRumpun(e.target.checked)}
                    />
                    Pilihan 1–3 berbeda rumpun ilmu
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                        Gap Terbobot Terlebar
                      </label>
                      <input
                        type="number"
                        value={minGapToTarget}
                        onChange={(e) => setMinGapToTarget(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                        Min. Pembanding (Peserta)
                      </label>
                      <input
                        type="number"
                        value={minParticipantsCount}
                        onChange={(e) => setMinParticipantsCount(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--amber-ink)', marginBottom: 8 }}>
                    3. DATA TAHAP 3 (SUBTES &amp; DRILL)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                        Skor TO Subtes
                      </label>
                      <input
                        type="number"
                        value={toLatest}
                        onChange={(e) => setToLatest(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                        Soal Drill Selesai
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={drillQuestions}
                        onChange={(e) => setDrillQuestions(Math.max(0, Number(e.target.value) || 0))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                        Jumlah Sesi Drill
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={drillSessions}
                        onChange={(e) => setDrillSessions(Math.max(0, Number(e.target.value) || 0))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                        Akurasi Drill (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={drillAccuracyPct}
                        onChange={(e) => setDrillAccuracyPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Live Deterministic Output Panel WITH Transparent Trace */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Stage 1 Output */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--primary)', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Info size={16} /> Output Tahap 2: Mengulas Tren Skor &amp; Fondasi {targetBasis}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '2px 10px', borderRadius: 9999 }}>
                      Pola: {stage1Out.patternLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-strong)', background: 'var(--page-bg)', padding: '8px 10px', borderRadius: 6, marginBottom: 10 }}>
                    <strong>Temuan Numerik:</strong> {stage1Out.observation}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 6, padding: 10 }}>
                      <div><strong>• Ke Siswa:</strong> {stage1Out.studentTask}</div>
                      <div style={{ marginTop: 6 }}><strong>• Ke Orang Tua:</strong> {stage1Out.parentTask}</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 6, padding: 10 }}>
                      <div><strong>• Langkah Lanjutan:</strong> {stage1Out.nextStep}</div>
                      {stage1Out.extraNotes.length > 0 && (
                        <ul style={{ margin: '6px 0 0', paddingLeft: 16, fontSize: 12, color: '#475569' }}>
                          {stage1Out.extraNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <RuleTraceBox traces={stage1Out.traces} collapsible={false} editLinkTo="/engine?tab=controls" />
                </div>

                {/* Stage 2 Output */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderLeft: '4px solid #0284c7', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={16} /> Output Tahap 1: Keselarasan Jurusan &amp; Keluarga
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 10px', borderRadius: 9999 }}>
                      {stage2Out.conditionLabel}
                    </span>
                  </div>
                  <ul style={{ margin: '0 0 8px', paddingLeft: 18, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    {stage2Out.saTasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <div style={{ fontSize: 12, color: minParticipantsCount < activeEvalConfig.thresholds.minBenchmarkParticipants ? 'var(--red-ink)' : '#175cd3', background: minParticipantsCount < activeEvalConfig.thresholds.minBenchmarkParticipants ? '#fef3f2' : '#eff8ff', border: `1px solid ${minParticipantsCount < activeEvalConfig.thresholds.minBenchmarkParticipants ? '#fecdca' : '#b2ddff'}`, borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} />
                    <span>{stage2Out.guardrailNote}</span>
                  </div>
                  <RuleTraceBox traces={stage2Out.traces} collapsible={false} editLinkTo="/engine?tab=controls" />
                </div>

                {/* Stage 3 Output */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--amber-ink)', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--amber-ink)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Wrench size={16} /> Output Tahap 3: Subtes ({subtestName}) &amp; Pola Drill
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber-ink)', background: '#fef0c7', padding: '2px 10px', borderRadius: 9999 }}>
                      {stage3SubOut.conditionLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-strong)', background: '#fffcf5', border: '1px solid #fef0c7', padding: '8px 10px', borderRadius: 6, marginBottom: 8 }}>
                    <div><strong>Observasi Subtes:</strong> {stage3SubOut.observation}</div>
                    <div style={{ marginTop: 4 }}><strong>Tugas SA di Kartu Subtes:</strong> {stage3SubOut.saTask}</div>
                  </div>
                  {stage3OverallOut.mismatchNote && (
                    <div style={{ fontSize: 12, color: '#9a3412', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
                      <strong>Deteksi Ketimpangan Drill:</strong> {stage3OverallOut.mismatchNote}
                    </div>
                  )}
                  <RuleTraceBox
                    traces={[...stage3SubOut.traces, ...stage3OverallOut.traces]}
                    collapsible={false}
                    editLinkTo="/engine?tab=controls"
                  />
                </div>

                {/* Stage 4 Output */}
                <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--green-ink)', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 800, color: 'var(--green-ink)' }}>
                    <ShieldCheck size={16} /> Output Tahap 4: Penutupan Komitmen &amp; Checklist SA
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                    {stage4Out.saTasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <RuleTraceBox traces={stage4Out.traces} collapsible={false} editLinkTo="/engine?tab=controls" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Sticky Control Action Bar */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-strong)',
                borderRadius: 10,
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                <strong>Panel Kontrol Engine:</strong> Ubah ambang batas atau teks output di bawah, lalu klik <strong>Simpan &amp; Terapkan</strong> agar langsung mengubah panduan di Dashboard V2 dan Simulator.
                {hasUnsavedDraft && (
                  <span style={{ marginLeft: 8, color: 'var(--amber-ink)', fontWeight: 800 }}>• Ada perubahan belum disimpan</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" onClick={handleExportCsv} style={{ fontSize: 12, padding: '6px 12px', color: 'var(--tosca-dark)', borderColor: 'var(--primary-border)', background: 'var(--primary-light)' }}>
                  <Download size={14} /> Export CSV (Spreadsheet)
                </button>
                <button type="button" className="btn btn-outline" onClick={handleExportJson} style={{ fontSize: 12, padding: '6px 12px' }}>
                  <Download size={14} /> Export JSON
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowImportBox((v) => !v)}
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  <Upload size={14} /> Import JSON
                </button>
                <button type="button" className="btn btn-outline" onClick={handleResetConfig} style={{ fontSize: 12, padding: '6px 12px' }}>
                  <RotateCcw size={14} /> Reset Default
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveConfig}
                  style={{ fontSize: 12, padding: '6px 14px', background: 'var(--primary)', borderColor: 'var(--primary)' }}
                >
                  <Save size={14} /> Simpan &amp; Terapkan ke V2
                </button>
              </div>
            </div>

            {showImportBox && (
              <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Tempel JSON Konfigurasi Engine:</div>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows={5}
                  placeholder='{ "thresholds": { "toTolerancePts": 10 } }'
                  style={{ width: '100%', padding: 10, fontFamily: 'monospace', fontSize: 12, border: '1px solid var(--border-strong)', borderRadius: 6 }}
                />
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-primary" onClick={handleImportJson} style={{ fontSize: 12, padding: '6px 12px' }}>
                    Terapkan JSON
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowImportBox(false)} style={{ fontSize: 12, padding: '6px 12px' }}>
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Section A: Threshold Controls, dikelompokkan per tahap dan aturan */}
            <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: 10, padding: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-strong)', margin: '0 0 4px' }}>
                A. Kontrol Ambang Batas Kondisi (Thresholds)
              </h2>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 14px' }}>
                Menentukan kapan sebuah kondisi dianggap terpicu oleh sistem. Dikelompokkan sesuai tahap laporan dan aturan yang memakainya.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {THRESHOLD_GROUPS.map((group) => {
                  const changedCount = group.subgroups
                    .flatMap((sg) => sg.keys)
                    .filter((k) => draftConfig.thresholds[k] !== DEFAULT_ENGINE_CONFIG.thresholds[k]).length;
                  return (
                    <section
                      key={group.id}
                      aria-labelledby={`thr-group-${group.id}`}
                      style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}
                    >
                      <header
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 10,
                          flexWrap: 'wrap',
                          background: 'var(--page-bg)',
                          padding: '10px 14px',
                          borderBottom: '1px solid var(--border)'
                        }}
                      >
                        <div>
                          <h3 id={`thr-group-${group.id}`} style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                            {group.title}
                          </h3>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{group.desc}</div>
                        </div>
                        {changedCount > 0 && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>{changedCount} diubah</span>
                        )}
                      </header>

                      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {group.subgroups.map((sub) => (
                          <div key={sub.title}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', marginBottom: 6 }}>
                              {sub.title}
                              {sub.note && <span style={{ fontWeight: 500, color: 'var(--muted)' }}> · {sub.note}</span>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
                              {sub.keys.map((key) => {
                                const f = THRESHOLD_FIELDS[key];
                                const k = key;
                                const val = draftConfig.thresholds[k];
                                const def = DEFAULT_ENGINE_CONFIG.thresholds[k];
                                const changed = val !== def;
                                return (
                                  <div
                                    key={key}
                                    style={{
                                      background: changed ? '#fffbeb' : 'var(--page-bg)',
                                      border: `1px solid ${changed ? '#fde68a' : 'var(--border)'}`,
                                      borderRadius: 8,
                                      padding: '10px 12px'
                                    }}
                                  >
                                    <label
                                      htmlFor={`thr-${key}`}
                                      style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}
                                    >
                                      {f.label}
                                    </label>
                                    <input
                                      id={`thr-${key}`}
                                      type="number"
                                      value={val}
                                      onChange={(e) => updateThreshold(k, Number(e.target.value))}
                                      style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 13, fontWeight: 700 }}
                                    />
                                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                                      Default: <strong>{def}</strong> {changed && <span style={{ color: '#b45309' }}>· Diubah</span>}
                                    </div>
                                    {f.also && (
                                      <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2 }}>Juga dipakai di {f.also}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            {/* Section B: Output Wording Template Editor */}
            <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: 10, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-strong)', margin: '0 0 4px' }}>
                    B. Editor Output Wording per Kondisi
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                    Edit langsung teks panduan SA yang muncul ketika suatu kondisi terpenuhi.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
                  {[
                    { id: 'stage2', label: 'Tahap 1 (Jurusan)' },
                    { id: 'stage1', label: 'Tahap 2 (15 Pola TO)' },
                    { id: 'stage3', label: 'Tahap 3 (5 Subtes)' },
                    { id: 'stage4', label: 'Tahap 4 (Penutupan)' },
                    { id: 'guides', label: 'Kartu Panduan' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEditorStage(s.id as typeof editorStage)}
                      style={{
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: editorStage === s.id ? 'var(--ink-strong)' : 'transparent',
                        color: editorStage === s.id ? '#ffffff' : '#475569'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {editorStage === 'stage1' && (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 420, overflowY: 'auto' }}>
                    {ALL_15_PATTERNS.map((p) => {
                      const active = selectedPatternEdit === p.pattern;
                      const tpl = draftConfig.patternTemplates[p.pattern];
                      return (
                        <button
                          key={p.pattern}
                          type="button"
                          onClick={() => setSelectedPatternEdit(p.pattern)}
                          style={{
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: 6,
                            border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                            background: active ? '#eff8ff' : '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: active ? 'var(--primary)' : 'var(--ink-strong)' }}>{tpl.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.condition}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--primary)' }}>
                      Edit Output Pola: {selectedPatternEdit}
                    </div>
                    {[
                      { field: 'label', title: 'Label Pola' },
                      { field: 'observation', title: 'Kalimat Observasi (placeholder: {a} {b} {selisih} {jumlah})' },
                      { field: 'student', title: 'Tugas Fasilitasi ke Siswa' },
                      { field: 'parent', title: 'Tugas Fasilitasi ke Orang Tua' },
                      { field: 'nextStep', title: 'Arah Tindak Lanjut' }
                    ].map((item) => {
                      const fk = item.field as 'label' | 'observation' | 'student' | 'parent' | 'nextStep';
                      return (
                        <div key={item.field}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
                            {item.title}
                          </label>
                          <textarea
                            rows={fk === 'label' ? 1 : 2}
                            value={draftConfig.patternTemplates[selectedPatternEdit][fk]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraftConfig((prev) => ({
                                ...prev,
                                patternTemplates: {
                                  ...prev.patternTemplates,
                                  [selectedPatternEdit]: {
                                    ...prev.patternTemplates[selectedPatternEdit],
                                    [fk]: val
                                  }
                                }
                              }));
                            }}
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {editorStage === 'stage1' && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-strong)', marginBottom: 8 }}>
                    Catatan Tambahan Tahap 2 (placeholder: {'{target} {above} {total} {swing} {names} {pct} {warn} {delta}'})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {(Object.keys(draftConfig.stage1Templates) as (keyof EngineRuleConfig['stage1Templates'])[]).map((key) => (
                      <div key={key} style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: 4 }}>
                          {STAGE1_FIELD_TITLES[key]}
                        </label>
                        <textarea
                          rows={3}
                          value={draftConfig.stage1Templates[key]}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftConfig((prev) => ({
                              ...prev,
                              stage1Templates: { ...prev.stage1Templates, [key]: v }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editorStage === 'guides' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Format ringan: **teks** untuk tebal, `teks` untuk kode. Placeholder: {'{target} {subtest} {history} {median} {prodi} {nextTo}'}. Rambu: satu poin per baris.
                  </div>
                  {GUIDE_CARD_FIELD_GROUPS.map((group) => (
                    <div key={group.title}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-strong)', marginBottom: 8 }}>{group.title}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {group.keys.map((key) => (
                          <div key={key} style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: 4 }}>
                              {GUIDE_CARD_FIELD_TITLES[key]}
                            </label>
                            <textarea
                              rows={/Rambu$|Note$|Context$|Continuity$/.test(key) ? 4 : 2}
                              value={draftConfig.guideCardTemplates[key]}
                              onChange={(e) => {
                                const v = e.target.value;
                                setDraftConfig((prev) => ({
                                  ...prev,
                                  guideCardTemplates: { ...prev.guideCardTemplates, [key]: v }
                                }));
                              }}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editorStage === 'stage2' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {(
                    [
                      { key: 'mixedOrDifferent', title: 'Jika Rumpun Berbeda / Konflik Pilihan' },
                      { key: 'aligned', title: 'Jika Pilihan Siswa & Keluarga Selaras' },
                      { key: 'unconfirmed', title: 'Jika Pilihan Belum Terkonfirmasi Keluarga' },
                      { key: 'locationCheck', title: 'Tugas Tambahan Pengecekan Izin Lokasi' },
                      { key: 'wideGap', title: 'Jika Gap Terbobot Masih Lebar' },
                      { key: 'remainingGap', title: 'Jika Gap Moderat (< 0)' },
                      { key: 'exceedTarget', title: 'Jika Skor Melampaui Target Acuan (≥ 0)' },
                      { key: 'lowParticipantsWarning', title: 'Peringatan Pembanding < Batas ({count}, {limit})' },
                      { key: 'defaultBenchmarkNote', title: 'Catatan Acuan Standar (selalu tampil jika pembanding cukup)' },
                      { key: 'observationRange', title: 'Kalimat Observasi Selisih, data tersedia ({max}, {min})' },
                      { key: 'observationUnknown', title: 'Kalimat Observasi Selisih, data kosong' }
                    ] as const
                  ).map((item) => (
                    <div key={item.key} style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: 4 }}>
                        {item.title}
                      </label>
                      <textarea
                        rows={2}
                        value={draftConfig.stage2Templates[item.key]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            stage2Templates: { ...prev.stage2Templates, [item.key]: v }
                          }));
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {editorStage === 'stage3' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {(
                    [
                      { id: 'mastered_above', desc: 'Skor sudah mencapai target 600+' },
                      { id: 'no_drill', desc: 'Drill aplikasi = 0 soal' },
                      { id: 'low_vol_low_acc', desc: 'Soal < batas & akurasi < batas' },
                      { id: 'high_acc_low_to', desc: `Akurasi drill tinggi (≥ ${draftConfig.thresholds.drillHighAccuracyPct}%) tapi skor TO masih drop` },
                      { id: 'active_drill_low_to', desc: 'Drill aktif tapi gap TO masih lebar' },
                      { id: 'near_target', desc: 'Gap ke target sudah dekat' },
                      { id: 'general_gap', desc: 'Kondisi umum lainnya' }
                    ] as { id: Stage3ConditionId; desc: string }[]
                  ).map((cond) => (
                    <div key={cond.id} style={{ background: '#fffcf5', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--amber-ink)', marginBottom: 6 }}>
                        Kondisi: {cond.desc} ({cond.id})
                      </div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>
                        Label Badge
                      </label>
                      <input
                        type="text"
                        value={draftConfig.stage3SubtestTemplates[cond.id].label}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            stage3SubtestTemplates: {
                              ...prev.stage3SubtestTemplates,
                              [cond.id]: { ...prev.stage3SubtestTemplates[cond.id], label: v }
                            }
                          }));
                        }}
                        style={{ width: '100%', padding: '5px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12, marginBottom: 8 }}
                      />
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>
                        Kalimat Observasi (placeholder: {'{toLatest} {gap} {questions} {sessions} {accuracy}'})
                      </label>
                      <textarea
                        rows={2}
                        value={draftConfig.stage3SubtestTemplates[cond.id].observation}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            stage3SubtestTemplates: {
                              ...prev.stage3SubtestTemplates,
                              [cond.id]: { ...prev.stage3SubtestTemplates[cond.id], observation: v }
                            }
                          }));
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12, marginBottom: 8 }}
                      />
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>
                        Output Panduan SA
                      </label>
                      <textarea
                        rows={2}
                        value={draftConfig.stage3SubtestTemplates[cond.id].saTask}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            stage3SubtestTemplates: {
                              ...prev.stage3SubtestTemplates,
                              [cond.id]: { ...prev.stage3SubtestTemplates[cond.id], saTask: v }
                            }
                          }));
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1', fontSize: 12.5, fontWeight: 800, color: 'var(--ink-strong)', marginTop: 6 }}>
                    Audit Drill Keseluruhan (placeholder: {'{topName} {topQ} {lowNames} {lowQ}'})
                  </div>
                  {(
                    [
                      { key: 'mismatchNote', title: 'Temuan Ketimpangan Drill', rows: 3, hint: '' },
                      { key: 'tasks', title: 'Tugas SA', rows: 6, hint: 'Satu poin per baris. Tiap baris tampil sebagai satu poin tugas.' },
                      { key: 'guardrail', title: 'Catatan Acuan Drill', rows: 3, hint: '' }
                    ] as const
                  ).map((item) => (
                    <div key={item.key} style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber-ink)', display: 'block', marginBottom: 4 }}>
                        {item.title}
                      </label>
                      {item.hint && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{item.hint}</div>}
                      <textarea
                        rows={item.rows}
                        value={draftConfig.stage3OverallTemplates[item.key]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            stage3OverallTemplates: { ...prev.stage3OverallTemplates, [item.key]: v }
                          }));
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {editorStage === 'stage4' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {(
                    [
                      { key: 'scheduleTask', title: 'Tugas Konfirmasi Jadwal Siswa' },
                      { key: 'parentSupportTask', title: 'Tugas Konfirmasi Dukungan Orang Tua' },
                      { key: 'missingDrillTask', title: 'Tugas Tambahan Jika Ada Drill Minim' },
                      { key: 'conflictOrLocationTask', title: 'Tugas Tambahan Jika Ada Konflik Prodi/Lokasi' }
                    ] as const
                  ).map((item) => (
                    <div key={item.key} style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-ink)', display: 'block', marginBottom: 4 }}>
                        {item.title}
                      </label>
                      <textarea
                        rows={2}
                        value={draftConfig.stage4Templates[item.key]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            stage4Templates: { ...prev.stage4Templates, [item.key]: v }
                          }));
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1', fontSize: 12.5, fontWeight: 800, color: 'var(--ink-strong)', marginTop: 6 }}>
                    Kelas TMB & Catatan Pengajar (placeholder: {'{pct} {present} {total} {absent} {sick} {excused} {notes} {notesPct} {emptyNotes}'})
                  </div>
                  {(Object.keys(draftConfig.classroomTemplates) as (keyof EngineRuleConfig['classroomTemplates'])[]).map((key) => (
                    <div key={key} style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-ink)', display: 'block', marginBottom: 4 }}>
                        {CLASSROOM_FIELD_TITLES[key]}
                      </label>
                      <textarea
                        rows={3}
                        value={draftConfig.classroomTemplates[key]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            classroomTemplates: { ...prev.classroomTemplates, [key]: v }
                          }));
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1', fontSize: 12.5, fontWeight: 800, color: 'var(--ink-strong)', marginTop: 6 }}>
                    Arahan di Bawah Kotak Catatan Kakak Asuh (SEMENTARA TIDAK DITAMPILKAN di laporan; catatan internal SA, tidak masuk PDF)
                  </div>
                  {(Object.keys(draftConfig.notesGuidanceTemplates) as (keyof EngineRuleConfig['notesGuidanceTemplates'])[]).map((key) => (
                    <div key={key} style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-ink)', display: 'block', marginBottom: 4 }}>
                        {NOTES_GUIDANCE_FIELD_TITLES[key]}
                      </label>
                      <textarea
                        rows={key === 'points' ? 4 : 2}
                        value={draftConfig.notesGuidanceTemplates[key]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            notesGuidanceTemplates: { ...prev.notesGuidanceTemplates, [key]: v }
                          }));
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1', fontSize: 12.5, fontWeight: 800, color: 'var(--ink-strong)', marginTop: 6 }}>
                    Rencana Aksi 1–4 dan Checklist Penutup, SATU SUMBER untuk dashboard dan PDF halaman 3 (format **tebal**; placeholder: {'{student} {sa} {parent} {branch} {target} {weakCount} {drillWeekly} {drillPerSubtest} {drillTiers} {deepest} {nextEpisode} {episode} {avgScore}'})
                  </div>
                  {(Object.keys(draftConfig.actionPlanTemplates) as (keyof EngineRuleConfig['actionPlanTemplates'])[]).map((key) => (
                    <div key={key} style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-ink)', display: 'block', marginBottom: 4 }}>
                        {ACTION_PLAN_FIELD_TITLES[key]}
                      </label>
                      {key === 'checklist' && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                          Satu poin per baris. Tiap baris tampil sebagai satu butir checklist.
                        </div>
                      )}
                      <textarea
                        rows={key === 'checklist' ? 5 : 3}
                        value={draftConfig.actionPlanTemplates[key]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftConfig((prev) => ({
                            ...prev,
                            actionPlanTemplates: { ...prev.actionPlanTemplates, [key]: v }
                          }));
                        }}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: 10, padding: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-strong)', margin: '0 0 4px' }}>
                Matriks Tahap 2 — 15 Pola Riwayat Skor Tryout (Toleransi Aktif ±{activeEvalConfig.thresholds.toTolerancePts} Poin)
              </h2>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
                Tabel ini otomatis membaca konfigurasi &amp; wording aktif yang sedang diatur di Tab 2.
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Nama Pola</th>
                    <th style={{ width: '22%' }}>Jika Kondisi Seperti Ini</th>
                    <th style={{ width: '16%' }}>Contoh Skor</th>
                    <th>Output Tugas Fasilitasi SA (Aktif)</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_15_PATTERNS.map((row) => {
                    const exNums =
                      row.scoresExample === '—'
                        ? []
                        : row.scoresExample.split('→').map((x) => Number(x.trim()));
                    const res = analyzeStage1(
                      { toScores: exNums, subtestRows: [], attendanceRatePct: 85 },
                      activeEvalConfig
                    );
                    return (
                      <tr key={row.pattern}>
                        <td><strong>{res.patternLabel}</strong></td>
                        <td style={{ fontSize: 12, color: '#475569' }}>{row.condition}</td>
                        <td><code style={{ fontSize: 12 }}>{row.scoresExample}</code></td>
                        <td style={{ fontSize: 12, lineHeight: 1.45 }}>
                          <div><strong>Siswa:</strong> {res.studentTask}</div>
                          <div><strong>Ortu:</strong> {res.parentTask}</div>
                          <div style={{ color: 'var(--primary)' }}><strong>Tindak lanjut:</strong> {res.nextStep}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
