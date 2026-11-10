import { Checkpoint1Student, ProgramChoice, SubtestV2 } from './garudaData';

export type SubtestKey = 'pu' | 'ppu' | 'pbm' | 'pk' | 'lbi_a' | 'lbi_s' | 'lbe' | 'pm';

export type ScoreBasis = 'to4' | 'median' | 'avg';

export type RegionGroup = 'jabodetabek_jabar' | 'jateng_diy' | 'jatim' | 'luar_jawa';

export type OpportunityZone = 'safe' | 'near' | 'target' | 'reach';

export interface CatalogProgram {
  id: string;
  prodi: string;
  univ: string;
  shortUniv: string;
  degree: 'S1' | 'D4' | 'D3';
  rumpun: 'saintek' | 'soshum';
  clusterLabel: string;
  city: string;
  regionGroup: RegionGroup;
  targetScore: number;
  quota2026: number;
  applicants2025: number;
  tightness: string;
  participantsCount: number;
  supportSubjects: string[];
  prioritySubtests: SubtestKey[];
  subtestWeights: Record<SubtestKey, number>;
}

export interface SimulatedProgramResult {
  catalog: CatalogProgram;
  weightedScore: number;
  gap: number;
  zone: OpportunityZone;
  zoneLabel: string;
  statusText: string;
  isOutOfTown: boolean;
  prioritySubtestDetails: {
    key: SubtestKey;
    shortLabel: string;
    name: string;
    studentScore: number;
    weightPct: number;
  }[];
  asProgramChoice: (priorityLabel: string) => ProgramChoice;
}

export const SUBTEST_LABELS: Record<SubtestKey, { short: string; full: string }> = {
  pu: { short: 'PU', full: 'Penalaran Umum' },
  ppu: { short: 'PPU', full: 'Pengetahuan & Pemahaman Umum' },
  pbm: { short: 'PBM', full: 'Pemahaman Bacaan & Menulis' },
  pk: { short: 'PK', full: 'Pengetahuan Kuantitatif' },
  lbi_a: { short: 'LBI Saintek', full: 'Literasi B. Indonesia (Saintek)' },
  lbi_s: { short: 'LBI Soshum', full: 'Literasi B. Indonesia (Soshum)' },
  lbe: { short: 'LBING', full: 'Literasi B. Inggris' },
  pm: { short: 'PM', full: 'Penalaran Matematika' }
};

