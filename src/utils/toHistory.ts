// Riwayat Tryout per subtes. Siswa tidak selalu punya 4 TO lengkap: TO 1-3 boleh kosong (null), TO terbaru selalu ada.
export interface SubtestHistorySlots {
  to1: number | null;
  to2: number | null;
  to3: number | null;
  to4: number;
}

/** Nilai TO yang ada, berurutan dari TO terlama ke terbaru. */
export function subtestScores(s: SubtestHistorySlots): number[] {
  return [s.to1, s.to2, s.to3, s.to4].filter((n): n is number => typeof n === 'number');
}

/** Tampilan sel nilai TO: tanda "–" bila siswa tidak mengikuti TO itu. */
export const fmtTo = (v: number | null): string => (v === null ? '–' : String(v));

/** Median dari nilai yang ada; null bila tidak ada nilai. */
export function medianOfPresent(values: (number | null)[]): number | null {
  const v = values.filter((n): n is number => typeof n === 'number').sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 === 0 ? (v[mid - 1] + v[mid]) / 2 : v[mid];
}

/** Median riwayat baru bermakna mulai 3 TO (usulan; perlu dikonfirmasi kesiswaan). */
export const MIN_TO_FOR_MEDIAN = 3;
