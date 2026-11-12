import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { Button, Pill, toneForGap } from './ui';

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

  // Move focus into the dialog, lock page scroll, and restore both on close
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

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

  // Block saving the same prodi twice (in a different slot than the one being replaced)
  const normKey = (p: { prodi: string; univ: string }) =>
    `${p.prodi}|${p.univ}`.toLowerCase().replace(/[^a-z0-9|]/g, '');
  const isDuplicateChoice = activePrograms.some(
    (p, idx) => idx !== targetIdx && normKey(p) === normKey(newChoice)
  );

  if (!isOpen) return null;

  const newTheme = getZoneTheme(newProgram.zone);
  const gapDelta = oldChoice ? newProgram.gap - oldChoice.gap : null;
  const targetDelta = oldChoice ? newProgram.catalog.targetScore - oldChoice.targetScore : null;

  const handleConfirm = () => {
    if (isDuplicateChoice) return;
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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Review perubahan pilihan jurusan"
        tabIndex={-1}
        style={{
          outline: 'none',
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
            aria-label="Tutup"
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
              Terapkan pilihan baru ke slot:
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
              Perbandingan sebelum dan sesudah perubahan ({priorityLabel}):
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
                    PILIHAN SAAT INI
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                    {oldChoice ? oldChoice.priority : `Slot kosong`}
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
                        <div style={{ fontSize: 10, color: '#64748b' }}>Target acuan</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{oldChoice.targetScore}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Skor terbobot</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1078ca' }}>{oldChoice.weightedScore}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Jarak target</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: oldChoice.gap >= 0 ? '#027a48' : '#b42318' }}>
                          {oldChoice.gap > 0 ? `+${oldChoice.gap}` : oldChoice.gap}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: '#475467', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>Status kesiapan:</span>
                      <strong style={{ color: oldChoice.gap >= 0 ? '#027a48' : '#b42318' }}>
                        {oldChoice.status || (oldChoice.gap >= 0 ? 'Sudah tercapai' : 'Perlu diperkuat')}
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
                    PILIHAN BARU
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
                    <div style={{ fontSize: 10, color: '#64748b' }}>Target acuan</div>
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
                    <div style={{ fontSize: 10, color: '#64748b' }}>Skor terbobot</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1078ca' }}>{newProgram.weightedScore}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Jarak target</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: newTheme.textColor }}>
                      {newProgram.gap > 0 ? `+${newProgram.gap}` : newProgram.gap}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#475467', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>Status kesiapan:</span>
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
                  <strong>Analisis perubahan:</strong>{' '}
                  <span>
                    {targetDelta === 0 || targetDelta === null
                      ? 'Target acuan setara dengan pilihan sebelumnya'
                      : targetDelta < 0
                      ? `Target acuan lebih rendah ${Math.abs(targetDelta)}`
                      : `Target acuan lebih tinggi ${targetDelta}`}
                    {gapDelta === null || gapDelta === 0
                      ? '; jarak ke target acuan tidak berubah.'
                      : gapDelta > 0
                      ? `; jarak ke target acuan memendek ${gapDelta} (dari ${oldChoice.gap > 0 ? `+${oldChoice.gap}` : oldChoice.gap} menjadi ${newProgram.gap > 0 ? `+${newProgram.gap}` : newProgram.gap}).`
                      : `; jarak ke target acuan melebar ${Math.abs(gapDelta)} (dari ${oldChoice.gap > 0 ? `+${oldChoice.gap}` : oldChoice.gap} menjadi ${newProgram.gap > 0 ? `+${newProgram.gap}` : newProgram.gap}), siswa memerlukan peningkatan lebih besar.`}
                  </span>
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
              Pratinjau seluruh formulasi pilihan setelah perubahan ({proposedPrograms.length} pilihan):
            </div>

            <div className="rg-table-wrap">
              <table className="rg-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Pilihan</th>
                    <th>Program studi &amp; PTN</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>Target acuan</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>Skor terbobot</th>
                    <th style={{ width: '16%', textAlign: 'center' }}>Jarak target</th>
                  </tr>
                </thead>
                <tbody>
                  {proposedPrograms.map((prog, idx) => {
                    const isUpdatedSlot = idx === targetIdx;
                    return (
                      <tr
                        key={`${prog.priority}_${prog.prodi}`}
                        className={isUpdatedSlot ? 'is-selected' : undefined}
                      >
                        <td style={{ fontWeight: 700, color: '#1078ca' }}>
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
                        <td>
                          <strong style={{ color: isUpdatedSlot ? '#0f172a' : '#1e293b' }}>{prog.prodi}</strong>
                          <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>— {prog.univ}</span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {prog.targetScore}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#1078ca' }}>
                          {prog.weightedScore}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Pill tone={toneForGap(prog.gap)}>
                            {prog.gap > 0 ? `+${prog.gap}` : prog.gap}
                          </Pill>
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
                  <strong>Regulasi SNBT:</strong> {snbtValidation.message}
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
          <div style={{ fontSize: 11, color: isDuplicateChoice ? '#b42318' : '#64748b', fontWeight: isDuplicateChoice ? 700 : 400 }}>
            {isDuplicateChoice
              ? 'Program studi ini sudah dipilih di slot lain. Pilih program studi yang berbeda.'
              : 'Perubahan akan otomatis tersinkron ke laporan konsultasi dan lembar cetak PDF A4.'}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button onClick={onClose}>
              Batal
            </Button>

            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={isDuplicateChoice}
              icon={<Check size={16} />}
              title={isDuplicateChoice ? 'Program studi ini sudah ada di slot pilihan lain' : undefined}
            >
              Konfirmasi &amp; terapkan pilihan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
