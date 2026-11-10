import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Save, Info, Building2, Wrench, ShieldCheck, BookOpen, Compass, FileText } from 'lucide-react';
import { V2PdfModal } from '../components/V2PdfModal';
import { SimulasiModal } from '../components/SimulasiModal';
import {
  studentIdentity,
  subtestsV2Data,
  prioritySubtestsV2,
  actionPlansV2,
  targetPrograms
} from '../data/garudaData';
import { useRapor } from '../context/RaporContext';

export const CheckpointV2Page: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { getMetrics } = useRapor();
  const raporMetrics = getMetrics();
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true'
  );
  const [isSimulasiOpen, setIsSimulasiOpen] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);
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

  const handleSaveNotes = () => {
    localStorage.setItem('bac_v2_sa_notes', saNotes);
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openPdf = () => setIsPdfOpen(true);
  const closePdf = () => setIsPdfOpen(false);

  return (
    <div>
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <nav aria-label="breadcrumb" className="breadcrumbs">
            <a href="#home">Home</a>
            <span className="crumb-sep">›</span>
            <a href="#checkpoint">Konsultasi - Checkpoint</a>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Detail Checkpoint 1</span>
          </nav>
          <div className="user-pill">
            <span>{studentIdentity.saName} · {studentIdentity.saEmail}</span>
            <div className="user-avatar">WC</div>
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
              title="Buka Preview & Download PDF 2 Halaman"
              style={{ padding: '7px 14px', fontSize: 12.5, whiteSpace: 'nowrap' }}
            >
              <FileText size={14} /> Preview &amp; Download PDF
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0 }}>{studentIdentity.name}</h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2.5px 10px',
                  borderRadius: 9999,
                  background: isLocked ? '#e2e8f0' : '#ecfdf3',
                  color: isLocked ? '#475467' : '#027a48',
                  border: `1px solid ${isLocked ? '#cbd5e1' : '#a6f4c5'}`
                }}
              >
                {isLocked ? 'Terkunci' : 'Draft Aktif'}
              </span>
            </div>
            <p style={{ marginTop: 6 }}>
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
            top: 10,
            zIndex: 40,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            padding: '8px 16px',
            marginBottom: 28,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <div className="jump-nav-label" style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
            🧭 <span>Alur Sesi Konsultasi:</span>
          </div>
          <div className="jump-nav-links" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href="#tahap1" onClick={(e) => scrollTo(e, '#tahap1')} className="jump-pill">
              🎯 1. Fondasi 600 &amp; Skor Reguler
            </a>
            <a href="#tahap2" onClick={(e) => scrollTo(e, '#tahap2')} className="jump-pill">
              🏛️ 2. Skor Terbobot &amp; Jurusan
            </a>
            <a href="#tahap3" onClick={(e) => scrollTo(e, '#tahap3')} className="jump-pill">
              🛠️ 3. Subtes Prioritas &amp; Drill
            </a>
            <a href="#tahap4" onClick={(e) => scrollTo(e, '#tahap4')} className="jump-pill">
              📝 4. Rencana Aksi &amp; Catatan SA
            </a>
          </div>
        </nav>

        {/* ========================================================= */}
        {/* TAHAP 1: FONDASI 600 & EVALUASI SKOR IRT REGULER          */}
        {/* ========================================================= */}
        <section id="tahap1" style={{ scrollMarginTop: 75, marginBottom: 40 }}>
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
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Data Berdasarkan 4 Episode Tryout SNBT Awal</span>
            </div>
            
            {/* 4-KPI Metric Cards Grid */}
            <div className="metrics-grid">
              {/* Card 1: Rata-Rata */}
              <div className="metric-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #1078ca', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Rata-Rata Skor Reguler</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '1.5px 6px', borderRadius: 4 }}>4 Tryout</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1078ca', lineHeight: 1.1, margin: '4px 0 6px' }}>{studentIdentity.toAverage}</div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>Tren: 601 → 576 → 561 → <strong>546</strong></div>
              </div>

              {/* Card 2: Di Atas 600 */}
              <div className="metric-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #12b76a', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Di Atas Target 600 (+)</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#027a48', background: '#ecfdf3', padding: '1.5px 6px', borderRadius: 4 }}>Tercapai</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#027a48', lineHeight: 1.1, margin: '4px 0 6px' }}>
                  1 <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>/ 8 Subtes</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#027a48', fontWeight: 600 }}>PPU: 640 (+40 poin)</div>
              </div>

              {/* Card 3: Di Bawah 600 */}
              <div className="metric-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #f04438', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Di Bawah Target 600 (-)</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#b42318', background: '#fef3f2', padding: '1.5px 6px', borderRadius: 4 }}>Perlu Dikejar</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#b42318', lineHeight: 1.1, margin: '4px 0 6px' }}>
                  7 <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>/ 8 Subtes</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#b42318', fontWeight: 600 }}>Rentang gap: -135 s.d. -3 poin</div>
              </div>

              {/* Card 4: Kehadiran */}
              <div className="metric-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #0ba5ec', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Kehadiran Kelas</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#027a48', background: '#ecfdf3', padding: '1.5px 6px', borderRadius: 4 }}>Disiplin</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0284c7', lineHeight: 1.1, margin: '4px 0 6px' }}>{studentIdentity.attendanceRate}</div>
                <div style={{ fontSize: 11.5, color: '#64748b' }}>{studentIdentity.attendanceDetail}</div>
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
              <h3 className="section-title" style={{ fontSize: 15 }}>2. Evaluasi Capaian 8 Subtes vs Target 600 (Median 4 TO)</h3>
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
                    <th style={{ textAlign: 'center', width: '10%' }}>Median 4 TO</th>
                    <th style={{ width: '22%' }}>Visual Posisi vs Target 600</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Selisih</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Prioritas</th>
                  </tr>
                </thead>
                <tbody>
                  {subtestsV2Data.map((sub) => {
                    const isHigh = sub.status === 'PRIORITAS UTAMA';
                    const isDone = sub.gap >= 0;
                    const renderTrend = (curr: number, prev: number) => {
                      if (curr > prev) return <span style={{ color: '#027a48', fontSize: 10 }}> ▲</span>;
                      if (curr < prev) return <span style={{ color: '#b42318', fontSize: 10 }}> ▼</span>;
                      return null;
                    };
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
                    <th style={{ textAlign: 'center', width: '10%' }}>Rata-rata 4 TO</th>
                    <th style={{ width: '22%' }}>Visual Posisi vs Target 600</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Selisih</th>
                    <th style={{ textAlign: 'center', width: '10%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Rata-rata 8 subtes</strong></td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>601</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>576 <span style={{ color: '#b42318', fontSize: 10 }}>▼</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>561 <span style={{ color: '#b42318', fontSize: 10 }}>▼</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#b54708' }}>546 <span style={{ fontSize: 10 }}>▼</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#1078ca' }}>571</td>
                    <td>
                      <div className="v2-progress-track">
                        <div className="v2-progress-fill" style={{ width: '48.7%', background: '#f79009' }} />
                        <div className="v2-progress-target-line" title="Target 600" />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#b54708' }}>-54</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-warn">PERLU DITINGKATKAN</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Median 8 subtes</strong></td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>596</td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>572,5 <span style={{ color: '#b42318', fontSize: 10 }}>▼</span></td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>567 <span style={{ color: '#b42318', fontSize: 10 }}>▼</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#b54708' }}>548,5 <span style={{ fontSize: 10 }}>▼</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#475467' }}>569,8</td>
                    <td>
                      <div className="v2-progress-track">
                        <div className="v2-progress-fill" style={{ width: '49.5%', background: '#f79009' }} />
                        <div className="v2-progress-target-line" title="Target 600" />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#b54708' }}>-51,5</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-warn">PERLU DITINGKATKAN</span>
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

          {/* Live Consultation Prompt: Tahap 1 */}
          <div className="sa-prompt-card" id="sec_tahap1_guide" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #1078ca', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={16} />
                Panduan Diskusi SA: Mengulas Tren Skor &amp; Fondasi 600
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '2px 10px', borderRadius: 9999 }}>
                Target Hasil: Paham kendala nilai turun &amp; setuju kejar 600
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Pertanyaan Penggalian */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#1078ca', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 YANG PERLU DIGALI &amp; DIKONFIRMASI:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa (Pola Penurunan TO 1 → TO 4):</strong>{' '}
                    &quot;Di luar PPU (640) dan PM (597) yang sudah kuat, apa yang terasa paling berubah dari TO 1 ke TO 4—apakah materi makin sulit, kehabisan waktu, atau faktor lelah?&quot;
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa (Gap Terbesar di PU &amp; PK):</strong>{' '}
                    &quot;Untuk PU (465) dan PK (488), kendala utamanya lebih ke belum paham konsep dasarnya, atau salah memahami maksud soal?&quot;
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Orang Tua (Konteks di Rumah):</strong>{' '}
                    &quot;Selama September–Oktober kemarin, apakah ada perubahan jadwal sekolah/ekskul atau kondisi belajar di rumah yang memengaruhi fokus?&quot;
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Konteks Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>🧭 RAMBU KOMUNIKASI:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li><strong>Apresiasi dulu:</strong> Soroti kekuatan PPU (640) &amp; PM (597) agar suasana tidak tegang.</li>
                    <li><strong>Hindari vonis &quot;anjlok/gagal&quot;:</strong> Jelaskan tingkat kesulitan soal TO bertahap meningkat ke standar HOTS; posisi saat ini adalah titik awal pembinaan.</li>
                  </ul>
                </div>

                <div style={{ background: '#eff8ff', padding: '10px 12px', borderRadius: 6, border: '1px solid #b2ddff', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#175cd3', marginBottom: 4 }}>📊 KONTEKS DATA (RERATA VS MEDIAN):</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Median (contoh LBI Soshum <code>628→494→488→573</code> = <strong>533,5</strong>) berasal dari <strong>riwayat pribadi siswa</strong> untuk melihat skor tipikal saat hasil berfluktuasi, bukan ranking nasional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        <section id="tahap2" style={{ scrollMarginTop: 75, marginBottom: 40 }}>
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

          {/* Live Consultation Prompt: Tahap 2 */}
          <div className="sa-prompt-card" id="sec_tahap2_guide" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #0284c7', borderRadius: 8, padding: '14px 18px', marginTop: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} />
                Panduan Diskusi SA: Menyelaraskan Pilihan Jurusan &amp; Keluarga
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 10px', borderRadius: 9999 }}>
                Target Hasil: Pilihan 1–3 terkonfirmasi &amp; paham batasan keluarga
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Pertanyaan Penggalian */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0284c7', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 YANG PERLU DIGALI &amp; DIKONFIRMASI:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa (Minat &amp; Komitmen):</strong>{' '}
                    &quot;Apakah Farmasi (UGM/UI) masih menjadi minat utamamu? Dengan gap skor terbobot saat ini, langkah belajar tambahan apa yang siap kamu ambil?&quot;
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa &amp; Ortu (Konflik Pilihan &amp; Lokasi):</strong>{' '}
                    &quot;Bagaimana kesepakatan keluarga soal perbedaan rumpun (Farmasi vs Teknik Mesin di Pilihan 3) serta kesiapan izin merantau ke Yogyakarta/Bandung?&quot;
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Konfirmasi Opsi Serumpun:</strong>{' '}
                    &quot;Jika nantinya butuh alternatif, apakah keluarga lebih memprioritaskan jurusan Farmasi di kampus lain atau kampus yang lebih dekat?&quot;
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Konteks Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>🧭 RAMBU KOMUNIKASI:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li><strong>Jaga motivasi di CP1:</strong> Jangan memaksa siswa menurunkan jurusan saat ini. Capainya target 600 di Tahap 1 otomatis akan mendongkrak skor terbobot.</li>
                    <li><strong>Netral terhadap konflik:</strong> Jangan menganggap Teknik Mesin sebagai cadangan otomatis sebelum minat siswa &amp; harapan ortu diselaraskan.</li>
                  </ul>
                </div>

                <div style={{ background: '#eff8ff', padding: '10px 12px', borderRadius: 6, border: '1px solid #b2ddff', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#175cd3', marginBottom: 4 }}>ℹ️ KONTEKS TARGET INTERNAL:</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Target Skor Lolos &amp; Skor Terbobot CMS adalah <strong>acuan latihan internal</strong> dari profil peserta, bukan passing grade resmi SNPMB atau jaminan kelolosan. Peninjauan alternatif dibahas bertahap di checkpoint berikutnya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        <section id="tahap3" style={{ scrollMarginTop: 75, marginBottom: 40 }}>
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


          {/* Cards 4 Subtests */}
          <div className="section-block" id="sec_tahap3_cards">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>1. Analisis Diagnostik 4 Subtes Penentu Kelulusan</h3>
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

                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                      <strong>Diagnosa Kakak Asuh:</strong> {item.diagnosis}
                    </div>

                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${isHigh ? '#fecdd3' : '#fedf89'}`, fontSize: 11.5, color: '#1078ca', fontWeight: 600 }}>
                      🎯 Target TO 5: {item.targetTo5}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Live Consultation Prompt: Tahap 3 */}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12 }}>
              {/* Kolom Kiri: Pertanyaan Penggalian */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#b54708', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 YANG PERLU DIGALI &amp; DIKONFIRMASI:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa (Cara Memilih Latihan):</strong>{' '}
                    &quot;Di aplikasi, PU sudah 7 sesi tapi PK baru 1 sesi dan Literasi 0 sesi. Biasanya saat buka drill, apa yang bikin kamu lebih memilih PU dibanding subtes yang nilainya masih rendah?&quot;
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa (Latihan Luar &amp; Pembahasan):</strong>{' '}
                    &quot;Apakah kamu juga latihan dari sumber luar (buku/latihan sekolah)? Setelah mengerjakan dan ada jawaban salah, apakah pembahasannya dicek ulang atau ditanyakan ke pengajar?&quot;
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa (Kunci Topik Klinik PR):</strong>{' '}
                    &quot;Dari topik lemah yang tercatat (Aljabar &amp; Pecahan di PK, Penalaran Induktif di PU), materi mana yang paling bikin mentok dan perlu kita bedah dulu di Klinik PR?&quot;
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Rambu Komunikasi & Konteks Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>🧭 RAMBU KOMUNIKASI:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li><strong>Hindari latihan semu:</strong> Apresiasi konsistensi di PU, lalu ajak mengalihkan porsi latihan ke subtes dengan gap terbesar (PK &amp; Literasi).</li>
                    <li><strong>Jangan menyimpulkan &quot;malas&quot; dari angka 0:</strong> Data kosong hanya berarti belum tercatat di aplikasi—gali dulu kendala atau latihan di luar sistem.</li>
                  </ul>
                </div>

                <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: 6, border: '1px solid #fde68a', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b45309', marginBottom: 4 }}>📏 CARA BACA METRIK SESI DRILL:</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    1 sesi dapat terhitung meskipun siswa hanya mengerjakan &lt;10 soal. Selalu baca <strong>jumlah sesi bersama total butir soal &amp; akurasinya</strong> (misal PK: 1 sesi = baru 5 soal).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        <section id="tahap4" style={{ scrollMarginTop: 75, marginBottom: 40 }}>
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
              <h3 className="section-title" style={{ fontSize: 15 }}>1. Rencana Aksi Bersama Sampai TO 5</h3>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>4 Tindakan Konkret yang Wajib Dijalankan Selama 4 Minggu ke Depan</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {actionPlansV2.map((plan) => (
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

          {/* Live Consultation Prompt: Tahap 4 */}
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
              {/* Kolom Kiri: Pertanyaan Penggalian */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#027a48', marginBottom: 8, letterSpacing: 0.3 }}>
                  🔍 YANG PERLU DIGALI &amp; DIKONFIRMASI:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Siswa (Uji Realistis Jadwal):</strong>{' '}
                    &quot;Untuk target 15 soal/hari (Senin–Jumat) dan Klinik PR 2x seminggu, hari dan jam berapa yang paling realistis dijalankan tanpa bentrok jadwal sekolah/ekskul?&quot;
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Ke Orang Tua (Bentuk Dukungan):</strong>{' '}
                    &quot;Bentuk pendampingan atau pengingat seperti apa yang paling nyaman Bapak/Ibu lakukan di rumah untuk membantu konsistensi belajarnya menuju TO 5?&quot;
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>• Konfirmasi Hal Belum Tuntas:</strong>{' '}
                    &quot;Apakah masih ada topik atau keputusan (misal izin lokasi kampus/pilihan cadangan) yang masih perlu didiskusikan keluarga sebelum sesi berikutnya?&quot;
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Checklist Penutupan SA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>📋 CHECKLIST PENUTUPAN SA:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Pastikan ada kesepakatan <strong>hari &amp; jam hadir Klinik PR</strong> di cabang minggu ini.</li>
                    <li>Catat keputusan &amp; hal yang perlu dicek ulang, lalu klik <strong>Simpan Draft</strong> di bar aksi atas.</li>
                    <li>Klik <strong>Preview &amp; Download PDF</strong> di bar aksi atas (tombol <strong>Download PDF</strong> ada di dalam preview), lalu klik <strong>Kunci</strong> bila sudah final.</li>
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
