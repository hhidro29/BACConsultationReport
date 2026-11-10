import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitBranch, Sliders, Info, Building2, Wrench, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  analyzeStage1,
  analyzeStage2,
  analyzeStage3Subtest,
  analyzeStage3Overall,
  analyzeStage4,
  TryoutPattern
} from '../utils/saGuidelineEngine';

interface PresetConfig {
  id: string;
  label: string;
  desc: string;
  toScores: string[]; // string inputs for TO1..TO4 (empty = belum ada nilai)
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
    label: 'Garuda (Kasus Saat Ini)',
    desc: 'Skor turun konsisten 4 TO, konflik rumpun prodi (Farmasi vs Teknik Mesin), PK drill 5 soal & Literasi 0 soal.',
    toScores: ['601', '576', '561', '546'],
    attendanceRatePct: 81.8,
    hasLargeSubtestSwing: true,
    hasMixedRumpun: true,
    familyAlignment: 'different_major',
    minGapToTarget: -146,
    maxGapToTarget: -69,
    minParticipantsCount: 642,
    subtestName: 'Pengetahuan Kuantitatif (PK)',
    toLatest: 488,
    drillQuestions: 5,
    drillSessions: 1,
    drillAccuracyPct: 40
  },
  {
    id: 'four_above',
    label: '4 Subtes ≥ 600 + Absensi < 80%',
    desc: 'Tren naik konsisten, 4 subtes sudah mencapai ≥ 600, prodi selaras, tetapi kehadiran kelas di bawah 80%.',
    toScores: ['542', '568', '591', '614'],
    attendanceRatePct: 74,
    hasLargeSubtestSwing: false,
    hasMixedRumpun: false,
    familyAlignment: 'aligned',
    minGapToTarget: -18,
    maxGapToTarget: 24,
    minParticipantsCount: 820,
    subtestName: 'Penalaran Matematika (PM)',
    toLatest: 618,
    drillQuestions: 32,
    drillSessions: 5,
    drillAccuracyPct: 72
  },
  {
    id: 'recovery_zero',
    label: 'Recovery + Drill 0 Soal + Izin Lokasi',
    desc: 'Skor sempat turun lalu naik di TO terakhir, keluarga ragu soal merantau, dan drill aplikasi masih 0 soal.',
    toScores: ['590', '552', '540', '586'],
    attendanceRatePct: 88,
    hasLargeSubtestSwing: false,
    hasMixedRumpun: false,
    familyAlignment: 'location_limit',
    minGapToTarget: -65,
    maxGapToTarget: 12,
    minParticipantsCount: 540,
    subtestName: 'Literasi B. Indo & Inggris',
    toLatest: 505,
    drillQuestions: 0,
    drillSessions: 0,
    drillAccuracyPct: 0
  },
  {
    id: 'one_to_low_sample',
    label: 'Baru 1 TO + Pembanding < 500',
    desc: 'Baru mengikuti 1 kali tryout, pilihan jurusan belum terkonfirmasi keluarga, dan jumlah pembanding prodi < 500 peserta.',
    toScores: ['518', '', '', ''],
    attendanceRatePct: 91,
    hasLargeSubtestSwing: false,
    hasMixedRumpun: false,
    familyAlignment: 'unconfirmed',
    minGapToTarget: -120,
    maxGapToTarget: -95,
    minParticipantsCount: 310,
    subtestName: 'Penalaran Umum (PU)',
    toLatest: 495,
    drillQuestions: 28,
    drillSessions: 6,
    drillAccuracyPct: 64
  }
];

