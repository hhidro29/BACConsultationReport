import { Checkpoint1Student, ProgramChoice, SubtestV2 } from './garudaData';

export type SubtestKey = 'pu' | 'ppu' | 'pbm' | 'pk' | 'lbi_a' | 'lbi_s' | 'lbe' | 'pm';

export type ScoreBasis = 'to4' | 'median' | 'avg';

export type RegionGroup = 'jabodetabek_jabar' | 'jateng_diy' | 'jatim' | 'luar_jawa';

export type OpportunityZone = 'safe' | 'near' | 'target' | 'reach';

export type ProgramTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export const STUDENT_TOWER_RUMPUNS = [
  'Kedokteran Umum, Gigi dan Hewan',
  'Kesehatan',
  'Teknik',
  'Ilmu Komputer dan Informatika',
  'Sains dan MIPA',
  'Matematika, Aktuaria & Sains Data',
  'Pertanian, Peternakan, Perikanan & Kehutanan',
  'Pendidikan',
  'Ekonomi & Bisnis',
  'Ilmu Hukum',
  'Psikologi',
  'Ilmu Sosial dan Ilmu Politik (FISIP)',
  'Ilmu Administrasi',
  'Ilmu Budaya, Bahasa & Sastra',
  'PJOK & Ilmu Keolahragaan',
  'Desain dan Seni',
  'Pariwisata & Perhotelan',
  'Kedinasan, Militer & Kepolisian'
] as const;

export type StudentTowerRumpun = (typeof STUDENT_TOWER_RUMPUNS)[number];

