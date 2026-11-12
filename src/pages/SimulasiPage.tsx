import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  RotateCcw,
  CheckCircle2,
  ArrowRightLeft,
  Plus,
  MapPin,
  ChevronDown,
  GitBranch,
  AlertTriangle,
  X
} from 'lucide-react';
import { CHECKPOINT1_STUDENTS, ProgramChoice } from '../data/garudaData';
import { ChoiceReviewModal } from '../components/ChoiceReviewModal';
import {
  PROGRAM_CATALOG,
  CATALOG_PROVINCES,
  STUDENT_TOWER_RUMPUNS,
  StudentTowerRumpun,
  CatalogProgram,
  ScoreBasis,
  OpportunityZone,
  SimulatedProgramResult,
  computeSimulatedProgram,
  matchCatalogProgram,
  getStudentSubtestScoreMap,
  getZoneFromGap,
  getStudentBaselinePrograms,
  ZONE_NEAR_GAP,
  ZONE_WIDE_GAP,
  validateSnbtChoices,
  SUBTEST_LABELS
} from '../data/programCatalog';
import { safeGetItem, safeSetItem, loadCustomPrograms } from '../utils/safeStorage';
import { Button, Pill, Callout, SegmentedControl, Dialog, Card, toneForGap } from '../components/ui';

