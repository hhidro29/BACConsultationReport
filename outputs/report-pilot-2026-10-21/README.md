# Paket data pilot report konsultasi

Paket pertama: Garuda, alias `PILOT-001`, periode aktivitas W40 2026. Data disalin manual dari Student Tower pada 21 Oktober 2026; pemeriksaan SA belum selesai.

## File yang dipakai

- `Paket Data Pilot - Garuda.xlsx`: lembar pengumpulan dan pemeriksaan. Mulai dari sheet **Mulai**, periksa data pada enam sheet detail, dan telusuri rujukan di **Sumber**. Sheet Materi dan Sesi sengaja belum berisi record.
- `Validasi Data Garuda.md`: cakupan pengambilan, selisih terhadap prototype/sumber, serta daftar pemeriksaan SA.
- `garuda-snapshot.json`: snapshot terstruktur awal untuk pengembangan importer. Memuat metadata, cakupan, dua agregat drill yang belum cocok, keterbatasan, dan seluruh tabel sumber.
- `csv/`: satu tabel per file — paket, tryout, drill, pilihan, konteks, materi, sesi, sumber. UTF-8 dengan BOM, pemisah koma. Materi dan Sesi hanya memiliki header.

Workbook, CSV dan JSON merupakan keluaran dari record pengambilan yang sama. File-file ini **belum tersinkron otomatis**. Perubahan Excel harus disalin/diekspor ulang dan diperiksa sebelum dipakai oleh aplikasi. Kontrak importer belum final.

## Urutan pemakaian

1. Baca audit validasi dan cocokkan isi workbook dengan tautan pada sheet Sumber.
2. Catat koreksi dan penjelasan selisih, lalu isi pemeriksa SA serta status pada sheet Mulai.
3. Tentukan bagian yang layak untuk tes dari cakupan yang sudah diperiksa. Materi yang belum ada tetap diberi status belum tersedia.
4. Hubungkan paket yang diperiksa ke tampilan Garuda dan cocokkan angka/teks yang benar-benar muncul.
5. Simpan hasil konsultasi sebagai data sesi terpisah; tes simpan dan buka kembali sebelum pengujian pengguna.

Untuk siswa berikutnya, salin struktur workbook, ganti metadata dan seluruh record siswa, buat ID paket/sumber/event lokal yang sesuai, lalu ulangi pemeriksaan. Workbook saat ini berisi data Garuda, sehingga tidak boleh langsung diperlakukan sebagai template kosong.

Folder ini diabaikan Git. Ini pemisahan penyimpanan dari fixture sintetis, bukan pengaturan kontrol akses. Aplikasi report, importer CSV dan penyimpanan sesi belum dibangun dalam paket ini.