export const PROGRAM_CATALOG: CatalogProgram[] = [
  // =====================================================
  // KLASTER KESEHATAN & FARMASI (SAINTEK)
  // =====================================================
  {
    id: 'ugm_farmasi',
    prodi: 'S1 Farmasi',
    univ: 'Universitas Gadjah Mada (UGM)',
    shortUniv: 'UGM',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Kesehatan & Farmasi',
    city: 'Yogyakarta',
    regionGroup: 'jateng_diy',
    targetScore: 694,
    quota2026: 72,
    applicants2025: 1868,
    tightness: '3.85%',
    participantsCount: 642,
    supportSubjects: ['Kimia', 'Biologi'],
    prioritySubtests: ['pk', 'pu', 'pm'],
    subtestWeights: { pk: 0.25, pu: 0.22, pm: 0.18, lbi_a: 0.10, lbe: 0.10, pbm: 0.08, ppu: 0.05, lbi_s: 0.02 }
  },
  {
    id: 'ui_farmasi',
    prodi: 'S1 Farmasi',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Kesehatan & Farmasi',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 686,
    quota2026: 59,
    applicants2025: 1154,
    tightness: '5.11%',
    participantsCount: 710,
    supportSubjects: ['Kimia', 'Biologi'],
    prioritySubtests: ['pk', 'pu', 'pm'],
    subtestWeights: { pk: 0.24, pu: 0.22, pm: 0.19, lbe: 0.11, lbi_a: 0.09, pbm: 0.08, ppu: 0.05, lbi_s: 0.02 }
  },
  {
    id: 'unpad_farmasi',
    prodi: 'S1 Farmasi',
    univ: 'Universitas Padjadjaran (Unpad)',
    shortUniv: 'Unpad',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Kesehatan & Farmasi',
    city: 'Bandung',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 668,
    quota2026: 66,
    applicants2025: 2140,
    tightness: '3.08%',
    participantsCount: 515,
    supportSubjects: ['Kimia', 'Biologi'],
    prioritySubtests: ['pk', 'pu', 'pm'],
    subtestWeights: { pk: 0.24, pu: 0.21, pm: 0.18, lbi_a: 0.11, lbe: 0.10, pbm: 0.08, ppu: 0.06, lbi_s: 0.02 }
  },
  {
    id: 'ub_farmasi',
    prodi: 'S1 Farmasi',
    univ: 'Universitas Brawijaya (UB)',
    shortUniv: 'UB',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Kesehatan & Farmasi',
    city: 'Malang',
    regionGroup: 'jatim',
    targetScore: 645,
    quota2026: 54,
    applicants2025: 1490,
    tightness: '3.62%',
    participantsCount: 410,
    supportSubjects: ['Kimia', 'Biologi'],
    prioritySubtests: ['pk', 'pu', 'pm'],
    subtestWeights: { pk: 0.23, pu: 0.20, pm: 0.18, lbi_a: 0.12, pbm: 0.10, lbe: 0.09, ppu: 0.06, lbi_s: 0.02 }
  },
  {
    id: 'uin_farmasi',
    prodi: 'S1 Farmasi',
    univ: 'UIN Syarif Hidayatullah Jakarta',
    shortUniv: 'UIN Jakarta',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Kesehatan & Farmasi',
    city: 'Jakarta',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 602,
    quota2026: 48,
    applicants2025: 940,
    tightness: '5.10%',
    participantsCount: 280,
    supportSubjects: ['Kimia', 'Biologi'],
    prioritySubtests: ['pk', 'pu', 'lbi_a'],
    subtestWeights: { pk: 0.22, pu: 0.20, lbi_a: 0.16, pm: 0.15, pbm: 0.11, lbe: 0.08, ppu: 0.06, lbi_s: 0.02 }
  },

  // =====================================================
  // KLASTER SAINS MURNI & PANGAN (SERUMPUN SAINTEK)
  // =====================================================
  {
    id: 'ui_kimia',
    prodi: 'S1 Kimia',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Sains Murni (Serumpun Farmasi)',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 605,
    quota2026: 48,
    applicants2025: 820,
    tightness: '5.85%',
    participantsCount: 245,
    supportSubjects: ['Kimia', 'Matematika Tingkat Lanjut'],
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.24, pm: 0.22, pu: 0.18, lbe: 0.11, lbi_a: 0.09, pbm: 0.08, ppu: 0.06, lbi_s: 0.02 }
  },
  {
    id: 'ipb_tekpang',
    prodi: 'S1 Teknologi Pangan',
    univ: 'IPB University',
    shortUniv: 'IPB',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Sains & Teknologi Pangan',
    city: 'Bogor',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 630,
    quota2026: 65,
    applicants2025: 1380,
    tightness: '4.71%',
    participantsCount: 390,
    supportSubjects: ['Kimia', 'Biologi'],
    prioritySubtests: ['pm', 'pk', 'pu'],
    subtestWeights: { pm: 0.22, pk: 0.22, pu: 0.18, lbi_a: 0.12, lbe: 0.10, pbm: 0.08, ppu: 0.06, lbi_s: 0.02 }
  },
  {
    id: 'ugm_biologi',
    prodi: 'S1 Biologi',
    univ: 'Universitas Gadjah Mada (UGM)',
    shortUniv: 'UGM',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Sains Murni (Serumpun Farmasi)',
    city: 'Yogyakarta',
    regionGroup: 'jateng_diy',
    targetScore: 612,
    quota2026: 90,
    applicants2025: 1410,
    tightness: '6.38%',
    participantsCount: 310,
    supportSubjects: ['Biologi', 'Kimia'],
    prioritySubtests: ['pu', 'lbi_a', 'pk'],
    subtestWeights: { pu: 0.22, lbi_a: 0.18, pk: 0.17, pm: 0.14, pbm: 0.11, lbe: 0.10, ppu: 0.06, lbi_s: 0.02 }
  },

  // =====================================================
  // KLASTER TEKNIK & KOMPUTASI (SAINTEK)
  // =====================================================
  {
    id: 'itb_mesin',
    prodi: 'S1 Teknik Mesin',
    univ: 'Institut Teknologi Bandung (ITB)',
    shortUniv: 'ITB',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Teknik & Rekayasa',
    city: 'Bandung',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 660,
    quota2026: 75,
    applicants2025: 1620,
    tightness: '4.63%',
    participantsCount: 520,
    supportSubjects: ['Fisika', 'Matematika Tingkat Lanjut'],
    prioritySubtests: ['pm', 'pk', 'pu'],
    subtestWeights: { pm: 0.28, pk: 0.24, pu: 0.18, lbe: 0.10, pbm: 0.08, lbi_a: 0.06, ppu: 0.04, lbi_s: 0.02 }
  },
  {
    id: 'ui_mesin',
    prodi: 'S1 Teknik Mesin',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Teknik & Rekayasa',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 648,
    quota2026: 52,
    applicants2025: 1090,
    tightness: '4.77%',
    participantsCount: 365,
    supportSubjects: ['Fisika', 'Matematika Tingkat Lanjut'],
    prioritySubtests: ['pm', 'pk', 'pu'],
    subtestWeights: { pm: 0.27, pk: 0.24, pu: 0.18, lbe: 0.11, pbm: 0.08, lbi_a: 0.06, ppu: 0.04, lbi_s: 0.02 }
  },
  {
    id: 'undip_mesin',
    prodi: 'S1 Teknik Mesin',
    univ: 'Universitas Diponegoro (Undip)',
    shortUniv: 'Undip',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Teknik & Rekayasa',
    city: 'Semarang',
    regionGroup: 'jateng_diy',
    targetScore: 618,
    quota2026: 84,
    applicants2025: 1480,
    tightness: '5.68%',
    participantsCount: 295,
    supportSubjects: ['Fisika', 'Matematika Tingkat Lanjut'],
    prioritySubtests: ['pm', 'pk', 'pu'],
    subtestWeights: { pm: 0.26, pk: 0.23, pu: 0.18, lbi_a: 0.10, lbe: 0.09, pbm: 0.07, ppu: 0.05, lbi_s: 0.02 }
  },
  {
    id: 'its_if',
    prodi: 'S1 Teknik Informatika',
    univ: 'Institut Teknologi Sepuluh Nopember (ITS)',
    shortUniv: 'ITS',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Informatika & Komputasi',
    city: 'Surabaya',
    regionGroup: 'jatim',
    targetScore: 705,
    quota2026: 96,
    applicants2025: 4465,
    tightness: '2.15%',
    participantsCount: 920,
    supportSubjects: ['Matematika Tingkat Lanjut', 'Fisika'],
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.27, pm: 0.26, pu: 0.19, lbe: 0.10, ppu: 0.06, pbm: 0.05, lbi_a: 0.05, lbi_s: 0.02 }
  },
  {
    id: 'unair_si',
    prodi: 'S1 Sistem Informasi',
    univ: 'Universitas Airlangga (Unair)',
    shortUniv: 'Unair',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Informatika & Komputasi',
    city: 'Surabaya',
    regionGroup: 'jatim',
    targetScore: 678,
    quota2026: 60,
    applicants2025: 1765,
    tightness: '3.40%',
    participantsCount: 680,
    supportSubjects: ['Matematika', 'Ekonomi'],
    prioritySubtests: ['pk', 'pu', 'pm'],
    subtestWeights: { pk: 0.24, pu: 0.22, pm: 0.20, lbe: 0.11, ppu: 0.08, pbm: 0.07, lbi_a: 0.06, lbi_s: 0.02 }
  },
  {
    id: 'pens_rpl',
    prodi: 'D4 Teknik Rekayasa Perangkat Lunak',
    univ: 'Politeknik Elektronika Negeri Surabaya (PENS)',
    shortUniv: 'PENS',
    degree: 'D4',
    rumpun: 'saintek',
    clusterLabel: 'Informatika & Komputasi',
    city: 'Surabaya',
    regionGroup: 'jatim',
    targetScore: 615,
    quota2026: 45,
    applicants2025: 726,
    tightness: '6.20%',
    participantsCount: 480,
    supportSubjects: ['Matematika', 'Informatika'],
    prioritySubtests: ['pm', 'pk', 'pu'],
    subtestWeights: { pm: 0.25, pk: 0.24, pu: 0.18, lbe: 0.10, ppu: 0.08, pbm: 0.07, lbi_a: 0.06, lbi_s: 0.02 }
  },
  {
    id: 'upnvjt_if',
    prodi: 'S1 Informatika',
    univ: 'UPN Veteran Jawa Timur',
    shortUniv: 'UPNV Jatim',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Informatika & Komputasi',
    city: 'Surabaya',
    regionGroup: 'jatim',
    targetScore: 555,
    quota2026: 110,
    applicants2025: 1850,
    tightness: '5.95%',
    participantsCount: 340,
    supportSubjects: ['Matematika', 'Informatika'],
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.24, pm: 0.23, pu: 0.18, ppu: 0.10, pbm: 0.08, lbi_a: 0.08, lbe: 0.07, lbi_s: 0.02 }
  },

  // =====================================================
  // KLASTER HUKUM, SOSIAL & HUMANIORA (SOSHUM)
  // =====================================================
  {
    id: 'ui_hukum',
    prodi: 'S1 Ilmu Hukum',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'S1',
    rumpun: 'soshum',
    clusterLabel: 'Hukum & Kebijakan Publik',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 685,
    quota2026: 165,
    applicants2025: 5288,
    tightness: '3.12%',
    participantsCount: 890,
    supportSubjects: ['Sosiologi', 'Pendidikan Pancasila'],
    prioritySubtests: ['pu', 'pbm', 'lbi_s'],
    subtestWeights: { pu: 0.23, pbm: 0.20, lbi_s: 0.18, ppu: 0.15, lbe: 0.10, pk: 0.06, pm: 0.05, lbi_a: 0.03 }
  },
  {
    id: 'unpad_hukum',
    prodi: 'S1 Ilmu Hukum',
    univ: 'Universitas Padjadjaran (Unpad)',
    shortUniv: 'Unpad',
    degree: 'S1',
    rumpun: 'soshum',
    clusterLabel: 'Hukum & Kebijakan Publik',
    city: 'Bandung',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 638,
    quota2026: 150,
    applicants2025: 3680,
    tightness: '4.08%',
    participantsCount: 540,
    supportSubjects: ['Sosiologi', 'Pendidikan Pancasila'],
    prioritySubtests: ['pu', 'lbi_s', 'pbm'],
    subtestWeights: { pu: 0.22, lbi_s: 0.20, pbm: 0.19, ppu: 0.15, lbe: 0.10, pk: 0.06, pm: 0.05, lbi_a: 0.03 }
  },
  {
    id: 'upnvj_hukum',
    prodi: 'S1 Ilmu Hukum',
    univ: 'UPN Veteran Jakarta',
    shortUniv: 'UPNV Jakarta',
    degree: 'S1',
    rumpun: 'soshum',
    clusterLabel: 'Hukum & Kebijakan Publik',
    city: 'Jakarta',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 598,
    quota2026: 135,
    applicants2025: 2910,
    tightness: '4.64%',
    participantsCount: 410,
    supportSubjects: ['Sosiologi', 'Pendidikan Pancasila'],
    prioritySubtests: ['pbm', 'lbi_s', 'pu'],
    subtestWeights: { pbm: 0.22, lbi_s: 0.21, pu: 0.20, ppu: 0.15, lbe: 0.10, pk: 0.05, pm: 0.04, lbi_a: 0.03 }
  },
  {
    id: 'ugm_hi',
    prodi: 'S1 Hubungan Internasional',
    univ: 'Universitas Gadjah Mada (UGM)',
    shortUniv: 'UGM',
    degree: 'S1',
    rumpun: 'soshum',
    clusterLabel: 'Hubungan Internasional & Politik',
    city: 'Yogyakarta',
    regionGroup: 'jateng_diy',
    targetScore: 692,
    quota2026: 44,
    applicants2025: 1795,
    tightness: '2.45%',
    participantsCount: 620,
    supportSubjects: ['Bahasa Inggris', 'Sosiologi'],
    prioritySubtests: ['lbe', 'pu', 'lbi_s'],
    subtestWeights: { lbe: 0.24, pu: 0.21, lbi_s: 0.18, ppu: 0.14, pbm: 0.13, pk: 0.04, pm: 0.04, lbi_a: 0.02 }
  },
  {
    id: 'unpad_komunikasi',
    prodi: 'S1 Ilmu Komunikasi',
    univ: 'Universitas Padjadjaran (Unpad)',
    shortUniv: 'Unpad',
    degree: 'S1',
    rumpun: 'soshum',
    clusterLabel: 'Komunikasi & Media',
    city: 'Bandung',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 655,
    quota2026: 48,
    applicants2025: 1170,
    tightness: '4.10%',
    participantsCount: 740,
    supportSubjects: ['Bahasa Indonesia', 'Sosiologi'],
    prioritySubtests: ['pbm', 'lbi_s', 'lbe'],
    subtestWeights: { pbm: 0.22, lbi_s: 0.21, lbe: 0.18, ppu: 0.16, pu: 0.14, pk: 0.04, pm: 0.03, lbi_a: 0.02 }
  },
  {
    id: 'unj_komunikasi',
    prodi: 'S1 Ilmu Komunikasi',
    univ: 'Universitas Negeri Jakarta (UNJ)',
    shortUniv: 'UNJ',
    degree: 'S1',
    rumpun: 'soshum',
    clusterLabel: 'Komunikasi & Media',
    city: 'Jakarta',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 604,
    quota2026: 56,
    applicants2025: 1420,
    tightness: '3.94%',
    participantsCount: 380,
    supportSubjects: ['Bahasa Indonesia', 'Sosiologi'],
    prioritySubtests: ['pbm', 'lbi_s', 'ppu'],
    subtestWeights: { pbm: 0.23, lbi_s: 0.21, ppu: 0.18, lbe: 0.16, pu: 0.14, pk: 0.03, pm: 0.03, lbi_a: 0.02 }
  },
  {
    id: 'ui_psikologi',
    prodi: 'S1 Psikologi',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'S1',
    rumpun: 'soshum',
    clusterLabel: 'Psikologi & Sosial',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 678,
    quota2026: 112,
    applicants2025: 3610,
    tightness: '3.10%',
    participantsCount: 820,
    supportSubjects: ['Sosiologi', 'Matematika'],
    prioritySubtests: ['pu', 'pbm', 'lbe'],
    subtestWeights: { pu: 0.22, pbm: 0.18, lbe: 0.16, ppu: 0.14, lbi_s: 0.14, pk: 0.08, pm: 0.06, lbi_a: 0.02 }
  }
];

