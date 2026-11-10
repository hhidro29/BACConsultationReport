import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Save, FileText, Info, HelpCircle, X } from 'lucide-react';
import { V1PdfModal } from '../components/V1PdfModal';
import { useRapor } from '../context/RaporContext';
import { studentIdentity } from '../data/garudaData';
import { studentToSeriesV1, programCatalogV1 } from '../data/v1Data';

type MainTab = 'overview' | 'p1' | 'p2' | 'p3';

const defaultChoices: Record<'p1' | 'p2' | 'p3', string> = {
  p1: 'ugm_farmasi',
  p2: 'ui_farmasi',
  p3: 'itb_mesin'
};

export const CheckpointV1Page: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getMetrics } = useRapor();

  const initialTab = (searchParams.get('tab') as MainTab);
  const [activeTab, setActiveTab] = useState<MainTab>(
    ['overview', 'p1', 'p2', 'p3'].includes(initialTab) ? initialTab : 'overview'
  );
  const [selectedPrograms, setSelectedPrograms] = useState(defaultChoices);
  const [ovChartKey, setOvChartKey] = useState<string>('total');
  const [chChartKey, setChChartKey] = useState<string>('pk');
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true'
  );
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);

  const [saNotes, setSaNotes] = useState({
    motivasi: "Siswa antusias dalam diskusi Farmasi namun cepat lelah setelah jadwal sekolah penuh.",
    hambatan: "Kesulitan utama di aljabar dasar & logika deduktif pada soal Pengetahuan Kuantitatif & Penalaran Umum.",
    target: "Menjaga konsistensi latihan soal harian dan menargetkan kenaikan ke 585 di TO 5.",
    kesepakatan: "Orang tua setuju mendukung jam belajar malam 1.5 jam di rumah dan mengawal kehadiran klinik PR."
  });

  useEffect(() => {
    const preview = searchParams.get('preview');
    if (preview === '1' || preview === 'true') {
      setIsPdfOpen(true);
    }
  }, [searchParams]);

  const closePdf = () => {
    setIsPdfOpen(false);
    if (searchParams.has('preview')) {
      const next = new URLSearchParams(searchParams);
      next.delete('preview');
      setSearchParams(next, { replace: true });
    }
  };

  const switchTab = (tab: MainTab) => {
    setActiveTab(tab);
    if (tab !== 'overview') {
      const prog = programCatalogV1[selectedPrograms[tab]];
      if (prog && prog.prioritySubtests?.length > 0) {
        setChChartKey(prog.prioritySubtests[0]);
      }
    }
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSaveNotes = () => {
    localStorage.setItem('bac_v1_sa_notes', JSON.stringify(saNotes));
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2400);
  };

  const raporGeneral = getMetrics([]);

  // SVG Trend Chart Renderer
  const renderSvgChart = (subKey: string, targetScore?: number) => {
    const series = studentToSeriesV1[subKey] || studentToSeriesV1.total;
    const scores: number[] = series.scores;
    const minY: number = series.minY || 400;
    const maxY: number = series.maxY || 800;

    const width = 620;
    const height = 210;
    const leftX = 52;
    const rightX = 580;
    const topY = 24;
    const botY = 172;

    const getY = (v: number) => botY - ((Math.min(Math.max(v, minY), maxY) - minY) / (maxY - minY)) * (botY - topY);
    const getX = (i: number) => leftX + i * ((rightX - leftX) / (scores.length - 1));

    const points = scores.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');

    const yTicks = [minY, Math.round((minY + maxY) / 2), maxY];

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-light)' }}>
        {/* Grid lines */}
        {yTicks.map(tick => (
          <g key={tick}>
            <line x1={leftX} y1={getY(tick)} x2={rightX} y2={getY(tick)} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={leftX - 8} y={getY(tick) + 4} textAnchor="end" fontSize="11" fill="#64748b">{tick}</text>
          </g>
        ))}

        {/* Target dashed line */}
        {targetScore && targetScore >= minY && targetScore <= maxY && (
          <g>
            <line x1={leftX} y1={getY(targetScore)} x2={rightX} y2={getY(targetScore)} stroke="#f04438" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={rightX} y={getY(targetScore) - 5} textAnchor="end" fontSize="10.5" fontWeight="700" fill="#f04438">
              Target Lolos: {targetScore}
            </text>
          </g>
        )}

        {/* Line Path */}
        <polyline fill="none" stroke="#1078ca" strokeWidth="3" points={points} />

        {/* Data points & labels */}
        {scores.map((v, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(v)} r="5.5" fill="#ffffff" stroke="#1078ca" strokeWidth="3" />
            <text x={getX(i)} y={getY(v) - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">
              {v}
            </text>
            <text x={getX(i)} y={botY + 20} textAnchor="middle" fontSize="11" fill="#475467">
              {studentIdentity.toLabels[i]}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const currentChoiceProg = activeTab !== 'overview' ? programCatalogV1[selectedPrograms[activeTab]] : null;
  const currentChoiceRapor = currentChoiceProg ? getMetrics(currentChoiceProg.supportSubjects) : raporGeneral;

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
            <button type="button" className="btn btn-outline" onClick={() => setIsDrawerOpen(true)}>
              <HelpCircle size={14} /> Cheat Sheet SA
            </button>
            <Link to="/rapor" className="btn btn-outline">
              📝 Update Rapor ({raporGeneral.overallAvg})
            </Link>
            <button type="button" className="btn btn-outline" onClick={() => setIsLocked(!isLocked)}>
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              {isLocked ? 'Terkunci' : 'Kunci Catatan'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleSaveNotes}>
              <Save size={14} /> Simpan Draft
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setIsPdfOpen(true)}>
              <FileText size={14} /> Preview &amp; Cetak PDF (V1)
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
            <div><strong>Versi Prototipe:</strong> V1 (Baseline Tren Skor)</div>
            <div><strong>Tanggal Sesi:</strong> {studentIdentity.sessionDate}</div>
          </div>
        </div>

        {/* MAIN TAB NAVIGATION BAR */}
        <nav className="main-tab-bar" aria-label="Navigasi Tab Pilihan Jurusan">
          <button
            type="button"
            className={`main-tab-item${activeTab === 'overview' ? ' active' : ''}`}
            onClick={() => switchTab('overview')}
          >
            <span>📊 Overview (Potret Umum)</span>
          </button>
          <button
            type="button"
            className={`main-tab-item${activeTab === 'p1' ? ' active' : ''}`}
            onClick={() => switchTab('p1')}
          >
            <span>🏛️ Pilihan 1: {programCatalogV1[selectedPrograms.p1].shortTitle}</span>
          </button>
          <button
            type="button"
            className={`main-tab-item${activeTab === 'p2' ? ' active' : ''}`}
            onClick={() => switchTab('p2')}
          >
            <span>🏛️ Pilihan 2: {programCatalogV1[selectedPrograms.p2].shortTitle}</span>
          </button>
          <button
            type="button"
            className={`main-tab-item${activeTab === 'p3' ? ' active' : ''}`}
            onClick={() => switchTab('p3')}
          >
            <span>🏛️ Pilihan 3: {programCatalogV1[selectedPrograms.p3].shortTitle}</span>
          </button>
        </nav>

        {/* ========================================================= */}
        {/* OVERVIEW TAB                                              */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="tab-content-panel">
            <section className="section-block">
              <div className="sa-prompt-card">
                <div className="sa-prompt-header">
                  <span className="sa-prompt-title">
                    <Info size={15} />
                    Panduan SA: Pembuka &amp; Evaluasi Tren 4 Tryout (V1 Baseline)
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af' }}>Orientasi Siswa &amp; Ortu</span>
                </div>
                <ul className="sa-prompt-list">
                  <li><strong>Pertanyaan ke Siswa:</strong> <em>&quot;Dari hasil 4 TO terakhir, bagian mana yang menurutmu paling menantang dan paling ingin kita bedah solusinya hari ini?&quot;</em></li>
                  <li><strong>Poin Penekanan Tren:</strong> Skor rata-rata mengalami penurunan bertahap dari TO 1 (601) ke TO 4 (546), turun 55 poin. Perlu digali penyebab stamina belajar vs tingkat kesulitan soal.</li>
                </ul>
              </div>
            </section>

            {/* Metric Grid */}
            <section className="section-block">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-card-label">Rata-rata 4 Tryout</div>
                  <div className="metric-card-val" style={{ color: '#1078ca' }}>571</div>
                  <div className="metric-card-hint">TO 1: 601 • TO 2: 576 • TO 3: 561</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Skor TO 4 (Terbaru)</div>
                  <div className="metric-card-val" style={{ color: '#b42318' }}>546</div>
                  <div className="metric-card-hint" style={{ color: '#b42318', fontWeight: 600 }}>↓ Turun 15 poin dari TO 3</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Rata-rata Rapor (Smt 1–5)</div>
                  <div className="metric-card-val" style={{ color: '#027a48' }}>{raporGeneral.overallAvg}</div>
                  <div className="metric-card-hint">{raporGeneral.filledCount} mapel aktif terisi</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Kehadiran Kelas di Cabang</div>
                  <div className="metric-card-val" style={{ color: '#027a48' }}>{studentIdentity.attendanceRate}</div>
                  <div className="metric-card-hint">{studentIdentity.attendanceDetail}</div>
                </div>
              </div>
            </section>

            {/* Interactive Trend Chart */}
            <section className="section-block">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="section-title">1. Grafik Pergerakan Nilai Tryout (TO 1 – TO 4)</h2>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Klik subtes untuk melihat detail tren per mata uji</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['total', 'pu', 'pk', 'pm', 'ppu', 'pbm', 'lbi_a', 'lbe'].map(k => (
                    <button
                      key={k}
                      type="button"
                      className={`btn ${ovChartKey === k ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => setOvChartKey(k)}
                    >
                      {k === 'total' ? 'Rata-rata' : k.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Menampilkan Seri: {(studentToSeriesV1[ovChartKey] || studentToSeriesV1.total).name}
                </div>
                {renderSvgChart(ovChartKey)}
              </div>
            </section>

            {/* 3 Choices Table */}
            <section className="section-block">
              <div className="section-header">
                <h2 className="section-title">2. Daftar Pilihan Program Studi &amp; Perguruan Tinggi</h2>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '12%' }}>Prioritas</th>
                      <th>Program Studi &amp; Perguruan Tinggi</th>
                      <th style={{ textAlign: 'center', width: '14%' }}>Target Skor Lolos</th>
                      <th style={{ textAlign: 'center', width: '12%' }}>Keketatan</th>
                      <th style={{ textAlign: 'center', width: '18%' }}>Posisi di Peminat RG</th>
                      <th style={{ textAlign: 'center', width: '14%' }}>Aksi Analisis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['p1', 'p2', 'p3'] as const).map((slot, i) => {
                      const prog = programCatalogV1[selectedPrograms[slot]];
                      return (
                        <tr key={slot}>
                          <td><span style={{ fontWeight: 700, color: i === 0 ? '#1078ca' : i === 1 ? '#0284c7' : '#b54708' }}>Pilihan {i + 1}</span></td>
                          <td><strong>{prog.fullTitle}</strong></td>
                          <td style={{ textAlign: 'center' }}><strong>{prog.targetScore}</strong></td>
                          <td style={{ textAlign: 'center' }}><span className="badge" style={{ background: '#fef3f2', color: '#b42318' }}>{prog.tightness}</span></td>
                          <td style={{ textAlign: 'center', color: '#1078ca', fontWeight: 700 }}>{prog.leaderboardRank}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button type="button" className="btn btn-outline" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => switchTab(slot)}>
                              Buka Tab P{i + 1} ➔
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SA Notes Section */}
            <section className="section-block" id="sec_overview_notes">
              <div className="section-header">
                <h2 className="section-title">3. Catatan Hasil Konsultasi Kakak Asuh (SA)</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>1. Motivasi &amp; Keaktifan Siswa</label>
                  <textarea
                    rows={2}
                    disabled={isLocked}
                    value={saNotes.motivasi}
                    onChange={(e) => setSaNotes({ ...saNotes, motivasi: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>2. Tantangan &amp; Hambatan Belajar</label>
                  <textarea
                    rows={2}
                    disabled={isLocked}
                    value={saNotes.hambatan}
                    onChange={(e) => setSaNotes({ ...saNotes, hambatan: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>3. Target Jangka Pendek (Menuju TO 5)</label>
                  <textarea
                    rows={2}
                    disabled={isLocked}
                    value={saNotes.target}
                    onChange={(e) => setSaNotes({ ...saNotes, target: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>4. Kesepakatan Bersama Orang Tua</label>
                  <textarea
                    rows={2}
                    disabled={isLocked}
                    value={saNotes.kesepakatan}
                    onChange={(e) => setSaNotes({ ...saNotes, kesepakatan: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* CHOICE DETAIL TAB (P1 / P2 / P3)                          */}
        {/* ========================================================= */}
        {activeTab !== 'overview' && currentChoiceProg && (
          <div className="tab-content-panel">
            <section className="section-block">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span className="badge" style={{ background: '#eff8ff', color: '#1078ca', marginBottom: 4 }}>
                    Analisis {activeTab.toUpperCase()} • {currentChoiceProg.rumpun}
                  </span>
                  <h2 className="section-title" style={{ marginTop: 4 }}>{currentChoiceProg.fullTitle}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Simulasi Prodi Alternatif:</label>
                  <select
                    value={selectedPrograms[activeTab]}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedPrograms(prev => ({ ...prev, [activeTab]: newId }));
                      const np = programCatalogV1[newId];
                      if (np?.prioritySubtests?.length > 0) setChChartKey(np.prioritySubtests[0]);
                    }}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600 }}
                  >
                    {Object.values(programCatalogV1).map(p => (
                      <option key={p.id} value={p.id}>{p.fullTitle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sa-prompt-card" style={{ marginBottom: 18 }}>
                <div className="sa-prompt-title" style={{ marginBottom: 6 }}>Panduan Pembawaan Pilihan Ini:</div>
                <p style={{ fontSize: 12.5, color: '#1e293b', margin: 0 }}>{currentChoiceProg.saPrompt}</p>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-card-label">Target Skor Lolos</div>
                  <div className="metric-card-val" style={{ color: '#0f172a' }}>{currentChoiceProg.targetScore}</div>
                  <div className="metric-card-hint">Keketatan: {currentChoiceProg.tightness} • Kursi: {currentChoiceProg.quota2026}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Gap vs Skor TO 4 (546)</div>
                  <div className="metric-card-val" style={{ color: '#b42318' }}>{546 - currentChoiceProg.targetScore}</div>
                  <div className="metric-card-hint">Butuh peningkatan bertahap tiap TO</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Peringkat Peminat RG</div>
                  <div className="metric-card-val" style={{ color: '#1078ca', fontSize: 18 }}>{currentChoiceProg.leaderboardRank}</div>
                  <div className="metric-card-hint">{currentChoiceProg.leaderboardPercentile}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-card-label">Rapor Pendukung Prodi</div>
                  <div className="metric-card-val" style={{ color: '#027a48' }}>{currentChoiceRapor.supportAvg}</div>
                  <div className="metric-card-hint">Mapel: {currentChoiceProg.supportSubjects.join(', ')}</div>
                </div>
              </div>
            </section>

            {/* Priority Subtest Trend vs Target */}
            <section className="section-block">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="section-title">1. Tren Subtes Penentu Prodi</h2>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Pilih subtes penentu untuk dibandingkan dengan target prodi ini</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {currentChoiceProg.prioritySubtests.map((sub: string) => (
                    <button
                      key={sub}
                      type="button"
                      className={`btn ${chChartKey === sub ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '4px 10px', fontSize: 11.5 }}
                      onClick={() => setChChartKey(sub)}
                    >
                      {sub.toUpperCase()} (Target {currentChoiceProg.pgSubtests[sub]})
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                {renderSvgChart(chChartKey, currentChoiceProg.pgSubtests[chChartKey])}
              </div>
            </section>

            {/* Peer Comparison Table */}
            <section className="section-block">
              <div className="section-header">
                <h2 className="section-title">2. Simulasi &amp; Komparasi Kampus Serumpun</h2>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Program Studi &amp; Perguruan Tinggi</th>
                      <th style={{ textAlign: 'center' }}>Target Lolos</th>
                      <th style={{ textAlign: 'center' }}>Selisih vs TO 4 (546)</th>
                      <th style={{ textAlign: 'center' }}>Keketatan</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentChoiceProg.peerIds.map((pid: string) => {
                      const peer = programCatalogV1[pid];
                      if (!peer) return null;
                      const diff = 546 - peer.targetScore;
                      return (
                        <tr key={pid} style={pid === currentChoiceProg.id ? { background: '#eff8ff' } : undefined}>
                          <td><strong>{peer.fullTitle}</strong></td>
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>{peer.targetScore}</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: diff >= -60 ? '#027a48' : '#b42318' }}>{diff}</td>
                          <td style={{ textAlign: 'center' }}>{peer.tightness}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: 11, padding: '3px 10px' }}
                              onClick={() => {
                                setSelectedPrograms(prev => ({ ...prev, [activeTab]: pid }));
                              }}
                            >
                              Simulasikan di Tab Ini
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Cheat Sheet Slide Drawer */}
      {isDrawerOpen && (
        <>
          <div className="drawer-overlay show" onClick={() => setIsDrawerOpen(false)} />
          <aside className="drawer-sidebar show" aria-label="Contoh Isian Kakak Asuh">
            <div className="drawer-header">
              <h3>Contoh Kalimat Catatan SA (Cheat Sheet)</h3>
              <button type="button" className="drawer-close" onClick={() => setIsDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="drawer-body">
              <div className="cheat-box">
                <h4>1. Motivasi &amp; Keaktifan Belajar</h4>
                <p><em>&quot;Siswa sangat aktif saat menyimak penjelasan rumus, namun masih malu bertanya jika kelas besar. Rekomendasi: didorong hadir Klinik PR tatap muka minimal 2x seminggu.&quot;</em></p>
              </div>
              <div className="cheat-box">
                <h4>2. Tantangan &amp; Hambatan Belajar</h4>
                <p><em>&quot;Siswa sering kelelahan karena jadwal sekolah padat menjelang ujian semester 5. Sempat cemas karena ekspektasi orang tua menginginkan jurusan teknik, sementara minat terdalam ada di farmasi.&quot;</em></p>
              </div>
              <div className="cheat-box">
                <h4>3. Rencana Tindak Lanjut (Action Plan)</h4>
                <p><em>1. Alihkan drill aplikasi 15 soal/hari khusus ke PU &amp; PK.<br />2. Hadir Klinik PR minimal 2x seminggu.<br />3. Target peningkatan skor TO 5 ke minimal 585 poin.</em></p>
              </div>
            </div>
          </aside>
        </>
      )}

      <V1PdfModal isOpen={isPdfOpen} onClose={closePdf} />
    </div>
  );
};
