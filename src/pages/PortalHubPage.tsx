import React from 'react';
import { Link } from 'react-router-dom';
import { RouterTopbar } from '../components/RouterTopbar';

export const PortalHubPage: React.FC = () => {
  return (
    <div style={{
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <RouterTopbar />

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 20px 64px' }}>
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#1e3a8a',
            color: '#93c5fd',
            border: '1px solid #2563eb',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 9999,
            marginBottom: 14,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            React Single-Page App • Option 2
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: 8 }}>
            Portal Konsultasi Checkpoint 1 &amp; Laporan SA
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 680, margin: '0 auto' }}>
            Pilih versi rancangan Information Architecture (IA) dan alur konsultasi untuk ditinjau bersama tim akademik dan stakeholder. Perpindahan antar versi kini berjalan instan dalam satu SPA.
          </p>
        </header>

        {/* Quick Route Bar */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '10px 16px',
          marginBottom: 30,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
            ⚡ <strong>Pintas Rute SPA:</strong> Klik untuk berpindah tanpa reload:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Link to="/v2" style={{ background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, textDecoration: 'none', border: '1px solid #3b82f6' }}>
              ⚡ Versi 2 (/v2)
            </Link>
            <Link to="/v1" style={{ background: '#334155', color: '#e2e8f0', padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, textDecoration: 'none', border: '1px solid #475467' }}>
              📊 Versi 1 (/v1)
            </Link>
            <Link to="/rapor" style={{ background: '#334155', color: '#e2e8f0', padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, textDecoration: 'none', border: '1px solid #475467' }}>
              📝 Rapor 20 Mapel (/rapor)
            </Link>
          </div>
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 20, marginBottom: 32 }}>
          {/* Card V2 */}
          <div style={{
            background: 'linear-gradient(180deg, #1e293b 0%, #172554 100%)',
            border: '2px solid #2563eb',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                <span style={{ background: '#1d4ed8', color: '#dbeafe', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>Versi 2 (Terbaru)</span>
                <span style={{ background: '#065f46', color: '#a7f3d0', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>Rekomendasi Tim Akademik</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                🎯 Usulan Tim Akademik (Target 600)
              </h2>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
                Rancangan Information Architecture baru berbasis strategi Semester 1 (fondasi 600 poin), pemisahan Skor IRT Reguler vs Terbobot PTN, integrasi drill Ruangguru, dan 4 tahap pembawaan SA.
              </p>
              <ul style={{ listStyle: 'none', fontSize: 12, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #334155', paddingTop: 12, paddingLeft: 0 }}>
                <li>✓ <strong>Skor Reguler vs Terbobot:</strong> Pemisahan jelas antara kemampuan dasar dan bobot PTN.</li>
                <li>✓ <strong>Visual Progress 400..700:</strong> Bar progress horizontal dengan garis patokan 600.</li>
                <li>✓ <strong>4 Subtes Prioritas:</strong> Dikorelasikan dengan jumlah soal &amp; akurasi di Ruangguru.</li>
                <li>✓ <strong>Dashboard SA 4 Tahap:</strong> Panduan pembawaan internal Kakak Asuh.</li>
                <li>✓ <strong>Laporan Cetak PDF:</strong> Presisi 2 halaman A4 untuk siswa dan orang tua.</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              <Link to="/v2" style={{ flex: 1, minWidth: 130, textAlign: 'center', background: '#2563eb', color: '#fff', border: '1px solid #3b82f6', padding: '9px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 6, textDecoration: 'none' }}>
                Buka Dashboard SA (V2) ➔
              </Link>
              <Link to="/v2?preview=1" style={{ textAlign: 'center', background: '#334155', color: '#f1f5f9', border: '1px solid #475467', padding: '9px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 6, textDecoration: 'none' }}>
                📄 Cetak PDF
              </Link>
            </div>
          </div>

          {/* Card V1 */}
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                <span style={{ background: '#475467', color: '#f1f5f9', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>Versi 1 (Baseline)</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                📊 Baseline Tren Skor Historis
              </h2>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
                Rancangan Information Architecture awal yang berfokus pada evaluasi tren pergerakan skor dari TO 1 ke TO 4, evaluasi 8 subtes, dan tab komparasi 3 pilihan prodi.
              </p>
              <ul style={{ listStyle: 'none', fontSize: 12, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #334155', paddingTop: 12, paddingLeft: 0 }}>
                <li>✓ <strong>Evaluasi Tren TO:</strong> Menyoroti penurunan skor 55 poin dari TO 1 (601) ke TO 4 (546).</li>
                <li>✓ <strong>Tab Pilihan 1 / 2 / 3:</strong> Tab terpisah untuk membedah masing-masing prodi pilihan.</li>
                <li>✓ <strong>Catatan SA 7 Poin:</strong> Formulir dokumentasi komprehensif bagi Kakak Asuh.</li>
                <li>✓ <strong>Laporan Cetak PDF:</strong> Dokumen 2 halaman A4 dengan tabel histori lengkap.</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              <Link to="/v1" style={{ flex: 1, minWidth: 130, textAlign: 'center', background: '#334155', color: '#f1f5f9', border: '1px solid #475467', padding: '9px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 6, textDecoration: 'none' }}>
                Buka Dashboard SA (V1) ➔
              </Link>
              <Link to="/v1?preview=1" style={{ textAlign: 'center', background: '#334155', color: '#f1f5f9', border: '1px solid #475467', padding: '9px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 6, textDecoration: 'none' }}>
                📄 Cetak PDF
              </Link>
            </div>
          </div>

          {/* Card Rapor */}
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                <span style={{ background: '#854d0e', color: '#fef08a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>Modul Pendukung</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                📝 Update Nilai Rapor 20 Mapel
              </h2>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
                Modul kalkulator dan editor interaktif nilai rapor SMA untuk 20 mata pelajaran (Semester 1–5). Perubahan tersinkronisasi langsung dengan dashboard.
              </p>
              <ul style={{ listStyle: 'none', fontSize: 12, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #334155', paddingTop: 12, paddingLeft: 0 }}>
                <li>✓ <strong>20 Mapel Lengkap:</strong> Edit nilai per semester dengan validasi rentang nilai 0–100.</li>
                <li>✓ <strong>Kalkulasi Otomatis:</strong> Rata-rata semester, mapel, dan kumulatif real-time.</li>
                <li>✓ <strong>Adaptif Prodi:</strong> Pembobotan mapel pendukung prodi UGM / UI / ITB otomatis.</li>
                <li>✓ <strong>Sinkronisasi Context + Storage:</strong> Langsung update ke state dashboard.</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              <Link to="/rapor" style={{ flex: 1, textAlign: 'center', background: '#334155', color: '#f1f5f9', border: '1px solid #475467', padding: '9px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 6, textDecoration: 'none' }}>
                Buka Editor Rapor ➔
              </Link>
            </div>
          </div>
        </div>

        {/* Archive Section */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '18px 22px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#cbd5e1', marginBottom: 10 }}>
            📁 Arsip Eksplorasi Desain Awal &amp; Alat Bantu Statis:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <a href="./legacy/Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Guided%20Report.html" target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#38bdf8', textDecoration: 'none' }}>
              📑 Guided Report Konsultasi
            </a>
            <span style={{ color: '#475467' }}>•</span>
            <a href="./legacy/Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Meeting%20Mode.html" target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#38bdf8', textDecoration: 'none' }}>
              🤝 Meeting Mode Konsultasi
            </a>
            <span style={{ color: '#475467' }}>•</span>
            <a href="./legacy/Simulasi%20Wording%20SA%20-%20Tryout.html" target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#38bdf8', textDecoration: 'none' }}>
              💬 Simulator Wording SA (Tryout)
            </a>
          </div>
        </div>

        <footer style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 40 }}>
          Ruangguru Konsultasi Checkpoint 1 • React + Vite SPA Architecture • 2026
        </footer>
      </div>
    </div>
  );
};
