import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, X, FileText, Check } from 'lucide-react';
import { downloadPdfFile } from '../utils/downloadPdf';
import {
  CHECKPOINT1_STUDENTS,
  Checkpoint1Student,
  ProgramChoice,
  SubtestV2
} from '../data/garudaData';
import {
  derivePrioritySubtestsForChoice1,
  DerivedPrioritySubtest
} from '../data/programCatalog';
import {
  DEFAULT_ENGINE_CONFIG,
  EngineRuleConfig,
  computeProgramPacing,
  classifySubtestPattern
} from '../utils/saGuidelineEngine';

interface V2PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Checkpoint1Student;
  programs?: ProgramChoice[];
  ruleConfig?: EngineRuleConfig;
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

function getStatusBadgeInfo(
  gap: number,
  isPriorityTop3: boolean = gap < 0
): { label: string; className: string; fillClass: string; color: string } {
  if (gap >= 0) return { label: 'Tercapai', className: 'badge-p-done', fillClass: 'priority-done', color: '#027a48' };
  if (isPriorityTop3) return { label: 'Prioritas perbaikan', className: 'badge-p-high', fillClass: 'priority-high', color: '#b42318' };
  return { label: 'Perlu penguatan', className: 'badge-p-med', fillClass: 'priority-med', color: '#b54708' };
}

