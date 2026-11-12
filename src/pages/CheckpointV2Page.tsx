import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Info, Building2, Wrench, ShieldCheck, BookOpen, Compass, FileText, GitBranch, ChevronDown, GraduationCap } from 'lucide-react';
import { V2PdfModal } from '../components/V2PdfModal';
import {
  CHECKPOINT1_STUDENTS,
  ProgramChoice
} from '../data/garudaData';
import { STUDENT_CLASSROOM_DATA, STUDENT_SA_HISTORY_NOTES } from '../data/classroomData';
import {
  validateSnbtChoices,
  derivePrioritySubtestsForChoice1,
  matchCatalogProgram,
  getStudentBaselinePrograms
} from '../data/programCatalog';
import { useRuleConfig } from '../utils/saRuleStore';
import {
  analyzeStage1,
  analyzeStage2,
  analyzeStage3Subtest,
  analyzeStage3Overall,
  analyzeStage4,
  analyzeStageClassroom,
  computeProgramPacing,
  classifySubtestPattern
} from '../utils/saGuidelineEngine';
import { safeGetItem, safeSetItem, loadCustomPrograms } from '../utils/safeStorage';
import { isReportLocked, setReportLocked } from '../utils/reportLock';
import { LockBanner } from '../components/LockBanner';
import { AppTopbar } from '../components/AppTopbar';

