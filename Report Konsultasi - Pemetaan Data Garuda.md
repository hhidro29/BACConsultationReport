# Report Konsultasi — Pemetaan Data Garuda

Tanggal: 21 Oktober 2026  
Status: pemetaan awal untuk aplikasi pilot; acuan tampilan adalah report Garuda.

## Cara memakai

Siapkan satu snapshot per siswa dengan ID paket yang tetap, misalnya `PILOT-001-W40`. Setiap data detail merujuk ID paket dan ID sumber. Gunakan template pengumpulan untuk mencatat sumber, filter, dan cakupan. Data yang belum tersedia dibiarkan kosong dengan alasan yang tercatat.

Data asli dan bukti pengambilan berada di folder lokal `outputs/report-pilot-2026-10-21/`, yang diabaikan Git. Fixture chatbot sintetis tetap terpisah. Pemetaan ini tidak menetapkan bahwa isi HTML sudah tervalidasi.

## Pemetaan tampilan ke input

| Bagian tampilan | Input | Bentuk satu baris | Sumber yang diperiksa | Perilaku saat data kurang |
|---|---|---|---|---|
| Header dan periode | Paket, ID/alias siswa, kelas/rombel, cabang, tahun ajaran, SA, periode aktivitas, tanggal pengambilan | Satu paket siswa | Roster dan header detail | ID penghubung dan periode wajib untuk menyiapkan paket |
| Ringkasan nilai TO | Event, waktu submission, jenis, skor total sumber | Satu event tryout | Detail > Tryout | Satu event hanya mendukung snapshot; jangan menampilkan perubahan tanpa pembanding |
| Grafik dan filter subtes | Kode dan nama subtes sumber, skor, event | Satu event dengan kolom skor subtes | Matriks riwayat tryout | Jeda/indikasi belum tersedia; tidak membuat skor perantara |
| Ringkasan subtes | Skor terbaru, perubahan, riwayat yang sebanding | Turunan data tryout | Matriks riwayat tryout | Penentuan fokus menunggu aturan akademik; jangan menetapkan daftar tetap dari nama siswa |
| Materi lemah | Event, materi, subtes, benar, total, ID/nama materi sumber | Satu materi per event | Rapor analisis materi; belum ditemukan pada tab Tryout Tower yang diperiksa | Tampilkan analisis tingkat subtes dan status rincian materi belum tersedia |
| Drill terkait | Waktu, kelas, kurikulum, subject, benar, total, salah, kosong, materi bila tersedia | Satu sesi drill | Detail > Drill Soal, seluruh halaman pada periode | Subject saja tidak cukup untuk menyatakan latihan sesuai materi tertentu |
| Konteks belajar | Kehadiran sesi, catatan pengajar/SA, Profiling, tanggal dan cakupan | Satu catatan atau sesi | Kehadiran, Catatan Siswa, Catatan pada drawer, Profiling | Tampilkan pertanyaan klarifikasi yang sesuai; jangan mengarang kebiasaan atau dukungan keluarga |
| Pilihan jurusan | Jalur, urutan, kampus, prodi, jenjang, tanggal/sumber | Satu pilihan | Consultation/Profiling, Pilihan UTBK | Bedakan pilihan yang dinyatakan siswa dan rekomendasi |
| Posisi kompetitif | Label metrik sumber, nilai target, persentil siswa/acuan, jumlah pemilih, event, tanggal data | Satu pembanding per pilihan dan event | Drawer > Pilihan UTBK, leaderboard bila ada | Pertahankan label sumber; ranking tidak dihitung dari persentil tanpa definisi dan metode tervalidasi |
| Pembahasan dan tindak lanjut | ID sesi, tanggal, pembahasan, kesepakatan, hal tertunda, tindakan, PIC, tenggat | Satu sesi dan rincian tindak lanjut | Input SA, bukan salinan otomatis dari task operasional | Draft baru terpisah dari riwayat dan catatan resmi |

## Kontrak pengumpulan awal

