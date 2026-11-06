# Report Konsultasi — Panduan Pilot

Tanggal: 21 Oktober 2026  
Status: dokumen kerja; paket data siswa pertama sudah disusun, aplikasi pilot belum dibangun.

## 1. Tujuan dan keputusan

Menguji apakah report berbasis data siswa asli membantu SA menyiapkan konsultasi, menjelaskan kondisi siswa, dan mencatat tindak lanjut.

Keputusan dari diskusi:

- Tampilan report Garuda menjadi acuan aplikasi.
- CSV adalah opsi input yang diinginkan. Pengambilan manual dari Student Tower paling memungkinkan untuk tahap awal.
- Report akan diuji dengan data siswa asli.

Usulan pelaksanaan yang masih dapat disesuaikan:

- Selesaikan satu siswa dari pengambilan data sampai validasi report, lalu tambahkan siswa kedua untuk memeriksa pemakaian ulang template.
- Gunakan aplikasi dengan daftar siswa, halaman report, persiapan data, serta penyimpanan hasil konsultasi per siswa dan sesi.
- Setelah alur awal berhasil, perluas ke sekitar 5–8 siswa dengan kondisi berbeda. Jumlah ini usulan, bukan syarat pengujian.
- Guided Report dan Meeting Mode merupakan kandidat tampilan dari keluarga report Garuda. Mode yang masuk tes pertama belum diputuskan.

## 2. Acuan dan batas cakupan

- [Garuda — Guided Report](Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Guided%20Report.html)
- [Garuda — Meeting Mode](Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Meeting%20Mode.html)
- [Temuan learning call 20 Oktober](Learning%20Call%202026-10-20%20-%20Report%20Findings.md)
- [Peta sumber dan gap data](Student%20Tower%20-%20Source%20of%20Truth%20%26%20Data%20Gap%20Map.md)
- [Pemetaan field report Garuda](Report%20Konsultasi%20-%20Pemetaan%20Data%20Garuda.md)
- [Cara memakai paket data pertama](outputs/report-pilot-2026-10-21/README.md)
- [Audit validasi data Garuda](outputs/report-pilot-2026-10-21/Validasi%20Data%20Garuda.md)
- [Catatan revisi feedback dan nilai subtes](Report%20Konsultasi%20-%20Catatan%20Revisi.md)

Tampilan Garuda menjadi acuan struktur dan interaksi. Isi, teks konteks, angka, serta aturan analisis di dalamnya tetap perlu dicocokkan dengan sumber sebelum dipakai untuk tes nyata.

Fokus pilot: ringkasan kondisi, perkembangan tryout, subtes/materi, latihan terkait, konteks belajar, pilihan jurusan bila datanya tersedia, serta hasil konsultasi.

Integrasi API, pembaruan otomatis, dan penulisan hasil ke Student Tower belum termasuk usulan tahap pertama. Hasil pilot disimpan terpisah dari catatan resmi operasional.

## 3. Data yang dikumpulkan

Tabel ini adalah dasar penyusunan template input, bukan kontrak teknis final. Sumber dan akses aktual perlu dikonfirmasi saat mengambil siswa pertama.

| Bagian | Data minimum | Sumber awal yang diperiksa | Jika belum tersedia |
|---|---|---|---|
| Konteks report | ID/alias siswa, kelas, periode, waktu pengambilan, checkpoint bila ada | Student Tower | Identitas penghubung dan periode harus dilengkapi sebelum report siap diuji |
| Tryout | ID/nama event, tanggal, jenis, skor total dan subtes | Tab Tryout atau rapor sumber | Tampilkan kekurangan; jangan membuat tren tanpa riwayat yang cukup |
| Materi | Subtes, ID/nama materi, event, jumlah benar dan total soal | Rapor analisis materi, jika tersedia | Analisis berhenti pada tingkat subtes |
| Drill | Tanggal, subtes, ID/nama materi jika ada, benar dan total soal, periode cakupan | Drill Soal | Jangan menyimpulkan belum latihan hanya karena rincian tidak tersedia |
| Pilihan | Kampus, prodi, jenjang, urutan, jalur, tanggal pembaruan | Consultation/Profiling dan tampilan pilihan | Tandai belum tersedia atau perlu konfirmasi |
| Pembanding | Jenis metrik, nilai, event/periode, populasi, jumlah peserta, ranking bila ada | Modul simulasi/leaderboard yang dapat diakses | Tampilkan pilihan tanpa klaim posisi kompetitif |
| Konteks belajar | Kehadiran, catatan pengajar/SA, kebiasaan dan preferensi; tanggal dan asal tiap catatan | Student Tower, Profiling, atau catatan konsultasi | Ubah menjadi pertanyaan untuk konsultasi |
| Sesi sebelumnya | Tanggal, kesepakatan, tindakan, PIC, tenggat, status | Riwayat konsultasi atau catatan terkonfirmasi | Tampilkan belum ada riwayat |

Untuk setiap pengambilan, isi catatan berikut:

