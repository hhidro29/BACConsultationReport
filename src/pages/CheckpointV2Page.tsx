import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Save, Download, Info, Building2, Wrench, ShieldCheck, BookOpen, ChevronDown, Eye, Check } from 'lucide-react';
import { V2PdfModal } from '../components/V2PdfModal';
import { downloadPdfFile } from '../utils/downloadPdf';
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
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
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

  const handleDirectDownload = async () => {
    setIsDownloading(true);
    await downloadPdfFile('Laporan_Konsultasi_Checkpoint_1_Garuda_Mahawira_Sena.pdf');
    setIsDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
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
            <span className="crumb-current">Detail Checkpoint 1 (Alur Lengkap)</span>
          </nav>
          <div className="user-pill">
            <span>{studentIdentity.saName} · {studentIdentity.saEmail}</span>
            <div className="user-avatar">WC</div>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: 60 }}>
        {/* Action Bar */}
        <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button type="button" className="btn btn-back" onClick={() => window.history.back()}>
            <ArrowLeft size={16} />
            Kembali
          </button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {draftSavedToast && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#027a48', background: '#ecfdf3', border: '1px solid #a6f4c5', padding: '4px 10px', borderRadius: 9999 }}>
                ✓ Draft tersimpan!
              </span>
            )}
            <Link to="/rapor" className="btn btn-outline">
              📝 Update Rapor ({raporMetrics.overallAvg})
            </Link>
            <button type="button" className="btn btn-outline" onClick={() => setIsLocked(!isLocked)}>
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              {isLocked ? 'Terkunci' : 'Kunci Catatan'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleSaveNotes}>
              <Save size={14} /> Simpan Draft
            </button>
            <button type="button" className="btn btn-outline" onClick={openPdf} title="Buka preview dokumen 2 halaman di layar">
              <Eye size={14} /> Preview Dokumen
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDirectDownload}
              disabled={isDownloading}
              title="Unduh file PDF resmi langsung ke komputer"
              style={{
                background: downloadSuccess ? '#027a48' : '#1078ca',
                fontWeight: 700,
                transition: 'background 0.2s ease'
              }}
            >
              {downloadSuccess ? <Check size={14} /> : <Download size={14} />}
              {isDownloading ? 'Mengunduh...' : downloadSuccess ? 'PDF Terunduh!' : 'Download PDF (2 Hlm)'}
            </button>
          </div>
        </div>

        {/* Student Header */}
        <div className="student-header" style={{ marginBottom: 16 }}>
          <div className="student-info">
            <h1>{studentIdentity.name}</h1>
            <p>
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
              📝 4. Rencana Aksi &amp; Kesepakatan
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

          {/* Upgraded 2-Column SA Guide Tahap 1 */}
          <div className="sa-prompt-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #1078ca', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={16} />
                Panduan Praktis SA: Menyamakan Persepsi &amp; Patokan Milestone 600
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: 4 }}>
                Waktu Ideal: ~10 Menit
              </span>
            </div>

            <div style={{ fontSize: 12.5, color: '#334155', background: '#ffffff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 12, lineHeight: 1.5 }}>
              🎯 <strong>Tujuan Tahap Ini:</strong> Samakan pemahaman bahwa di Semester 1 ini, patokan aman pertama adalah membawa <strong>seluruh 8 subtes ke minimal 600 poin</strong>, sebelum kita menghitung peluang lolos jurusan spesifik.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.18fr 0.82fr', gap: 14 }}>
              {/* Kolom Kiri: Alur Bicara 3 Langkah */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#1078ca', marginBottom: 8, letterSpacing: 0.3 }}>
                  🗣️ ALUR BICARA KE ORANG TUA &amp; SISWA (3 LANGKAH):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>1. Sambut &amp; Kenalkan Patokan:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #1078ca', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Selamat datang Bapak/Ibu dan Garuda. Hari ini kita bedah hasil 4 kali Tryout. Di sesi ini, patokan utama kita adalah batas aman nasional yaitu 600 poin per subtes.&quot;
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>2. Puji Capaian Positif Dulu:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #027a48', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Kabar baiknya, Pengetahuan &amp; Pemahaman Umum (PPU) Garuda sudah melewati target di angka 640 (+40) dan Penalaran Matematika sudah 597 (tinggal -3 poin lagi).&quot;
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>3. Ajak Siswa Refleksi Subtes Tertinggal:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #b42318', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Namun PU (465 / -135) dan PK (488 / -112) masih ada gap &gt;100 poin. Menurut Garuda, kendala terbesar saat mengerjakan kedua subtes itu kemarin apa?&quot;
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Rambu & Tips Sikap SA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>✅ LAKUKAN (DO):</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Mulai dari apresiasi agar anak merasa dihargai dan orang tua tidak tegang.</li>
                    <li>Jelaskan skor TO 1 (601) ke TO 4 (546) wajar turun karena soal tryout bertahap makin kompleks (HOTS), bukan anak mundur.</li>
                  </ul>
                </div>

                <div style={{ background: '#fffbfa', padding: '10px 12px', borderRadius: 6, border: '1px solid #fecdca', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b42318', marginBottom: 4 }}>❌ HINDARI (DON&apos;T):</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Jangan pakai kata &quot;nilaimu anjlok&quot; atau &quot;gagal&quot;.</li>
                    <li>Jangan buru-buru bahas peluang UGM di tahap ini (selesaikan fondasi 600 dulu).</li>
                  </ul>
                </div>

                <div style={{ background: '#eff8ff', padding: '10px 12px', borderRadius: 6, border: '1px solid #b2ddff', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#175cd3', marginBottom: 4 }}>📊 KAPAN PAKAI NILAI MEDIAN?</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Jika ada subtes fluktuatif ekstrem (contoh LBI Soshum: <code>628→494→488→573</code>), tunjukkan angka <strong>Median (533,5)</strong> sebagai gambaran performa tipikal yang lebih stabil.
                  </p>
                </div>
              </div>
            </div>
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

            {/* Next Stage Jump Link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <a
                href="#tahap2"
                onClick={(e) => scrollTo(e, '#tahap2')}
                className="btn btn-outline"
                style={{ fontWeight: 700, color: '#0284c7', borderColor: '#b9e6fe', background: '#f0f9ff', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                Lanjut ke Tahap 2: Skor Terbobot &amp; Jurusan <ChevronDown size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAHAP 2: SKOR TERBOBOT & EVALUASI JURUSAN PILIHAN         */}
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

          {/* Upgraded 2-Column SA Guide Tahap 2 */}
          <div className="sa-prompt-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #0284c7', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} />
                Panduan Praktis SA: Menjelaskan Skor Terbobot vs Target Lolos PTN
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 4 }}>
                Waktu Ideal: ~10 Menit
              </span>
            </div>

            <div style={{ fontSize: 12.5, color: '#334155', background: '#ffffff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 12, lineHeight: 1.5 }}>
              🎯 <strong>Tujuan Tahap Ini:</strong> Jelaskan mengapa nilai rata-rata murni (571) berbeda dengan <em>Skor Terbobot</em> di sistem SNBT. Tunjukkan posisi realistis siswa saat ini terhadap target 3 prodi pilihan tanpa mematahkan semangat belajar.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.18fr 0.82fr', gap: 14 }}>
              {/* Kolom Kiri: Alur Bicara 3 Langkah */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0284c7', marginBottom: 8, letterSpacing: 0.3 }}>
                  🗣️ ALUR BICARA KE ORANG TUA &amp; SISWA (3 LANGKAH):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>1. Jelaskan Rumus Bobot Jurusan:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #0284c7', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Bapak/Ibu, di SNBT panitia memberi bobot lebih berat pada subtes tertentu. Untuk Farmasi UGM, bobot Penalaran Matematika dan Literasi Sains tinggi, sehingga skor terbobot Garuda saat ini berada di angka 538.&quot;
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>2. Petakan Jarak Realistis:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #1078ca', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Target lolos Farmasi UGM adalah 694 (selisih -156 poin), Farmasi UI 686 (-144 poin), dan Teknik Mesin ITB 660 (-95 poin).&quot;
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>3. Validasi Minat Siswa:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #027a48', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Garuda, minat kamu di Farmasi sudah sangat kuat. Tapi melihat gap Teknik Mesin ITB lebih dekat (-95 poin), apakah kamu terbuka juga mempertimbangkan opsi teknik sebagai pilihan cadangan?&quot;
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Rambu & Tips Sikap SA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>✅ LAKUKAN (DO):</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Tegaskan bahwa gap -156 adalah hal yang wajar di Checkpoint 1 (masih ada waktu 6 bulan).</li>
                    <li>Ingatkan bahwa jika fondasi 600 di Tahap 1 tercapai, skor terbobot jurusan akan otomatis terdongkrak naik drastis.</li>
                  </ul>
                </div>

                <div style={{ background: '#fffbfa', padding: '10px 12px', borderRadius: 6, border: '1px solid #fecdca', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b42318', marginBottom: 4 }}>❌ HINDARI (DON&apos;T):</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Jangan buru-buru menyuruh siswa menurunkan jurusan di Checkpoint 1. Jaga impian mereka sebagai bahan bakar belajar.</li>
                  </ul>
                </div>

                <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: 6, border: '1px solid #bbf7d0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#15803d', marginBottom: 4 }}>🛡️ STRATEGI EVALUASI CHECKPOINT 2:</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Beri batas aman: <em>&quot;Jika sampai TO 7 (Checkpoint 2) skor belum menembus 620, baru kita siapkan strategi rasionalisasi prodi alternatif.&quot;</em>
                  </p>
                </div>
              </div>
            </div>
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

            {/* Next Stage Jump Link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <a
                href="#tahap3"
                onClick={(e) => scrollTo(e, '#tahap3')}
                className="btn btn-outline"
                style={{ fontWeight: 700, color: '#b54708', borderColor: '#fedf89', background: '#fffbeb', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                Lanjut ke Tahap 3: Subtes Prioritas &amp; Drill Aplikasi <ChevronDown size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAHAP 3: SUBTES PRIORITAS & AKTIVITAS DRILL RUANGGURU     */}
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

          {/* Upgraded 2-Column SA Guide Tahap 3 */}
          <div className="sa-prompt-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #b54708', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#b54708', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={16} />
                Panduan Praktis SA: Menghubungkan Skor TO dengan Latihan Aplikasi
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#b54708', background: '#fef0c7', padding: '2px 8px', borderRadius: 4 }}>
                Waktu Ideal: ~10 Menit
              </span>
            </div>

            <div style={{ fontSize: 12.5, color: '#334155', background: '#ffffff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 12, lineHeight: 1.5 }}>
              🎯 <strong>Tujuan Tahap Ini:</strong> Buktikan ke orang tua dan siswa bahwa kelemahan subtes di TO berbanding lurus dengan kurangnya drill soal di aplikasi, lalu kunci fokus belajar pada bab-bab yang paling lemah.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.18fr 0.82fr', gap: 14 }}>
              {/* Kolom Kiri: Alur Bicara 3 Langkah */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#b54708', marginBottom: 8, letterSpacing: 0.3 }}>
                  🗣️ ALUR BICARA KE ORANG TUA &amp; SISWA (3 LANGKAH):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>1. Tunjukkan Fakta Drill Aplikasi:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #b54708', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Garuda, data aplikasi Ruangguru memperlihatkan pola yang sangat jelas: subtes dengan skor terendah adalah yang latihannya paling minim. Di Pengetahuan Kuantitatif (PK), kamu baru latihan 1 sesi (5 butir soal, akurasi 40%).&quot;
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>2. Beri Apresiasi Rutinitas yang Sudah Bagus:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #027a48', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Bandingkan dengan Penalaran Umum (PU) yang sudah 7 sesi (35 soal, akurasi 63%). Rutinitas drill kamu di PU sudah terbentuk, sekarang kita tinggal copy-paste kebiasaan ini ke PK dan Literasi.&quot;
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>3. Kunci Topik yang Perlu Dibenahi:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #1078ca', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Kita tidak perlu belajar ulang semua bab. Di Klinik PR cabang nanti, kita langsung bedah 2 materi utama: Aljabar &amp; Pecahan (PK) dan Penalaran Induktif (PU).&quot;
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Rambu & Tips Sikap SA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>✅ LAKUKAN (DO):</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Beri optimisme: mengejar 100 poin di subtes yang masih &lt;500 jauh lebih cepat dibanding menaikkan subtes yang sudah &gt;600.</li>
                    <li>Minta komitmen orang tua untuk memantau waktu anak drill 15 soal setiap malam.</li>
                  </ul>
                </div>

                <div style={{ background: '#fffbfa', padding: '10px 12px', borderRadius: 6, border: '1px solid #fecdca', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b42318', marginBottom: 4 }}>❌ HINDARI (DON&apos;T):</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Jangan memarahi anak karena baru 5 butir soal. Tawarkan solusi penjadwalan harian yang realistis.</li>
                  </ul>
                </div>

                <div style={{ background: '#fef3f2', padding: '10px 12px', borderRadius: 6, border: '1px solid #fee4e2', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b42318', marginBottom: 4 }}>📱 DATA DRILL RIIL GARUDA:</div>
                  <p style={{ margin: 0, color: '#334155' }}>
                    • PK: 1 sesi (5 soal · 40% benar)<br/>
                    • PU: 7 sesi (35 soal · 63% benar)<br/>
                    • PM: 2 sesi (10 soal · 50% benar)<br/>
                    • Literasi: 0 sesi (belum ada drill)
                  </p>
                </div>
              </div>
            </div>
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

            {/* Next Stage Jump Link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <a
                href="#tahap4"
                onClick={(e) => scrollTo(e, '#tahap4')}
                className="btn btn-outline"
                style={{ fontWeight: 700, color: '#027a48', borderColor: '#a6f4c5', background: '#ecfdf3', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                Lanjut ke Tahap 4: Rencana Aksi &amp; Lembar Kesepakatan <ChevronDown size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAHAP 4: RENCANA AKSI & KESEPAKATAN 3 PIHAK               */}
        {/* ========================================================= */}
        <section id="tahap4" style={{ scrollMarginTop: 75, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#027a48', background: '#ecfdf3', padding: '3px 10px', borderRadius: 9999 }}>
                TAHAP 4 DARI 4
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                📝 Rencana Aksi Menuju TO 5 &amp; Lembar Kesepakatan 3 Pihak
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Komitmen Nyata Siswa, Orang Tua &amp; Kakak Asuh</span>
          </div>

          {/* Upgraded 2-Column SA Guide Tahap 4 */}
          <div className="sa-prompt-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #027a48', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="sa-prompt-title" style={{ fontSize: 13, fontWeight: 800, color: '#027a48', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} />
                Panduan Praktis SA: Mengunci Komitmen 3 Pihak &amp; Penyerahan PDF
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#027a48', background: '#ecfdf3', padding: '2px 8px', borderRadius: 4 }}>
                Waktu Ideal: ~10 Menit
              </span>
            </div>

            <div style={{ fontSize: 12.5, color: '#334155', background: '#ffffff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 12, lineHeight: 1.5 }}>
              🎯 <strong>Tujuan Tahap Ini:</strong> Mengunci komitmen tertulis antara <strong>Siswa, Orang Tua, dan Kakak Asuh</strong> dengan 4 rencana aksi yang jelas jadwalnya, lalu serahkan dokumen resmi 2 halaman PDF.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.18fr 0.82fr', gap: 14 }}>
              {/* Kolom Kiri: Alur Bicara 3 Langkah */}
              <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#027a48', marginBottom: 8, letterSpacing: 0.3 }}>
                  🗣️ ALUR BICARA KE ORANG TUA &amp; SISWA (3 LANGKAH):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, lineHeight: 1.5 }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>1. Tegaskan Pembagian Peran 3 Pihak:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #027a48', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Bapak/Ibu dan Garuda, strategi terbaik butuh eksekusi harian. Garuda komitmen 15 soal per hari, Kakak Asuh kawal di Klinik PR cabang 2x seminggu, dan Bapak/Ibu mohon bantuannya memantau suasana belajar di rumah.&quot;
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>2. Pasang Target Nyata Menuju TO 5:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #1078ca', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Target kita di TO 5 November nanti adalah naik bertahap dari skor 546 ke minimal 585 poin sebagai batu loncatan menuju 600.&quot;
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>3. Tutup dan Unduh Dokumen:</strong>
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 4, borderLeft: '2.5px solid #0284c7', color: '#334155', fontStyle: 'italic' }}>
                      &quot;Mari kita tandatangani kesepakatan ini bersama, dan dokumen resmi 2 halaman PDF bisa langsung didownload untuk disimpan Bapak/Ibu.&quot;
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Checklist Akhir SA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#027a48', marginBottom: 4 }}>📋 CHECKLIST AKHIR SA:</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Pastikan siswa tahu hari dan jam hadir Klinik PR di cabang.</li>
                    <li>Pastikan orang tua tahu cara melihat progres drill di aplikasi.</li>
                    <li>Tulis ringkasan catatan konsultasi di formulir bawah dan klik <strong>Simpan Draft</strong>.</li>
                    <li>Klik <strong>Download PDF</strong> untuk mengunduh laporan resmi 2 halaman.</li>
                  </ul>
                </div>

                <div style={{ background: '#fffbfa', padding: '10px 12px', borderRadius: 6, border: '1px solid #fecdca', fontSize: 11.5, lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#b42318', marginBottom: 4 }}>❌ HINDARI (DON&apos;T):</div>
                  <ul style={{ margin: 0, paddingLeft: 14, color: '#334155' }}>
                    <li>Jangan bubarkan sesi sebelum ada jadwal pasti kapan siswa datang ke cabang minggu ini.</li>
                  </ul>
                </div>
              </div>
            </div>
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

          {/* Agreement & Signature Card */}
          <div className="section-block" id="sec_tahap4_agreement">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 15 }}>2. Lembar Kesepakatan Bersama 3 Pihak</h3>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Dokumen Resmi Konsultasi Checkpoint 1 Cabang Depok Margonda</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
              <div style={{ fontSize: 12.5, color: '#334155', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.55 }}>
                &quot;Dengan menandatangani lembar ini, Siswa, Orang Tua / Wali, dan Kakak Asuh Brain Academy menyatakan telah berdiskusi bersama, memahami hasil evaluasi belajar 4 Tryout, dan bersepakat mengenai formulasi pilihan jurusan serta komitmen rencana tindak lanjut belajar Checkpoint 1 demi mencapai target PTN impian.&quot;
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>PIHAK SISWA</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{studentIdentity.name}</div>
                  <div style={{ fontSize: 11, color: '#027a48', fontWeight: 600, marginTop: 2 }}>✓ Menyetujui Komitmen</div>
                </div>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>PIHAK ORANG TUA</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{studentIdentity.parentName}</div>
                  <div style={{ fontSize: 11, color: '#027a48', fontWeight: 600, marginTop: 2 }}>✓ Hadir &amp; Menyetujui</div>
                </div>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>KAKAK ASUH RUANGGURU</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{studentIdentity.saName}</div>
                  <div style={{ fontSize: 11, color: '#1078ca', fontWeight: 600, marginTop: 2 }}>✓ Fasilitator &amp; Pendamping</div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                  Catatan Khusus Kakak Asuh (Tersimpan ke LocalStorage):
                </label>
                <textarea
                  rows={3}
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

            {/* Bottom Download Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, background: '#0f172a', color: '#fff', padding: '14px 20px', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Dokumen Laporan Konsultasi 2 Halaman Siap Didownload</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                  Format standar A4 tanpa instruksi internal SA — dikhususkan untuk diserahkan ke Siswa &amp; Orang Tua.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={openPdf}
                  style={{ color: '#fff', borderColor: '#475569', fontWeight: 600, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Eye size={15} />
                  Preview di Layar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDirectDownload}
                  disabled={isDownloading}
                  style={{
                    background: downloadSuccess ? '#027a48' : '#2563eb',
                    border: 'none',
                    fontWeight: 700,
                    padding: '8px 18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background 0.2s ease'
                  }}
                >
                  {downloadSuccess ? <Check size={15} /> : <Download size={15} />}
                  {isDownloading ? 'Mengunduh...' : downloadSuccess ? 'PDF Berhasil Diunduh!' : 'Download PDF Langsung'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <V2PdfModal isOpen={isPdfOpen} onClose={closePdf} />
    </div>
  );
};
