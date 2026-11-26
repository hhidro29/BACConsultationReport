import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Info, Building2, Wrench, ShieldCheck, BookOpen, Compass, FileText, GitBranch, ChevronDown, GraduationCap } from 'lucide-react';
import { V2PdfModal } from '../components/V2PdfModal';
import { RichText } from '../components/RichText';
import {
  CHECKPOINT1_STUDENTS,
  LATEST_TO_EPISODE,
  ProgramChoice
} from '../data/garudaData';
import { STUDENT_CLASSROOM_DATA, STUDENT_SA_HISTORY_NOTES } from '../data/classroomData';
import {
  validateSnbtChoices,
  derivePrioritySubtestsForChoice1,
  deriveSubtestGoals,
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
  analyzeNotesGuidance,
  analyzeGuideCards,
  analyzeStageClassroom,
  computeProgramPacing,
  classifySubtestPattern
} from '../utils/saGuidelineEngine';
import { safeGetItem, safeSetItem, loadCustomPrograms } from '../utils/safeStorage';
import { buildDrillTableRows } from '../utils/drillTable';
import { STUDENT_DRILL_DATA } from '../data/drillData';
import { sampleLowestTopics } from '../data/topicSampleData';
import { rankFor } from '../utils/positionSimulation';
import { fmtTo, medianOfPresent, MIN_TO_FOR_MEDIAN, subtestScores } from '../utils/toHistory';
import { trendSequenceLabel } from '../utils/trendLabel';
import { ACTION_PLAN_COPY, drillTargetForRank, drillTotalForCount, achievedNextTarget, gapTierOf, gapTierTitle, type GapTier, type PriorityGoal } from '../utils/actionPlanCopy';
import { buildProdiToneMap } from '../utils/prodiColors';
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

  // Label jurusan per subtes: subtes ini prioritas untuk jurusan apa (sama dengan PDF).
  const prodiTone = buildProdiToneMap(targetPrograms.map((p) => p.prodi));
  const priorityProdisById = new Map<string, string[]>();
  targetPrograms.forEach((prog) => {
    derivePrioritySubtestsForChoice1(activeStudent, prog, ruleConfig.thresholds.foundationScoreTarget).forEach((p) => {
      const list = priorityProdisById.get(p.id) ?? [];
      const name = prog.prodi.replace(/^(S1|D4|D3)\s+/, '');
      if (!list.includes(name)) list.push(name);
      priorityProdisById.set(p.id, list);
    });
  });

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
  // Nomor episode TO terbaru (tetap 4 walau siswa belum mengikuti semua TO); jumlah TO siswa = toScoresList.length.
  const latestToEpisode = LATEST_TO_EPISODE;
  const latestToScore = toScoresList.length ? toScoresList[toScoresList.length - 1] : 0;
  const totalSubtestsCount = subtestsV2Data.length;
  const sortedSubtests = [...subtestsV2Data].sort((a, b) => a.gap - b.gap || a.to4 - b.to4);
  // Target berikutnya per subtes untuk kartu "Sudah mencapai 600" (sama dengan PDF).
  const priorityGoalById = deriveSubtestGoals(targetPrograms, sortedSubtests, ruleConfig.thresholds.foundationScoreTarget);
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
  const renderTrend = (curr: number | null, prev: number | null) => {
    if (curr === null || prev === null) return null;
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

  // Status Subtes (sama dengan PDF): standar 600 seperti KKM. Hijau (>= 600), Merah (di bawah 600).
  const getSubtestStatus = (gap: number) => {
    if (gap >= 0) return { label: 'Tercapai', badgeClass: 'badge badge-success', color: '#12b76a', textColor: 'var(--green-ink)' };
    return { label: 'Perlu perbaikan', badgeClass: 'badge badge-danger', color: '#d92d20', textColor: 'var(--red-ink)' };
  };

  // Dynamic Ringkasan 8 Subtes (Median 8 subtes saja)
  const medTO1 = medianOfPresent(subtestsV2Data.map((s) => s.to1));
  const medTO2 = medianOfPresent(subtestsV2Data.map((s) => s.to2));
  const medTO3 = medianOfPresent(subtestsV2Data.map((s) => s.to3));
  const medTO4 = computeMedian(subtestsV2Data.map((s) => s.to4));
  const medSeries = [medTO1, medTO2, medTO3, medTO4].filter((n): n is number => typeof n === 'number');
  const medOverall = toScoresList.length >= MIN_TO_FOR_MEDIAN ? computeMedian(medSeries) : null;
  const medGap = medTO4 - 600;
  const medFillPct = Math.max(0, Math.min(100, ((medTO4 - 400) / 300) * 100));
  const medStatus = getSubtestStatus(medGap);

  // Subtest with largest fluctuation for dynamic educational callout
  const maxFluctSub = [...subtestsV2Data].sort((a, b) => {
    const rangeB = Math.max(...subtestScores(b)) - Math.min(...subtestScores(b));
    const rangeA = Math.max(...subtestScores(a)) - Math.min(...subtestScores(a));
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
    if (toLatestNum >= 600) {
      // Sudah di atas 600 tetapi belum mencapai target acuan.
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
      status: 'Perlu perbaikan',
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
        scores: subtestScores(s),
        toLatest: s.to4
      })),
      attendanceRatePct: attendanceNumeric,
      studentFirstName: activeStudent.identity.name.split(' ')[0]
    },
    ruleConfig
  );

  const stage2Out = analyzeStage2(
    {
      programs: targetPrograms,
      familyAlignment: activeStudent.familyAlignment,
      studentHomeCity: activeStudent.identity.branch.split('-')[0].trim(),
      studentFirstName: activeStudent.identity.name.split(' ')[0]
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
  const stage3OverallOut = analyzeStage3Overall(stage3SubtestInputs, ruleConfig, {
    studentFirstName: activeStudent.identity.name.split(' ')[0],
    weakCount: sortedSubtests.filter((x) => x.to4 < ruleConfig.thresholds.foundationScoreTarget).length
  });
  const stageClassroomOut = analyzeStageClassroom(
    {
      totalSessions: classroomData.totalSessions,
      presentSessions: classroomData.presentSessions,
      lateSessions: classroomData.lateSessions,
      sickSessions: classroomData.sickSessions,
      excusedSessions: classroomData.excusedSessions,
      notesCount: classroomData.notesCount,
      studentFirstName: activeStudent.identity.name.split(' ')[0]
    },
    ruleConfig
  );
  const hasConflictOrLocationCheck =
    activeStudent.familyAlignment === 'different_major' ||
    activeStudent.familyAlignment === 'location_limit' ||
    stage2Out.isConflict;
  const hasMissingDrill = prioritySubtestsV2.some(
    (s) => s.rgQuestionsDone <= ruleConfig.thresholds.drillMismatchLowQ
  );
  const stage4Out = analyzeStage4(
    {
      hasConflictOrLocationCheck,
      hasMissingDrill,
      planData: {
        subtests: subtestsV2Data.map((x) => ({ name: x.name, to4: x.to4, gap: x.gap })),
        branch: activeStudent.identity.branch,
        avgScore: toScoresList[toScoresList.length - 1] ?? 0,
        episode: latestToEpisode,
        needsPlanB: targetPrograms.length > 0 && targetPrograms.every((p) => p.gap < 0),
        programTargetList: targetPrograms.map((p) => {
          const pacing = computeProgramPacing(p.weightedScore, p.targetScore, p.gap, ruleConfig);
          return { name: `${p.prodi}, ${p.univ.replace(/\s*\([^)]*\)/g, '').trim()}`, target: pacing.isAchieved ? 'Terlewati' : `≥ ${pacing.nextToTargetScore}` };
        })
      },
      studentName: activeStudent.identity.name,
      studentFirstName: activeStudent.identity.name.split(' ')[0],
      saName: activeStudent.identity.saName,
      parentName: activeStudent.identity.parentName,
      nextEpisode: latestToEpisode + 1
    },
    ruleConfig
  );

  const guideCards = analyzeGuideCards(
    {
      foundationTarget: ruleConfig.thresholds.foundationScoreTarget,
      medianSubtest: maxFluctSub.name,
      medianHistory: subtestScores(maxFluctSub).join('→'),
      median: maxFluctSub.median,
      prodi: targetPrograms[0]?.prodi || 'Prodi Utama',
      studentFirstName: activeStudent.identity.name.split(' ')[0],
      nextEpisode: latestToEpisode + 1
    },
    ruleConfig
  );

  // Bantuan pengisian Catatan Kakak Asuh (arahan di bawah kotak dan pengingat saat Kunci) dimatikan sementara
  // atas permintaan tim. Mesin dan template-nya tetap ada; ubah ke true untuk menyalakan lagi.
  const SHOW_NOTES_GUIDANCE = false;
  const notesGuidance = analyzeNotesGuidance(
    {
      hasConflictOrLocationCheck,
      minDrillSubtests: prioritySubtestsV2
        .filter((s) => s.rgQuestionsDone <= ruleConfig.thresholds.drillMismatchLowQ)
        .map((s) => s.name),
      attendancePct: attendanceNumeric,
      allAchieved: prioritySubtestsV2.length > 0 && prioritySubtestsV2.every((s) => s.gapNum >= 0),
      studentName: activeStudent.identity.name.split(' ')[0]
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
    // Pengingat lunak: catatan sangat singkat. SA tetap bisa melanjutkan mengunci.
    if (SHOW_NOTES_GUIDANCE && !isLocked && saNotes.trim().length < ruleConfig.thresholds.notesShortChars && !window.confirm(notesGuidance.lockNudge)) {
      saNotesTextareaRef.current?.focus();
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
              title="Download PDF Laporan Resmi 4 Halaman"
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
              🏛️ 1. Analisis Jurusan
            </button>
            <button type="button" onClick={(e) => scrollTo(e, '#tahap2')} className={`jump-pill ${activeStage === 'tahap2' ? 'active' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }}>
              🎯 2. Evaluasi Tryout
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
        <section id="tahap1" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '3px 10px', borderRadius: 9999 }}>
                Tahap 1
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                🏛️ Skor IRT Terbobot &amp; Evaluasi Peluang Jurusan PTN
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Formula Pembobotan Resmi CMS Ruangguru</span>
          </div>


          {/* Table Program Choices */}
          <div className="section-block" id="sec_tahap1_table">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="section-title" style={{ fontSize: 15, margin: 0 }}>
                  Evaluasi Skor TO UTBK Regular Episode {latestToEpisode} terhadap Pilihan Jurusan (menggunakan sistem skoring IRT Pembobotan)
                </h3>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Sumber: data SNPMB 2026</span>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {targetPrograms.map((prog) => {
                const catalogMatch = matchCatalogProgram(prog);
                const pacing = computeProgramPacing(prog.weightedScore, prog.targetScore, prog.gap, ruleConfig);
                const participants = catalogMatch?.participantsCount ?? 0;
                const quota = catalogMatch?.quota2026 ?? 0;
                const rank = participants > 0 ? rankFor(activeStudent.id, catalogMatch?.id, prog.weightedScore, prog.targetScore, participants) : 0;
                const fill = Math.max(0, Math.min(100, Math.round((prog.weightedScore / Math.max(1, prog.targetScore)) * 100)));
                const gapColor = prog.gap >= 0 ? '#027a48' : '#b42318';
                const gapBg = prog.gap >= 0 ? '#ecfdf3' : '#fef3f2';
                const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
                const cap: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: '#245f5a' };
                return (
                  <div key={`${prog.priority}_${prog.prodi}_${prog.univ}`} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: prodiTone(prog.prodi.replace(/^(S1|D4|D3)\s+/, '')).text, color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                          {prog.priority.replace(/\D+/g, '') || prog.priority}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-strong)', lineHeight: 1.25 }}>{prog.prodi}</div>
                          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.3 }}>{prog.univ}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
                        {catalogMatch ? <>Daya tampung <strong style={{ color: 'var(--ink-strong)' }}>{quota}</strong> · Peminat <strong style={{ color: 'var(--ink-strong)' }}>{catalogMatch.applicants2025.toLocaleString('id-ID')}</strong> · </> : ''}Keketatan <strong style={{ color: 'var(--ink-strong)' }}>{prog.tightness}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.75fr) minmax(0, 1fr)', gap: 16, marginTop: 10, alignItems: 'stretch' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={cap}>Nilai TO {latestToEpisode} (IRT) vs target</span>
                          <span style={{ fontFamily: mono, fontSize: 12.5, fontWeight: 800, color: gapColor, background: gapBg, borderRadius: 4, padding: '2px 9px' }}>
                            Selisih {prog.gap > 0 ? `+${prog.gap}` : prog.gap}
                          </span>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <strong style={{ fontSize: 24, color: 'var(--tosca-dark)', lineHeight: 1.1 }}>{prog.weightedScore}</strong>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}> dari target jurusan <strong style={{ color: 'var(--ink-strong)' }}>{prog.targetScore}</strong></span>
                        </div>
                        <div style={{ height: 6, borderRadius: 6, background: '#e8edf2', overflow: 'hidden', marginTop: 6 }}>
                          <div style={{ width: `${fill}%`, height: '100%', background: '#245f5a', borderRadius: 6 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
                          <span>Peringkat TO {latestToEpisode} (prodi &amp; kampus sama)</span>
                          {participants > 0 ? (
                            <span>
                              <strong style={{ color: rank > quota ? '#b42318' : '#027a48' }}>{rank}</strong> dari {participants}
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      </div>
                      <div style={{ background: '#e6f4f2', borderRadius: 6, padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={cap}>Target berikutnya</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, paddingBottom: 6, borderBottom: '1px solid #c4dfdb' }}>
                          <span style={{ fontSize: 13, color: '#334155' }}>Target Nilai TO {latestToEpisode + 1}</span>
                          <strong style={{ fontSize: 20, color: 'var(--tosca-dark)' }}>{pacing.isAchieved ? 'Terlewati' : `≥ ${pacing.nextToTargetScore}`}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                          <span style={{ fontSize: 13, color: '#334155' }}>Kenaikan per TO</span>
                          <strong style={{ fontFamily: mono, fontSize: 13, color: 'var(--ink-strong)' }}>{pacing.isAchieved ? '—' : `+${pacing.gainPerToNextConsult} poin/TO`}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.45 }}>Peringkat TO: data simulasi prototipe (peserta dan daya tampung dari data prototipe, belum diverifikasi).</div>

            {(() => {
              const pacings = targetPrograms.map((p) => ({ p, pacing: computeProgramPacing(p.weightedScore, p.targetScore, p.gap, ruleConfig) }));
              const highestNext = pacings.filter((x) => !x.pacing.isAchieved).sort((x, y) => y.pacing.nextToTargetScore - x.pacing.nextToTargetScore)[0];
              const shortUniv = (u: string) => u.match(/\(([^)]+)\)/)?.[1] ?? u;
              const words = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam'];
              const eps = Math.max(1, ruleConfig.thresholds.remainingEpisodesToNextConsult || 3);
              const achieved = pacings.filter((x) => x.pacing.isAchieved).length;
              return (
                <div style={{ marginTop: 12, fontSize: 13, color: '#1e293b', lineHeight: 1.55 }}>
                  <div style={{ background: '#f2f8f7', borderLeft: '3px solid #58aebd', borderRadius: 6, padding: '8px 12px' }}>
                    <strong style={{ color: 'var(--tosca-dark)' }}>Kesimpulan.</strong>{' '}
                    {achieved === 0
                      ? `Belum ada satu pun dari ${words[targetPrograms.length] ?? targetPrograms.length} pilihan jurusan yang nilainya mencapai target, sehingga perlu mulai mencari rencana cadangan (Plan B).`
                      : `${achieved} dari ${targetPrograms.length} pilihan jurusan nilainya sudah mencapai target.`}
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', marginTop: 8 }}>
                    <strong style={{ color: 'var(--tosca-dark)' }}>Catatan.</strong> Nilai dan peringkat siswa sama-sama penting untuk dicapai.
                  </div>
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

          {/* Live Consultation Prompt: Tahap 1 (Analisis Jurusan, Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap1_guide" style={{ background: '#f2f8f7', border: '1px solid var(--primary-border)', borderLeft: '4px solid #58aebd', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--tosca-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} />
                Panduan Kakak Asuh: {guideCards.t2.title}
              </span>
              <div style={{ fontSize: 13, color: 'var(--ink-strong)', marginTop: 4 }}>
                <strong>{guideCards.t2.goal}</strong>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 6, letterSpacing: 0.3 }}>YANG BISA DIBAHAS</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                {stage2Out.saTasks.slice(0, 3).map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </div>

            {stage2Out.isWideGap && guideCards.t2.rambu.length > 0 && (
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10 }}>
                <strong style={{ color: 'var(--red-ink)' }}>Hindari:</strong> <RichText text={guideCards.t2.rambu[0]} />
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAHAP 2: FONDASI 600 & EVALUASI SKOR IRT REGULER          */}
        {/* ========================================================= */}
        <section id="tahap2" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '3px 10px', borderRadius: 9999 }}>
                Tahap 2
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-strong)', margin: 0 }}>
                Kemampuan dasar di 8 subtes
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Target Fondasi 600 Semester 1</span>
          </div>


          {/* Metrics Summary */}
          <div className="section-block" id="sec_tahap2_metrics">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>
                Breakdown per Subtes — Tryout Episode {latestToEpisode}
              </h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Acuan Skor TO UTBK Regular Episode {latestToEpisode}</span>
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
                  Skor TO UTBK Regular Episode {latestToEpisode}
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
          <div className="section-block" id="sec_tahap2_table">
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
                Diurutkan dari jarak terdalam • Semua subtes &lt; 600 perlu perbaikan
              </span>
            </div>
            {/* Tabel breakdown: bentuk sama dengan PDF halaman 2 supaya SA familiar */}
            {(() => {
              const toCountStudent = toScoresList.length;
              const fmtMed = (n: number) => String(Math.round(n)); // dibulatkan, sama dengan PDF
              const headSub: React.CSSProperties = { fontSize: 12, fontWeight: 500, marginTop: 2 };
              const thBase: React.CSSProperties = { textAlign: 'center', background: '#2d7684', color: '#ffffff', textTransform: 'none', letterSpacing: 0 };
              const dash = (v: number | null): React.CSSProperties => (v === null ? { color: '#94a3b8' } : {});
              return (
                <div className="table-container">
                  <table className="data-table" style={{ minWidth: 760 }}>
                    <thead>
                      <tr>
                        <th style={{ ...thBase, width: '4%' }}>#</th>
                        <th style={{ ...thBase, width: '41%', textAlign: 'left' }}>
                          Subtes UTBK
                          <div style={headSub}>{toCountStudent === 1 ? 'dan hasil TO terbaru' : `dan tren ${toCountStudent} TO terakhir`}</div>
                        </th>
                        <th style={{ ...thBase, width: '9%' }}>TO 1<div style={headSub}>30 Agu</div></th>
                        <th style={{ ...thBase, width: '9%' }}>TO 2<div style={headSub}>14 Sep</div></th>
                        <th style={{ ...thBase, width: '9%' }}>TO 3<div style={headSub}>28 Sep</div></th>
                        <th style={{ ...thBase, width: '19%' }}>TO {latestToEpisode} · 30 Okt<div style={headSub}>garis hitam = {ruleConfig.thresholds.foundationScoreTarget}</div></th>
                        <th style={{ ...thBase, width: '9%' }}>Median<div style={headSub}>{toCountStudent} TO</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSubtests.map((sub, idx) => {
                        const rowStatus = getSubtestStatus(sub.gap);
                        const hist = subtestScores(sub);
                        return (
                          <tr key={sub.id}>
                            <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--tosca-dark)' }}>{sub.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{hist.length >= 2 ? trendSequenceLabel(hist) : 'Belum ada tren (baru 1 TO)'}</div>
                              {(priorityProdisById.get(sub.id) ?? []).length > 0 && (
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                                  {(priorityProdisById.get(sub.id) ?? []).map((n) => {
                                    const tn = prodiTone(n);
                                    return (
                                      <span key={n} style={{ fontSize: 12, fontWeight: 700, color: tn.text, background: tn.bg, border: `1px solid ${tn.border}`, padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>{n}</span>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', ...dash(sub.to1) }}>{fmtTo(sub.to1)}</td>
                            <td style={{ textAlign: 'center', ...dash(sub.to2) }}>{fmtTo(sub.to2)}{renderTrend(sub.to2, sub.to1)}</td>
                            <td style={{ textAlign: 'center', ...dash(sub.to3) }}>{fmtTo(sub.to3)}{renderTrend(sub.to3, sub.to2)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ fontWeight: 800, color: rowStatus.textColor }}>{sub.to4}{renderTrend(sub.to4, sub.to3)}</div>
                              <div className="v2-progress-track" style={{ maxWidth: 120, margin: '4px auto 0' }}>
                                <div className="v2-progress-fill" style={{ width: `${sub.fillPct}%`, background: rowStatus.color }} />
                                <div className="v2-progress-target-line" title="Target 600" />
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700, ...(hist.length < MIN_TO_FOR_MEDIAN ? { color: '#94a3b8' } : {}) }}>
                              {hist.length >= MIN_TO_FOR_MEDIAN ? fmtMed(Number(String(sub.median).replace(',', '.'))) : '–'}
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: '#e6f4f2' }}>
                        <td />
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--tosca-dark)' }}>Median 8 subtes</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{medSeries.length >= 2 ? trendSequenceLabel(medSeries) : 'Belum ada tren (baru 1 TO)'}</div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600, ...dash(medTO1) }}>{medTO1 === null ? '–' : fmtMed(medTO1)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, ...dash(medTO2) }}>{medTO2 === null ? '–' : fmtMed(medTO2)}{renderTrend(medTO2, medTO1)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, ...dash(medTO3) }}>{medTO3 === null ? '–' : fmtMed(medTO3)}{renderTrend(medTO3, medTO2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, color: medStatus.textColor }}>{fmtMed(medTO4)}{renderTrend(medTO4, medTO3)}</div>
                          <div className="v2-progress-track" style={{ maxWidth: 120, margin: '4px auto 0', background: '#ffffff' }}>
                            <div className="v2-progress-fill" style={{ width: `${medFillPct.toFixed(1)}%`, background: medStatus.color }} />
                            <div className="v2-progress-target-line" title="Target 600" />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--tosca-dark)', ...(medOverall === null ? { color: '#94a3b8' } : {}) }}>{medOverall === null ? '–' : fmtMed(medOverall)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Legend (sama dengan PDF): merah = di bawah 600, hijau = tercapai */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 10, fontSize: 12, color: 'var(--slate-600)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#d92d20', display: 'inline-block', borderRadius: 2 }}></span> Perlu perbaikan (&lt; 600)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#12b76a', display: 'inline-block', borderRadius: 2 }}></span> Tercapai (≥ 600)
              </span>
              {priorityProdisById.size > 0 && (
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Label berwarna di samping nama subtes = subtes prioritas untuk jurusan dengan warna yang sama</span>
              )}
            </div>

            {(() => {
              const foundation = ruleConfig.thresholds.foundationScoreTarget;
              const shortName = (n: string) => n.match(/\(([^)]+)\)\s*$/)?.[1] ?? n;
              const above = sortedSubtests.filter((x) => x.to4 >= foundation);
              const below = sortedSubtests.filter((x) => x.to4 < foundation);
              const total = sortedSubtests.length;
              const joinNames = (names: string[]) =>
                names.length <= 1
      ? names.join('')
      : names.length === 2
        ? `${names[0]} dan ${names[1]}`
        : `${names.slice(0, -1).join(', ')}, dan ${names[names.length - 1]}`;
              return (
                <div style={{ marginTop: 12, fontSize: 13, color: '#1e293b', lineHeight: 1.55 }}>
                  <div style={{ color: '#713f12', marginBottom: 8 }}>
                    <strong>Kenapa semua subtes ditargetkan mencapai {foundation}?</strong> Tujuannya agar tidak ada nilai subtes yang terlalu rendah dibandingkan yang lain. Sebab, satu nilai subtes yang rendah bisa memengaruhi nilai akhir, apa pun jurusan yang dipilih. Saat ini, {below.length} dari {total} subtes nilainya masih di bawah {foundation}.
                  </div>
                  <div style={{ background: '#f2f8f7', borderLeft: '3px solid #58aebd', borderRadius: 6, padding: '8px 12px' }}>
                    <strong style={{ color: 'var(--tosca-dark)' }}>Kesimpulan.</strong>{' '}
                    {below.length === 0
                      ? `Semua ${total} subtes sudah mencapai ${foundation}. Fokus utama saat ini adalah menjaga semuanya agar tidak kembali menurun.`
                      : `Fokus utama saat ini adalah memperbaiki ${joinNames(
                          (below.filter((x) => gapTierOf(x.to4, foundation) === 1).length > 0
                            ? below.filter((x) => gapTierOf(x.to4, foundation) === 1)
                            : below.slice(0, 2)
                          ).slice(0, 3).map((x) => shortName(x.name))
                        )}, sambil menjaga subtes lain agar tidak kembali menurun.`}
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Live Consultation Prompt: Tahap 2 (Evaluasi Tryout, Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap2_guide" style={{ background: '#f2f8f7', border: '1px solid var(--primary-border)', borderLeft: '4px solid #58aebd', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--tosca-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={16} />
                Panduan Kakak Asuh: {guideCards.t1.title}
              </span>
              <div style={{ fontSize: 13, color: 'var(--ink-strong)', marginTop: 4 }}>
                <strong>{guideCards.t1.goal}</strong>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 6, letterSpacing: 0.3 }}>YANG BISA DIBAHAS</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                {/* Maks 3 poin: temuan utama, satu catatan prioritas (kalau ada, kalau tidak: dengarkan siswa), lalu kesepakatan */}
                {[stage1Out.observation, stage1Out.extraNotes[0] ?? stage1Out.studentTask, stage1Out.nextStep].map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>

            {stage1Out.isDecline && guideCards.t1.rambu.length > 0 && (
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10 }}>
                <strong style={{ color: 'var(--red-ink)' }}>Hindari:</strong> <RichText text={guideCards.t1.rambu[0]} />
              </div>
            )}
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
                🛠️ Action Plan: Target Drill Soal &amp; Aktivitas Drill
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Periode data drill soal: 3 bulan terakhir (Student Tower)</span>
          </div>

          {/* Disclaimer ulang mengapa target semester 1 adalah 600 */}
          <div style={{ background: '#fffaeb', border: '1px solid #fedf89', borderLeft: '4px solid #f79009', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--amber-ink)', lineHeight: 1.5, marginBottom: 16 }}>
            💡 <RichText text={guideCards.t3.base600Note} />
          </div>

          {/* Action Plan semua subtes menurut besar selisih (selaras dengan PDF halaman 3) */}
          {(() => {
            const foundation = ruleConfig.thresholds.foundationScoreTarget;
            const weak = sortedSubtests.filter((x) => x.to4 < foundation);
            const drillTotalWeekly = drillTotalForCount(weak.length, ruleConfig.thresholds);
            const drillTargetOf = (id: string) => drillTargetForRank(weak.findIndex((w) => w.id === id), ruleConfig.thresholds);
            const rows = sortedSubtests.map((x) => {
              const pri = prioritySubtestsV2.find((p) => p.id === x.id);
              const stat = pri
                ? { questions: pri.rgQuestionsDone, sessions: pri.drillSessions, accuracy: pri.drillAccuracyPct }
                : (() => {
                    const d = STUDENT_DRILL_DATA[activeStudent.id]?.[x.id];
                    return d ? { questions: d.questions, sessions: d.sessions, accuracy: d.accuracyPct } : null;
                  })();
              const topics = (pri?.lowestTopics.slice(0, 2) ?? sampleLowestTopics(activeStudent.id, x.id)).map((t) =>
                t.replace(/\s*\(\d+% benar\)/, '')
              );
              const tier = gapTierOf(x.to4, foundation);
              const rule = analyzeStage3Subtest(
                {
                  id: x.id,
                  name: x.name,
                  toLatest: x.to4,
                  gapTo600: x.to4 - foundation,
                  drillQuestions: stat?.questions ?? 0,
                  drillSessions: stat?.sessions ?? 0,
                  drillAccuracyPct: stat?.accuracy ?? 0
                },
                ruleConfig
              );
              return { x, stat, topics, tier, rule };
            });
            const order: GapTier[] = [1, 0];
            const rank = new Map<string, number>(
              order.flatMap((t) => rows.filter((r) => r.tier === t)).map((r, i) => [r.x.id, i + 1] as [string, number])
            );
            const tone = (t: GapTier) =>
              t === 1
                ? { dot: '#d92d20', ink: 'var(--red-ink)', pill: '#fef3f2' }
                : { dot: '#12b76a', ink: 'var(--green-ink)', pill: '#ecfdf3' };
            const cap: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 };
            return (
              <div className="section-block" id="sec_tahap3_cards">
                <div className="section-header">
                  <h3 className="section-title" style={{ fontSize: 15 }}>1. Target Drill &amp; Kartu Subtes</h3>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Sama dengan Action Plan di PDF halaman 3 · riwayat drill 3 bulan terakhir</span>
                </div>
                {weak.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', background: 'var(--teal-soft, #e6f4f2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={cap}>Target drill mingguan</div>
                      Target per minggu: <strong>{ruleConfig.thresholds.drillRank1}, {ruleConfig.thresholds.drillRank2}, dan {ruleConfig.thresholds.drillRank3} soal benar</strong> untuk tiga subtes terendah, <strong>{ruleConfig.thresholds.minDrillPerSubtest}</strong> untuk subtes lainnya.
                    </div>
                    <div>
                      <div style={cap}>Total target</div>
                      <strong>{drillTotalWeekly} soal benar/minggu</strong>
                    </div>
                  </div>
                )}
                {(() => {
                  const weakRows = rows.filter((r) => r.tier === 1);
                  const achievedRows = rows.filter((r) => r.tier === 0);
                  const GRID = '32px minmax(0, 1.15fr) 190px minmax(0, 1.1fr) 104px';
                  const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
                  const histOf = (stat: { questions: number; accuracy: number } | null) =>
                    stat && stat.questions > 0 ? { text: `${stat.questions} soal · akurasi ${stat.accuracy}%`, none: false } : { text: 'Belum ada data', none: true };
                  const groupHead = (color: string, dot: string, title: string, sub: string) => (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '14px 0 8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 800, color }}>
                        <span style={{ width: 9, height: 9, borderRadius: 9, background: dot, display: 'inline-block' }} />
                        {title}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</span>
                    </div>
                  );
                  const badge = (id: string) => (
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#245f5a', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{rank.get(id)}</span>
                  );
                  const scoreCell = (to4: number, weak: boolean) => (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 19, fontWeight: 800, color: weak ? '#b42318' : '#245f5a', lineHeight: 1.1 }}>{to4}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>/ {foundation}</span>
                        <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 800, color: weak ? '#b42318' : '#245f5a', background: weak ? '#fef3f2' : '#ffffff', borderRadius: 4, padding: '1px 7px' }}>
                          {weak ? `-${foundation - to4}` : `+${to4 - foundation}`}
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 6, background: weak ? '#e8edf2' : '#ffffff', overflow: 'hidden', marginTop: 5 }}>
                        <div style={{ width: `${Math.min(100, Math.round((to4 / foundation) * 100))}%`, height: '100%', background: weak ? '#d92d20' : '#245f5a', borderRadius: 6 }} />
                      </div>
                    </div>
                  );
                  return (
                    <>
                      {weakRows.length > 0 && (
                        <>
                          {groupHead('var(--red-ink)', '#d92d20', `Belum mencapai ${foundation}`, `urut dari nilai terendah · ${weakRows.length} subtes`)}
                          <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflowX: 'auto' }}>
                            <div style={{ minWidth: 760 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: GRID, columnGap: 12, alignItems: 'center', background: '#2d7684', color: '#ffffff', fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: '8px 8px 0 0' }}>
                                <span /><span>Subtes</span><span>Nilai TO {latestToEpisode}</span><span>Fokus perbaikan materi</span><span style={{ textAlign: 'center' }}>Target drill</span>
                              </div>
                              {weakRows.map(({ x, stat, topics, rule }) => {
                                const h = histOf(stat);
                                return (
                                  <div key={x.id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: GRID, columnGap: 12, alignItems: 'center', padding: '10px 14px' }}>
                                      {badge(x.id)}
                                      <div>
                                        <div style={{ fontWeight: 800, color: 'var(--tosca-dark)', fontSize: 14, lineHeight: 1.25 }}>{x.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Riwayat drill 3 bulan terakhir</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: h.none ? '#b42318' : 'var(--ink-strong)' }}>{h.text}</div>
                                      </div>
                                      {scoreCell(x.to4, true)}
                                      <div style={{ fontSize: 13, lineHeight: 1.4 }}>{topics.join(' · ')}</div>
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 26, fontWeight: 800, color: '#245f5a', lineHeight: 1 }}>{drillTargetOf(x.id)}</div>
                                        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.25 }}>soal benar<br />per minggu</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                      {achievedRows.length > 0 && (
                        <>
                          {groupHead('var(--green-ink)', '#12b76a', `Sudah mencapai ≥ ${foundation}`, `${achievedRows.length} subtes`)}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {achievedRows.map(({ x, stat }) => {
                              const h = histOf(stat);
                              return (
                                <div key={x.id} style={{ display: 'grid', gridTemplateColumns: GRID, columnGap: 12, alignItems: 'center', background: '#e6f4f2', border: '1px solid #b9d9d5', borderRadius: 8, padding: '10px 14px', minWidth: 760 }}>
                                  {badge(x.id)}
                                  <div>
                                    <div style={{ fontWeight: 800, color: 'var(--tosca-dark)', fontSize: 14, lineHeight: 1.25 }}>{x.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Riwayat drill 3 bulan terakhir</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: h.none ? '#b42318' : 'var(--ink-strong)' }}>{h.text}</div>
                                  </div>
                                  {scoreCell(x.to4, false)}
                                  <div style={{ gridColumn: '4 / span 2', borderLeft: '1px solid #b9d9d5', paddingLeft: 14 }}>
                                    <div style={{ ...cap, color: 'var(--teal-ink, #245f5a)' }}>Target berikutnya</div>
                                    <strong style={{ fontSize: 14, color: 'var(--ink-strong)' }}>{achievedNextTarget(priorityGoalById.get(x.id), foundation)}</strong>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45, marginTop: 8 }}>{ACTION_PLAN_COPY.achievedNote}</div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            );
          })()}

          {/* Live Consultation Prompt: Tahap 3 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap3_guide" style={{ background: '#f2f8f7', border: '1px solid var(--primary-border)', borderLeft: '4px solid #58aebd', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--tosca-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={16} />
                Panduan Kakak Asuh: {guideCards.t3.title}
              </span>
              <div style={{ fontSize: 13, color: 'var(--ink-strong)', marginTop: 4 }}>
                <strong>{guideCards.t3.goal}</strong>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 6, letterSpacing: 0.3 }}>YANG BISA DIBAHAS</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                {stage3OverallOut.guidePoints.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>

            {stage3OverallOut.rambu && (
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10 }}>
                <strong style={{ color: 'var(--red-ink)' }}>Hindari:</strong> {stage3OverallOut.rambu}
              </div>
            )}
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
            <div style={{ marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--tosca-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <GraduationCap size={16} />
                Panduan Kakak Asuh: {guideCards.t4.title}
              </span>
              <div style={{ fontSize: 13, color: 'var(--ink-strong)', marginTop: 4 }}>
                <strong>{guideCards.t4.goal}</strong>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 6, letterSpacing: 0.3 }}>YANG BISA DIBAHAS</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                {stageClassroomOut.guidePoints.slice(0, 3).map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>

            {stageClassroomOut.hasLowNotes && guideCards.t4.rambu.length > 0 && (
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10 }}>
                <strong style={{ color: 'var(--red-ink)' }}>Hindari:</strong> <RichText text={guideCards.t4.rambu[0]} />
              </div>
            )}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stage4Out.actionPlans.map((plan) => (
                <div
                  key={plan.num}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr',
                    columnGap: 12,
                    alignItems: 'start',
                    background: 'var(--page-bg)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${plan.accentColor}`,
                    borderRadius: 8,
                    padding: '10px 14px'
                  }}
                >
                  <span style={{ background: plan.accentColor, color: '#fff', fontSize: 12, fontWeight: 700, width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {plan.num}
                  </span>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>{plan.title}{plan.bullets ? ': ' : '. '}</strong>
                      <RichText text={plan.desc} />
                    </div>
                    {plan.bullets && (
                      <ul style={{ margin: '3px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {plan.bullets.map((b) => (
                          <li key={b.label}><strong>{b.label}:</strong> {b.text}</li>
                        ))}
                      </ul>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>PIC: {plan.pic}</div>
                  </div>
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

          {/* Catatan Khusus Kakak Asuh: internal SA, tidak masuk PDF. Lembar kesepakatan & tanda tangan ada di PDF Halaman 3 */}
          <div className="section-block" id="sec_tahap5_agreement">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>3. Catatan Khusus Kakak Asuh (Sesi Ini)</h3>
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
                    Catatan Internal &amp; Pengingat Sesi Berikutnya <span style={{ color: 'var(--red-ink)' }}>*Wajib diisi sebelum Kunci</span>:
                  </label>
                </div>
                <textarea
                  ref={saNotesTextareaRef}
                  rows={4}
                  disabled={isLocked}
                  value={saNotes}
                  placeholder={notesGuidance.placeholder}
                  aria-describedby={!SHOW_NOTES_GUIDANCE || isLocked ? undefined : 'sa-notes-guidance'}
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
                {SHOW_NOTES_GUIDANCE && !isLocked && (
                  <div id="sa-notes-guidance" style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {notesGuidance.lines.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                    <div style={{ marginTop: 6, fontWeight: 700 }}>{notesGuidance.reminder}</div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Live Consultation Prompt: Tahap 5 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap5_guide" style={{ background: '#f2f8f7', border: '1px solid var(--primary-border)', borderLeft: '4px solid #58aebd', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--tosca-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} />
                Panduan Kakak Asuh: {guideCards.t5.title}
              </span>
              <div style={{ fontSize: 13, color: 'var(--ink-strong)', marginTop: 4 }}>
                <strong>{guideCards.t5.goal}</strong>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tosca-dark)', marginBottom: 6, letterSpacing: 0.3 }}>YANG BISA DIBAHAS</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45 }}>
                {stage4Out.guidePoints.slice(0, 3).map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
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