const ALL_15_PATTERNS: { pattern: TryoutPattern; name: string; condition: string; scoresExample: string }[] = [
  { pattern: 'no_data', name: 'Belum ada nilai', condition: 'Jumlah skor TO = 0', scoresExample: '—' },
  { pattern: 'one_result', name: 'Baru satu nilai', condition: 'Jumlah skor TO = 1', scoresExample: '518' },
  { pattern: 'initial_up', name: 'Dua hasil: naik', condition: '2 TO, selisih > +5 poin', scoresExample: '530 → 565' },
  { pattern: 'initial_down', name: 'Dua hasil: turun', condition: '2 TO, selisih < -5 poin', scoresExample: '570 → 535' },
  { pattern: 'initial_flat', name: 'Dua hasil: tetap', condition: '2 TO, selisih dalam rentang ±5 poin', scoresExample: '550 → 553' },
  { pattern: 'steady_up', name: 'Naik konsisten', condition: '≥ 3 TO, semua perubahan antar-TO > +5', scoresExample: '520 → 545 → 575 → 602' },
  { pattern: 'steady_down', name: 'Turun konsisten', condition: '≥ 3 TO, semua perubahan antar-TO < -5', scoresExample: '601 → 576 → 561 → 546' },
  { pattern: 'steady_flat', name: 'Tetap sepanjang riwayat', condition: '≥ 3 TO, semua perubahan dalam ±5', scoresExample: '552 → 554 → 550 → 553' },
  { pattern: 'up_with_pauses', name: 'Cenderung naik, diselingi tetap', condition: '≥ 3 TO, ada naik & datar tanpa turun', scoresExample: '530 → 532 → 565 → 590' },
  { pattern: 'down_with_pauses', name: 'Cenderung turun, diselingi tetap', condition: '≥ 3 TO, ada turun & datar tanpa naik', scoresExample: '590 → 560 → 558 → 532' },
  { pattern: 'recovery', name: 'Sempat turun, lalu naik di TO terakhir', condition: 'Ada penurunan lalu TO terakhir naik > +5', scoresExample: '590 → 552 → 540 → 586' },
  { pattern: 'reversal_down', name: 'Sempat naik, lalu turun di TO terakhir', condition: 'Ada kenaikan lalu TO terakhir turun < -5', scoresExample: '530 → 575 → 595 → 555' },
  { pattern: 'fluctuating_up', name: 'Naik-turun (terakhir lebih tinggi dari awal)', condition: 'Berganti arah, TO akhir - TO awal > +5', scoresExample: '540 → 580 → 545 → 570' },
  { pattern: 'fluctuating_down', name: 'Naik-turun (terakhir lebih rendah dari awal)', condition: 'Berganti arah, TO akhir - TO awal < -5', scoresExample: '580 → 540 → 575 → 550' },
  { pattern: 'fluctuating_flat', name: 'Naik-turun (awal & akhir serupa)', condition: 'Berganti arah, selisih awal & akhir dalam ±5', scoresExample: '560 → 590 → 535 → 562' }
];

