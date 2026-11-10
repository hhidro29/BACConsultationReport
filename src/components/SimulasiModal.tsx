import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Compass, Info, RotateCcw, Search, CheckCircle2, ArrowRightLeft, Plus, MapPin } from 'lucide-react';
import { Checkpoint1Student, ProgramChoice } from '../data/garudaData';
import {
  PROGRAM_CATALOG,
  CatalogProgram,
  ScoreBasis,
  OpportunityZone,
  SimulatedProgramResult,
  computeSimulatedProgram,
  matchCatalogProgram,
  getStudentSubtestScoreMap,
  getZoneFromGap,
  SUBTEST_LABELS
} from '../data/programCatalog';

interface SimulasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Checkpoint1Student;
  activePrograms: ProgramChoice[];
  onApplyPrograms: (newPrograms: ProgramChoice[]) => void;
  onResetPrograms: () => void;
  isCustomized: boolean;
}

type RumpunFilter = 'interest' | 'saintek' | 'soshum' | 'all';
type LocationFilter = 'all' | 'local' | 'out_of_town';
type ZoneFilter = 'all' | 'realistic' | 'target' | 'reach';

const getZoneTheme = (zone: OpportunityZone) => {
  switch (zone) {
    case 'safe':
      return {
        textColor: '#027a48',
        borderColor: '#a6f4c5',
        boxBg: '#ecfdf3',
        boxBorder: '#a6f4c5'
      };
    case 'near':
      return {
        textColor: '#175cd3',
        borderColor: '#b2ddff',
        boxBg: '#eff8ff',
        boxBorder: '#b2ddff'
      };
    case 'target':
      return {
        textColor: '#b54708',
        borderColor: '#fedf89',
        boxBg: '#fffcf5',
        boxBorder: '#fef0c7'
      };
    case 'reach':
    default:
      return {
        textColor: '#b42318',
        borderColor: '#fecdca',
        boxBg: '#fffbfa',
        boxBorder: '#fee4e2'
      };
  }
};

