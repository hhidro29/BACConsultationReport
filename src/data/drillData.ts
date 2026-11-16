// Data drill soal di aplikasi Ruangguru per siswa per subtes (3 bulan terakhir).
// Data contoh untuk prototipe (siswa fiktif), bukan data siswa nyata.
// Subtes yang belum punya catatan drill ditulis 0 soal / 0 sesi.
import { studentToSeriesV1 } from './v1Data';

export interface SubtestDrillStat {
  questions: number;
  sessions: number;
  accuracyPct: number;
}

const SUBTEST_IDS = ['pu', 'pk', 'pm', 'lbi_a', 'lbi_s', 'pbm', 'lbe', 'ppu'] as const;

// Garuda: diturunkan dari seri V1 supaya angkanya selalu sama dengan halaman Checkpoint V1.
const garudaDrill: Record<string, SubtestDrillStat> = Object.fromEntries(
  SUBTEST_IDS.map((id) => {
    const v = studentToSeriesV1[id];
    const questions: number = v?.drillQuestions ?? 0;
    const correct: number = v?.drillCorrect ?? 0;
    return [
      id,
      {
        questions,
        sessions: v?.drillSessions ?? 0,
        accuracyPct: questions > 0 ? Math.round((correct / questions) * 100) : 0
      }
    ];
  })
);

export const STUDENT_DRILL_DATA: Record<string, Record<string, SubtestDrillStat>> = {
  garuda: garudaDrill,
  // Nadira: drill cukup aktif, skor mendekati 600.
  nadira: {
    pk: { questions: 42, sessions: 8, accuracyPct: 71 },
    pm: { questions: 30, sessions: 6, accuracyPct: 67 },
    pu: { questions: 55, sessions: 11, accuracyPct: 78 },
    pbm: { questions: 25, sessions: 5, accuracyPct: 84 },
    lbi_a: { questions: 20, sessions: 4, accuracyPct: 65 },
    ppu: { questions: 15, sessions: 3, accuracyPct: 62 },
    lbi_s: { questions: 12, sessions: 2, accuracyPct: 80 },
    lbe: { questions: 10, sessions: 2, accuracyPct: 78 }
  },
  // Rizky: hampir belum drill.
  rizky: {
    pk: { questions: 0, sessions: 0, accuracyPct: 0 },
    pu: { questions: 2, sessions: 1, accuracyPct: 50 },
    pm: { questions: 0, sessions: 0, accuracyPct: 0 },
    ppu: { questions: 3, sessions: 1, accuracyPct: 33 },
    lbi_a: { questions: 0, sessions: 0, accuracyPct: 0 },
    lbi_s: { questions: 0, sessions: 0, accuracyPct: 0 },
    lbe: { questions: 0, sessions: 0, accuracyPct: 0 },
    pbm: { questions: 4, sessions: 1, accuracyPct: 50 }
  },
  // Alya: drill rutin, semua subtes di atas 600.
  alya: {
    pk: { questions: 64, sessions: 12, accuracyPct: 86 },
    pu: { questions: 58, sessions: 11, accuracyPct: 88 },
    pm: { questions: 52, sessions: 10, accuracyPct: 84 },
    lbi_a: { questions: 30, sessions: 6, accuracyPct: 80 },
    lbi_s: { questions: 28, sessions: 5, accuracyPct: 82 },
    lbe: { questions: 26, sessions: 5, accuracyPct: 79 },
    pbm: { questions: 24, sessions: 4, accuracyPct: 83 },
    ppu: { questions: 22, sessions: 4, accuracyPct: 81 }
  }
};
