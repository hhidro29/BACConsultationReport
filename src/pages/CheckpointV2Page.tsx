import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Save, Info, Building2, Wrench, ShieldCheck, BookOpen, Compass, FileText, GitBranch, ChevronDown } from 'lucide-react';
import { V2PdfModal } from '../components/V2PdfModal';
import { SimulasiModal } from '../components/SimulasiModal';
import {
  CHECKPOINT1_STUDENTS
} from '../data/garudaData';
import { useRapor } from '../context/RaporContext';
import { useRuleConfig } from '../utils/saRuleStore';
import {
  analyzeStage1,
  analyzeStage2,
  analyzeStage3Subtest,
  analyzeStage3Overall,
  analyzeStage4
} from '../utils/saGuidelineEngine';

export const CheckpointV2Page: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { getMetrics } = useRapor();
  const { config: ruleConfig, isCustomized: isRuleCustomized } = useRuleConfig();
  const raporMetrics = getMetrics();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const fromParam = searchParams.get('student');
    if (fromParam && CHECKPOINT1_STUDENTS.some((s) => s.id === fromParam)) {
      return fromParam;
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

  const activeStudent = CHECKPOINT1_STUDENTS.find((s) => s.id === selectedStudentId) || CHECKPOINT1_STUDENTS[0];
  const studentIdentity = activeStudent.identity;
  const subtestsV2Data = activeStudent.subtests;
  const targetPrograms = activeStudent.targetPrograms;
  const prioritySubtestsV2 = activeStudent.prioritySubtests;

  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true'
  );
  const [isSimulasiOpen, setIsSimulasiOpen] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<string>('tahap1');
  const [saNotes, setSaNotes] = useState<string>(() => {
    const saved = localStorage.getItem('bac_v2_sa_notes');
    return saved || "Siswa sempat merasa terbebani penurunan nilai dari TO 1 ke TO 4, namun kembali bersemangat setelah melihat Penalaran Matematika (597) sudah di ambang batas 600. Orang tua menyetujui target 15 soal/hari dan akan mendampingi jadwal belajar mandiri di rumah. Fokus pemulihan utama: PU dan PK.";
  });

  useEffect(() => {
    const preview = searchParams.get('preview');
    if (preview === '1' || preview === 'true') {
      setIsPdfOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const stageIds = ['tahap1', 'tahap2', 'tahap3', 'tahap4'];
    const handleScroll = () => {
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
    localStorage.setItem('bac_v2_sa_notes', saNotes);
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const targetId = id.replace('#', '');
    setActiveStage(targetId);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openPdf = () => setIsPdfOpen(true);
  const closePdf = () => setIsPdfOpen(false);

  // Dynamic KPI Metrics (computed strictly from student data)
  const toScoresList = studentIdentity.toScores;
  const toAverageComputed = toScoresList.length
    ? Math.round(toScoresList.reduce((acc, v) => acc + v, 0) / toScoresList.length)
    : 0;
  const totalSubtestsCount = subtestsV2Data.length;
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
    if (curr > prev) return <span style={{ color: '#027a48', fontSize: 10 }}> ▲</span>;
    if (curr < prev) return <span style={{ color: '#b42318', fontSize: 10 }}> ▼</span>;
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

  const getSubtestStatus = (gap: number) => {
    if (gap >= 0) return { label: 'TERCAPAI', badgeClass: 'badge badge-success', color: '#12b76a' };
    if (gap >= -30) return { label: 'MENDEKATI 600', badgeClass: 'badge badge-info', color: '#2e90fa' };
    if (gap >= -90) return { label: 'PERLU DITINGKATKAN', badgeClass: 'badge badge-warn', color: '#f79009' };
    return { label: 'PRIORITAS UTAMA', badgeClass: 'badge badge-danger', color: '#d92d20' };
  };

  // Dynamic Ringkasan 8 Subtes calculations
  const avgTO1 = subtestsV2Data.length ? Math.round(subtestsV2Data.reduce((s, x) => s + x.to1, 0) / subtestsV2Data.length) : 0;
  const avgTO2 = subtestsV2Data.length ? Math.round(subtestsV2Data.reduce((s, x) => s + x.to2, 0) / subtestsV2Data.length) : 0;
  const avgTO3 = subtestsV2Data.length ? Math.round(subtestsV2Data.reduce((s, x) => s + x.to3, 0) / subtestsV2Data.length) : 0;
  const avgTO4 = subtestsV2Data.length ? Math.round(subtestsV2Data.reduce((s, x) => s + x.to4, 0) / subtestsV2Data.length) : 0;
  const avgOverall = Math.round((avgTO1 + avgTO2 + avgTO3 + avgTO4) / 4);
  const avgGap = avgTO4 - 600;
  const avgFillPct = Math.max(0, Math.min(100, ((avgTO4 - 400) / 300) * 100));
  const avgStatus = getSubtestStatus(avgGap);

  const medTO1 = computeMedian(subtestsV2Data.map((s) => s.to1));
  const medTO2 = computeMedian(subtestsV2Data.map((s) => s.to2));
  const medTO3 = computeMedian(subtestsV2Data.map((s) => s.to3));
  const medTO4 = computeMedian(subtestsV2Data.map((s) => s.to4));
  const medOverall = (medTO1 + medTO2 + medTO3 + medTO4) / 4;
  const medGap = medTO4 - 600;
  const medFillPct = Math.max(0, Math.min(100, ((medTO4 - 400) / 300) * 100));
  const medStatus = getSubtestStatus(medGap);

  // Subtest with largest fluctuation for dynamic educational callout
  const maxFluctSub = [...subtestsV2Data].sort((a, b) => {
    const rangeB = Math.max(b.to1, b.to2, b.to3, b.to4) - Math.min(b.to1, b.to2, b.to3, b.to4);
    const rangeA = Math.max(a.to1, a.to2, a.to3, a.to4) - Math.min(a.to1, a.to2, a.to3, a.to4);
    return rangeB - rangeA;
  })[0] || subtestsV2Data[0];

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
      programs: activeStudent.targetPrograms,
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
  const stage4Out = analyzeStage4(
    {
      hasConflictOrLocationCheck:
        activeStudent.familyAlignment === 'different_major' ||
        activeStudent.familyAlignment === 'location_limit' ||
        stage2Out.conditionLabel.includes('Campuran'),
      hasMissingDrill: activeStudent.prioritySubtests.some(
        (s) => s.rgQuestionsDone <= ruleConfig.thresholds.drillMismatchLowQ
      ),
      prioritySubtests: activeStudent.prioritySubtests,
      studentName: activeStudent.identity.name,
      saName: activeStudent.identity.saName,
      parentName: activeStudent.identity.parentName
    },
    ruleConfig
  );

  return (
    <div>
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <nav aria-label="breadcrumb" className="breadcrumbs">
            <Link to="/">Home</Link>
            <span className="crumb-sep">›</span>
            <Link to="/">Konsultasi - Checkpoint</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Detail Checkpoint 1</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/engine"
              title="Buka Simulator, Jejak Aturan & Kontrol Engine Panduan SA"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                fontWeight: 700,
                color: isRuleCustomized ? '#b54708' : '#1078ca',
                background: isRuleCustomized ? '#fef0c7' : '#eff8ff',
                border: `1px solid ${isRuleCustomized ? '#fedf89' : '#b2ddff'}`,
                padding: '4px 10px',
                borderRadius: 9999,
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <GitBranch size={12} /> {isRuleCustomized ? 'Engine Aturan · Custom' : 'Engine Aturan'}
            </Link>
            <div className="user-pill">
              <span>{studentIdentity.saName} · {studentIdentity.saEmail}</span>
              <div className="user-avatar">WC</div>
            </div>
          </div>
        </div>
      </header>

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
            {draftSavedToast && (
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#027a48', background: '#ecfdf3', border: '1px solid #a6f4c5', padding: '4px 10px', borderRadius: 9999, whiteSpace: 'nowrap' }}>
                ✓ Draft tersimpan!
              </span>
            )}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsSimulasiOpen(true)}
              style={{ padding: '7px 14px', fontSize: 12.5, whiteSpace: 'nowrap' }}
              title="Buka Simulasi Peluang & Alternatif Prodi PTN"
            >
              <Compass size={14} /> Simulasi
            </button>
            <Link
              to="/rapor"
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: 12.5, whiteSpace: 'nowrap' }}
              title="Lihat & Update Nilai Rapor Semester 1–5"
            >
              📝 Rapor ({raporMetrics.overallAvg})
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSaveNotes}
              disabled={isLocked}
              style={{ padding: '7px 14px', fontSize: 12.5, whiteSpace: 'nowrap', opacity: isLocked ? 0.5 : 1 }}
            >
              <Save size={14} /> Simpan Draft
            </button>
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
              onClick={() => setIsLocked(!isLocked)}
              style={{
                padding: '7px 16px',
                fontSize: 12.5,
                whiteSpace: 'nowrap',
                background: isLocked ? '#475467' : '#1078ca',
                borderColor: isLocked ? '#475467' : '#1078ca'
              }}
            >
              {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
              {isLocked ? 'Buka Kunci' : 'Kunci'}
            </button>
          </div>
        </div>

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
                  <span style={{ color: '#1078ca', fontWeight: 700 }}>Ganti Siswa</span>
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
                      padding: '6px',
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
                          onClick={() => {
                            setSelectedStudentId(st.id);
                            setIsStudentMenuOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            background: isSelected ? '#eff8ff' : 'transparent',
                            border: 'none',
                            padding: '8px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'block',
                            transition: 'background 0.1s'
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
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
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
            <div>Sesi: <strong>Konsultasi Checkpoint 1 (Pasca 4 TO)</strong></div>
            <div style={{ marginTop: 2 }}>Tanggal: <strong>04 November 2026</strong></div>
          </div>
        </div>

        {/* STICKY QUICK-JUMP SUB-NAV (CONTINUOUS TOP-TO-BOTTOM ALUR) */}
        <nav
          className="jump-nav-container"
          aria-label="Alur Konsultasi 4 Tahap"
          style={{
            position: 'sticky',
            top: 68,
            zIndex: 40,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #cbd5e1',
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
          <div className="jump-nav-label" style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
            🧭 <span>Alur:</span>
          </div>
          <div className="jump-nav-links" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <a href="#tahap1" onClick={(e) => scrollTo(e, '#tahap1')} className={`jump-pill ${activeStage === 'tahap1' ? 'active' : ''}`} style={{ fontSize: 11.5, padding: '4px 10px' }}>
              🎯 1. Fondasi 600 &amp; Skor Reguler
            </a>
            <a href="#tahap2" onClick={(e) => scrollTo(e, '#tahap2')} className={`jump-pill ${activeStage === 'tahap2' ? 'active' : ''}`} style={{ fontSize: 11.5, padding: '4px 10px' }}>
              🏛️ 2. Skor Terbobot &amp; Jurusan
            </a>
            <a href="#tahap3" onClick={(e) => scrollTo(e, '#tahap3')} className={`jump-pill ${activeStage === 'tahap3' ? 'active' : ''}`} style={{ fontSize: 11.5, padding: '4px 10px' }}>
              🛠️ 3. Subtes Prioritas &amp; Drill
            </a>
            <a href="#tahap4" onClick={(e) => scrollTo(e, '#tahap4')} className={`jump-pill ${activeStage === 'tahap4' ? 'active' : ''}`} style={{ fontSize: 11.5, padding: '4px 10px' }}>
              📝 4. Rencana Aksi &amp; Catatan SA
            </a>
          </div>
        </nav>

        {/* ========================================================= */}
        {/* TAHAP 1: FONDASI 600 & EVALUASI SKOR IRT REGULER          */}
        {/* ========================================================= */}
        <section id="tahap1" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1e40af', background: '#dbeafe', padding: '3px 10px', borderRadius: 9999 }}>
                TAHAP 1 DARI 4
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🎯 Fondasi 600 &amp; Evaluasi Skor IRT Reguler
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Milestone Utama Semester 1</span>
          </div>


          {/* Metrics Summary */}
          <div className="section-block" id="sec_tahap1_metrics">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>1. Ringkasan Evaluasi Skor Reguler Siswa</h3>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Ringkasan Performa Tryout Reguler</span>
            </div>
            
            {/* Minimalist 4-Column KPI Summary Strip (100% Data-Driven) */}
            <div
              className="metrics-grid"
              style={{
                gap: 1,
                background: '#e2e8f0',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 16
              }}
            >
              {/* Metric 1 */}
              <div title={toScoresList.join(' → ')} style={{ background: '#ffffff', padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Rata-rata Tryout
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1078ca', lineHeight: 1.2, marginTop: 4 }}>
                  {toAverageComputed}
                </div>
              </div>

              {/* Metric 2 */}
              <div title={aboveTooltip || undefined} style={{ background: '#ffffff', padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Di Atas Target 600
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#027a48', lineHeight: 1.2, marginTop: 4 }}>
                  {aboveTargetSubtests.length} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>/ {totalSubtestsCount} subtes</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div title={belowTooltip || undefined} style={{ background: '#ffffff', padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Di Bawah Target 600
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#b42318', lineHeight: 1.2, marginTop: 4 }}>
                  {belowTargetSubtests.length} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>/ {totalSubtestsCount} subtes</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div title={studentIdentity.attendanceDetail} style={{ background: '#ffffff', padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Kehadiran Kelas
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: 4 }}>
                  {studentIdentity.attendanceRate}
                </div>
              </div>
            </div>

            {/* Panduan Edukasi Dua Sistem Skor (Matching PDF Styling) */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '14px 18px', marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <BookOpen size={16} color="#0284c7" />
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Panduan Edukasi Orang Tua: Cara Membaca Dua Sistem Skor
                </h4>
                <span style={{ fontSize: 11, color: '#64748b', marginLeft: 'auto' }}>Diselaraskan dengan Halaman 1 Laporan Resmi PDF</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {/* Skor IRT Reguler */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '3px solid #1078ca', borderRadius: 6, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#1078ca' }}>SKOR IRT REGULER</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#1078ca', background: '#dbeafe', padding: '1.5px 6px', borderRadius: 4 }}>Kemampuan Dasar</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginBottom: 6 }}>Nilai tiap subtes, sama untuk semua jurusan</div>
                  <p style={{ fontSize: 11.5, color: '#334155', margin: '0 0 8px', lineHeight: 1.5 }}>
                    Setiap subtes dinilai dengan satu cara hitung yang sama. Angkanya tidak berubah saat pilihan jurusan berganti.
                  </p>
                  <div style={{ fontSize: 11, color: '#1e40af', background: '#eff8ff', padding: '5px 8px', borderRadius: 4 }}>
                    <strong>Dipakai untuk:</strong> Memantau fondasi tiap subtes dan target Semester 1 (seluruh subtes minimal 600).
                  </div>
                </div>

                {/* Skor IRT Terbobot */}
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderTop: '3px solid #7c3aed', borderRadius: 6, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#6b21a8' }}>SKOR IRT TERBOBOT</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#6b21a8', background: '#f3e8ff', padding: '1.5px 6px', borderRadius: 4 }}>Penentu Kelolosan PTN</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginBottom: 6 }}>Nilai yang dihitung sesuai bobot jurusan tujuan</div>
                  <p style={{ fontSize: 11.5, color: '#334155', margin: '0 0 8px', lineHeight: 1.5 }}>
                    Skor dihitung ulang dengan bobot subtes milik tiap program studi, sehingga hasilnya berbeda untuk setiap jurusan.
                  </p>
                  <div style={{ fontSize: 11, color: '#581c87', background: '#f5f3ff', padding: '5px 8px', borderRadius: 4 }}>
                    <strong>Dipakai untuk:</strong> Melihat jarak ke skor lolos jurusan impian (di Tahap 2).
                  </div>
                </div>
              </div>

              {/* Bottom Yellow Callout */}
              <div style={{ background: '#fffaeb', border: '1px solid #fedf89', borderLeft: '4px solid #f79009', borderRadius: 6, padding: '9px 13px', fontSize: 11.5, color: '#b54708', lineHeight: 1.5 }}>
                💡 <strong>Mengapa semua subtes dikejar ke 600?</strong> Bobot subtes berbeda di tiap jurusan. Subtes yang tertinggal jauh (&lt;500) akan menarik jatuh skor satu jurusan lebih jauh dibanding jurusan lain. Dengan fondasi 600 di seluruh 8 subtes, tidak ada subtes yang menjadi titik lemah di jurusan mana pun.
              </div>
            </div>
          </div>



          {/* Table 8 Subtests */}
          <div className="section-block" id="sec_tahap1_table">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>2. Evaluasi Capaian {totalSubtestsCount} Subtes vs Target 600</h3>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Skala visual progress bar rentang 400 - 700 dengan garis patokan target 600</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '24%' }}>Subtes UTBK SNBT</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>TO 1</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>TO 2</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>TO 3</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>TO 4</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Median</th>
                    <th style={{ width: '22%' }}>Visual Posisi vs Target 600</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Selisih</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Prioritas</th>
                  </tr>
                </thead>
                <tbody>
                  {subtestsV2Data.map((sub) => {
                    const isHigh = sub.status === 'PRIORITAS UTAMA';
                    const isDone = sub.gap >= 0;
                    return (
                      <tr key={sub.id} style={isHigh ? { background: '#fffbfa' } : undefined}>
                        <td><strong>{sub.name}</strong></td>
                        <td style={{ textAlign: 'center' }}>{sub.to1}</td>
                        <td style={{ textAlign: 'center' }}>{sub.to2}{renderTrend(sub.to2, sub.to1)}</td>
                        <td style={{ textAlign: 'center' }}>{sub.to3}{renderTrend(sub.to3, sub.to2)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: isDone ? '#027a48' : isHigh ? '#b42318' : '#175cd3' }}>
                          {sub.to4}{renderTrend(sub.to4, sub.to3)}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {sub.median}
                        </td>
                        <td>
                          <div className="v2-progress-track">
                            <div className="v2-progress-fill" style={{ width: `${sub.fillPct}%`, background: sub.barColor }} />
                            <div className="v2-progress-target-line" title="Target 600" />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: isDone ? '#027a48' : isHigh ? '#d92d20' : '#b42318' }}>
                          {sub.gap > 0 ? `+${sub.gap}` : sub.gap}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={sub.badgeClass}>{sub.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Ringkasan 8 Subtes Table */}
            <div className="table-container" style={{ marginTop: 14 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '24%' }}>Ringkasan 8 Subtes</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>TO 1</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>TO 2</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>TO 3</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>TO 4</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Rata-rata</th>
                    <th style={{ width: '22%' }}>Visual Posisi vs Target 600</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Selisih</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Rata-rata 8 subtes</strong></td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{avgTO1}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{avgTO2}{renderTrend(avgTO2, avgTO1)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{avgTO3}{renderTrend(avgTO3, avgTO2)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: avgStatus.color }}>{avgTO4}{renderTrend(avgTO4, avgTO3)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#1078ca' }}>{avgOverall}</td>
                    <td>
                      <div className="v2-progress-track">
                        <div className="v2-progress-fill" style={{ width: `${avgFillPct.toFixed(1)}%`, background: avgStatus.color }} />
                        <div className="v2-progress-target-line" title="Target 600" />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: avgStatus.color }}>
                      {avgGap > 0 ? `+${avgGap}` : avgGap}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={avgStatus.badgeClass}>{avgStatus.label}</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Median 8 subtes</strong></td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>{formatNumIndo(medTO1)}</td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>{formatNumIndo(medTO2)}{renderTrend(medTO2, medTO1)}</td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>{formatNumIndo(medTO3)}{renderTrend(medTO3, medTO2)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: medStatus.color }}>{formatNumIndo(medTO4)}{renderTrend(medTO4, medTO3)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#475467' }}>{formatNumIndo(medOverall)}</td>
                    <td>
                      <div className="v2-progress-track">
                        <div className="v2-progress-fill" style={{ width: `${medFillPct.toFixed(1)}%`, background: medStatus.color }} />
                        <div className="v2-progress-target-line" title="Target 600" />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: medStatus.color }}>
                      {medGap > 0 ? `+${formatNumIndo(medGap)}` : formatNumIndo(medGap)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={medStatus.badgeClass}>{medStatus.label}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Color Legend */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 10, fontSize: 12, color: '#475467', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#d92d20', display: 'inline-block', borderRadius: 2 }}></span> Prioritas utama (-91 atau lebih jauh)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#f79009', display: 'inline-block', borderRadius: 2 }}></span> Perlu ditingkatkan (-31 s.d. -90)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#2e90fa', display: 'inline-block', borderRadius: 2 }}></span> Mendekati (-30 s.d. -1)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#12b76a', display: 'inline-block', borderRadius: 2 }}></span> Tercapai (600+)
              </span>
            </div>

          </div>

          {/* Live Consultation Prompt: Tahap 1 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap1_guide" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #1078ca', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={16} />
                Panduan Diskusi SA: Mengulas Tren Skor &amp; Fondasi 600
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '2px 10px', borderRadius: 9999 }}>
                  Pola Terdeteksi: {stage1Out.patternLabel}
                </span>
                <Link to="/engine" style={{ fontSize: 11, fontWeight: 700, color: '#1078ca', textDecoration: 'none' }}>
                  Lihat &amp; Kontrol Engine →
                </Link>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#0f172a', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
              <strong>Temuan Data:</strong> {stage1Out.observation}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Tugas Fasilitasi SA */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#1078ca', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 TUGAS FASILITASI SA (BERBASIS KONDISI DATA):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa:</strong> {stage1Out.studentTask}
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Orang Tua:</strong> {stage1Out.parentTask}
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Arah Tindak Lanjut:</strong> {stage1Out.nextStep}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Catatan Tambahan */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>🧭 CATATAN KONDISI &amp; RAMBU:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    {stage1Out.extraNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                    <li><strong>Netral terhadap skor:</strong> Bahas pengalaman pengerjaan siswa terlebih dahulu sebelum menyimpulkan penyebab naik/turunnya nilai.</li>
                  </ul>
                </div>

                <div style={{ background: '#eff8ff', padding: '10px 12px', borderRadius: 6, border: '1px solid #b2ddff', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#175cd3', marginBottom: 4 }}>📊 KONTEKS DATA (RERATA VS MEDIAN):</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Median (contoh {maxFluctSub.name} <code>{maxFluctSub.to1}→{maxFluctSub.to2}→{maxFluctSub.to3}→{maxFluctSub.to4}</code> = <strong>{maxFluctSub.median}</strong>) berasal dari <strong>riwayat pribadi siswa</strong> untuk melihat skor tipikal saat hasil berfluktuasi, bukan ranking nasional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        <section id="tahap2" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: 9999 }}>
                TAHAP 2 DARI 4
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🏛️ Skor IRT Terbobot &amp; Evaluasi Peluang Jurusan PTN
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Formula Pembobotan Resmi CMS Ruangguru</span>
          </div>


          {/* Table Program Choices */}
          <div className="section-block" id="sec_tahap2_table">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>1. Evaluasi Peluang Kelulusan 3 Pilihan Jurusan PTN</h3>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                Dihitung dari Skor TO 4 Menggunakan Formula Bobot Subtes Resmi Super CMS
              </span>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>Pilihan</th>
                    <th style={{ width: '40%' }}>Program Studi &amp; Perguruan Tinggi</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>Target Skor Lolos</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>Skor Terbobot TO 4</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>Selisih ke Target</th>
                  </tr>
                </thead>
                <tbody>
                  {targetPrograms.map((prog, idx) => (
                    <tr key={prog.priority}>
                      <td>
                        <span style={{ fontWeight: 700, color: idx === 0 ? '#1078ca' : idx === 1 ? '#0284c7' : '#b54708' }}>
                          {prog.priority}
                        </span>
                      </td>
                      <td>
                        <strong>{prog.prodi}</strong><br />
                        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{prog.univ} • Keketatan: {prog.tightness}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{prog.targetScore}</td>
                      <td style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#1078ca' }}>{prog.weightedScore}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: idx === 2 ? '#b54708' : '#b42318' }}>{prog.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Live Consultation Prompt: Tahap 2 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap2_guide" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #0284c7', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} />
                Panduan Diskusi SA: Menyelaraskan Pilihan Jurusan &amp; Keluarga
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 10px', borderRadius: 9999 }}>
                Kondisi: {stage2Out.conditionLabel}
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#0f172a', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
              <strong>Temuan Data:</strong> {stage2Out.observation}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Tugas Fasilitasi SA */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0284c7', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 TUGAS FASILITASI SA:
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  {stage2Out.saTasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Konteks Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>🧭 RAMBU KOMUNIKASI:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li><strong>Jaga motivasi di CP1:</strong> Jangan memaksa siswa menurunkan jurusan saat ini sebelum pondasi subtes dibenahi.</li>
                    <li><strong>Netral terhadap konflik:</strong> Jangan menganggap pilihan ketiga sebagai cadangan otomatis sebelum minat siswa &amp; harapan ortu diselaraskan.</li>
                  </ul>
                </div>

                <div style={{ background: '#eff8ff', padding: '10px 12px', borderRadius: 6, border: '1px solid #b2ddff', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#175cd3', marginBottom: 4 }}>ℹ️ KONTEKS TARGET INTERNAL:</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    {stage2Out.guardrailNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        <section id="tahap3" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#b54708', background: '#fef0c7', padding: '3px 10px', borderRadius: 9999 }}>
                TAHAP 3 DARI 4
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🛠️ 4 Subtes Prioritas &amp; Riil Aktivitas Drill di Ruangguru
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Data Aktivitas Student Tower Aplikasi Ruangguru</span>
          </div>


          {/* Cards 4 Subtests (Authentic Data + Deterministic Rule Engine) */}
          <div className="section-block" id="sec_tahap3_cards">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>1. Ringkasan 4 Subtes Prioritas &amp; Data Drill Ruangguru</h3>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                Dipilih Berdasarkan Bobot Tertinggi di Pilihan Jurusan dan Gap Skor Terbesar
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {prioritySubtestsV2.map((item) => {
                const isHigh = item.priorityLabel.includes('TERTINGGI') && (item.id === 'pk' || item.id === 'pu');
                const isLow = item.id === 'pm';
                const titleColor = isLow ? '#175cd3' : isHigh ? '#b42318' : '#b54708';
                const boxBg = isLow ? '#eff8ff' : isHigh ? '#fffbfa' : '#fffcf5';
                const boxBorder = isLow ? '#b2ddff' : isHigh ? '#fee4e2' : '#fef0c7';

                const subRule = analyzeStage3Subtest(
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
                );

                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      border: `1.5px solid ${item.borderColor}`,
                      borderRadius: 10,
                      padding: 16,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <span className={isLow ? 'badge-p-low' : isHigh ? 'badge-p-high' : 'badge-p-med'}>{item.priorityLabel}</span>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: titleColor, marginTop: 4 }}>{item.name}</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: titleColor }}>{item.toScore}</div>
                        <div style={{ fontSize: 10.5, color: titleColor, fontWeight: 700 }}>Jarak ke 600: {item.gapText}</div>
                      </div>
                    </div>

                    <div style={{ background: boxBg, border: `1px solid ${boxBorder}`, borderRadius: 6, padding: '8px 10px', marginBottom: 10, fontSize: 11.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>📱 Soal Selesai di Ruangguru:</span>
                        <strong>{item.rgQuestionsDone} soal</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                        <span>🎯 Akurasi Latihan:</span>
                        <strong style={{ color: titleColor }}>{item.rgAccuracy}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.45, marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                        📌 3 Topik Akurasi Terendah di TO Terakhir:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 16, color: '#475569' }}>
                        {item.lowestTopics.map((topic, idx) => (
                          <li key={idx}>{topic}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ paddingTop: 8, borderTop: `1px dashed ${isHigh ? '#fecdd3' : '#fedf89'}`, fontSize: 11.5, lineHeight: 1.45 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: titleColor, background: boxBg, border: `1px solid ${boxBorder}`, padding: '1px 7px', borderRadius: 9999 }}>
                          {subRule.conditionLabel}
                        </span>
                      </div>
                      <div style={{ color: '#0f172a' }}>
                        <strong>Panduan SA:</strong> {subRule.saTask}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Live Consultation Prompt: Tahap 3 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap3_guide" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #b54708', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#b54708', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={16} />
                Panduan Diskusi SA: Audit Kebiasaan Drill &amp; Prioritas Materi Klinik PR
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#b54708', background: '#fef0c7', padding: '2px 10px', borderRadius: 9999 }}>
                Target Hasil: Sepakati topik Klinik PR &amp; perbaikan pola drill
              </span>
            </div>

            {stage3OverallOut.mismatchNote && (
              <div style={{ fontSize: 12, color: '#9a3412', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
                <strong>Temuan Pola Drill:</strong> {stage3OverallOut.mismatchNote}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Tugas Fasilitasi SA */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#b54708', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 TUGAS FASILITASI SA:
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  {stage3OverallOut.saTasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Konteks Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>🧭 RAMBU KOMUNIKASI:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li><strong>Hindari latihan semu:</strong> Apresiasi konsistensi di subtes yang sudah aktif, lalu ajak mengalihkan porsi latihan ke subtes dengan gap terbesar.</li>
                    <li><strong>Jangan menyimpulkan &quot;malas&quot; dari angka 0:</strong> Data kosong hanya berarti belum tercatat di aplikasi—gali dulu kendala atau latihan di luar sistem.</li>
                  </ul>
                </div>

                <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b45309', marginBottom: 4 }}>📏 CARA BACA METRIK SESI DRILL:</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    {stage3OverallOut.guardrailNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        <section id="tahap4" style={{ scrollMarginTop: 132, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#027a48', background: '#ecfdf3', padding: '3px 10px', borderRadius: 9999 }}>
                TAHAP 4 DARI 4
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                📝 Rencana Aksi Menuju TO 5 &amp; Catatan Kakak Asuh
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tindak Lanjut &amp; Pengingat Pertemuan Berikutnya</span>
          </div>


          {/* Action Plans Cards */}
          <div className="section-block" id="sec_tahap4_plans">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>1. Kerangka Tindak Lanjut Menuju TO 5</h3>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Disepakati Bersama Siswa &amp; Orang Tua Selama Sesi Konsultasi</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {stage4Out.actionPlans.map((plan) => (
                <div
                  key={plan.num}
                  style={{
                    background: '#f8fafc',
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
                      fontSize: 11,
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
                  <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.55 }}>{plan.desc}</p>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>PIC: {plan.pic}</div>
                </div>
              ))}
            </div>
          </div>


          {/* Catatan Khusus Kakak Asuh (Statement & Wet Signatures Live in PDF Page 2) */}
          <div className="section-block" id="sec_tahap4_agreement">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>2. Catatan Khusus Kakak Asuh</h3>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                Pengingat sesi berikutnya · Lembar pernyataan &amp; tanda tangan 3 pihak tersedia di Halaman 2 PDF
              </span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>
                    Ringkasan Kesepakatan &amp; Tindak Lanjut (Tersimpan ke LocalStorage):
                  </label>
                  {!isLocked && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() =>
                          setSaNotes(
                            '1) Pilihan & Konteks Keluarga: [isi kesepakatan prodi/lokasi]\n2) Komitmen Aksi: Drill harian 15 soal (PU/PK) + Klinik PR cabang setiap hari [... jam ...]\n3) Cek Ulang Sesi Berikutnya: [progres drill PK & akurasi TO 5]'
                          )
                        }
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#1078ca',
                          background: '#eff8ff',
                          border: '1px solid #b2ddff',
                          borderRadius: 9999,
                          padding: '2px 9px',
                          cursor: 'pointer'
                        }}
                      >
                        + Pakai Template Terstruktur
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSaNotes((prev) =>
                            prev.includes('[Cek Ulang Sesi Berikutnya]')
                              ? prev
                              : `${prev.trim()}\n• [Cek Ulang Sesi Berikutnya]: Verifikasi izin lokasi/merantau & progres drill PK.`
                          )
                        }
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#027a48',
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
                  rows={4}
                  disabled={isLocked}
                  value={saNotes}
                  onChange={(e) => setSaNotes(e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid var(--border)',
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

          {/* Live Consultation Prompt: Tahap 4 (Driven by saGuidelineEngine) */}
          <div className="sa-prompt-card" id="sec_tahap4_guide" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #027a48', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#027a48', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} />
                Panduan Diskusi SA: Mengunci Komitmen Nyata &amp; Penyerahan Laporan
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#027a48', background: '#ecfdf3', padding: '2px 10px', borderRadius: 9999 }}>
                Target Hasil: Jadwal cabang disepakati, catatan tersimpan &amp; PDF diserahkan
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Tugas Fasilitasi SA */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#027a48', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 TUGAS FASILITASI SA:
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  {stage4Out.saTasks.map((task, idx) => (
                    <li key={idx}>{task}</li>
                  ))}
                </ul>
              </div>

              {/* Kolom Kanan: Checklist Penutupan SA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>📋 CHECKLIST PENUTUPAN SA:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    {stage4Out.checklist.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#ecfdf3', padding: '10px 12px', borderRadius: 6, border: '1px solid #a6f4c5', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>🔄 KESINAMBUNGAN SESI BERIKUTNYA:</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Catatan di formulir atas berfungsi sebagai <strong>pengingat untuk pertemuan selanjutnya</strong> agar evaluasi progres di TO 5 tidak mengulang pembicaraan dari awal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <V2PdfModal isOpen={isPdfOpen} onClose={closePdf} />
      <SimulasiModal isOpen={isSimulasiOpen} onClose={() => setIsSimulasiOpen(false)} />
    </div>
  );
};
