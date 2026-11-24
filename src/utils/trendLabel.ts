// Label tren berpola urutan untuk PDF halaman 2 (mengikuti draft kesiswaan), dihasilkan dari aturan, bukan teks bebas.
// Contoh: [naik, turun, turun] -> "Naik, Lalu Terus Menurun"; [turun, turun, turun] -> "Terus Menurun".
// Perubahan antar-TO dibaca per langkah (tanpa toleransi): lebih tinggi = naik, lebih rendah = turun, sama = stabil.
export function trendSequenceLabel(scores: number[]): string {
  const valid = scores.filter((n) => Number.isFinite(n));
  if (valid.length < 2) return '';
  const dirs = valid.slice(1).map((v, i) => {
    const d = v - valid[i];
    return d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
  });
  const runs: { dir: string; n: number }[] = [];
  dirs.forEach((dir) => {
    const last = runs[runs.length - 1];
    if (last && last.dir === dir) last.n += 1;
    else runs.push({ dir, n: 1 });
  });
  const words = runs.map((r, i) => {
    if (r.dir === 'up') return r.n === 1 ? 'Naik' : 'Terus Naik';
    if (r.dir === 'down') {
      if (r.n === 1) return 'Turun';
      return i === 0 && runs.length > 1 ? 'Menurun' : 'Terus Menurun';
    }
    return r.n === 1 ? 'Stabil' : 'Tetap Stabil';
  });
  if (words.length === 1) return words[0];
  return `${words.slice(0, -1).join(', ')}, Lalu ${words[words.length - 1]}`;
}
