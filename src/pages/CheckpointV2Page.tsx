import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Save, FileText, Info, Building2, Wrench, ShieldCheck, BookOpen } from 'lucide-react';
import { V2PdfModal } from '../components/V2PdfModal';
import {
  studentIdentity,
  subtestsV2Data,
  targetPrograms,
  prioritySubtestsV2,
  actionPlansV2
} from '../data/garudaData';

type V2Tab = 'tahap1' | 'tahap2' | 'tahap3' | 'tahap4';

const v2NavConfig: Record<V2Tab, { prefix: string; links: { href: string; label: string }[] }> = {
  tahap1: {
    prefix: "🎯 Alur Tahap 1:",
    links: [
      { href: "#sec_tahap1_guide", label: "Panduan SA" },
      { href: "#sec_tahap1_metrics", label: "Evaluasi Skor Reguler" },
      { href: "#sec_tahap1_table", label: "Tabel 8 Subtes vs 600" }
    ]
  },
  tahap2: {
    prefix: "🏛️ Alur Tahap 2:",
    links: [
      { href: "#sec_tahap2_guide", label: "Panduan SA" },
      { href: "#sec_tahap2_table", label: "3 Pilihan & Skor Terbobot CMS" }
    ]
  },
  tahap3: {
    prefix: "🛠️ Alur Tahap 3:",
    links: [
      { href: "#sec_tahap3_guide", label: "Panduan SA" },
      { href: "#sec_tahap3_cards", label: "4 Subtes Prioritas & Ruangguru Drill" }
    ]
  },
  tahap4: {
    prefix: "📝 Alur Tahap 4:",
    links: [
      { href: "#sec_tahap4_guide", label: "Panduan SA" },
      { href: "#sec_tahap4_plans", label: "4 Rencana Aksi TO 5" },
      { href: "#sec_tahap4_agreement", label: "Lembar Kesepakatan 3 Pihak" }
    ]
  }
};

