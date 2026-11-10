import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  analyzeStage4
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
    attendanceRatePct: 93.2,
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
    attendanceRatePct: 72.5,
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
  }
];

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
  { pattern: 'fluctuating_up', condition: 'Berganti arah, TO akhir > awal', scoresExample: '540 → 580 → 545 → 570' },
  { pattern: 'fluctuating_down', condition: 'Berganti arah, TO akhir < awal', scoresExample: '580 → 540 → 575 → 550' },
  { pattern: 'fluctuating_flat', condition: 'Berganti arah, awal & akhir serupa', scoresExample: '560 → 590 → 535 → 562' }
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
  const [editorStage, setEditorStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>('stage1');
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
      prioritySubtests: [
        {
          id: 'sim_1',
          name: subtestName,
          gapNum: toLatest - activeEvalConfig.thresholds.foundationScoreTarget,
          rgQuestionsDone: drillQuestions,
          lowestTopics: ['Materi Dasar #1', 'Materi Dasar #2']
        }
      ],
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 64 }}>
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <nav aria-label="breadcrumb" className="breadcrumbs">
            <Link to="/v2">Detail Checkpoint 1</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Kontrol Engine Panduan SA (White-Box)</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isCustomized && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#b54708',
                  background: '#fef0c7',
                  border: '1px solid #fedf89',
                  padding: '3px 10px',
                  borderRadius: 9999
                }}
              >
                Aturan Custom Aktif
              </span>
            )}
            <Link
              to="/v2"
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none' }}
            >
              <ArrowLeft size={14} /> Kembali ke Dashboard V2
            </Link>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 20 }}>
        {/* Header Banner */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
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
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#1078ca',
                  background: '#eff8ff',
                  border: '1px solid #b2ddff',
                  padding: '2px 10px',
                  borderRadius: 9999
                }}
              >
                WHITE-BOX · DETERMINISTIK · TERKONTROL
              </span>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>
                Inspeksi alasan tiap aturan terpicu sekaligus ubah ambang batas &amp; output wording secara langsung
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
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
                background: activeTab === 'simulator' ? '#1078ca' : 'transparent',
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
                background: activeTab === 'controls' ? '#1078ca' : 'transparent',
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
                background: activeTab === 'matrix' ? '#1078ca' : 'transparent',
                color: activeTab === 'matrix' ? '#ffffff' : '#475569'
              }}
            >
              <Table2 size={14} /> 3. Matriks 15 Pola
            </button>
          </div>
        </div>

        {saveToast && (
          <div
            style={{
              background: '#ecfdf3',
              border: '1px solid #a6f4c5',
              color: '#027a48',
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
                        border: isActive ? '1.5px solid #1078ca' : '1px solid #cbd5e1',
                        borderRadius: 8,
                        padding: '10px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: isActive ? '#1078ca' : '#0f172a', marginBottom: 4 }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{p.desc}</div>
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
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1078ca', marginBottom: 8 }}>
                    1. DATA TAHAP 1 (TRYOUT &amp; KEHADIRAN)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                    {toScores.map((val, idx) => (
                      <div key={idx}>
                        <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
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
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12.5 }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Subtes ≥ {targetBasis}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={8}
                        value={aboveTargetCount}
                        onChange={(e) => setAboveTargetCount(Math.max(0, Math.min(8, Number(e.target.value) || 0)))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12.5 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Kehadiran Kelas (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={attendanceRatePct}
                        onChange={(e) => setAttendanceRatePct(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12.5 }}
                      />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#334155', marginTop: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasLargeSubtestSwing}
                      onChange={(e) => setHasLargeSubtestSwing(e.target.checked)}
                    />
                    Ada subtes berfluktuasi ≥ {activeEvalConfig.thresholds.subtestSwingPts} poin
                  </label>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', marginBottom: 8 }}>
                    2. DATA TAHAP 2 (JURUSAN &amp; KELUARGA)
                  </div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                    Keselarasan Pilihan Siswa &amp; Orang Tua
                  </label>
                  <select
                    value={familyAlignment}
                    onChange={(e) => setFamilyAlignment(e.target.value as PresetConfig['familyAlignment'])}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, marginBottom: 8 }}
                  >
                    <option value="different_major">Konflik / Beda Rumpun Prodi</option>
                    <option value="aligned">Selaras antara Siswa &amp; Ortu</option>
                    <option value="location_limit">Terbatas Izin Lokasi / Luar Kota</option>
                    <option value="unconfirmed">Belum Terkonfirmasi Keluarga</option>
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#334155', marginBottom: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasMixedRumpun}
                      onChange={(e) => setHasMixedRumpun(e.target.checked)}
                    />
                    Pilihan 1–3 berbeda rumpun ilmu
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Gap Terbobot Terlebar
                      </label>
                      <input
                        type="number"
                        value={minGapToTarget}
                        onChange={(e) => setMinGapToTarget(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Min. Pembanding (Peserta)
                      </label>
                      <input
                        type="number"
                        value={minParticipantsCount}
                        onChange={(e) => setMinParticipantsCount(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#b54708', marginBottom: 8 }}>
                    3. DATA TAHAP 3 (SUBTES &amp; DRILL)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Skor TO Subtes
                      </label>
                      <input
                        type="number"
                        value={toLatest}
                        onChange={(e) => setToLatest(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Soal Drill Selesai
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={drillQuestions}
                        onChange={(e) => setDrillQuestions(Math.max(0, Number(e.target.value) || 0))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Jumlah Sesi Drill
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={drillSessions}
                        onChange={(e) => setDrillSessions(Math.max(0, Number(e.target.value) || 0))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Akurasi Drill (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={drillAccuracyPct}
                        onChange={(e) => setDrillAccuracyPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Live Deterministic Output Panel WITH Transparent Trace */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Stage 1 Output */}
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: '4px solid #1078ca', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Info size={16} /> Output Tahap 1: Mengulas Tren Skor &amp; Fondasi {targetBasis}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '2px 10px', borderRadius: 9999 }}>
                      Pola: {stage1Out.patternLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#0f172a', background: '#f8fafc', padding: '8px 10px', borderRadius: 6, marginBottom: 10 }}>
                    <strong>Temuan Numerik:</strong> {stage1Out.observation}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 10 }}>
                      <div><strong>• Ke Siswa:</strong> {stage1Out.studentTask}</div>
                      <div style={{ marginTop: 6 }}><strong>• Ke Orang Tua:</strong> {stage1Out.parentTask}</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: 10 }}>
                      <div><strong>• Langkah Lanjutan:</strong> {stage1Out.nextStep}</div>
                      {stage1Out.extraNotes.length > 0 && (
                        <ul style={{ margin: '6px 0 0', paddingLeft: 16, fontSize: 11.5, color: '#475569' }}>
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
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: '4px solid #0284c7', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={16} /> Output Tahap 2: Keselarasan Jurusan &amp; Keluarga
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 10px', borderRadius: 9999 }}>
                      {stage2Out.conditionLabel}
                    </span>
                  </div>
                  <ul style={{ margin: '0 0 8px', paddingLeft: 18, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                    {stage2Out.saTasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <div style={{ fontSize: 11.5, color: minParticipantsCount < activeEvalConfig.thresholds.minBenchmarkParticipants ? '#b42318' : '#175cd3', background: minParticipantsCount < activeEvalConfig.thresholds.minBenchmarkParticipants ? '#fef3f2' : '#eff8ff', border: `1px solid ${minParticipantsCount < activeEvalConfig.thresholds.minBenchmarkParticipants ? '#fecdca' : '#b2ddff'}`, borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} />
                    <span>{stage2Out.guardrailNote}</span>
                  </div>
                  <RuleTraceBox traces={stage2Out.traces} collapsible={false} editLinkTo="/engine?tab=controls" />
                </div>

                {/* Stage 3 Output */}
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: '4px solid #b54708', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#b54708', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Wrench size={16} /> Output Tahap 3: Subtes ({subtestName}) &amp; Pola Drill
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#b54708', background: '#fef0c7', padding: '2px 10px', borderRadius: 9999 }}>
                      {stage3SubOut.conditionLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#0f172a', background: '#fffcf5', border: '1px solid #fef0c7', padding: '8px 10px', borderRadius: 6, marginBottom: 8 }}>
                    <div><strong>Observasi Subtes:</strong> {stage3SubOut.observation}</div>
                    <div style={{ marginTop: 4 }}><strong>Tugas SA di Kartu Subtes:</strong> {stage3SubOut.saTask}</div>
                  </div>
                  {stage3OverallOut.mismatchNote && (
                    <div style={{ fontSize: 11.5, color: '#9a3412', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
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
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: '4px solid #027a48', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 800, color: '#027a48' }}>
                    <ShieldCheck size={16} /> Output Tahap 4: Penutupan Komitmen &amp; Checklist SA
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#334155', lineHeight: 1.55 }}>
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
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap'
              }}
            >
              <div style={{ fontSize: 12.5, color: '#334155' }}>
                <strong>Panel Kontrol Engine:</strong> Ubah ambang batas atau teks output di bawah, lalu klik <strong>Simpan &amp; Terapkan</strong> agar langsung mengubah panduan di Dashboard V2 dan Simulator.
                {hasUnsavedDraft && (
                  <span style={{ marginLeft: 8, color: '#b54708', fontWeight: 800 }}>• Ada perubahan belum disimpan</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                  style={{ fontSize: 12, padding: '6px 14px', background: '#1078ca', borderColor: '#1078ca' }}
                >
                  <Save size={14} /> Simpan &amp; Terapkan ke V2
                </button>
              </div>
            </div>

            {showImportBox && (
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Tempel JSON Konfigurasi Engine:</div>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows={5}
                  placeholder='{ "thresholds": { "toTolerancePts": 10 } }'
                  style={{ width: '100%', padding: 10, fontFamily: 'monospace', fontSize: 11.5, border: '1px solid #cbd5e1', borderRadius: 6 }}
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

            {/* Section A: Threshold Controls */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                A. Kontrol Ambang Batas Kondisi (Thresholds)
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px' }}>
                Menentukan kapan sebuah kondisi dianggap terpicu oleh sistem.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { key: 'toTolerancePts', label: 'Toleransi TO Datar (±poin)', def: DEFAULT_ENGINE_CONFIG.thresholds.toTolerancePts },
                  { key: 'foundationScoreTarget', label: 'Target Fondasi Subtes', def: DEFAULT_ENGINE_CONFIG.thresholds.foundationScoreTarget },
                  { key: 'subtestSwingPts', label: 'Batas Fluktuasi Subtes (poin)', def: DEFAULT_ENGINE_CONFIG.thresholds.subtestSwingPts },
                  { key: 'attendanceWarnPct', label: 'Ambang Peringatan Absensi (%)', def: DEFAULT_ENGINE_CONFIG.thresholds.attendanceWarnPct },
                  { key: 'wideWeightedGapPts', label: 'Gap Terbobot Lebar (≤ poin)', def: DEFAULT_ENGINE_CONFIG.thresholds.wideWeightedGapPts },
                  { key: 'minBenchmarkParticipants', label: 'Min. Peserta Pembanding', def: DEFAULT_ENGINE_CONFIG.thresholds.minBenchmarkParticipants },
                  { key: 'drillLowQuestions', label: 'Batas Drill Minim (< soal)', def: DEFAULT_ENGINE_CONFIG.thresholds.drillLowQuestions },
                  { key: 'drillLowAccuracyPct', label: 'Batas Akurasi Rendah (< %)', def: DEFAULT_ENGINE_CONFIG.thresholds.drillLowAccuracyPct },
                  { key: 'drillActiveHighGap', label: 'Gap Subtes Prioritas (≤ poin)', def: DEFAULT_ENGINE_CONFIG.thresholds.drillActiveHighGap },
                  { key: 'nearTargetGapPts', label: 'Batas Dekat Target (≥ poin)', def: DEFAULT_ENGINE_CONFIG.thresholds.nearTargetGapPts },
                  { key: 'drillMismatchHighQ', label: 'Ketimpangan: Subtes Aktif (≥ soal)', def: DEFAULT_ENGINE_CONFIG.thresholds.drillMismatchHighQ },
                  { key: 'drillMismatchLowQ', label: 'Ketimpangan: Prioritas (≤ soal)', def: DEFAULT_ENGINE_CONFIG.thresholds.drillMismatchLowQ }
                ].map((f) => {
                  const k = f.key as keyof EngineRuleConfig['thresholds'];
                  const val = draftConfig.thresholds[k];
                  const changed = val !== f.def;
                  return (
                    <div
                      key={f.key}
                      style={{
                        background: changed ? '#fffbeb' : '#f8fafc',
                        border: `1px solid ${changed ? '#fde68a' : '#e2e8f0'}`,
                        borderRadius: 8,
                        padding: '10px 12px'
                      }}
                    >
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        {f.label}
                      </label>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => updateThreshold(k, Number(e.target.value))}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, fontWeight: 700 }}
                      />
                      <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 4 }}>
                        Default: <strong>{f.def}</strong> {changed && <span style={{ color: '#b45309' }}>· Diubah</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section B: Output Wording Template Editor */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                    B. Editor Output Wording per Kondisi
                  </h2>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Edit langsung teks panduan SA yang muncul ketika suatu kondisi terpenuhi.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
                  {[
                    { id: 'stage1', label: 'Tahap 1 (15 Pola TO)' },
                    { id: 'stage2', label: 'Tahap 2 (Jurusan)' },
                    { id: 'stage3', label: 'Tahap 3 (5 Subtes)' },
                    { id: 'stage4', label: 'Tahap 4 (Penutupan)' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEditorStage(s.id as typeof editorStage)}
                      style={{
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: editorStage === s.id ? '#0f172a' : 'transparent',
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
                            border: active ? '1.5px solid #1078ca' : '1px solid #e2e8f0',
                            background: active ? '#eff8ff' : '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#1078ca' : '#0f172a' }}>{tpl.label}</div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>{p.condition}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1078ca' }}>
                      Edit Output Pola: {selectedPatternEdit}
                    </div>
                    {[
                      { field: 'label', title: 'Label Pola' },
                      { field: 'student', title: 'Tugas Fasilitasi ke Siswa' },
                      { field: 'parent', title: 'Tugas Fasilitasi ke Orang Tua' },
                      { field: 'nextStep', title: 'Arah Tindak Lanjut' }
                    ].map((item) => {
                      const fk = item.field as 'label' | 'student' | 'parent' | 'nextStep';
                      return (
                        <div key={item.field}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
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
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
                          />
                        </div>
                      );
                    })}
                  </div>
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
                      { key: 'lowParticipantsWarning', title: 'Peringatan Pembanding < Batas ({count}, {limit})' }
                    ] as const
                  ).map((item) => (
                    <div key={item.key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: 4 }}>
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
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
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
                      { id: 'high_acc_low_to', desc: 'Akurasi drill tinggi (≥ 70%) tapi skor TO masih drop' },
                      { id: 'active_drill_low_to', desc: 'Drill aktif tapi gap TO masih lebar' },
                      { id: 'near_target', desc: 'Gap ke target sudah dekat' },
                      { id: 'general_gap', desc: 'Kondisi umum lainnya' }
                    ] as { id: Stage3ConditionId; desc: string }[]
                  ).map((cond) => (
                    <div key={cond.id} style={{ background: '#fffcf5', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#b54708', marginBottom: 6 }}>
                        Kondisi: {cond.desc} ({cond.id})
                      </div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>
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
                        style={{ width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, marginBottom: 8 }}
                      />
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>
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
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
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
                    <div key={item.key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#027a48', display: 'block', marginBottom: 4 }}>
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
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }}
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
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                Matriks Tahap 1 — 15 Pola Riwayat Skor Tryout (Toleransi Aktif ±{activeEvalConfig.thresholds.toTolerancePts} Poin)
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>
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
                        <td style={{ fontSize: 11.5, color: '#475569' }}>{row.condition}</td>
                        <td><code style={{ fontSize: 11 }}>{row.scoresExample}</code></td>
                        <td style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                          <div><strong>Siswa:</strong> {res.studentTask}</div>
                          <div><strong>Ortu:</strong> {res.parentTask}</div>
                          <div style={{ color: '#1078ca' }}><strong>Tindak lanjut:</strong> {res.nextStep}</div>
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