export interface CatalogProgram {
  id: string;
  prodi: string;
  univ: string;
  shortUniv: string;
  degree: 'S1' | 'D4' | 'D3';
  rumpun: 'saintek' | 'soshum';
  rumpunName: StudentTowerRumpun;
  clusterLabel: string;
  city: string;
  province: string;
  tier: ProgramTier;
  regionGroup: RegionGroup;
  targetScore: number;
  quota2026: number;
  applicants2025: number;
  tightness: string;
  participantsCount: number;
  supportSubjects: string[];
  prioritySubtests: SubtestKey[];
  subtestWeights: Record<SubtestKey, number>;
  subtestTargets?: Record<SubtestKey, number>;
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

type RawCatalogProgram = Omit<CatalogProgram, 'province' | 'tier' | 'rumpunName'>;

function deriveProvince(city: string): string {
  const c = city.toLowerCase();
  if (c.includes('jakarta')) return 'DKI Jakarta';
  if (c.includes('depok') || c.includes('bogor') || c.includes('bandung') || c.includes('sumedang')) return 'Jawa Barat';
  if (c.includes('yogyakarta')) return 'DI Yogyakarta';
  if (c.includes('semarang')) return 'Jawa Tengah';
  if (c.includes('surabaya') || c.includes('malang')) return 'Jawa Timur';
  return 'Lainnya';
}

function deriveTier(targetScore: number): ProgramTier {
  if (targetScore >= 660) return 'Tier 1';
  if (targetScore >= 610) return 'Tier 2';
  return 'Tier 3';
}

function deriveRumpunName(clusterLabel: string, prodi: string): StudentTowerRumpun {
  const cl = clusterLabel.toLowerCase();
  const pr = prodi.toLowerCase();
  if (pr.includes('dokter')) return 'Kedokteran Umum, Gigi dan Hewan';
  if (cl.includes('kesehatan') || cl.includes('farmasi') || pr.includes('farmasi') || pr.includes('laboratorium')) {
    return 'Kesehatan';
  }
  if (cl.includes('teknik') || cl.includes('rekayasa')) return 'Teknik';
  if (pr.includes('sains data') || cl.includes('matematika')) return 'Matematika, Aktuaria & Sains Data';
  if (cl.includes('informatika') || cl.includes('komputasi') || pr.includes('informatika')) {
    return 'Ilmu Komputer dan Informatika';
  }
  if (cl.includes('pangan') || cl.includes('pertanian')) return 'Pertanian, Peternakan, Perikanan & Kehutanan';
  if (cl.includes('sains murni')) return 'Sains dan MIPA';
  if (cl.includes('hukum')) return 'Ilmu Hukum';
  if (cl.includes('psikologi')) return 'Psikologi';
  if (cl.includes('administrasi') || pr.includes('administrasi')) return 'Ilmu Administrasi';
  if (cl.includes('ekonomi') || cl.includes('bisnis') || pr.includes('manajemen') || pr.includes('akuntansi')) {
    return 'Ekonomi & Bisnis';
  }
  if (
    cl.includes('hubungan internasional') ||
    cl.includes('komunikasi') ||
    cl.includes('politik') ||
    pr.includes('hubungan masyarakat')
  ) {
    return 'Ilmu Sosial dan Ilmu Politik (FISIP)';
  }
  return 'Sains dan MIPA';
}

const RAW_PROGRAM_CATALOG: RawCatalogProgram[] = [
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
    subtestWeights: { pk: 0.20, pu: 0.18, pm: 0.16, pbm: 0.12, lbe: 0.11, lbi_a: 0.09, ppu: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 937, pu: 844, pm: 750, pbm: 562, lbe: 516, lbi_a: 500, ppu: 500, lbi_s: 500 }
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
    subtestWeights: { pk: 0.20, pu: 0.18, pm: 0.16, pbm: 0.12, lbe: 0.11, lbi_a: 0.09, ppu: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 919, pu: 827, pm: 736, pbm: 552, lbe: 506, lbi_a: 500, ppu: 500, lbi_s: 500 }
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
    subtestWeights: { pk: 0.20, pu: 0.18, pm: 0.16, pbm: 0.12, lbe: 0.11, lbi_a: 0.09, ppu: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 925, pu: 833, pm: 740, pbm: 555, lbe: 509, lbi_a: 500, ppu: 500, lbi_s: 500 }
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
    subtestWeights: { pk: 0.20, pu: 0.18, pm: 0.16, pbm: 0.12, lbe: 0.11, lbi_a: 0.09, ppu: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 891, pu: 802, pm: 712, pbm: 534, lbe: 500, lbi_a: 500, ppu: 500, lbi_s: 500 }
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
    prioritySubtests: ['pk', 'pu', 'pm'],
    subtestWeights: { pk: 0.20, pu: 0.18, pm: 0.16, pbm: 0.12, lbe: 0.11, lbi_a: 0.09, ppu: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 808, pu: 728, pm: 647, pbm: 500, lbe: 500, lbi_a: 500, ppu: 500, lbi_s: 500 }
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
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, ppu: 0.11, pbm: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 906, pm: 816, pu: 725, lbe: 544, ppu: 500, pbm: 500, lbi_a: 500, lbi_s: 500 }
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
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, pbm: 0.12, lbe: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 946, pm: 851, pu: 756, pbm: 567, lbe: 520, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    prioritySubtests: ['pu', 'pk', 'pbm'],
    subtestWeights: { pu: 0.20, pk: 0.18, pbm: 0.16, pm: 0.12, lbe: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pu: 869, pk: 782, pbm: 695, pm: 522, lbe: 500, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 960, pm: 864, pu: 768, lbe: 576, pbm: 528, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 961, pm: 865, pu: 769, lbe: 576, pbm: 528, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 905, pm: 814, pu: 724, lbe: 543, pbm: 500, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 949, pm: 854, pu: 759, lbe: 570, pbm: 522, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    prioritySubtests: ['pu', 'pk', 'pm'],
    subtestWeights: { pu: 0.20, pk: 0.18, pm: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pu: 951, pk: 856, pm: 761, lbe: 570, pbm: 523, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 868, pm: 781, pu: 694, lbe: 521, pbm: 500, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 809, pm: 728, pu: 647, lbe: 500, pbm: 500, ppu: 500, lbi_a: 500, lbi_s: 500 }
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
    subtestWeights: { pu: 0.20, pbm: 0.18, lbi_s: 0.16, ppu: 0.12, lbe: 0.11, pk: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 950, pbm: 855, lbi_s: 760, ppu: 570, lbe: 523, pk: 500, pm: 500, lbi_a: 500 }
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
    prioritySubtests: ['pu', 'pbm', 'lbi_s'],
    subtestWeights: { pu: 0.20, pbm: 0.18, lbi_s: 0.16, ppu: 0.12, lbe: 0.11, pk: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 895, pbm: 805, lbi_s: 716, ppu: 537, lbe: 500, pk: 500, pm: 500, lbi_a: 500 }
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
    prioritySubtests: ['pu', 'pbm', 'lbi_s'],
    subtestWeights: { pu: 0.20, pbm: 0.18, lbi_s: 0.16, ppu: 0.12, lbe: 0.11, pk: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 786, pbm: 707, lbi_s: 629, ppu: 500, lbe: 500, pk: 500, pm: 500, lbi_a: 500 }
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
    prioritySubtests: ['pu', 'lbe', 'ppu'],
    subtestWeights: { pu: 0.20, lbe: 0.18, ppu: 0.16, pbm: 0.12, lbi_s: 0.11, pk: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 974, lbe: 876, ppu: 779, pbm: 584, lbi_s: 535, pk: 500, pm: 500, lbi_a: 500 }
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
    prioritySubtests: ['pu', 'ppu', 'lbi_s'],
    subtestWeights: { pu: 0.20, ppu: 0.18, lbi_s: 0.16, lbe: 0.12, pbm: 0.11, pk: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 941, ppu: 847, lbi_s: 753, lbe: 565, pbm: 517, pk: 500, pm: 500, lbi_a: 500 }
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
    prioritySubtests: ['pu', 'ppu', 'lbi_s'],
    subtestWeights: { pu: 0.20, ppu: 0.18, lbi_s: 0.16, lbe: 0.12, pbm: 0.11, pk: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 902, ppu: 811, lbi_s: 721, lbe: 541, pbm: 500, pk: 500, pm: 500, lbi_a: 500 }
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
    prioritySubtests: ['pu', 'pk', 'ppu'],
    subtestWeights: { pu: 0.20, pk: 0.18, ppu: 0.16, lbi_s: 0.12, lbe: 0.11, pbm: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 968, pk: 872, ppu: 775, lbi_s: 581, lbe: 533, pbm: 500, pm: 500, lbi_a: 500 }
  },
  {
    id: 'ui_kedokteran',
    prodi: 'S1 Pendidikan Dokter',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Kedokteran Umum',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 725,
    quota2026: 90,
    applicants2025: 3330,
    tightness: '2.70%',
    participantsCount: 980,
    supportSubjects: ['Biologi', 'Kimia'],
    prioritySubtests: ['pu', 'pk', 'ppu'],
    subtestWeights: { pu: 0.20, pk: 0.18, ppu: 0.16, pm: 0.12, lbe: 0.11, pbm: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pu: 1016, pk: 914, ppu: 813, pm: 609, lbe: 559, pbm: 500, lbi_a: 500, lbi_s: 500 }
  },
  {
    id: 'ui_manajemen',
    prodi: 'S1 Manajemen',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'S1',
    rumpun: 'soshum',
    clusterLabel: 'Ekonomi & Bisnis',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 684,
    quota2026: 132,
    applicants2025: 3890,
    tightness: '3.39%',
    participantsCount: 780,
    supportSubjects: ['Ekonomi', 'Matematika'],
    prioritySubtests: ['pu', 'pk', 'lbe'],
    subtestWeights: { pu: 0.20, pk: 0.18, lbe: 0.16, pm: 0.12, ppu: 0.11, lbi_s: 0.09, pbm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 964, pk: 867, lbe: 771, pm: 578, ppu: 530, lbi_s: 500, pbm: 500, lbi_a: 500 }
  },
  {
    id: 'upnvjt_sainsdata',
    prodi: 'S1 Sains Data',
    univ: 'UPN Veteran Jawa Timur',
    shortUniv: 'UPNV Jatim',
    degree: 'S1',
    rumpun: 'saintek',
    clusterLabel: 'Matematika & Sains Data',
    city: 'Surabaya',
    regionGroup: 'jatim',
    targetScore: 540,
    quota2026: 70,
    applicants2025: 920,
    tightness: '7.61%',
    participantsCount: 215,
    supportSubjects: ['Matematika Tingkat Lanjut', 'Informatika'],
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 864, pm: 777, pu: 691, lbe: 518, pbm: 500, ppu: 500, lbi_a: 500, lbi_s: 500 }
  },

  // =====================================================
  // PROGRAM VOKASI (D4 & D3) UNTUK KOMBINASI SNBT 2026
  // =====================================================
  {
    id: 'poltekkes_jkt3_tlm',
    prodi: 'D4 Teknologi Laboratorium Medis',
    univ: 'Poltekkes Kemenkes Jakarta III',
    shortUniv: 'Poltekkes Jkt III',
    degree: 'D4',
    rumpun: 'saintek',
    clusterLabel: 'Kesehatan & Farmasi',
    city: 'Jakarta',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 582,
    quota2026: 48,
    applicants2025: 980,
    tightness: '4.90%',
    participantsCount: 210,
    supportSubjects: ['Biologi', 'Kimia'],
    prioritySubtests: ['pu', 'pk', 'lbi_a'],
    subtestWeights: { pu: 0.23, pk: 0.21, lbi_a: 0.16, pm: 0.15, pbm: 0.10, lbe: 0.08, ppu: 0.05, lbi_s: 0.02 },
    subtestTargets: { pu: 938, pk: 857, lbi_a: 653, pm: 612, pbm: 500, lbe: 500, ppu: 500, lbi_s: 500 }
  },
  {
    id: 'poltekkes_jkt2_farmasi_d3',
    prodi: 'D3 Farmasi',
    univ: 'Poltekkes Kemenkes Jakarta II',
    shortUniv: 'Poltekkes Jkt II',
    degree: 'D3',
    rumpun: 'saintek',
    clusterLabel: 'Kesehatan & Farmasi',
    city: 'Jakarta',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 555,
    quota2026: 60,
    applicants2025: 1120,
    tightness: '5.36%',
    participantsCount: 240,
    supportSubjects: ['Kimia', 'Biologi'],
    prioritySubtests: ['pk', 'pu', 'lbi_a'],
    subtestWeights: { pk: 0.22, pu: 0.20, lbi_a: 0.17, pm: 0.15, pbm: 0.10, lbe: 0.08, ppu: 0.06, lbi_s: 0.02 },
    subtestTargets: { pk: 856, pu: 778, lbi_a: 661, pm: 584, pbm: 500, lbe: 500, ppu: 500, lbi_s: 500 }
  },
  {
    id: 'unair_k3_d4',
    prodi: 'D4 Keselamatan dan Kesehatan Kerja',
    univ: 'Universitas Airlangga (Unair)',
    shortUniv: 'Unair',
    degree: 'D4',
    rumpun: 'saintek',
    clusterLabel: 'Kesehatan & Farmasi',
    city: 'Surabaya',
    regionGroup: 'jatim',
    targetScore: 605,
    quota2026: 72,
    applicants2025: 1310,
    tightness: '5.50%',
    participantsCount: 310,
    supportSubjects: ['Biologi', 'Kimia'],
    prioritySubtests: ['pu', 'pk', 'pbm'],
    subtestWeights: { pu: 0.20, pk: 0.18, pbm: 0.16, pm: 0.12, lbe: 0.11, lbi_a: 0.09, ppu: 0.08, lbi_s: 0.06 },
    subtestTargets: { pu: 884, pk: 796, pbm: 707, pm: 531, lbe: 500, lbi_a: 500, ppu: 500, lbi_s: 500 }
  },
  {
    id: 'polban_mesin_d4',
    prodi: 'D4 Teknik Mesin',
    univ: 'Politeknik Negeri Bandung (Polban)',
    shortUniv: 'Polban',
    degree: 'D4',
    rumpun: 'saintek',
    clusterLabel: 'Teknik & Rekayasa',
    city: 'Bandung',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 590,
    quota2026: 44,
    applicants2025: 890,
    tightness: '4.94%',
    participantsCount: 260,
    supportSubjects: ['Fisika', 'Matematika'],
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 854, pm: 768, pu: 683, lbe: 512, pbm: 500, ppu: 500, lbi_a: 500, lbi_s: 500 }
  },
  {
    id: 'pnj_mesin_d3',
    prodi: 'D3 Teknik Mesin',
    univ: 'Politeknik Negeri Jakarta (PNJ)',
    shortUniv: 'PNJ',
    degree: 'D3',
    rumpun: 'saintek',
    clusterLabel: 'Teknik & Rekayasa',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 558,
    quota2026: 68,
    applicants2025: 1050,
    tightness: '6.48%',
    participantsCount: 295,
    supportSubjects: ['Fisika', 'Matematika'],
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 848, pm: 763, pu: 678, lbe: 509, pbm: 500, ppu: 500, lbi_a: 500, lbi_s: 500 }
  },
  {
    id: 'pens_if_d3',
    prodi: 'D3 Teknik Informatika',
    univ: 'Politeknik Elektronika Negeri Surabaya (PENS)',
    shortUniv: 'PENS',
    degree: 'D3',
    rumpun: 'saintek',
    clusterLabel: 'Informatika & Komputasi',
    city: 'Surabaya',
    regionGroup: 'jatim',
    targetScore: 580,
    quota2026: 54,
    applicants2025: 920,
    tightness: '5.87%',
    participantsCount: 315,
    supportSubjects: ['Matematika', 'Informatika'],
    prioritySubtests: ['pk', 'pm', 'pu'],
    subtestWeights: { pk: 0.20, pm: 0.18, pu: 0.16, lbe: 0.12, pbm: 0.11, ppu: 0.09, lbi_a: 0.08, lbi_s: 0.06 },
    subtestTargets: { pk: 884, pm: 795, pu: 707, lbe: 530, pbm: 500, ppu: 500, lbi_a: 500, lbi_s: 500 }
  },
  {
    id: 'unj_humas_d4',
    prodi: 'D4 Hubungan Masyarakat & Komunikasi Digital',
    univ: 'Universitas Negeri Jakarta (UNJ)',
    shortUniv: 'UNJ',
    degree: 'D4',
    rumpun: 'soshum',
    clusterLabel: 'Komunikasi & Media',
    city: 'Jakarta',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 585,
    quota2026: 52,
    applicants2025: 1180,
    tightness: '4.41%',
    participantsCount: 320,
    supportSubjects: ['Bahasa Indonesia', 'Sosiologi'],
    prioritySubtests: ['pu', 'ppu', 'lbi_s'],
    subtestWeights: { pu: 0.20, ppu: 0.18, lbi_s: 0.16, lbe: 0.12, pbm: 0.11, pk: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 879, ppu: 791, lbi_s: 703, lbe: 527, pbm: 500, pk: 500, pm: 500, lbi_a: 500 }
  },
  {
    id: 'ui_humas_d3',
    prodi: 'D3 Hubungan Masyarakat',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'D3',
    rumpun: 'soshum',
    clusterLabel: 'Komunikasi & Media',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 592,
    quota2026: 48,
    applicants2025: 1240,
    tightness: '3.87%',
    participantsCount: 380,
    supportSubjects: ['Bahasa Indonesia', 'Sosiologi'],
    prioritySubtests: ['pu', 'pbm', 'lbi_s'],
    subtestWeights: { pu: 0.20, pbm: 0.18, lbi_s: 0.16, ppu: 0.12, lbe: 0.11, pk: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 942, pbm: 848, lbi_s: 754, ppu: 565, lbe: 518, pk: 500, pm: 500, lbi_a: 500 }
  },
  {
    id: 'ui_adm_d3',
    prodi: 'D3 Administrasi Perkantoran',
    univ: 'Universitas Indonesia (UI)',
    shortUniv: 'UI',
    degree: 'D3',
    rumpun: 'soshum',
    clusterLabel: 'Ilmu Administrasi',
    city: 'Depok',
    regionGroup: 'jabodetabek_jabar',
    targetScore: 588,
    quota2026: 50,
    applicants2025: 1090,
    tightness: '4.59%',
    participantsCount: 290,
    supportSubjects: ['Ekonomi', 'Bahasa Indonesia'],
    prioritySubtests: ['pu', 'pk', 'pbm'],
    subtestWeights: { pu: 0.20, pk: 0.18, pbm: 0.16, lbi_s: 0.12, lbe: 0.11, ppu: 0.09, pm: 0.08, lbi_a: 0.06 },
    subtestTargets: { pu: 905, pk: 814, pbm: 724, lbi_s: 543, lbe: 500, ppu: 500, pm: 500, lbi_a: 500 }
  }
];