export const SimulasiModal: React.FC<SimulasiModalProps> = ({
  isOpen,
  onClose,
  student,
  activePrograms,
  onApplyPrograms,
  onResetPrograms,
  isCustomized
}) => {
  const [scoreBasis, setScoreBasis] = useState<ScoreBasis>('to4');
  const [rumpunFilter, setRumpunFilter] = useState<RumpunFilter>('interest');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [openApplyDropdownId, setOpenApplyDropdownId] = useState<string | null>(null);

  // Determine student's primary rumpun from active Pilihan 1 or student identity
  const studentRumpun = useMemo<'saintek' | 'soshum'>(() => {
    const p1 = activePrograms[0];
    if (p1 && (p1.rumpun === 'saintek' || p1.rumpun === 'soshum')) return p1.rumpun;
    if (student.identity.major.toLowerCase().includes('ips') || student.identity.major.toLowerCase().includes('sosial')) {
      return 'soshum';
    }
    return 'saintek';
  }, [activePrograms, student]);

  // Reset modal internal UI filters when switching student or opening
  useEffect(() => {
    if (!isOpen) return;
    setRumpunFilter('interest');
    setLocationFilter('all');
    setZoneFilter('all');
    setSearchQuery('');
    setCandidateId(null);
    setOpenApplyDropdownId(null);
  }, [student.id, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openApplyDropdownId) {
          setOpenApplyDropdownId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose, openApplyDropdownId]);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3200);
  };

  // Pre-compute simulation results for all catalog programs
  const allSimulated = useMemo<SimulatedProgramResult[]>(() => {
    return PROGRAM_CATALOG.map((prog) => computeSimulatedProgram(student, prog, scoreBasis));
  }, [student, scoreBasis]);

  // Map active Pilihan 1, 2, 3 to simulated cards
  const activeColumns = useMemo(() => {
    const scoreMap = getStudentSubtestScoreMap(student.subtests, scoreBasis);

    return [0, 1, 2].map((idx) => {
      const choice = activePrograms[idx];
      if (!choice) return null;

      const matched = matchCatalogProgram(choice);
      if (matched) {
        const sim = allSimulated.find((s) => s.catalog.id === matched.id);
        if (sim) {
          return {
            slotIndex: idx,
            priorityLabel: `Pilihan ${idx + 1}`,
            sim,
            choice
          };
        }
      }

      // Fallback if choice is not in catalog
      const fallbackSubkeys: ('pk' | 'pu' | 'pm')[] = ['pk', 'pu', 'pm'];
      const { zone, zoneLabel, statusText } = getZoneFromGap(choice.gap);
      const fallbackSim: SimulatedProgramResult = {
        catalog: {
          id: `custom_${idx}`,
          prodi: choice.prodi,
          univ: choice.univ,
          shortUniv: choice.univ,
          degree: (choice.degree as 'S1' | 'D4' | 'D3') || 'S1',
          rumpun: choice.rumpun === 'soshum' ? 'soshum' : 'saintek',
          clusterLabel: 'Pilihan Siswa',
          city: choice.city,
          regionGroup: 'jabodetabek_jabar',
          targetScore: choice.targetScore,
          quota2026: 60,
          applicants2025: 1200,
          tightness: choice.tightness,
          participantsCount: choice.participantsCount,
          supportSubjects: choice.supportSubjects,
          prioritySubtests: fallbackSubkeys,
          subtestWeights: { pk: 0.25, pu: 0.22, pm: 0.18, lbi_a: 0.1, lbe: 0.1, pbm: 0.08, ppu: 0.05, lbi_s: 0.02 }
        },
        weightedScore: choice.weightedScore,
        gap: choice.gap,
        zone,
        zoneLabel,
        statusText,
        isOutOfTown: choice.isOutOfTown,
        prioritySubtestDetails: fallbackSubkeys.map((k) => ({
          key: k,
          shortLabel: SUBTEST_LABELS[k].short,
          name: SUBTEST_LABELS[k].full,
          studentScore: Math.round(scoreMap[k] || 0),
          weightPct: 20
        })),
        asProgramChoice: (priorityLabel: string) => ({ ...choice, priority: priorityLabel })
      };

      return {
        slotIndex: idx,
        priorityLabel: `Pilihan ${idx + 1}`,
        sim: fallbackSim,
        choice
      };
    });
  }, [activePrograms, allSimulated, student.subtests, scoreBasis]);

  const candidateSim = useMemo(() => {
    if (!candidateId) return null;
    return allSimulated.find((s) => s.catalog.id === candidateId) || null;
  }, [candidateId, allSimulated]);

  // Helper to identify if a catalog program is currently in Pilihan 1, 2, or 3
  const getActiveSlotLabel = (prog: CatalogProgram): string | null => {
    for (let i = 0; i < activePrograms.length; i++) {
      const m = matchCatalogProgram(activePrograms[i]);
      if (m && m.id === prog.id) return `Pilihan ${i + 1}`;
    }
    return null;
  };

  // Apply a simulated program to slot 0, 1, or 2
  const handleSetChoice = (sim: SimulatedProgramResult, targetSlotIdx: number) => {
    const priorityLabel = `Pilihan ${targetSlotIdx + 1}`;
    const updated = [...activePrograms];
    updated[targetSlotIdx] = sim.asProgramChoice(priorityLabel);
    onApplyPrograms(updated);
    setOpenApplyDropdownId(null);
    showToast(`${priorityLabel} diperbarui menjadi ${sim.catalog.prodi} — ${sim.catalog.shortUniv}`);
  };

  // Filtered and sorted catalog for bottom exploration table
  const filteredCatalog = useMemo(() => {
    return allSimulated
      .filter((item) => {
        // Rumpun filter
        if (rumpunFilter === 'interest' && item.catalog.rumpun !== studentRumpun) return false;
        if (rumpunFilter === 'saintek' && item.catalog.rumpun !== 'saintek') return false;
        if (rumpunFilter === 'soshum' && item.catalog.rumpun !== 'soshum') return false;

        // Location filter
        if (locationFilter === 'local' && item.isOutOfTown) return false;
        if (locationFilter === 'out_of_town' && !item.isOutOfTown) return false;

        // Zone filter
        if (zoneFilter === 'realistic' && item.gap < -30) return false;
        if (zoneFilter === 'target' && (item.gap < -90 || item.gap >= -30)) return false;
        if (zoneFilter === 'reach' && item.gap >= -90) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchText = `${item.catalog.prodi} ${item.catalog.univ} ${item.catalog.city} ${item.catalog.clusterLabel}`.toLowerCase();
          if (!matchText.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => b.gap - a.gap); // Closest / most realistic at top
  }, [allSimulated, rumpunFilter, locationFilter, zoneFilter, searchQuery, studentRumpun]);

  // Student regular average / latest TO4 for quick reference
  const studentCity = student.identity.branch.split('-')[0].trim();
  const latestTO4 = student.identity.toScores[student.identity.toScores.length - 1] || 0;
  const avgTO = Math.round(
    student.identity.toScores.reduce((acc, v) => acc + v, 0) / (student.identity.toScores.length || 1)
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="pdf-modal-backdrop open"
      aria-hidden="false"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '96%',
          maxWidth: 1180,
          maxHeight: '92vh',
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.28)'
        }}
      >
        {/* Top Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '13px 20px',
            background: '#0f172a',
            color: '#ffffff',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Compass size={19} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Simulasi Peluang &amp; Komparasi Prodi PTN</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.16)',
                color: '#7dd3fc',
                padding: '2.5px 10px',
                borderRadius: 9999
              }}
            >
              {student.identity.name} · Domisili {studentCity} · Minat {studentRumpun === 'saintek' ? 'Saintek' : 'Soshum'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isCustomized && (
              <button
                type="button"
                onClick={() => {
                  onResetPrograms();
                  showToast('Pilihan jurusan dikembalikan ke data awal siswa.');
                }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: '#fde68a',
                  borderRadius: 6,
                  padding: '5px 11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={13} /> Reset Pilihan Awal
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: 6,
                padding: '5px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <X size={15} /> Tutup
            </button>
          </div>
        </div>

        {/* Score Basis & Quick Filters Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          {/* Basis Skor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475467' }}>Basis Hitung Skor:</span>
            <button
              type="button"
              onClick={() => setScoreBasis('to4')}
              className={`btn ${scoreBasis === 'to4' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 10px', fontSize: 11.5 }}
            >
              TO 4 Terakhir ({latestTO4})
            </button>
            <button
              type="button"
              onClick={() => setScoreBasis('median')}
              className={`btn ${scoreBasis === 'median' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 10px', fontSize: 11.5 }}
            >
              Median 4 TO
            </button>
            <button
              type="button"
              onClick={() => setScoreBasis('avg')}
              className={`btn ${scoreBasis === 'avg' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 10px', fontSize: 11.5 }}
            >
              Rata-rata ({avgTO})
            </button>
          </div>

          {/* Search & Toast Feedback */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {actionToast && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#027a48',
                  background: '#ecfdf3',
                  border: '1px solid #a6f4c5',
                  padding: '4px 10px',
                  borderRadius: 6
                }}
              >
                <CheckCircle2 size={13} /> {actionToast}
              </span>
            )}
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#64748b" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Cari prodi / PTN / kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '5px 10px 5px 28px',
                  fontSize: 12,
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  width: 210,
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a'
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Scrollable Workspace */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {/* ========================================================= */}
          {/* BAGIAN 1: HEAD-TO-HEAD COMPARISON MATRIX (4 KOLOM SEJAJAR) */}
          {/* ========================================================= */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowRightLeft size={15} color="#1078ca" />
                  Komparasi Berdampingan (Head-to-Head Matrix)
                </h3>
                <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>
                  Bandingkan skor terbobot, keketatan, lokasi, dan kecocokan 3 subtes penentu antara pilihan aktif dengan kandidat alternatif.
                </p>
              </div>
              {candidateSim && (
                <button
                  type="button"
                  onClick={() => setCandidateId(null)}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '3px 9px',
                    cursor: 'pointer'
                  }}
                >
                  Kosongkan Kandidat Pembanding
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {/* 3 Kolom Pilihan Aktif */}
              {activeColumns.map((col) => {
                if (!col) return null;
                const { sim, priorityLabel, slotIndex } = col;
                const theme = getZoneTheme(sim.zone);

                return (
                  <div
                    key={`active_${slotIndex}`}
                    style={{
                      background: '#ffffff',
                      border: `1.5px solid ${theme.borderColor}`,
                      borderRadius: 10,
                      padding: 13,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: theme.textColor,
                            background: theme.boxBg,
                            border: `1px solid ${theme.borderColor}`,
                            padding: '2px 7px',
                            borderRadius: 4,
                            textTransform: 'uppercase'
                          }}
                        >
                          {priorityLabel}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: '#475569',
                            background: '#f1f5f9',
                            padding: '2px 7px',
                            borderRadius: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}
                        >
                          <MapPin size={10} /> {sim.isOutOfTown ? 'Luar Kota' : 'Satu Wilayah'}
                        </span>
                      </div>

                      {/* Prodi & Kampus (Netral Slate) */}
                      <div style={{ minHeight: 46 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                          {sim.catalog.prodi}
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                          {sim.catalog.univ} · {sim.catalog.city}
                        </div>
                      </div>

                      {/* Box Skor Terbobot vs Target (Netral Slate Background) */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          padding: '8px 10px',
                          marginTop: 8,
                          marginBottom: 9
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Skor Terbobot</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{sim.weightedScore}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Acuan</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>{sim.catalog.targetScore}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Selisih</div>
                            <div style={{ fontSize: 13.5, fontWeight: 800, color: theme.textColor, lineHeight: 1.2 }}>
                              {sim.gap > 0 ? `+${sim.gap}` : sim.gap}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: 6, paddingTop: 5, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
                          <span>Keketatan: <strong style={{ color: '#0f172a' }}>{sim.catalog.tightness}</strong></span>
                          <span>Kuota: <strong style={{ color: '#0f172a' }}>{sim.catalog.quota2026}</strong></span>
                        </div>
                      </div>

                      {/* 3 Subtes Penentu & Skor Siswa Saat Ini */}
                      <div style={{ fontSize: 11, marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                          3 Subtes Pembobot Utama (Skor Anda):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {sim.prioritySubtestDetails.map((sub) => (
                            <div
                              key={sub.key}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#f8fafc',
                                padding: '3px 7px',
                                borderRadius: 4,
                                border: '1px solid #f1f5f9'
                              }}
                            >
                              <span style={{ color: '#475569' }}>
                                <strong style={{ color: '#0f172a' }}>{sub.shortLabel}</strong> ({sub.weightPct}%)
                              </span>
                              <span style={{ fontWeight: 700, color: sub.studentScore >= 600 ? '#027a48' : '#0f172a' }}>
                                {sub.studentScore}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Status & Mapel Rapor */}
                    <div style={{ paddingTop: 7, borderTop: '1px dashed #e2e8f0', fontSize: 10.5, color: '#475569' }}>
                      <div>
                        Rapor SNBP: <strong style={{ color: '#0f172a' }}>{sim.catalog.supportSubjects.join(', ')}</strong>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: theme.textColor,
                            background: theme.boxBg,
                            border: `1px solid ${theme.boxBorder}`,
                            padding: '1.5px 7px',
                            borderRadius: 9999,
                            display: 'inline-block'
                          }}
                        >
                          {sim.zoneLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Kolom ke-4: Kandidat Pembanding */}
              {candidateSim ? (
                (() => {
                  const theme = getZoneTheme(candidateSim.zone);
                  return (
                    <div
                      style={{
                        background: '#ffffff',
                        border: `2px dashed ${theme.borderColor}`,
                        borderRadius: 10,
                        padding: 13,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 6px rgba(16, 120, 202, 0.08)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: theme.textColor,
                              background: theme.boxBg,
                              border: `1px solid ${theme.borderColor}`,
                              padding: '2px 7px',
                              borderRadius: 4,
                              textTransform: 'uppercase'
                            }}
                          >
                            Kandidat Banding
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#475569',
                              background: '#f1f5f9',
                              padding: '2px 7px',
                              borderRadius: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3
                            }}
                          >
                            <MapPin size={10} /> {candidateSim.isOutOfTown ? 'Luar Kota' : 'Satu Wilayah'}
                          </span>
                        </div>

                        <div style={{ minHeight: 46 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                            {candidateSim.catalog.prodi}
                          </div>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                            {candidateSim.catalog.univ} · {candidateSim.catalog.city}
                          </div>
                        </div>

                        <div
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            padding: '8px 10px',
                            marginTop: 8,
                            marginBottom: 9
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div>
                              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Skor Terbobot</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{candidateSim.weightedScore}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Acuan</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>{candidateSim.catalog.targetScore}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Selisih</div>
                              <div style={{ fontSize: 13.5, fontWeight: 800, color: theme.textColor, lineHeight: 1.2 }}>
                                {candidateSim.gap > 0 ? `+${candidateSim.gap}` : candidateSim.gap}
                              </div>
                            </div>
                          </div>
                          <div style={{ marginTop: 6, paddingTop: 5, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
                            <span>Keketatan: <strong style={{ color: '#0f172a' }}>{candidateSim.catalog.tightness}</strong></span>
                            <span>Kuota: <strong style={{ color: '#0f172a' }}>{candidateSim.catalog.quota2026}</strong></span>
                          </div>
                        </div>

                        <div style={{ fontSize: 11, marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            3 Subtes Pembobot Utama (Skor Anda):
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {candidateSim.prioritySubtestDetails.map((sub) => (
                              <div
                                key={sub.key}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: '#f8fafc',
                                  padding: '3px 7px',
                                  borderRadius: 4,
                                  border: '1px solid #f1f5f9'
                                }}
                              >
                                <span style={{ color: '#475569' }}>
                                  <strong style={{ color: '#0f172a' }}>{sub.shortLabel}</strong> ({sub.weightPct}%)
                                </span>
                                <span style={{ fontWeight: 700, color: sub.studentScore >= 600 ? '#027a48' : '#0f172a' }}>
                                  {sub.studentScore}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quick Apply Buttons */}
                      <div style={{ paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                          Terapkan Kandidat Ini ke Formulasi:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                          {[0, 1, 2].map((slotIdx) => (
                            <button
                              key={slotIdx}
                              type="button"
                              onClick={() => handleSetChoice(candidateSim, slotIdx)}
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: '#1078ca',
                                background: '#eff8ff',
                                border: '1px solid #b2ddff',
                                borderRadius: 5,
                                padding: '4px 0',
                                cursor: 'pointer'
                              }}
                            >
                              Pil. {slotIdx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    color: '#64748b'
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8
                    }}
                  >
                    <Plus size={18} color="#475569" />
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Slot Kandidat Pembanding
                  </div>
                  <p style={{ fontSize: 11, lineHeight: 1.45, margin: 0 }}>
                    Klik tombol <strong>+ Bandingkan</strong> pada salah satu prodi di katalog bawah untuk menjajarkannya secara langsung dengan Pilihan 1–3.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* BAGIAN 2: KATALOG EKSPLORASI & REKOMENDASI ALTERNATIF     */}
          {/* ========================================================= */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Katalog Eksplorasi &amp; Alternatif ({filteredCatalog.length} Prodi · Diurutkan dari Peluang Terdekat)
              </h3>

              {/* Filter Controls */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Filter Rumpun */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', background: '#f1f5f9', padding: 3, borderRadius: 6 }}>
                  {(
                    [
                      { id: 'interest', label: `Minat (${studentRumpun === 'saintek' ? 'Saintek' : 'Soshum'})` },
                      { id: 'saintek', label: 'Saintek' },
                      { id: 'soshum', label: 'Soshum' },
                      { id: 'all', label: 'Semua' }
                    ] as { id: RumpunFilter; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRumpunFilter(opt.id)}
                      style={{
                        fontSize: 11,
                        fontWeight: rumpunFilter === opt.id ? 700 : 500,
                        background: rumpunFilter === opt.id ? '#ffffff' : 'transparent',
                        color: rumpunFilter === opt.id ? '#1078ca' : '#475569',
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 8px',
                        boxShadow: rumpunFilter === opt.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Filter Wilayah */}
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value as LocationFilter)}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#334155',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">📍 Semua Lokasi</option>
                  <option value="local">🏠 Satu Wilayah ({studentCity})</option>
                  <option value="out_of_town">✈️ Luar Kota</option>
                </select>

                {/* Filter Zona */}
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value as ZoneFilter)}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#334155',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">🎯 Semua Zona Peluang</option>
                  <option value="realistic">🟢/🔵 Aman &amp; Mendekati (≥ -30)</option>
                  <option value="target">🟠 Target Bertahap (-31 s.d. -90)</option>
                  <option value="reach">🔴 Ambisius (&lt; -90)</option>
                </select>
              </div>
            </div>

            <div className="table-container" style={{ marginTop: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Program Studi &amp; Perguruan Tinggi</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Skor Terbobot</th>
                    <th style={{ width: '11%', textAlign: 'center' }}>Target Acuan</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Selisih</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>Kompetisi &amp; Lokasi</th>
                    <th style={{ width: '21%', textAlign: 'right' }}>Aksi Komparasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCatalog.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: 12.5 }}>
                        Tidak ada program studi yang sesuai dengan kombinasi filter saat ini. Coba ubah filter rumpun atau zona peluang.
                      </td>
                    </tr>
                  ) : (
                    filteredCatalog.map((sim) => {
                      const activeLabel = getActiveSlotLabel(sim.catalog);
                      const isCandidate = candidateId === sim.catalog.id;
                      const theme = getZoneTheme(sim.zone);
                      const isDropdownOpen = openApplyDropdownId === sim.catalog.id;

                      return (
                        <tr
                          key={sim.catalog.id}
                          style={{
                            background: isCandidate ? '#f0f9ff' : activeLabel ? '#f8fafc' : undefined
                          }}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <strong style={{ color: '#0f172a', fontSize: 12.5 }}>
                                {sim.catalog.prodi} — {sim.catalog.shortUniv}
                              </strong>
                              {activeLabel && (
                                <span
                                  style={{
                                    fontSize: 9.5,
                                    fontWeight: 700,
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    padding: '1px 6px',
                                    borderRadius: 4
                                  }}
                                >
                                  {activeLabel}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                              {sim.catalog.clusterLabel} · Subtes: {sim.prioritySubtestDetails.map((d) => d.shortLabel).join(', ')}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 13.5, color: '#0f172a' }}>
                            {sim.weightedScore}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#475569' }}>
                            {sim.catalog.targetScore}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 12,
                                color: theme.textColor,
                                background: theme.boxBg,
                                border: `1px solid ${theme.boxBorder}`,
                                padding: '2px 8px',
                                borderRadius: 9999,
                                display: 'inline-block'
                              }}
                            >
                              {sim.gap > 0 ? `+${sim.gap}` : sim.gap} poin
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: 11, color: '#334155' }}>
                            <div>
                              <strong>{sim.catalog.tightness}</strong> · {sim.catalog.quota2026} kursi
                            </div>
                            <div style={{ color: '#64748b', marginTop: 2 }}>
                              {sim.catalog.city} ({sim.isOutOfTown ? 'Luar Kota' : 'Satu Wilayah'})
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                              <button
                                type="button"
                                onClick={() => setCandidateId(isCandidate ? null : sim.catalog.id)}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '4px 9px',
                                  borderRadius: 5,
                                  cursor: 'pointer',
                                  background: isCandidate ? '#1078ca' : '#ffffff',
                                  color: isCandidate ? '#ffffff' : '#334155',
                                  border: `1px solid ${isCandidate ? '#1078ca' : '#cbd5e1'}`
                                }}
                              >
                                {isCandidate ? '✓ Dibandingkan' : '+ Bandingkan'}
                              </button>

                              <div style={{ position: 'relative' }}>
                                <button
                                  type="button"
                                  onClick={() => setOpenApplyDropdownId(isDropdownOpen ? null : sim.catalog.id)}
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: '4px 9px',
                                    borderRadius: 5,
                                    cursor: 'pointer',
                                    background: '#eff8ff',
                                    color: '#1078ca',
                                    border: '1px solid #b2ddff'
                                  }}
                                >
                                  Terapkan ▾
                                </button>

                                {isDropdownOpen && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      right: 0,
                                      top: 'calc(100% + 4px)',
                                      background: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: 6,
                                      boxShadow: '0 8px 20px rgba(15, 23, 42, 0.14)',
                                      padding: 4,
                                      zIndex: 50,
                                      minWidth: 132,
                                      textAlign: 'left'
                                    }}
                                  >
                                    {[0, 1, 2].map((slotIdx) => (
                                      <button
                                        key={slotIdx}
                                        type="button"
                                        onClick={() => handleSetChoice(sim, slotIdx)}
                                        style={{
                                          width: '100%',
                                          textAlign: 'left',
                                          fontSize: 11.5,
                                          fontWeight: 600,
                                          color: '#1e293b',
                                          background: 'transparent',
                                          border: 'none',
                                          padding: '6px 8px',
                                          borderRadius: 4,
                                          cursor: 'pointer',
                                          display: 'block'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#eff8ff')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                      >
                                        Set sebagai Pilihan {slotIdx + 1}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div
            style={{
              marginTop: 14,
              background: '#fffaeb',
              border: '1px solid #fedf89',
              borderLeft: '4px solid #f79009',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontSize: 11.5,
              color: '#93370d',
              lineHeight: 1.5
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Disclaimer Acuan Internal:</strong> Angka target acuan dan posisi peringkat di atas merupakan benchmark peserta internal Ruangguru (bukan passing grade resmi SNPMB atau jaminan kelolosan personal). Gunakan komparasi berdampingan ini bersama siswa &amp; orang tua untuk menyepakati opsi yang realistis secara skor maupun lokasi.
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
