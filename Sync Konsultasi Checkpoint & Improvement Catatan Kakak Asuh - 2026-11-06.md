# Sync Konsultasi Checkpoint 1 & Improvement Catatan Kakak Asuh — 6 November 2026

**Tanggal Meeting:** 6 November 2026, 16:02 WIB  
**Durasi Rekaman:** 50 menit 59 detik  
**File Sumber:** `/Users/fa-2400/Downloads/Sync Konsultasi Checkpoint & Improvement Catatan Kakak Asuh - 2026_11_06 16_02 WIB – Recording.mp4`  
**Peserta:** Mas Dimas, Mas Alvin, Kak Belfa, Kak Nana, dan Tim Product/Academic/Kesiswaan  
**Konteks Dokumen:** Hasil kesepakatan desain alur, kebutuhan data, dan standarisasi proses untuk **Konsultasi Checkpoint 1** serta **Improvement Catatan Kakak Asuh** pada Super CMS Brain Academy.

---

## 1. Latar Belakang & Premis Utama

Konsultasi kelas 12 dibagi menjadi 3 tahap utama:
1. **Konsultasi Awal (Profiling)**: Penetapan target awal prodi/kampus impian berdasarkan minat dan nilai diagnostik (Agustus–Oktober).
2. **Konsultasi Checkpoint 1**: Evaluasi pasca pelaksanaan 4 Tryout Wajib UTBK Reguler (30 November – 31 Desember 2026).
3. **Konsultasi Checkpoint 2 (Finalisasi SNBP/SNBT)**: Penentuan pilihan akhir kampus menjelang pendaftaran resmi.

### Premis Kritis Pembimbingan SA:
> *"Kompetensi dan jam terbang SA (Student Advisor / Kakak Asuh) di cabang sangat heterogen. Tidak semua SA pandai menganalisis data atau memandu percakapan secara natural. Oleh karena itu, antarmuka Super CMS tidak boleh hanya menyajikan lembar data mentah atau form kosong, melainkan harus berupa **Guideline Terstruktur (Scaffolding)** yang membimbing SA langkah demi langkah."*

---

## 2. Poin Keputusan: Konsultasi Checkpoint 1

### A. Waktu & Pemicu Pelaksanaan
- **Jadwal**: Dimulai 30 November 2026 (pasca rilis rapor TO Episode 4) sampai 31 Desember 2026.
- **Syarat**: Siswa telah menyelesaikan 4 TO Reguler UTBK.

### B. Penarikan Data Akademik (Data Ingestion)
1. **Riwayat 3–4 TO Terakhir**:
   - Selalu memprioritaskan nilai **TO Reguler UTBK**.
   - Jika data TO Reguler kurang dari 3, sistem mengisi gap dengan data TO Premium atau TO Diagnostik.
   - Menampilkan skor per episode, nilai rata-rata, tren (naik/turun), dan selisih terhadap target passing grade prodi pilihan 1.
2. **Diagnostik Subtes & Materi Lemah**:
   - Menampilkan subtes yang masih di bawah target passing grade.
   - Jika subtes di bawah target > 3, batasi tampilan utama ke **3 subtes terendah (lowest subtests)**.
   - Di tiap subtes terendah, munculkan **3 topik materi yang paling banyak salah** saat TO.
3. **Audit Korelasi Drill Soal (Student Tower)**:
   - Rekapitulasi pengerjaan drill soal siswa (total sesi & butir soal).
   - **Panduan SA**: Cek apakah drill soal yang dikerjakan siswa sudah sesuai dengan materi pada subtes terlemah. Sering ditemukan siswa banyak drill soal, namun hanya di subtes yang sudah ia kuasai (latihan semu).
4. **Kehadiran & Aktivitas Belajar**:
   - Persentase kehadiran Tatap Muka Belajar (TMB), Klinik PR, dan catatan dari pengajar kelas.

### C. Fitur Baru: Input & Edit Nilai Rapor Semester 5
- **Problem**: Pada saat form Profiling awal, siswa belum menerima rapor semester 5.
- **Keputusan**: Pada halaman Checkpoint 1, Super CMS wajib menyediakan tabel input nilai rapor Semester 5 agar bisa segera dianalisis untuk peluang SNBP dan kuota *eligible* sekolah.

### D. Panduan Dialog & Negosiasi SA (Talking Points)
1. **Membingkai Skor yang Turun / Fluktuatif**:
   - Jangan memvonis kegagalan. Uraikan bahwa penurunan terjadi pada subtes spesifik (misal PU/PK).
   - Buat komitmen target bertahap (misal kenaikan +30 sampai +50 poin pada episode berikutnya) yang didukung volume drill dan klinik PR.