function computeMedian(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function getStudentSubtestScoreMap(subtests: SubtestV2[], basis: ScoreBasis): Record<SubtestKey, number> {
  const map: Record<SubtestKey, number> = {
    pu: 0,
    ppu: 0,
    pbm: 0,
    pk: 0,
    lbi_a: 0,
    lbi_s: 0,
    lbe: 0,
    pm: 0
  };

  for (const s of subtests) {
    const key = s.id as SubtestKey;
    if (!(key in map)) continue;
    if (basis === 'to4') {
      map[key] = s.to4;
    } else if (basis === 'avg') {
      map[key] = (s.to1 + s.to2 + s.to3 + s.to4) / 4;
    } else {
      map[key] = computeMedian([s.to1, s.to2, s.to3, s.to4]);
    }
  }
  return map;
}

export function isCityOutOfTown(branch: string, progCity: string): boolean {
  const studentCity = branch.split('-')[0].trim().toLowerCase();
  const targetCity = progCity.trim().toLowerCase();

  const jabodetabek = ['depok', 'jakarta', 'bogor', 'tangerang', 'bekasi'];
  if (jabodetabek.includes(studentCity) && jabodetabek.includes(targetCity)) {
    return false;
  }
  if (targetCity.includes(studentCity) || studentCity.includes(targetCity)) {
    return false;
  }
  return true;
}

export function getStudentHomeRegion(branch: string): RegionGroup {
  const studentCity = branch.split('-')[0].trim().toLowerCase();
  if (['depok', 'jakarta', 'bogor', 'tangerang', 'bekasi', 'bandung', 'sumedang'].includes(studentCity)) {
    return 'jabodetabek_jabar';
  }
  if (['surabaya', 'malang', 'sidoarjo'].includes(studentCity)) {
    return 'jatim';
  }
  if (['yogyakarta', 'semarang', 'solo', 'surakarta'].includes(studentCity)) {
    return 'jateng_diy';
  }
  return 'jabodetabek_jabar';
}

export function getZoneFromGap(gap: number): {
  zone: OpportunityZone;
  zoneLabel: string;
  statusText: string;
} {
  if (gap >= 0) {
    return {
      zone: 'safe',
      zoneLabel: 'Realistis / Tercapai',
      statusText: 'Melampaui Target Acuan'
    };
  }
  if (gap >= -30) {
    return {
      zone: 'near',
      zoneLabel: 'Mendekati Target',
      statusText: 'Mendekati Aman'
    };
  }
  if (gap >= -90) {
    return {
      zone: 'target',
      zoneLabel: 'Target Bertahap',
      statusText: 'Butuh Peningkatan'
    };
  }
  return {
    zone: 'reach',
    zoneLabel: 'Ambisius / Jauh',
    statusText: 'Butuh Peningkatan Signifikan'
  };
}

export function computeSimulatedProgram(
  student: Checkpoint1Student,
  catalog: CatalogProgram,
  basis: ScoreBasis = 'to4'
): SimulatedProgramResult {
  const scoreMap = getStudentSubtestScoreMap(student.subtests, basis);
  let weightedFloat = 0;

  (Object.keys(catalog.subtestWeights) as SubtestKey[]).forEach((k) => {
    weightedFloat += (scoreMap[k] || 0) * catalog.subtestWeights[k];
  });

  const weightedScore = Math.round(weightedFloat);
  const gap = weightedScore - catalog.targetScore;
  const { zone, zoneLabel, statusText } = getZoneFromGap(gap);
  const isOutOfTown = isCityOutOfTown(student.identity.branch, catalog.city);

  const prioritySubtestDetails = catalog.prioritySubtests.map((k) => ({
    key: k,
    shortLabel: SUBTEST_LABELS[k].short,
    name: SUBTEST_LABELS[k].full,
    studentScore: Math.round(scoreMap[k] || 0),
    weightPct: Math.round((catalog.subtestWeights[k] || 0) * 100)
  }));

  return {
    catalog,
    weightedScore,
    gap,
    zone,
    zoneLabel,
    statusText,
    isOutOfTown,
    prioritySubtestDetails,
    asProgramChoice: (priorityLabel: string): ProgramChoice => ({
      priority: priorityLabel,
      prodi: catalog.prodi,
      univ: catalog.univ,
      degree: catalog.degree,
      targetScore: catalog.targetScore,
      weightedScore,
      gap,
      tightness: catalog.tightness,
      status: statusText,
      supportSubjects: catalog.supportSubjects,
      rumpun: catalog.rumpun,
      city: catalog.city,
      isOutOfTown,
      participantsCount: catalog.participantsCount
    })
  };
}

export function matchCatalogProgram(choice: ProgramChoice): CatalogProgram | undefined {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cProdi = normalize(choice.prodi);
  const cUniv = normalize(choice.univ);

  return PROGRAM_CATALOG.find((p) => {
    const pProdi = normalize(p.prodi);
    const pUniv = normalize(p.univ);
    const pShort = normalize(p.shortUniv);
    return pProdi === cProdi && (pUniv === cUniv || cUniv.includes(pShort) || pUniv.includes(cUniv));
  });
}
