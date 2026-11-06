# Pengambilan ulang data Garuda — 22 Oktober 2026

Periode yang diminta: **13 Juli–26 November 2026**. Data dibaca dari tabel Student Tower melalui **browser Codex**, diambil pada **22 Oktober 2026**. Aktivitas terbaru yang ditemukan: drill **21 Oktober**, kelas dan interaksi orang tua **19 Oktober**. Periode ini belum lengkap hingga November karena tanggal akhirnya masih di masa depan.

| Cakupan | Hasil |
| --- | --- |
| Drill seluruh mata pelajaran | 114 baris sesi sumber |
| Drill UTBK & Ujian Mandiri | 19 sesi · 74 soal · 36 benar |
| Kelas | 44 sesi |
| Kehadiran | 35 hadir + 1 terlambat = 36 sesi; 6 sakit, 2 izin |
| Catatan pengajar terisi | 16 dari 44 sesi |
| Tryout | 4 · nilai total 601 → 576 → 561 → 546 |
| Interaksi orang tua | 1 · WhatsApp, 19 Oktober |

| Subtes drill UTBK | Sesi | Benar / soal | Benar (%) |
| --- | ---: | ---: | ---: |
| PU | 7 | 22 / 35 | 62,9% |
| PPU | 7 | 4 / 18 | 22,2% |
| PK | 1 | 2 / 5 | 40% |
| PB | 2 | 3 / 6 | 50% |
| PM | 2 | 5 / 10 | 50% |

Subtes lain tidak memiliki rincian drill yang ditemukan pada sumber untuk periode ini; report tetap menampilkan **—**. Angka 74 hanya drill UTBK & Ujian Mandiri, bukan seluruh soal dari 114 sesi lintas mata pelajaran.

## Metode dan jejak sumber

Student Tower membatasi interval filter maksimal 31 hari inklusif. Pengambilan dibagi menjadi lima interval tanpa tumpang tindih: 13 Jul–12 Agu, 13 Agu–12 Sep, 13 Sep–13 Okt, 14 Okt–13 Nov, dan 14–26 Nov 2026. Total 29 tangkapan panel menyimpan URL, teks, dan sel tabel yang tampil.

Semua halaman rincian drill diambil: 22 sesi / 2 halaman pada interval kedua, 77 sesi / 4 halaman pada interval ketiga, dan 15 sesi / 1 halaman pada interval keempat. Interval pertama dan terakhir tidak menampilkan rincian drill. Kehadiran, catatan siswa, dan interaksi orang tua diperiksa pada kelima interval.

Snapshot mingguan dapat mencakup tanggal di luar interval filter. Karena itu, total report dihitung dari rincian sesi bertanggal, bukan penjumlahan snapshot mingguan. Tab tryout, konsultasi/profiling, diagnostik, dan tindak lanjut tidak mengikuti filter tanggal; tanggal tiap record diperiksa terpisah. Keempat tryout masuk periode yang diminta. Diagnostik bertanggal 2025 tidak dipakai sebagai hasil periode ini.

Ada 37 baris Catatan Siswa: 36 catatan sesi (16 terisi, 20 kosong) dan 1 pengingat manual SA pada 5 Oktober. Delapan sesi tidak hadir tidak mempunyai baris catatan sesi. Jadi, dari 44 kelas, 28 belum memiliki catatan pengajar terisi. Catatan manual tidak dimasukkan ke ringkasan pengajar.

Ringkasan kelas memakai kutipan asli: 14 catatan dengan wording sama, 1 catatan Fisika 10 September, dan 1 catatan Dasar-Dasar Linguistik 7 September. Semua 16 rujukan dapat ditelusuri di popout. Ini ringkasan kurasi prototype dengan pemeriksaan kutipan; bukan pemanggilan AI langsung.

## Batas data yang dipertahankan

- Dua baris drill Biologi yang identik pada 18 Oktober pukul 22.43 tetap disimpan sebagai dua baris sumber. Tanpa ID sesi asli, duplikasi belum dapat dipastikan; total 114 mengikuti baris sumber.
- Belum ada aktivitas November yang tercatat saat pengambilan. Ini tidak menyatakan siswa tidak beraktivitas pada November.
- Rincian materi asli dan pemetaan drill per topik belum tersedia. Data materi prototype sebelumnya tetap dipertahankan; pengambilan ini tidak memvalidasinya sebagai hasil asli Garuda.
- Leaderboard dan acuan prodi memakai sumber sebelumnya, tidak diambil ulang. Profil dan preferensi sebelumnya juga tidak diberi tanggal pengambilan baru secara menyeluruh.
- Paket W40 pada `outputs/report-pilot-2026-10-21/` tetap dipertahankan.

## Berkas dan verifikasi

- `source-captures.json`: tabel/teks mentah dari browser beserta URL dan interval.
- `garuda-snapshot.json`: rincian terstruktur dan jejak sumber tiap baris.
- `drill-summary.json`: agregat drill yang ditanam di kedua report.
- `classroom-summary.json`: 44 sesi, catatan asli, dan rujukan ringkasan.
- `report-classroom.png`: bukti tampilan kelas setelah pembaruan.
- `verification.txt`: hasil pemeriksaan integritas data.

Generator: `scripts/build-garuda-refresh.py`. Penerapan: `scripts/update-garuda-report-period.py`. Pemeriksaan: `scripts/check-garuda-refresh.cjs`.

Pemeriksaan lulus untuk kedua mode: JavaScript valid, data tertanam sesuai JSON, seluruh nilai total/subtes keempat tryout cocok dengan sumber, dan 16 kutipan catatan cocok persis. Verifikasi browser mencakup ringkasan 74 soal, statistik 36/44 dan 16/44, 44 sesi di popout, serta filter reguler/semua tryout.
