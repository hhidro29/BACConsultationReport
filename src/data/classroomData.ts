export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Sakit' | 'Izin';

export interface ClassroomSession {
  id: string;
  dateLabel: string;
  timeLabel: string;
  subject: string;
  teacher: string;
  attendance: AttendanceStatus;
  attendanceNote?: string;
  noteText: string | null;
}

export interface StudentClassroomData {
  studentId: string;
  periodLabel: string;
  capturedLabel: string;
  totalSessions: number;
  presentSessions: number;
  lateSessions: number;
  sickSessions: number;
  excusedSessions: number;
  notesCount: number;
  sessions: ClassroomSession[];
  saTasks: string[];
  guardrailNote: string;
}

const GARUDA_SESSIONS: ClassroomSession[] = [
  { id: 'REFRESH-CLASS-041', dateLabel: '19 Okt 2026', timeLabel: '19:00', subject: 'Dasar-Dasar Numerasi', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-042', dateLabel: '19 Okt 2026', timeLabel: '17:00', subject: 'Pemahaman Bacaan dan Menulis', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-043', dateLabel: '15 Okt 2026', timeLabel: '19:00', subject: 'Biologi', teacher: 'Nur Afifah Fitriyanti', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-044', dateLabel: '15 Okt 2026', timeLabel: '17:00', subject: 'Fisika', teacher: 'suranto', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-023', dateLabel: '12 Okt 2026', timeLabel: '19:00', subject: 'Matematika Tingkat Lanjut', teacher: 'Ristyana Suryanti', attendance: 'Sakit', attendanceNote: 'Sakit', noteText: null },
  { id: 'REFRESH-CLASS-024', dateLabel: '12 Okt 2026', timeLabel: '17:00', subject: 'Bahasa Inggris', teacher: 'Tanto Purwanto', attendance: 'Sakit', attendanceNote: 'Sakit', noteText: null },
  { id: 'REFRESH-CLASS-025', dateLabel: '08 Okt 2026', timeLabel: '19:00', subject: 'Kimia', teacher: 'Nadya Kartika Putri N', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-026', dateLabel: '08 Okt 2026', timeLabel: '17:00', subject: 'Fisika', teacher: 'suranto', attendance: 'Terlambat', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-027', dateLabel: '05 Okt 2026', timeLabel: '19:00', subject: 'Matematika', teacher: 'Ristyana Suryanti', attendance: 'Sakit', attendanceNote: 'Sakit', noteText: null },
  { id: 'REFRESH-CLASS-028', dateLabel: '05 Okt 2026', timeLabel: '17:00', subject: 'Bahasa Indonesia', teacher: 'Amanda Ayu Lestari', attendance: 'Sakit', attendanceNote: 'Sakit', noteText: null },
  { id: 'REFRESH-CLASS-029', dateLabel: '01 Okt 2026', timeLabel: '19:00', subject: 'Pengetahuan dan Pemahaman Umum', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-030', dateLabel: '01 Okt 2026', timeLabel: '17:00', subject: 'Sejarah', teacher: 'Addin Zahran Rahman', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-031', dateLabel: '28 Sep 2026', timeLabel: '19:00', subject: 'Matematika Tingkat Lanjut', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-032', dateLabel: '28 Sep 2026', timeLabel: '17:00', subject: 'Biologi', teacher: 'Allen Nurul Kurniah', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-033', dateLabel: '24 Sep 2026', timeLabel: '19:00', subject: 'Bahasa Indonesia', teacher: 'Amanda Ayu Lestari', attendance: 'Izin', attendanceNote: 'Lainnya: persiapan ulangan tengah semester sejarah', noteText: null },
  { id: 'REFRESH-CLASS-034', dateLabel: '24 Sep 2026', timeLabel: '17:00', subject: 'Fisika', teacher: 'suranto', attendance: 'Izin', attendanceNote: 'Lainnya: persiapan ulangan tengah semester sejarah', noteText: null },
  { id: 'REFRESH-CLASS-035', dateLabel: '21 Sep 2026', timeLabel: '19:00', subject: 'Matematika', teacher: 'arya kusumah sejati', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-036', dateLabel: '21 Sep 2026', timeLabel: '17:00', subject: 'Dasar-Dasar Linguistik', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-037', dateLabel: '17 Sep 2026', timeLabel: '19:00', subject: 'Biologi', teacher: 'Allen Nurul Kurniah', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-038', dateLabel: '17 Sep 2026', timeLabel: '17:00', subject: 'Bahasa Inggris', teacher: 'Tanto Purwanto', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-039', dateLabel: '14 Sep 2026', timeLabel: '19:00', subject: 'Kimia', teacher: 'Rahmania Tulus S. Pratiwi', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-040', dateLabel: '14 Sep 2026', timeLabel: '17:00', subject: 'Matematika Tingkat Lanjut', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-007', dateLabel: '10 Sep 2026', timeLabel: '19:00', subject: 'Fisika', teacher: 'suranto', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda cukup aktif di kelas, meskipun sesekali masih perlu ditunjuk. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-008', dateLabel: '10 Sep 2026', timeLabel: '17:00', subject: 'Bahasa Indonesia', teacher: 'Amanda Ayu Lestari', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-009', dateLabel: '07 Sep 2026', timeLabel: '19:00', subject: 'Matematika', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-010', dateLabel: '07 Sep 2026', timeLabel: '17:00', subject: 'Dasar-Dasar Linguistik', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami sebagian besar materi, meskipun masih membutuhkan bantuan di beberapa bagian.' },
  { id: 'REFRESH-CLASS-011', dateLabel: '03 Sep 2026', timeLabel: '19:00', subject: 'Kimia', teacher: 'Rahmania Tulus S. Pratiwi', attendance: 'Sakit', attendanceNote: 'Sakit', noteText: null },
  { id: 'REFRESH-CLASS-012', dateLabel: '03 Sep 2026', timeLabel: '17:00', subject: 'Sejarah', teacher: 'Addin Zahran Rahman', attendance: 'Sakit', attendanceNote: 'Sakit', noteText: null },
  { id: 'REFRESH-CLASS-013', dateLabel: '31 Agu 2026', timeLabel: '19:00', subject: 'Biologi', teacher: 'Allen Nurul Kurniah', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-014', dateLabel: '31 Agu 2026', timeLabel: '17:00', subject: 'Dasar-Dasar Numerasi', teacher: 'Nadya Kartika Putri N', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-015', dateLabel: '27 Agu 2026', timeLabel: '19:00', subject: 'Kimia', teacher: 'Rahmania Tulus S. Pratiwi', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-016', dateLabel: '27 Agu 2026', timeLabel: '17:00', subject: 'Bahasa Indonesia', teacher: 'Amanda Ayu Lestari', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-017', dateLabel: '24 Agu 2026', timeLabel: '19:00', subject: 'Fisika', teacher: 'suranto', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-018', dateLabel: '24 Agu 2026', timeLabel: '17:00', subject: 'Matematika', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-019', dateLabel: '20 Agu 2026', timeLabel: '19:00', subject: 'Biologi', teacher: 'Allen Nurul Kurniah', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-020', dateLabel: '20 Agu 2026', timeLabel: '17:00', subject: 'Dasar-Dasar Linguistik', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-021', dateLabel: '13 Agu 2026', timeLabel: '19:00', subject: 'Kimia', teacher: 'Rahmania Tulus S. Pratiwi', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-022', dateLabel: '13 Agu 2026', timeLabel: '17:00', subject: 'Dasar-Dasar Numerasi', teacher: 'Nadya Kartika Putri N', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-001', dateLabel: '10 Agu 2026', timeLabel: '19:00', subject: 'Sejarah', teacher: 'Regita Hakim', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-002', dateLabel: '10 Agu 2026', timeLabel: '17:00', subject: 'Matematika Tingkat Lanjut', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-003', dateLabel: '06 Agu 2026', timeLabel: '19:00', subject: 'Biologi', teacher: 'Allen Nurul Kurniah', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' },
  { id: 'REFRESH-CLASS-004', dateLabel: '06 Agu 2026', timeLabel: '17:00', subject: 'Bahasa Inggris', teacher: 'Tanto Purwanto', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-005', dateLabel: '03 Agu 2026', timeLabel: '19:00', subject: 'Matematika', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: null },
  { id: 'REFRESH-CLASS-006', dateLabel: '03 Agu 2026', timeLabel: '17:00', subject: 'Fisika', teacher: 'suranto', attendance: 'Hadir', noteText: 'Pada sesi ini, Ananda menunjukkan antusiasme tinggi dan aktif bertanya di kelas. Dari penguasaan materi, Ananda memahami materi dengan sangat baik dan mampu mengerjakan tugas dengan mandiri.' }
];

export const STUDENT_CLASSROOM_DATA: Record<string, StudentClassroomData> = {
  garuda: {
    studentId: 'garuda',
    periodLabel: '13 Jul–26 Nov 2026',
    capturedLabel: 'Diambil 22 Okt 2026',
    totalSessions: 44,
    presentSessions: 36,
    lateSessions: 1,
    sickSessions: 6,
    excusedSessions: 2,
    notesCount: 16,
    sessions: GARUDA_SESSIONS,
    saTasks: [
      'Apresiasi kehadiran Garuda di kelas TMB (36 / 44 sesi) dan cek catatan asli pengajar di tabel atas (khususnya Fisika 10 Sep & Dasar-Dasar Linguistik 7 Sep), lalu gali mengapa kenyamanan di kelas belum sepenuhnya terbawa saat menghadapi soal berbatas waktu di TO 4.',
      'Konfirmasi tindak lanjut ketidakhadiran 8 sesi (6 Sakit & 2 Izin UTS): pastikan Garuda sudah mengejar materi yang sempat terlewat lewat rekaman atau Klinik PR.'
    ],
    guardrailNote:
      'Data di atas menampilkan rekaman asli Student Tower per sesi tanpa pemrosesan AI. Dari 44 sesi tercatat, 28 sesi belum memiliki catatan tertulis — artinya belum diisi pengajar, bukan berarti siswa pasif.'
  },
  nadira: {
    studentId: 'nadira',
    periodLabel: '13 Jul–26 Nov 2026',
    capturedLabel: 'Diambil 22 Okt 2026',
    totalSessions: 44,
    presentSessions: 42,
    lateSessions: 1,
    sickSessions: 2,
    excusedSessions: 0,
    notesCount: 14,
    sessions: [
      { id: 'NAD-CLASS-001', dateLabel: '21 Okt 2026', timeLabel: '17:00', subject: 'Pemahaman Bacaan dan Menulis', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: 'Ananda sangat aktif berdiskusi membedah struktur argumen bacaan dan mampu menyelesaikan latihan analisis paragraf dengan cepat dan tepat.' },
      { id: 'NAD-CLASS-002', dateLabel: '17 Okt 2026', timeLabel: '19:00', subject: 'Sosiologi', teacher: 'Rina Kusuma', attendance: 'Hadir', noteText: 'Menunjukkan antusiasme tinggi saat studi kasus perubahan sosial, aktif bertanya, dan mampu menjelaskan kembali konsep inti kepada teman sebangku.' },
      { id: 'NAD-CLASS-003', dateLabel: '14 Okt 2026', timeLabel: '17:00', subject: 'Pengetahuan Kuantitatif', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: 'Ananda aktif mencoba mengerjakan soal di papan tulis, namun masih memerlukan pendampingan bertahap dalam mempercepat penyelesaian soal pertidaksamaan.' },
      { id: 'NAD-CLASS-004', dateLabel: '10 Okt 2026', timeLabel: '19:00', subject: 'Bahasa Inggris', teacher: 'Tanto Purwanto', attendance: 'Hadir', noteText: 'Mampu menangkap gagasan tersirat dan nada penulis dengan sangat baik serta mengerjakan latihan reading comprehension secara mandiri.' },
      { id: 'NAD-CLASS-005', dateLabel: '09 Okt 2026', timeLabel: '17:00', subject: 'Pengetahuan dan Pemahaman Umum', teacher: 'Amanda Ayu Lestari', attendance: 'Hadir', noteText: 'Sangat teliti menemukan makna kata kontekstual dan aktif mengonfirmasi perbedaan nuansa sinonim di kelas.' },
      { id: 'NAD-CLASS-006', dateLabel: '07 Okt 2026', timeLabel: '19:00', subject: 'Matematika', teacher: 'Ristyana Suryanti', attendance: 'Terlambat', noteText: 'Ananda tetap mengikuti kelas dengan fokus; memahami alur konsep dasar namun masih butuh bimbingan untuk soal aplikasi rasio bertingkat.' },
      { id: 'NAD-CLASS-007', dateLabel: '03 Okt 2026', timeLabel: '17:00', subject: 'Ekonomi', teacher: 'Hendra Wijaya', attendance: 'Hadir', noteText: null },
      { id: 'NAD-CLASS-008', dateLabel: '30 Sep 2026', timeLabel: '19:00', subject: 'Sejarah', teacher: 'Addin Zahran Rahman', attendance: 'Sakit', attendanceNote: 'Sakit', noteText: null },
      { id: 'NAD-CLASS-009', dateLabel: '26 Sep 2026', timeLabel: '17:00', subject: 'Bahasa Indonesia', teacher: 'Amanda Ayu Lestari', attendance: 'Hadir', noteText: 'Ananda aktif menganalisis kalimat efektif dan mampu menyunting kesalahan tanda baca dalam paragraf argumentatif secara mandiri.' },
      { id: 'NAD-CLASS-010', dateLabel: '23 Sep 2026', timeLabel: '19:00', subject: 'Penalaran Umum', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: 'Mengikuti alur deduktif-induktif dengan sangat baik serta cepat mengenali kesimpulan yang valid pada latihan silogisme.' },
      { id: 'NAD-CLASS-011', dateLabel: '19 Sep 2026', timeLabel: '17:00', subject: 'Geografi', teacher: 'Rina Kusuma', attendance: 'Hadir', noteText: 'Antusias mempresentasikan analisis peta tematik dan aktif mengaitkan konsep tata ruang dengan contoh studi kasus wilayah.' },
      { id: 'NAD-CLASS-012', dateLabel: '16 Sep 2026', timeLabel: '19:00', subject: 'Pengetahuan Kuantitatif', teacher: 'Ristyana Suryanti', attendance: 'Hadir', noteText: 'Sudah mulai lancar membaca grafik statistika sederhana, perlu memperbanyak latihan soal peluang agar lebih percaya diri.' },
      { id: 'NAD-CLASS-013', dateLabel: '12 Sep 2026', timeLabel: '17:00', subject: 'Bahasa Inggris', teacher: 'Tanto Purwanto', attendance: 'Hadir', noteText: 'Aktif berpartisipasi dalam pembahasan vocabulary in context dan menjawab pertanyaan inferensi dengan akurasi baik.' },
      { id: 'NAD-CLASS-014', dateLabel: '09 Sep 2026', timeLabel: '19:00', subject: 'Sosiologi', teacher: 'Rina Kusuma', attendance: 'Hadir', noteText: 'Menunjukkan keaktifan berpendapat mengenai topik stratifikasi sosial dan menyelesaikan tugas individu tepat waktu.' },
      { id: 'NAD-CLASS-015', dateLabel: '05 Sep 2026', timeLabel: '17:00', subject: 'Pemahaman Bacaan dan Menulis', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: 'Memahami materi kohesi dan koherensi antarparagraf dengan sangat baik dan teliti memeriksa struktur kalimat baku.' },
      { id: 'NAD-CLASS-016', dateLabel: '02 Sep 2026', timeLabel: '19:00', subject: 'Dasar-Dasar Linguistik', teacher: 'Muhamad Diky Yulianto', attendance: 'Hadir', noteText: 'Antusias bertanya saat sesi latihan morfologi dan mampu membedakan makna imbuhan secara kontekstual.' }
    ],
    saTasks: [
      'Pertahankan ritme kehadiran kelas TMB (42/44 sesi) yang sudah sangat baik dan selaras dengan tren kenaikan skor TO Nadira.',
      'Manfaatkan masukan pengajar Matematika & PK (07 & 14 Okt) untuk menyusun sesi Klinik PR khusus strategi pengerjaan cepat soal kuantitatif.'
    ],
    guardrailNote:
      'Ditampilkan sampel sesi terbaru beserta seluruh sesi bercatatan penting. Catatan kosong pada sebagian sesi berarti pengajar belum mengisi catatan tertulis pada sesi tersebut.'
  },
  rizky: {
    studentId: 'rizky',
    periodLabel: '13 Jul–26 Nov 2026',
    capturedLabel: 'Diambil 22 Okt 2026',
    totalSessions: 42,
    presentSessions: 32,
    lateSessions: 3,
    sickSessions: 6,
    excusedSessions: 4,
    notesCount: 6,
    sessions: [
      { id: 'RIZ-CLASS-001', dateLabel: '12 Okt 2026', timeLabel: '17:00', subject: 'Fisika', teacher: 'Budi Santoso', attendance: 'Hadir', noteText: 'Ananda menyimak penjelasan dengan tenang dan mencatat poin penting, namun masih jarang bertanya jika belum dipancing oleh pengajar.' },
      { id: 'RIZ-CLASS-002', dateLabel: '08 Okt 2026', timeLabel: '19:00', subject: 'Dasar-Dasar Numerasi', teacher: 'Dian Pratiwi', attendance: 'Hadir', noteText: 'Ananda bersedia mencoba latihan, namun masih membutuhkan bimbingan langkah demi langkah pada operasi aljabar dan pecahan dasar.' },
      { id: 'RIZ-CLASS-003', dateLabel: '05 Okt 2026', timeLabel: '17:00', subject: 'Penalaran Umum', teacher: 'Fajar Nugroho', attendance: 'Terlambat', noteText: 'Hadir terlambat 15 menit; setelah menyesuaikan diri, Ananda cukup fokus mengikuti pembahasan silogisme dasar hingga selesai.' },
      { id: 'RIZ-CLASS-004', dateLabel: '01 Okt 2026', timeLabel: '19:00', subject: 'Matematika', teacher: 'Dian Pratiwi', attendance: 'Hadir', noteText: 'Membutuhkan waktu lebih panjang pada latihan soal persamaan linear satu variabel dan lebih terbantu bila didampingi per langkah.' },
      { id: 'RIZ-CLASS-005', dateLabel: '29 Sep 2026', timeLabel: '17:00', subject: 'Pengetahuan & Pemahaman Umum', teacher: 'Rika Amalia', attendance: 'Hadir', noteText: 'Cukup kondusif di kelas, mampu menjawab saat ditunjuk langsung oleh pengajar terkait ide pokok paragraf.' },
      { id: 'RIZ-CLASS-006', dateLabel: '22 Sep 2026', timeLabel: '19:00', subject: 'Bahasa Indonesia', teacher: 'Rika Amalia', attendance: 'Hadir', noteText: 'Mengikuti diskusi teks bacaan dengan baik ketika dibahas bersama kelompok kecil.' },
      { id: 'RIZ-CLASS-007', dateLabel: '18 Sep 2026', timeLabel: '17:00', subject: 'Pengetahuan Kuantitatif', teacher: 'Dian Pratiwi', attendance: 'Izin', attendanceNote: 'Izin kegiatan sekolah', noteText: null },
      { id: 'RIZ-CLASS-008', dateLabel: '15 Sep 2026', timeLabel: '19:00', subject: 'Bahasa Inggris', teacher: 'Tanto Purwanto', attendance: 'Sakit', attendanceNote: 'Sakit', noteText: null }
    ],
    saTasks: [
      'Gali hambatan utama kehadiran (10 sesi absen: 6 Sakit & 4 Izin, serta 3 Terlambat) sebelum menambah target belajar di luar jam kelas.',
      'Gunakan pendekatan aman saat bertanya: dorong Rizky memilih 1 pertanyaan yang ingin dikonfirmasi di Klinik PR fondasi numerasi, agar nyaman berdiskusi tanpa merasa tertekan di kelas besar.'
    ],
    guardrailNote:
      'Hanya 6 dari 42 sesi yang memiliki catatan tertulis pengajar. Jangan menyimpulkan siswa malas hanya dari absensi atau sedikitnya catatan; validasi dulu kendala jadwal, kesehatan, atau kenyamanan bertanya di kelas.'
  }
};