export const PROGRAM_CATALOG: CatalogProgram[] = RAW_PROGRAM_CATALOG.map((item) => ({
  ...item,
  rumpunName: deriveRumpunName(item.clusterLabel, item.prodi),
  province: deriveProvince(item.city),
  tier: deriveTier(item.targetScore)
}));

export const CATALOG_PROVINCES: string[] = Array.from(new Set(PROGRAM_CATALOG.map((p) => p.province))).sort();
export const CATALOG_TIERS: ProgramTier[] = ['Tier 1', 'Tier 2', 'Tier 3'];
export const CATALOG_AVAILABLE_RUMPUNS: StudentTowerRumpun[] = Array.from(
  new Set(PROGRAM_CATALOG.map((p) => p.rumpunName))
);

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
      zoneLabel: 'Sudah tercapai',
      statusText: 'Melampaui target acuan'
    };
  }
  if (gap >= -30) {
    return {
      zone: 'near',
      zoneLabel: 'Hampir tercapai',
      statusText: 'Mendekati target acuan'
    };
  }
  if (gap >= -90) {
    return {
      zone: 'target',
      zoneLabel: 'Dicapai bertahap',
      statusText: 'Perlu diperkuat'
    };
  }
  return {
    zone: 'reach',
    zoneLabel: 'Perlu usaha besar',
    statusText: 'Perlu peningkatan besar'
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

  if (!cProdi) return undefined;
  const sameProdi = PROGRAM_CATALOG.filter((p) => normalize(p.prodi) === cProdi);

  // 1) Exact university name or exact short code ("UI", "UIN SGD") wins first.
  const exact = sameProdi.find(
    (p) => normalize(p.univ) === cUniv || (cUniv !== '' && normalize(p.shortUniv) === cUniv)
  );
  if (exact) return exact;

  // 2) Loose fallback only for a reasonably long university string; short substrings such as
  // "ui" must never match "uin..." and an empty university must never match the first entry.
  if (cUniv.length < 6) return undefined;
  return sameProdi.find((p) => {
    const pUniv = normalize(p.univ);
    return pUniv.includes(cUniv) || cUniv.includes(pUniv);
  });
}

