// 20 Standard Super CMS High School Subjects & Rapor Calculation Logic

export interface RaporSubject {
  id: string;
  name: string;
  scores: number[]; // 5 semesters: [Smt 1, Smt 2, Smt 3, Smt 4, Smt 5]
}

export const defaultRaporData: RaporSubject[] = [
  { id: "antropologi", name: "Antropologi", scores: [0, 0, 0, 0, 0] },
  { id: "bahasa_asing", name: "Bahasa Asing", scores: [0, 0, 0, 0, 0] },
  { id: "bahasa_indonesia", name: "Bahasa Indonesia", scores: [86, 87, 90, 90, 89] },
  { id: "bahasa_inggris", name: "Bahasa Inggris", scores: [87, 88, 89, 90, 91] },
  { id: "biologi", name: "Biologi", scores: [87, 88, 89, 90, 91] },
  { id: "ekonomi", name: "Ekonomi", scores: [0, 0, 0, 0, 0] },
  { id: "fisika", name: "Fisika", scores: [85, 86, 88, 87, 85] },
  { id: "geografi", name: "Geografi", scores: [0, 0, 0, 0, 0] },
  { id: "kimia", name: "Kimia", scores: [88, 89, 90, 91, 90] },
  { id: "matematika", name: "Matematika", scores: [84, 86, 87, 88, 86] },
  { id: "matematika_lanjut", name: "Matematika Tingkat Lanjut", scores: [83, 85, 86, 87, 86] },
  { id: "mulok_1", name: "Muatan Lokal 1", scores: [0, 0, 0, 0, 0] },
  { id: "mulok_2", name: "Muatan Lokal 2", scores: [0, 0, 0, 0, 0] },
  { id: "mulok_3", name: "Muatan Lokal 3", scores: [0, 0, 0, 0, 0] },
  { id: "pendidikan_agama", name: "Pendidikan Agama", scores: [90, 90, 92, 92, 93] },
  { id: "pjok", name: "PJOK/Olahraga", scores: [88, 88, 89, 90, 90] },
  { id: "ppkn", name: "PPKN/Pendidikan Pancasila", scores: [88, 89, 90, 90, 91] },
  { id: "sejarah", name: "Sejarah", scores: [86, 87, 88, 89, 89] },
  { id: "seni_budaya", name: "Seni Budaya", scores: [88, 89, 90, 90, 90] },
  { id: "sosiologi", name: "Sosiologi", scores: [0, 0, 0, 0, 0] }
];

export const STORAGE_KEY = "bac_rapor_garuda";

export function loadStoredRapor(): RaporSubject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every((s) => s && typeof s.id === 'string' && typeof s.name === 'string' && Array.isArray(s.scores))
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse rapor from localStorage", e);
  }
  return JSON.parse(JSON.stringify(defaultRaporData));
}

export function saveStoredRapor(data: RaporSubject[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save rapor to localStorage", e);
  }
}

export function calculateRaporMetrics(raporList: RaporSubject[], supportSubjectNames: string[] = []) {
  let filledCount = 0;
  let totalAvgSum = 0;

  raporList.forEach(s => {
    const valid = s.scores.filter(v => Number(v) > 0);
    if (valid.length > 0) {
      filledCount++;
      const avg = valid.reduce((a, b) => a + Number(b), 0) / valid.length;
      totalAvgSum += avg;
    }
  });

  const overallAvg = filledCount > 0 ? (totalAvgSum / filledCount).toFixed(1) : "0.0";

  const supportValidScores: number[] = [];
  raporList.forEach(s => {
    if (supportSubjectNames.includes(s.name)) {
      s.scores.forEach(v => {
        if (Number(v) > 0) supportValidScores.push(Number(v));
      });
    }
  });

  const supportAvg = supportValidScores.length > 0
    ? (supportValidScores.reduce((a, b) => a + b, 0) / supportValidScores.length).toFixed(1)
    : "0.0";

  return {
    filledCount,
    totalSubjects: raporList.length,
    overallAvg,
    supportAvg
  };
}
