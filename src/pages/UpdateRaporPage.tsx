import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { RouterTopbar } from '../components/RouterTopbar';
import { useRapor } from '../context/RaporContext';
import { studentIdentity } from '../data/garudaData';

export const UpdateRaporPage: React.FC = () => {
  const navigate = useNavigate();
  const { raporData, updateSubjectScore, saveAllRapor, resetRapor, getMetrics } = useRapor();
  const [savedToast, setSavedToast] = useState(false);

  const generalMetrics = getMetrics([]);
  const farmasiMetrics = getMetrics(["Kimia", "Biologi"]);
  const mesinMetrics = getMetrics(["Fisika", "Matematika Tingkat Lanjut"]);

  const handleSave = () => {
    saveAllRapor();
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
    }, 2500);
  };

  return (
    <div>
      <RouterTopbar />

      {/* Topbar Super CMS */}
      <header className="topbar">
        <div className="topbar-inner">
          <nav aria-label="breadcrumb" className="breadcrumbs">
            <Link to="/">Home</Link>
            <span className="crumb-sep">›</span>
            <Link to="/v2">Konsultasi - Checkpoint</Link>
            <span className="crumb-sep">›</span>
            <Link to="/v2">Detail Checkpoint 1</Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Update Nilai Rapor</span>
          </nav>
          <div className="user-pill">
            <span>{studentIdentity.saName} · {studentIdentity.saEmail}</span>
            <div className="user-avatar">WC</div>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Action Bar */}
        <div className="action-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 16px' }}>
          <button
            type="button"
            className="btn btn-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Kembali ke Report
          </button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {savedToast && (
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#027a48', background: '#ecfdf3', border: '1px solid #a6f4c5', padding: '5px 12px', borderRadius: 9999 }}>
                ✓ Nilai Rapor Tersimpan &amp; Tersinkron!
              </span>
            )}
            <button type="button" className="btn btn-outline" onClick={resetRapor}>
              <RotateCcw size={14} /> Reset Bawaan
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              <Save size={15} /> Simpan Perubahan Rapor
            </button>
          </div>
        </div>

        {/* Student Header */}
        <div className="student-header" style={{ padding: '4px 0 14px' }}>
          <div className="student-info">
            <h1>{studentIdentity.name}</h1>
            <p>
              <span>NISN: <strong>{studentIdentity.nisn}</strong></span>
              <span className="student-tag">{studentIdentity.school}</span>
              <span className="student-tag">{studentIdentity.curriculum}</span>
              <span className="student-tag">{studentIdentity.branch}</span>
            </p>
          </div>
        </div>

        <hr className="divider" />

        {/* Info Banner */}
        <div className="info-card">
          <strong>Petunjuk Pengisian Rapor Super CMS:</strong> Masukkan nilai rapor skala 0–100 untuk 20 mata pelajaran standar dari Semester 1 hingga Semester 5. Mata pelajaran yang tidak diambil oleh siswa dapat diisi <strong>0</strong> (otomatis tidak ikut dalam pembagi rata-rata). Perubahan akan langsung tersinkronisasi ke halaman Dashboard Konsultasi.
        </div>

        {/* Dynamic Summary Cards */}
        <div className="summary-bar">
          <div className="summary-card">
            <div>
              <div className="summary-label">Rata-Rata Kumulatif (20 Mapel)</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                {generalMetrics.filledCount} / {generalMetrics.totalSubjects} mapel terisi
              </div>
            </div>
            <div className="summary-val" style={{ color: '#1078ca' }}>{generalMetrics.overallAvg}</div>
          </div>

          <div className="summary-card">
            <div>
              <div className="summary-label">Mapel Pendukung Farmasi (P1 &amp; P2)</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                Kimia &amp; Biologi (UGM / UI)
              </div>
            </div>
            <div className="summary-val" style={{ color: '#027a48' }}>{farmasiMetrics.supportAvg}</div>
          </div>

          <div className="summary-card">
            <div>
              <div className="summary-label">Mapel Pendukung Teknik Mesin (P3)</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                Fisika &amp; Matematika Lanjut (ITB)
              </div>
            </div>
            <div className="summary-val" style={{ color: '#b54708' }}>{mesinMetrics.supportAvg}</div>
          </div>
        </div>

        {/* 20 Subjects Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '5%', textAlign: 'center' }}>No</th>
                <th style={{ width: '30%' }}>Mata Pelajaran (Standar Super CMS)</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Smt 1</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Smt 2</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Smt 3</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Smt 4</th>
                <th style={{ width: '11%', textAlign: 'center', background: '#f0f9ff', color: '#0369a1' }}>Smt 5 (Terbaru)</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Rata-Rata</th>
              </tr>
            </thead>
            <tbody>
              {raporData.map((subj, idx) => {
                const valid = subj.scores.filter(v => Number(v) > 0);
                const avg = valid.length > 0
                  ? (valid.reduce((a, b) => a + Number(b), 0) / valid.length).toFixed(1)
                  : "0.0";
                const isFilled = valid.length > 0;

                return (
                  <tr key={subj.id} style={isFilled ? undefined : { color: '#94a3b8', background: '#fafafa' }}>
                    <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: isFilled ? 'var(--ink)' : '#64748b' }}>{subj.name}</strong>
                    </td>
                    {subj.scores.map((val, sIdx) => {
                      const isZero = Number(val) === 0;
                      return (
                        <td key={sIdx} style={{ textAlign: 'center', ...(sIdx === 4 ? { background: '#f0f9ff' } : {}) }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className={`table-input${isZero ? ' empty-zero' : ''}`}
                            value={val}
                            onChange={(e) => updateSubjectScore(subj.id, sIdx, parseFloat(e.target.value))}
                          />
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 700, color: isFilled ? '#1078ca' : '#94a3b8' }}>
                      {avg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <Link to="/v2" className="btn btn-back">
            ← Kembali ke Versi 2
          </Link>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Simpan Perubahan Rapor
          </button>
        </div>
      </main>
    </div>
  );
};
