# Validasi data pilot Garuda

Diambil melalui tampilan Student Tower pada 21 Oktober 2026. ID paket: `PILOT-001-W40`. Status: **disalin dari UI, menunggu pemeriksaan SA**. Dokumen ini mencatat pemeriksaan sumber dan konsistensi paket; belum menyatakan report atau aturan akademik siap diuji.

## Isi dan cakupan

| Bagian | Isi yang disimpan | Cakupan |
|---|---|---|
| Identitas | Garuda Mahawira Sena, `GARUDAI4LG3ZTNGA`, alias `PILOT-001` | Bekasi - Summarecon, 2026/2027 |
| Aktivitas | W40 | 28 September–4 Oktober 2026 |
| Tryout | 4 event, skor total dan 8 kolom subtes | 23 Agustus–8 Oktober 2026; 3 reguler dan 1 premium |
| Drill | 31 sesi dari dua halaman | W40, seluruh subject; kelas dan kurikulum dipertahankan |
| Kehadiran | 4 sesi, seluruhnya Hadir | W40 |
| Pilihan SNBT | Farmasi UGM dan Farmasi UI | Acuan TO Regular Eps. 3, 8 Oktober |
| Konteks | 13 catatan/konteks dan 4 baris kehadiran | Tanggal dan sumber masing-masing dipertahankan |
| Materi | 0 baris | Rapor analisis materi dan ID penghubung drill belum ditemukan |
| Hasil konsultasi | 0 baris | Disediakan sebagai input saat tes |

Register `Sumber` memuat 10 rujukan halaman/tab, filter, tanggal pengambilan, dan keterbatasan. Tanggal event mengikuti waktu yang tampil pada sumber. Profiling secara eksplisit menyebut WIB; zona waktu tab lain belum dikonfirmasi. Pengambilan hanya mencatat tanggal, belum memiliki log durasi atau jam pengambilan.

## Temuan yang memengaruhi report

| Temuan | Bukti sumber | Perlakuan pada pilot |
|---|---|---|
| Agregat drill berbeda | Ringkasan W40: 61 benar / 138 soal, akurasi 44%. Penjumlahan 31 baris detail: 63 / 158, sekitar 39,9% | Kedua nilai disimpan. Jangan menyajikan satu angka sebagai pengganti tanpa menjelaskan cakupan. Periksa dasar agregasi bersama SA/pemilik sumber |
| Target jurusan bertentangan | Pilihan dan Profiling: Farmasi UGM/UI. Catatan SA aktif: Teknik Mesin UI/UGM | Tampilkan sebagai pertanyaan konfirmasi; jangan menetapkan target final dari salah satu sumber secara otomatis |
| Periode tab berbeda | Filter aktivitas berakhir 4 Oktober, tabel tryout mencakup 8 Oktober | Tampilkan rentang tryout dan aktivitas secara terpisah |
| Jenis tryout bercampur | Event 9 September premium; tiga event lain reguler | Pertahankan jenis asli. Analisis gabungan memerlukan dasar kesetaraan |
| Riwayat subtes di HTML berbeda | Skor total cocok, beberapa skor subtes historis berbeda | Pakai matriks sumber dalam paket, bukan seri bawaan HTML |
| Materi dan pemetaan drill pada HTML sintetis | Komentar HTML menyebut alokasi per episode dan pemetaan drill sebagai synthetic fixtures | Materi tetap kosong. Jangan menilai latihan materi dari kesamaan subject saja |
| Drill mencakup beberapa konteks | SNBT, pelajaran sekolah, TKA, termasuk satu baris Kelas 6 | Pertahankan kelas/kurikulum/subject. Kejanggalan dibawa ke pemeriksaan, bukan dibuang atau dinormalisasi diam-diam |
| Pembanding bukan passing grade terverifikasi | Label sumber: Target skor. UGM 694, UI 686. Persentil siswa 76/75, acuan 96/95, pemilih 69/41 | Gunakan label sumber. Ranking resmi tidak tersedia; jangan hitung peluang diterima atau status aman |
| Populasi pembanding terbatas | Sumber memberi peringatan jumlah pemilih sedikit | Peringatan mengikuti pilihan; nilai tidak cukup untuk menyimpulkan keamanan |
| Profiling lebih lama daripada teks prototype | Sumber: 31 Agustus 2026 15.03 WIB. Kampus harapan orang tua kosong | Tanggal dan isian asli dipertahankan. Preferensi perlu dikonfirmasi ulang; jangan mengisi kampus orang tua dari HTML |
| Catatan pengajar berbeda dari teks prototype | PPU dan Biologi berisi catatan antusias/mandiri; Sejarah dan Matematika kosong | Simpan isi dan kekosongan sesuai sumber, tanpa membuat parafrasa baru dari HTML |
| Parent Engagement kosong pada konteks detail | Tidak ada data di tab tersebut pada konteks yang dibuka | Belum membuktikan semua interaksi orang tua tidak ada; tidak digunakan untuk kesimpulan umum |

## Pemeriksaan paket

- Jumlah record dan ID lokal unik diperiksa; ID event lokal tidak diklaim sebagai ID asli sistem.
- Setiap sesi drill memenuhi benar + salah + tidak dijawab = total; akurasi sumber cocok setelah pembulatan ke persen bulat.
- Jumlah detail 63/158 dipertahankan terpisah dari ringkasan sumber 61/138.
- Semua rujukan ID sumber tersedia; pilihan mengacu ke event TO lokal yang tersedia.
- Data kosong disimpan sebagai sel kosong / JSON `null` / kolom CSV kosong, bukan nol.
- CSV dan JSON dibentuk dari record yang sama dengan workbook. Tanggal/jam pada file tersimpan dibandingkan dengan record sumber.
- Workbook memiliki filter tabel, panel beku, pilihan status, dan kolom pemeriksa SA. Pemeriksaan visual mencakup delapan sheet.
- Paket bukan importer aplikasi. Menyunting workbook belum memperbarui CSV/JSON secara otomatis; ekspor ulang perlu dibuat pada tahap aplikasi.

## Pemeriksaan SA berikutnya

1. Cocokkan identitas, periode, 4 event TO dan skor subtes dengan sumber.
2. Jelaskan selisih agregat drill, konteks latihan Kelas 6, dan cakupan angka yang akan muncul pada report.
3. Konfirmasi target siswa terkini dan tanggal berlaku catatan SA.
4. Tentukan apakah tes awal cukup pada tingkat subtes, atau perlu sumber rapor materi tambahan.
5. Isi nama pemeriksa dan status pada sheet `Mulai`. Koreksi sumber/paket dengan alasan; jangan menandai selesai jika isu yang memengaruhi tugas tes masih terbuka.

Sesudah itu, hubungkan dataset ke template Garuda, cocokkan tampilan dengan sumber, lalu coba siswa kedua. Catatan sesi harus disimpan dengan ID siswa dan ID sesi terpisah dari snapshot.
