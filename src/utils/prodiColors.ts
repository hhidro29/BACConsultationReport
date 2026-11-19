// Warna label jurusan: satu warna per jurusan (nama prodi) supaya terlihat jelas subtes ini penting untuk jurusan yang mana.
// Warna dipilih di luar merah/hijau agar tidak tertukar dengan status nilai.
export interface ProdiTone {
  text: string;
  bg: string;
  border: string;
}

const PALETTE: ProdiTone[] = [
  { text: '#6941c6', bg: '#f9f5ff', border: '#d6bbfb' },
  { text: '#175cd3', bg: '#eff8ff', border: '#84caff' },
  { text: '#c4320a', bg: '#fff6ed', border: '#f9b98a' },
  { text: '#c11574', bg: '#fdf2fa', border: '#fcaad9' }
];

export const prodiShortName = (prodi: string): string => prodi.replace(/^(S1|D4|D3)\s+/, '');

/** Peta nama prodi (tanpa S1/D4) ke warna, berurutan menurut kemunculan pertama di daftar pilihan jurusan. */
export function buildProdiToneMap(prodis: string[]): (name: string) => ProdiTone {
  const order: string[] = [];
  prodis.forEach((p) => {
    const n = prodiShortName(p);
    if (!order.includes(n)) order.push(n);
  });
  return (name: string) => PALETTE[Math.max(0, order.indexOf(name)) % PALETTE.length];
}