function getDrillGuidance(sub: DerivedPrioritySubtest): string {
  if (sub.gapNum >= 0) {
    return 'Target subtes sudah terlampaui. Pertahankan konsistensi latihan & dorong margin di atas pesaing.';
  }
  if (sub.rgQuestionsDone === 0) {
    return 'Belum ada aktivitas drill di aplikasi. Mulai rutinitas drill bertahap & bedah topik dasar di Klinik PR.';
  }
  if (sub.rgQuestionsDone <= 10 && sub.gapNum <= -90) {
    return `Baru ${sub.rgQuestionsDone} soal di aplikasi. Tingkatkan frekuensi drill harian & ikuti Klinik PR tatap muka.`;
  }
  if (sub.toLatestNum >= 600 || sub.gapNum >= -30) {
    return 'Skor mendekati target Pilihan 1. Jaga ritme drill mingguan & fokus ketelitian pengerjaan.';
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
  programs,
  ruleConfig = DEFAULT_ENGINE_CONFIG
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activePrograms = programs && programs.length > 0 ? programs : student.targetPrograms;
  const { identity, subtests } = student;
  const prioritySubtests = derivePrioritySubtestsForChoice1(
    student,
    activePrograms[0],
    ruleConfig.thresholds.foundationScoreTarget
  );

  const sortedSubtests: SubtestV2[] = [...subtests].sort((a, b) => a.gap - b.gap || a.to4 - b.to4);
  const above600 = sortedSubtests.filter((s) => s.to4 >= 600);
  const below600 = sortedSubtests.filter((s) => s.to4 < 600);
  const lowest3 = below600.slice(0, 3);
  const top3WeakIds = lowest3.map((s) => s.id);
  const to4Score = identity.toScores[identity.toScores.length - 1] ?? 0;

  const med1 = computeMedian(subtests.map((s) => s.to1));
  const med2 = computeMedian(subtests.map((s) => s.to2));
  const med3 = computeMedian(subtests.map((s) => s.to3));
  const med4 = computeMedian(subtests.map((s) => s.to4));
  const medAll = computeMedian([med1, med2, med3, med4]);
  const medGap = med4 - 600;
  const medFill = Math.max(0, Math.min(100, ((med4 - 400) / 300) * 100));
  const medBadge = getStatusBadgeInfo(medGap, medGap <= -90);

  const otherSubtests = sortedSubtests.filter(
    (s) => !prioritySubtests.some((p) => p.id === s.id)
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
              background: downloadSuccess ? '#027a48' : '#398896',
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
                <span style={{ fontSize: 11, fontWeight: 800, color: '#245f5a', letterSpacing: 0.5 }}>
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
            <div className="profiling-print-section" style={{ marginBottom: '3.6mm' }}>
              <table className="profiling-print-table">
                <tbody>
                  <tr>
                    <td style={{ width: '17%', background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Nama Siswa</td>
                    <td style={{ width: '33%', fontWeight: 800, color: '#0f172a', fontSize: 10.5 }}>{identity.name}</td>
                    <td style={{ width: '17%', background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Asal Sekolah</td>
                    <td style={{ width: '33%' }}>{identity.school}</td>
                  </tr>
                  <tr>
                    <td style={{ background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Cabang / Kelas</td>
                    <td>{identity.branch} (12 SMA)</td>
                    <td style={{ background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Kakak Asuh (SA)</td>
                    <td>{identity.saName}</td>
                  </tr>
                  <tr>
                    <td style={{ background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Skor Reguler</td>
                    <td colSpan={3}>
                      <strong style={{ fontSize: 11, color: to4Score >= 600 ? '#027a48' : '#b42318' }}>
                        {to4Score}
                      </strong>{' '}
                      <span style={{ color: to4Score >= 600 ? '#027a48' : '#b42318', fontWeight: 700 }}>
                        (Skor Tryout Episode {identity.toScores.length || 4} Terakhir)
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
                padding: '2.4mm 3mm',
                marginBottom: '3.6mm'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4mm' }}>
                <strong style={{ fontSize: 10.5, color: '#0f172a' }}>Ringkasan Posisi Saat Ini (Berdasarkan TO {identity.toScores.length || 4})</strong>
                <span style={{ fontSize: 9.5, color: '#245f5a', fontWeight: 700 }}>
                  Fokus semester ini: seluruh subtes mencapai target dasar 600
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '0.82fr 1.18fr', gap: '2.4mm' }}>
                <div style={{ background: '#ffffff', border: '1px solid #a6f4c5', borderLeft: '3px solid #12b76a', borderRadius: 3, padding: '1.8mm 2.4mm', lineHeight: 1.42 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: '#027a48' }}>DI ATAS TARGET 600 (+)</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#027a48' }}>{above600.length} Subtes</span>
                  </div>
                  <div style={{ fontSize: 9.8, color: '#334155', marginTop: '0.6mm' }}>
                    {above600.length > 0
                      ? above600.map((s) => `${SHORT_CODE_MAP[s.id] || s.id.toUpperCase()} (${s.to4})`).join(' · ')
                      : 'Belum ada subtes mencapai 600 pada TO 4'}
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #fecdca', borderLeft: '3px solid #d92d20', borderRadius: 3, padding: '1.8mm 2.4mm', lineHeight: 1.42 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: '#b42318' }}>DI BAWAH TARGET 600 (-)</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#b42318' }}>{below600.length} Subtes</span>
                  </div>
                  <div style={{ fontSize: 9.8, color: '#334155', marginTop: '0.6mm' }}>
                    {lowest3.length > 0
                      ? `3 Terendah: ${lowest3.map((s) => `${SHORT_CODE_MAP[s.id] || s.name} (${s.to4})`).join(' · ')}`
                      : 'Seluruh subtes sudah mencapai batas 600'}
                  </div>
                </div>
              </div>
            </div>

            {/* 1. CARA MEMBACA DUA SISTEM SKOR DI LAPORAN INI */}
            <div className="profiling-print-section" style={{ marginBottom: '3.6mm' }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>1.</span>Cara Membaca Dua Sistem Skor di Laporan Ini</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.4mm', marginBottom: '1.6mm' }}>
                <div style={{ background: '#ffffff', border: '1px solid #a7d7dc', borderTop: '3px solid #58aebd', borderRadius: 4, padding: '2mm 2.4mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1mm' }}>
                    <span style={{ fontSize: 9.2, fontWeight: 800, background: '#e6f4f2', color: '#245f5a', border: '1px solid #a7d7dc', padding: '0.3mm 1.6mm', borderRadius: 3 }}>
                      SKOR IRT REGULER
                    </span>
                    <span style={{ fontSize: 9, color: '#245f5a', fontWeight: 700 }}>→ Bagian 2</span>
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a', marginBottom: '0.6mm' }}>
                    Nilai tiap subtes, sama untuk semua jurusan
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#334155', lineHeight: 1.42 }}>
                    Kemampuan murni per subtes. Nilainya tetap saat jurusan berganti; dipakai memantau target dasar 600.
                  </p>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #7c3aed', borderRadius: 4, padding: '2mm 2.4mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1mm' }}>
                    <span style={{ fontSize: 9.2, fontWeight: 800, background: '#f9f5ff', color: '#6941c6', border: '1px solid #e9d7fe', padding: '0.3mm 1.6mm', borderRadius: 3 }}>
                      SKOR IRT TERBOBOT
                    </span>
                    <span style={{ fontSize: 9, color: '#6941c6', fontWeight: 700 }}>→ Bagian 3 (Hal. 2)</span>
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a', marginBottom: '0.6mm' }}>
                    Nilai yang dihitung sesuai bobot jurusan
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#334155', lineHeight: 1.42 }}>
                    Dihitung ulang memakai bobot subtes tiap prodi, sehingga hasilnya berbeda untuk melihat jarak ke skor lolos.
                  </p>
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '3px solid #eab308', borderRadius: 3, padding: '1.8mm 2.4mm', fontSize: 10, color: '#713f12', lineHeight: 1.42 }}>
                <strong>Mengapa semua subtes dikejar ke 600?</strong> Tiap jurusan membobot subtes berbeda. Jika seluruh subtes mencapai 600, tidak ada subtes lemah yang menarik turun skor terbobot di pilihan mana pun.
              </div>
            </div>

            {/* 2. SKOR IRT REGULER: POSISI 8 SUBTES TERHADAP TARGET 600 */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>2.</span>Skor IRT Reguler: Posisi 8 Subtes Terhadap Target 600</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#245f5a', textTransform: 'none', letterSpacing: 0 }}>
                  Urut gap terdalam · Sorot hingga 3 terendah (&lt; 600)
                </span>
              </h2>

              <table className="profiling-print-table">
                <thead>
                  <tr>
                    <th style={{ width: '3.5%', textAlign: 'center' }}>#</th>
                    <th style={{ width: '24.5%' }}>Subtes UTBK</th>
                    <th style={{ width: '6.5%', textAlign: 'center' }}>
                      TO 1
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>30 Agu</div>
                    </th>
                    <th style={{ width: '7%', textAlign: 'center' }}>
                      TO 2
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>14 Sep</div>
                    </th>
                    <th style={{ width: '7%', textAlign: 'center' }}>
                      TO 3
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>28 Sep</div>
                    </th>
                    <th style={{ width: '7.5%', textAlign: 'center' }}>
                      TO 4
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>30 Okt</div>
                    </th>
                    <th style={{ width: '7%', textAlign: 'center' }}>Median</th>
                    <th style={{ width: '15.5%', textAlign: 'center' }}>Pola Tren</th>
                    <th style={{ width: '14%', textAlign: 'center' }}>
                      Posisi vs 600
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 600, marginTop: 2.5, color: '#edf7f8' }}>
                        <span>400</span><span>600</span><span>700</span>
                      </div>
                    </th>
                    <th style={{ width: '7.5%', textAlign: 'center' }}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubtests.map((sub, idx) => {
                    const focusRank = top3WeakIds.indexOf(sub.id);
                    const isFocus = focusRank !== -1;
                    const badge = getStatusBadgeInfo(sub.gap, isFocus);
                    const subPattern = classifySubtestPattern([sub.to1, sub.to2, sub.to3, sub.to4], ruleConfig);
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
                        <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4mm' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{sub.name}</span>
                            {isFocus && (
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: '#b42318',
                                  background: '#fee4e2',
                                  border: '1px solid #fecdca',
                                  padding: '0.2mm 1.2mm',
                                  borderRadius: 3,
                                  lineHeight: 1.2
                                }}
                              >
                                Prioritas perbaikan {focusRank + 1}
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
                        <td style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: subPattern.color }}>
                          {subPattern.label}
                        </td>
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

              {/* Separated Summary Table (Median 8 Subtes Saja) */}
              <table className="profiling-print-table" style={{ marginTop: '2.5mm', marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '28%', background: '#e6f4f2', color: '#245f5a' }}>Ringkasan 8 Subtes</th>
                    <th style={{ width: '6.5%', textAlign: 'center', background: '#e6f4f2', color: '#245f5a' }}>TO 1</th>
                    <th style={{ width: '7%', textAlign: 'center', background: '#e6f4f2', color: '#245f5a' }}>TO 2</th>
                    <th style={{ width: '7%', textAlign: 'center', background: '#e6f4f2', color: '#245f5a' }}>TO 3</th>
                    <th style={{ width: '7.5%', textAlign: 'center', background: '#e6f4f2', color: '#245f5a' }}>TO 4</th>
                    <th style={{ width: '7%', textAlign: 'center', background: '#e6f4f2', color: '#245f5a' }}>Median</th>
                    <th style={{ width: '15.5%', textAlign: 'center', background: '#e6f4f2', color: '#245f5a' }}>Pola Tren</th>
                    <th style={{ width: '14%', textAlign: 'center', background: '#e6f4f2', color: '#245f5a' }}>Posisi vs 600</th>
                    <th style={{ width: '7.5%', textAlign: 'center', background: '#e6f4f2', color: '#245f5a' }}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const medPattern = classifySubtestPattern([med1, med2, med3, med4], ruleConfig);
                    return (
                      <tr>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>Median 8 subtes</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#334155' }}>{formatIndo(med1)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#334155' }}>{formatIndo(med2)}{renderTrendArrow(med2, med1)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#334155' }}>{formatIndo(med3)}{renderTrendArrow(med3, med2)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 10.5, color: medBadge.color }}>{formatIndo(med4)}{renderTrendArrow(med4, med3)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 11, color: '#245f5a' }}>{formatIndo(medAll)}</td>
                        <td style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: medPattern.color }}>
                          {medPattern.label}
                        </td>
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
                    );
                  })()}
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '3.4mm', alignItems: 'center', marginTop: '2.5mm', fontSize: 9.2, color: '#334155', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#d92d20', display: 'inline-block', borderRadius: 2 }} /> Prioritas perbaikan (&lt; 600 · Terendah 1–3)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#f79009', display: 'inline-block', borderRadius: 2 }} /> Butuh penguatan (&lt; 600 di luar prioritas 1–3)
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
            <header className="profiling-print-running-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '2mm' }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: '#245f5a', letterSpacing: 0.5 }}>
                  BRAIN ACADEMY BY RUANGGURU
                </span>
                <span style={{ fontSize: 9.5, color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#334155' }}>
                  LAPORAN KONSULTASI CHECKPOINT 1
                </span>
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: '#475467' }}>
                {identity.name} <span style={{ color: '#94a3b8', margin: '0 1mm' }}>|</span> Halaman 2 dari 2
              </div>
            </header>

            {/* 3. SKOR IRT TERBOBOT */}
            <div className="profiling-print-section" style={{ marginBottom: '3.6mm' }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>3.</span>Skor IRT Terbobot: Jarak ke Target Acuan Tiap Pilihan Jurusan</span>
              </h2>
              <table className="profiling-print-table">
                <thead>
                  <tr>
                    <th style={{ width: '11%' }}>Pilihan</th>
                    <th style={{ width: '39%' }}>Program Studi &amp; Perguruan Tinggi</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>
                      Target Acuan
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>(Terbobot)</div>
                    </th>
                    <th style={{ width: '12%', textAlign: 'center' }}>
                      Skor Siswa
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>(TO {identity.toScores.length || 4} · Terbobot)</div>
                    </th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Selisih</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>
                      Target / TO
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>(Kejar dalam {ruleConfig.thresholds.remainingEpisodesToNextConsult} TO)</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activePrograms.map((prog, idx) => {
                    const gapColor = prog.gap >= 0 ? '#027a48' : prog.gap >= -70 ? '#b54708' : '#b42318';
                    const pacing = computeProgramPacing(prog.weightedScore, prog.targetScore, prog.gap, ruleConfig);
                    return (
                      <tr key={`${prog.prodi}-${idx}`}>
                        <td style={{ fontWeight: 700, color: '#245f5a' }}>{prog.priority}</td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 10.5, color: '#0f172a' }}>{prog.prodi}</div>
                          <div style={{ color: '#475467', fontSize: 9.5 }}>{prog.univ} · Keketatan {prog.tightness}</div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 11.5, color: '#0f172a' }}>
                          {prog.targetScore}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 11, color: '#245f5a' }}>
                          {prog.weightedScore}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 11, color: gapColor }}>
                          {prog.gap >= 0 ? `+${prog.gap}` : prog.gap}
                        </td>
                        <td style={{ textAlign: 'center', fontSize: 9.5 }}>
                          {pacing.isAchieved ? (
                            <span style={{ fontWeight: 700, color: '#027a48' }}>Target terlewati</span>
                          ) : (
                            <div>
                              <strong style={{ color: pacing.needsPlanB ? '#b42318' : '#245f5a' }}>
                                +{pacing.gainPerToNextConsult} poin/TO
                              </strong>
                              <div style={{ fontSize: 9, fontWeight: 700, color: pacing.needsPlanB ? '#b42318' : '#245f5a' }}>
                                {pacing.needsPlanB ? 'Berat · Siapkan Plan B' : 'Realistis dikejar'}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(() => {
                const highestProg = [...activePrograms].sort((a, b) => b.targetScore - a.targetScore)[0];
                const highestPacing = highestProg
                  ? computeProgramPacing(highestProg.weightedScore, highestProg.targetScore, highestProg.gap, ruleConfig)
                  : null;
                return (
                  <div style={{ fontSize: 9.2, color: '#334155', marginTop: '1.4mm', lineHeight: 1.42 }}>
                    {highestProg && highestPacing && (
                      <div style={{ marginBottom: '0.6mm' }}>
                        {highestPacing.isAchieved ? (
                          <span>
                            <strong>Acuan tertinggi ({highestProg.prodi} · {highestProg.univ}: {highestProg.targetScore})</strong> sudah terlewati — fokus perlebar margin di atas pesaing.
                          </span>
                        ) : (
                          <span>
                            <strong>Target TO {(identity.toScores.length || 4) + 1} (Acuan tertinggi — {highestProg.prodi}):</strong>{' '}
                            skor terbobot minimal <strong>≥ {highestPacing.nextToTargetScore}</strong> (+{highestPacing.gainPerToNextConsult} poin dari {highestProg.weightedScore}).
                          </span>
                        )}
                      </div>
                    )}
                    <span style={{ color: '#475467' }}>
                      Target Acuan adalah patokan kompetitif: fokus menuju konsultasi berikutnya adalah melewati batas acuan, lalu memaksimalkan margin di atas pesaing sampai UTBK.
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* 4. SUBTES PRIORITAS & DRILL (3 SUBTES ACUAN PILIHAN 1) */}
            <div className="profiling-print-section" style={{ marginBottom: '3.6mm' }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>4.</span>3 Subtes Prioritas (Acuan Pilihan 1): Drill Soal &amp; Arahan</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#245f5a', textTransform: 'none', letterSpacing: 0 }}>
                  Periode drill 3 bulan terakhir
                </span>
              </h2>
              <table className="profiling-print-table">
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Subtes</th>
                    <th style={{ width: '11%', textAlign: 'center' }}>
                      TO {identity.toScores.length || 4} &amp;
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>vs Target</div>
                    </th>
                    <th style={{ width: '13%', textAlign: 'center' }}>Pola Tren</th>
                    <th style={{ width: '13%', textAlign: 'center' }}>
                      Drill Soal
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>di Aplikasi RG</div>
                    </th>
                    <th style={{ width: '21%' }}>Topik yang Perlu Dibenahi</th>
                    <th style={{ width: '22%' }}>Arahan Kakak Asuh</th>
                  </tr>
                </thead>
                <tbody>
                  {prioritySubtests.map((sub) => {
                    const scoreColor =
                      sub.gapNum >= 0
                        ? '#027a48'
                        : sub.toLatestNum >= 600 || sub.gapNum >= -60
                        ? '#b54708'
                        : '#b42318';
                    const subRow = subtests.find((s) => s.id === sub.id);
                    const subPattern = subRow
                      ? classifySubtestPattern([subRow.to1, subRow.to2, subRow.to3, subRow.to4], ruleConfig)
                      : null;
                    return (
                      <tr key={sub.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 10, color: '#0f172a' }}>{sub.name}</div>
                          <div style={{ fontSize: 9, color: '#475467', marginTop: '0.3mm' }}>
                            {sub.priorityLabel} · Target {sub.targetScore}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: 11, color: scoreColor }}>{sub.toScore}</div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: scoreColor }}>{sub.gapText}</div>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: subPattern?.color || '#475467' }}>
                          {subPattern ? subPattern.label : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, color: sub.drillSessions === 0 ? '#b42318' : '#0f172a' }}>
                            {sub.drillSessions} sesi
                          </div>
                          <div style={{ fontSize: 9, color: sub.drillSessions === 0 ? '#b42318' : '#475467', marginTop: '0.3mm' }}>
                            {sub.rgQuestionsDone} soal · {sub.drillAccuracyPct}%
                          </div>
                        </td>
                        <td style={{ fontSize: 9.8, lineHeight: 1.42, color: '#1e293b' }}>
                          {sub.lowestTopics.slice(0, 2).map((t, i) => (
                            <div key={i}>• {t}</div>
                          ))}
                        </td>
                        <td style={{ fontSize: 9.8, lineHeight: 1.42, color: '#334155' }}>
                          {getDrillGuidance(sub)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {otherSummaryText && (
                <div style={{ fontSize: 9.2, color: '#475467', marginTop: '1.2mm' }}>
                  Subtes lainnya dipantau berkala menuju Tryout berikutnya: {otherSummaryText}.
                </div>
              )}
            </div>

            {/* 5. RENCANA AKSI SAMPAI TRYOUT 5 */}
            <div className="profiling-print-section" style={{ marginBottom: '3.6mm' }}>
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
