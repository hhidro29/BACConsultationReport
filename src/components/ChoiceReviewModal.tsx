import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  School,
  Check,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ProgramChoice, Checkpoint1Student } from '../data/garudaData';
import {
  SimulatedProgramResult,
  validateSnbtChoices,
  OpportunityZone
} from '../data/programCatalog';

export interface ChoiceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Checkpoint1Student;
  activePrograms: ProgramChoice[];
  initialTargetIdx: number;
  newProgram: SimulatedProgramResult;
  scoreBasisLabel: string;
  onConfirmApply: (targetIdx: number, newChoice: ProgramChoice) => void;
}

const getZoneTheme = (zone: OpportunityZone) => {
  switch (zone) {
    case 'safe':
      return { textColor: '#027a48', borderColor: '#a6f4c5', boxBg: '#ecfdf3', boxBorder: '#a6f4c5' };
    case 'near':
      return { textColor: '#175cd3', borderColor: '#b2ddff', boxBg: '#eff8ff', boxBorder: '#b2ddff' };
    case 'target':
      return { textColor: '#b54708', borderColor: '#fedf89', boxBg: '#fffcf5', boxBorder: '#fef0c7' };
    case 'reach':
    default:
      return { textColor: '#b42318', borderColor: '#fecdca', boxBg: '#fffbfa', boxBorder: '#fee4e2' };
  }
};