export const CheckpointV2Page: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as V2Tab);
  const [activeTab, setActiveTab] = useState<V2Tab>(
    ['tahap1', 'tahap2', 'tahap3', 'tahap4'].includes(initialTab) ? initialTab : 'tahap1'
  );
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true'
  );
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);
  const [saNotes, setSaNotes] = useState<string>(() => {
    const saved = localStorage.getItem('bac_v2_sa_notes');
    return saved || "Siswa sempat merasa terbebani penurunan nilai dari TO 1 ke TO 4, namun kembali bersemangat setelah melihat Penalaran Matematika (597) sudah di ambang batas 600. Orang tua menyetujui target 25 soal/hari dan akan mendampingi jadwal belajar mandiri di rumah. Fokus pemulihan utama: PU dan PK.";
  });

  useEffect(() => {
    const preview = searchParams.get('preview');
    if (preview === '1' || preview === 'true') {
      setIsPdfOpen(true);
    }
  }, [searchParams]);

  const handleTabChange = (tab: V2Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSaveNotes = () => {
    localStorage.setItem('bac_v2_sa_notes', saNotes);
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2400);
  };

  const openPdf = () => setIsPdfOpen(true);
  const closePdf = () => {
    setIsPdfOpen(false);
    if (searchParams.has('preview')) {
      const next = new URLSearchParams(searchParams);
      next.delete('preview');
      setSearchParams(next, { replace: true });
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const id = targetId.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const currentNav = v2NavConfig[activeTab];

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

      <main className="container">
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
              📝 Update Nilai Rapor
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsLocked(!isLocked)}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              {isLocked ? 'Terkunci (Klik Buka)' : 'Kunci Catatan'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleSaveNotes}>
              <Save size={14} /> Simpan Draft
            </button>
            <button type="button" className="btn btn-primary" onClick={openPdf}>
              <FileText size={14} /> Preview &amp; Cetak PDF (2 Halaman)
            </button>
          </div>
        </div>

        {/* Student Header */}
        <div className="student-header">
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
            <div><strong>Sesi:</strong> {studentIdentity.sessionType}</div>
            <div><strong>Tanggal:</strong> {studentIdentity.sessionDate}</div>
          </div>
        </div>

        {/* MAIN TAB NAVIGATION BAR (4 STAGES) */}
        <nav className="main-tab-bar" aria-label="Tahapan Konsultasi Checkpoint 1">
          <button
            type="button"
            className={`main-tab-item${activeTab === 'tahap1' ? ' active' : ''}`}
            onClick={() => handleTabChange('tahap1')}
          >
            <span>🎯 Tahap 1: Fondasi 600 &amp; Skor Reguler</span>
          </button>
          <button
            type="button"
            className={`main-tab-item${activeTab === 'tahap2' ? ' active' : ''}`}
            onClick={() => handleTabChange('tahap2')}
          >
            <span>🏛️ Tahap 2: Skor Terbobot &amp; Jurusan</span>
          </button>
          <button
            type="button"
            className={`main-tab-item${activeTab === 'tahap3' ? ' active' : ''}`}
            onClick={() => handleTabChange('tahap3')}
          >
            <span>🛠️ Tahap 3: Subtes Prioritas &amp; Drill Soal</span>
          </button>
          <button
            type="button"
            className={`main-tab-item${activeTab === 'tahap4' ? ' active' : ''}`}
            onClick={() => handleTabChange('tahap4')}
          >
            <span>📝 Tahap 4: Rencana Aksi &amp; Kesepakatan</span>
          </button>
        </nav>

        {/* STICKY QUICK-JUMP SUB-NAV */}
        <nav className="jump-nav-container" aria-label="Sub-navigasi Halaman">
          <div className="jump-nav-label">
            <span>{currentNav.prefix}</span>
          </div>
          <div className="jump-nav-links">
            {currentNav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="jump-link"
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ========================================================= */}
        {/* TAHAP 1: FONDASI 600 & EVALUASI SKOR IRT REGULER          */}
        {/* ========================================================= */}
        {activeTab === 'tahap1' && (
          <div id="tabContent_tahap1" className="tab-content-panel">
            <section className="section-block" id="sec_tahap1_guide">
              <div className="sa-prompt-card">
                <div className="sa-prompt-header">
                  <span className="sa-prompt-title">
                    <Info size={16} />
                    Panduan SA: Menyamakan Persepsi &amp; Penjelasan Dua Sistem Skor
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: 4 }}>
                    Tahap 1 dari 4: Fondasi 600
                  </span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: '#1e293b', marginTop: 8 }}>
                  <p>
                    <strong>🎯 Tujuan Tahap Ini:</strong> Menyamakan pemahaman siswa dan orang tua tentang capaian 4 TO awal dan membedakan antara <em>Skor IRT Reguler</em> (kemampuan murni) vs <em>Skor IRT Terbobot</em> (disesuaikan formula jurusan). Fokus Semester 1 adalah membawa <strong>seluruh 8 subtes melampaui milestone 600 poin</strong>.
                  </p>
                </div>
                <ul className="sa-prompt-list" style={{ marginTop: 10 }}>
                  <li>
                    <strong>Kalimat Pembuka ke Ortu &amp; Siswa:</strong> <em>&quot;Selamat datang Garuda dan Bapak/Ibu. Hari ini kita membedah hasil 4 kali Tryout awal. Di sesi ini, kita menggunakan patokan batas kompetitif nasional yaitu 600 poin per subtes. Sebelum kita hitung peluang lolos di Farmasi UGM atau ITB, target wajib Semester 1 adalah memastikan fondasi di ke-8 subtes menyentuh minimal 600 poin.&quot;</em>
                  </li>
                  <li>
                    <strong>Pertanyaan Pemantik ke Siswa:</strong> <em>&quot;Dari hasil 4 TO kemarin, ada 1 subtes yang sudah melewati 600 yaitu Pengetahuan &amp; Pemahaman Umum (640 / +40) dan Penalaran Matematika sudah dekat (597 / -3), tapi ada beberapa subtes seperti Penalaran Umum (465 / -135) dan Pengetahuan Kuantitatif (488 / -112) yang masih tertinggal jauh. Menurutmu, kendala terbesar di subtes tersebut apa?&quot;</em>
                  </li>
                  <li>
                    <strong>Catatan untuk Kakak Asuh:</strong> Jangan langsung membuat orang tua cemas karena gap nilai. Jelaskan bahwa penurunan skor dari TO 1 (601) ke TO 4 (546) wajar terjadi karena tingkat kesulitan soal UTBK bertahap meningkat, namun perlu diimbangi disiplin drill harian.
                  </li>
                  <li>
                    <strong>Cara Membaca Rerata vs Median (Deteksi Fluktuasi Ekstrem):</strong> Selalu perhatikan kolom <strong>Median 4 TO</strong> dan baris <strong>Nilai tengah (Median)</strong> secara berdampingan dengan nilai rata-rata. Jika rata-rata dan median bergerak sejalan (misal TO 4 rata-rata 546 &amp; median 548,5), berarti tren bersifat merata. Namun jika terdapat selisih jauh atau skor subtes fluktuatif ekstrem (contoh Literasi B. Indo Soshum Garuda: <code>628 → 494 → 488 → 573</code>), nilai <strong>Median (533,5)</strong> menunjukkan performa tipikal yang sebenarnya tanpa terseret satu skor ekstrem.
                  </li>
                </ul>
              </div>
            </section>

            <section className="section-block" id="sec_tahap1_metrics">
              <div className="section-header">
                <h2 className="section-title">1. Ringkasan Evaluasi Skor Reguler Siswa</h2>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Data Berdasarkan 4 Episode Tryout SNBT Awal</span>
              </div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-card-label">Rata-Rata Skor Reguler</div>
                  <div className="metric-card-val" style={{ color: '#1078ca' }}>{studentIdentity.toAverage}</div>
                  <div className="metric-card-hint">Rata-rata 4 TO (601, 576, 561, 546)</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Subtes Di Atas 600 (+)</div>
                  <div className="metric-card-val" style={{ color: '#027a48' }}>
                    1 <span style={{ fontSize: 14, fontWeight: 500, color: '#475467' }}>/ 8 Subtes</span>
                  </div>
                  <div className="metric-card-hint" style={{ color: '#027a48', fontWeight: 600 }}>Pengetahuan &amp; Pemahaman Umum (PPU: 640 / +40)</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Subtes Di Bawah 600 (-)</div>
                  <div className="metric-card-val" style={{ color: '#b42318' }}>
                    7 <span style={{ fontSize: 14, fontWeight: 500, color: '#475467' }}>/ 8 Subtes</span>
                  </div>
                  <div className="metric-card-hint" style={{ color: '#b42318', fontWeight: 600 }}>Jarak: -135 s.d. -3 ke batas 600</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Tingkat Kehadiran Kelas</div>
                  <div className="metric-card-val" style={{ color: '#027a48' }}>{studentIdentity.attendanceRate}</div>
                  <div className="metric-card-hint">{studentIdentity.attendanceDetail}</div>
                </div>
              </div>

              <div style={{ background: '#f0f9ff', border: '1px solid #b9e6fe', borderLeft: '4px solid #0284c7', borderRadius: 8, padding: '14px 18px', marginTop: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={15} />
                  Panduan Edukasi Orang Tua: Cara Membaca Dua Sistem Skor
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12, color: '#334155', lineHeight: 1.55 }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>1. Skor IRT Reguler (Kemampuan Dasar):</strong>
                    <p style={{ marginTop: 3 }}>Menghitung performa murni per subtes tanpa bobot jurusan. Digunakan untuk melihat ketahanan fondasi belajar siswa. <strong>Target Semester 1: seluruh 8 subtes mencapai minimal 600.</strong></p>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>2. Skor IRT Terbobot (Penentu Kelolosan PTN):</strong>
                    <p style={{ marginTop: 3 }}>Setiap jurusan PTN memberikan bobot berbeda untuk tiap mata uji. Skor ini dihitung langsung oleh sistem CMS Ruangguru dan dibandingkan langsung dengan skor batas aman PTN tujuan.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="section-block" id="sec_tahap1_table">
              <div className="section-header">
                <h2 className="section-title">2. Evaluasi Capaian 8 Subtes vs Target 600 (Median 4 TO)</h2>
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

              <div className="table-container" style={{ marginTop: 14 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '24%' }}>Ringkasan 8 Subtes</th>
                      <th style={{ textAlign: 'center', width: '8%' }}>TO 1</th>
                      <th style={{ textAlign: 'center', width: '8%' }}>TO 2</th>
                      <th style={{ textAlign: 'center', width: '8%' }}>TO 3</th>
                      <th style={{ textAlign: 'center', width: '8%' }}>TO 4</th>
                      <th style={{ textAlign: 'center', width: '10%' }}>Total 4 TO</th>
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

              {/* Color Legend (placed below Ringkasan 8 Subtes table) */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 10, fontSize: 12, color: '#475467' }}>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>💡 Garis putus-putus pada visual menandakan target 600 poin (milestone Semester 1).</span>
                <button type="button" className="btn btn-primary" onClick={() => handleTabChange('tahap2')}>
                  Lanjut ke Tahap 2: Skor Terbobot &amp; Jurusan ➔
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAHAP 2: SKOR TERBOBOT & EVALUASI JURUSAN PILIHAN         */}
        {/* ========================================================= */}
        {activeTab === 'tahap2' && (
          <div id="tabContent_tahap2" className="tab-content-panel">
            <section className="section-block" id="sec_tahap2_guide">
              <div className="sa-prompt-card">
                <div className="sa-prompt-header">
                  <span className="sa-prompt-title">
                    <Building2 size={16} />
                    Panduan SA: Menjelaskan Skor Terbobot vs Skor Target Jurusan PTN
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 4 }}>
                    Tahap 2 dari 4: Skor Terbobot &amp; Jurusan
                  </span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: '#1e293b', marginTop: 8 }}>
                  <p>
                    <strong>🎯 Tujuan Tahap Ini:</strong> Menjelaskan kepada orang tua dan siswa mengapa nilai rata-rata murni (571) berbeda dengan <em>Skor Terbobot</em> di sistem SNBT. Tunjukkan posisi realistis siswa saat ini terhadap target 3 prodi pilihan tanpa mematahkan semangat belajar.
                  </p>
                </div>
                <ul className="sa-prompt-list" style={{ marginTop: 10 }}>
                  <li>
                    <strong>Cara Menjelaskan ke Orang Tua:</strong> <em>&quot;Bapak/Ibu, di seleksi SNBT nanti, panitia tidak hanya melihat rata-rata nilai, tapi memberikan bobot lebih berat pada subtes yang relevan dengan prodinya. Misalnya untuk Farmasi UGM, bobot Penalaran Matematika dan Literasi Sains sangat tinggi. Skor terbobot Garuda saat ini untuk Farmasi UGM berada di angka 538 terbobot, sementara batas aman tahun lalu 694.&quot;</em>
                  </li>
                  <li>
                    <strong>Pertanyaan Pemantik ke Siswa:</strong> <em>&quot;Garuda, pilihan 1 kamu Farmasi UGM dan pilihan 2 Farmasi UI adalah prodi dengan keketatan sangat tinggi (&lt; 5%). Apakah minat kamu sudah mantap di Farmasi, atau tertarik juga mendalami opsi lain seperti Teknik Mesin ITB yang ada di pilihan 3?&quot;</em>
                  </li>
                  <li>
                    <strong>Strategi SA Checkpoint 1:</strong> Jangan buru-buru menyuruh siswa menurunkan jurusan di Checkpoint 1. Jaga impian mereka sebagai bahan bakar belajar, namun berikan batas evaluasi: <em>&quot;Jika sampai TO 7 (Checkpoint 2) skor terbobot belum menembus 620, kita akan siapkan strategi rasionalisasi kampus alternatif yang lebih aman.&quot;</em>
                  </li>
                </ul>
              </div>
            </section>

            <section className="section-block" id="sec_tahap2_table">
              <div className="section-header">
                <div>
                  <h2 className="section-title">1. Evaluasi 3 Pilihan Jurusan &amp; Skor IRT Terbobot</h2>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Data Skor Terbobot Dihitung Otomatis Berdasarkan Formula Bobot Mata Uji PTN di CMS</span>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '12%' }}>Prioritas</th>
                      <th style={{ width: '32%' }}>Program Studi &amp; Perguruan Tinggi</th>
                      <th style={{ textAlign: 'center', width: '14%' }}>Target Skor Lolos</th>
                      <th style={{ textAlign: 'center', width: '14%' }}>Skor Terbobot Siswa</th>
                      <th style={{ textAlign: 'center', width: '12%' }}>Selisih (Gap)</th>
                      <th style={{ textAlign: 'center', width: '16%' }}>Status Evaluasi</th>
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
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className="badge"
                            style={idx === 2
                              ? { background: '#fffcf5', color: '#b54708', border: '1px solid #fedf89', fontSize: 11 }
                              : { background: '#fef3f2', color: '#b42318', border: '1px solid #fee4e2', fontSize: 11 }
                            }
                          >
                            {prog.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 8, padding: '14px 16px' }}>
                  <h4 style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Analisis Klaster Farmasi (UGM &amp; UI)</h4>
                  <p style={{ fontSize: 12, color: '#475467', lineHeight: 1.55 }}>
                    Farmasi menuntut skor tinggi di subtes <strong>Penalaran Matematika (PM)</strong> dan <strong>Penalaran Umum (PU)</strong>. Meskipun PM Garuda sudah sangat kuat (597), skor PU yang tertahan di 465 menjadi pemberat terbesar yang menyebabkan skor terbobot turun ke 538.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 8, padding: '14px 16px' }}>
                  <h4 style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Analisis Klaster Teknik Mesin (ITB)</h4>
                  <p style={{ fontSize: 12, color: '#475467', lineHeight: 1.55 }}>
                    Teknik Mesin ITB memiliki gap lebih kecil (-95 poin) karena skor PM Garuda yang tinggi (597) menyumbang bobot 35% pada formula seleksi. Jika <strong>Pengetahuan Kuantitatif (PK: 488)</strong> dinaikkan ke 550, peluang lolos akan melonjak drastis.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
                <button type="button" className="btn btn-outline" onClick={() => handleTabChange('tahap1')}>
                  ← Kembali ke Tahap 1
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleTabChange('tahap3')}>
                  Lanjut ke Tahap 3: Subtes Prioritas &amp; Drill Soal ➔
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAHAP 3: 4 SUBTES PRIORITAS & ANALISIS DRILL SOAL         */}
        {/* ========================================================= */}
        {activeTab === 'tahap3' && (
          <div id="tabContent_tahap3" className="tab-content-panel">
            <section className="section-block" id="sec_tahap3_guide">
              <div className="sa-prompt-card">
                <div className="sa-prompt-header">
                  <span className="sa-prompt-title">
                    <Wrench size={16} />
                    Panduan SA: Menghubungkan Skor TO dengan Data Latihan Mandiri di Aplikasi
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#b54708', background: '#fef0c7', padding: '2px 8px', borderRadius: 4 }}>
                    Tahap 3 dari 4: Subtes Prioritas &amp; Drill
                  </span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: '#1e293b', marginTop: 8 }}>
                  <p>
                    <strong>🎯 Tujuan Tahap Ini:</strong> Menetapkan 4 subtes prioritas yang memiliki dampak kenaikan skor terbesar. Tunjukkan bukti data dari <strong>Aplikasi Ruangguru (Tower Drill &amp; Bank Soal)</strong> untuk memperlihatkan bahwa kelemahan subtes berkorelasi langsung dengan volume latihan dan tingkat akurasi.
                  </p>
                </div>
                <ul className="sa-prompt-list" style={{ marginTop: 10 }}>
                  <li>
                    <strong>Kalimat ke Siswa:</strong> <em>&quot;Garuda, kalau kita perhatikan data aplikasi Ruangguru kamu, ada pola yang sangat jelas: subtes dengan skor terendah di TO adalah subtes yang latihan soalnya paling minim. Misalnya di Pengetahuan Kuantitatif (PK), kamu baru menyelesaikan 98 soal dengan akurasi 52%. Ini artinya lebih dari sepertiga materi belum terbiasa kamu kerjakan di bawah tekanan waktu.&quot;</em>
                  </li>
                  <li>
                    <strong>Pertanyaan Pemantik:</strong> <em>&quot;Saat mengerjakan kuis latihan di aplikasi, bab mana di Penalaran Umum dan Kuantitatif yang paling bikin kamu malas atau ragu-ragu untuk mulai?&quot;</em>
                  </li>
                  <li>
                    <strong>Catatan untuk Kakak Asuh:</strong> Berikan keyakinan bahwa mengejar 100 poin di subtes yang masih di bawah 500 (PU &amp; PK) jauh lebih mudah daripada menaikkan subtes yang sudah di atas 600. Setiap tambahan 20 soal latihan per hari akan langsung menaikkan akurasi.
                  </li>
                </ul>
              </div>
            </section>

            <section className="section-block" id="sec_tahap3_cards">
              <div className="section-header">
                <h2 className="section-title">1. Bedah 4 Subtes Prioritas &amp; Integrasi Latihan Ruangguru</h2>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Kombinasi Gap Skor TO vs Jumlah Soal Selesai &amp; Akurasi di Student Tower Ruangguru</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: titleColor, marginTop: 4 }}>{item.name}</h3>
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
                        ➔ Target TO 5: {item.targetTo5}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
                <button type="button" className="btn btn-outline" onClick={() => handleTabChange('tahap2')}>
                  ← Kembali ke Tahap 2
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleTabChange('tahap4')}>
                  Lanjut ke Tahap 4: Rencana Aksi &amp; Kesepakatan ➔
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAHAP 4: RENCANA AKSI & KESEPAKATAN BERSAMA 3 PIHAK       */}
        {/* ========================================================= */}
        {activeTab === 'tahap4' && (
          <div id="tabContent_tahap4" className="tab-content-panel">
            <section className="section-block" id="sec_tahap4_guide">
              <div className="sa-prompt-card">
                <div className="sa-prompt-header">
                  <span className="sa-prompt-title">
                    <ShieldCheck size={16} />
                    Panduan SA: Mengikat Komitmen 3 Pihak Menuju TO 5
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#027a48', background: '#ecfdf3', padding: '2px 8px', borderRadius: 4 }}>
                    Tahap 4 dari 4: Aksi &amp; Kesepakatan
                  </span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: '#1e293b', marginTop: 8 }}>
                  <p>
                    <strong>🎯 Tujuan Tahap Ini:</strong> Mengunci komitmen tertulis antara <strong>Siswa, Orang Tua, dan Kakak Asuh (Ruangguru)</strong>. Pastikan ke-4 rencana aksi bersifat terukur (ada target soal, jadwal, dan PIC) sehingga dapat dievaluasi bersama pada Checkpoint 2.
                  </p>
                </div>
                <ul className="sa-prompt-list" style={{ marginTop: 10 }}>
                  <li>
                    <strong>Kalimat Penutup ke Orang Tua &amp; Siswa:</strong> <em>&quot;Bapak/Ibu dan Garuda, strategi terbaik tidak akan membuahkan hasil tanpa eksekusi harian yang konsisten. Hari ini kita sepakati 4 langkah nyata sampai TO 5. Kakak akan kawal di klinik belajar cabang, Garuda disiplin 25 soal per hari, dan Bapak/Ibu mohon bantuannya memantau jam istirahat dan suasana belajar Garuda di rumah.&quot;</em>
                  </li>
                  <li>
                    <strong>Langkah Akhir:</strong> Klik tombol cetak untuk menampilkan dokumen resmi 2 halaman PDF yang siap ditandatangani dan dibawa pulang oleh orang tua.
                  </li>
                </ul>
              </div>
            </section>

            <section className="section-block" id="sec_tahap4_plans">
              <div className="section-header">
                <h2 className="section-title">1. Rencana Aksi Bersama Sampai TO 5</h2>
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
            </section>

            <section className="section-block" id="sec_tahap4_agreement">
              <div className="section-header">
                <h2 className="section-title">2. Lembar Kesepakatan Bersama 3 Pihak</h2>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Dokumen Resmi Konsultasi Checkpoint 1 Cabang Depok Margonda</span>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>PIHAK SISWA</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{studentIdentity.name}</div>
                    <div style={{ fontSize: 11, color: '#027a48', fontWeight: 600, marginTop: 2 }}>✓ Hadir &amp; Berkomitmen</div>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, background: '#0f172a', color: '#fff', padding: '14px 20px', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>Dokumen Laporan Konsultasi 2 Halaman Siap Dicetak</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>Format standar A4 tanpa instruksi internal SA — dikhususkan untuk diserahkan ke Siswa &amp; Orang Tua.</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-outline" onClick={() => handleTabChange('tahap3')} style={{ color: '#cbd5e1', borderColor: '#475467' }}>
                    ← Kembali ke Tahap 3
                  </button>
                  <button type="button" className="btn btn-primary" onClick={openPdf} style={{ background: '#2563eb', border: 'none', fontWeight: 700, padding: '8px 18px' }}>
                    <FileText size={15} style={{ marginRight: 4 }} />
                    Buka Dokumen PDF 2 Halaman (Siswa &amp; Ortu)
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <V2PdfModal isOpen={isPdfOpen} onClose={closePdf} />
    </div>
  );
};
