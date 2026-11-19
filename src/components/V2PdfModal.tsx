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
    'Tujuannya agar tidak ada nilai subtes yang terlalu rendah dibandingkan yang lain. Sebab, satu nilai subtes yang rendah bisa memengaruhi skor akhir, apa pun jurusan yang dipilih.',
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

  const toCount = identity.toScores.length || 4;
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
  const med1 = computeMedian(subtests.map((x) => x.to1));
  const med2 = computeMedian(subtests.map((x) => x.to2));
  const med3 = computeMedian(subtests.map((x) => x.to3));
  const med4 = computeMedian(subtests.map((x) => x.to4));
  const medAll = computeMedian([med1, med2, med3, med4]);
  const medFill = Math.max(0, Math.min(100, ((med4 - 400) / 300) * 100));
  const medBadge = getStatusBadgeInfo(med4 - foundationTarget);
  const medPattern = classifySubtestPattern([med1, med2, med3, med4], ruleConfig);

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

  // ---- Action plan: kartu per subtes, dibagi otomatis ke halaman 3 dan 4 bila tidak muat ----
  type TierGroup = (typeof tierGroups)[number];
  type ActionRow = (typeof actionRows)[number];
  type FlowItem = { key: string; g: TierGroup; r: ActionRow; first: boolean; est: number };
  const tierTone = (t: number) =>
    t === 1
      ? { dot: '#d92d20', text: '#b42318', pillBg: '#fef3f2' }
      : { dot: '#12b76a', text: '#027a48', pillBg: '#ecfdf3' };
  const groupFamiliesFor = (g: TierGroup) =>
    PDF_COPY.families
      .map((fam) => ({ ...fam, names: g.rows.filter((r) => fam.ids.includes(r.id)).map((r) => shortOf(r)) }))
      .filter((fam) => fam.names.length > 0);
  // Perkiraan tinggi (px) untuk pembagian halaman; dikalibrasi dari hasil cetak.
  const EST_CARD = (t: number) => (t === 0 ? 98 : 126);
  const EST_HEAD = (g: TierGroup) => 38 + (g.tier === 0 ? 30 : 0);
  const ACTION_PAGE_BUDGET = 915;
  const flowItems: FlowItem[] = tierGroups.flatMap((g) =>
    g.rows.map((r, i) => ({ key: `${g.tier}-${r.id}`, g, r, first: i === 0, est: (i === 0 ? EST_HEAD(g) : 0) + EST_CARD(r.tier) }))
  );
  const pageA: FlowItem[] = [];
  const pageB: FlowItem[] = [];
  {
    let used = 0;
    flowItems.forEach((it) => {
      if (pageB.length === 0 && used + it.est <= ACTION_PAGE_BUDGET) {
        pageA.push(it);
        used += it.est;
      } else {
        pageB.push(it);
      }
    });
  }
  const renderGroupHead = (g: TierGroup, continued: boolean) => {
    const tone = tierTone(g.tier);
    return (
      <div key={`head-${g.tier}-${continued ? 'c' : 'n'}`} style={{ marginTop: '1.6mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.8mm', marginBottom: '1.8mm' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2mm' }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: tone.dot, display: 'inline-block' }} />
            <span style={{ fontSize: fs(10.6), fontWeight: 800, color: tone.text }}>
              {continued ? `${g.title.split(':')[0]} (lanjutan)` : g.title}
            </span>
          </div>
          {!continued && (
            <span style={{ fontSize: fs(9), color: '#475467', fontWeight: 600 }}>
              {g.rows.length} subtes
            </span>
          )}
        </div>
        {!continued && g.tier === 0 && (
          <div style={{ fontSize: fs(9.4), color: '#334155', lineHeight: 1.45, marginBottom: '1.6mm' }}>{ACTION_PLAN_COPY.achievedNote}</div>
        )}
      </div>
    );
  };
  const renderCard = (g: TierGroup, r: ActionRow) => {
    const tone = tierTone(g.tier);
    const capLabel: React.CSSProperties = { fontSize: fs(8.6), fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: '#667085', marginBottom: '0.4mm' };
    return (
      <div
        key={`card-${r.id}`}
        style={{ border: '1px solid #e2e8f0', borderRadius: 4, padding: '2mm 3mm', marginBottom: '2mm', background: '#ffffff', breakInside: 'avoid' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '7mm 1fr 38mm 30mm', alignItems: 'center', columnGap: '3mm' }}>
          <span style={{ width: '6mm', height: '6mm', borderRadius: '50%', background: '#245f5a', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: fs(8.6), fontWeight: 800 }}>
            {rankById.get(r.id)}
          </span>
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: fs(10.4), lineHeight: 1.25 }}>{r.name}</div>
            <div style={{ fontSize: fs(9), color: '#667085', marginTop: '0.3mm' }}>
              Riwayat drill 3 bulan terakhir: {r.drill && r.drill.questions > 0 ? `${r.drill.questions} soal, ${r.drill.accuracy}% benar` : 'belum ada data'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8mm' }}>
            <div style={{ width: '100%', height: 6, borderRadius: 6, background: '#e8edf2', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, Math.round((r.to4 / foundationTarget) * 100))}%`, height: '100%', borderRadius: 6, background: r.tier === 0 ? '#245f5a' : '#b42318' }} />
            </div>
            <span style={{ fontSize: fs(12), fontWeight: 800, color: r.tier === 0 ? '#245f5a' : '#b42318', lineHeight: 1 }}>
              {r.to4}
              <span style={{ fontSize: fs(9.4), fontWeight: 700, color: '#667085' }}> / {foundationTarget}</span>
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', fontSize: fs(9.2), fontWeight: 800, color: r.tier === 0 ? '#245f5a' : tone.text, background: r.tier === 0 ? '#eef6f5' : tone.pillBg, borderRadius: 3, padding: '0.5mm 1.8mm', whiteSpace: 'nowrap' }}>
              {r.tier === 0 ? ACTION_PLAN_COPY.achievedBadge(r.to4 - foundationTarget, foundationTarget) : `kurang ${r.next - r.to4}`}
            </span>
          </div>
        </div>
        {r.tier === 0 ? (
          <div style={{ marginTop: '1.8mm', paddingTop: '1.6mm', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ ...capLabel, color: '#245f5a' }}>Target berikutnya</div>
            <div style={{ fontSize: fs(10.4), fontWeight: 800, lineHeight: 1.38, color: '#0f172a' }}>
              {achievedNextTarget(priorityGoalById.get(r.id), foundationTarget)}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', marginTop: '1.8mm', paddingTop: '1.6mm', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ paddingRight: '3mm' }}>
              <div style={{ ...capLabel, color: '#245f5a' }}>Fokus perbaikan materi</div>
              <div style={{ fontSize: fs(10.4), fontWeight: 800, lineHeight: 1.38, color: '#0f172a' }}>{r.topics.join(' · ')}</div>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '3mm' }}>
              <div style={{ ...capLabel, color: '#245f5a' }}>Target drill soal</div>
              <div style={{ fontSize: fs(10.4), fontWeight: 800, lineHeight: 1.38, color: '#0f172a' }}>{r.drillTarget} soal benar per minggu</div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const renderItems = (items: FlowItem[]) =>
    items.map((it, idx) => (
      <React.Fragment key={it.key}>
        {it.first ? renderGroupHead(it.g, false) : idx === 0 ? renderGroupHead(it.g, true) : null}
        {renderCard(it.g, it.r)}
      </React.Fragment>
    ));

  // Kesimpulan halaman 1.
  const toWordsEarly = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima'];
  const achievedPrograms = activePrograms.filter((p) => p.gap >= 0).length;
  const posisiLine =
    achievedPrograms === 0
      ? `Belum ada satu pun dari ${toWordsEarly[activePrograms.length] ?? activePrograms.length} pilihan jurusan yang skornya mencapai target.`
      : `${achievedPrograms} dari ${activePrograms.length} pilihan jurusan skornya sudah mencapai target.`;
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
      : `Fokus utama saat ini adalah memperbaiki ${joinNames(focusMain)}, sambil menjaga subtes lain agar tidak kembali menurun.`;
  // Plan B: tampil bila belum ada pilihan jurusan yang mencapai target acuan.
  const needsPlanBNote = activePrograms.length > 0 && activePrograms.every((p) => p.gap < 0);

  // Rencana tindak lanjut halaman 3 (satu kalimat per butir).
  const shortUniv = (univ: string) => univ.match(/\(([^)]+)\)/)?.[1] ?? univ;
  const programTargets = activePrograms
    .map((p) => {
      const pacing = computeProgramPacing(p.weightedScore, p.targetScore, p.gap, ruleConfig);
      return `${shortUniv(p.univ)} ${pacing.isAchieved ? 'terlewati' : `≥ ${pacing.nextToTargetScore}`}`;
    })
    .join(' · ');
  // Sorotan dari draft kesiswaan: target TO berikutnya tertinggi, dan jangka pencapaian (jumlah TO sampai konsultasi berikutnya).
  const highestNext = activePrograms
    .map((p) => ({ p, pacing: computeProgramPacing(p.weightedScore, p.targetScore, p.gap, ruleConfig) }))
    .filter((x) => !x.pacing.isAchieved)
    .sort((a, b) => b.pacing.nextToTargetScore - a.pacing.nextToTargetScore)[0];
  const toWords = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam'];
  const episodesAhead = Math.max(1, ruleConfig.thresholds.remainingEpisodesToNextConsult || 3);
  const episodesAheadWord = toWords[episodesAhead] ?? String(episodesAhead);
  const rencanaItems = [
    {
      title: 'Latihan mingguan',
      text:
        weakSubtests.length > 0
          ? `Minimal ${drillTotal} soal benar per minggu di aplikasi Ruangguru: ${ruleConfig.thresholds.drillRank1}, ${ruleConfig.thresholds.drillRank2}, dan ${ruleConfig.thresholds.drillRank3} soal benar untuk tiga subtes terendah, ${ruleConfig.thresholds.minDrillPerSubtest} untuk subtes lainnya.`
          : 'Pertahankan konsistensi latihan mingguan di aplikasi Ruangguru.'
    },
    {
      title: `Target Tryout ${toCount + 1}`,
      text: `${weakSubtests.length > 0 ? `Semua subtes minimal ${foundationTarget}.` : `Pertahankan semua subtes di atas ${foundationTarget}.`} Skor jurusan: ${programTargets}.`
    },
    ...(needsPlanBNote ? [{ title: 'Plan B', text: PDF_COPY.planB }] : []),
    {
      title: 'Dukungan orang tua',
      text: `Dampingi jadwal belajar dan istirahat; cek progres ${weakSubtests.length > 0 ? `${drillTotal} soal benar` : 'latihan'} tiap akhir pekan.`
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
                    <td style={{ width: '33%', fontWeight: 800, color: '#0f172a', fontSize: fs(10.5) }}>{identity.name}</td>
                    <td style={{ width: '17%', background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Asal Sekolah</td>
                    <td style={{ width: '33%' }}>{identity.school}</td>
                  </tr>
                  <tr>
                    <td style={{ background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Cabang / Kelas</td>
                    <td>{identity.branch} (12 SMA)</td>
                    <td style={{ background: '#e6f4f2', fontWeight: 700, color: '#245f5a' }}>Kakak Asuh</td>
                    <td>{identity.saName}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 1. POSISI SAAT INI */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>1.</span>Posisi Saat Ini terhadap Target {foundationTarget} &amp; Pilihan Jurusan</span>
              </h2>
              {renderSubHead('', `Evaluasi Skor TO UTBK Regular Episode ${toCount} terhadap Pilihan Jurusan (menggunakan sistem skoring IRT Pembobotan)`)}
              <table className="profiling-print-table">
                <thead>
                  <tr>
                    <th style={{ width: '9%', textAlign: 'center' }}>Pilihan</th>
                    <th style={{ width: '38%' }}>Program Studi &amp; Perguruan Tinggi</th>
                    <th style={{ width: '9.5%', textAlign: 'center' }}>Target Nilai</th>
                    <th style={{ width: '9%', textAlign: 'center' }}>Skor TO {toCount}</th>
                    <th style={{ width: '8.5%', textAlign: 'center' }}>Selisih</th>
                    <th style={{ width: '11.5%', textAlign: 'center', background: '#245f5a' }}>Target TO {toCount + 1}</th>
                    <th style={{ width: '14.5%', textAlign: 'center' }}>Target Kenaikan Nilai di Setiap TO</th>
                  </tr>
                </thead>
                <tbody>
                  {activePrograms.map((prog, idx) => {
                    const gapColor = prog.gap >= 0 ? '#027a48' : prog.gap >= -70 ? '#b54708' : '#b42318';
                    const pacing = computeProgramPacing(prog.weightedScore, prog.targetScore, prog.gap, ruleConfig);
                    const cat = matchCatalogProgram(prog);
                    return (
                      <tr key={`${prog.prodi}-${idx}`}>
                        <td style={{ fontWeight: 800, fontSize: fs(11), color: '#245f5a', textAlign: 'center' }}>{prog.priority.replace(/\D+/g, '') || prog.priority}</td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: fs(10.5), color: '#0f172a' }}>
                            <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 9, background: prodiTone(prog.prodi.replace(/^(S1|D4|D3)\s+/, '')).text, marginRight: '1.6mm' }} />
                            {prog.prodi}
                          </div>
                          <div style={{ color: '#475467', fontSize: fs(9.5) }}>{prog.univ}</div>
                          <div style={{ color: '#475467', fontSize: fs(9.2) }}>
                            {cat ? `Daya tampung ${cat.quota2026} · Peminat ${cat.applicants2025.toLocaleString('id-ID')} · ` : ''}Keketatan {prog.tightness}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: fs(11), color: '#0f172a' }}>{prog.targetScore}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#245f5a' }}>{prog.weightedScore}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: gapColor }}>{prog.gap >= 0 ? `+${prog.gap}` : prog.gap}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, fontSize: fs(11.5), color: '#245f5a', background: '#e6f4f2' }}>
                          {pacing.isAchieved ? 'Terlewati' : `≥ ${pacing.nextToTargetScore}`}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: fs(9.8) }}>
                          {pacing.isAchieved ? '—' : `+${pacing.gainPerToNextConsult} poin/TO`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ fontSize: fs(9.2), color: '#667085', marginTop: '1.2mm', lineHeight: 1.4 }}>
                {PDF_COPY.keketatanNote.join(' ')} Target TO {toCount + 1} = skor TO {toCount} + kenaikan per TO.
              </div>
              <ul style={{ margin: '1.4mm 0 0', paddingLeft: '4.2mm', fontSize: fs(9.6), color: '#334155', lineHeight: 1.45 }}>
                {highestNext && (
                  <li>
                    Target TO {toCount + 1} tertinggi ada di <strong>{highestNext.p.prodi} {shortUniv(highestNext.p.univ)}</strong>, yaitu minimal{' '}
                    <strong>{highestNext.pacing.nextToTargetScore}</strong>.
                  </li>
                )}
                {highestNext && (
                  <li>
                    Target peningkatan nilai pada setiap TO disusun secara bertahap dan terukur, sehingga target skor yang diharapkan dapat
                    tercapai dalam {episodesAheadWord} TO berikutnya.
                  </li>
                )}
              </ul>

              <div style={{ background: '#f2f8f7', borderLeft: '3px solid #58aebd', borderRadius: 3, padding: '1.3mm 2.6mm', marginTop: '2.4mm', fontSize: fs(10), color: '#0f172a', lineHeight: 1.45 }}>
                <strong style={{ color: '#245f5a' }}>Kesimpulan:</strong> {posisiLine}
              </div>
            </div>

            <footer className="profiling-print-footer">
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Konsultasi Checkpoint 1 • Target bukan jaminan kelulusan SNPMB</div>
              <div>Halaman 1 dari 4</div>
            </footer>
          </section>

          {/* ================= PAGE 2 ================= */}
          <section className="profiling-print-page profiling-print-page--v2" id="reportPage2">
            <header className="profiling-print-running-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#245f5a', letterSpacing: 0.5 }}>
                  BRAIN ACADEMY BY RUANGGURU
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                  LAPORAN KONSULTASI CHECKPOINT 1
                </span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475467', whiteSpace: 'nowrap' }}>
                {identity.name} <span style={{ color: '#94a3b8', margin: '0 1mm' }}>|</span> Halaman 2 dari 4
              </div>
            </header>

            {/* 2. BREAKDOWN PER SUBTES */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>2.</span>Breakdown per Subtes</span>
              </h2>
              <div style={{ fontSize: fs(10), color: '#713f12', lineHeight: 1.45, marginBottom: '1.6mm' }}>
                <strong>Kenapa semua subtes ditargetkan mencapai {foundationTarget}?</strong> {PDF_COPY.why600} {countLine}
              </div>
              <table className="profiling-print-table profiling-print-table--tight">
                <thead>
                  <tr>
                    <th style={{ width: '3%', textAlign: 'center' }}>#</th>
                    <th style={{ width: '28%' }}>Subtes UTBK</th>
                    <th style={{ width: '17%', textAlign: 'center' }}>Tren<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>{toCount} TO terakhir</div></th>
                    <th style={{ width: '7%', textAlign: 'center' }}>TO 1<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2, whiteSpace: 'nowrap' }}>30 Agu</div></th>
                    <th style={{ width: '7%', textAlign: 'center' }}>TO 2<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2, whiteSpace: 'nowrap' }}>14 Sep</div></th>
                    <th style={{ width: '7%', textAlign: 'center' }}>TO 3<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2, whiteSpace: 'nowrap' }}>28 Sep</div></th>
                    <th style={{ width: '7.5%', textAlign: 'center' }}>TO 4<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2, whiteSpace: 'nowrap' }}>30 Okt</div></th>
                    <th style={{ width: '14%', textAlign: 'center' }}>
                      Posisi TO {toCount} vs {foundationTarget}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs(9), fontWeight: 600, marginTop: 2.5, color: '#edf7f8' }}>
                        <span>400</span><span>600</span><span>700</span>
                      </div>
                    </th>
                    <th style={{ width: '9.5%', textAlign: 'center' }}>Median<div style={{ fontSize: fs(9), fontWeight: 500, color: '#edf7f8', marginTop: 2 }}>{toCount} TO</div></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubtests.map((sub, idx) => {
                    const needsFix = sub.gap < 0;
                    const badge = getStatusBadgeInfo(sub.gap);
                    const pattern = classifySubtestPattern([sub.to1, sub.to2, sub.to3, sub.to4], ruleConfig);
                    return (
                      <tr key={sub.id} style={needsFix ? { background: '#fffbfa' } : undefined}>
                        <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{sub.name}</div>
                          {(priorityProdisById.get(sub.id) ?? []).length > 0 && (
                            <div style={{ display: 'flex', gap: '1mm', flexWrap: 'wrap', marginTop: '0.4mm' }}>
                              {(priorityProdisById.get(sub.id) ?? []).map((n) => {
                                const tone = prodiTone(n);
                                return (
                                  <span key={n} style={{ fontSize: fs(9), fontWeight: 700, color: tone.text, background: tone.bg, border: `1px solid ${tone.border}`, padding: '0.2mm 1.2mm', borderRadius: 3, lineHeight: 1.2 }}>{n}</span>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontSize: fs(9), fontWeight: 700, color: pattern.color }}>{pattern.label}</td>
                        <td style={{ textAlign: 'center' }}>{sub.to1}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.to2}{renderTrendArrow(sub.to2, sub.to1)}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{sub.to3}{renderTrendArrow(sub.to3, sub.to2)}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 800, fontSize: fs(10.5), color: badge.color }}>{sub.to4}{renderTrendArrow(sub.to4, sub.to3)}</td>
                        <td>
                          <div className="v2-progress-track">
                            <div className={`v2-progress-fill ${badge.fillClass}`} style={{ width: `${sub.fillPct}%` }} />
                            <div className="v2-progress-target-line" />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{formatIndo(Number(String(sub.median).replace(',', '.')))}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#e6f4f2' }}>
                    <td />
                    <td style={{ fontWeight: 800, color: '#245f5a' }}>Median 8 subtes</td>
                    <td style={{ textAlign: 'center', fontSize: fs(9), fontWeight: 700, color: medPattern.color }}>{medPattern.label}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{formatIndo(med1)}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600 }}>{formatIndo(med2)}{renderTrendArrow(med2, med1)}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 600 }}>{formatIndo(med3)}{renderTrendArrow(med3, med2)}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 800, color: medBadge.color }}>{formatIndo(med4)}{renderTrendArrow(med4, med3)}</td>
                    <td>
                      <div className="v2-progress-track">
                        <div className={`v2-progress-fill ${medBadge.fillClass}`} style={{ width: `${medFill}%` }} />
                        <div className="v2-progress-target-line" />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#245f5a' }}>{formatIndo(medAll)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '3.4mm', alignItems: 'center', marginTop: '1.8mm', fontSize: fs(9.2), color: '#334155', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#d92d20', display: 'inline-block', borderRadius: 2 }} /> Di bawah {foundationTarget}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: 9, height: 9, background: '#12b76a', display: 'inline-block', borderRadius: 2 }} /> Tercapai ({foundationTarget}+)
                </span>
                {priorityProdisById.size > 0 && (
                  <span style={{ color: '#475467', fontWeight: 600 }}>Label berwarna di bawah nama subtes = subtes prioritas untuk jurusan dengan warna yang sama</span>
                )}
              </div>
              <div style={{ background: '#f2f8f7', borderLeft: '3px solid #58aebd', borderRadius: 3, padding: '1.3mm 2.6mm', marginTop: '1.6mm', fontSize: fs(10), color: '#0f172a', lineHeight: 1.45 }}>
                <strong style={{ color: '#245f5a' }}>Kesimpulan:</strong> {subtesLine}
              </div>
            </div>

            <footer className="profiling-print-footer">
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Konsultasi Checkpoint 1 • Target bukan jaminan kelulusan SNPMB</div>
              <div>Halaman 2 dari 4</div>
            </footer>
          </section>

          {/* ================= PAGE 3 ================= */}
          <section className="profiling-print-page profiling-print-page--v2" id="reportPage3">
            <header className="profiling-print-running-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#245f5a', letterSpacing: 0.5 }}>
                  BRAIN ACADEMY BY RUANGGURU
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                  LAPORAN KONSULTASI CHECKPOINT 1
                </span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475467', whiteSpace: 'nowrap' }}>
                {identity.name} <span style={{ color: '#94a3b8', margin: '0 1mm' }}>|</span> Halaman 3 dari 4
              </div>
            </header>

            {/* 2. ACTION PLAN: TARGET LATIHAN SOAL */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>3.</span>Action Plan: Target Drill Soal</span>
                <span style={{ fontSize: fs(9), fontWeight: 600, color: '#245f5a', textTransform: 'none', letterSpacing: 0 }}>target drill menurut urutan nilai</span>
              </h2>
              {weakSubtests.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', columnGap: '5mm', background: '#e6f4f2', borderRadius: 4, padding: '2.2mm 3.2mm', marginBottom: '3mm' }}>
                  <div>
                    <div style={{ fontSize: fs(8.6), fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: '#245f5a' }}>Target drill mingguan</div>
                    <div style={{ fontSize: fs(10), color: '#0f172a', lineHeight: 1.4 }}>
                      Target per minggu: <strong>{ruleConfig.thresholds.drillRank1}, {ruleConfig.thresholds.drillRank2}, dan {ruleConfig.thresholds.drillRank3} soal benar</strong> untuk tiga subtes terendah, <strong>{ruleConfig.thresholds.minDrillPerSubtest}</strong> untuk subtes lainnya.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6mm', borderLeft: '1px solid #b7d9d4', paddingLeft: '5mm' }}>
                    <div>
                      <div style={{ fontSize: fs(8.6), fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase', color: '#245f5a' }}>Total target</div>
                      <div style={{ fontSize: fs(10), fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>{drillTotal} soal benar/minggu</div>
                    </div>
                  </div>
                </div>
              )}

              {renderItems(pageA)}
            </div>

            <footer className="profiling-print-footer">
              <div><strong>BRAIN ACADEMY BY RUANGGURU</strong> • Konsultasi Checkpoint 1 • Target bukan jaminan kelulusan SNPMB</div>
              <div>Halaman 3 dari 4</div>
            </footer>
          </section>

          {/* ================= PAGE 4 ================= */}
          <section className="profiling-print-page profiling-print-page--v2" id="reportPage4">
            <header className="profiling-print-running-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#245f5a', letterSpacing: 0.5 }}>
                  BRAIN ACADEMY BY RUANGGURU
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                  LAPORAN KONSULTASI CHECKPOINT 1
                </span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475467', whiteSpace: 'nowrap' }}>
                {identity.name} <span style={{ color: '#94a3b8', margin: '0 1mm' }}>|</span> Halaman 4 dari 4
              </div>
            </header>

            {pageB.length > 0 && (
              <div className="profiling-print-section" style={{ marginBottom: '3.6mm' }}>
                <h2 className="profiling-print-section-title">
                  <span><span style={{ marginRight: '1.8mm' }}>3.</span>Action Plan (lanjutan)</span>
                </h2>
                {renderItems(pageB)}
              </div>
            )}

            {/* 3. RENCANA TINDAK LANJUT */}
            <div className="profiling-print-section" style={{ marginBottom: '3.6mm' }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>4.</span>Rencana Tindak Lanjut Menuju Tryout {toCount + 1}</span>
              </h2>
              <ol className="profiling-print-action-list">
                {rencanaItems.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}:</strong> {item.text}
                  </li>
                ))}
              </ol>
            </div>

            {/* 4. LEMBAR KESEPAKATAN BERSAMA 3 PIHAK */}
            <div className="profiling-print-section" style={{ marginBottom: 0 }}>
              <h2 className="profiling-print-section-title">
                <span><span style={{ marginRight: '1.8mm' }}>5.</span>Lembar Kesepakatan Bersama 3 Pihak</span>
              </h2>
              <p className="profiling-print-agreement">
                &ldquo;Dengan menandatangani lembar ini, Siswa, Orang Tua / Wali, dan Kakak Asuh Brain Academy menyatakan telah berdiskusi bersama, memahami hasil evaluasi belajar 4 Tryout, dan bersepakat mengenai formulasi pilihan jurusan serta komitmen rencana tindak lanjut belajar Checkpoint 1 demi mencapai target PTN impian.&rdquo;
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
              <div>Halaman 4 dari 4</div>
            </footer>
          </section>

        </div>
      </div>
    </div>,
    document.body
  );
};