export const EngineMatrixPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'matrix'>('simulator');
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

  // Build synthetic subtest rows matching user simulation parameters
  const numericScores = toScores.map((s) => Number(s)).filter((n) => !Number.isNaN(n) && n > 0);
  const sampleNames = ['PPU', 'PM', 'PBM', 'LBING', 'LBI Soshum', 'LBI Saintek', 'PU', 'PK'];
  const syntheticSubtests = sampleNames.map((name, idx) => {
    const isAbove = idx < aboveTargetCount;
    const latest = isAbove ? 615 + idx * 5 : 530 - idx * 8;
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

  const stage1Out = analyzeStage1({
    toScores: numericScores,
    subtestRows: syntheticSubtests,
    attendanceRatePct
  });

  const stage2Out = analyzeStage2({
    hasMixedRumpun,
    familyAlignment,
    minGapToTarget,
    maxGapToTarget,
    minParticipantsCount
  });

  const simulatedSubInput = {
    id: 'sim_sub',
    name: subtestName,
    toLatest,
    gapTo600: toLatest - 600,
    drillQuestions,
    drillSessions,
    drillAccuracyPct
  };

  const stage3SubOut = analyzeStage3Subtest(simulatedSubInput);
  const stage3OverallOut = analyzeStage3Overall([
    {
      id: 'pu',
      name: 'Penalaran Umum (PU)',
      toLatest: 465,
      gapTo600: -135,
      drillQuestions: 35,
      drillSessions: 7,
      drillAccuracyPct: 63
    },
    simulatedSubInput
  ]);

  const stage4Out = analyzeStage4(
    hasMixedRumpun || familyAlignment === 'location_limit' || familyAlignment === 'unconfirmed',
    drillQuestions <= 5
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 64 }}>
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <nav aria-label="breadcrumb" className="breadcrumbs">
            <Link to="/v2">Detail Checkpoint 1</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Engine Panduan SA (Kondisi → Output)</span>
          </nav>
          <Link
            to="/v2"
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard V2
          </Link>
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
                DETERMINISTIK · NON-AI-CENTERED
              </span>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>
                Setiap perubahan data mengubah panduan fasilitasi SA secara konsisten
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Engine Panduan SA: Simulator Kondisi → Output
            </h1>
            <p style={{ fontSize: 12.5, color: '#475569', margin: '4px 0 0' }}>
              Ubah kondisi skor TO, jumlah subtes ≥ 600, keselarasan prodi keluarga, atau data drill untuk melihat output panduan yang dihasilkan mesin aturan untuk Kakak Asuh.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              style={{
                border: 'none',
                borderRadius: 6,
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: activeTab === 'simulator' ? '#1078ca' : 'transparent',
                color: activeTab === 'simulator' ? '#ffffff' : '#475569'
              }}
            >
              <Sliders size={14} /> Simulator Kondisi → Output
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              style={{
                border: 'none',
                borderRadius: 6,
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: activeTab === 'matrix' ? '#1078ca' : 'transparent',
                color: activeTab === 'matrix' ? '#ffffff' : '#475569'
              }}
            >
              <GitBranch size={14} /> Tabel Matriks Lengkap (15 Pola)
            </button>
          </div>
        </div>

        {activeTab === 'simulator' ? (
          <div>
            {/* Preset Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                Pilih Skenario Cepat (atau ubah angka secara manual di panel kiri):
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

            {/* Split Grid: Left Controls, Right Deterministic Outputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 18, alignItems: 'start' }}>
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
                    1. KONDISI TAHAP 1 (TRYOUT &amp; KEHADIRAN)
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
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            fontSize: 12.5
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Subtes ≥ 600 (0–8)
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
                    Ada subtes berfluktuasi ≥ 100 poin (misal PK 668 → 488)
                  </label>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', marginBottom: 8 }}>
                    2. KONDISI TAHAP 2 (JURUSAN &amp; KELUARGA)
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
                    3. KONDISI TAHAP 3 (SUBTES &amp; DRILL)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 3 }}>
                        Skor TO Terakhir Subtes
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

              {/* Right Live Deterministic Output Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Stage 1 Output */}
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderLeft: '4px solid #1078ca', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Info size={16} /> Output Tahap 1: Mengulas Tren Skor &amp; Fondasi 600
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
                  <div style={{ fontSize: 11.5, color: minParticipantsCount < 500 ? '#b42318' : '#175cd3', background: minParticipantsCount < 500 ? '#fef3f2' : '#eff8ff', border: `1px solid ${minParticipantsCount < 500 ? '#fecdca' : '#b2ddff'}`, borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} />
                    <span>{stage2Out.guardrailNote}</span>
                  </div>
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
                  <div style={{ fontSize: 11.5, color: '#475569' }}>
                    <strong>Rambu Baca Metrik:</strong> {stage3OverallOut.guardrailNote}
                  </div>
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
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Complete Condition -> Output Matrix */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Matrix 1: 15 Tryout Patterns */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                1. Matriks Tahap 1 — 15 Pola Riwayat Skor Tryout (Toleransi Tetap ±5 Poin)
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>
                Setiap pola menghasilkan wording netral untuk siswa, orang tua, dan langkah lanjutan tanpa menuduh penyebab.
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Nama Pola</th>
                    <th style={{ width: '22%' }}>Jika Kondisi Seperti Ini</th>
                    <th style={{ width: '16%' }}>Contoh Skor</th>
                    <th>Output Tugas Fasilitasi SA</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_15_PATTERNS.map((row) => {
                    const exNums =
                      row.scoresExample === '—'
                        ? []
                        : row.scoresExample.split('→').map((x) => Number(x.trim()));
                    const res = analyzeStage1({
                      toScores: exNums,
                      subtestRows: [],
                      attendanceRatePct: 85
                    });
                    return (
                      <tr key={row.pattern}>
                        <td><strong>{row.name}</strong></td>
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

            {/* Matrix 2: Stage 2 & Stage 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 18 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0284c7', margin: '0 0 10px' }}>
                  2. Matriks Tahap 2 — Pilihan Jurusan &amp; Keluarga
                </h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Jika Kondisi Seperti Ini</th>
                      <th>Output Panduan SA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Rumpun berbeda</strong> antara Pilihan 1–3 atau konflik keinginan keluarga</td>
                      <td style={{ fontSize: 11.5 }}>Konfirmasi minat utama siswa &amp; harapan ortu antarprodi sebelum membahas cadangan; cek batasan lokasi kampus.</td>
                    </tr>
                    <tr>
                      <td><strong>Pilihan selaras</strong> &amp; gap terbobot masih &le; -100</td>
                      <td style={{ fontSize: 11.5 }}>Konfirmasi prioritas Pilihan 1–3; bahas komitmen latihan bertahap tanpa memaksa turun jurusan di CP1.</td>
                    </tr>
                    <tr>
                      <td><strong>Melampaui target acuan</strong> (gap &ge; 0)</td>
                      <td style={{ fontSize: 11.5 }}>Bahas konsistensi skor dan tawarkan cek alternatif lewat Simulasi bila siswa berminat.</td>
                    </tr>
                    <tr>
                      <td><strong>Pembanding &lt; 500 peserta</strong></td>
                      <td style={{ fontSize: 11.5 }}>Tampilkan peringatan: jangan dipakai sebagai klaim posisi aman maupun jaminan SNPMB.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 18 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#b54708', margin: '0 0 10px' }}>
                  3. Matriks Tahap 3 — 5 Kondisi Subtes &amp; Drill
                </h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Jika Kondisi Seperti Ini</th>
                      <th>Output Tugas Kartu Subtes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Drill aplikasi = 0 soal</strong></td>
                      <td style={{ fontSize: 11.5 }}>Konfirmasi apakah siswa berlatih dari sumber luar atau terkendala teknis, tanpa menyimpulkan siswa belum belajar.</td>
                    </tr>
                    <tr>
                      <td><strong>Drill &lt; 15 soal &amp; akurasi &lt; 50%</strong></td>
                      <td style={{ fontSize: 11.5 }}>Tinjau 3 topik akurasi terendah bersama siswa dan bahas penguatan konsep dasar di Klinik PR.</td>
                    </tr>
                    <tr>
                      <td><strong>Drill &ge; 15 soal &amp; gap TO &le; -90</strong></td>
                      <td style={{ fontSize: 11.5 }}>Bandingkan cara siswa mengerjakan latihan vs saat tryout (manajemen waktu, ketelitian premis, variasi soal).</td>
                    </tr>
                    <tr>
                      <td><strong>Jarak ke 600 &ge; -30</strong> (dekat target)</td>
                      <td style={{ fontSize: 11.5 }}>Pertahankan ritme latihan pada topik yang masih salah agar stabil melampaui 600.</td>
                    </tr>
                    <tr>
                      <td><strong>Ketimpangan drill</strong> (subtes A &ge; 20 soal, subtes gap &le; -90 baru &le; 5 soal)</td>
                      <td style={{ fontSize: 11.5 }}>Munculkan pengingat latihan semu: tinjau alasan pemilihan latihan agar porsi pindah ke subtes prioritas.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
