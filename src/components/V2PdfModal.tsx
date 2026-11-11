import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, X, FileText, Check } from 'lucide-react';
import { downloadPdfFile } from '../utils/downloadPdf';
import {
  CHECKPOINT1_STUDENTS,
  Checkpoint1Student,
  ProgramChoice,
  PrioritySubtest,
  SubtestV2
} from '../data/garudaData';

interface V2PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Checkpoint1Student;
  programs?: ProgramChoice[];
}

const SHORT_CODE_MAP: Record<string, string> = {
  pu: 'PU',
  pk: 'PK',
  lbi_a: 'LBI Saintek',
  lbi_s: 'LBI Soshum',
  lbe: 'LBING',
  pbm: 'PBM',
  pm: 'PM',
  ppu: 'PPU'
};

function computeMedian(arr: number[]): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatIndo(num: number): string {
  return Number.isInteger(num) ? String(num) : num.toFixed(1).replace('.', ',');
}

function getStatusBadgeInfo(gap: number): { label: string; className: string; fillClass: string; color: string } {
  if (gap >= 0) return { label: 'Tercapai', className: 'badge-p-done', fillClass: 'priority-done', color: '#027a48' };
  if (gap >= -30) return { label: 'Mendekati', className: 'badge-p-low', fillClass: 'priority-low', color: '#175cd3' };
  if (gap >= -90) return { label: 'Perlu ditingkatkan', className: 'badge-p-med', fillClass: 'priority-med', color: '#b54708' };
  return { label: 'Prioritas utama', className: 'badge-p-high', fillClass: 'priority-high', color: '#b42318' };
}

function getDrillGuidance(sub: PrioritySubtest): string {
  if (sub.rgQuestionsDone === 0) {
    return 'Belum ada aktivitas drill di aplikasi. Mulai rutinitas drill bertahap & bedah topik dasar di Klinik PR.';
  }
  if (sub.rgQuestionsDone <= 10 && sub.gapNum <= -90) {
    return `Baru ${sub.rgQuestionsDone} soal di aplikasi. Tingkatkan frekuensi drill harian & ikuti Klinik PR tatap muka.`;
  }
  if (sub.gapNum >= -15) {
    return sub.gapNum >= 0
      ? 'Target 600 sudah tercapai. Pertahankan akurasi lewat evaluasi mingguan agar konsisten.'
      : 'Skor tinggal selangkah ke 600. Jaga ritme drill soal mingguan & fokus akurasi pengerjaan.';
  }
  if (sub.drillSessions >= 6) {
    return 'Rutinitas drill sudah terbentuk. Fokuskan pembahasan pada 2 topik akurasi terendah.';
  }
  return 'Perkuat pemahaman konsep pada topik terendah lewat latihan terarah & sesi Klinik PR.';
}

function renderTrendArrow(curr: number, prev: number) {
  if (curr > prev) return <span style={{ fontSize: 9, color: '#027a48' }}> ▲</span>;
  if (curr < prev) return <span style={{ fontSize: 9, color: '#b42318' }}> ▼</span>;
  return null;
}