- `Paket`: konteks siswa, periode aktivitas, tanggal pengambilan, sumber roster, pemeriksa, serta status pemeriksaan.
- `Tryout`: ID paket, ID event lokal, nama event asli, waktu submission, jenis, skor total sumber, delapan kolom subtes sesuai sumber, ID sumber. ID event lokal harus ditandai sebagai ID lokal jika sistem tidak memperlihatkan ID aslinya.
- `Materi`: ID paket, ID event, kode subtes, ID/nama materi sumber, benar, total, ID sumber. Jangan mengalokasikan jumlah benar antar-event dari angka agregat.
- `Drill`: ID paket, ID sesi lokal, tanggal/jam, kelas, kurikulum, subject sumber, benar, total, salah, kosong, ID/nama materi bila terlihat, ID sumber.
- `Pilihan`: ID paket, jalur, urutan, kampus, prodi, jenjang, waktu pembaruan bila diketahui, ID sumber.
- `Pembanding`: ID paket, pilihan, event, label metrik dan nilai sumber, persentil siswa dan acuan, jumlah pemilih, ID sumber. Kuota dan periode hanya diisi jika ditemukan.
- `Konteks`: ID paket, jenis, tanggal/periode, isi asli atau parafrasa berlabel, asal informasi, ID sumber.
- `Sumber`: ID sumber, halaman/tab, URL, filter, waktu pengambilan, cakupan, status pemeriksaan, keterbatasan.
- `Sesi`: ID paket, ID sesi, tanggal, hasil pembahasan, kesepakatan, hal belum selesai, tindakan, PIC, tenggat/evaluasi.

Paket awal disimpan pada `outputs/report-pilot-2026-10-21/`: workbook pengumpulan delapan sheet, snapshot JSON, serta CSV `paket`, `tryout`, `drill`, `pilihan`, `konteks`, `materi`, `sesi`, dan `sumber`. Pilihan dan pembanding berada pada tabel Pilihan yang sama. Identitas paket berada pada sheet Mulai dan `paket.csv`. Materi serta Sesi masih kosong. Baris judul dan petunjuk workbook tidak termasuk data CSV. Importer aplikasi belum dibangun; perubahan pada workbook belum memperbarui CSV/JSON otomatis.

## Temuan pada prototype yang perlu ditangani

| Temuan | Bukti pada HTML Garuda | Tindakan untuk pilot |
|---|---|---|
| Rincian materi dan pemetaan drill masih sintetis | Komentar sebelum `materials`: `Episode-level allocations and drill mappings are synthetic fixtures for this prototype.` | Kosongkan pada dataset nyata sampai rapor materi dan pemetaan ditemukan |
| Seri skor subtes belum seluruhnya cocok dengan sumber | Riwayat pada `series` berbeda dari matriks tryout yang dibuka di Tower | Dataset sumber menjadi input; jangan mengambil riwayat subtes dari HTML |
| Periode tidak seragam | Header, riwayat TO, drill, Profiling, dan pembaruan benchmark memakai tanggal/cakupan berbeda | Simpan dan tampilkan periode per bagian; filter aktivitas bukan otomatis tanggal batas semua data |
| Jenis tryout belum dipisahkan | Label grafik menyebut jenis belum dipisah; sumber menampilkan reguler dan premium | Simpan jenis event, pisahkan analisis sampai kesetaraan disepakati |
| Label metrik pembanding berubah makna | Sumber menyebut Target skor; prototype menyebut nilai tengah leaderboard dan passing grade | Gunakan label sumber sampai definisi dan referensinya diverifikasi |
| Ranking merupakan estimasi | `estimatedLeaderboardRank` menghitung dari persentil dan jumlah peserta | Jangan tampilkan sebagai ranking resmi; gunakan ranking sumber bila tersedia |
| Ada teks statis di luar renderer | Tabel materi prioritas, konteks keluarga, ringkasan drill, dan paragraf benchmark tertanam dalam HTML | Semua isi siswa harus berasal dari paket data atau input SA yang jelas |
| Perhitungan mengasumsikan empat event | Median, indeks nilai terakhir, posisi grafik, dan pembagi rerata tetap | Sesuaikan jumlah event valid; tangani satu event, data kosong, dan subtes yang hilang |
| Hasil konsultasi tersembunyi | Section `tindak-lanjut` memakai `hidden`; komentar menunda bagian ini | Putuskan cakupan tes pencatatan dan aktifkan hanya setelah penyimpanan per sesi siap |
| Penyimpanan belum per sesi | Satu `storageKey` Garuda dipakai berulang | Pisahkan ID siswa, paket snapshot, dan sesi; sediakan ekspor hasil |

## Urutan pengambilan manual

Catatan 21 Oktober: temuan pada tabel prototype di atas mencatat kondisi sebelum revisi pertama. Seri nilai dan matriks subtes kini mengikuti snapshot sumber, grafik/tabel memakai filter jenis, dan rincian materi sintetis tidak lagi ditampilkan pada alur tersebut. Label pembanding, konteks, drill, serta penyimpanan sesi tetap perlu ditangani. Lihat `Report Konsultasi - Catatan Revisi.md` untuk cakupan terkini.

