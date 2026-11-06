# Revisi prototype report — 23 Oktober 2026

Diterapkan pada Guided Report dan Meeting Mode. Snapshot Student Tower tetap memakai pengambilan 22 Oktober, bukan data baru tanggal 23 Oktober. Cadangan sebelum perubahan disimpan pada `outputs/report-revision-2026-10-23/`.

## Ringkasan

Drill menampilkan cakupan pada tiga subtes prioritas, jumlah soal, dan akurasi yang dihitung dari jumlah jawaban benar dibagi seluruh soal. Untuk Garuda: 1 dari 3 subtes prioritas tercakup (PU), 74 soal UTBK, 36 benar / 74 = 48,6%; pada PU 22 benar / 35 = 62,9%. LBI-S dan LBIN belum memiliki catatan drill sumber. Cakupan subtes tidak dianggap bukti kesesuaian topik materi.

Akurasi kurang jika **di bawah 75%**, tepat 75% sudah memenuhi ambang. Volume drill dinilai terhadap target soal untuk periode report hanya setelah target diisi. Default kosong; tidak ada klaim banyak/sedikit tanpa target. Pengaturan ini menghitung total drill UTBK, bukan target per subtes atau per minggu. Jika ada target operasional per minggu, target untuk periode data yang telah berjalan perlu ditetapkan dahulu.

Kehadiran menunjukkan 36 dari 44 sesi, termasuk 1 terlambat, 6 sakit dan 2 izin. Sesi terlambat disorot pada ringkasan, statistik kelas, dan baris tabel. Footnote periode di bawah ringkasan dihapus; periode dan tanggal pengambilan tetap tersedia pada header.

## Progres dan prioritas subtes

Pola grafik tetap memakai mesin wording sebelumnya. Lapisan posisi nilai ditambahkan untuk nilai terakhir dan nilai tengah. Batas diisi per seri nilai lewat Pengaturan indikator: di bawah batas berkembang = perlu penguatan; mulai batas berkembang sampai sebelum batas baik = berkembang; mulai batas baik = baik. Default belum ditetapkan, tidak menggunakan ambang buatan sebagai standar akademik. Input harus lengkap dan batas baik lebih tinggi. Nilai uji 500/650 sudah dikosongkan kembali setelah verifikasi.

Kolom tabel subtes memakai median/nilai tengah sesungguhnya. Urutan prioritas: frekuensi masuk tiga nilai terendah (termasuk seri di batas ketiga), median lebih rendah, nilai pada tryout terakhir dalam filter lebih rendah, lalu kode sebagai pemecah seri deterministik. Nilai kosong tidak menjadi nol. Prioritas materi menggunakan tiga subtes pertama dari urutan yang sama, bukan daftar terpisah berdasarkan rata-rata.

## Gabungan materi dan drill

Section 3 berisi riwayat nilai subtes. Section 4 berisi jumlah soal dan akurasi per subtes; tiga subtes prioritas memiliki rincian materi yang dibuka di dalam tabel. Masing-masing memuat tiga materi dengan persentase benar terendah. Tidak ada popout untuk rincian ini.

Hasil materi masih berasal dari data prototype sebelumnya. Pemetaan drill asli per materi belum tersedia. Karena itu, status drill materi kini “Belum ada data”, bukan menampilkan status latihan sintetis sebagai fakta. Jumlah/akurasi materi tidak dijumlahkan ke agregat drill asli. Cakupan sumber tersedia pada disclosure bagian ini. Data materi asli dapat menggantikan fixture tanpa mengubah susunan tampilan.

## Kelas

Statistik dan ringkasan pengajar diikuti tabel tanggal/waktu, mata pelajaran, pengajar, kehadiran, serta catatan asli. Enam sesi per halaman; 44 sesi tersedia dalam delapan halaman. Catatan tampil langsung dalam sel tabel. Popout dan tombol Lihat detail kelas dihapus. Rujukan ringkasan tetap tersedia; klik rujukan membuka halaman tabel yang berisi sesi tersebut dan memfokuskan barisnya.

## Sesi leaderboard dan riwayat peringkat

Pemilih sesi tersedia pada tabel pilihan dan detail pilihan, saling tersinkron. Sesi bernama memakai nilai total/subtes Garuda dari sesi itu. Nilai tengah tetap merupakan pilihan pembanding terpisah; menggantinya tidak menghitung ulang peringkat sesi. Riwayat menampilkan nilai Garuda, peringkat/jumlah peserta, dan nilai tertinggi untuk keempat sesi.

Peringkat memakai field langsung `rank` dan `participants`, bukan rumus persentil. Data lama 17/69 dan 10/41 berasal dari estimasi persentil, sehingga tidak dialihkan menjadi peringkat langsung. Riwayat langsung yang belum memiliki sumber ditampilkan —.

Screenshot leaderboard tersimpan memberi nilai tertinggi 713 (UGM) dan 718 (UI), tetapi nama/tanggal sesi belum diketahui. Keduanya dipertahankan pada opsi **Referensi tersimpan · sesi belum tercatat**, yang menjadi default agar sumber lama tidak diam-diam ditetapkan ke sesi terbaru. Memilih sesi bernama tanpa data tidak meminjam referensi dari sesi lain.

Untuk menguji alur dan mengisi data yang tersedia, detail pilihan menyediakan form Lengkapi data leaderboard sesi ini: peringkat, jumlah peserta, nilai tertinggi. Validasi memastikan peringkat bulat positif dan tidak melebihi jumlah peserta; nilai 0–1.000. Data disimpan lokal per ID sesi **dan** pilihan program/kampus. Nilai kosong menghapus angka pada record sesi itu, bukan mengubahnya menjadi nol. Form tidak memperbarui Student Tower atau mengirim data ke layanan lain. Pembaruan ini tidak mengambil ulang leaderboard.

## Pemeriksaan

- Pemeriksaan data kedua report tetap cocok dengan paket asli: 4 matriks tryout, 74 soal drill, 44 kelas, 16 kutipan asli.
- Uji aturan: median, tiga kunci pengurutan, akurasi tertimbang, batas 75%, target volume, batas kelompok skor, nilai kosong/nol, dan pemisahan referensi per sesi/pilihan.
- Browser Codex: ringkasan baru, rincian materi pada tiga prioritas, seluruh delapan halaman kelas (44 ID unik, 16 catatan, satu terlambat), pergantian sesi leaderboard, validasi indikator, dan konsistensi Meeting Mode. Nilai uji tidak dipertahankan.

Aturan baru berada pada `report-logic/report-insights.js` dan ditanam di kedua HTML agar tetap mandiri. Pemeriksaan: `scripts/check-report-insights.cjs` dan `scripts/check-garuda-refresh.cjs`. Bukti screenshot dan hasil pemeriksaan berada di `outputs/report-revision-2026-10-23/`.
