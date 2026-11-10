import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  Info,
  RotateCcw,
  CheckCircle2,
  ArrowRightLeft,
  Plus,
  MapPin,
  ChevronDown,
  GitBranch
} from 'lucide-react';
import { CHECKPOINT1_STUDENTS, ProgramChoice } from '../data/garudaData';
import {
  PROGRAM_CATALOG,
  CATALOG_PROVINCES,
  CATALOG_TIERS,
  STUDENT_TOWER_RUMPUNS,
  StudentTowerRumpun,
  CatalogProgram,
  ProgramTier,
  ScoreBasis,
  OpportunityZone,
  SimulatedProgramResult,
  computeSimulatedProgram,
  matchCatalogProgram,
  getStudentSubtestScoreMap,
  getZoneFromGap,
  SUBTEST_LABELS
} from '../data/programCatalog';

type RumpunFilter = 'all' | StudentTowerRumpun;

const STORAGE_KEY_PROGRAMS = 'bac_v2_custom_programs_v1';
const STORAGE_KEY_STUDENT = 'bac_v2_active_student_v1';

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

export const SimulasiPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const fromParam = searchParams.get('student');
    if (fromParam && CHECKPOINT1_STUDENTS.some((s) => s.id === fromParam)) {
      return fromParam;
    }
    const saved = localStorage.getItem(STORAGE_KEY_STUDENT);
    if (saved && CHECKPOINT1_STUDENTS.some((s) => s.id === saved)) {
      return saved;
    }
    return 'garuda';
  });

  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState<boolean>(false);
  const studentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (studentMenuRef.current && !studentMenuRef.current.contains(event.target as Node)) {
        setIsStudentMenuOpen(false);
      }
    }
    if (isStudentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isStudentMenuOpen]);

  const student = CHECKPOINT1_STUDENTS.find((s) => s.id === selectedStudentId) || CHECKPOINT1_STUDENTS[0];

  const [customProgramsByStudent, setCustomProgramsByStudent] = useState<Record<string, ProgramChoice[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRAMS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const activePrograms = customProgramsByStudent[student.id] || student.targetPrograms;
  const isCustomized = Boolean(customProgramsByStudent[student.id]);

  // Determine student's primary Student Tower Rumpun from Pilihan 1
  const studentRumpun = useMemo<StudentTowerRumpun>(() => {
    const p1 = student.targetPrograms[0];
    if (p1) {
      const matched = matchCatalogProgram(p1);
      if (matched) return matched.rumpunName;
    }
    return 'Kesehatan';
  }, [student]);

  const [scoreBasis, setScoreBasis] = useState<ScoreBasis>('to4');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [rumpunFilter, setRumpunFilter] = useState<RumpunFilter>(studentRumpun);
  const [universityFilter, setUniversityFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<'all' | ProgramTier>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [openApplyDropdownId, setOpenApplyDropdownId] = useState<string | null>(null);

  // Sync rumpun pre-filter when switching student
  useEffect(() => {
    setRumpunFilter(studentRumpun);
  }, [student.id, studentRumpun]);

  // Reset UI filters when switching student
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    localStorage.setItem(STORAGE_KEY_STUDENT, id);
    setSearchParams({ student: id });
    setIsStudentMenuOpen(false);
    setProvinceFilter('all');
    setUniversityFilter('all');
    setTierFilter('all');
    setSearchQuery('');
    setCandidateId(null);
    setOpenApplyDropdownId(null);
  };

  const handleResetFilters = () => {
    setProvinceFilter('all');
    setRumpunFilter('all');
    setUniversityFilter('all');
    setTierFilter('all');
    setSearchQuery('');
  };

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3200);
  };

  const handleApplyPrograms = (newPrograms: ProgramChoice[]) => {
    setCustomProgramsByStudent((prev) => {
      const next = { ...prev, [student.id]: newPrograms };
      localStorage.setItem(STORAGE_KEY_PROGRAMS, JSON.stringify(next));
      return next;
    });
  };

  const handleResetPrograms = () => {
    setCustomProgramsByStudent((prev) => {
      const next = { ...prev };
      delete next[student.id];
      localStorage.setItem(STORAGE_KEY_PROGRAMS, JSON.stringify(next));
      return next;
    });
    showToast('Pilihan jurusan dikembalikan ke data awal siswa.');
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
          rumpunName: studentRumpun,
          clusterLabel: 'Pilihan Siswa',
          city: choice.city,
          province: 'Lainnya',
          tier: 'Tier 1',
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

  const getActiveSlotLabel = (prog: CatalogProgram): string | null => {
    for (let i = 0; i < activePrograms.length; i++) {
      const m = matchCatalogProgram(activePrograms[i]);
      if (m && m.id === prog.id) return `Pilihan ${i + 1}`;
    }
    return null;
  };

  const handleSetChoice = (sim: SimulatedProgramResult, targetSlotIdx: number) => {
    const priorityLabel = `Pilihan ${targetSlotIdx + 1}`;
    const updated = [...activePrograms];
    updated[targetSlotIdx] = sim.asProgramChoice(priorityLabel);
    handleApplyPrograms(updated);
    setOpenApplyDropdownId(null);
    showToast(`${priorityLabel} diperbarui menjadi ${sim.catalog.prodi} — ${sim.catalog.shortUniv}`);
  };

  const availableUniversities = useMemo(() => {
    const filtered = PROGRAM_CATALOG.filter((p) => {
      if (provinceFilter !== 'all' && p.province !== provinceFilter) return false;
      if (rumpunFilter !== 'all' && p.rumpunName !== rumpunFilter) return false;
      return true;
    });
    return Array.from(new Set(filtered.map((p) => p.univ))).sort();
  }, [provinceFilter, rumpunFilter]);

  useEffect(() => {
    if (universityFilter !== 'all' && !availableUniversities.includes(universityFilter)) {
      setUniversityFilter('all');
    }
  }, [availableUniversities, universityFilter]);

  const filteredCatalog = useMemo(() => {
    return allSimulated
      .filter((item) => {
        if (provinceFilter !== 'all' && item.catalog.province !== provinceFilter) return false;
        if (rumpunFilter !== 'all' && item.catalog.rumpunName !== rumpunFilter) return false;
        if (universityFilter !== 'all' && item.catalog.univ !== universityFilter) return false;
        if (tierFilter !== 'all' && item.catalog.tier !== tierFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchText = `${item.catalog.prodi} ${item.catalog.univ} ${item.catalog.shortUniv} ${item.catalog.city} ${item.catalog.province} ${item.catalog.rumpunName}`.toLowerCase();
          if (!matchText.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => b.gap - a.gap);
  }, [allSimulated, provinceFilter, rumpunFilter, universityFilter, tierFilter, searchQuery]);

  const hasActiveFilters =
    provinceFilter !== 'all' ||
    rumpunFilter !== 'all' ||
    universityFilter !== 'all' ||
    tierFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const studentCity = student.identity.branch.split('-')[0].trim();
  const latestTO4 = student.identity.toScores[student.identity.toScores.length - 1] || 0;
  const avgTO = Math.round(
    student.identity.toScores.reduce((acc, v) => acc + v, 0) / (student.identity.toScores.length || 1)
  );

  return (
    <div>
      {/* Topbar Super CMS */}
      <header className="topbar">
        <div className="topbar-inner">
          <nav aria-label="breadcrumb" className="breadcrumbs">
            <Link to={`/v2?student=${student.id}`}>Home</Link>
            <span className="crumb-sep">›</span>
            <Link to={`/v2?student=${student.id}`}>Konsultasi - Checkpoint</Link>
            <span className="crumb-sep">›</span>
            <Link to={`/v2?student=${student.id}`}>Detail Checkpoint 1</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Simulasi &amp; Komparasi Prodi PTN</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/engine"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                textDecoration: 'none'
              }}
            >
              <GitBranch size={13} color="#1078ca" />
              <span>Engine Aturan</span>
            </Link>
            <div className="user-pill">
              <span>{student.identity.saName} · {student.identity.saEmail}</span>
              <div className="user-avatar">WC</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Action Bar */}
        <div className="action-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 14px', flexWrap: 'wrap', gap: 10 }}>
          <button
            type="button"
            className="btn btn-back"
            onClick={() => navigate(`/v2?student=${student.id}`)}
          >
            <ArrowLeft size={16} />
            Kembali ke Detail Checkpoint 1
          </button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {actionToast && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#027a48',
                  background: '#ecfdf3',
                  border: '1px solid #a6f4c5',
                  padding: '5px 12px',
                  borderRadius: 9999
                }}
              >
                <CheckCircle2 size={14} /> {actionToast}
              </span>
            )}
            {isCustomized && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleResetPrograms}
                style={{ padding: '7px 13px', fontSize: 12.5, color: '#b54708', borderColor: '#fedf89', background: '#fffcf5' }}
              >
                <RotateCcw size={14} /> Reset Pilihan Awal
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/v2?student=${student.id}`)}
              style={{ padding: '7px 16px', fontSize: 12.5, background: '#1078ca', borderColor: '#1078ca' }}
            >
              ✓ Simpan &amp; Kembali ke Laporan
            </button>
          </div>
        </div>

        {/* Student Context Banner */}
        <div className="student-header" style={{ marginBottom: 16 }}>
          <div className="student-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Compass size={20} color="#1078ca" />
                <h1 style={{ margin: 0, fontSize: 20 }}>Simulasi Peluang &amp; Komparasi Prodi PTN</h1>
              </div>

              {/* Dropdown Ganti Siswa */}
              <div style={{ position: 'relative' }} ref={studentMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsStudentMenuOpen(!isStudentMenuOpen)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#344054',
                    background: isStudentMenuOpen ? '#f1f5f9' : '#ffffff',
                    border: '1px solid #d0d5dd',
                    borderRadius: 6,
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <span>Siswa: <strong style={{ color: '#1078ca' }}>{student.identity.name}</strong></span>
                  <ChevronDown
                    size={13}
                    color="#667085"
                    style={{
                      transition: 'transform 0.15s ease',
                      transform: isStudentMenuOpen ? 'rotate(180deg)' : 'none'
                    }}
                  />
                </button>

                {isStudentMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      background: '#ffffff',
                      borderRadius: 8,
                      boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.15), 0 6px 12px -4px rgba(15, 23, 42, 0.08)',
                      border: '1px solid #e2e8f0',
                      padding: 6,
                      minWidth: 320,
                      zIndex: 9999
                    }}
                  >
                    <div style={{ padding: '6px 10px 4px', fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Pilih Profil Siswa Checkpoint 1
                    </div>
                    {CHECKPOINT1_STUDENTS.map((st) => {
                      const isSelected = st.id === selectedStudentId;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleSelectStudent(st.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            background: isSelected ? '#eff8ff' : 'transparent',
                            border: 'none',
                            padding: '8px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'block'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#1078ca' : '#1e293b' }}>
                              {st.name}
                            </span>
                            {isSelected && <span style={{ fontSize: 11, fontWeight: 700, color: '#1078ca' }}>✓ Aktif</span>}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{st.tagline}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <p style={{ marginTop: 6, marginBottom: 0 }}>
              <span>Domisili: <strong>{studentCity}</strong></span>
              <span className="student-tag">{student.identity.school}</span>
              <span className="student-tag">Rumpun Minat: {studentRumpun}</span>
              <span className="student-tag">Skor Reguler TO 4: {latestTO4} (Rata-rata: {avgTO})</span>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475467' }}>Basis Skor Kalkulasi:</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setScoreBasis('to4')}
                className={`btn ${scoreBasis === 'to4' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '4px 10px', fontSize: 11.5 }}
              >
                TO 4 ({latestTO4})
              </button>
              <button
                type="button"
                onClick={() => setScoreBasis('median')}
                className={`btn ${scoreBasis === 'median' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '4px 10px', fontSize: 11.5 }}
              >
                Median
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
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAGIAN 1: HEAD-TO-HEAD COMPARISON MATRIX (4 KOLOM SEJAJAR) */}
        {/* ========================================================= */}
        <section className="stage-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                <ArrowRightLeft size={16} color="#1078ca" />
                1. Komparasi Berdampingan (Head-to-Head Matrix)
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                Bandingkan skor terbobot, keketatan, lokasi, dan rincian skor siswa di 3 subtes pembobot utama antara Pilihan 1–3 dengan kandidat alternatif.
              </p>
            </div>
            {candidateSim && (
              <button
                type="button"
                onClick={() => setCandidateId(null)}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#64748b',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
              >
                Kosongkan Kandidat Pembanding
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
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
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: theme.textColor,
                          background: theme.boxBg,
                          border: `1px solid ${theme.borderColor}`,
                          padding: '2px 8px',
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

                    <div style={{ minHeight: 48 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                        {sim.catalog.prodi}
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                        {sim.catalog.univ} · {sim.catalog.city}
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: '9px 10px',
                        marginTop: 8,
                        marginBottom: 10
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Skor Terbobot</div>
                          <div style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{sim.weightedScore}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Acuan</div>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>{sim.catalog.targetScore}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Selisih</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: theme.textColor, lineHeight: 1.2 }}>
                            {sim.gap > 0 ? `+${sim.gap}` : sim.gap}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
                        <span>Keketatan: <strong style={{ color: '#0f172a' }}>{sim.catalog.tightness}</strong></span>
                        <span>Kuota: <strong style={{ color: '#0f172a' }}>{sim.catalog.quota2026} kursi</strong></span>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, marginBottom: 10 }}>
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
                              padding: '3.5px 8px',
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

                  <div style={{ paddingTop: 8, borderTop: '1px dashed #e2e8f0', fontSize: 10.5, color: '#475569' }}>
                    <div>
                      Rapor SNBP: <strong style={{ color: '#0f172a' }}>{sim.catalog.supportSubjects.join(', ')}</strong>
                    </div>
                    <div style={{ marginTop: 5 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: theme.textColor,
                          background: theme.boxBg,
                          border: `1px solid ${theme.boxBorder}`,
                          padding: '2px 8px',
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
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 6px rgba(16, 120, 202, 0.08)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: theme.textColor,
                            background: theme.boxBg,
                            border: `1px solid ${theme.borderColor}`,
                            padding: '2px 8px',
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

                      <div style={{ minHeight: 48 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
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
                          padding: '9px 10px',
                          marginTop: 8,
                          marginBottom: 10
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Skor Terbobot</div>
                            <div style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{candidateSim.weightedScore}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Acuan</div>
                            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>{candidateSim.catalog.targetScore}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Selisih</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: theme.textColor, lineHeight: 1.2 }}>
                              {candidateSim.gap > 0 ? `+${candidateSim.gap}` : candidateSim.gap}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
                          <span>Keketatan: <strong style={{ color: '#0f172a' }}>{candidateSim.catalog.tightness}</strong></span>
                          <span>Kuota: <strong style={{ color: '#0f172a' }}>{candidateSim.catalog.quota2026} kursi</strong></span>
                        </div>
                      </div>

                      <div style={{ fontSize: 11, marginBottom: 10 }}>
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
                                padding: '3.5px 8px',
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

                    <div style={{ paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#475469', marginBottom: 5 }}>
                        Terapkan Kandidat Ini ke Formulasi:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                        {[0, 1, 2].map((slotIdx) => (
                          <button
                            key={slotIdx}
                            type="button"
                            onClick={() => handleSetChoice(candidateSim, slotIdx)}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#1078ca',
                              background: '#eff8ff',
                              border: '1px solid #b2ddff',
                              borderRadius: 5,
                              padding: '5px 0',
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
                  padding: 18,
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
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10
                  }}
                >
                  <Plus size={20} color="#475569" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Slot Kandidat Pembanding
                </div>
                <p style={{ fontSize: 11.5, lineHeight: 1.5, margin: 0 }}>
                  Klik tombol <strong>+ Bandingkan</strong> pada salah satu prodi di katalog bawah untuk menjajarkannya secara langsung dengan Pilihan 1–3.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* BAGIAN 2: CARI KAMPUS DAN PROGRAM STUDI (FILTER STUDENT TOWER) */}
        {/* ========================================================= */}
        <section className="stage-card" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Cari kampus dan program studi
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
              UTBK-SNBT maksimal 3 pilihan. Pre-filtered sesuai minat rumpun siswa; sesuaikan filter di bawah untuk mencari prodi pembanding ({filteredCatalog.length} prodi tersedia).
            </p>
          </div>

          {/* 3-Column Student Tower Filter Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px 16px',
              marginBottom: 16
            }}
          >
            {/* 1. Provinsi kampus */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Provinsi kampus
              </label>
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 12.5,
                  color: provinceFilter === 'all' ? '#64748b' : '#0f172a',
                  background: '#ffffff',
                  border: '1px solid #d0d5dd',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Semua provinsi</option>
                {CATALOG_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Rumpun */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Rumpun
              </label>
              <select
                value={rumpunFilter}
                onChange={(e) => setRumpunFilter(e.target.value as RumpunFilter)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 12.5,
                  color: rumpunFilter === 'all' ? '#64748b' : '#0f172a',
                  background: '#ffffff',
                  border: '1px solid #d0d5dd',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Semua rumpun</option>
                {STUDENT_TOWER_RUMPUNS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Universitas */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Universitas
              </label>
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 12.5,
                  color: universityFilter === 'all' ? '#64748b' : '#0f172a',
                  background: '#ffffff',
                  border: '1px solid #d0d5dd',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Semua universitas</option>
                {availableUniversities.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Tier */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Tier
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as 'all' | ProgramTier)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 12.5,
                  color: tierFilter === 'all' ? '#64748b' : '#0f172a',
                  background: '#ffffff',
                  border: '1px solid #d0d5dd',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Semua tier</option>
                {CATALOG_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t === 'Tier 1'
                      ? 'Tier 1 (Ketat · Target ≥ 660)'
                      : t === 'Tier 2'
                      ? 'Tier 2 (Moderat · 610–659)'
                      : 'Tier 3 (Realistis · < 610)'}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Kampus atau jurusan */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Kampus atau jurusan
              </label>
              <input
                type="text"
                placeholder="Cari nama"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 11px',
                  fontSize: 12.5,
                  border: '1px solid #d0d5dd',
                  borderRadius: 6,
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 6. Reset Filter Slot */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#475467',
                    background: '#f8fafc',
                    border: '1px solid #d0d5dd',
                    borderRadius: 6,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <RotateCcw size={13} /> Reset filter
                </button>
              )}
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
                    <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: '#64748b', fontSize: 13 }}>
                      Tidak ada program studi yang sesuai dengan kombinasi filter saat ini. Coba ubah filter atau klik Reset filter.
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
                            <strong style={{ color: '#0f172a', fontSize: 13 }}>
                              {sim.catalog.prodi} — {sim.catalog.shortUniv}
                            </strong>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                background: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                padding: '1px 5px',
                                borderRadius: 4
                              }}
                            >
                              {sim.catalog.tier}
                            </span>
                            {activeLabel && (
                              <span
                                style={{
                                  fontSize: 10,
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
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                            {sim.catalog.rumpunName} · Pembobot: {sim.prioritySubtestDetails.map((d) => d.shortLabel).join(', ')}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                          {sim.weightedScore}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 13.5, color: '#475569' }}>
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
                              padding: '2px 9px',
                              borderRadius: 9999,
                              display: 'inline-block'
                            }}
                          >
                            {sim.gap > 0 ? `+${sim.gap}` : sim.gap} poin
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: 11.5, color: '#334155' }}>
                          <div>
                            <strong>{sim.catalog.tightness}</strong> · {sim.catalog.quota2026} kursi
                          </div>
                          <div style={{ color: '#64748b', marginTop: 2 }}>
                            {sim.catalog.province} ({sim.isOutOfTown ? 'Luar Kota' : 'Satu Wilayah'})
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                            <button
                              type="button"
                              onClick={() => setCandidateId(isCandidate ? null : sim.catalog.id)}
                              style={{
                                fontSize: 11.5,
                                fontWeight: 700,
                                padding: '5px 10px',
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
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  padding: '5px 10px',
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
                                    minWidth: 145,
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
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '6px 9px',
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
        </section>

        {/* Mandatory Disclaimer */}
        <div
          style={{
            marginBottom: 24,
            background: '#fffaeb',
            border: '1px solid #fedf89',
            borderLeft: '4px solid #f79009',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 12,
            color: '#93370d',
            lineHeight: 1.5
          }}
        >
          <Info size={17} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Disclaimer Acuan Internal:</strong> Angka target acuan dan posisi peringkat di atas merupakan benchmark peserta internal Ruangguru (bukan passing grade resmi SNPMB atau jaminan kelolosan personal). Gunakan komparasi berdampingan ini bersama siswa &amp; orang tua untuk menyepakati opsi yang realistis secara skor maupun lokasi.
          </div>
        </div>
      </main>
    </div>
  );
};