export interface SnbtValidationResult {
  isValid: boolean;
  total: number;
  s1Count: number;
  d4Count: number;
  d3Count: number;
  patternLabel: string;
  message: string;
  needsVokasiFilter: boolean;
  needsD3Only: boolean;
}

export function validateSnbtChoices(programs: ProgramChoice[]): SnbtValidationResult {
  const total = programs.length;
  const degrees = programs.map((p) => (p.degree || 'S1').toUpperCase());
  const s1Count = degrees.filter((d) => d === 'S1').length;
  const d4Count = degrees.filter((d) => d === 'D4').length;
  const d3Count = degrees.filter((d) => d === 'D3').length;
  const vokasiCount = d4Count + d3Count;
  const patternLabel = degrees.join(' – ') || 'Kosong';

  if (total === 0) {
    return {
      isValid: false,
      total,
      s1Count,
      d4Count,
      d3Count,
      patternLabel,
      message: 'Minimal pilih 1 program studi.',
      needsVokasiFilter: false,
      needsD3Only: false
    };
  }

  const unknownDegree = degrees.find((d) => d !== 'S1' && d !== 'D4' && d !== 'D3');
  if (unknownDegree) {
    return {
      isValid: false,
      total,
      s1Count,
      d4Count,
      d3Count,
      patternLabel,
      message: `Jenjang "${unknownDegree}" tidak dikenali. Gunakan S1, D4, atau D3.`,
      needsVokasiFilter: false,
      needsD3Only: false
    };
  }

  const seen = new Set<string>();
  const hasDuplicate = programs.some((p) => {
    const key = `${p.prodi}|${p.univ}`.toLowerCase().replace(/[^a-z0-9|]/g, '');
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
  if (hasDuplicate) {
    return {
      isValid: false,
      total,
      s1Count,
      d4Count,
      d3Count,
      patternLabel,
      message: 'Program studi yang sama tidak boleh dipilih lebih dari satu kali.',
      needsVokasiFilter: false,
      needsD3Only: false
    };
  }

  if (total > 4) {
    return {
      isValid: false,
      total,
      s1Count,
      d4Count,
      d3Count,
      patternLabel,
      message: 'Maksimal 4 pilihan program studi di SNBT 2026.',
      needsVokasiFilter: false,
      needsD3Only: false
    };
  }

  if (total <= 2) {
    return {
      isValid: true,
      total,
      s1Count,
      d4Count,
      d3Count,
      patternLabel,
      message: `Kombinasi sah SNBT 2026 (${total} pilihan: bebas kombinasi jenjang S1/D4/D3).`,
      needsVokasiFilter: false,
      needsD3Only: false
    };
  }

  if (total === 3) {
    if (s1Count > 2) {
      return {
        isValid: false,
        total,
        s1Count,
        d4Count,
        d3Count,
        patternLabel,
        message: 'Pilihan belum sah: dengan 3 pilihan, maksimal 2 S1. Ganti satu ke D4/D3, atau pakai 2 pilihan.',
        needsVokasiFilter: true,
        needsD3Only: false
      };
    }
    if (vokasiCount === 3 && d3Count === 0) {
      return {
        isValid: false,
        total,
        s1Count,
        d4Count,
        d3Count,
        patternLabel,
        message: 'Pilihan belum sah: jika ketiga pilihan adalah program Vokasi, wajib menyertakan minimal 1 program D3.',
        needsVokasiFilter: true,
        needsD3Only: true
      };
    }
    return {
      isValid: true,
      total,
      s1Count,
      d4Count,
      d3Count,
      patternLabel,
      message: `Kombinasi sah SNBT 2026 (3 pilihan: ${s1Count} S1 + ${vokasiCount} Vokasi).`,
      needsVokasiFilter: false,
      needsD3Only: false
    };
  }

  // total === 4
  if (s1Count > 2) {
    return {
      isValid: false,
      total,
      s1Count,
      d4Count,
      d3Count,
      patternLabel,
      message: 'Pilihan belum sah: dengan 4 pilihan, maksimal 2 S1 dan wajib menyertakan minimal 1 program D3.',
      needsVokasiFilter: true,
      needsD3Only: d3Count === 0
    };
  }
  if (d3Count === 0) {
    return {
      isValid: false,
      total,
      s1Count,
      d4Count,
      d3Count,
      patternLabel,
      message: 'Pilihan belum sah: dengan 4 pilihan, wajib menyertakan minimal 1 program D3.',
      needsVokasiFilter: true,
      needsD3Only: true
    };
  }
  return {
    isValid: true,
    total,
    s1Count,
    d4Count,
    d3Count,
    patternLabel,
    message: `Kombinasi sah SNBT 2026 (4 pilihan: ${s1Count} S1 + ${d4Count} D4 + ${d3Count} D3).`,
    needsVokasiFilter: false,
    needsD3Only: false
  };
}

export interface DerivedPrioritySubtest {
  id: string;
  priorityLabel: string;
  name: string;
  weightPct: number | null;
  toScore: string;
  toLatestNum: number;
  rawProgramTarget: number;
  targetScore: number;
  gapText: string;
  gapNum: number;
  rgQuestionsDone: number;
  drillSessions: number;
  drillAccuracyPct: number;
  rgAccuracy: string;
  lowestTopics: string[];
}

/**
 * Mengunci penentuan maksimal 3 subtes prioritas ke Pilihan 1 saja
 * serta menerapkan aturan baseline target: minimal 600 (atau target jurusan jika > 600).
 */
export function derivePrioritySubtestsForChoice1(
  student: Checkpoint1Student,
  choice1: ProgramChoice | undefined,
  foundationMin: number = 600
): DerivedPrioritySubtest[] {
  const matched = choice1 ? matchCatalogProgram(choice1) : undefined;
  const fallbackProgramTarget = choice1?.targetScore ?? matched?.targetScore ?? foundationMin;

  const subtestById = new Map(student.subtests.map((s) => [s.id, s]));
  const existingPriorityById = new Map(student.prioritySubtests.map((p) => [p.id, p]));
  const lbiCombinedFallback = existingPriorityById.get('lbi');

  const keys: SubtestKey[] = matched
    ? matched.prioritySubtests.slice(0, 3)
    : student.prioritySubtests
        .slice(0, 3)
        .map((p) => (p.id === 'lbi' ? 'lbi_a' : (p.id as SubtestKey)));

  return keys.slice(0, 3).map((key, idx) => {
    const subRow = subtestById.get(key);
    const existing =
      existingPriorityById.get(key) ||
      (key === 'lbi_a' || key === 'lbe' ? lbiCombinedFallback : undefined);

    const rawTarget = matched?.subtestTargets?.[key] ?? fallbackProgramTarget;
    const effectiveTarget = Math.max(foundationMin, rawTarget);
    const toLatestNum = subRow?.to4 ?? existing?.toLatestNum ?? 500;
    const gapNum = toLatestNum - effectiveTarget;
    const gapText = gapNum > 0 ? `+${gapNum}` : String(gapNum);
    const weightPct = matched ? Math.round((matched.subtestWeights[key] || 0) * 100) : null;

    const rgQuestionsDone = existing?.rgQuestionsDone ?? 12;
    const drillSessions = existing?.drillSessions ?? 2;
    const drillAccuracyPct = existing?.drillAccuracyPct ?? 55;

    return {
      id: key,
      priorityLabel: `PRIORITAS #${idx + 1}`,
      name: subRow?.name || SUBTEST_LABELS[key]?.full || key.toUpperCase(),
      weightPct,
      toScore: String(toLatestNum),
      toLatestNum,
      rawProgramTarget: rawTarget,
      targetScore: effectiveTarget,
      gapText,
      gapNum,
      rgQuestionsDone,
      drillSessions,
      drillAccuracyPct,
      rgAccuracy: existing?.rgAccuracy ?? `${drillAccuracyPct}% benar (${drillSessions} sesi)`,
      lowestTopics: existing?.lowestTopics ?? [
        'Pemahaman Konsep Inti (48% benar)',
        'Penerapan Analisis Soal (52% benar)',
        'Ketelitian & Manajemen Waktu (56% benar)'
      ]
    };
  });
}
