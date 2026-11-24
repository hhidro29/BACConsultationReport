// Posisi (peringkat TO) untuk prototipe. SIMULASI, bukan data peringkat asli.
// Sumber peserta: participantsCount di src/data/programCatalog.ts (data prototipe, belum diverifikasi).
// Rumus: peringkat = peserta × (1 − min(1, skor ÷ target)). Skor lebih dekat target → peringkat lebih depan.
// Ganti dengan peringkat asli bila sumber leaderboard TO sudah bisa diakses.
export const POSITION_SOURCE_NOTE =
  'Peringkat TO: data simulasi prototipe (rumus skor ÷ target × peserta). Peserta per pilihan: data prototipe (participantsCount, programCatalog.ts). Daya tampung dan peminat: data prototipe programCatalog.ts, belum diverifikasi.';

export function simulatedRank(score: number, target: number, participants: number): number {
  if (!participants || participants <= 0) return 0;
  const ratio = target > 0 ? Math.min(1, Math.max(0, score / target)) : 0;
  return Math.min(participants, Math.max(1, Math.round(participants * (1 - ratio))));
}

// Contoh peringkat tetap dari simulasi kesiswaan (draft S1-S1-D4-D3). Kunci: `${studentId}|${catalogId}`.
// Tanpa entri di sini, peringkat memakai rumus simulatedRank.
const SAMPLE_RANKS: Record<string, number> = {
  'garuda|polban_tm_d4': 75,
  'garuda|pnj_tm_d3': 85
};

export function rankFor(studentId: string, catalogId: string | undefined, score: number, target: number, participants: number): number {
  const sample = catalogId ? SAMPLE_RANKS[`${studentId}|${catalogId}`] : undefined;
  return sample ?? simulatedRank(score, target, participants);
}