| Kolom | Isi |
|---|---|
| ID/alias siswa | ... |
| Pengambil data | ... |
| Diambil pada | Tanggal dan jam WIB |
| Halaman/tab sumber | ... |
| Filter aktif | Periode, tahun ajaran, event, atau filter lain |
| Cakupan data | Bagian yang berhasil diambil dan yang belum |
| Rujukan sumber | Lokasi bukti atau tautan dengan akses yang sesuai |
| Pemeriksa dan tanggal | ... |
| Koreksi yang diperlukan | ... |

Data siswa asli dan bukti pengambilan disimpan di lokasi berakses terbatas, terpisah dari fixture sintetis dan repository publik. Gunakan alias untuk label tes bila identitas lengkap tidak diperlukan.

## 4. Aturan data dan perhitungan

- Bedakan angka sumber, hasil perhitungan, observasi SA, dan interpretasi. Catat dasar setiap ringkasan.
- Data kosong berarti belum tersedia; jangan mengubahnya menjadi nol atau menggantinya dengan angka simulasi.
- Tanggal pembaruan profil, periode drill, dan rentang tryout dapat berbeda. Tampilkan cakupannya sesuai sumber masing-masing.
- Tren dan median mengikuti jumlah event valid yang tersedia; tidak mengasumsikan selalu ada empat tryout. Nyatakan event yang dipakai dan jangan menggabungkan jenis tryout tanpa dasar kesetaraan yang jelas.
- Hubungan materi–drill memerlukan pemetaan ID/nama yang diperiksa serta urutan waktu yang jelas. Kesamaan subtes saja belum membuktikan materi yang sama telah dilatih.
- Median siswa dan median populasi pembanding harus berlabel berbeda. Ranking harus menyebutkan populasi serta event/periode yang sesuai.
- Ambang materi lemah, target skor, pembobotan subtes, dan status pilihan memerlukan sumber aturan dan validasi akademik. Angka contoh di HTML bukan kebijakan yang telah disahkan.
- Benchmark dan selisih skor tidak otomatis menjadi peluang diterima atau jaminan aman. Ikuti keterbatasan pembanding yang tercatat pada sumber dan temuan riset.
- Catatan konsultasi harus terhubung ke ID siswa dan ID sesi. Pisahkan dari dataset snapshot agar koreksi data tidak menghapus hasil sesi.

## 5. Langkah kerja

| Langkah | Pelaksana | Hasil yang diharapkan |
|---|---|---|
| 1. Tetapkan mode tes pertama dari report Garuda | Pengelola pilot | Acuan tampilan dan bagian yang diuji |
| 2. Pilih siswa pertama yang dikenal SA | Pengelola + SA | Kasus dan periode pengambilan yang jelas |
| 3. Susun template berdasarkan kebutuhan report | Pengelola + pembuat aplikasi | Format input dengan sumber, periode, dan kolom kosong yang jelas |
| 4. Ambil data manual dan catat waktu pengerjaan | Pengambil data | Paket snapshot serta rujukan sumber |
| 5. Bangun aplikasi yang membaca dataset | Pembuat aplikasi | Daftar siswa, report dinamis, input data, penyimpanan dan ekspor hasil sesi |
| 6. Cocokkan report pertama dengan sumber | Pengambil data + SA | Angka dan teks diperiksa; koreksi serta keterbatasan tercatat |
| 7. Masukkan siswa kedua | Pengelola + pembuat aplikasi | Report dapat dipakai ulang tanpa menyunting HTML per siswa |
| 8. Jalankan tes, analisis masalah, dan revisi | Fasilitator + SA | Temuan penggunaan dan prioritas perbaikan |

Sebuah report ditandai siap diuji setelah identitas penghubung dan periode benar, data yang ditampilkan sudah diperiksa, bagian kosong dinyatakan, serta catatan dapat disimpan dan dibuka kembali untuk siswa/sesi yang tepat. Report tetap bisa diuji dengan data terbatas selama tugas tes disesuaikan dengan cakupan tersebut.

## 6. Panduan tes singkat

Gunakan kasus yang dikenal SA. Untuk menilai waktu persiapan, bandingkan dengan alur kerja saat ini pada kasus sebanding dan catat urutan penggunaan; mengulang kasus yang sama bisa membuat percobaan kedua lebih cepat karena sudah dikenal.

Minta SA melakukan tugas berikut tanpa terlebih dahulu ditunjukkan letak jawabannya:

1. Menentukan agenda konsultasi dan menjelaskan dasar pemilihannya.
2. Menjelaskan perkembangan, kekuatan, dan prioritas belajar.
3. Memeriksa pelaksanaan saran sebelumnya jika riwayatnya tersedia.
4. Meninjau pilihan jurusan jika data pilihan dan pembanding tersedia.
5. Mencatat kesepakatan, hal yang belum selesai, dan tindak lanjut; menyimpan lalu membuka kembali hasilnya.

