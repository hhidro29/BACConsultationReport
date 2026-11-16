import type { Checkpoint1Student } from '../data/garudaData';
import type { DerivedPrioritySubtest } from '../data/programCatalog';
import { STUDENT_DRILL_DATA } from '../data/drillData';

export interface DrillTableRow {
  id: string;
  name: string;
  target: number;
  to: number;
  questions: number;
  sessions: number;
  accuracyPct: number;
  hasData: boolean;
  isPriority: boolean;
  tag: string;
}

/**
 * Baris tabel "Target & drill" yang dipakai bersama oleh PDF dan dashboard SA:
 * 1) subtes prioritas Pilihan 1 (urut prioritas, target = target acuan),
 * 2) subtes lain yang masih di bawah standar dasar (urut selisih terdalam, target = standar dasar).
 * Data drill: data prioritas yang sudah ada -> data contoh per siswa -> ditandai belum tercatat.
 */
export function buildDrillTableRows(
  student: Checkpoint1Student,
  prioritySubtests: DerivedPrioritySubtest[],
  foundationTarget: number
): DrillTableRow[] {
  const sorted = [...student.subtests].sort((a, b) => a.gap - b.gap || a.to4 - b.to4);
  const below = sorted.filter((s) => s.to4 < foundationTarget);

  const priorityRows: DrillTableRow[] = prioritySubtests.map((p) => ({
    id: p.id,
    name: p.name,
    target: p.targetScore,
    to: p.toLatestNum,
    questions: p.rgQuestionsDone,
    sessions: p.drillSessions,
    accuracyPct: p.drillAccuracyPct,
    hasData: true,
    isPriority: true,
    tag: `${p.priorityLabel} · target acuan`
  }));

  const otherRows: DrillTableRow[] = below
    .filter((s) => !prioritySubtests.some((p) => p.id === s.id))
    .map((s) => {
      const d = STUDENT_DRILL_DATA[student.id]?.[s.id];
      return {
        id: s.id,
        name: s.name,
        target: foundationTarget,
        to: s.to4,
        questions: d?.questions ?? 0,
        sessions: d?.sessions ?? 0,
        accuracyPct: d?.accuracyPct ?? 0,
        hasData: !!d,
        isPriority: false,
        tag: `Target dasar ${foundationTarget}`
      };
    });

  return [...priorityRows, ...otherRows];
}
