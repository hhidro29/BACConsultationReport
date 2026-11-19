// Sumber bersama untuk Action Plan (PDF V2 dan panduan SA di dashboard): batas kelompok selisih dan kalimat tindak lanjut.
// Sementara berupa konstanta; rencananya dipindah ke template /engine agar bisa diedit tim kesiswaan.

// Kelompok Action Plan: hanya dua (sesuai simulasi 18 Nov): belum mencapai standar dasar, atau sudah mencapai.
// Urutan di dalam kelompok "belum" mengikuti nilai TO terakhir dari yang terendah.
export type GapTier = 0 | 1;

/** 0 = sudah mencapai standar dasar; 1 = belum. */
export function gapTierOf(score: number, foundationTarget: number): GapTier {
  return foundationTarget - score <= 0 ? 0 : 1;
}

export function gapTierTitle(tier: GapTier, foundationTarget: number): string {
  return tier === 0 ? `Sudah mencapai ≥ ${foundationTarget}` : `Belum mencapai ${foundationTarget} (urut dari nilai terendah)`;
}

// Target drill per subtes menurut urutan nilai TO terakhir di antara subtes yang belum mencapai standar dasar
// (keputusan 18 Nov: 20 / 15 / 12, sisanya 10 soal benar per minggu).
export interface DrillRankConfig {
  drillRank1: number;
  drillRank2: number;
  drillRank3: number;
  minDrillPerSubtest: number;
}

/** rankIndex: 0 = subtes dengan nilai terendah. */
export function drillTargetForRank(rankIndex: number, cfg: DrillRankConfig): number {
  if (rankIndex === 0) return cfg.drillRank1;
  if (rankIndex === 1) return cfg.drillRank2;
  if (rankIndex === 2) return cfg.drillRank3;
  return cfg.minDrillPerSubtest;
}

export function drillTotalForCount(weakCount: number, cfg: DrillRankConfig): number {
  let total = 0;
  for (let i = 0; i < weakCount; i += 1) total += drillTargetForRank(i, cfg);
  return total;
}

/** Kalimat penjelas aturan target, dipakai di PDF, dashboard, dan template engine. */
export function drillTiersText(cfg: DrillRankConfig): string {
  return `${cfg.drillRank1}, ${cfg.drillRank2}, dan ${cfg.drillRank3} soal benar untuk tiga subtes dengan nilai terendah, ${cfg.minDrillPerSubtest} untuk subtes lainnya`;
}

/** Target jurusan tertinggi di antara jurusan yang menjadikan subtes ini prioritas (kartu "Jaga di atas 600"). */
export interface PriorityGoal {
  prodi: string;
  target: number;
  kurang: number;
}

export function achievedNextTarget(goal: PriorityGoal | undefined, foundationTarget: number): string {
  if (!goal) return `Tetap di atas ${foundationTarget} di setiap TO`;
  return goal.kurang > 0
    ? `Jaga di atas ${foundationTarget} dan kejar target skor ${goal.target} untuk pilihan ${goal.prodi}`
    : `Jaga di atas ${foundationTarget}; skor sudah mencapai target ${goal.target} untuk pilihan ${goal.prodi}`;
}

export const ACTION_PLAN_COPY = {
  achievedNote: 'Subtes ini sudah mencapai 600, tetapi tetap perlu dijaga dan masih bisa dinaikkan untuk mengejar skor jurusan.',
  achievedBadge: (gap: number, target: number) => `+${gap} dari ${target}`,
  followUpDefault: 'Evaluasi pola kesalahan dan latih ulang jenis soal yang sering salah.',
  // Saran khusus per subtes. Dari draft kesiswaan: pu, pk, lbe, pbm, lbi_s. Rumusan saya (perlu ditinjau): lbi_a, pm, ppu.
  followUpSpecific: {
    pu: 'Catat pola kesalahan dan bahas soal yang sulit.',
    pk: 'Ulangi soal yang salah sampai benar dan pahami cara penyelesaiannya.',
    lbi_a: 'Evaluasi pola kesalahan dan latih ulang jenis soal yang sering salah.',
    lbe: 'Telusuri setiap jawaban salah ke kalimat pendukung dalam bacaan.',
    pbm: 'Catat jenis soal yang paling sering salah dan bahas cara memperbaikinya.',
    lbi_s: 'Kerjakan satu set soal lengkap dan evaluasi jawaban yang masih salah.',
    pm: 'Latih ulang soal cerita dan periksa langkah hitung di tiap soal.',
    ppu: 'Perluas bacaan umum dan bahas materi yang sering salah.'
  } as Record<string, string>
};