export const CheckpointV2Page: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { config: ruleConfig, isCustomized: isRuleCustomized } = useRuleConfig();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const fromParam = searchParams.get('student');
    if (fromParam && CHECKPOINT1_STUDENTS.some((s) => s.id === fromParam)) {
      return fromParam;
    }
    const saved = safeGetItem('bac_v2_active_student_v1');
    if (saved && CHECKPOINT1_STUDENTS.some((s) => s.id === saved)) {
      return saved;
    }
    return 'garuda';
  });

  useEffect(() => {
    const fromParam = searchParams.get('student');
    if (fromParam && CHECKPOINT1_STUDENTS.some((s) => s.id === fromParam)) {
      setSelectedStudentId(fromParam);
      safeSetItem('bac_v2_active_student_v1', fromParam);
    }
  }, [searchParams]);

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

  const activeStudent = CHECKPOINT1_STUDENTS.find((s) => s.id === selectedStudentId) || CHECKPOINT1_STUDENTS[0];
  const studentIdentity = activeStudent.identity;
  const subtestsV2Data = activeStudent.subtests;

  const [customProgramsByStudent, setCustomProgramsByStudent] = useState<Record<string, ProgramChoice[]>>(() => loadCustomPrograms());

  const customPrograms = customProgramsByStudent[activeStudent.id];
  const targetPrograms = customPrograms || getStudentBaselinePrograms(activeStudent);
  const isProgramsCustomized = Boolean(customPrograms);

  const handleResetPrograms = () => {
    if (!window.confirm('Kembalikan pilihan jurusan ke data awal siswa? Perubahan dari Simulasi akan dihapus.')) return;
    setCustomProgramsByStudent((prev) => {
      const next = { ...prev };
      delete next[activeStudent.id];
      safeSetItem('bac_v2_custom_programs_v1', JSON.stringify(next));
      return next;
    });
  };

  const prioritySubtestsV2 = derivePrioritySubtestsForChoice1(
    activeStudent,
    targetPrograms[0],
    ruleConfig.thresholds.foundationScoreTarget
  );

  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true'
  );
  const [isLocked, setIsLocked] = useState<boolean>(() => isReportLocked(activeStudent.id));
  const [lockErrorMsg, setLockErrorMsg] = useState<string | null>(null);
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<string>('tahap1');
  const classroomData = STUDENT_CLASSROOM_DATA[activeStudent.id] || STUDENT_CLASSROOM_DATA.garuda;
  const saHistoryNotes = STUDENT_SA_HISTORY_NOTES[activeStudent.id] || [];
  const saNotesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const saNotesStorageKey = `bac_v2_sa_notes_${activeStudent.id}`;
  const [saNotes, setSaNotes] = useState<string>(() => {
    return safeGetItem(`bac_v2_sa_notes_${activeStudent.id}`) || '';
  });
  const [classFilter, setClassFilter] = useState<'notes' | 'all' | 'absent'>('notes');
  const [classPage, setClassPage] = useState<number>(1);

  useEffect(() => {
    setClassFilter('notes');
    setClassPage(1);
    setLockErrorMsg(null);
    setIsLocked(isReportLocked(activeStudent.id));
    setSaNotes(safeGetItem(`bac_v2_sa_notes_${activeStudent.id}`) || '');
  }, [activeStudent.id]);

  useEffect(() => {
    const preview = searchParams.get('preview');
    if (preview === '1' || preview === 'true') {
      setIsPdfOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const stageIds = ['tahap1', 'tahap2', 'tahap3', 'tahap4', 'tahap5'];
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
      if (nearBottom) {
        setActiveStage('tahap5');
        return;
      }
      const offset = 160;
      let current = 'tahap1';
      for (const id of stageIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            current = id;
          }
        }
      }
      setActiveStage(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveNotes = () => {
    safeSetItem(saNotesStorageKey, saNotes);
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const targetId = id.replace('#', '');
    setActiveStage(targetId);
    const el = document.getElementById(targetId);
    if (el) {
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 132);
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const openPdf = () => setIsPdfOpen(true);
  const closePdf = () => setIsPdfOpen(false);

  // Dynamic KPI Metrics (computed strictly from student data)
  const toScoresList = studentIdentity.toScores;
  const latestToEpisode = toScoresList.length || 4;
  const latestToScore = toScoresList.length ? toScoresList[toScoresList.length - 1] : 0;
  const totalSubtestsCount = subtestsV2Data.length;
  const sortedSubtests = [...subtestsV2Data].sort((a, b) => a.gap - b.gap || a.to4 - b.to4);
  const top3WeakIds = sortedSubtests
    .filter((s) => s.to4 < 600)
    .slice(0, 3)
    .map((s) => s.id);
  const shortSubtestMap: Record<string, string> = {
    pu: 'PU',
    pk: 'PK',
    lbi_a: 'LBI Saintek',
    lbi_s: 'LBI Soshum',
    lbe: 'LBING',
    pbm: 'PBM',
    pm: 'PM',
    ppu: 'PPU'
  };
  const formatSubtestItem = (s: typeof subtestsV2Data[number]) => {
    const code = shortSubtestMap[s.id] || s.id.toUpperCase();
    const diff = s.to4 - 600;
    return `${code}: ${s.to4} (${diff >= 0 ? `+${diff}` : diff})`;
  };
  const aboveTargetSubtests = subtestsV2Data.filter((s) => s.to4 >= 600);
  const belowTargetSubtests = subtestsV2Data.filter((s) => s.to4 < 600);
  const aboveTooltip = aboveTargetSubtests.map(formatSubtestItem).join(' · ');
  const belowTooltip = belowTargetSubtests.map(formatSubtestItem).join(' · ');

  // Render helper for TO score trends
  const renderTrend = (curr: number, prev: number) => {
    if (curr > prev) return <span style={{ color: 'var(--green-ink)', fontSize: 12 }}> ▲</span>;
    if (curr < prev) return <span style={{ color: 'var(--red-ink)', fontSize: 12 }}> ▼</span>;
    return null;
  };

  // Helper for computing median of an array of numbers
  const computeMedian = (arr: number[]) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const formatNumIndo = (num: number) => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(1).replace('.', ',');
  };

  // 3-Warna Status Subtes: Hijau (>= 600), Merah (di bawah 600 & prioritas 1-3), Oranye (di bawah 600 di luar prioritas 1-3)
  const getSubtestStatus = (gap: number, isPriorityTop3: boolean = gap < 0) => {
    if (gap >= 0) return { label: 'Tercapai', badgeClass: 'badge badge-success', color: '#12b76a', textColor: 'var(--green-ink)' };
    if (isPriorityTop3) return { label: 'Prioritas perbaikan', badgeClass: 'badge badge-danger', color: '#d92d20', textColor: 'var(--red-ink)' };
    return { label: 'Perlu penguatan', badgeClass: 'badge badge-warn', color: '#f79009', textColor: 'var(--amber-ink)' };
  };

  // Dynamic Ringkasan 8 Subtes (Median 8 subtes saja)
  const medTO1 = computeMedian(subtestsV2Data.map((s) => s.to1));
  const medTO2 = computeMedian(subtestsV2Data.map((s) => s.to2));
  const medTO3 = computeMedian(subtestsV2Data.map((s) => s.to3));
  const medTO4 = computeMedian(subtestsV2Data.map((s) => s.to4));
  const medOverall = computeMedian([medTO1, medTO2, medTO3, medTO4]);
  const medGap = medTO4 - 600;
  const medFillPct = Math.max(0, Math.min(100, ((medTO4 - 400) / 300) * 100));
  const medStatus = getSubtestStatus(medGap, medGap <= -90);

  // Subtest with largest fluctuation for dynamic educational callout
  const maxFluctSub = [...subtestsV2Data].sort((a, b) => {
    const rangeB = Math.max(b.to1, b.to2, b.to3, b.to4) - Math.min(b.to1, b.to2, b.to3, b.to4);
    const rangeA = Math.max(a.to1, a.to2, a.to3, a.to4) - Math.min(a.to1, a.to2, a.to3, a.to4);
    return rangeB - rangeA;
  })[0] || subtestsV2Data[0];

  const renderSaHistoryBlock = (sectionId: string, heading: string, subtitle: string) => (
    <div className="section-block" id={sectionId} style={{ marginBottom: 20 }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h3 className="section-title" style={{ fontSize: 15 }}>{heading}</h3>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitle}</span>
      </div>

      {saHistoryNotes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {saHistoryNotes.map((note) => (
            <div
              key={note.id}
              style={{
                background: '#f2f8f7',
                border: '1px solid var(--primary-border)',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 12,
                lineHeight: 1.5
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ color: 'var(--tosca-dark)' }}>{note.topicTag}</strong>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {note.dateLabel}</span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '1.5px 7px',
                    borderRadius: 9999,
                    background: note.followUpStatus === 'Selesai' ? '#ecfdf3' : '#fef0c7',
                    color: note.followUpStatus === 'Selesai' ? 'var(--green-ink)' : 'var(--amber-ink)',
                    border: `1px solid ${note.followUpStatus === 'Selesai' ? '#a6f4c5' : '#fedf89'}`
                  }}
                >
                  {note.followUpStatus}
                </span>
              </div>
              <p style={{ margin: '0 0 6px', color: '#1e293b' }}>{note.summary}</p>
              <div style={{ fontSize: 12, color: 'var(--slate-600)' }}>
                Dicatat oleh: <strong>{note.author}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
          Belum ada riwayat catatan Kakak Asuh di Student Tower untuk siswa ini.
        </div>
      )}
    </div>
  );

  // 3-Warna Kartu Subtes Prioritas (Hijau / Oranye / Merah)
  const getCardTheme = (gapToTarget: number, toLatestNum: number) => {
    if (gapToTarget >= 0) {
      return {
        status: 'Tercapai',
        textColor: 'var(--green-ink)',
        borderColor: '#a6f4c5',
        boxBg: '#ecfdf3',
        boxBorder: '#a6f4c5',
        dashBorder: '#a6f4c5'
      };
    }
    if (toLatestNum >= 600 || gapToTarget >= -60) {
      return {
        status: 'Perlu penguatan',
        textColor: 'var(--amber-ink)',
        borderColor: '#fedf89',
        boxBg: '#fffcf5',
        boxBorder: '#fef0c7',
        dashBorder: '#fedf89'
      };
    }
    return {
      status: 'Prioritas utama',
      textColor: 'var(--red-ink)',
      borderColor: '#fecdca',
      boxBg: '#fffbfa',
      boxBorder: '#fee4e2',
      dashBorder: '#fecdd3'
    };
  };

  const getProgramGapColor = (gap: number) => {
    if (gap >= 0) return 'var(--green-ink)';
    if (gap >= -70) return 'var(--amber-ink)';
    return 'var(--red-ink)';
  };

  // Deterministic, White-Box SA Guideline Engine (Controllable via /engine)
  const attendanceNumeric = parseFloat(studentIdentity.attendanceRate.replace('%', '')) || 0;
  const stage1Out = analyzeStage1(
    {
      toScores: toScoresList,
      subtestRows: subtestsV2Data.map((s) => ({
        id: s.id,
        name: s.name,
        scores: [s.to1, s.to2, s.to3, s.to4],
        toLatest: s.to4
      })),
      attendanceRatePct: attendanceNumeric
    },
    ruleConfig
  );

  const stage2Out = analyzeStage2(
    {
      programs: targetPrograms,
      familyAlignment: activeStudent.familyAlignment,
      studentHomeCity: activeStudent.identity.branch.split('-')[0].trim()
    },
    ruleConfig
  );

  const stage3SubtestInputs = prioritySubtestsV2.map((item) => ({
    id: item.id,
    name: item.name,
    toLatest: item.toLatestNum,
    gapTo600: item.gapNum,
    drillQuestions: item.rgQuestionsDone,
    drillSessions: item.drillSessions,
    drillAccuracyPct: item.drillAccuracyPct
  }));
  const stage3OverallOut = analyzeStage3Overall(stage3SubtestInputs, ruleConfig);
  const stageClassroomOut = analyzeStageClassroom(
    {
      totalSessions: classroomData.totalSessions,
      presentSessions: classroomData.presentSessions,
      lateSessions: classroomData.lateSessions,
      sickSessions: classroomData.sickSessions,
      excusedSessions: classroomData.excusedSessions,
      notesCount: classroomData.notesCount
    },
    ruleConfig
  );
  const stage4Out = analyzeStage4(
    {
      hasConflictOrLocationCheck:
        activeStudent.familyAlignment === 'different_major' ||
        activeStudent.familyAlignment === 'location_limit' ||
        stage2Out.isConflict,
      hasMissingDrill: prioritySubtestsV2.some(
        (s) => s.rgQuestionsDone <= ruleConfig.thresholds.drillMismatchLowQ
      ),
      prioritySubtests: prioritySubtestsV2,
      studentName: activeStudent.identity.name,
      saName: activeStudent.identity.saName,
      parentName: activeStudent.identity.parentName
    },
    ruleConfig
  );

  const handleToggleLock = () => {
    if (!isLocked && !saNotes.trim()) {
      setLockErrorMsg('Isi Catatan Khusus Kakak Asuh di Tahap 5 terlebih dahulu sebelum mengunci laporan.');
      const el = document.getElementById('sec_tahap5_agreement');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => saNotesTextareaRef.current?.focus(), 350);
      return;
    }
    setLockErrorMsg(null);
    const next = !isLocked;
    setReportLocked(activeStudent.id, next);
    setIsLocked(next);
  };

  return (
    <div>
      {/* Topbar */}
      <AppTopbar
        crumbs={[
          { label: 'Home', to: '/v2' },
          { label: 'Konsultasi - Checkpoint', to: '/v2' },
          { label: 'Detail Checkpoint 1' }
        ]}
        saName={studentIdentity.saName}
        saEmail={studentIdentity.saEmail}
        engine={{ customized: isRuleCustomized }}
      />

      <main className="container" style={{ paddingBottom: 60 }}>
        {/* Action Bar (Aligned with Super CMS Profiling Layout) */}
        <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-back"
            style={{ padding: '7px 14px', fontSize: 12.5, whiteSpace: 'nowrap' }}
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={15} />
            Kembali
          </button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to={`/simulasi?student=${activeStudent.id}`}
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: 12.5, whiteSpace: 'nowrap' }}
              title="Buka Halaman Simulasi Peluang & Komparasi Prodi PTN"
            >
              <Compass size={14} /> Simulasi
            </Link>
            <Link
              to={`/rapor?student=${activeStudent.id}`}
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: 12.5, whiteSpace: 'nowrap' }}
              title="Lihat & Update Nilai Rapor Semester 1–5"
            >
              📝 Update Rapor
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={openPdf}
              title="Download PDF Laporan Resmi 2 Halaman"
              style={{ padding: '7px 14px', fontSize: 12.5, whiteSpace: 'nowrap' }}
            >
              <FileText size={14} /> Download PDF
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleToggleLock}
              style={{
                padding: '7px 16px',
                fontSize: 12.5,
                whiteSpace: 'nowrap',
                background: isLocked ? 'var(--slate-600)' : 'var(--primary)',
                borderColor: isLocked ? 'var(--slate-600)' : 'var(--primary)'
              }}
            >
              {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
              {isLocked ? 'Buka Kunci' : 'Kunci'}
            </button>
          </div>
        </div>

        {isLocked && (
          <LockBanner studentId={activeStudent.id} hideAction>
            Pilihan jurusan, nilai rapor, dan catatan Kakak Asuh dibekukan sebagai versi final. Klik <strong>Buka Kunci</strong> untuk mengedit lagi.
          </LockBanner>
        )}

        {/* Student Header */}
        <div className="student-header" style={{ marginBottom: 16 }}>
          <div className="student-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0 }}>{studentIdentity.name}</h1>

              {/* Dropdown Ganti Siswa (di sebelah nama, menggantikan label draft aktif) */}
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
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Pilih profil siswa Checkpoint 1"
                >
                  <span style={{ color: 'var(--tosca-dark)', fontWeight: 700 }}>Ganti Siswa</span>
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
                      border: '1px solid var(--border)',
                      padding: '6px',
                      minWidth: 320,
                      zIndex: 9999
                    }}
                  >
                    <div style={{ padding: '6px 10px 4px', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Pilih Profil Siswa Checkpoint 1
                    </div>
                    {CHECKPOINT1_STUDENTS.map((st) => {
                      const isSelected = st.id === selectedStudentId;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(st.id);
                            safeSetItem('bac_v2_active_student_v1', st.id);
                            setSearchParams({ student: st.id });
                            setIsStudentMenuOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            background: isSelected ? 'var(--primary-light)' : 'transparent',
                            border: 'none',
                            padding: '8px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'block',
                            transition: 'background 0.1s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'var(--page-bg)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--tosca-dark)' : '#1e293b' }}>
                              {st.name}
                            </span>
                            {isSelected && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tosca-dark)' }}>✓ Aktif</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                            {st.tagline}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              <span>NISN: <strong>{studentIdentity.nisn}</strong></span>
              <span className="student-tag">{studentIdentity.school}</span>
              <span className="student-tag">Kelas 12 SMA</span>
              <span className="student-tag">{studentIdentity.branch}</span>
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--muted)' }}>
            <div>Sesi: <strong>{studentIdentity.sessionType}</strong></div>
            <div style={{ marginTop: 2 }}>Tanggal: <strong>{studentIdentity.sessionDate}</strong></div>
          </div>
        </div>

        {/* STICKY QUICK-JUMP SUB-NAV (CONTINUOUS TOP-TO-BOTTOM ALUR) */}
        <nav
          className="jump-nav-container"
          aria-label="Alur Konsultasi 5 Tahap"
          style={{
            position: 'sticky',
            top: 68,
            zIndex: 40,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-strong)',
            borderRadius: 10,
            padding: '8px 16px',
            marginBottom: 28,
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <div className="jump-nav-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-strong)', whiteSpace: 'nowrap' }}>
            🧭 <span>Alur:</span>
          </div>
          <div className="jump-nav-links" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button type="button" onClick={(e) => scrollTo(e, '#tahap1')} className={`jump-pill ${activeStage === 'tahap1' ? 'active' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }}>
              🎯 1. Evaluasi Tryout
            </button>
            <button type="button" onClick={(e) => scrollTo(e, '#tahap2')} className={`jump-pill ${activeStage === 'tahap2' ? 'active' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }}>
              🏛️ 2. Analisis Jurusan
            </button>
            <button type="button" onClick={(e) => scrollTo(e, '#tahap3')} className={`jump-pill ${activeStage === 'tahap3' ? 'active' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }}>
              🛠️ 3. Subtes &amp; Drill Soal
            </button>
            <button type="button" onClick={(e) => scrollTo(e, '#tahap4')} className={`jump-pill ${activeStage === 'tahap4' ? 'active' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }}>
              🏫 4. Catatan Pengajar &amp; SA
            </button>
            <button type="button" onClick={(e) => scrollTo(e, '#tahap5')} className={`jump-pill ${activeStage === 'tahap5' ? 'active' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }}>
              📝 5. Tindak Lanjut Belajar
            </button>
          </div>
        </nav>

        {/* ========================================================= */}
        {/* TAHAP 1: FONDASI 600 & EVALUASI SKOR IRT REGULER          */}
        {/* ========================================================= */}
        <section id="tahap1" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '3px 10px', borderRadius: 9999 }}>
                Tahap 1
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                Kemampuan dasar di 8 subtes
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Target Fondasi 600 Semester 1</span>
          </div>


          {/* Metrics Summary */}
          <div className="section-block" id="sec_tahap1_metrics">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>
                1. Ringkasan Evaluasi Skor Reguler Siswa — Tryout Episode {latestToEpisode}
              </h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Acuan Skor Tryout Terakhir (TO {latestToEpisode})</span>
            </div>
            
            {/* Minimalist 4-Column KPI Summary Strip (100% Data-Driven from Latest TO) */}
            <div
              className="metrics-grid"
              style={{
                gap: 1,
                background: 'var(--border)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 16
              }}
            >
              {/* Metric 1 */}
              <div title={`Riwayat TO 1–${latestToEpisode}: ${toScoresList.join(' → ')}`} style={{ background: '#ffffff', padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Skor TO {latestToEpisode} (Terakhir)
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--tosca-dark)', lineHeight: 1.2, marginTop: 4 }}>
                  {latestToScore}
                </div>
              </div>

              {/* Metric 2 */}
              <div title={aboveTooltip || undefined} style={{ background: '#ffffff', padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Di Atas Target 600
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-ink)', lineHeight: 1.2, marginTop: 4 }}>
                  {aboveTargetSubtests.length} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>/ {totalSubtestsCount} subtes</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div title={belowTooltip || undefined} style={{ background: '#ffffff', padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Di Bawah Target 600
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red-ink)', lineHeight: 1.2, marginTop: 4 }}>
                  {belowTargetSubtests.length} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>/ {totalSubtestsCount} subtes</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div title={studentIdentity.attendanceDetail} style={{ background: '#ffffff', padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Kehadiran Kelas
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink-strong)', lineHeight: 1.2, marginTop: 4 }}>
                  {studentIdentity.attendanceRate}
                </div>
              </div>
            </div>

            {/* Panduan Edukasi Dua Sistem Skor (Matching PDF Styling) */}
            <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '14px 18px', marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <BookOpen size={16} color="var(--primary)" />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                  Cara membaca dua jenis skor
                </h4>
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>Diselaraskan dengan Halaman 1 Laporan Resmi PDF</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {/* Skor per subtes */}
                <div style={{ background: '#f2f8f7', border: '1px solid var(--primary-border)', borderTop: '3px solid #58aebd', borderRadius: 6, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)' }}>Skor per subtes</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tosca-dark)', background: 'var(--primary-light)', padding: '1.5px 6px', borderRadius: 4 }}>Skor IRT Reguler</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 6 }}>Kemampuan dasar di 8 subtes, sama untuk semua jurusan</div>
                  <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    Setiap subtes dinilai dengan satu cara hitung yang sama. Angkanya tidak berubah saat pilihan jurusan berganti.
                  </p>
                  <div style={{ fontSize: 12, color: 'var(--tosca-dark)', background: 'var(--primary-light)', padding: '5px 8px', borderRadius: 4 }}>
                    <strong>Dipakai untuk:</strong> Memantau fondasi tiap subtes dan target Semester 1 (seluruh subtes minimal 600).
                  </div>
                </div>

                {/* Skor sesuai jurusan */}
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderTop: '3px solid #7c3aed', borderRadius: 6, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#6b21a8' }}>Skor sesuai jurusan</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6b21a8', background: '#f3e8ff', padding: '1.5px 6px', borderRadius: 4 }}>Skor IRT Terbobot</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 6 }}>Nilai yang dihitung sesuai bobot jurusan tujuan</div>
                  <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    Skor dihitung ulang dengan bobot subtes milik tiap program studi, sehingga hasilnya berbeda untuk setiap pilihan jurusan.
                  </p>
                  <div style={{ fontSize: 12, color: '#581c87', background: '#f5f3ff', padding: '5px 8px', borderRadius: 4 }}>
                    <strong>Dipakai untuk:</strong> Melihat jarak ke skor lolos jurusan impian (di Tahap 3).
                  </div>
                </div>
              </div>

              {/* Bottom Yellow Callout */}
              <div style={{ background: '#fffaeb', border: '1px solid #fedf89', borderLeft: '4px solid #f79009', borderRadius: 6, padding: '9px 13px', fontSize: 12, color: 'var(--amber-ink)', lineHeight: 1.5 }}>
                💡 <strong>Mengapa semua subtes dikejar ke 600?</strong> Bobot subtes berbeda di tiap jurusan. Subtes yang tertinggal jauh (&lt;500) akan menarik jatuh skor satu jurusan lebih jauh dibanding jurusan lain. Dengan fondasi 600 di seluruh 8 subtes, tidak ada subtes yang menjadi titik lemah di jurusan mana pun.
              </div>
            </div>
          </div>



          {/* Table 8 Subtests */}
          <div className="section-block" id="sec_tahap1_table">
            <div className="section-header" style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="section-title" style={{ fontSize: 15, margin: 0 }}>
                  2. Evaluasi Capaian {totalSubtestsCount} Subtes vs Target 600
                </h3>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--tosca-dark)',
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    padding: '2px 10px',
                    borderRadius: 9999
                  }}
                >
                  Pola Terdeteksi: {stage1Out.patternLabel}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Diurutkan dari jarak terdalam • Menyorot hingga 3 subtes prioritas perbaikan (&lt; 600)
              </span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '24%' }}>Subtes UTBK SNBT</th>
                    <th style={{ textAlign: 'center', width: '6.5%' }}>TO 1</th>
                    <th style={{ textAlign: 'center', width: '6.5%' }}>TO 2</th>
                    <th style={{ textAlign: 'center', width: '6.5%' }}>TO 3</th>
                    <th style={{ textAlign: 'center', width: '6.5%' }}>TO 4</th>
                    <th style={{ textAlign: 'center', width: '7.5%' }}>Median</th>
                    <th style={{ textAlign: 'center', width: '15.5%' }}>Pola Tren</th>
                    <th style={{ width: '17%' }}>Visual Posisi vs Target 600</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Jarak ke target</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubtests.map((sub) => {
                    const focusRank = top3WeakIds.indexOf(sub.id);
                    const isFocus = focusRank !== -1;
                    const rowStatus = getSubtestStatus(sub.gap, isFocus);
                    const subPattern = stage1Out.subtestPatterns[sub.id];

                    return (
                      <tr
                        key={sub.id}
                        style={
                          isFocus
                            ? { background: '#fffbfa' }
                            : sub.gap < 0
                            ? { background: '#fffcf5' }
                            : undefined
                        }
                      >
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                            <strong>{sub.name}</strong>
                            {isFocus && (
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: 'var(--red-ink)',
                                  background: '#fee4e2',
                                  border: '1px solid #fecdca',
                                  padding: '1.5px 6px',
                                  borderRadius: 4,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                Prioritas perbaikan {focusRank + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{sub.to1}</td>
                        <td style={{ textAlign: 'center' }}>{sub.to2}{renderTrend(sub.to2, sub.to1)}</td>
                        <td style={{ textAlign: 'center' }}>{sub.to3}{renderTrend(sub.to3, sub.to2)}</td>
                        <td
                          style={{
                            textAlign: 'center',
                            fontWeight: 700,
                            color: rowStatus.textColor
                          }}
                        >
                          {sub.to4}{renderTrend(sub.to4, sub.to3)}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {sub.median}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {subPattern ? (
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: 12,
                                fontWeight: 700,
                                color: subPattern.color,
                                background: subPattern.bg,
                                border: `1px solid ${subPattern.border}`,
                                padding: '2px 7px',
                                borderRadius: 9999,
                                whiteSpace: 'nowrap'
                              }}
                              title={`Pola skor ${sub.name}: ${sub.to1} → ${sub.to2} → ${sub.to3} → ${sub.to4}`}
                            >
                              {subPattern.label}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <div className="v2-progress-track">
                            <div className="v2-progress-fill" style={{ width: `${sub.fillPct}%`, background: rowStatus.color }} />
                            <div className="v2-progress-target-line" title="Target 600" />
                          </div>
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            fontWeight: 700,
                            color: rowStatus.textColor
                          }}
                        >
                          {sub.gap > 0 ? `+${sub.gap}` : sub.gap}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Ringkasan 8 Subtes Table (Median 8 Subtes Saja) */}
            <div className="table-container" style={{ marginTop: 14 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '24%' }}>Ringkasan 8 Subtes</th>
                    <th style={{ textAlign: 'center', width: '6.5%' }}>TO 1</th>
                    <th style={{ textAlign: 'center', width: '6.5%' }}>TO 2</th>
                    <th style={{ textAlign: 'center', width: '6.5%' }}>TO 3</th>
                    <th style={{ textAlign: 'center', width: '6.5%' }}>TO 4</th>
                    <th style={{ textAlign: 'center', width: '7.5%' }}>Median</th>
                    <th style={{ textAlign: 'center', width: '15.5%' }}>Pola Tren</th>
                    <th style={{ width: '17%' }}>Visual Posisi vs Target 600</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Jarak ke target</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const medPattern = classifySubtestPattern([medTO1, medTO2, medTO3, medTO4], ruleConfig);
                    return (
                      <tr>
                        <td><strong>Median 8 subtes</strong></td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--ink-soft)' }}>{formatNumIndo(medTO1)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--ink-soft)' }}>{formatNumIndo(medTO2)}{renderTrend(medTO2, medTO1)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--ink-soft)' }}>{formatNumIndo(medTO3)}{renderTrend(medTO3, medTO2)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: medStatus.textColor }}>{formatNumIndo(medTO4)}{renderTrend(medTO4, medTO3)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: 'var(--tosca-dark)' }}>{formatNumIndo(medOverall)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: 12,
                              fontWeight: 700,
                              color: medPattern.color,
                              background: medPattern.bg,
                              border: `1px solid ${medPattern.border}`,
                              padding: '2px 7px',
                              borderRadius: 9999,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {medPattern.label}
                          </span>
                        </td>
                        <td>
                          <div className="v2-progress-track">
                            <div className="v2-progress-fill" style={{ width: `${medFillPct.toFixed(1)}%`, background: medStatus.color }} />
                            <div className="v2-progress-target-line" title="Target 600" />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 12.5, color: medStatus.textColor }}>
                          {medGap > 0 ? `+${formatNumIndo(medGap)}` : formatNumIndo(medGap)}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* 3-Color Legend */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 10, fontSize: 12, color: 'var(--slate-600)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#d92d20', display: 'inline-block', borderRadius: 2 }}></span> Prioritas perbaikan (&lt; 600 · Terendah 1–3)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#f79009', display: 'inline-block', borderRadius: 2 }}></span> Butuh penguatan (&lt; 600 di luar prioritas 1–3)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#12b76a', display: 'inline-block', borderRadius: 2 }}></span> Tercapai (≥ 600)
              </span>
            </div>

          </div>

          {/* Live Consultation Prompt: Tahap 1 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap1_guide" style={{ background: '#f2f8f7', border: '1px solid var(--primary-border)', borderLeft: '4px solid #58aebd', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--tosca-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={16} />
                Panduan Kakak Asuh: Mengulas Tren Skor &amp; Fondasi 600
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/engine" style={{ fontSize: 12, fontWeight: 700, color: 'var(--tosca-dark)', textDecoration: 'none' }}>
                  Lihat &amp; Kontrol Engine →
                </Link>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--ink-strong)', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
              <strong>Temuan Data:</strong> {stage1Out.observation}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Panduan Kakak Asuh */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 PANDUAN KAKAK ASUH:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: 'var(--ink-strong)' }}>• Ke Siswa:</strong> {stage1Out.studentTask}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--ink-strong)' }}>• Ke Orang Tua:</strong> {stage1Out.parentTask}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--ink-strong)' }}>• Arah Tindak Lanjut:</strong> {stage1Out.nextStep}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Catatan Tambahan */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: 'var(--green-ink)', marginBottom: 4 }}>🧭 CATATAN KONDISI &amp; RAMBU:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: 'var(--ink-soft)' }}>
                    {stage1Out.extraNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                    <li><strong>Netral terhadap skor:</strong> Bahas pengalaman pengerjaan siswa terlebih dahulu sebelum menyimpulkan penyebab naik/turunnya nilai.</li>
                  </ul>
                </div>

                <div style={{ background: 'var(--primary-light)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--primary-border)', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 4 }}>📊 KONTEKS DATA (MEDIAN PRIBADI):</div>
                  <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
                    Median (contoh {maxFluctSub.name} <code>{maxFluctSub.to1}→{maxFluctSub.to2}→{maxFluctSub.to3}→{maxFluctSub.to4}</code> = <strong>{maxFluctSub.median}</strong>) berasal dari <strong>riwayat pribadi siswa</strong> untuk melihat skor tipikal saat hasil berfluktuasi, bukan ranking nasional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        <section id="tahap2" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '3px 10px', borderRadius: 9999 }}>
                Tahap 2
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                🏛️ Skor IRT Terbobot &amp; Evaluasi Peluang Jurusan PTN
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Formula Pembobotan Resmi CMS Ruangguru</span>
          </div>


          {/* Table Program Choices */}
          <div className="section-block" id="sec_tahap2_table">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="section-title" style={{ fontSize: 15, margin: 0 }}>
                  1. Evaluasi Peluang {targetPrograms.length} Pilihan Jurusan PTN
                </h3>
                {(() => {
                  const snbtCheck = validateSnbtChoices(targetPrograms);
                  return (
                    <span
                      title={snbtCheck.message}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: snbtCheck.isValid ? 'var(--green-ink)' : 'var(--amber-ink)',
                        background: snbtCheck.isValid ? '#ecfdf3' : '#fff7ed',
                        border: `1px solid ${snbtCheck.isValid ? '#a6f4c5' : '#fed7aa'}`,
                        padding: '2px 8px',
                        borderRadius: 9999
                      }}
                    >
                      {snbtCheck.isValid ? `✓ Sah SNBT (${snbtCheck.patternLabel})` : `⚠ Cek Kombinasi SNBT (${snbtCheck.patternLabel})`}
                    </span>
                  );
                })()}
                {stage2Out.isConflict && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--amber-ink)',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '2px 8px',
                      borderRadius: 9999
                    }}
                  >
                    Rumpun Campuran / Perbedaan Pilihan
                  </span>
                )}
                {isProgramsCustomized && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--tosca-dark)',
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      padding: '2px 8px',
                      borderRadius: 9999
                    }}
                  >
                    ✓ Diperbarui dari Simulasi
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isProgramsCustomized && !isLocked && (
                  <button
                    type="button"
                    onClick={handleResetPrograms}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      background: '#ffffff',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 6,
                      padding: '4px 9px',
                      cursor: 'pointer'
                    }}
                  >
                    ↺ Reset Awal
                  </button>
                )}
                <Link
                  to={`/simulasi?student=${activeStudent.id}`}
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <Compass size={13} color="var(--primary)" />
                  Bandingkan / Ubah via Simulasi
                </Link>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Pilihan</th>
                    <th style={{ width: '34%' }}>Program Studi &amp; Perguruan Tinggi</th>
                    <th style={{ width: '13%', textAlign: 'center' }}>Target Acuan<br /><span style={{ fontSize: 12, fontWeight: 500 }}>(Terbobot)</span></th>
                    <th style={{ width: '13%', textAlign: 'center' }}>Skor Siswa (TO {latestToEpisode})<br /><span style={{ fontSize: 12, fontWeight: 500 }}>(Terbobot)</span></th>
                    <th style={{ width: '11%', textAlign: 'center' }}>Jarak Target</th>
                    <th style={{ width: '19%', textAlign: 'center' }}>Target Kenaikan / TO<br /><span style={{ fontSize: 12, fontWeight: 500 }}>(Kejar Acuan · {ruleConfig.thresholds.remainingEpisodesToNextConsult} TO)</span></th>
                  </tr>
                </thead>
                <tbody>
                  {targetPrograms.map((prog) => {
                    const catalogMatch = matchCatalogProgram(prog);
                    const pacing = computeProgramPacing(prog.weightedScore, prog.targetScore, prog.gap, ruleConfig);
                    return (
                      <tr key={`${prog.priority}_${prog.prodi}_${prog.univ}`}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--tosca-dark)' }}>
                            {prog.priority}
                          </span>
                        </td>
                        <td>
                          <strong>{prog.prodi}</strong><br />
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {prog.univ} · {prog.city} · Keketatan: {prog.tightness}
                            {catalogMatch ? ` (${catalogMatch.quota2026} kursi / ${catalogMatch.applicants2025.toLocaleString('id-ID')} peminat)` : ''}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink-strong)' }}>{prog.targetScore}</td>
                        <td style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--tosca-dark)' }}>{prog.weightedScore}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: getProgramGapColor(prog.gap) }}>
                          {prog.gap > 0 ? `+${prog.gap}` : prog.gap}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {pacing.isAchieved ? (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-ink)', background: '#ecfdf3', border: '1px solid #a6f4c5', padding: '2px 8px', borderRadius: 9999 }}>
                                Target terlewati
                              </span>
                            </div>
                          ) : (
                            <div
                              style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                              title={`Target TO ${latestToEpisode + 1}: ≥ ${pacing.nextToTargetScore} (dari skor TO ${latestToEpisode}: ${prog.weightedScore})`}
                            >
                              <strong style={{ fontSize: 13, color: pacing.needsPlanB ? 'var(--red-ink)' : 'var(--tosca-dark)' }}>
                                +{pacing.gainPerToNextConsult} poin / TO
                              </strong>
                              {pacing.needsPlanB ? (
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red-ink)', background: '#fee4e2', border: '1px solid #fecdca', padding: '1.5px 7px', borderRadius: 9999 }}>
                                  Berat · Siapkan Plan B
                                </span>
                              ) : (
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tosca-dark)', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '1.5px 7px', borderRadius: 9999 }}>
                                  Realistis dikejar
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(() => {
              const highestProg = [...targetPrograms].sort((a, b) => b.targetScore - a.targetScore)[0];
              if (!highestProg) return null;
              const highestPacing = computeProgramPacing(highestProg.weightedScore, highestProg.targetScore, highestProg.gap, ruleConfig);
              return (
                <div
                  style={{
                    marginTop: 12,
                    background: highestPacing.isAchieved ? '#ecfdf3' : '#f2f8f7',
                    border: `1px solid ${highestPacing.isAchieved ? '#a6f4c5' : 'var(--primary-border)'}`,
                    borderRadius: 8,
                    padding: '9px 14px',
                    fontSize: 12,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8
                  }}
                >
                  {highestPacing.isAchieved ? (
                    <span>
                      🎯 <strong style={{ color: 'var(--green-ink)' }}>Target Acuan Tertinggi ({highestProg.prodi} · {highestProg.univ}: {highestProg.targetScore}) sudah terlewati</strong> (skor saat ini {highestProg.weightedScore}) — fokus perlebar margin aman di atas pesaing.
                    </span>
                  ) : (
                    <span>
                      🎯 <strong style={{ color: 'var(--tosca-dark)' }}>Ringkasan Target TO {latestToEpisode + 1} (Acuan Tertinggi — {highestProg.prodi} · {highestProg.univ}):</strong>{' '}
                      kejar skor terbobot minimal <strong>≥ {highestPacing.nextToTargetScore}</strong>{' '}
                      <span style={{ color: 'var(--slate-600)' }}>
                        (+{highestPacing.gainPerToNextConsult} poin dari {highestProg.weightedScore} agar tetap di jalur melewati {highestProg.targetScore} dalam {ruleConfig.thresholds.remainingEpisodesToNextConsult} TO).
                      </span>
                    </span>
                  )}
                </div>
              );
            })()}

          </div>

          <div
            role="note"
            style={{ background: '#fffaeb', border: '1px solid #fedf89', borderLeft: '4px solid #f79009', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--amber-ink)', lineHeight: 1.5, marginTop: 16 }}
          >
            <strong>Catatan:</strong> Target dan jarak skor adalah acuan latihan internal Ruangguru, bukan passing grade resmi dan bukan jaminan kelulusan SNPMB.
          </div>

          {/* Live Consultation Prompt: Tahap 2 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap2_guide" style={{ background: '#f2f8f7', border: '1px solid var(--primary-border)', borderLeft: '4px solid #58aebd', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--tosca-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} />
                Panduan Kakak Asuh: Menyelaraskan Pilihan Jurusan &amp; Progres Menuju UTBK
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tosca-dark)', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '2px 10px', borderRadius: 9999 }}>
                Kondisi: {stage2Out.conditionLabel}
              </span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--ink-strong)', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
              <strong>Temuan Data:</strong> {stage2Out.observation}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Panduan Kakak Asuh */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 PANDUAN KAKAK ASUH:
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {stage2Out.saTasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Konteks Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: 'var(--green-ink)', marginBottom: 4 }}>🧭 RAMBU PROGRES HOLISTIK:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: 'var(--ink-soft)' }}>
                    <li><strong>CP1 → CP2 → UTBK:</strong> Di CP1 bangun laju kenaikan; di konsultasi berikutnya arahkan melewati target acuan; di konsultasi terakhir maksimalkan margin di atas pesaing.</li>
                    <li><strong>Makna Plan B:</strong> Jika selisih masih lebar, jadikan Pilihan 2–4 sebagai pengaman portofolio tanpa mematahkan motivasi di Pilihan 1.</li>
                  </ul>
                </div>

                <div style={{ background: 'var(--primary-light)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--primary-border)', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 4 }}>ℹ️ KONTEKS TARGET &amp; PERSAINGAN:</div>
                  <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
                    {stage2Out.guardrailNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        <section id="tahap3" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--amber-ink)', background: '#fef0c7', padding: '3px 10px', borderRadius: 9999 }}>
                Tahap 3
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                🛠️ 3 Subtes Prioritas (Acuan Pilihan 1) &amp; Aktivitas Drill Soal
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Periode data drill soal: 3 bulan terakhir (Student Tower)</span>
          </div>

          {/* Disclaimer ulang mengapa target semester 1 adalah 600 */}
          <div style={{ background: '#fffaeb', border: '1px solid #fedf89', borderLeft: '4px solid #f79009', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--amber-ink)', lineHeight: 1.5, marginBottom: 16 }}>
            💡 <strong>Mengapa target dasar Semester 1 adalah 600?</strong> Subtes prioritas dikunci ke <strong>Pilihan 1 ({targetPrograms[0]?.prodi || 'Prodi Utama'})</strong>. Jika target subtes pada jurusan pilihan berada di bawah 600, batas minimum <strong>600 tetap dipertahankan</strong> agar tidak ada titik lemah; jika target jurusan sudah di atas 600, acuan mengikuti target jurusan yang lebih tinggi tersebut.
          </div>

          {/* Cards 3 Subtests (Locked to Pilihan 1, 1 Row x 3 Columns) */}
          <div className="section-block" id="sec_tahap3_cards">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>
                1. Ringkasan 3 Subtes Prioritas ({targetPrograms[0]?.prodi} · {targetPrograms[0]?.univ})
              </h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Dipilih dari 3 bobot tertinggi Pilihan 1 · Periode drill 3 bulan terakhir
              </span>
            </div>

            {(() => {
              const cardItems = prioritySubtestsV2.map((item) => ({
                item,
                theme: getCardTheme(item.gapNum, item.toLatestNum),
                subRule: analyzeStage3Subtest(
                  {
                    id: item.id,
                    name: item.name,
                    toLatest: item.toLatestNum,
                    gapTo600: item.gapNum,
                    drillQuestions: item.rgQuestionsDone,
                    drillSessions: item.drillSessions,
                    drillAccuracyPct: item.drillAccuracyPct
                  },
                  ruleConfig
                )
              }));
              const allSameCondition =
                cardItems.length > 1 &&
                cardItems.every((c) => c.subRule.conditionId === cardItems[0].subRule.conditionId);

              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
                    {cardItems.map(({ item, theme, subRule }) => (
                      <div
                        key={item.id}
                        style={{
                          background: '#ffffff',
                          border: `1.5px solid ${theme.borderColor}`,
                          borderRadius: 10,
                          padding: 14,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                          <div>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: theme.textColor,
                                background: theme.boxBg,
                                border: `1px solid ${theme.borderColor}`,
                                padding: '2px 7px',
                                borderRadius: 4,
                                letterSpacing: 0.3,
                                display: 'inline-block',
                                textTransform: 'uppercase'
                              }}
                            >
                              {item.priorityLabel}
                            </span>
                            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-strong)', marginTop: 5, marginBottom: 0 }}>
                              {item.name}
                            </h4>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                              Target: <strong>{item.targetScore}</strong>
                              {item.rawProgramTarget < ruleConfig.thresholds.foundationScoreTarget && ' (min. 600)'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink-strong)', lineHeight: 1.1 }}>
                              {item.toScore}
                            </div>
                            <div style={{ fontSize: 12, color: theme.textColor, fontWeight: 700, marginTop: 3 }}>
                              {item.gapNum > 0 ? `+${item.gapNum}` : item.gapNum}
                            </div>
                          </div>
                        </div>

                        {/* Compact 2-Column Drill Strip */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 8,
                            background: 'var(--page-bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '8px 10px',
                            marginBottom: 10,
                            fontSize: 12
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Drill Aplikasi</div>
                            <strong style={{ color: 'var(--ink-strong)' }}>
                              {item.rgQuestionsDone} soal · {item.drillSessions} sesi
                            </strong>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Akurasi Drill</div>
                            <strong style={{ color: 'var(--ink-strong)' }}>{item.drillAccuracyPct}% benar</strong>
                          </div>
                        </div>

                        {/* 3 Topik Akurasi Terendah */}
                        <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45, marginBottom: 10, flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                            Topik Fokus Klinik PR:
                          </div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#475569' }}>
                        {item.lowestTopics.map((topic, idx) => (
                          <li key={idx} style={{ marginBottom: 2 }}>{topic}</li>
                        ))}
                      </ul>
                    </div>

                        {/* Diagnosa Ringkas */}
                        <div style={{ paddingTop: 8, borderTop: '1px dashed var(--border)', fontSize: 12, lineHeight: 1.45 }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: theme.textColor,
                              background: theme.boxBg,
                              border: `1px solid ${theme.boxBorder}`,
                              padding: '2px 8px',
                              borderRadius: 9999,
                              display: 'inline-block'
                            }}
                          >
                            {subRule.conditionLabel}
                          </span>
                          {!allSameCondition && (
                            <div style={{ color: 'var(--ink-soft)', marginTop: 5 }}>
                              {subRule.saTask}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {allSameCondition && cardItems[0] && (
                    <div
                      style={{
                        marginTop: 12,
                        background: cardItems[0].theme.boxBg,
                        border: `1px solid ${cardItems[0].theme.boxBorder}`,
                        borderRadius: 8,
                        padding: '9px 13px',
                        fontSize: 12,
                        color: 'var(--ink-soft)',
                        lineHeight: 1.5
                      }}
                    >
                      <strong style={{ color: cardItems[0].theme.textColor }}>
                        Arahan Umum ({cardItems[0].subRule.conditionLabel}):
                      </strong>{' '}
                      {cardItems[0].subRule.saTask}
                    </div>
                  )}
                </>
              );
            })()}

          </div>

          {/* Live Consultation Prompt: Tahap 3 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap3_guide" style={{ background: 'var(--page-bg)', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--amber-ink)', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--amber-ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={16} />
                Panduan Kakak Asuh: Audit Kebiasaan Drill Soal &amp; Prioritas Materi Klinik PR
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber-ink)', background: '#fef0c7', padding: '2px 10px', borderRadius: 9999 }}>
                Target Hasil: Sepakati topik Klinik PR &amp; perbaikan pola drill soal
              </span>
            </div>

            {stage3OverallOut.mismatchNote && (
              <div style={{ fontSize: 12, color: '#9a3412', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
                <strong>Temuan Pola Drill Soal:</strong> {stage3OverallOut.mismatchNote}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Panduan Kakak Asuh */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--amber-ink)', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 PANDUAN KAKAK ASUH:
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {stage3OverallOut.saTasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Konteks Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: 'var(--green-ink)', marginBottom: 4 }}>🧭 RAMBU KOMUNIKASI:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: 'var(--ink-soft)' }}>
                    <li><strong>Hindari drill semu:</strong> Apresiasi konsistensi di subtes yang sudah aktif, lalu ajak mengalihkan porsi drill soal ke subtes dengan gap terbesar.</li>
                    <li><strong>Jangan menyimpulkan &quot;malas&quot; dari angka 0:</strong> Data kosong hanya berarti belum tercatat di aplikasi—gali dulu kendala atau drill soal mandiri di luar sistem.</li>
                  </ul>
                </div>

                <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b45309', marginBottom: 4 }}>📏 CARA BACA METRIK SESI DRILL:</div>
                  <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
                    {stage3OverallOut.guardrailNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAHAP 4: AKTIVITAS BELAJAR DI KELAS & CATATAN PENGAJAR    */}
        {/* ========================================================= */}
        <section id="tahap4" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '3px 10px', borderRadius: 9999 }}>
                Tahap 4
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                🏫 Aktivitas Belajar di Kelas (TMB) &amp; Catatan Pengajar
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Periode {classroomData.periodLabel} · Sumber: Student Tower
            </span>
          </div>

          {renderSaHistoryBlock(
            'sec_tahap4_sa_history',
            '1. Riwayat Catatan Kakak Asuh (Student Tower)',
            'Diambil langsung dari log Student Tower · Tidak perlu pindah tab saat sesi konsultasi'
          )}

          <div className="section-block" id="sec_tahap4_classroom">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <h3 className="section-title" style={{ fontSize: 15 }}>2. Kehadiran Kelas &amp; Daftar Catatan Asli Pengajar</h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{classroomData.capturedLabel}</span>
            </div>

            {/* 2-Column Metadata Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Kehadiran Tatap Muka (TMB)
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-strong)' }}>
                    {classroomData.presentSessions} / {classroomData.totalSessions}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                    sesi ({((classroomData.presentSessions / classroomData.totalSessions) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-600)', marginTop: 4 }}>
                  {classroomData.presentSessions - classroomData.lateSessions} Hadir · {classroomData.lateSessions} Terlambat · {classroomData.sickSessions} Sakit · {classroomData.excusedSessions} Izin
                </div>
              </div>

              <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Kelengkapan Catatan Pengajar
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-strong)' }}>
                    {classroomData.notesCount} / {classroomData.totalSessions}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                    sesi bercatatan
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-600)', marginTop: 4 }}>
                  Menampilkan catatan asli pengajar langsung dari Student Tower
                </div>
              </div>
            </div>

            {/* Direct Session Notes List (100% Non-AI Verbatim Source) */}
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
              {(() => {
                const notedCount = classroomData.sessions.filter((s) => Boolean(s.noteText)).length;
                const absentOrLateCount = classroomData.sessions.filter((s) => s.attendance !== 'Hadir').length;
                const filteredSessions = classroomData.sessions.filter((s) => {
                  if (classFilter === 'notes') return Boolean(s.noteText);
                  if (classFilter === 'absent') return s.attendance !== 'Hadir';
                  return true;
                });

                const pageSize = 6;
                const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
                const safePage = Math.min(classPage, totalPages);
                const startIdx = (safePage - 1) * pageSize;
                const endIdx = Math.min(startIdx + pageSize, filteredSessions.length);
                const pagedSessions = filteredSessions.slice(startIdx, endIdx);

                const getAttBadgeStyle = (att: string) => {
                  if (att === 'Hadir') return { bg: '#ecfdf3', color: 'var(--green-ink)', border: '#a6f4c5' };
                  if (att === 'Terlambat') return { bg: '#fef0c7', color: 'var(--amber-ink)', border: '#fedf89' };
                  return { bg: '#fee4e2', color: 'var(--red-ink)', border: '#fecdca' };
                };

                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[
                          { id: 'notes' as const, label: `Ada Catatan (${notedCount})` },
                          { id: 'all' as const, label: `Semua Sesi (${classroomData.sessions.length})` },
                          { id: 'absent' as const, label: `Sakit / Izin / Terlambat (${absentOrLateCount})` }
                        ].map((tab) => {
                          const isActive = classFilter === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                setClassFilter(tab.id);
                                setClassPage(1);
                              }}
                              style={{
                                fontSize: 12,
                                fontWeight: isActive ? 700 : 600,
                                color: isActive ? 'var(--tosca-dark)' : 'var(--slate-600)',
                                background: isActive ? 'var(--primary-light)' : 'var(--page-bg)',
                                border: `1px solid ${isActive ? 'var(--primary-border)' : 'var(--border)'}`,
                                borderRadius: 6,
                                padding: '4px 10px',
                                cursor: 'pointer'
                              }}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Menampilkan {filteredSessions.length === 0 ? 0 : `${startIdx + 1}–${endIdx}`} dari {filteredSessions.length} sesi (teks asli pengajar)
                      </span>
                    </div>

                    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                        <thead style={{ background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', width: '15%', letterSpacing: 0.3 }}>TANGGAL</th>
                            <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', width: '24%', letterSpacing: 0.3 }}>MAPEL &amp; PENGAJAR</th>
                            <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', width: '13%', letterSpacing: 0.3 }}>KEHADIRAN</th>
                            <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: 12, fontWeight: 700, color: 'var(--slate-600)', width: '48%', letterSpacing: 0.3 }}>CATATAN ASLI PENGAJAR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedSessions.map((ses) => {
                            const attStyle = getAttBadgeStyle(ses.attendance);
                            return (
                              <tr key={ses.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                                <td style={{ padding: '9px 10px', color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                                  <div style={{ fontWeight: 600 }}>{ses.dateLabel}</div>
                                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ses.timeLabel}</div>
                                </td>
                                <td style={{ padding: '9px 10px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--ink-strong)' }}>{ses.subject}</div>
                                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ses.teacher}</div>
                                </td>
                                <td style={{ padding: '9px 10px' }}>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: attStyle.color,
                                      background: attStyle.bg,
                                      border: `1px solid ${attStyle.border}`,
                                      borderRadius: 4,
                                      padding: '2px 7px'
                                    }}
                                  >
                                    {ses.attendance}
                                  </span>
                                  {ses.attendanceNote && (
                                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                                      {ses.attendanceNote}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '9px 10px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                                  {ses.noteText ? (
                                    ses.noteText
                                  ) : (
                                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                      Belum ada catatan pengajar untuk sesi ini.
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar (per 6 records) */}
                    {filteredSessions.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 12,
                          padding: '10px 12px',
                          background: 'var(--page-bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          flexWrap: 'wrap',
                          gap: 8
                        }}
                      >
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                          Halaman <strong>{safePage}</strong> dari <strong>{totalPages}</strong> (6 sesi per halaman)
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            disabled={safePage <= 1}
                            onClick={() => setClassPage(safePage - 1)}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: '4px 9px',
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              background: safePage <= 1 ? 'var(--page-bg)' : '#ffffff',
                              color: safePage <= 1 ? '#94a3b8' : 'var(--ink-soft)',
                              cursor: safePage <= 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            ‹ Sebelumnya
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                            const isCurr = pageNum === safePage;
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setClassPage(pageNum)}
                                style={{
                                  fontSize: 12,
                                  fontWeight: isCurr ? 700 : 600,
                                  minWidth: 28,
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  border: `1px solid ${isCurr ? 'var(--primary-border)' : 'var(--border)'}`,
                                  background: isCurr ? 'var(--primary-light)' : '#ffffff',
                                  color: isCurr ? 'var(--tosca-dark)' : 'var(--ink-soft)',
                                  cursor: 'pointer'
                                }}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            disabled={safePage >= totalPages}
                            onClick={() => setClassPage(safePage + 1)}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              padding: '4px 9px',
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              background: safePage >= totalPages ? 'var(--page-bg)' : '#ffffff',
                              color: safePage >= totalPages ? '#94a3b8' : 'var(--ink-soft)',
                              cursor: safePage >= totalPages ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Berikutnya ›
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Live Consultation Prompt: Tahap 4 (Aktivitas Kelas & Catatan Pengajar) */}
          <div className="sa-prompt-card" id="sec_tahap4_guide" style={{ background: '#f2f8f7', border: '1px solid var(--primary-border)', borderLeft: '4px solid #58aebd', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--tosca-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <GraduationCap size={16} />
                Panduan Kakak Asuh: Mengonfirmasi Konteks Belajar di Kelas TMB
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tosca-dark)', background: 'var(--primary-light)', padding: '2px 10px', borderRadius: 9999 }}>
                Target Hasil: Pola kelas &amp; kendala kehadiran terkonfirmasi sebelum rencana aksi
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 PANDUAN KAKAK ASUH:
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {stageClassroomOut.saTasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: 'var(--green-ink)', marginBottom: 4 }}>🧭 RAMBU KOMUNIKASI:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: 'var(--ink-soft)' }}>
                    <li><strong>Pisahkan sesi dari sifat permanen:</strong> Sampaikan catatan per mapel/tanggal sebagai konteks belajar saat itu, bukan label kepribadian siswa.</li>
                    <li><strong>Hubungkan dengan kebutuhan Klinik PR:</strong> Gunakan sesi yang mencatat siswa butuh bantuan untuk memprioritaskan topik tatap muka cabang.</li>
                  </ul>
                </div>

                <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b45309', marginBottom: 4 }}>📏 BATAS BACA DATA KELAS:</div>
                  <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
                    {stageClassroomOut.guardrailNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAHAP 5: RENCANA AKSI MENUJU TO 5 & CATATAN KAKAK ASUH     */}
        {/* ========================================================= */}
        <section id="tahap5" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--green-ink)', background: '#ecfdf3', padding: '3px 10px', borderRadius: 9999 }}>
                Tahap 5
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                📝 Rencana Aksi Menuju TO 5 &amp; Catatan Kakak Asuh
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tindak Lanjut &amp; Pengingat Pertemuan Berikutnya</span>
          </div>


          {/* Action Plans Cards */}
          <div className="section-block" id="sec_tahap5_plans">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>1. Kerangka Tindak Lanjut Menuju TO 5</h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Disepakati Bersama Siswa &amp; Orang Tua Selama Sesi Konsultasi</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {stage4Out.actionPlans.map((plan) => (
                <div
                  key={plan.num}
                  style={{
                    background: 'var(--page-bg)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${plan.accentColor}`,
                    borderRadius: 8,
                    padding: '14px 16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      background: plan.accentColor,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {plan.num}
                    </span>
                    <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{plan.title}</strong>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{plan.desc}</p>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>PIC: {plan.pic}</div>
                </div>
              ))}
            </div>
          </div>


          {/* Riwayat Catatan Kakak Asuh Sebelumnya */}
          {renderSaHistoryBlock(
            'sec_tahap5_sa_history',
            '2. Riwayat Catatan Kakak Asuh Sebelumnya (Student Tower)',
            'Menjadi acuan kesinambungan sebelum menuliskan catatan sesi hari ini'
          )}

          {/* Catatan Khusus Kakak Asuh (Statement & Wet Signatures Live in PDF Page 2) */}
          <div className="section-block" id="sec_tahap5_agreement">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>3. Catatan Khusus Kakak Asuh (Sesi Ini)</h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Pengingat sesi berikutnya · Lembar pernyataan &amp; tanda tangan 3 pihak tersedia di Halaman 2 PDF
              </span>
            </div>

            <div style={{ background: 'var(--page-bg)', border: `1px solid ${lockErrorMsg ? '#f04438' : 'var(--border)'}`, borderRadius: 8, padding: 16 }}>
              {lockErrorMsg && (
                <div
                  role="alert"
                  style={{
                    background: '#fef3f2',
                    border: '1px solid #fecdca',
                    color: 'var(--red-ink)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 10
                  }}
                >
                  ⚠ {lockErrorMsg}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>
                    Ringkasan Kesepakatan &amp; Tindak Lanjut <span style={{ color: 'var(--red-ink)' }}>*Wajib diisi sebelum Kunci</span>:
                  </label>
                  {!isLocked && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (saNotes.trim() && !window.confirm('Catatan Kakak Asuh yang sudah ditulis akan diganti dengan template. Lanjutkan?')) return;
                          const val = '1) Pilihan & Konteks Keluarga: [isi kesepakatan prodi/lokasi]\n2) Komitmen Aksi: Drill soal harian [.. soal/hari] + Klinik PR cabang [hari & jam]\n3) Cek Ulang Sesi Berikutnya: [progres subtes fokus & akurasi TO 5]';
                          setSaNotes(val);
                          setLockErrorMsg(null);
                          safeSetItem(saNotesStorageKey, val);
                        }}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--tosca-dark)',
                          background: 'var(--primary-light)',
                          border: '1px solid var(--primary-border)',
                          borderRadius: 9999,
                          padding: '2px 9px',
                          cursor: 'pointer'
                        }}
                      >
                        + Pakai Template Terstruktur
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const val = saNotes.includes('[Cek Ulang Sesi Berikutnya]')
                            ? saNotes
                            : `${saNotes.trim() ? `${saNotes.trim()}\n` : ''}• [Cek Ulang Sesi Berikutnya]: `;
                          setSaNotes(val);
                          setLockErrorMsg(null);
                          safeSetItem(saNotesStorageKey, val);
                        }}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--green-ink)',
                          background: '#ecfdf3',
                          border: '1px solid #a6f4c5',
                          borderRadius: 9999,
                          padding: '2px 9px',
                          cursor: 'pointer'
                        }}
                      >
                        + Tambah Pengingat Sesi Berikutnya
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  ref={saNotesTextareaRef}
                  rows={4}
                  disabled={isLocked}
                  value={saNotes}
                  placeholder="Tulis hasil kesepakatan prodi/lokasi, jadwal drill soal atau Klinik PR yang disepakati, dan pengingat untuk evaluasi TO berikutnya..."
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setSaNotes(nextVal);
                    if (nextVal.trim()) setLockErrorMsg(null);
                    safeSetItem(saNotesStorageKey, nextVal);
                  }}
                  style={{
                    width: '100%',
                    border: `1px solid ${lockErrorMsg ? '#f04438' : 'var(--border)'}`,
                    borderRadius: 6,
                    padding: '10px 12px',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    color: '#1e293b',
                    backgroundColor: isLocked ? '#f1f5f9' : '#ffffff'
                  }}
                />
              </div>
            </div>

          </div>

          {/* Live Consultation Prompt: Tahap 5 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap5_guide" style={{ background: 'var(--page-bg)', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--green-ink)', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--green-ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} />
                Panduan Kakak Asuh: Mengunci Komitmen Nyata &amp; Penyerahan Laporan
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-ink)', background: '#ecfdf3', padding: '2px 10px', borderRadius: 9999 }}>
                Target Hasil: Jadwal cabang disepakati, catatan tersimpan &amp; PDF diserahkan
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Panduan Kakak Asuh */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green-ink)', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 PANDUAN KAKAK ASUH:
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {stage4Out.saTasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>

              {/* Kolom Kanan: Checklist Penutupan Kakak Asuh */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: 'var(--green-ink)', marginBottom: 4 }}>📋 CHECKLIST PENUTUPAN KAKAK ASUH:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: 'var(--ink-soft)' }}>
                    {stage4Out.checklist.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#ecfdf3', padding: '10px 12px', borderRadius: 6, border: '1px solid #a6f4c5', fontSize: 12, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: 'var(--green-ink)', marginBottom: 4 }}>🔄 KESINAMBUNGAN SESI BERIKUTNYA:</div>
                  <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
                    Catatan di formulir atas berfungsi sebagai <strong>pengingat untuk pertemuan selanjutnya</strong> agar evaluasi progres di TO 5 tidak mengulang pembicaraan dari awal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <V2PdfModal
        isOpen={isPdfOpen}
        onClose={closePdf}
        student={activeStudent}
        programs={targetPrograms}
        ruleConfig={ruleConfig}
      />
    </div>
  );
};