1. Catat cabang, tahun ajaran, pekan, dan periode pada sumber.
2. Temukan siswa; cocokkan identitas dan SA sebelum menyalin angka.
3. Baca matriks Tryout. Simpan nama event dan submission asli, termasuk jenis reguler/premium. Catat bila data muncul di luar periode aktivitas.
4. Ambil Drill Soal pada periode terpilih sampai halaman terakhir. Cocokkan jumlah sesi dan benar/total dengan snapshot sumber.
5. Ambil Kehadiran dan catatan yang relevan. Simpan konteks sumber dan jangan menafsirkan hadir sebagai kebiasaan belajar di rumah.
6. Ambil pilihan dan pembanding dari Pilihan UTBK serta konteks Consultation. Bedakan tanggal Profiling dan event benchmark.
7. Cari rapor analisis materi. Jika belum ditemukan, catat sebagai gap dan jangan isi dari contoh HTML.
8. Minta SA memeriksa isi yang telah disalin sebelum menandai paket siap diuji.

## Status pekerjaan

- [x] Tampilan Garuda dipilih sebagai acuan.
- [x] Sumber Student Tower dapat diakses dan siswa pertama ditemukan.
- [x] Struktur kebutuhan data dan temuan prototype dipetakan.
- [x] Paket pengumpulan pertama disimpan; jumlah record, rujukan sumber, tanggal, dan konsistensi per baris diperiksa.
- [ ] Selisih ringkasan drill 61/138 terhadap detail 63/158 dijelaskan; konflik target dan kekurangan materi ditindaklanjuti sesuai cakupan tes.
- [ ] Pemeriksaan bersama SA selesai.
- [ ] Aplikasi membaca dataset terpisah dari tampilan.
- [ ] Siswa kedua berhasil dimasukkan tanpa menggandakan HTML.
- [ ] Tes penggunaan bersama SA selesai.

Paket pertama memuat 4 event TO, 31 sesi drill, 2 pilihan SNBT, 13 konteks/catatan, dan 4 kehadiran. Periode aktivitas adalah 28 September–4 Oktober 2026, sedangkan TO mencapai 8 Oktober. Detail perbedaan sumber dicatat pada `outputs/report-pilot-2026-10-21/Validasi Data Garuda.md`; pemeriksaan teknis paket belum menggantikan pemeriksaan SA.

## Sorotan drill — draft 22 Oktober 2026

Diterapkan pada kedua prototype Garuda:

- **Prioritas dari tryout:** memakai event sesuai filter jenis TO, lalu menghitung frekuensi masuk tiga nilai terendah melalui `rankSubtests`. Sorotan memerlukan minimal dua kemunculan. Subtes yang sama frekuensinya tetap ditampilkan; nilai seri kosong tidak dianggap nol.
- **Bukti drill subtes:** `drillSnapshot` menyimpan `studentId`, `startDate`, `endDate`, `source`, `copiedAt`, `mappingLevel`, `materialCoverage`, serta agregat `subtest`, `sourceSubject`, `sessions`, `correct`, `total`. Angka berasal dari rincian sumber yang sudah disalin. Agregat ini belum menyediakan ID/tanggal per sesi.
- **Akurasi drill terendah:** memilih rasio `correct / total` terendah dari subtes UTBK & Ujian Mandiri yang tercatat pada periode drill. Ini perbandingan deskriptif; tidak menetapkan ambang penguasaan atau menyimpulkan penyebab nilai TO.
- **Cakupan:** prioritas TO mengikuti filter grafik; periode drill tetap 28 September–4 Oktober 2026 dan ditulis di atas tabel. Perbandingan tidak menyatakan bahwa drill terjadi sesudah TO terakhir.
- **Materi:** pemetaan drill asli masih pada level subtes. Data sample per materi tetap terpisah dan tidak masuk ke sorotan drill asli. Ketiadaan pemetaan tidak ditafsirkan sebagai belum berlatih.

Untuk mengganti sample dengan pemetaan materi nyata, input minimal tetap memerlukan ID siswa, ID TO, tanggal/jenis TO, kode subtes, ID materi yang sama antara TO dan drill, jumlah benar/soal per materi, serta ID dan tanggal setiap sesi drill. Status kelengkapan sumber dan periode pengambilan wajib dicatat sebelum memberi label “Belum”.

Penyajian terbaru: semua delapan kode subtes ditampilkan dalam satu tabel dengan kolom Subtes, Masuk 3 terendah di TO, Soal drill, dan Akurasi. Urutan mengikuti frekuensi masuk tiga nilai terendah pada filter TO aktif, lalu rata-rata skor TO terendah; nama kode menjadi pemecah seri terakhir. Badge prioritas dan kolom sesi dihapus. Nilai — berarti data drill belum tersedia, bukan belum latihan. Sesi dan jumlah benar tetap tersimpan pada metadata sumber. Kode subtes yang nama panjangnya belum terverifikasi tetap memakai kode sumber.
