import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppTopbar } from '../components/AppTopbar';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { useRapor } from '../context/RaporContext';
import { CHECKPOINT1_STUDENTS, ProgramChoice } from '../data/garudaData';
import { getStudentBaselinePrograms } from '../data/programCatalog';
import { loadCustomPrograms, safeGetItem } from '../utils/safeStorage';
import { isReportLocked } from '../utils/reportLock';
import { LockBanner } from '../components/LockBanner';

export const UpdateRaporPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getRapor, updateSubjectScore, saveAllRapor, resetRapor, getMetrics } = useRapor();
  const [savedToast, setSavedToast] = useState(false);

  const requestedId = searchParams.get('student') || safeGetItem('bac_v2_active_student_v1') || 'garuda';
  const student = CHECKPOINT1_STUDENTS.find((s) => s.id === requestedId) || CHECKPOINT1_STUDENTS[0];
  const studentId = student.id;
  const studentIdentity = student.identity;
  const isLocked = isReportLocked(studentId);
  const raporData = getRapor(studentId);

  // Mapel pendukung mengikuti pilihan jurusan aktif siswa (termasuk perubahan dari Simulasi).
  const programs: ProgramChoice[] = loadCustomPrograms()[studentId] || getStudentBaselinePrograms(student);
  const supportGroups: { key: string; subjects: string[]; label: string; prodi: string; univs: string[] }[] = [];
  programs.forEach((prog, idx) => {
    const key = [...prog.supportSubjects].sort().join('|');
    const existing = supportGroups.find((g) => g.key === key);
    const univShort = prog.univ.match(/\(([^)]+)\)/)?.[1] || prog.univ;
    if (existing) {
      existing.label += ` & ${idx + 1}`;
      existing.univs.push(univShort);
    } else {
      supportGroups.push({ key, subjects: prog.supportSubjects, label: `Pil. ${idx + 1}`, prodi: prog.prodi, univs: [univShort] });
    }
  });
  const supportCards = supportGroups.slice(0, 2);

  const generalMetrics = getMetrics(studentId, []);

  const handleSave = () => {
    saveAllRapor(studentId);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
    }, 2500);
  };

  return (
    <div>
      {/* Topbar Super CMS */}
      <AppTopbar
        crumbs={[
          { label: 'Home', to: `/v2?student=${studentId}` },
          { label: 'Konsultasi - Checkpoint', to: `/v2?student=${studentId}` },
          { label: 'Detail Checkpoint 1', to: `/v2?student=${studentId}` },
          { label: 'Update Nilai Rapor' }
        ]}
        saName={studentIdentity.saName}
        saEmail={studentIdentity.saEmail}
      />

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
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--green-ink)', background: '#ecfdf3', border: '1px solid #a6f4c5', padding: '5px 12px', borderRadius: 9999 }}>
                ✓ Nilai Rapor Tersimpan &amp; Tersinkron!
              </span>
            )}
            <button type="button" className="btn btn-outline" disabled={isLocked} onClick={() => { if (window.confirm('Kembalikan semua nilai rapor ke data bawaan? Nilai yang sudah disimpan akan tertimpa.')) resetRapor(studentId); }}>
              <RotateCcw size={14} /> Reset Bawaan
            </button>
            <button type="button" className="btn btn-primary" disabled={isLocked} onClick={handleSave}>
              <Save size={15} /> Simpan Perubahan Rapor
            </button>
          </div>
        </div>

        {isLocked && <LockBanner studentId={studentId} actionLabel="Ke Laporan untuk Buka Kunci" />}

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
          <strong>Petunjuk Pengisian Rapor Super CMS:</strong> Masukkan nilai rapor skala 0–100 untuk 20 mata pelajaran standar dari Semester 1 hingga Semester 5. Mata pelajaran yang tidak diambil oleh siswa dapat diisi <strong>0</strong> (otomatis tidak ikut dalam pembagi rata-rata). Klik <strong>Simpan</strong> agar nilai tersimpan di browser ini dan terbaca di halaman Checkpoint V1 (perubahan yang belum disimpan hilang saat halaman dimuat ulang).
        </div>

        {/* Dynamic Summary Cards */}
        <div className="summary-bar">
          <div className="summary-card">
            <div>
              <div className="summary-label">Rata-Rata Kumulatif (20 Mapel)</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {generalMetrics.filledCount} / {generalMetrics.totalSubjects} mapel terisi
              </div>
            </div>
            <div className="summary-val" style={{ color: 'var(--primary)' }}>{generalMetrics.overallAvg}</div>
          </div>

          {supportCards.map((g, i) => {
            const m = getMetrics(studentId, g.subjects);
            return (
              <div className="summary-card" key={g.key}>
                <div>
                  <div className="summary-label">Mapel Pendukung {g.prodi.replace(/^S1 /, '')} ({g.label})</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {g.subjects.join(' & ')} ({g.univs.join(' / ')})
                  </div>
                </div>
                <div className="summary-val" style={{ color: i === 0 ? 'var(--green-ink)' : 'var(--amber-ink)' }}>{m.supportAvg}</div>
              </div>
            );
          })}
        </div>

        {/* 20 Subjects Table */}
        <div className={isLocked ? 'table-container locked-region' : 'table-container'} inert={isLocked}>
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
                    <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: isFilled ? 'var(--ink)' : 'var(--muted)' }}>{subj.name}</strong>
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
                            onChange={(e) => updateSubjectScore(studentId, subj.id, sIdx, parseFloat(e.target.value))}
                          />
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 700, color: isFilled ? 'var(--primary)' : '#94a3b8' }}>
                      {avg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <Link to={`/v2?student=${studentId}`} className="btn btn-back">
            ← Kembali ke Versi 2
          </Link>
          <button type="button" className="btn btn-primary" disabled={isLocked} onClick={handleSave}>
            <Save size={15} /> Simpan Perubahan Rapor
          </button>
        </div>
      </main>
    </div>
  );
};
