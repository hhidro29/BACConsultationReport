// Data contoh topik per subtes untuk prototipe (siswa fiktif), BUKAN data siswa nyata.
// Di produksi, topik prioritas diambil dari hasil TO per subtes (persentase benar per topik), sehingga datanya ada untuk
// semua subtes. Sampai integrasi itu tersedia, nilai contoh dibangkitkan dengan aturan tetap (tanpa AI, tanpa jaringan):
// persentase benar tiap topik diturunkan dari hash id siswa + subtes + topik, jadi hasilnya selalu sama untuk siswa yang sama.
// Fungsi ini hanya dipanggil bila data topik asli tidak ada.

const SUBTEST_TOPICS: Record<string, string[]> = {
  pu: ['Penalaran Induktif', 'Silogisme & Logika Deduktif', 'Penalaran Analitik (Pola & Susunan)', 'Penarikan Kesimpulan'],
  pk: ['Aljabar & Fungsi Pecahan', 'Statistika & Peluang Dasar', 'Perbandingan & Persentase', 'Barisan & Deret'],
  pm: ['Pemodelan Linear', 'Aritmatika Sosial & Rasio', 'Geometri & Pengukuran', 'Fungsi & Grafik'],
  lbi_a: ['Menemukan Gagasan Utama', 'Inferensi pada Teks Sains', 'Kohesi & Koherensi Paragraf', 'Membaca Grafik & Data dalam Teks'],
  lbi_s: ['Menemukan Gagasan Utama', 'Inferensi pada Teks Sosial', 'Menilai Argumen Penulis', 'Kohesi & Koherensi Paragraf'],
  lbe: ['Reading Comprehension', 'Vocabulary in Context', 'Main Idea & Inference', 'Sentence Completion'],
  pbm: ['Ejaan & Tanda Baca (PUEBI)', 'Kalimat Efektif', 'Struktur Paragraf', 'Penggunaan Kata Baku'],
  ppu: ['Pengetahuan Umum Sains & Teknologi', 'Isu Sosial & Kewarganegaraan', 'Sejarah & Geografi', 'Ekonomi & Budaya']
};

function hash32(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Dua topik dengan persentase benar terendah (contoh) untuk satu subtes siswa.
 * Format sama dengan data asli: "Nama Topik (NN% benar)". Kosong bila subtes tidak dikenal.
 */
export function sampleLowestTopics(studentId: string, subtestId: string, count = 2): string[] {
  const topics = SUBTEST_TOPICS[subtestId];
  if (!topics) return [];
  return topics
    .map((name) => ({ name, pct: 25 + (hash32(`${studentId}|${subtestId}|${name}`) % 31) }))
    .sort((a, b) => a.pct - b.pct || a.name.localeCompare(b.name))
    .slice(0, count)
    .map((t) => `${t.name} (${t.pct}% benar)`);
}