2. **Menjembatani Dinamika Orang Tua vs Siswa**:
   - **Batasan Wilayah**: Sering kali orang tua (terutama untuk siswi perempuan) membatasi lokasi kampus (misal: "tidak boleh kuliah di luar Jabodetabek"). SA wajib memverifikasi ini di awal obrolan.
   - **Beda Pilihan Prodi**: Anak ingin Farmasi/Kedokteran, sementara orang tua ingin Teknik/Hukum. SA menggunakan fitur Simulasi Peluang untuk menunjukkan gap riil dan menyepakati pilihan kompromi (Pilihan 1 vs Pilihan 2).

### E. Integrasi Fitur Simulasi & Disclaimer Keamanan
- Sediakan tombol pintas langsung ke fitur **Simulasi**.
- Simulasi di Checkpoint 1 sudah otomatis *pre-filtered* dengan minat rumpun, provinsi, dan nilai rata-rata siswa.
- **Disclaimer Wajib**: Laporan dan simulasi harus menegaskan bahwa angka peluang adalah acuan target latihan internal Ruangguru, bukan jaminan resmi kelulusan SNPMB.

### F. Output PDF Ringkas & Lembar Kesepakatan 3 Pihak
- **PDF 2 Halaman**: Dokumen hasil konsultasi diringkas menjadi 2 halaman yang rapi dan profesional untuk dibawa pulang orang tua.
- **Persetujuan 3 Pihak**: Sebelum dokumen di-lock, terdapat konfirmasi persetujuan dari:
  1. Siswa
  2. Orang Tua
  3. Kakak Asuh / SA

---

## 3. Poin Keputusan: Improvement Catatan Kakak Asuh (Log Rutin)

Format catatan rutin bulanan Kakak Asuh yang semula berupa teks narasi bebas diubah menjadi **format terstruktur model Fill-in-the-Blank (7 Komponen)**:

| No | Komponen | Tipe Input | Deskripsi & Aturan |
| :--- | :--- | :--- | :--- |
| **1** | **Target PTN & Prodi** | Autofill, Editable | Ditarik dari Konsultasi Awal/Checkpoint. Bisa diubah jika ada perubahan minat di tengah jalan. Bisa >1 pilihan. |
| **2** | **Jalur Masuk Prioritas** | Pilihan + Manual | SNBP, SNBT, Ujian Mandiri, Kedinasan. Sediakan input manual untuk jalur khusus. |
| **3** | **Kebiasaan Belajar** | Autofill + Editable | Ditarik dari Student Tower 1 bulan terakhir: Kehadiran TMB (%), jumlah sesi drill, dan butir soal. Ditambah field isian belajar mandiri di rumah. |
| **4** | **Motivasi & Keaktifan Belajar** | Isian Manual / Opsi | Keaktifan di kelas, frekuensi ikut Klinik PR, atau fokus aktivitas non-akademik (IELTS, les musik, dll). |
| **5** | **Kekuatan & Kelemahan Belajar** | Autofill, Editable | Subtes terkuat dan 3 subtes terendah dari data TO terakhir terhadap target pilihan 1. |
| **6** | **Tantangan Belajar** | Isian Deskriptif | Kendala nyata siswa: manajemen waktu, bentrok ekskul, kelelahan, atau tekanan orang tua. |
| **7** | **Rancangan Tindak Lanjut** | Isian Terarah | Rekomendasi spesifik: target drill pada subtes terlemah, jadwal klinik PR, dan komitmen target skor. |

### Helper Side Drawer (UI Super CMS)
- Untuk membantu SA yang bingung merangkai kata, Super CMS akan menyediakan drawer samping yang memuat contoh isian konkret (*cheat sheet*), batas karakter, dan ringkasan data siswa yang tetap terlihat saat mengetik.

---

## 4. Implikasi ke Prototype Konsultasi Checkpoint 1

Berdasarkan kesepakatan meeting ini, prototype `Consultation Checkpoint 1 - Prototype.html` perlu ditingkatkan dengan:
1. **Navigasi Step-by-Step (Tahapan Konsultasi)**:
   - *Tahap 1*: Evaluasi Pilihan & Preferensi Keluarga (Konfirmasi batasan wilayah & prodi ortu vs anak).
   - *Tahap 2*: Evaluasi Performa Akademik & Input Nilai Rapor Semester 5.
   - *Tahap 3*: Diagnostik Subtes Terlemah & Audit Kesesuaian Drill Soal.
   - *Tahap 4*: Simulasi Peluang & Rekomendasi Alternatif.
   - *Tahap 5*: Pengisian Catatan Konsultasi Terstruktur (7 Komponen).
   - *Tahap 6*: Rencana Tindak Lanjut, Lembar Kesepakatan 3 Pihak, & Finalisasi PDF 2 Halaman.
2. **Kartu Panduan / Script SA**: Talking points di setiap tahap agar SA tahu persis apa yang harus ditanyakan dan disepakati.
3. **Data Dummy Garuda Sena**: Menggunakan data riil pilot Garuda Sena (TO drop 601 → 546, PU 465, PK 488, LBI-A 505, drill 31 sesi tapi tidak fokus ke PU/PK, konflik Farmasi UGM vs Teknik Mesin).
