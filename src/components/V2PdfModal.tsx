import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, X, FileText, Check } from 'lucide-react';
import {
  CHECKPOINT1_STUDENTS,
  Checkpoint1Student,
  ProgramChoice,
  SubtestV2
} from '../data/garudaData';
import {
  derivePrioritySubtestsForChoice1,
  getStudentBaselinePrograms,
  matchCatalogProgram
} from '../data/programCatalog';
import { STUDENT_DRILL_DATA } from '../data/drillData';
import {
  DEFAULT_ENGINE_CONFIG,
  EngineRuleConfig,
  classifySubtestPattern,
  computeProgramPacing
} from '../utils/saGuidelineEngine';
import { sampleLowestTopics } from '../data/topicSampleData';
import { rankFor } from '../utils/positionSimulation';
import { trendSequenceLabel } from '../utils/trendLabel';
import { fmtTo, medianOfPresent, MIN_TO_FOR_MEDIAN, subtestScores } from '../utils/toHistory';
import { LATEST_TO_EPISODE } from '../data/garudaData';
import { ACTION_PLAN_COPY, drillTargetForRank, drillTotalForCount, achievedNextTarget, gapTierOf, gapTierTitle, type PriorityGoal } from '../utils/actionPlanCopy';
import { buildProdiToneMap } from '../utils/prodiColors';

interface V2PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Checkpoint1Student;
  programs?: ProgramChoice[];
  ruleConfig?: EngineRuleConfig;
}

// Standar 600 diperlakukan seperti KKM: semua subtes di bawah 600 berwarna merah.
function getStatusBadgeInfo(
  gap: number
): { label: string; className: string; fillClass: string; color: string } {
  if (gap >= 0) return { label: 'Tercapai', className: 'badge-p-done', fillClass: 'priority-done', color: '#027a48' };
  return { label: 'Perlu perbaikan', className: 'badge-p-high', fillClass: 'priority-high', color: '#b42318' };
}


function renderTrendArrow(curr: number, prev: number) {
  if (curr > prev) return <span style={{ fontSize: 9, color: '#027a48' }}> ▲</span>;
  if (curr < prev) return <span style={{ fontSize: 9, color: '#b42318' }}> ▼</span>;
  return null;
}

// Panah tren hanya bila kedua TO ada.
function arrowIfBoth(curr: number | null, prev: number | null) {
  return curr === null || prev === null ? null : renderTrendArrow(curr, prev);
}

function computeMedian(arr: number[]): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Angka di tabel halaman 2 dibulatkan (tanpa koma) agar mudah dibaca.
function formatIndo(num: number): string {
  return String(Math.round(num));
}

// Singkatan subtes untuk kalimat ringkas.
const SHORT_NAME: Record<string, string> = {
  pu: 'PU',
  pk: 'PK',
  pm: 'PM',
  lbi_a: 'LBI Saintek',
  lbi_s: 'LBI Soshum',
  lbe: 'LBING',
  pbm: 'PBM',
  ppu: 'PPU'
};

// Teks PDF (ringkas). Sementara di sini; pindahkan ke template /engine agar bisa diedit tim kesiswaan.
const PDF_COPY = {
  // Kalimat di bawah ini mengikuti draft tim kesiswaan (REVISI 6).
  why600:
    'Tujuannya agar tidak ada nilai subtes yang terlalu rendah dibandingkan yang lain. Sebab, satu nilai subtes yang rendah bisa memengaruhi nilai akhir, apa pun jurusan yang dipilih.',
  keketatanNote: [
    'Keketatan = daya tampung ÷ peminat.',
    'Daya tampung adalah jumlah kursi SNBT 2026.',
    'Peminat adalah jumlah pendaftar SNBT 2025.'
  ],
  planB: 'Siapkan jurusan cadangan bersama Kakak Asuh bila target belum tercapai pada konsultasi berikutnya.',
  ...ACTION_PLAN_COPY,
  // Cara belajar per rumpun subtes (ditulis sekali, tidak diulang di tiap baris).
  families: [
    { label: 'Penalaran', ids: ['pu', 'pk', 'pm'], text: 'Ulangi soal yang salah sampai benar dan pahami cara penyelesaiannya.' },
    { label: 'Literasi & bahasa', ids: ['lbi_a', 'lbi_s', 'lbe', 'pbm'], text: 'Telusuri tiap jawaban salah ke bukti dalam bacaan.' },
    { label: 'Pengetahuan umum', ids: ['ppu'], text: 'Perluas bacaan umum dan bahas materi yang sering salah.' }
  ] as { label: string; ids: string[]; text: string }[]
};

// Skala huruf PDF V2: dinaikkan agar nyaman dibaca orang tua (angka asli di kode = ukuran dasar, dikalikan skala; minimum 11 px).
const FONT_SCALE = 1.3;
const fs = (n: number): number => Math.max(11, Math.round(n * FONT_SCALE * 10) / 10);

