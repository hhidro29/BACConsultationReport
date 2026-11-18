// Sumber bersama untuk Action Plan (PDF V2 dan panduan SA di dashboard): batas kelompok selisih dan kalimat tindak lanjut.
// Sementara berupa konstanta; rencananya dipindah ke template /engine agar bisa diedit tim kesiswaan.

// Batas kelompok menurut selisih ke standar dasar (poin). Perkiraan dari pola draft kesiswaan; perlu dikonfirmasi tim.
export const TIER1_MIN_GAP = 90; // selisih >= 90 -> kelompok selisih terbesar
export const TIER2_MIN_GAP = 30; // 30..89 -> selisih sedang; di bawah 30 -> selisih kecil

export type GapTier = 0 | 1 | 2 | 3;

/** 0 = sudah mencapai standar dasar; 1 = selisih terbesar; 2 = sedang; 3 = kecil. */
export function gapTierOf(score: number, foundationTarget: number): GapTier {
  const miss = foundationTarget - score;
  if (miss <= 0) return 0;
  if (miss >= TIER1_MIN_GAP) return 1;
  if (miss >= TIER2_MIN_GAP) return 2;
  return 3;
}

// Judul kelompok tanpa angka urut supaya artinya sama untuk semua siswa (kelompok kosong disembunyikan).
export function gapTierTitle(tier: GapTier, foundationTarget: number): string {
  if (tier === 0) return `Pertahankan: sudah mencapai ${foundationTarget}`;
  if (tier === 1) return `Selisih terbesar (${TIER1_MIN_GAP} poin atau lebih)`;
  if (tier === 2) return `Selisih sedang (${TIER2_MIN_GAP}–${TIER1_MIN_GAP - 1} poin)`;
  return `Selisih kecil (kurang dari ${TIER2_MIN_GAP} poin)`;
}

export const ACTION_PLAN_COPY = {
  achievedNote: 'Pertahankan melalui TO berikutnya.',
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
