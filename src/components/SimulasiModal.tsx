import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Compass, Info } from 'lucide-react';
import { programCatalogV1 } from '../data/v1Data';

interface SimulasiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ScoreBasis = 'to4' | 'avg';
type FilterMode = 'all' | 'farmasi' | 'jabar';

export const SimulasiModal: React.FC<SimulasiModalProps> = ({ isOpen, onClose }) => {
  const [scoreBasis, setScoreBasis] = useState<ScoreBasis>('to4');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

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

  if (!isOpen) return null;

  const activeScore = scoreBasis === 'to4' ? 546 : 571;
  const allPrograms = Object.values(programCatalogV1);

  const filteredPrograms = allPrograms.filter((p) => {
    if (filterMode === 'farmasi') {
      return p.rumpun.toLowerCase().includes('farmasi') || p.rumpun.toLowerCase().includes('sains');
    }
    if (filterMode === 'jabar') {
      return p.city.includes('Jawa Barat');
    }
    return true;
  });

  const currentChoiceTag = (id: string) => {
    if (id === 'ugm_farmasi') return 'Pilihan 1';
    if (id === 'ui_farmasi') return 'Pilihan 2';
    if (id === 'itb_mesin') return 'Pilihan 3';
    return null;
  };

  return createPortal(
    <div
      className="pdf-modal-backdrop open"
      aria-hidden="false"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '94%',
          maxWidth: 960,
          maxHeight: '90vh',
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            background: '#0f172a',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Compass size={19} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Simulasi Peluang &amp; Komparasi Prodi PTN</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#7dd3fc',
                padding: '2px 8px',
                borderRadius: 9999
              }}
            >
              Pre-filtered: Garuda Mahawira Sena · Saintek
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: 6,
              padding: '5px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <X size={15} /> Tutup
          </button>
        </div>

        {/* Controls Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475467' }}>Basis Skor Siswa:</span>
            <button
              type="button"
              onClick={() => setScoreBasis('to4')}
              className={`btn ${scoreBasis === 'to4' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Skor TO 4 Terakhir (546)
            </button>
            <button
              type="button"
              onClick={() => setScoreBasis('avg')}
              className={`btn ${scoreBasis === 'avg' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Rata-rata Tryout (571)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475467' }}>Filter:</span>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`btn ${filterMode === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Semua ({allPrograms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('farmasi')}
              className={`btn ${filterMode === 'farmasi' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Serumpun Farmasi/Sains
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('jabar')}
              className={`btn ${filterMode === 'jabar' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Jabodetabek &amp; Jawa Barat
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          <div className="table-container" style={{ marginTop: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '34%' }}>Program Studi &amp; Perguruan Tinggi</th>
                  <th style={{ width: '13%', textAlign: 'center' }}>Target Acuan</th>
                  <th style={{ width: '14%', textAlign: 'center' }}>Selisih vs {activeScore}</th>
                  <th style={{ width: '17%', textAlign: 'center' }}>Kompetisi</th>
                  <th style={{ width: '22%' }}>Subtes Penentu Utama</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((prog) => {
                  const diff = activeScore - prog.targetScore;
                  const choiceTag = currentChoiceTag(prog.id);
                  const isClose = diff >= -65;

                  return (
                    <tr key={prog.id} style={choiceTag ? { background: '#f8fafc' } : undefined}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <strong style={{ color: '#0f172a', fontSize: 13 }}>{prog.fullTitle}</strong>
                          {choiceTag && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                background: '#dbeafe',
                                color: '#1e40af',
                                padding: '1px 6px',
                                borderRadius: 4
                              }}
                            >
                              {choiceTag}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {prog.city} · {prog.rumpun}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                        {prog.targetScore}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: 13.5,
                          color: isClose ? '#027a48' : diff >= -110 ? '#b54708' : '#b42318'
                        }}
                      >
                        {diff > 0 ? `+${diff}` : diff} poin
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 11.5, color: '#334155' }}>
                        <div>Keketatan: <strong>{prog.tightness}</strong></div>
                        <div style={{ color: '#64748b', fontSize: 11 }}>Kursi: {prog.quota2026} · {prog.leaderboardRank}</div>
                      </td>
                      <td style={{ fontSize: 11.5, color: '#334155' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {prog.prioritySubtests.map((sub) => (
                            <span
                              key={sub}
                              style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '1px 6px',
                                borderRadius: 4,
                                textTransform: 'uppercase'
                              }}
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 3 }}>
                          Mapel Rapor: {prog.supportSubjects.join(', ')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mandatory Disclaimer */}
          <div
            style={{
              marginTop: 14,
              background: '#fffaeb',
              border: '1px solid #fedf89',
              borderLeft: '4px solid #f79009',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontSize: 11.5,
              color: '#93370d',
              lineHeight: 1.5
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Disclaimer Acuan Internal:</strong> Angka target dan posisi peringkat di atas merupakan benchmark peserta internal Ruangguru (bukan passing grade resmi SNPMB atau jaminan kelolosan personal). Gunakan tampilan ini bersama siswa &amp; orang tua untuk membandingkan opsi serumpun dan kesiapan lokasi.
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