export const V2PdfModal: React.FC<V2PdfModalProps> = ({
  isOpen,
  onClose,
  student = CHECKPOINT1_STUDENTS[0],
  programs,
  ruleConfig = DEFAULT_ENGINE_CONFIG
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activePrograms = programs && programs.length > 0 ? programs : getStudentBaselinePrograms(student);
  const { identity, subtests } = student;
  const prioritySubtests = derivePrioritySubtestsForChoice1(
    student,
    activePrograms[0],
    ruleConfig.thresholds.foundationScoreTarget
  );

  const sortedSubtests: SubtestV2[] = [...subtests].sort((a, b) => a.gap - b.gap || a.to4 - b.to4);
  const above600 = sortedSubtests.filter((s) => s.to4 >= 600);
  const below600 = sortedSubtests.filter((s) => s.to4 < 600);
  const to4Score = identity.toScores[identity.toScores.length - 1] ?? 0;

  // latestEp = jumlah TO yang diikuti siswa; latestEp = nomor episode TO terbaru (dipakai untuk label "TO N" dan "TO N+1").
  const toCount = identity.toScores.length || 4;
  const latestEp = LATEST_TO_EPISODE;
  const foundationTarget = ruleConfig.thresholds.foundationScoreTarget;

  // Label jurusan per subtes: subtes ini prioritas untuk jurusan apa (dikelompokkan per prodi, tanpa "S1"/"D4").
  const priorityProdisById = new Map<string, string[]>();
  const priorityGoalById = new Map<string, PriorityGoal>();
  activePrograms.forEach((prog) => {
    derivePrioritySubtestsForChoice1(student, prog, foundationTarget).forEach((p) => {
      const list = priorityProdisById.get(p.id) ?? [];
      const name = prog.prodi.replace(/^(S1|D4|D3)\s+/, '');
      if (!list.includes(name)) list.push(name);
      priorityProdisById.set(p.id, list);
      const cur = priorityGoalById.get(p.id);
      if (!cur || prog.targetScore > cur.target) priorityGoalById.set(p.id, { prodi: name, target: prog.targetScore, kurang: Math.max(0, -prog.gap) });
    });
  });

  // Median per TO (baris "Median 8 subtes").
  const med1 = medianOfPresent(subtests.map((x) => x.to1));
  const med2 = medianOfPresent(subtests.map((x) => x.to2));
  const med3 = medianOfPresent(subtests.map((x) => x.to3));
  const med4 = computeMedian(subtests.map((x) => x.to4));
  const medAll = toCount >= MIN_TO_FOR_MEDIAN ? computeMedian([med1, med2, med3, med4].filter((n): n is number => typeof n === 'number')) : null;
  const medSeries = [med1, med2, med3, med4].filter((n): n is number => typeof n === 'number');
  const medFill = Math.max(0, Math.min(100, ((med4 - 400) / 300) * 100));
  const medBadge = getStatusBadgeInfo(med4 - foundationTarget);

  // Target latihan bertingkat menurut urutan nilai TO terendah (20 / 15 / 12, sisanya 10; rumus sama dengan engine).
  const weakSubtests = sortedSubtests.filter((x) => x.to4 < foundationTarget);
  const drillTotal = drillTotalForCount(weakSubtests.length, ruleConfig.thresholds);
  const prodiTone = buildProdiToneMap(activePrograms.map((p) => p.prodi));
  const shortOf = (x: { id: string; name: string }) => SHORT_NAME[x.id] ?? x.name;

  // Status belajar per subtes: 2 selisih terbesar = fokus utama; sisanya menurut selisih dan arah TO terakhir.
  // Kelompok menurut besar selisih ke standar dasar: 0 = sudah tercapai (logika bersama dengan dashboard).
  const tierFor = (x: SubtestV2) => gapTierOf(x.to4, foundationTarget);
  // Hasil latihan (data drill): data prioritas bila ada, selain itu data contoh per siswa.
  const drillFor = (id: string): { questions: number; accuracy: number } | null => {
    const p = prioritySubtests.find((x) => x.id === id);
    if (p) return { questions: p.rgQuestionsDone, accuracy: p.drillAccuracyPct };
    const d = STUDENT_DRILL_DATA[student.id]?.[id];
    return d ? { questions: d.questions, accuracy: d.accuracyPct } : null;
  };
  // Topik prioritas berasal dari hasil TO per subtes. Data asli dipakai bila ada; selain itu data contoh prototipe.
  const topicsFor = (id: string): string[] =>
    (prioritySubtests.find((x) => x.id === id)?.lowestTopics.slice(0, 2) ?? sampleLowestTopics(student.id, id)).map((t) =>
      t.replace(/\s*\(\d+% benar\)/, '')
    );
  const actionRows = sortedSubtests.map((x) => ({
    id: x.id,
    name: x.name,
    to4: x.to4,
    next: Math.max(x.to4, foundationTarget),
    tier: tierFor(x),
    drill: drillFor(x.id),
    topics: topicsFor(x.id),
    drillTarget: x.to4 < foundationTarget ? drillTargetForRank(weakSubtests.findIndex((w) => w.id === x.id), ruleConfig.thresholds) : 0
  }));
  const rankById = new Map<string, number>(
    ([1, 0] as const).flatMap((t) => actionRows.filter((r) => r.tier === t)).map((r, i) => [r.id, i + 1] as [string, number])
  );
  const tierGroups = ([1, 0] as const)
    .map((t) => ({
      tier: t,
      title: gapTierTitle(t, foundationTarget),
      rows: actionRows.filter((r) => r.tier === t)
    }))
    .filter((g) => g.rows.length > 0);

  // ---- Action plan (halaman 3): tabel ringkas untuk subtes < 600, kartu untuk subtes yang sudah mencapai ----
  type ActionRow = (typeof actionRows)[number];
  const weakRows = actionRows.filter((r) => r.tier === 1);
  const achievedRows = actionRows.filter((r) => r.tier === 0);
  const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  const ACTION_GRID = '7mm 1.15fr 42mm 1.1fr 23mm';
  const histOf = (r: ActionRow) =>
    r.drill && r.drill.questions > 0 ? { text: `${r.drill.questions} soal · akurasi ${r.drill.accuracy}%`, none: false } : { text: 'Belum ada data', none: true };
  const rankBadge = (r: ActionRow) => (
    <span style={{ width: '6mm', height: '6mm', borderRadius: '50%', background: '#245f5a', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: fs(8.6), fontWeight: 800 }}>
      {rankById.get(r.id)}
    </span>
  );
  const renderGroupHeadPdf = (color: string, dot: string, title: string, sub: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2mm', marginTop: '3mm', marginBottom: '1.6mm' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.8mm', fontSize: fs(11), fontWeight: 800, color }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: dot, display: 'inline-block' }} />
        {title}
      </span>
      <span style={{ fontSize: fs(9), color: '#5b6b80' }}>{sub}</span>
    </div>
  );
  const renderScoreCell = (r: ActionRow) => {
    const weak = r.tier === 1;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.4mm', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: fs(12), fontWeight: 800, color: weak ? '#b42318' : '#245f5a', lineHeight: 1.1 }}>{r.to4}</span>
          <span style={{ fontSize: fs(9.2), color: '#64748b' }}>/ {foundationTarget}</span>
          <span style={{ fontFamily: MONO, fontSize: fs(9), fontWeight: 800, color: weak ? '#b42318' : '#245f5a', background: weak ? '#fef3f2' : '#ffffff', borderRadius: 4, padding: '0.2mm 1.8mm' }}>
            {weak ? `-${r.next - r.to4}` : `+${r.to4 - foundationTarget}`}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 6, background: weak ? '#e8edf2' : '#ffffff', overflow: 'hidden', marginTop: '1mm' }}>
          <div style={{ width: `${Math.min(100, Math.round((r.to4 / foundationTarget) * 100))}%`, height: '100%', borderRadius: 6, background: weak ? '#d92d20' : '#245f5a' }} />
        </div>
      </div>
    );
  };
  const renderWeakTable = () => (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: ACTION_GRID, columnGap: '2.6mm', alignItems: 'center', background: '#2d7684', color: '#ffffff', fontSize: fs(9.2), fontWeight: 700, padding: '1.8mm 3mm' }}>
        <span />
        <span>Subtes</span>
        <span>Nilai TO {latestEp}</span>
        <span>Fokus perbaikan materi</span>
        <span style={{ textAlign: 'center' }}>Target drill</span>
      </div>
      {weakRows.map((r) => {
        const h = histOf(r);
        return (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: ACTION_GRID, columnGap: '2.6mm', alignItems: 'center', padding: '1.9mm 3mm', borderTop: '1px solid #e2e8f0', breakInside: 'avoid' }}>
            {rankBadge(r)}
            <div>
              <div style={{ fontWeight: 800, color: '#245f5a', fontSize: fs(10.4), lineHeight: 1.25 }}>{r.name}</div>
              <div style={{ fontSize: fs(8.4), color: '#64748b' }}>Riwayat drill 3 bulan terakhir</div>
              <div style={{ fontSize: fs(9.4), fontWeight: 700, color: h.none ? '#b42318' : '#1d2939' }}>{h.text}</div>
            </div>
            {renderScoreCell(r)}
            <div style={{ fontSize: fs(9.6), lineHeight: 1.35, color: '#1d2939' }}>{r.topics.join(' · ')}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: fs(17), fontWeight: 800, color: '#245f5a', lineHeight: 1 }}>{r.drillTarget}</div>
              <div style={{ fontSize: fs(8.4), color: '#64748b', lineHeight: 1.25 }}>soal benar<br />per minggu</div>
            </div>
          </div>
        );
      })}
    </div>
  );
  const renderAchievedCard = (r: ActionRow) => {
    const h = histOf(r);
    return (
      <div key={r.id} style={{ background: '#e6f4f2', border: '1px solid #b9d9d5', borderRadius: 6, padding: '1.9mm 3mm', marginBottom: '1.6mm', display: 'grid', gridTemplateColumns: ACTION_GRID, columnGap: '2.6mm', alignItems: 'center', breakInside: 'avoid' }}>
        {rankBadge(r)}
        <div>
          <div style={{ fontWeight: 800, color: '#245f5a', fontSize: fs(10.4), lineHeight: 1.25 }}>{r.name}</div>
          <div style={{ fontSize: fs(8.4), color: '#64748b' }}>Riwayat drill 3 bulan terakhir</div>
          <div style={{ fontSize: fs(9.4), fontWeight: 700, color: h.none ? '#b42318' : '#1d2939' }}>{h.text}</div>
        </div>
        {renderScoreCell(r)}
        <div style={{ gridColumn: '4 / span 2', borderLeft: '1px solid #b9d9d5', paddingLeft: '3mm' }}>
          <div style={{ fontSize: fs(8.6), fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: '#245f5a' }}>Target berikutnya</div>
          <div style={{ fontSize: fs(9.8), fontWeight: 800, lineHeight: 1.35, color: '#0f172a' }}>{achievedNextTarget(priorityGoalById.get(r.id), foundationTarget)}</div>
        </div>
      </div>
    );
  };

  // Kesimpulan halaman 1.
  const toWordsEarly = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima'];
  const achievedPrograms = activePrograms.filter((p) => p.gap >= 0).length;
  const posisiLine =
    achievedPrograms === 0
      ? `Belum ada satu pun dari ${toWordsEarly[activePrograms.length] ?? activePrograms.length} pilihan jurusan yang nilainya mencapai target.`
      : `${achievedPrograms} dari ${activePrograms.length} pilihan jurusan nilainya sudah mencapai target.`;
  const focusSubs = weakSubtests.slice(0, 2);
  const aboveNames = above600.map(shortOf);
  const belowNames = below600.map(shortOf);
  const totalSubtes = sortedSubtests.length;
  const joinNames = (names: string[]) =>
    names.length <= 1
      ? names.join('')
      : names.length === 2
        ? `${names[0]} dan ${names[1]}`
        : `${names.slice(0, -1).join(', ')}, dan ${names[names.length - 1]}`;
  const bigGapSubs = weakSubtests.filter((x) => gapTierOf(x.to4, foundationTarget) === 1);
  const focusMain = (bigGapSubs.length > 0 ? bigGapSubs : weakSubtests.slice(0, 2)).slice(0, 3).map(shortOf);
  const countLine = `Saat ini, ${below600.length} dari ${totalSubtes} subtes nilainya masih di bawah ${foundationTarget}.`;
  const subtesLine =
    below600.length === 0
      ? `Semua ${totalSubtes} subtes sudah mencapai ${foundationTarget}. Fokus utama saat ini adalah menjaga semuanya agar tidak kembali menurun.`
      : `Fokus utama saat ini adalah memperbaiki ${joinNames(focusMain)}, sambil menjaga subtes lain agar ${toCount === 1 ? 'tetap terjaga' : 'tidak kembali menurun'}.`;
  // Plan B: tampil bila belum ada pilihan jurusan yang mencapai target acuan.
  const needsPlanBNote = activePrograms.length > 0 && activePrograms.every((p) => p.gap < 0);

  // Rencana tindak lanjut halaman 3 (satu kalimat per butir).
  const programTargets = activePrograms
    .map((p) => {
      const pacing = computeProgramPacing(p.weightedScore, p.targetScore, p.gap, ruleConfig);
      return `Pilihan ${p.priority.replace(/\D+/g, '') || p.priority} ${pacing.isAchieved ? 'terlewati' : `≥ ${pacing.nextToTargetScore}`}`;
    })
    .join(' · ');
  const firstName = identity.name.split(' ')[0];
  const rencanaItems: { title: string; text: string; bullets?: { label: string; text: string }[] }[] = [
    {
      title: 'Latihan mingguan',
      text:
        weakSubtests.length > 0
          ? `Minimal ${drillTotal} soal benar per minggu di aplikasi Ruangguru: ${ruleConfig.thresholds.drillRank1}, ${ruleConfig.thresholds.drillRank2}, dan ${ruleConfig.thresholds.drillRank3} soal benar untuk tiga subtes terendah, ${ruleConfig.thresholds.minDrillPerSubtest} untuk subtes lainnya.`
          : 'Pertahankan konsistensi latihan mingguan di aplikasi Ruangguru.'
    },
    {
      title: `Target Tryout ${latestEp + 1}`,
      text: `${weakSubtests.length > 0 ? `Semua subtes minimal ${foundationTarget}.` : `Pertahankan semua subtes di atas ${foundationTarget}.`} Nilai jurusan: ${programTargets}.`
    },
    ...(needsPlanBNote ? [{ title: 'Plan B', text: PDF_COPY.planB }] : []),
    {
      title: 'Dukungan Orang Tua',
      text: `Dampingi proses belajar ${firstName}`,
      bullets: [
        { label: 'Setiap hari', text: `Berikan dukungan kepada ${firstName} agar terbiasa belajar secara mandiri di rumah dan tetap memiliki waktu istirahat yang cukup.` },
        {
          label: 'Setiap akhir pekan',
          text:
            weakSubtests.length > 0
              ? `Luangkan waktu untuk mengevaluasi progres belajar ${firstName} melalui aplikasi Ruangguru. Dukung ${firstName} dalam mencapai target ${drillTotal} soal benar setiap minggu, sesuai pembagian target masing-masing subtes.`
              : `Luangkan waktu untuk mengevaluasi progres belajar ${firstName} melalui aplikasi Ruangguru. Dukung ${firstName} agar tetap konsisten berlatih setiap minggu.`
        },
        { label: 'Jika target belum tercapai', text: `Ajak ${firstName} berdiskusi mengenai kesulitan yang dialami, berikan motivasi, dan komunikasikan perkembangannya kepada Kakak Asuh.` }
      ] as { label: string; text: string }[]
    }
  ];

  const homeCity = identity.branch.split('-')[0].trim();

  const renderSubHead = (no: string, title: string) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '1.6mm',
        fontSize: fs(10.4),
        fontWeight: 800,
        color: '#245f5a',
        borderBottom: '1px solid #cbd5e1',
        paddingBottom: '0.5mm',
        margin: '0 0 1.6mm'
      }}
    >
      {no && <span style={{ color: '#58aebd' }}>{no}</span>}
      <span>{title}</span>
    </div>
  );

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

  // Download = cetak halaman laporan yang tampil ke "Save as PDF". Judul dokumen diatur sementara
  // supaya nama file hasil simpan sesuai nama siswa, dan isinya selalu sama dengan preview.
  const handleDownload = () => {
    const safeName = identity.name.replace(/\s+/g, '_');
    const originalTitle = document.title;
    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    document.title = `Laporan_Konsultasi_Checkpoint_1_${safeName}`;
    window.addEventListener('afterprint', restoreTitle);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 6000);
    window.print();
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
          <span className="pdf-modal-badge">A4 • 4 Halaman</span>
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
            title="Buka dialog cetak, lalu pilih 'Save as PDF' / 'Simpan sebagai PDF'"
            style={{
              background: downloadSuccess ? '#027a48' : '#398896',
              color: '#ffffff',
              transition: 'background 0.2s ease'
            }}
          >
            {downloadSuccess ? <Check size={15} /> : <Download size={15} />}
            {downloadSuccess ? "Pilih 'Save as PDF'" : 'Download PDF'}
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
          <section className="profiling-print-page profiling-print-page--v2" id="reportPage1">
            {/* Kop Dokumen */}
            <header className="profiling-print-document-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1mm' }}>
                <span style={{ fontSize: fs(11), fontWeight: 800, color: '#245f5a', letterSpacing: 0.5 }}>
                  BRAIN ACADEMY BY RUANGGURU
                </span>
                <span style={{ fontSize: fs(9), color: '#64748b', fontWeight: 700, letterSpacing: 0.3 }}>
                  DOKUMEN RESMI KONSULTASI SISWA &amp; ORANG TUA
                </span>
              </div>
              <div className="profiling-print-header">
                <div>
                  <h1 className="profiling-print-title">LAPORAN KONSULTASI CHECKPOINT 1</h1>
                  <p className="profiling-print-subtitle">
                    Evaluasi Perkembangan Belajar &amp; Persiapan UTBK 2026/2027
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
                    <td style={{ width: '17%', background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Nama siswa</td>
                    <td style={{ width: '33%', fontWeight: 800, color: '#0f172a', fontSize: fs(10.5) }}>{identity.name}</td>
                    <td style={{ width: '17%', background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Asal sekolah</td>
                    <td style={{ width: '33%' }}>{identity.school}</td>
                  </tr>
                  <tr>
                    <td style={{ background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Cabang / kelas</td>
                    <td>{identity.branch} (12 SMA)</td>
                    <td style={{ background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Kakak asuh</td>
                    <td>{identity.saName}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 1. POSISI SAAT INI */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span>Perbandingan Pilihan Jurusan</span>
              </h2>
              {renderSubHead('', `Evaluasi Skor TO UTBK Regular Episode ${latestEp} terhadap Pilihan Jurusan (menggunakan sistem skoring IRT Pembobotan)`)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8mm' }}>
                {activePrograms.map((prog, idx) => {
                  const gapColor = prog.gap >= 0 ? '#027a48' : '#b42318';
                  const gapBg = prog.gap >= 0 ? '#ecfdf3' : '#fef3f2';
                  const pacing = computeProgramPacing(prog.weightedScore, prog.targetScore, prog.gap, ruleConfig);
                  const cat = matchCatalogProgram(prog);
                  const participants = cat?.participantsCount ?? 0;
                  const quota = cat?.quota2026 ?? 0;
                  const rank = participants > 0 ? rankFor(student.id, cat?.id, prog.weightedScore, prog.targetScore, participants) : 0;
                  const fill = Math.max(0, Math.min(100, Math.round((prog.weightedScore / Math.max(1, prog.targetScore)) * 100)));
                  const capStyle: React.CSSProperties = { fontSize: fs(8.2), fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: '#245f5a' };
                  return (
                    <div key={`${prog.prodi}-${idx}`} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '2.6mm 3.7mm', background: '#ffffff', breakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '3mm', paddingBottom: '1.6mm', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', minWidth: 0 }}>
                          <span style={{ width: '5.4mm', height: '5.4mm', borderRadius: '50%', background: prodiTone(prog.prodi.replace(/^(S1|D4|D3)\s+/, '')).text, color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: fs(8.6), fontWeight: 800, flexShrink: 0 }}>
                            {prog.priority.replace(/\D+/g, '') || prog.priority}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: fs(10.6), color: '#0f172a', lineHeight: 1.25 }}>{prog.prodi}</div>
                            <div style={{ fontSize: fs(9.6), color: '#5b6b80', lineHeight: 1.3 }}>{prog.univ}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: fs(8.2), color: '#475467', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {cat ? `Peminat ${cat.applicants2025.toLocaleString('id-ID')} · ` : ''}Keketatan {prog.tightness}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '3.4mm', marginTop: '1.8mm', alignItems: 'stretch' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={capStyle}>Nilai terbobot TO {latestEp} (IRT) vs target</span>
                            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: fs(9.4), fontWeight: 800, color: gapColor, background: gapBg, borderRadius: 4, padding: '0.5mm 2.4mm' }}>
                              Selisih {prog.gap >= 0 ? `+${prog.gap}` : prog.gap}
                            </span>
                          </div>
                          <div style={{ marginTop: '0.8mm' }}>
                            <strong style={{ fontSize: fs(15), color: '#245f5a', lineHeight: 1.1 }}>{prog.weightedScore}</strong>
                            <span style={{ fontSize: fs(9.4), color: '#475467' }}> dari target jurusan <strong style={{ color: '#0f172a' }}>{prog.targetScore}</strong></span>
                          </div>
                          <div style={{ height: 5, borderRadius: 5, background: '#e8edf2', overflow: 'hidden', marginTop: '1mm' }}>
                            <div style={{ width: `${fill}%`, height: '100%', background: '#245f5a', borderRadius: 5 }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1.4mm', fontSize: fs(9.2), color: '#475467' }}>
                            <span>Peringkat TO {latestEp} (prodi &amp; kampus sama)</span>
                            {participants > 0 ? (
                              <span>
                                <strong style={{ color: rank > quota ? '#b42318' : '#027a48', fontSize: fs(9.8) }}>{rank}</strong> dari {participants} (daya tampung {quota})
                              </span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </div>
                        <div style={{ background: '#e6f4f2', borderRadius: 3, padding: '1.6mm 2.6mm', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div style={{ ...capStyle, color: '#245f5a' }}>Target berikutnya</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1mm', paddingBottom: '1mm', borderBottom: '1px solid #c4dfdb' }}>
                            <span style={{ fontSize: fs(9.2), color: '#334155' }}>Target Nilai TO {latestEp + 1}</span>
                            <strong style={{ fontSize: fs(13), color: '#245f5a' }}>{pacing.isAchieved ? 'Terlewati' : `≥ ${pacing.nextToTargetScore}`}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1mm' }}>
                            <span style={{ fontSize: fs(9.2), color: '#334155' }}>Kenaikan per TO</span>
                            <strong style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: fs(9.2), color: '#0f172a' }}>{pacing.isAchieved ? '—' : `+${pacing.gainPerToNextConsult} poin/TO`}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: '#f2f8f7', borderLeft: '3px solid #58aebd', borderRadius: 3, padding: '1.3mm 2.6mm', marginTop: '2.4mm', fontSize: fs(10), color: '#0f172a', lineHeight: 1.45 }}>
                <strong style={{ color: '#245f5a' }}>Kesimpulan.</strong> {posisiLine}
              </div>
            </div>

            <footer className="profiling-print-footer">
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Konsultasi Checkpoint 1 • Target bukan jaminan kelulusan SNPMB</div>
              <div style={{ fontWeight: 700 }}>HALAMAN 1 DARI 4</div>
            </footer>
          </section>

          {/* ================= PAGE 2 ================= */}
          <section className="profiling-print-page profiling-print-page--v2" id="reportPage2">
            <header className="profiling-print-running-header">
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#245f5a', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                BRAIN ACADEMY BY RUANGGURU
              </span>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5b6b80', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
                LAPORAN KONSULTASI CHECKPOINT 1 · {identity.name.toUpperCase()}
              </div>
            </header>

            {/* 2. BREAKDOWN PER SUBTES */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span>Breakdown per Subtes</span>
              </h2>
              <div className="profiling-print-section-sub" style={{ color: '#245f5a', fontWeight: 700, fontSize: fs(9.8) }}>
                Kenapa semua subtes ditargetkan mencapai {foundationTarget}? {PDF_COPY.why600} <span>{countLine}</span>
              </div>
              <table className="profiling-print-table profiling-print-table--tight">
                <thead>
                  <tr>
                    <th style={{ width: '4%', textAlign: 'center' }}>#</th>
                    <th style={{ width: '41%' }}>Subtes UTBK<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>{toCount === 1 ? 'dan hasil TO terbaru' : `dan tren ${toCount} TO terakhir`}</div></th>
                    <th style={{ width: '9%', textAlign: 'center' }}>TO 1<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2, whiteSpace: 'nowrap' }}>30 Agu</div></th>
                    <th style={{ width: '9%', textAlign: 'center' }}>TO 2<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2, whiteSpace: 'nowrap' }}>14 Sep</div></th>
                    <th style={{ width: '9%', textAlign: 'center' }}>TO 3<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2, whiteSpace: 'nowrap' }}>28 Sep</div></th>
                    <th style={{ width: '19%', textAlign: 'center' }}>TO {latestEp} · 30 Okt<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>garis hitam = {foundationTarget}</div></th>
                    <th style={{ width: '9%', textAlign: 'center' }}>Median<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>{toCount} TO</div></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubtests.map((sub, idx) => {
                    const badge = getStatusBadgeInfo(sub.gap);
                    return (
                      <tr key={sub.id}>
                        <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#245f5a', lineHeight: 1.3 }}>{sub.name}</div>
                          <div style={{ fontSize: fs(9), color: '#5b6b80', lineHeight: 1.35 }}>{subtestScores(sub).length >= 2 ? trendSequenceLabel(subtestScores(sub)) : 'Belum ada tren (baru 1 TO)'}</div>
                          {(priorityProdisById.get(sub.id) ?? []).length > 0 && (
                            <div style={{ display: 'flex', gap: '1mm', flexWrap: 'wrap', marginTop: '0.5mm' }}>
                              {(priorityProdisById.get(sub.id) ?? []).map((n) => {
                                const tone = prodiTone(n);
                                return (
                                  <span key={n} style={{ fontSize: fs(9), fontWeight: 700, color: tone.text, background: tone.bg, border: `1px solid ${tone.border}`, padding: '0.2mm 1.4mm', borderRadius: 3, lineHeight: 1.2 }}>{n}</span>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', color: sub.to1 === null ? '#94a3b8' : undefined }}>{fmtTo(sub.to1)}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap', color: sub.to2 === null ? '#94a3b8' : undefined }}>{fmtTo(sub.to2)}{arrowIfBoth(sub.to2, sub.to1)}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap', color: sub.to3 === null ? '#94a3b8' : undefined }}>{fmtTo(sub.to3)}{arrowIfBoth(sub.to3, sub.to2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: fs(9.6), color: badge.color, lineHeight: 1.2 }}>{sub.to4}{arrowIfBoth(sub.to4, sub.to3)}</div>
                          <div className="v2-progress-track" style={{ marginTop: '0.6mm', height: 6, maxWidth: '22mm', marginLeft: 'auto', marginRight: 'auto' }}>
                            <div className={`v2-progress-fill ${badge.fillClass}`} style={{ width: `${sub.fillPct}%` }} />
                            <div className="v2-progress-target-line" />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: subtestScores(sub).length < MIN_TO_FOR_MEDIAN ? '#94a3b8' : undefined }}>{subtestScores(sub).length >= MIN_TO_FOR_MEDIAN ? formatIndo(Number(String(sub.median).replace(',', '.'))) : '–'}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#e6f4f2' }}>
                    <td />
                    <td>
                      <div style={{ fontWeight: 800, color: '#245f5a' }}>Median 8 subtes</div>
                      <div style={{ fontSize: fs(9), color: '#5b6b80' }}>{medSeries.length >= 2 ? trendSequenceLabel(medSeries) : 'Belum ada tren (baru 1 TO)'}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: med1 === null ? '#94a3b8' : undefined }}>{med1 === null ? '–' : formatIndo(med1)}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: med2 === null ? '#94a3b8' : undefined }}>{med2 === null ? '–' : formatIndo(med2)}{arrowIfBoth(med2, med1)}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600, color: med3 === null ? '#94a3b8' : undefined }}>{med3 === null ? '–' : formatIndo(med3)}{arrowIfBoth(med3, med2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: fs(9.6), color: medBadge.color, lineHeight: 1.2 }}>{formatIndo(med4)}{arrowIfBoth(med4, med3)}</div>
                      <div className="v2-progress-track" style={{ marginTop: '0.6mm', height: 6, maxWidth: '22mm', marginLeft: 'auto', marginRight: 'auto' }}>
                        <div className={`v2-progress-fill ${medBadge.fillClass}`} style={{ width: `${medFill}%` }} />
                        <div className="v2-progress-target-line" />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#245f5a' }}>{medAll === null ? '–' : formatIndo(medAll)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '3.4mm', alignItems: 'center', marginTop: '1.8mm', fontSize: fs(9.2), color: '#334155', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#d92d20', display: 'inline-block', borderRadius: 9 }} /> Di bawah {foundationTarget}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#12b76a', display: 'inline-block', borderRadius: 9 }} /> Tercapai ({foundationTarget}+)
                </span>
                {priorityProdisById.size > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.4mm', color: '#475467', fontWeight: 600 }}>
                    {Array.from(new Set(activePrograms.map((p) => p.prodi.replace(/^(S1|D4|D3)\s+/, '')))).filter((n) => [...priorityProdisById.values()].some((l) => l.includes(n))).map((n) => {
                      const tone = prodiTone(n);
                      return (
                        <span key={n} style={{ fontSize: fs(9), fontWeight: 700, color: tone.text, background: tone.bg, border: `1px solid ${tone.border}`, padding: '0.2mm 1.4mm', borderRadius: 3, lineHeight: 1.2 }}>{n}</span>
                      );
                    })}
                    subtes prioritas untuk jurusan tersebut
                  </span>
                )}
              </div>
              <div style={{ background: '#f2f8f7', borderLeft: '3px solid #58aebd', borderRadius: 3, padding: '1.3mm 2.6mm', marginTop: '1.6mm', fontSize: fs(10), color: '#0f172a', lineHeight: 1.45 }}>
                <strong style={{ color: '#245f5a' }}>Kesimpulan.</strong> {subtesLine}
              </div>
            </div>

            <footer className="profiling-print-footer">
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Konsultasi Checkpoint 1 • Target bukan jaminan kelulusan SNPMB</div>
              <div style={{ fontWeight: 700 }}>HALAMAN 2 DARI 4</div>
            </footer>
          </section>

          {/* ================= PAGE 3 ================= */}
          <section className="profiling-print-page profiling-print-page--v2" id="reportPage3">
            <header className="profiling-print-running-header">
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#245f5a', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                BRAIN ACADEMY BY RUANGGURU
              </span>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5b6b80', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
                LAPORAN KONSULTASI CHECKPOINT 1 · {identity.name.toUpperCase()}
              </div>
            </header>

            {/* 2. ACTION PLAN: TARGET LATIHAN SOAL */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span>Action Plan: Target Drill Soal</span>
              </h2>
              <div className="profiling-print-section-sub">Target latihan mingguan untuk menutup selisih nilai di setiap subtes.</div>
              {weakSubtests.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', columnGap: '5mm', background: '#e6f4f2', borderRadius: 6, padding: '2.4mm 3.8mm', marginBottom: '1mm' }}>
                  <div>
                    <div style={{ fontSize: fs(8.6), fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: '#245f5a' }}>Target drill mingguan</div>
                    <div style={{ fontSize: fs(10), color: '#334155', lineHeight: 1.4 }}>
                      Target per minggu: <strong style={{ color: '#0f172a' }}>{ruleConfig.thresholds.drillRank1}, {ruleConfig.thresholds.drillRank2}, dan {ruleConfig.thresholds.drillRank3} soal benar</strong> untuk tiga subtes terendah, <strong style={{ color: '#0f172a' }}>{ruleConfig.thresholds.minDrillPerSubtest}</strong> untuk subtes lainnya.
                    </div>
                  </div>
                  <div style={{ borderLeft: '1px solid #b7d9d4', paddingLeft: '5mm', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: fs(8.6), fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: '#245f5a' }}>Total target</div>
                    <div><span style={{ fontSize: fs(21), fontWeight: 800, color: '#245f5a', lineHeight: 1.1 }}>{drillTotal}</span><span style={{ fontSize: fs(9.6), color: '#334155' }}> soal benar/minggu</span></div>
                  </div>
                </div>
              )}

              {weakRows.length > 0 && (
                <>
                  {renderGroupHeadPdf('#b42318', '#d92d20', `Belum mencapai ${foundationTarget}`, `urut dari nilai terendah · ${weakRows.length} subtes`)}
                  {renderWeakTable()}
                </>
              )}
              {achievedRows.length > 0 && (
                <>
                  {renderGroupHeadPdf('#027a48', '#12b76a', `Sudah mencapai ≥ ${foundationTarget}`, `${achievedRows.length} subtes`)}
                  {achievedRows.map((r) => renderAchievedCard(r))}
                  <div style={{ fontSize: fs(9.4), color: '#334155', lineHeight: 1.45 }}>{ACTION_PLAN_COPY.achievedNote}</div>
                </>
              )}
            </div>

            <footer className="profiling-print-footer">
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Konsultasi Checkpoint 1 • Target bukan jaminan kelulusan SNPMB</div>
              <div style={{ fontWeight: 700 }}>HALAMAN 3 DARI 4</div>
            </footer>
          </section>

          {/* ================= PAGE 4 ================= */}
          <section className="profiling-print-page profiling-print-page--v2" id="reportPage4">
            <header className="profiling-print-running-header">
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#245f5a', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                BRAIN ACADEMY BY RUANGGURU
              </span>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5b6b80', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
                LAPORAN KONSULTASI CHECKPOINT 1 · {identity.name.toUpperCase()}
              </div>
            </header>


            {/* 3. RENCANA TINDAK LANJUT */}
            <div className="profiling-print-section" style={{ marginBottom: '3.6mm' }}>
              <h2 className="profiling-print-section-title">
                <span>Rencana Tindak Lanjut Menuju Tryout {latestEp + 1}</span>
              </h2>
              <div className="profiling-print-section-sub">{toWordsEarly[rencanaItems.length] ? `${toWordsEarly[rencanaItems.length][0].toUpperCase()}${toWordsEarly[rencanaItems.length].slice(1)}` : rencanaItems.length} langkah yang disepakati untuk persiapan TO {latestEp + 1}.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
                {rencanaItems.map((item, i) => (
                  <div key={item.title} style={{ display: 'grid', gridTemplateColumns: '7mm 1fr', columnGap: '3mm', alignItems: 'start', background: '#f2f8f7', borderRadius: 6, padding: '2.4mm 3.4mm', breakInside: 'avoid' }}>
                    <span style={{ width: '6.4mm', height: '6.4mm', borderRadius: '50%', background: '#245f5a', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: fs(9), fontWeight: 800 }}>{i + 1}</span>
                    <div style={{ fontSize: fs(10.2), color: '#1d2939', lineHeight: 1.45 }}>
                      {item.bullets ? (
                        <>
                          <strong style={{ color: '#245f5a' }}>{item.title}: {item.text}</strong>
                          <ul style={{ margin: '1mm 0 0', paddingLeft: '4.4mm' }}>
                            {item.bullets.map((b) => (
                              <li key={b.label} style={{ marginBottom: '0.8mm' }}><strong style={{ color: '#245f5a' }}>{b.label}:</strong> {b.text}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <>
                          <strong style={{ color: '#245f5a' }}>{item.title}.</strong> {item.text}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. LEMBAR KESEPAKATAN BERSAMA 3 PIHAK */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span>Lembar Kesepakatan Bersama 3 Pihak</span>
              </h2>
              <p className="profiling-print-agreement">
                &ldquo;Dengan menandatangani lembar kesepakatan ini, Siswa, Orang Tua/Wali, dan Kakak Asuh Brain Academy menyatakan telah berdiskusi dan memahami hasil evaluasi belajar Tryout, serta menyepakati pilihan jurusan dan rencana tindak lanjut pembelajaran melalui program Checkpoint 1 sebagai upaya bersama dalam mencapai target Perguruan Tinggi Negeri (PTN) impian.&rdquo;
              </p>
              <div style={{ textAlign: 'right', fontSize: fs(9.8), color: '#334155', fontWeight: 600, marginTop: '1.2mm', marginBottom: '0.8mm' }}>
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
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Konsultasi Checkpoint 1 • Target bukan jaminan kelulusan SNPMB</div>
              <div style={{ fontWeight: 700 }}>HALAMAN 4 DARI 4</div>
            </footer>
          </section>

        </div>
      </div>
    </div>,
    document.body
  );
};