type RumpunFilter = 'all' | StudentTowerRumpun;
type OpportunityFilter = 'all' | 'realistic' | OpportunityZone;
type DegreeFilter = 'all' | 'S1' | 'D4' | 'D3' | 'vokasi';

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
    const saved = safeGetItem(STORAGE_KEY_STUDENT);
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

  // Keep the selected student in sync with ?student= (back/forward navigation, direct links)
  useEffect(() => {
    const fromParam = searchParams.get('student');
    if (fromParam && CHECKPOINT1_STUDENTS.some((st) => st.id === fromParam)) {
      setSelectedStudentId(fromParam);
      safeSetItem(STORAGE_KEY_STUDENT, fromParam);
    }
  }, [searchParams]);

  const student = CHECKPOINT1_STUDENTS.find((s) => s.id === selectedStudentId) || CHECKPOINT1_STUDENTS[0];

  const [customProgramsByStudent, setCustomProgramsByStudent] = useState<Record<string, ProgramChoice[]>>(() => loadCustomPrograms());

  const activePrograms = customProgramsByStudent[student.id] || getStudentBaselinePrograms(student);
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
  const [focusedSlotIdx, setFocusedSlotIdx] = useState<number>(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Student Tower Filter State
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [rumpunFilter, setRumpunFilter] = useState<RumpunFilter>(studentRumpun);
  const [universityFilter, setUniversityFilter] = useState<string>('all');
  const [opportunityFilter, setOpportunityFilter] = useState<OpportunityFilter>('all');
  const [degreeFilter, setDegreeFilter] = useState<DegreeFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Keep focusedSlotIdx in valid bounds when activePrograms length changes
  useEffect(() => {
    if (focusedSlotIdx > activePrograms.length) {
      setFocusedSlotIdx(Math.max(0, activePrograms.length - 1));
    }
  }, [activePrograms.length, focusedSlotIdx]);

  // Sync rumpun pre-filter when switching student
  useEffect(() => {
    setRumpunFilter(studentRumpun);
    setFocusedSlotIdx(0);
    setCompareIds([]);
    setDegreeFilter('all');
  }, [student.id, studentRumpun]);

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    safeSetItem(STORAGE_KEY_STUDENT, id);
    setSearchParams({ student: id });
    setIsStudentMenuOpen(false);
    setProvinceFilter('all');
    setUniversityFilter('all');
    setOpportunityFilter('all');
    setDegreeFilter('all');
    setSearchQuery('');
  };

  const handleResetFilters = () => {
    setProvinceFilter('all');
    setRumpunFilter('all');
    setUniversityFilter('all');
    setOpportunityFilter('all');
    setDegreeFilter('all');
    setSearchQuery('');
  };

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3200);
  };

  // Choice Review & Confirmation States
  const [reviewTarget, setReviewTarget] = useState<{
    program: SimulatedProgramResult;
    slotIdx: number;
  } | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [slotToRemove, setSlotToRemove] = useState<{ idx: number; choice: ProgramChoice } | null>(null);


  const scoreBasisLabel = useMemo(() => {
    switch (scoreBasis) {
      case 'to4':
        return 'TO 4 Terakhir';
      case 'median':
        return 'Median 4 TO';
      case 'avg':
        return 'Rata-rata 4 TO';
      default:
        return 'TO 4';
    }
  }, [scoreBasis]);

  const handleApplyPrograms = (newPrograms: ProgramChoice[]) => {
    const normalized = newPrograms.map((p, idx) => ({
      ...p,
      priority: `Pilihan ${idx + 1}`
    }));
    setCustomProgramsByStudent((prev) => {
      const next = { ...prev, [student.id]: normalized };
      safeSetItem(STORAGE_KEY_PROGRAMS, JSON.stringify(next));
      return next;
    });
  };

  const handleRequestResetPrograms = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmResetPrograms = () => {
    setCustomProgramsByStudent((prev) => {
      const next = { ...prev };
      delete next[student.id];
      safeSetItem(STORAGE_KEY_PROGRAMS, JSON.stringify(next));
      return next;
    });
    setFocusedSlotIdx(0);
    setIsResetConfirmOpen(false);
    showToast('Pilihan jurusan dikembalikan ke data awal siswa.');
  };

  const handleRequestRemoveSlot = (idxToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePrograms.length <= 1) return;
    const choice = activePrograms[idxToRemove];
    setSlotToRemove({ idx: idxToRemove, choice });
  };

  const handleConfirmRemoveSlot = () => {
    if (!slotToRemove) return;
    const next = activePrograms.filter((_, idx) => idx !== slotToRemove.idx);
    handleApplyPrograms(next);
    if (focusedSlotIdx >= next.length) {
      setFocusedSlotIdx(Math.max(0, next.length - 1));
    }
    showToast(`Pilihan ${slotToRemove.idx + 1} (${slotToRemove.choice.prodi}) dihapus dari formulasi.`);
    setSlotToRemove(null);
  };

  // Pre-compute simulation results for all catalog programs
  const allSimulated = useMemo<SimulatedProgramResult[]>(() => {
    return PROGRAM_CATALOG.map((prog) => computeSimulatedProgram(student, prog, scoreBasis));
  }, [student, scoreBasis]);

  // Convert activePrograms (1..4) into SimulatedProgramResult entries
  const activeSimulatedSlots = useMemo(() => {
    const scoreMap = getStudentSubtestScoreMap(student.subtests, scoreBasis);

    return activePrograms.map((choice, idx) => {
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
  }, [activePrograms, allSimulated, student.subtests, scoreBasis, studentRumpun]);

  // SNBT 2026 Real-time Validation
  const snbtValidation = useMemo(() => validateSnbtChoices(activePrograms), [activePrograms]);

  // Focused Slot & Compare Candidates (up to 2)
  const focusedSlot = activeSimulatedSlots[focusedSlotIdx] || null;
  const compareSims = useMemo(() => {
    return compareIds
      .map((id) => allSimulated.find((s) => s.catalog.id === id))
      .filter((s): s is SimulatedProgramResult => Boolean(s));
  }, [compareIds, allSimulated]);

  const toggleCompareCandidate = (progId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(progId)) {
        return prev.filter((id) => id !== progId);
      }
      if (prev.length >= 2) {
        return [prev[1], progId];
      }
      return [...prev, progId];
    });
  };

  const getActiveSlotLabel = (prog: CatalogProgram): string | null => {
    for (let i = 0; i < activePrograms.length; i++) {
      const m = matchCatalogProgram(activePrograms[i]);
      if (m && m.id === prog.id) return `Pilihan ${i + 1}`;
    }
    return null;
  };

  const handleApplyToFocusedSlot = (sim: SimulatedProgramResult, targetIdx: number = focusedSlotIdx) => {
    // Open Change Review process before executing
    setReviewTarget({
      program: sim,
      slotIdx: targetIdx
    });
  };

  const handleConfirmApplyFromModal = (confirmedSlotIdx: number, newChoice: ProgramChoice) => {
    const updated = [...activePrograms];
    if (confirmedSlotIdx < updated.length) {
      updated[confirmedSlotIdx] = newChoice;
    } else {
      updated.push(newChoice);
    }
    handleApplyPrograms(updated);
    setFocusedSlotIdx(confirmedSlotIdx);
    showToast(`✓ Pilihan ${confirmedSlotIdx + 1} berhasil diperbarui: ${newChoice.prodi} — ${newChoice.univ}`);
    setReviewTarget(null);
  };

  // Cascading Universities based on Provinsi & Rumpun
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
        if (degreeFilter === 'S1' && item.catalog.degree !== 'S1') return false;
        if (degreeFilter === 'D4' && item.catalog.degree !== 'D4') return false;
        if (degreeFilter === 'D3' && item.catalog.degree !== 'D3') return false;
        if (degreeFilter === 'vokasi' && item.catalog.degree === 'S1') return false;

        if (opportunityFilter === 'realistic' && item.gap < -30) return false;
        if (
          opportunityFilter !== 'all' &&
          opportunityFilter !== 'realistic' &&
          item.zone !== opportunityFilter
        ) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchText = `${item.catalog.prodi} ${item.catalog.univ} ${item.catalog.shortUniv} ${item.catalog.city} ${item.catalog.province} ${item.catalog.rumpunName}`.toLowerCase();
          if (!matchText.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => b.gap - a.gap);
  }, [allSimulated, provinceFilter, rumpunFilter, universityFilter, degreeFilter, opportunityFilter, searchQuery]);

  const hasActiveFilters =
    provinceFilter !== 'all' ||
    rumpunFilter !== 'all' ||
    universityFilter !== 'all' ||
    degreeFilter !== 'all' ||
    opportunityFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const studentCity = student.identity.branch.split('-')[0].trim();
  const latestTO4 = student.identity.toScores[student.identity.toScores.length - 1] || 0;
  const avgTO = Math.round(
    student.identity.toScores.reduce((acc, v) => acc + v, 0) / (student.identity.toScores.length || 1)
  );

  // Render helper for a Compare Arena Card (Col 1 Active or Col 2/3 Candidate)
  const renderCompareCard = (
    sim: SimulatedProgramResult,
    opts: {
      badgeText: string;
      isCandidate: boolean;
      baselineSim?: SimulatedProgramResult | null;
      onRemoveCandidate?: () => void;
    }
  ) => {
    const theme = getZoneTheme(sim.zone);
    const baseline = opts.baselineSim;
    const targetDelta = baseline ? baseline.catalog.targetScore - sim.catalog.targetScore : 0;
    const gapDelta = baseline ? sim.gap - baseline.gap : 0;

    return (
      <div
        style={{
          background: '#ffffff',
          border: opts.isCandidate ? `2px dashed ${theme.borderColor}` : `1.5px solid ${theme.borderColor}`,
          borderRadius: 10,
          padding: 15,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <div>
          {/* Top Row: Role Badge + Degree + Location */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
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
                {opts.badgeText}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#334155',
                  background: '#f1f5f9',
                  padding: '2px 6px',
                  borderRadius: 4
                }}
              >
                {sim.catalog.degree}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#475569',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '2px 7px',
                  borderRadius: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <MapPin size={10} /> {sim.catalog.province}
              </span>
              {opts.onRemoveCandidate && (
                <button
                  type="button"
                  onClick={opts.onRemoveCandidate}
                  title="Keluarkan dari perbandingan"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Prodi & Kampus */}
          <div style={{ minHeight: 46 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
              {sim.catalog.prodi}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 2 }}>
              {sim.catalog.univ} · {sim.catalog.city}
            </div>
          </div>

          {/* Direct Delta Callout vs Focused Slot (Only for Candidates) */}
          {opts.isCandidate && baseline && (
            <div
              style={{
                marginTop: 8,
                padding: '6px 9px',
                borderRadius: 6,
                background: gapDelta > 0 ? '#ecfdf3' : '#f8fafc',
                border: `1px solid ${gapDelta > 0 ? '#a6f4c5' : '#e2e8f0'}`,
                fontSize: 11,
                color: gapDelta > 0 ? '#027a48' : '#475569',
                fontWeight: 600,
                lineHeight: 1.4
              }}
            >
              {(() => {
                const targetText =
                  targetDelta > 0
                    ? `↓ Target lebih rendah ${targetDelta}`
                    : targetDelta < 0
                    ? `↑ Target lebih tinggi ${Math.abs(targetDelta)}`
                    : 'Target acuan setara dengan pilihan saat ini';
                const gapText =
                  gapDelta > 0
                    ? ` · Jarak ke target memendek ${gapDelta}`
                    : gapDelta < 0
                    ? ` · Jarak ke target melebar ${Math.abs(gapDelta)}`
                    : '';
                return targetText + gapText;
              })()}
            </div>
          )}

          {/* Neutral Score Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '9px 11px',
              marginTop: 9,
              marginBottom: 10
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Skor terbobot</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{sim.weightedScore}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Target acuan</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>{sim.catalog.targetScore}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Jarak target</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: theme.textColor, lineHeight: 1.2 }}>
                  {sim.gap > 0 ? `+${sim.gap}` : sim.gap}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#475569' }}>
              <span>Keketatan: <strong style={{ color: '#0f172a' }}>{sim.catalog.tightness.replace('.', ',')}</strong></span>
              <span>Kuota: <strong style={{ color: '#0f172a' }}>{sim.catalog.quota2026} kursi</strong></span>
            </div>
          </div>

          {/* 3 Subtes Pembobot Utama */}
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
                    <strong style={{ color: '#0f172a' }}>{sub.shortLabel}</strong> · {sub.name}
                  </span>
                  <span style={{ fontWeight: 700, color: sub.studentScore >= 600 ? '#027a48' : '#0f172a' }}>
                    {sub.studentScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA or Info */}
        <div style={{ paddingTop: 8, borderTop: '1px dashed #e2e8f0', fontSize: 11, color: '#475569' }}>
          <div style={{ marginBottom: opts.isCandidate ? 8 : 4 }}>
            Rapor SNBP: <strong style={{ color: '#0f172a' }}>{sim.catalog.supportSubjects.join(', ')}</strong>
          </div>
          {opts.isCandidate ? (
            <Button
              variant="primary"
              size="sm"
              style={{ width: '100%', fontSize: 12 }}
              onClick={() => handleApplyToFocusedSlot(sim)}
            >
              ✓ Jadikan Pilihan {focusedSlotIdx + 1}
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    );
  };

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
        <div className="action-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 12px', flexWrap: 'wrap', gap: 10 }}>
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(`/v2?student=${student.id}`)}>
            Kembali ke Detail Checkpoint 1
          </Button>

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
              <Button variant="warn" icon={<RotateCcw size={14} />} onClick={handleRequestResetPrograms}>
                Reset Pilihan Awal
              </Button>
            )}
            <Button variant="primary" onClick={() => navigate(`/v2?student=${student.id}`)}>
              ✓ Simpan &amp; Kembali ke Laporan
            </Button>
          </div>
        </div>

        {/* Minimalist Header & Context Bar */}
        <div
          className="student-header"
          style={{
            marginBottom: 14,
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 18.5, fontWeight: 800, color: '#0f172a', letterSpacing: -0.2 }}>
              Simulasi &amp; Komparasi Prodi PTN
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap', fontSize: 12.5, color: '#64748b' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>{student.identity.name}</span>

              <div style={{ position: 'relative' }} ref={studentMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsStudentMenuOpen(!isStudentMenuOpen)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#1078ca',
                    background: isStudentMenuOpen ? '#eff8ff' : '#f8fafc',
                    border: '1px solid #d0d5dd',
                    borderRadius: 5,
                    cursor: 'pointer'
                  }}
                >
                  <span>Ganti</span>
                  <ChevronDown
                    size={12}
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

              <span>·</span>
              <span>{studentCity}</span>
              <span>·</span>
              <span>{studentRumpun}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Basis skor terbobot:</span>
              <SegmentedControl<ScoreBasis>
                ariaLabel="Basis skor"
                value={scoreBasis}
                onChange={setScoreBasis}
                options={[
                  { id: 'to4', label: `TO 4 Terbaru (${latestTO4})` },
                  { id: 'median', label: 'Median 4 TO' },
                  { id: 'avg', label: `Rata-rata 4 TO (${avgTO})` }
                ]}
              />
            </div>
            <span style={{ fontSize: 11, color: '#245f5a', fontWeight: 600 }}>
              {scoreBasis === 'to4'
                ? `Aktif: Dihitung berdasarkan skor TO 4 terbaru (${latestTO4}), bukan rata-rata 4 TO`
                : scoreBasis === 'median'
                ? 'Aktif: Dihitung menggunakan nilai Median per subtes dari 4 TO'
                : 'Aktif: Dihitung menggunakan rata-rata 4 TO'}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAGIAN 1: STRIP FORMULASI SNBT (1-4 SLOT RINGKAS)         */}
        {/* ========================================================= */}
        <Card as="section" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
              1. Formulasi Pilihan SNBT Siswa <span style={{ fontWeight: 500, color: '#64748b', fontSize: 12 }}>(Klik salah satu pilihan untuk dievaluasi &amp; dibandingkan)</span>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#475467' }}>
              Komposisi: <strong style={{ color: '#0f172a' }}>{snbtValidation.patternLabel}</strong>
            </span>
          </div>

          {/* 4-Slot Horizontal Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
            {activeSimulatedSlots.map((slot) => {
              const isFocused = focusedSlotIdx === slot.slotIndex;
              const theme = getZoneTheme(slot.sim.zone);

              return (
                <div
                  key={`strip_${slot.slotIndex}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setFocusedSlotIdx(slot.slotIndex)}
                  onKeyDown={(e) => {
                    // ignore keys that bubble up from the nested buttons
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFocusedSlotIdx(slot.slotIndex);
                    }
                  }}
                  style={{
                    background: isFocused ? '#e6f4f2' : '#ffffff',
                    border: isFocused ? '2px solid #58aebd' : `1px solid ${theme.borderColor}`,
                    borderRadius: 8,
                    padding: '9px 11px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: isFocused ? '#ffffff' : '#334155',
                          background: isFocused ? '#398896' : '#f1f5f9',
                          padding: '1.5px 6px',
                          borderRadius: 4
                        }}
                      >
                        Pilihan {slot.slotIndex + 1}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#475569' }}>
                        {slot.sim.catalog.degree}
                      </span>
                    </div>

                    {activePrograms.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRequestRemoveSlot(slot.slotIndex, e)}
                        title={`Hapus Pilihan ${slot.slotIndex + 1}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 1,
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {slot.sim.catalog.prodi}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {slot.sim.catalog.shortUniv} · {slot.sim.catalog.city}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 5, borderTop: '1px dashed #e2e8f0', fontSize: 11 }}>
                    <span style={{ color: '#475569' }}>
                      Skor <strong style={{ color: '#0f172a' }}>{slot.sim.weightedScore}</strong>
                    </span>
                    <span style={{ fontWeight: 800, color: theme.textColor }}>
                      {slot.sim.gap > 0 ? `+${slot.sim.gap}` : slot.sim.gap}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add Pilihan 4 (or Empty Slot if < 4) */}
            {activePrograms.length < 4 && (
              <button
                type="button"
                onClick={() => {
                  setFocusedSlotIdx(activePrograms.length);
                  if (activePrograms.length >= 2) {
                    setDegreeFilter(snbtValidation.needsD3Only ? 'D3' : 'vokasi');
                  }
                }}
                style={{
                  background: focusedSlotIdx === activePrograms.length ? '#e6f4f2' : '#f8fafc',
                  border: focusedSlotIdx === activePrograms.length ? '2px dashed #58aebd' : '1.5px dashed #cbd5e1',
                  borderRadius: 8,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  color: focusedSlotIdx === activePrograms.length ? '#245f5a' : '#64748b'
                }}
              >
                <Plus size={16} />
                <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 3 }}>
                  Tambah Pilihan {activePrograms.length + 1}
                </div>
                <div style={{ fontSize: 10, marginTop: 1 }}>
                  {activePrograms.length >= 2 ? 'Vokasi (D4 / D3)' : 'Opsional s.d. 4 pilihan'}
                </div>
              </button>
            )}
          </div>

          {/* SNBT 2026 Rule Status Bar */}
          <Callout
            tone={snbtValidation.isValid ? 'success' : 'caution'}
            icon={snbtValidation.isValid ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>{snbtValidation.message}</span>
              {!snbtValidation.isValid && snbtValidation.needsVokasiFilter && (
                <Button
                  size="sm"
                  onClick={() => {
                    setRumpunFilter('all');
                    setDegreeFilter(snbtValidation.needsD3Only ? 'D3' : 'vokasi');
                  }}
                >
                  {snbtValidation.needsD3Only ? 'Tampilkan Prodi D3 ▾' : 'Tampilkan Prodi Vokasi (D4/D3) ▾'}
                </Button>
              )}
            </div>
          </Callout>
        </Card>

        {/* ========================================================= */}
        {/* BAGIAN 2: MEJA BANDINGKAN FOKUS PER PILIHAN (1 vs 1-2)     */}
        {/* ========================================================= */}
        <Card as="section" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ fontSize: 15.5, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                <ArrowRightLeft size={16} color="#398896" />
                2. Meja Bandingkan: Fokus Pilihan {focusedSlotIdx + 1}
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                {focusedSlot
                  ? `Membandingkan ${focusedSlot.sim.catalog.prodi} (${focusedSlot.sim.catalog.shortUniv}) dengan maksimal 2 alternatif dari katalog di bawah.`
                  : `Pilih salah satu prodi dari katalog di bawah untuk mengisi Slot Pilihan ${focusedSlotIdx + 1}.`}
              </p>
            </div>
            {compareSims.length > 0 && (
              <Button
                size="sm"
                onClick={() => setCompareIds([])}
              >
                Kosongkan Pembanding
              </Button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {/* Column 1: Focused Active Slot */}
            {focusedSlot ? (
              renderCompareCard(focusedSlot.sim, {
                badgeText: `Pilihan ${focusedSlotIdx + 1} Saat Ini`,
                isCandidate: false
              })
            ) : (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px dashed #1078ca',
                  borderRadius: 10,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  color: '#475569'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1078ca', marginBottom: 6 }}>
                  Slot Pilihan {focusedSlotIdx + 1} (Baru)
                </div>
                <p style={{ fontSize: 11.5, lineHeight: 1.5, margin: 0 }}>
                  Gunakan filter di bawah lalu klik <strong>Pilih</strong> atau bandingkan kandidat terlebih dahulu.
                </p>
              </div>
            )}

            {/* Column 2 & 3: Up to 2 Comparison Candidates */}
            {[0, 1].map((candIdx) => {
              const candSim = compareSims[candIdx];
              if (candSim) {
                return (
                  <React.Fragment key={`cand_${candSim.catalog.id}`}>
                    {renderCompareCard(candSim, {
                      badgeText: `Alternatif ${candIdx + 1}`,
                      isCandidate: true,
                      baselineSim: focusedSlot?.sim || null,
                      onRemoveCandidate: () => toggleCompareCandidate(candSim.catalog.id)
                    })}
                  </React.Fragment>
                );
              }

              return (
                <div
                  key={`empty_cand_${candIdx}`}
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
                      width: 38,
                      height: 38,
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
                    Alternatif {candIdx + 1}
                  </div>
                  <p style={{ fontSize: 11.5, lineHeight: 1.45, margin: 0 }}>
                    Klik tombol <strong>+ Bandingkan</strong> di katalog bawah untuk menimbang prodi ini terhadap Pilihan {focusedSlotIdx + 1}.
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ========================================================= */}
        {/* BAGIAN 3: CARI KAMPUS DAN PROGRAM STUDI (STUDENT TOWER)   */}
        {/* ========================================================= */}
        <Card as="section" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 15.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Cari kampus dan program studi
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                UTBK-SNBT maksimal 4 pilihan (maks. 2 S1; pilihan ke-3/4 kombinasi Vokasi D4/D3). Tersedia {filteredCatalog.length} prodi sesuai filter.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Jenjang toggle for SNBT vokasi scaffolding */}
              <SegmentedControl<DegreeFilter>
                ariaLabel="Jenjang"
                value={degreeFilter}
                onChange={setDegreeFilter}
                options={[
                  { id: 'all', label: 'Semua Jenjang' },
                  { id: 'S1', label: 'S1' },
                  { id: 'vokasi', label: 'Vokasi (D4/D3)' },
                  { id: 'D3', label: 'Khusus D3' }
                ]}
              />

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#475467',
                    background: '#f8fafc',
                    border: '1px solid #d0d5dd',
                    borderRadius: 6,
                    padding: '5px 10px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <RotateCcw size={12} /> Reset filter
                </button>
              )}
            </div>
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

            {/* 4. Tier (Empty matching existing Student Tower) */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Tier
              </label>
              <select
                value="all"
                disabled
                title="Data tier kampus belum tersedia di Student Tower"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 12.5,
                  color: '#94a3b8',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'not-allowed'
                }}
              >
                <option value="all">Semua tier</option>
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

            {/* 6. Peluang */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 5 }}>
                Peluang
              </label>
              <select
                value={opportunityFilter}
                onChange={(e) => setOpportunityFilter(e.target.value as OpportunityFilter)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 12.5,
                  color: opportunityFilter === 'all' ? '#64748b' : '#0f172a',
                  background: '#ffffff',
                  border: '1px solid #d0d5dd',
                  borderRadius: 6,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Semua peluang</option>
                <option value="realistic">Sudah &amp; hampir tercapai (≥ {ZONE_NEAR_GAP})</option>
                <option value="safe">Sudah tercapai (≥ 0)</option>
                <option value="near">Hampir tercapai (-1 s.d. {ZONE_NEAR_GAP})</option>
                <option value="target">Dicapai bertahap ({ZONE_NEAR_GAP - 1} s.d. {ZONE_WIDE_GAP + 1})</option>
                <option value="reach">Perlu usaha besar (≤ {ZONE_WIDE_GAP})</option>
              </select>
            </div>
          </div>

          <div className="rg-table-wrap" style={{ marginTop: 0 }}>
            <table className="rg-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Program studi &amp; perguruan tinggi</th>
                  <th style={{ width: '11%', textAlign: 'center' }}>Skor terbobot</th>
                  <th style={{ width: '11%', textAlign: 'center' }}>Target acuan</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Jarak target</th>
                  <th style={{ width: '16%', textAlign: 'center' }}>Peminat dan lokasi</th>
                  <th style={{ width: '22%', textAlign: 'right' }}>Untuk Pilihan {focusedSlotIdx + 1}</th>
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
                    const isCompared = compareIds.includes(sim.catalog.id);
                    const theme = getZoneTheme(sim.zone);

                    return (
                      <tr
                        key={sim.catalog.id}
                        style={{
                          background: isCompared ? '#f0f9ff' : activeLabel ? '#f8fafc' : undefined
                        }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <strong style={{ color: '#0f172a', fontSize: 13 }}>
                              {sim.catalog.prodi} — {sim.catalog.shortUniv}
                            </strong>
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                background: sim.catalog.degree === 'S1' ? '#f1f5f9' : '#ecfdf3',
                                color: sim.catalog.degree === 'S1' ? '#475569' : '#027a48',
                                border: `1px solid ${sim.catalog.degree === 'S1' ? '#e2e8f0' : '#a6f4c5'}`,
                                padding: '1px 5px',
                                borderRadius: 4
                              }}
                            >
                              {sim.catalog.degree}
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
                          <Pill tone={toneForGap(sim.gap)}>
                            {sim.gap > 0 ? `+${sim.gap}` : sim.gap}
                          </Pill>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: 11.5, color: '#334155' }}>
                          <div>
                            <strong>{sim.catalog.tightness.replace('.', ',')}</strong> · {sim.catalog.quota2026} kursi
                          </div>
                          <div style={{ color: '#64748b', marginTop: 2 }}>
                            {sim.catalog.city}, {sim.catalog.province}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <Button
                              variant={isCompared ? 'primary' : 'default'}
                              size="sm"
                              onClick={() => toggleCompareCandidate(sim.catalog.id)}
                            >
                              {isCompared ? '✓ Dibandingkan' : '+ Bandingkan'}
                            </Button>
                            <Button variant="soft" size="sm" onClick={() => handleApplyToFocusedSlot(sim)}>
                              Pilih
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mandatory Disclaimer */}
        <Callout tone="warn" icon={<Info size={17} />} style={{ marginBottom: 24 }}>
          <div>
            <strong>Disclaimer:</strong> Target ini acuan internal Ruangguru, bukan passing grade resmi dan bukan jaminan lolos. Gunakan simulasi ini bersama siswa dan orang tua untuk menyepakati kombinasi pilihan yang realistis.
          </div>
        </Callout>

        {/* Choice Review Modal before execute */}
        {reviewTarget && (
          <ChoiceReviewModal
            isOpen={Boolean(reviewTarget)}
            onClose={() => setReviewTarget(null)}
            student={student}
            activePrograms={activePrograms}
            initialTargetIdx={reviewTarget.slotIdx}
            newProgram={reviewTarget.program}
            scoreBasisLabel={scoreBasisLabel}
            onConfirmApply={handleConfirmApplyFromModal}
          />
        )}

        {/* Reset Confirmation Dialog */}
        <Dialog
          open={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          title="Kembalikan ke Pilihan Awal?"
          ariaLabel="Konfirmasi reset pilihan jurusan"
          footer={
            <>
              <Button onClick={() => setIsResetConfirmOpen(false)}>Batal</Button>
              <Button variant="danger" onClick={handleConfirmResetPrograms}>Ya, Kembalikan ke Data Awal</Button>
            </>
          }
        >
          <p className="rg-note" style={{ marginBottom: 8 }}>Siswa: {student.name}</p>
          <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, margin: 0 }}>
            Seluruh perubahan formulasi hasil simulasi untuk <strong>{student.name}</strong> akan dihapus dan dikembalikan ke 3 pilihan awal siswa saat sesi konsultasi dibuka.
          </p>
        </Dialog>

        {/* Remove Slot Confirmation Dialog */}
        <Dialog
          open={slotToRemove !== null}
          onClose={() => setSlotToRemove(null)}
          title={slotToRemove ? `Hapus Pilihan ${slotToRemove.idx + 1}?` : ''}
          ariaLabel="Konfirmasi hapus slot pilihan"
          footer={
            <>
              <Button onClick={() => setSlotToRemove(null)}>Batal</Button>
              <Button variant="danger" onClick={handleConfirmRemoveSlot}>Ya, Hapus Pilihan</Button>
            </>
          }
        >
          {slotToRemove && (
            <>
              <p className="rg-note" style={{ marginBottom: 8 }}>
                {slotToRemove.choice.prodi} — {slotToRemove.choice.univ}
              </p>
              <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, margin: 0 }}>
                Apakah Anda yakin ingin menghapus <strong>{slotToRemove.choice.prodi} ({slotToRemove.choice.univ})</strong> dari formulasi pilihan {student.name}? Urutan pilihan di bawahnya akan digeser secara otomatis.
              </p>
            </>
          )}
        </Dialog>
      </main>
    </div>
  );
};