export const V2PdfModal: React.FC<V2PdfModalProps> = ({
  isOpen,
  onClose,
  student = CHECKPOINT1_STUDENTS[0],
  programs
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activePrograms = programs && programs.length > 0 ? programs : student.targetPrograms;
  const { identity, subtests, prioritySubtests } = student;

  const sortedSubtests: SubtestV2[] = [...subtests].sort((a, b) => a.gap - b.gap || a.to4 - b.to4);
  const above600 = sortedSubtests.filter((s) => s.to4 >= 600);
  const below600 = sortedSubtests.filter((s) => s.to4 < 600);
  const lowest3 = below600.slice(0, 3);
  const top3WeakIds = sortedSubtests
    .filter((s) => s.gap <= -31)
    .slice(0, 3)
    .map((s) => s.id);
  const to4Score = identity.toScores[identity.toScores.length - 1] ?? 0;

  const avg1 = Math.round(subtests.reduce((acc, s) => acc + s.to1, 0) / subtests.length);
  const avg2 = Math.round(subtests.reduce((acc, s) => acc + s.to2, 0) / subtests.length);
  const avg3 = Math.round(subtests.reduce((acc, s) => acc + s.to3, 0) / subtests.length);
  const avg4 = Math.round(subtests.reduce((acc, s) => acc + s.to4, 0) / subtests.length);
  const avgAll = Math.round((avg1 + avg2 + avg3 + avg4) / 4);
  const avgGap = avg4 - 600;
  const avgFill = Math.max(0, Math.min(100, ((avg4 - 400) / 300) * 100));
  const avgBadge = getStatusBadgeInfo(avgGap);

  const med1 = computeMedian(subtests.map((s) => s.to1));
  const med2 = computeMedian(subtests.map((s) => s.to2));
  const med3 = computeMedian(subtests.map((s) => s.to3));
  const med4 = computeMedian(subtests.map((s) => s.to4));
  const medAll = (med1 + med2 + med3 + med4) / 4;
  const medGap = med4 - 600;
  const medFill = Math.max(0, Math.min(100, ((med4 - 400) / 300) * 100));
  const medBadge = getStatusBadgeInfo(medGap);

  const otherSubtests = sortedSubtests.filter(
    (s) => !prioritySubtests.some((p) => p.id === s.id || (p.id === 'lbi' && (s.id === 'lbi_a' || s.id === 'lbe')))
  );
  const otherSummaryText = otherSubtests
    .slice(0, 3)
    .map((s) => `${SHORT_CODE_MAP[s.id] || s.name} (${s.gap >= 0 ? `+${s.gap}` : s.gap})`)
    .join(' · ');

  const homeCity = identity.branch.split('-')[0].trim();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    setIsDownloading(true);
    const safeName = identity.name.replace(/\s+/g, '_');
    await downloadPdfFile(`Laporan_Konsultasi_Checkpoint_1_${safeName}.pdf`);
    setIsDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      id="pdfPreviewModal"
      className="pdf-modal-backdrop open"
      aria-hidden="false"
      style={{ display: 'flex' }}
    >
      <div className="pdf-modal-toolbar">
        <div className="pdf-modal-title">
          <FileText size={20} />
          <span>Preview Dokumen Konsultasi Siswa &amp; Orang Tua (Versi 2)</span>
          <span className="pdf-modal-badge">A4 • 2 Halaman</span>
        </div>
        <div className="pdf-modal-actions">
          <button
            type="button"
            className="btn-pdf-print"
            onClick={() => window.print()}
            title="Cetak atau Simpan PDF Langsung dari Tampilan Terkini"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.28)'
            }}
          >
            <Printer size={15} />
            Cetak / Print A4
          </button>
          <button
            type="button"
            className="btn-pdf-print"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download File PDF Bawaan ke Komputer"
            style={{
              background: downloadSuccess ? '#027a48' : '#1078ca',
              color: '#ffffff',
              transition: 'background 0.2s ease'
            }}
          >
            {downloadSuccess ? <Check size={15} /> : <Download size={15} />}
            {isDownloading ? 'Mengunduh...' : downloadSuccess ? 'Tersimpan!' : 'Download PDF'}
          </button>
          <button type="button" className="btn-pdf-close" onClick={onClose} title="Tutup Preview (Esc)">
            <X size={16} />
            Tutup
          </button>
        </div>
      </div>

      <div
        className="pdf-modal-canvas"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="pdf-sheets-container">
          {/* ================= PAGE 1 ================= */}
          <section className="profiling-print-page" id="reportPage1">
            {/* Kop Dokumen */}
            <header className="profiling-print-document-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1mm' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#1078ca', letterSpacing: 0.5 }}>
                  BRAIN ACADEMY BY RUANGGURU
                </span>
                <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700, letterSpacing: 0.3 }}>
                  DOKUMEN RESMI KONSULTASI SISWA &amp; ORANG TUA
                </span>
              </div>
              <div className="profiling-print-header">
                <div>
                  <h1 className="profiling-print-title">LAPORAN KONSULTASI CHECKPOINT 1</h1>
                  <p className="profiling-print-subtitle">
                    Hasil 4 Tryout, posisi 8 subtes UTBK, dan peluang ke {activePrograms.length} pilihan jurusan
                  </p>
                </div>
                <div className="profiling-print-pathway">JALUR UTBK-SNBT 2026/2027</div>
              </div>
            </header>

            {/* Identitas Siswa */}
            <div className="profiling-print-section" style={{ marginBottom: '2mm' }}>
              <table className="profiling-print-table" style={{ fontSize: 10 }}>
                <tbody>
                  <tr>
                    <td style={{ width: '17%', background: '#edf5f9', fontWeight: 700, color: '#334155' }}>Nama Siswa</td>
                    <td style={{ width: '33%', fontWeight: 800, color: '#0f172a', fontSize: 10.5 }}>{identity.name}</td>
                    <td style={{ width: '17%', background: '#edf5f9', fontWeight: 700, color: '#334155' }}>Asal Sekolah</td>
                    <td style={{ width: '33%' }}>{identity.school}</td>
                  </tr>
                  <tr>
                    <td style={{ background: '#edf5f9', fontWeight: 700, color: '#334155' }}>Cabang / Kelas</td>
                    <td>{identity.branch} (12 SMA)</td>
                    <td style={{ background: '#edf5f9', fontWeight: 700, color: '#334155' }}>Kakak Asuh (SA)</td>
                    <td>{identity.saName}</td>
                  </tr>
                  <tr>
                    <td style={{ background: '#edf5f9', fontWeight: 700, color: '#334155' }}>Skor Reguler</td>
                    <td colSpan={3}>
                      <strong style={{ fontSize: 11, color: '#0f172a' }}>{identity.toAverage} poin</strong>{' '}
                      <span style={{ color: '#475467' }}>(Rata-rata 4 TO)</span>
                      <span style={{ margin: '0 6px', color: '#94a3b8' }}>•</span>
                      <strong style={{ fontSize: 11, color: to4Score >= 600 ? '#027a48' : '#b42318' }}>
                        {to4Score} poin
                      </strong>{' '}
                      <span style={{ color: to4Score >= 600 ? '#027a48' : '#b42318', fontWeight: 700 }}>
                        (Skor TO 4 Terakhir)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ringkasan Posisi Saat Ini (Strip Ringkas Tanpa Duplikasi Daftar 8 Subtes) */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
                padding: '1.8mm 2.6mm',
                marginBottom: '2.2mm'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2mm' }}>
                <strong style={{ fontSize: 10.5, color: '#0f172a' }}>Ringkasan Posisi Saat Ini (Berdasarkan TO 4)</strong>
                <span style={{ fontSize: 9.5, color: '#1078ca', fontWeight: 700 }}>
                  Fokus semester ini: seluruh subtes mencapai target dasar 600
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.82fr 1.18fr', gap: '2.2mm' }}>
                <div style={{ background: '#ffffff', border: '1px solid #a6f4c5', borderLeft: '3px solid #12b76a', borderRadius: 3, padding: '1.3mm 2mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: '#027a48' }}>DI ATAS TARGET 600 (+)</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#027a48' }}>{above600.length} Subtes</span>
                  </div>
                  <div style={{ fontSize: 9.8, color: '#334155', marginTop: '0.5mm' }}>
                    {above600.length > 0
                      ? above600.map((s) => `${SHORT_CODE_MAP[s.id] || s.id.toUpperCase()} (${s.to4})`).join(' · ')
                      : 'Belum ada subtes mencapai 600 pada TO 4'}
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #fecdca', borderLeft: '3px solid #d92d20', borderRadius: 3, padding: '1.3mm 2mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: '#b42318' }}>DI BAWAH TARGET 600 (-)</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#b42318' }}>{below600.length} Subtes</span>
                  </div>
                  <div style={{ fontSize: 9.8, color: '#334155', marginTop: '0.5mm' }}>
                    {lowest3.length > 0
                      ? `3 Terendah: ${lowest3.map((s) => `${SHORT_CODE_MAP[s.id] || s.name} (${s.to4})`).join(' · ')}`
                      : 'Seluruh subtes sudah mencapai batas 600'}
                  </div>
                </div>
              </div>
            </div>

            {/* 1. CARA MEMBACA DUA SISTEM SKOR DI LAPORAN INI */}
            <div className="profiling-print-section" style={{ marginBottom: '2.2mm' }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>1.</span>Cara Membaca Dua Sistem Skor di Laporan Ini</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.2mm', marginBottom: '1.4mm' }}>
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #1078ca', borderRadius: 4, padding: '1.6mm 2.2mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8mm' }}>
                    <span style={{ fontSize: 9.2, fontWeight: 800, background: '#eff8ff', color: '#175cd3', border: '1px solid #b2ddff', padding: '0.3mm 1.6mm', borderRadius: 3 }}>
                      SKOR IRT REGULER
                    </span>
                    <span style={{ fontSize: 9, color: '#1e40af', fontWeight: 700 }}>→ Bagian 2</span>
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a', marginBottom: '0.4mm' }}>
                    Nilai tiap subtes, sama untuk semua jurusan
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#334155', lineHeight: 1.38 }}>
                    Kemampuan murni per subtes. Nilainya tetap saat jurusan berganti; dipakai memantau target dasar 600.
                  </p>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #7c3aed', borderRadius: 4, padding: '1.6mm 2.2mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8mm' }}>
                    <span style={{ fontSize: 9.2, fontWeight: 800, background: '#f9f5ff', color: '#6941c6', border: '1px solid #e9d7fe', padding: '0.3mm 1.6mm', borderRadius: 3 }}>
                      SKOR IRT TERBOBOT
                    </span>
                    <span style={{ fontSize: 9, color: '#6941c6', fontWeight: 700 }}>→ Bagian 3 (Hal. 2)</span>
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a', marginBottom: '0.4mm' }}>
                    Nilai yang dihitung sesuai bobot jurusan
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#334155', lineHeight: 1.38 }}>
                    Dihitung ulang memakai bobot subtes tiap prodi, sehingga hasilnya berbeda untuk melihat jarak ke skor lolos.
                  </p>
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '3px solid #eab308', borderRadius: 3, padding: '1.3mm 2.2mm', fontSize: 10, color: '#713f12', lineHeight: 1.38 }}>
                <strong>Mengapa semua subtes dikejar ke 600?</strong> Tiap jurusan membobot subtes berbeda. Jika seluruh subtes mencapai 600, tidak ada subtes lemah yang menarik turun skor terbobot di pilihan mana pun.
              </div>
            </div>

            {/* 2. SKOR IRT REGULER: POSISI 8 SUBTES TERHADAP TARGET 600 */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>2.</span>Skor IRT Reguler: Posisi 8 Subtes Terhadap Target 600</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#475467', textTransform: 'none', letterSpacing: 0 }}>
                  Urut gap terdalam · Sorot hingga 3 terendah (&lt; 570)
                </span>
              </h2>

              <table className="profiling-print-table" style={{ fontSize: 10 }}>
                <thead>
                  <tr>
                    <th style={{ width: '4%', textAlign: 'center' }}>#</th>
                    <th style={{ width: '31%' }}>Subtes UTBK</th>
                    <th style={{ width: '7.5%', textAlign: 'center' }}>
                      TO 1<br />
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#e0f2fe' }}>30 Agu</span>
                    </th>
                    <th style={{ width: '8%', textAlign: 'center' }}>
                      TO 2<br />
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#e0f2fe' }}>14 Sep</span>
                    </th>
                    <th style={{ width: '8%', textAlign: 'center' }}>
                      TO 3<br />
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#e0f2fe' }}>28 Sep</span>
                    </th>
                    <th style={{ width: '8.5%', textAlign: 'center' }}>
                      TO 4<br />
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#e0f2fe' }}>30 Okt</span>
                    </th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Median</th>
                    <th style={{ width: '17%', textAlign: 'center' }}>
                      Posisi vs 600
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 600, marginTop: 1, color: '#e0f2fe' }}>
                        <span>400</span><span>600</span><span>700</span>
                      </div>
                    </th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubtests.map((sub, idx) => {
                    const badge = getStatusBadgeInfo(sub.gap);
                    const focusRank = top3WeakIds.indexOf(sub.id);
                    const isFocus = focusRank !== -1;
                    const isHigh = sub.gap <= -91;
                    return (
                      <tr
                        key={sub.id}
                        style={
                          isFocus
                            ? { background: isHigh ? '#fffbfa' : '#fffcf5' }
                            : undefined
                        }
                      >
                        <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5mm' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{sub.name}</span>
                            {isFocus && (
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: isHigh ? '#b42318' : '#b54708',
                                  background: isHigh ? '#fee4e2' : '#fef0c7',
                                  border: `1px solid ${isHigh ? '#fecdca' : '#fedf89'}`,
                                  padding: '0.2mm 1.3mm',
                                  borderRadius: 3,
                                  lineHeight: 1.2
                                }}
                              >
                                Terendah #{focusRank + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{sub.to1}</td>
                        <td style={{ textAlign: 'center' }}>{sub.to2}{renderTrendArrow(sub.to2, sub.to1)}</td>
                        <td style={{ textAlign: 'center' }}>{sub.to3}{renderTrendArrow(sub.to3, sub.to2)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 10.5, color: badge.color }}>
                          {sub.to4}{renderTrendArrow(sub.to4, sub.to3)}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{sub.median}</td>
                        <td>
                          <div className="v2-progress-track">
                            <div className={`v2-progress-fill ${badge.fillClass}`} style={{ width: `${sub.fillPct}%` }} />
                            <div className="v2-progress-target-line" />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 10.5, color: badge.color }}>
                          {sub.gap >= 0 ? `+${sub.gap}` : sub.gap}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Separated Summary Table (Aligned Columns) */}
              <table className="profiling-print-table" style={{ marginTop: '1.8mm', marginBottom: 0, fontSize: 10 }}>
                <thead>
                  <tr>
                    <th style={{ width: '35%', background: '#edf5f9', color: '#0f172a' }}>Ringkasan 8 Subtes</th>
                    <th style={{ width: '7.5%', textAlign: 'center', background: '#edf5f9', color: '#334155' }}>TO 1</th>
                    <th style={{ width: '8%', textAlign: 'center', background: '#edf5f9', color: '#334155' }}>TO 2</th>
                    <th style={{ width: '8%', textAlign: 'center', background: '#edf5f9', color: '#334155' }}>TO 3</th>
                    <th style={{ width: '8.5%', textAlign: 'center', background: '#edf5f9', color: '#334155' }}>TO 4</th>
                    <th style={{ width: '8%', textAlign: 'center', background: '#edf5f9', color: '#334155' }}>Rata-rata</th>
                    <th style={{ width: '17%', textAlign: 'center', background: '#edf5f9', color: '#334155' }}>Posisi vs 600</th>
                    <th style={{ width: '8%', textAlign: 'center', background: '#edf5f9', color: '#334155' }}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>Rata-rata 8 subtes</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{avg1}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{avg2}{renderTrendArrow(avg2, avg1)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{avg3}{renderTrendArrow(avg3, avg2)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 10.5, color: avgBadge.color }}>{avg4}{renderTrendArrow(avg4, avg3)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#1078ca' }}>{avgAll}</td>
                    <td>
                      <div className="v2-progress-track">
                        <div className={`v2-progress-fill ${avgBadge.fillClass}`} style={{ width: `${avgFill}%` }} />
                        <div className="v2-progress-target-line" />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 10.5, color: avgBadge.color }}>
                      {avgGap >= 0 ? `+${avgGap}` : avgGap}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#475467' }}>Median 8 subtes</td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>{formatIndo(med1)}</td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>{formatIndo(med2)}{renderTrendArrow(med2, med1)}</td>
                    <td style={{ textAlign: 'center', color: '#475467' }}>{formatIndo(med3)}{renderTrendArrow(med3, med2)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 10.5, color: medBadge.color }}>{formatIndo(med4)}{renderTrendArrow(med4, med3)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#475467' }}>{formatIndo(medAll)}</td>
                    <td>
                      <div className="v2-progress-track">
                        <div className={`v2-progress-fill ${medBadge.fillClass}`} style={{ width: `${medFill}%` }} />
                        <div className="v2-progress-target-line" />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 10.5, color: medBadge.color }}>
                      {medGap >= 0 ? `+${formatIndo(medGap)}` : formatIndo(medGap)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '3.2mm', alignItems: 'center', marginTop: '1.5mm', fontSize: 9.2, color: '#334155', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#d92d20', display: 'inline-block', borderRadius: 2 }} /> Skor ≤ 509 (-91 ke bawah)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#f79009', display: 'inline-block', borderRadius: 2 }} /> Skor 510–569 (-31 s.d. -90)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#2e90fa', display: 'inline-block', borderRadius: 2 }} /> Skor 570–599 (-30 s.d. -1)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#12b76a', display: 'inline-block', borderRadius: 2 }} /> Tercapai (600+)
                </span>
              </div>
            </div>

            <footer className="profiling-print-footer">
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Dokumen Resmi Hasil Konsultasi Checkpoint 1</div>
              <div>Halaman 1 dari 2</div>
            </footer>
          </section>

          {/* ================= PAGE 2 ================= */}
          <section className="profiling-print-page" id="reportPage2">
            <header className="profiling-print-document-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1mm' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#1078ca', letterSpacing: 0.5 }}>
                  BRAIN ACADEMY BY RUANGGURU
                </span>
                <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700, letterSpacing: 0.3 }}>
                  DOKUMEN RESMI KONSULTASI SISWA &amp; ORANG TUA
                </span>
              </div>
              <div className="profiling-print-header">
                <div>
                  <h1 className="profiling-print-title">LAPORAN KONSULTASI CHECKPOINT 1</h1>
                  <p className="profiling-print-subtitle">
                    Peluang per jurusan, fokus drill soal, dan lembar kesepakatan bersama
                  </p>
                </div>
                <div className="profiling-print-pathway">{identity.name.toUpperCase()}</div>
              </div>
            </header>

            {/* 3. SKOR IRT TERBOBOT */}
            <div className="profiling-print-section" style={{ marginBottom: '2.5mm' }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>3.</span>Skor IRT Terbobot: Jarak ke Target Acuan Tiap Pilihan Jurusan</span>
              </h2>
              <table className="profiling-print-table" style={{ fontSize: 10 }}>
                <thead>
                  <tr>
                    <th style={{ width: '13%' }}>Pilihan</th>
                    <th style={{ width: '47%' }}>Program Studi &amp; Perguruan Tinggi</th>
                    <th style={{ width: '14%', textAlign: 'center' }}>
                      Target Acuan<br />
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#e0f2fe' }}>(Terbobot)</span>
                    </th>
                    <th style={{ width: '14%', textAlign: 'center' }}>
                      Skor Siswa<br />
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#e0f2fe' }}>(TO 4)</span>
                    </th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {activePrograms.map((prog, idx) => {
                    const gapColor = prog.gap >= 0 ? '#027a48' : prog.gap >= -70 ? '#b54708' : '#b42318';
                    return (
                      <tr key={`${prog.prodi}-${idx}`}>
                        <td style={{ fontWeight: 700, color: '#1078ca' }}>{prog.priority}</td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 10.5, color: '#0f172a' }}>{prog.prodi}</div>
                          <div style={{ color: '#475467', fontSize: 9.5 }}>{prog.univ}</div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 12, color: '#0f172a' }}>
                          {prog.targetScore}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 11, color: '#1078ca' }}>
                          {prog.weightedScore}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 11, color: gapColor }}>
                          {prog.gap >= 0 ? `+${prog.gap}` : prog.gap}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ fontSize: 9.2, color: '#475467', marginTop: '1mm', lineHeight: 1.38 }}>
                Skor terbobot dibandingkan hanya dengan target acuan jurusan yang sama. Target 600 per subtes adalah tahap pertama semester ini sebelum mengejar jarak kelolosan di atas.
              </div>
            </div>

            {/* 4. SUBTES PRIORITAS & DRILL */}
            <div className="profiling-print-section" style={{ marginBottom: '2.5mm' }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>4.</span>Subtes Prioritas: Aktivitas Drill Soal &amp; Arahan Pendampingan</span>
              </h2>
              <table className="profiling-print-table" style={{ fontSize: 9.8 }}>
                <thead>
                  <tr>
                    <th style={{ width: '23%' }}>Subtes</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>
                      TO 4 &amp;<br />
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#e0f2fe' }}>Selisih 600</span>
                    </th>
                    <th style={{ width: '15%', textAlign: 'center' }}>
                      Drill Soal<br />
                      <span style={{ fontSize: 9, fontWeight: 500, color: '#e0f2fe' }}>di Aplikasi RG</span>
                    </th>
                    <th style={{ width: '24%' }}>Topik yang Perlu Dibenahi</th>
                    <th style={{ width: '26%' }}>Arahan Kakak Asuh</th>
                  </tr>
                </thead>
                <tbody>
                  {prioritySubtests.map((sub) => {
                    const scoreColor = sub.gapNum >= 0 ? '#027a48' : sub.gapNum >= -30 ? '#175cd3' : '#b42318';
                    return (
                      <tr key={sub.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 10, color: '#0f172a' }}>{sub.name}</div>
                          <div style={{ fontSize: 9, color: '#475467', marginTop: '0.3mm' }}>{sub.priorityLabel}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: 11, color: scoreColor }}>{sub.toScore}</div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: scoreColor }}>{sub.gapText}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, color: sub.drillSessions === 0 ? '#b42318' : '#0f172a' }}>
                            {sub.drillSessions} sesi
                          </div>
                          <div style={{ fontSize: 9, color: sub.drillSessions === 0 ? '#b42318' : '#475467', marginTop: '0.3mm' }}>
                            {sub.rgQuestionsDone} soal · {sub.drillAccuracyPct}%
                          </div>
                        </td>
                        <td style={{ fontSize: 9.5, lineHeight: 1.35, color: '#1e293b' }}>
                          {sub.lowestTopics.slice(0, 2).map((t, i) => (
                            <div key={i}>• {t}</div>
                          ))}
                        </td>
                        <td style={{ fontSize: 9.5, lineHeight: 1.35, color: '#334155' }}>
                          {getDrillGuidance(sub)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {otherSummaryText && (
                <div style={{ fontSize: 9.2, color: '#475467', marginTop: '1mm' }}>
                  Subtes lainnya dipantau berkala menuju Tryout 5: {otherSummaryText}.
                </div>
              )}
            </div>

            {/* 5. RENCANA AKSI SAMPAI TRYOUT 5 */}
            <div className="profiling-print-section" style={{ marginBottom: '2.5mm' }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>5.</span>Rencana Aksi Belajar Menuju Tryout 5</span>
              </h2>
              <ol className="profiling-print-action-list">
                <li>
                  <strong>Drill Soal Harian Subtes Prioritas:</strong> Target minimal 15 soal/hari di aplikasi Ruangguru pada subtes dengan gap terbesar &amp; volume drill terendah.
                </li>
                <li>
                  <strong>Klinik PR Tatap Muka Cabang ({identity.branch}):</strong> Jadwalkan klinik bersama Master Teacher untuk membedah topik akurasi terendah pada TO terakhir.
                </li>
                <li>
                  <strong>Target Evaluasi Tryout 5:</strong> Tingkatkan rata-rata skor bertahap dari <strong>{to4Score}</strong> (TO 4) menuju target 600 dengan manajemen waktu per subtes.
                </li>
                <li>
                  <strong>Dukungan Belajar di Rumah:</strong> Orang tua mendampingi konsistensi jam belajar mandiri dan menjaga kondisi istirahat siswa menjelang Tryout berikutnya.
                </li>
              </ol>
            </div>

            {/* 6. LEMBAR KESEPAKATAN BERSAMA 3 PIHAK */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>6.</span>Lembar Kesepakatan Bersama 3 Pihak</span>
              </h2>
              <p className="profiling-print-agreement">
                &ldquo;Dengan menandatangani lembar ini, Siswa, Orang Tua / Wali, dan Kakak Asuh Brain Academy menyatakan telah berdiskusi bersama, memahami hasil evaluasi belajar 4 Tryout, dan bersepakat mengenai formulasi pilihan jurusan serta komitmen rencana tindak lanjut belajar Checkpoint 1 demi mencapai target PTN impian.&rdquo;
              </p>
              <div style={{ textAlign: 'right', fontSize: 9.8, color: '#334155', fontWeight: 600, marginTop: '1.2mm', marginBottom: '0.8mm' }}>
                {homeCity}, {identity.sessionDate}
              </div>

              <div className="profiling-print-signatures">
                <div>
                  <div className="profiling-print-signature-name">{identity.name}</div>
                  <div className="profiling-print-signature-role">Siswa</div>
                </div>
                <div>
                  <div className="profiling-print-signature-name">{identity.parentName.replace(/\s*\([^)]*\)/, '')}</div>
                  <div className="profiling-print-signature-role">Orang Tua / Wali Siswa</div>
                </div>
                <div>
                  <div className="profiling-print-signature-name">{identity.saName}</div>
                  <div className="profiling-print-signature-role">Kakak Asuh Brain Academy</div>
                </div>
              </div>
            </div>

            <footer className="profiling-print-footer">
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Dokumen Resmi Hasil Konsultasi Checkpoint 1</div>
              <div>Halaman 2 dari 2</div>
            </footer>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};