export const ChoiceReviewModal: React.FC<ChoiceReviewModalProps> = ({
  isOpen,
  onClose,
  student,
  activePrograms,
  initialTargetIdx,
  newProgram,
  scoreBasisLabel,
  onConfirmApply
}) => {
  const [targetIdx, setTargetIdx] = useState<number>(initialTargetIdx);

  // Sync targetIdx if initialTargetIdx changes
  useEffect(() => {
    setTargetIdx(initialTargetIdx);
  }, [initialTargetIdx, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Current choice at targetIdx (if replacing)
  const oldChoice: ProgramChoice | undefined = activePrograms[targetIdx];
  const isReplacing = Boolean(oldChoice);
  const priorityLabel = `Pilihan ${targetIdx + 1}`;

  // Generate proposed choice
  const newChoice = useMemo<ProgramChoice>(() => {
    return newProgram.asProgramChoice(priorityLabel);
  }, [newProgram, priorityLabel]);

  // Generate proposed full list of choices
  const proposedPrograms = useMemo<ProgramChoice[]>(() => {
    const list = [...activePrograms];
    if (targetIdx < list.length) {
      list[targetIdx] = newChoice;
    } else {
      list.push(newChoice);
    }
    return list.map((p, idx) => ({ ...p, priority: `Pilihan ${idx + 1}` }));
  }, [activePrograms, targetIdx, newChoice]);

  // SNBT validation for proposed list
  const snbtValidation = useMemo(() => {
    return validateSnbtChoices(proposedPrograms);
  }, [proposedPrograms]);

  // Check ordering realism: Pilihan 1 target >= Pilihan 2 target
  const orderRealismWarning = useMemo(() => {
    if (proposedPrograms.length >= 2) {
      const p1 = proposedPrograms[0];
      const p2 = proposedPrograms[1];
      if (p2.targetScore > p1.targetScore) {
        return `Target Pilihan 2 (${p2.targetScore}) lebih tinggi daripada Pilihan 1 (${p1.targetScore}). Dalam strategi SNBT, tempatkan prodi dengan passing acuan paling tinggi di Pilihan 1.`;
      }
    }
    return null;
  }, [proposedPrograms]);

  if (!isOpen) return null;

  const newTheme = getZoneTheme(newProgram.zone);
  const gapDelta = oldChoice ? newProgram.gap - oldChoice.gap : null;
  const targetDelta = oldChoice ? newProgram.catalog.targetScore - oldChoice.targetScore : null;

  const handleConfirm = () => {
    onConfirmApply(targetIdx, newChoice);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          maxWidth: 760,
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(16, 120, 202, 0.25)',
                border: '1px solid #38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                Review Perubahan Pilihan SNBT
                <span
                  style={{
                    background: '#1078ca',
                    color: '#ffffff',
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999
                  }}
                >
                  {priorityLabel}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                Siswa: <strong style={{ color: '#f8fafc' }}>{student.name}</strong> • Basis skor: {scoreBasisLabel}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Batal / Tutup (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Target Slot Selector */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475467', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Terapkan Pilihan Baru ke Slot:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activePrograms.map((prog, idx) => {
                const isSelected = idx === targetIdx;
                return (
                  <button
                    key={prog.priority}
                    type="button"
                    onClick={() => setTargetIdx(idx)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid #1078ca' : '1px solid #d0d5dd',
                      background: isSelected ? '#eff8ff' : '#f8fafc',
                      color: isSelected ? '#1078ca' : '#475467',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>Pilihan {idx + 1}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: isSelected ? '#175cd3' : '#64748b' }}>
                      ({prog.prodi})
                    </span>
                  </button>
                );
              })}

              {activePrograms.length < 4 && (
                <button
                  type="button"
                  onClick={() => setTargetIdx(activePrograms.length)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: targetIdx === activePrograms.length ? '1.5px solid #1078ca' : '1px dashed #cbd5e1',
                    background: targetIdx === activePrograms.length ? '#eff8ff' : '#ffffff',
                    color: targetIdx === activePrograms.length ? '#1078ca' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>+ Tambah Pilihan {activePrograms.length + 1}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 500 }}>
                    ({activePrograms.length >= 2 ? 'Vokasi' : 'Baru'})
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Side-by-side Diff Comparison */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475467', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Komparasi Sebelum vs Sesudah Perubahan ({priorityLabel}):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Sisi Kiri: Sebelum (Saat Ini) */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: '#475467',
                      background: '#eaecf0',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}
                  >
                    SEBELUMNYA (SAAT INI)
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                    {oldChoice ? oldChoice.priority : `Slot Kosong`}
                  </span>
                </div>

                {oldChoice ? (
                  <>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                        {oldChoice.prodi}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#475467', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <School size={13} color="#64748b" />
                        <span>{oldChoice.univ}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10.5 }}>
                      <span style={{ background: '#e2e8f0', color: '#334155', padding: '1.5px 6px', borderRadius: 4, fontWeight: 600 }}>
                        {oldChoice.degree || 'S1'} • {oldChoice.rumpun?.toUpperCase() || 'SAINTEK'}
                      </span>
                      <span style={{ background: '#f1f5f9', color: '#475467', padding: '1.5px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={11} /> {oldChoice.city || student.identity.branch.split('-')[0].trim()} ({oldChoice.isOutOfTown ? 'Luar Kota' : 'Dalam Kota'})
                      </span>
                    </div>

                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: '8px 10px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        textAlign: 'center',
                        gap: 6
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Target Acuan</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{oldChoice.targetScore}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Skor Terbobot</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1078ca' }}>{oldChoice.weightedScore}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Selisih (Gap)</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: oldChoice.gap >= 0 ? '#027a48' : '#b42318' }}>
                          {oldChoice.gap >= 0 ? `+${oldChoice.gap}` : oldChoice.gap}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: '#475467', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>Status Kesiapan:</span>
                      <strong style={{ color: oldChoice.gap >= 0 ? '#027a48' : '#b42318' }}>
                        {oldChoice.status || (oldChoice.gap >= 0 ? 'Peluang Terbuka' : 'Butuh Peningkatan')}
                      </strong>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 6,
                      padding: 24,
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: 12
                    }}
                  >
                    Slot {priorityLabel} saat ini masih kosong (belum ada pilihan prodi yang disimpan).
                  </div>
                )}
              </div>

              {/* Sisi Kanan: Pengganti (Baru) */}
              <div
                style={{
                  background: '#f0f9ff',
                  border: '1.5px solid #1078ca',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(16, 120, 202, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: '#ffffff',
                      background: '#1078ca',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}
                  >
                    AKAN DITERAPKAN (PILIHAN BARU)
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1078ca' }}>
                    {priorityLabel}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                    {newProgram.catalog.prodi}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#475467', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <School size={13} color="#1078ca" />
                    <span>{newProgram.catalog.univ} ({newProgram.catalog.shortUniv})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10.5 }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1.5px 6px', borderRadius: 4, fontWeight: 700 }}>
                    {newProgram.catalog.degree} • {newProgram.catalog.rumpunName}
                  </span>
                  <span style={{ background: '#ffffff', border: '1px solid #b2ddff', color: '#0284c7', padding: '1.5px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={11} /> {newProgram.catalog.city} ({newProgram.isOutOfTown ? 'Luar Kota' : 'Dalam Kota / Jabodetabek'})
                  </span>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #b2ddff',
                    borderRadius: 6,
                    padding: '8px 10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    textAlign: 'center',
                    gap: 6
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Target Acuan</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      {newProgram.catalog.targetScore}
                      {targetDelta !== null && targetDelta !== 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: targetDelta < 0 ? '#027a48' : '#b42318', marginLeft: 3 }}>
                          ({targetDelta > 0 ? `+${targetDelta}` : targetDelta})
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Skor Terbobot</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1078ca' }}>{newProgram.weightedScore}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Selisih (Gap)</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: newTheme.textColor }}>
                      {newProgram.gap >= 0 ? `+${newProgram.gap}` : newProgram.gap}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#475467', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>Status Kesiapan:</span>
                  <strong style={{ color: newTheme.textColor }}>
                    {newProgram.statusText} ({newProgram.zoneLabel})
                  </strong>
                </div>
              </div>
            </div>

            {/* Delta Insight Banner */}
            {oldChoice && (
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: gapDelta !== null && gapDelta >= 0 ? '#ecfdf3' : '#fffcf5',
                  border: `1px solid ${gapDelta !== null && gapDelta >= 0 ? '#a6f4c5' : '#fedf89'}`,
                  fontSize: 11.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: gapDelta !== null && gapDelta >= 0 ? '#027a48' : '#b54708'
                }}
              >
                {gapDelta !== null && gapDelta >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <div>
                  <strong>Analisis Perubahan:</strong>{' '}
                  {gapDelta !== null && gapDelta > 0 ? (
                    <span>
                      Gap skor terpangkas <strong>+{gapDelta} poin</strong> (dari {oldChoice.gap} menjadi {newProgram.gap}). Target acuan lebih realistis untuk dikejar.
                    </span>
                  ) : gapDelta !== null && gapDelta < 0 ? (
                    <span>
                      Pilihan baru lebih kompetitif, target acuan lebih tinggi <strong>+{Math.abs(targetDelta || 0)} poin</strong>. Siswa butuh tambahan peningkatan skor terbobot.
                    </span>
                  ) : (
                    <span>Target acuan dan selisih skor setara dengan pilihan sebelumnya.</span>
                  )}
                  {oldChoice.isOutOfTown && !newProgram.isOutOfTown && (
                    <span style={{ marginLeft: 4 }}>
                      • <em>Kampus baru berada di dalam kota (selaras preferensi orang tua).</em>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Proposed Complete List Preview (1..4) */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475467', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Pratinjau Seluruh Formulasi Pilihan Setelah Perubahan ({proposedPrograms.length} Pilihan):
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475467', textAlign: 'left' }}>
                    <th style={{ padding: '7px 10px', width: '15%' }}>Pilihan</th>
                    <th style={{ padding: '7px 10px' }}>Program Studi &amp; PTN</th>
                    <th style={{ padding: '7px 10px', width: '16%', textAlign: 'center' }}>Target Acuan</th>
                    <th style={{ padding: '7px 10px', width: '16%', textAlign: 'center' }}>Skor Terbobot</th>
                    <th style={{ padding: '7px 10px', width: '16%', textAlign: 'center' }}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {proposedPrograms.map((prog, idx) => {
                    const isUpdatedSlot = idx === targetIdx;
                    return (
                      <tr
                        key={`${prog.priority}_${prog.prodi}`}
                        style={{
                          background: isUpdatedSlot ? '#f0f9ff' : idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          borderBottom: idx === proposedPrograms.length - 1 ? 'none' : '1px solid #f1f5f9'
                        }}
                      >
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: '#1078ca' }}>
                          {prog.priority}
                          {isUpdatedSlot && (
                            <span
                              style={{
                                marginLeft: 4,
                                background: '#1078ca',
                                color: '#ffffff',
                                fontSize: 9.5,
                                padding: '1px 5px',
                                borderRadius: 3,
                                fontWeight: 700
                              }}
                            >
                              BARU
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '7px 10px' }}>
                          <strong style={{ color: isUpdatedSlot ? '#0f172a' : '#1e293b' }}>{prog.prodi}</strong>
                          <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>— {prog.univ}</span>
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 700 }}>
                          {prog.targetScore}
                        </td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 700, color: '#1078ca' }}>
                          {prog.weightedScore}
                        </td>
                        <td
                          style={{
                            padding: '7px 10px',
                            textAlign: 'center',
                            fontWeight: 800,
                            color: prog.gap >= 0 ? '#027a48' : '#b42318'
                          }}
                        >
                          {prog.gap >= 0 ? `+${prog.gap}` : prog.gap}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SNBT Regulation & Order Realism Check */}
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  background: snbtValidation.isValid ? '#ecfdf3' : '#fff7ed',
                  border: `1px solid ${snbtValidation.isValid ? '#a6f4c5' : '#fed7aa'}`,
                  color: snbtValidation.isValid ? '#027a48' : '#9a3412',
                  fontWeight: 600
                }}
              >
                {snbtValidation.isValid ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>
                  <strong>Regulasi SNBT 2026/2027:</strong> {snbtValidation.message}
                </span>
              </div>

              {orderRealismWarning && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '7px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    lineHeight: 1.35
                  }}
                >
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>{orderRealismWarning}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Perubahan akan otomatis tersinkron ke Laporan Konsultasi &amp; Cetak PDF A4.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#344054',
                background: '#ffffff',
                border: '1px solid #d0d5dd',
                cursor: 'pointer'
              }}
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 700,
                color: '#ffffff',
                background: '#1078ca',
                border: '1px solid #1078ca',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
              }}
            >
              <Check size={16} />
              Konfirmasi &amp; Terapkan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