Catat waktu persiapan, kebutuhan membuka sumber lain beserta alasannya, bagian yang salah dipahami, koreksi data, bantuan fasilitator, dan apakah hasil sesi berhasil tersimpan. Pisahkan masalah data, tampilan, dan aturan analisis.

Template catatan pengujian:

| Sesi / alias siswa / versi report | Tugas | Waktu | Pengamatan atau ucapan SA | Sumber lain yang dibuka | Jenis masalah | Tindak lanjut |
|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | Data / tampilan / aturan analisis / lainnya | ... |

Pilot dianggap menghasilkan bukti yang berguna jika kita dapat menilai ketepatan isi, pemahaman SA, beban penyiapan data, dan kegunaan hasil konsultasi. Target penghematan waktu belum ditetapkan; kumpulkan baseline terlebih dahulu.

## 7. Hasil tahap awal — 21 Oktober 2026

Garuda sudah ditemukan pada Student Tower yang diberikan. Paket pengumpulan tersimpan lokal pada `outputs/report-pilot-2026-10-21/`, terpisah dari fixture sintetis dan diabaikan Git. Workbook delapan sheet, delapan CSV, serta snapshot JSON memuat 4 event tryout, 31 sesi drill, 2 pilihan SNBT, catatan/Profiling, 4 kehadiran, dan 10 rujukan sumber. Materi dan hasil sesi belum berisi record.

Periode aktivitas: 28 September–4 Oktober 2026. Tabel tryout menampilkan 23 Agustus–8 Oktober, termasuk reguler dan premium. Pengambilan ini belum mencatat durasi pengerjaan dan tidak dapat digunakan sebagai baseline waktu penyiapan data.

Pemeriksaan teknis jumlah record, ID rujukan, tanggal, dan perhitungan drill sudah dilakukan. Selisih sumber tetap terbuka: ringkasan drill 61/138, detail 63/158; pilihan Farmasi bertentangan dengan target Teknik Mesin pada catatan SA. Rincian materi pada HTML diketahui sintetis dan tidak dimasukkan ke paket nyata. Pemeriksaan bersama SA belum selesai.

Revisi tampilan pertama sudah diterapkan pada kedua mode Garuda: petunjuk umum enam section, matriks nilai seluruh subtes mengikuti referensi screenshot Mbak Nana, filter jenis TO yang menyelaraskan grafik/tabel, arahan diskusi menurut hasil, dan bantuan menggali kendala subtes. Skor TO pada HTML sudah mengikuti snapshot sumber; rincian materi asli masih kosong. Atas permintaan contoh, panel materi kini menyediakan simulasi yang terpisah dari angka asli; atas permintaan pengguna, label simulasi di tampilan dihapus dan statusnya tetap dicatat pada metadata/dokumentasi; datasetnya ada pada `samples/report-materials-demo.json`. Pembaruan 22 Oktober menambahkan gambaran report dengan bahasa yang lebih jelas, panel skor terakhir, default semua TO, grafik responsif dengan garis putus-putus antarjenis, serta penyelarasan ringkasan drill dan catatan konteks dengan snapshot. Selisih drill dan konflik target tetap ditampilkan; detail pembanding pilihan belum diselaraskan menyeluruh. Simulasi pilihan, importer, dan penyimpanan per sesi belum dibuat. Rincian cakupan dan verifikasi ada pada catatan revisi.

## 8. Hal yang masih terbuka

- Mode Garuda untuk tes pertama: Guided Report, Meeting Mode, atau keduanya.
- SA peserta tes dan pemeriksa paket pertama. Siswa serta periode awal sudah ditetapkan pada paket Garuda.
- Sumber analisis materi, penjelasan agregat drill, target siswa terkini, serta kelengkapan riwayat hasil konsultasi.
- Format input pertama: tabel terstruktur yang diimpor atau formulir dalam aplikasi. CSV tetap menjadi opsi yang diinginkan.
- Aturan akademik yang disetujui untuk analisis dan ringkasan.
- Lokasi penyimpanan dataset/hasil sesi serta cara SA mengakses aplikasi saat tes.

Langkah terdekat: periksa paket Garuda bersama SA, tentukan cakupan tes berdasarkan data yang tersedia, lalu hubungkan dataset terpisah ke tampilan Garuda. Penyimpanan dan ekspor hasil sesi perlu dibuat dan diuji sebelum tes penggunaan.


## 9. Review aturan wording SA

Matriks wording dan simulator tersedia pada `Report Konsultasi - Matriks Wording Tryout.md` serta `Simulasi Wording SA - Tryout.html`. Gunakan untuk meninjau 15 pola utama dan lapisan kondisi sebelum tes SA. Semua jenis TO dibaca sebagai satu rangkaian; jenis menjadi pendalaman. Ambang besar perubahan/jeda/kebaruan belum ditetapkan dan nonaktif pada report. Katalog 12.960 kombinasi contoh tersedia lokal pada `outputs/tryout-wording-2026-10-22/`; ini bucket review, bukan daftar semua angka skor yang mungkin.
