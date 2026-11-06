# Audit copy report konsultasi Garuda

Tanggal: 22 Oktober 2026. Status: temuan dan usulan; audit ini belum mengubah copy prototype.

## Penilaian

Report sudah bisa dipindai, tetapi belum cukup konsisten untuk dibaca SA yang pertama kali menggunakannya tanpa penjelasan pendamping. Masalah terpenting adalah cakupan angka yang berubah saat filter dipilih, pertanyaan yang menjanjikan informasi melebihi data tersedia, dan istilah pembanding pada pilihan jurusan.

Ini adalah penilaian editorial berdasarkan teks, perilaku filter dan sumber data, bukan hasil tes pemahaman SA. Tidak ada skor keterbacaan atau klaim bahwa pembaca sudah memahami report.

| Bagian | Penilaian | Alasan utama |
|---|---|---|
| Ringkasan kondisi | Perlu perbaikan konteks | Label hasil terakhir dan headline belum menyebut bahwa hasilnya mengikuti filter. |
| Nilai tryout | Cukup jelas; perlu definisi | Pola dan selisih konkret. Nilai tengah belum dijelaskan dan sebagian pertanyaan mengandaikan sebab. |
| Nilai per subtes dan materi | Perlu penyederhanaan | Istilah teknis, simbol, dan dua metode urutan membutuhkan penjelasan yang lebih sederhana. |
| Drill terkait | Perlu perbaikan utama | Judul mengesankan ketepatan materi dapat dinilai; tabel yang tersedia masih tingkat subtes. |
| Belajar di kelas | Paling jelas | Statistik, ringkasan beratribusi, dan bukti asli sudah terpisah dengan baik. Label kelengkapan catatan masih bisa diperjelas. |
| Pilihan jurusan dan popout | Perlu perbaikan utama | Ada beberapa jenis pembanding, estimasi posisi dari sumber berbeda, dan metadata waktu yang belum terverifikasi. |
| Meeting Mode | Perlu penyelarasan kecil | Judul langkah Konteks belajar belum mengikuti judul Aktivitas belajar di kelas. |

## Cakupan pemeriksaan

Diperiksa: keenam section utama, panduan SA, navigasi, label grafik dan tabel, legend, dropdown, disclosure, popout kelas, popout pilihan UGM/UI, sumber dan cara hitung, teks kosong, serta template pertanyaan tren TO. Copy kedua mode dibandingkan dari file; alur browser diperiksa pada Guided Report.

Keadaan browser yang diperiksa: Semua TO, Reguler, Premium; pilihan nilai tryout terakhir dan nilai tengah empat tryout. Filter dikembalikan ke Semua TO dan acuan ke nilai terakhir setelah pemeriksaan. Skenario tanpa data diperiksa melalui source/template, bukan dengan mengganti data siswa di browser.

Bagian tindak lanjut, kontrol simulasi pilihan, dan pemicu modal materi yang disembunyikan tidak dianggap bagian dari alur aktif. Teksnya tidak menjadi prioritas revisi untuk tes tampilan saat ini. Seluruh pola pertanyaan tren dibaca dari `report-logic/tryout-wording.js`; tidak semua kemungkinan kombinasi parameter dijalankan melalui UI.

Prioritas: **P1** berpotensi mengubah pemahaman atas angka/hasil; **P2** menambah beban baca atau mengaburkan tindakan/konteks; **P3** perapian konsistensi.

## Ringkasan kondisi

| ID | Prioritas | Copy sekarang / pemicu | Potensi kebingungan | Usulan |
|---|---|---|---|---|
| A01 | P1 | “Nilai tryout terakhir”; filter Premium | Menampilkan 576 pada 9 Sep, padahal nilai terakhir dari semua jenis adalah 546 pada 8 Okt. Tanggal sudah ada, tetapi label masih terdengar global. | Saat filter aktif: “Nilai tryout Premium terakhir”. Semua TO: “Nilai tryout terakhir”. Terapkan juga pada label statistik grafik. |
| A02 | P2 | “Baru satu hasil tryout Garuda yang tersedia.” saat Premium | Bisa dipahami hanya ada satu hasil di seluruh report. Headline tren pada filter lain juga terdengar berlaku untuk seluruh riwayat. | “Baru satu hasil tryout Premium yang tersedia.” Untuk tren terfilter, sebut jenisnya atau beri konteks “Dalam TO yang ditampilkan”. |
| A03 | P2 | “Latihan mandiri”, “soal latihan”; bagian tujuan bernama “Drill terkait” | Pembaca perlu menebak apakah latihan dan drill adalah aktivitas yang sama. | Pakai “Drill soal” secara konsisten untuk aktivitas tersebut. Misalnya “Garuda mengerjakan 58 soal drill pada 3 subtes.” Jangan mengubah kutipan asli sumber. |
| A04 | P3 | “Dari gambaran ini, apa yang paling ingin kamu bahas?” | “Gambaran ini” kurang konkret jika panduan dibaca terpisah. | “Dari nilai tryout, drill soal, kegiatan kelas, dan pilihan jurusan ini, bagian mana yang ingin kamu bahas lebih dulu?” Jika terlalu panjang, cukup “Bagian report mana yang ingin kamu bahas lebih dulu?” |

A01 diverifikasi langsung: filter Premium menghasilkan skor 576, label tetap Nilai tryout terakhir, dan tanggal 9 September 2026. Ini masalah cakupan label, bukan kesalahan perhitungan angka.

## Nilai tryout dan pertanyaan SA

| ID | Prioritas | Copy sekarang | Potensi kebingungan | Usulan |
|---|---|---|---|---|
| B01 | P2 | “Nilai tengah” berdampingan dengan “Rata-rata” | Keduanya mudah dianggap sama. Nilai tengah berarti median, bukan titik tengah antara skor tertinggi dan terendah. | Pertahankan label singkat. Tambahkan bantuan: “Nilai tengah didapat setelah semua nilai diurutkan. Jika jumlahnya genap, gunakan rata-rata dua nilai di tengah.” Contoh sumber/penjelasan: 546, 561, 576, 601 → 568,5. |
| B02 | P2 | “Nilai”, “Skor total”, “Perkembangan skor tryout”, “TO terakhir” | Kata nilai bisa berarti nilai total atau nilai subtes. Saat subtes dipilih, label statistik tidak menunjukkan apa yang sedang dibaca. | Gunakan “Nilai total” dan “Nilai subtes”. Label dropdown “Tampilkan nilai”. Konteks aktif tetap terlihat, misalnya “Penalaran Umum · 4 tryout”. |
| B03 | P2 | “Apa yang membuat nilaimu terus turun?” | Pertanyaan mengarahkan siswa untuk mencari penyebab sebelum pengalaman digali. Varian naik juga bisa mengandaikan strategi tertentu berhasil. | “Apa yang berbeda dalam persiapan atau saat mengerjakan beberapa tryout terakhir? Bagian mana yang terasa lebih sulit?” Terapkan pola netral pada semua template: tanyakan perbedaan sebelum menyimpulkan sebab. |
| B04 | P3 | “Titik terisi”, “titik kosong”, “seri”, “sumbu skor menyesuaikan rentang nilai” | Terlalu banyak istilah grafik dalam satu catatan. | Catatan utama: “Titik berwarna menunjukkan TO terakhir. Garis abu-abu menunjukkan nilai tengah.” Arti bentuk titik dan skala grafik masuk bantuan yang bisa dibuka. Informasi skala tetap tersedia karena memengaruhi pembacaan perubahan. |

Pertanyaan B03 adalah pembuka diskusi, bukan klaim bahwa penyebab penurunan sudah diketahui. Audit menyarankan netralitas bahasa, bukan meniadakan pembahasan kendala belajar. Jenis Reguler/Premium tetap boleh dibahas sebagai pertanyaan pengalaman, sesuai keputusan menyatukan tren semua TO.

## Nilai per subtes dan materi

| ID | Prioritas | Copy sekarang | Potensi kebingungan | Usulan |
|---|---|---|---|---|
| C01 | P2 | “frekuensi sorotan”, “tabel sorotan” | Pembaca harus menerjemahkan istilah tampilan menjadi arti akademiknya. | “Seberapa sering subtes masuk tiga nilai terendah.” Untuk urutan: “Baris teratas adalah subtes yang paling sering masuk tiga nilai terendah.” |
| C02 | P2 | “Δ skor” | Simbol delta tidak selalu dipahami. | “Perubahan nilai”, dengan bantuan “Nilai terakhir dikurangi nilai pertama dalam TO yang ditampilkan.” |
| C03 | P2 | “Fokus materi: PU, LBI-S, LBIN.” | Isinya kode subtes, bukan nama materi. | “Subtes yang dibahas: PU, LBI-S, LBIN.” Nama materi tetap ada di tabel materi. Jangan menebak kepanjangan kode yang belum terverifikasi. |
| C04 | P2 | “Periode data: 23 Agu–15 Okt 2026” | Rentang ini menggabungkan tanggal riwayat nilai dan tanggal rincian materi; bisa dianggap satu kelompok TO yang sama. Pada Premium, rentangnya 9 Sep–15 Okt meskipun hanya satu skor Premium dipakai. | Tetap satu interval sesuai keputusan tampilan. Ganti label menjadi “Rentang data yang digunakan”. Rincian cakupan tiap sumber tetap di disclosure; jangan menambah beberapa interval ke tampilan utama. |
| C05 | P2 | Tabel subtes diurutkan menurut frekuensi nilai rendah; tabel materi menurut rata-rata nilai terendah | Dua daftar dapat memiliki urutan berbeda, tetapi judul yang mirip membuatnya seolah satu peringkat. | Pertahankan penjelasan materi: “3 subtes dengan rata-rata nilai terendah”. Pada bantuan tabel subtes jelaskan urutan menurut frekuensi. Hindari menyebut keduanya satu “peringkat subtes terlemah”. |
| C06 | P3 | “Benar di TO”, “3 / 16 (18,8%)” | Dapat dibaca, tetapi basis persentase belum disebut dekat kolom. | Label “Jawaban benar di TO”; bantuan “Benar / jumlah soal (persentase benar)”. Jangan menambah label berulang dalam setiap sel. |

Rincian materi saat ini masih memakai fixture tampilan dan bukan rincian materi asli Garuda. Ini tercatat di disclosure dan fixture. Sesuai keputusan sebelumnya, audit tidak mengusulkan menambah badge data contoh di tampilan utama. Sebelum tes data asli, penggantian fixture merupakan pekerjaan data tersendiri; mengganti copy tidak membuat angka menjadi data asli.

## Drill terkait

| ID | Prioritas | Copy sekarang / kondisi | Potensi kebingungan | Usulan |
|---|---|---|---|---|
| D01 | P1 | “Drill soalnya sudah tepat ke materi yang lemah?” | Judul menjanjikan jawaban tentang kesesuaian materi. Tabel aktual hanya punya subtes, jumlah soal dan persentase benar; pemetaan materi belum tersedia. | “Bagaimana hasil drill soalnya?” Panduan: “Lihat jumlah soal dan persentase benar per subtes. Bahas contoh soal bersama siswa untuk mengetahui materi yang perlu dilatih.” |
| D02 | P1 | “Sudah di-drill? Belum”; tidak ada record topik | Belum tercatat dan belum dikerjakan adalah dua keadaan berbeda. Fungsi saat ini mengembalikan Belum ketika key topik tidak ditemukan. | Pakai “Belum dikerjakan” hanya jika sumber eksplisit menyatakan belum. Untuk record yang tidak tersedia: “Belum tercatat”. Ini perlu perubahan status data/logic, bukan penggantian kata secara menyeluruh. |
| D03 | P2 | “—” pada jumlah soal/akurasi | Bisa dianggap nol atau siswa belum mengerjakan sama sekali. | Keterangan singkat dekat tabel: “— = data drill belum tercatat untuk subtes ini.” Jika sumber hanya tidak lengkap, hindari memastikan belum mengerjakan. |
| D04 | P2 | “Akurasi” | Kurang langsung dibanding bahasa jawaban benar. | “Benar (%)” atau “Persentase benar”. Pilih satu istilah yang dipakai konsisten pada drill dan tabel materi. |
| D05 | P2 | “TO: 1 · premium · Drill: 28 Sep–4 Okt 2026” saat filter Premium | Bisa dianggap hasil drill ikut disaring menjadi drill Premium. Sebenarnya filter mengubah TO dan urutan subtes, sementara hasil drill memakai periode tetap. | “Urutan subtes berdasarkan 1 TO Premium. Hasil drill: 28 Sep–4 Okt 2026.” Untuk tampilan semua TO: gunakan bentuk yang sama dengan jumlah aktif. |

## Belajar di kelas dan popout

| ID | Prioritas | Copy sekarang | Potensi kebingungan | Usulan |
|---|---|---|---|---|
| E01 | P2 | “Catatan pengajar 2/4 sesi” | Bisa dianggap skor/rating atau hanya ada dua pengajar. | “Sesi dengan catatan 2/4”. Kehadiran tetap “Kehadiran 4/4 sesi”. Bantuan/popout menjelaskan penyebutnya adalah sesi yang tercatat pada periode ini. |
| E02 | P3 | Ringkasan pengajar satu kalimat panjang dengan empat pengamatan | Akurat dan beratribusi, tetapi agak padat untuk dipindai. | Pecah: “Pada sesi PPU (1 Okt) dan Biologi (28 Sep), pengajar mencatat antusiasme tinggi dan keaktifan bertanya. Pengajar juga mencatat pemahaman materi sangat baik serta pengerjaan tugas secara mandiri.” Pertahankan ID bukti pada kedua kalimat jika diimplementasikan. |
| E03 | P3 | Bahasa sumber “Ananda”, “Dari penguasaan materi…” | Lebih formal daripada narasi report. | Pertahankan teks asli di popout. Jangan menyunting kutipan hanya demi menyamakan gaya bahasa report. Narasi ringkasan boleh memakai bahasa sederhana dan tetap beratribusi. |

Copy “2 dari 4 sesi belum memiliki catatan pengajar”, “Belum ada catatan”, “Lihat detail kelas”, dan “Catatan asli” sudah cukup jelas. Tidak perlu menggantinya hanya untuk menghasilkan revisi tambahan.

## Pilihan jurusan dan popout

| ID | Prioritas | Copy sekarang / kondisi | Potensi kebingungan | Usulan |
|---|---|---|---|---|
| F01 | P1 | “SNBT · 2026” dan “Pilihan siswa … diperbarui 8 Okt 2026” | Tahun seleksi dan waktu perubahan pilihan tidak terbukti oleh field snapshot pilihan. 8 Okt tercatat sebagai tanggal TO acuan, bukan bukti pilihan diubah pada tanggal itu. | Jangan menebak tahun atau tanggal pembaruan. Jika belum diverifikasi, cukup “Pilihan SNBT · data Student Tower”. Sebut “Nilai tryout acuan: 8 Okt 2026” hanya untuk tanggal nilainya. Verifikasi sumber sebelum menampilkan tahun seleksi. |
| F02 | P1 | “Perkiraan peringkat 10 dari 41” bersebelahan dengan nilai tertinggi leaderboard | Mudah dianggap posisi pada screenshot leaderboard yang sama atau perkiraan peluang lolos. Angka dihitung dari persentil Student Tower dan tetap saat baseline berubah. | Label “Estimasi posisi di Student Tower”. Keterangan: “Dihitung dari persentil dan jumlah pemilih yang tercatat; bukan urutan resmi atau peluang diterima.” Di popout jelaskan bahwa data posisinya tidak dihitung ulang dari nilai yang dipilih. Jangan mengubah angka dalam pekerjaan copy. |
| F03 | P1 | “Acuan nilai Ruangguru” | Belum menjelaskan jenis acuan, tahun, atau cara penentuannya. Nama lembaga saja dapat terasa seperti batas penerimaan yang telah terverifikasi. | Pertahankan nama umum yang tidak mengada-ada: “Acuan nilai Ruangguru”. Di bantuan pada titik baca: “Angka pembanding dari data Ruangguru yang tersimpan. Tahun dan dasar penetapannya belum tercatat.” Jangan menamainya nilai minimum, passing grade atau peluang lolos tanpa sumber yang mendukung. |
| F04 | P2 | Disclosure “dikurangi target 713 untuk UGM atau 718 untuk UI”; footer “target nilai minimum” | Kata target terdengar seperti nilai wajib. Padahal angka utama adalah nilai tertinggi peserta dan sumber acuan lain berbeda. | “Dikurangi nilai tertinggi peserta: 713 untuk UGM atau 718 untuk UI.” Untuk metrik lain tetap gunakan nama konsisten “acuan nilai Ruangguru”. |
| F05 | P2 | Kartu subtes: “Garuda / Pembanding / Selisih” | Ringkas, tetapi pembandingnya dapat dianggap nilai minimum masuk atau nilai tertinggi tiap subtes. | Kartu: “Garuda / Peserta acuan / Selisih”. Penjelasan di atas: “Peserta acuan adalah peserta dengan nilai total tertinggi pada daftar nilai jurusan dan kampus ini.” Pertahankan informasi bahwa ini bukan maksimum setiap kolom. |
| F06 | P2 | Alternatif: “Di atas acuan +1,6” | Subjek tidak eksplisit; dapat dibaca bahwa nilai kampus berada di atas nilai Garuda. | Label angka “Selisih nilai”; kalimat bersama: “Selisih = nilai Garuda − acuan kampus.” Warna dan tanda tetap. Tidak perlu kalimat panjang dalam setiap kartu. |
| F07 | P2 | “Nilai di atas acuan belum menunjukkan peluang diterima.” | Bisa dibaca seolah nilai positif tidak punya arti atau berarti peluangnya buruk. | “Selisih positif bukan jaminan diterima. Bahas juga minat, biaya, lokasi, dan jenjang S1/D3.” Jangan memberi estimasi peluang dari selisih ini. |
| F08 | P2 | “catatan SA aktif”, “tanggal catatan aktif” | Aktif bisa berarti terbaru, valid, atau status sistem. Sumber adalah kolom Catatan Kakak Asuh tanpa tanggal yang terlihat. | “Catatan Kakak Asuh menyebut Teknik Mesin UI/UGM; tanggal catatan belum tersedia.” Jangan menambahkan terbaru atau aktif sebagai makna kronologis. |
| F09 | P2 | “Mana pilihanmu saat ini: Farmasi atau Teknik Mesin?” | Membatasi siswa pada dua pilihan yang tersimpan. Pilihannya mungkin sudah berubah. | “Apa pilihan jurusan dan kampusmu saat ini? Apakah Farmasi atau Teknik Mesin masih menjadi pilihan?” |
| F10 | P3 | “Konteks benchmark dan cara membahas”, “persentil”, “repository”, “event” | Campuran istilah teknis yang tidak diperlukan pada titik baca utama. | “Tentang nilai pembanding”; “daftar acuan”; “tryout” untuk event yang memang TO. Pertahankan rumus persentil hanya di rincian sumber, dengan penjelasan posisi perkiraan. |

F01 adalah keterbatasan bukti, bukan pernyataan bahwa tahun atau tanggal itu pasti salah. Snapshot `tables.Pilihan` menunjuk `TO-LOCAL-004` dan tidak memiliki field tanggal pembaruan pilihan. Karena itu copy tidak boleh mengubah tanggal TO menjadi tanggal pilihan diperbarui tanpa verifikasi tambahan.

F03 juga tidak diselesaikan dengan mencari istilah yang terdengar lebih meyakinkan. Jika definisi acuan belum ditemukan, tulis keterbatasannya dalam bantuan yang ringkas dan pertahankan sumber lengkap di popout. Instruksi sebelumnya untuk tidak menampilkan istilah weight score tetap dipertahankan.

## Navigasi, footer, dan Meeting Mode

| ID | Prioritas | Copy sekarang | Potensi kebingungan | Usulan |
|---|---|---|---|---|
| G01 | P2 | Footer panjang memuat angka target lama 694/686 dan rincian teknis | Setelah membaca tabel utama, pembaca menemukan angka lain dan istilah lama tanpa struktur yang cepat dipahami. | Kelompokkan sebagai “Sumber nilai siswa”, “Sumber pembanding”, “Data yang belum lengkap”. Angka lama cukup pada provenance atau rincian teknis khusus jika tidak dipakai dalam report aktif. |
| G02 | P3 | Langkah Meeting Mode “Konteks belajar”; judul section “Aktivitas belajar di kelas” | Nama langkah tampak merujuk cakupan yang lebih luas dari isi sekarang. | Samakan nama langkah menjadi “Belajar di kelas”. Selaraskan pula langkah drill setelah D01 diubah. |
| G03 | P3 | Tombol “Selesai”; toast “Alur konsultasi selesai.” | Dapat dianggap konsultasi atau pencatatan sudah disimpan, padahal tombol hanya mengakhiri peninjauan langkah. | “Selesai meninjau”; toast “Semua bagian report sudah ditinjau.” Jangan menjanjikan penyimpanan atau keputusan konsultasi. |

## Standar kata untuk revisi berikutnya

| Konsep | Pilihan kata | Hindari |
|---|---|---|
| Tes | “tryout”; “TO” setelah disebut pertama | Pergantian istilah tanpa penjelasan. |
| Nilai keseluruhan | Nilai total | “Nilai” tanpa konteks saat subtes juga tersedia. |
| Aktivitas drill | Drill soal | Latihan mandiri/latihan/drill bergantian untuk aktivitas yang sama. |
| Hasil pengerjaan | Persentase benar | Akurasi jika pembaca belum terbiasa. |
| Selisih riwayat | Perubahan nilai | Simbol delta sebagai satu-satunya label. |
| Pembanding leaderboard | Nilai tertinggi peserta | Target atau nilai minimum. |
| Pembanding dari daftar Ruangguru | Acuan nilai Ruangguru | Passing grade atau syarat lolos tanpa verifikasi. |
| Informasi kosong | Belum tercatat / belum tersedia | Belum dikerjakan jika sumber tidak memastikan itu. |
| Pengamatan pengajar | “Pengajar mencatat…” + sesi/mapel | Sifat umum atau kebiasaan siswa dari satu/dua sesi. |
| Cakupan filter | “Dalam TO yang ditampilkan” / jenis TO | Label global untuk hasil yang sudah difilter. |

Kode subtes mengikuti sumber sampai pemetaannya terverifikasi. Jangan menebak kepanjangan LBIN, LBI-A atau LBI-S demi membuat copy terlihat lengkap. Gunakan bantuan kode yang dapat dibuka dan jelaskan jika namanya belum tercatat.

## Urutan revisi yang disarankan

1. Perbaiki cakupan nilai terakhir/headline ketika filter aktif (A01–A02).
2. Sesuaikan janji judul drill dengan data yang tersedia; bedakan belum tercatat dari belum dikerjakan (D01–D02).
3. Rapikan arti estimasi posisi, dua jenis acuan, serta metadata tahun/tanggal pilihan (F01–F04).
4. Sederhanakan istilah nilai tengah, frekuensi sorotan, delta, akurasi, dan pembanding (B01–B02, C01–C03, D04, F05).
5. Selaraskan navigasi, sumber dan copy penutup, lalu uji pemahaman singkat dengan SA.

## Pertanyaan tes pemahaman SA

Minta SA menjawab berdasarkan tampilan, tanpa penjelasan fasilitator terlebih dahulu:

- Setelah filter Premium dipilih, apakah 576 adalah nilai terakhir semua TO atau khusus Premium?
- Apa beda nilai tengah dan rata-rata?
- Apakah tanda — berarti siswa belum mengerjakan drill?
- Apakah tabel drill ini sudah membuktikan kesesuaian materi latihan?
- Apakah 10 dari 41 adalah urutan resmi pada screenshot pembanding?
- Apakah angka 718 adalah syarat resmi diterima Farmasi UI?
- Apakah selisih positif pada kampus alternatif menjamin diterima?
- Dua dari empat sesi memiliki catatan: apakah dua sesi lain berarti siswa pasif?

Catat istilah yang harus dijelaskan ulang dan bagian report yang dipakai SA untuk menjawab. Audit editorial ini belum menggantikan tes tersebut.

## Audit lanjutan: efisiensi wording

Tujuan: mengurangi pengulangan pada tampilan utama agar SA lebih cepat menemukan kondisi siswa dan bahan diskusi. Usulan ini belum diterapkan ke prototype. Panduan statis per section tetap dipertahankan sesuai kebutuhan sebelumnya; cukup satu arahan yang spesifik dan tidak mengulang pertanyaan di bawahnya.

### Wording yang dapat dihapus

| Lokasi | Copy yang ditinjau | Keputusan dan alasan |
|---|---|---|
| Ringkasan | Subjudul “Riwayat nilai dan konteks siswa” dan eyebrow “Gambaran kondisi Garuda” | Hapus keduanya dari kartu/heading yang sudah berada dalam Ringkasan kondisi. Nama siswa sudah ada di header. |
| Ringkasan nilai | “Urutan nilainya adalah 601, 576, 561 dan 546. Nilai tengahnya 568,5.” | Hapus dari ringkasan awal. Grafik dan statistik section Nilai tryout sudah menampilkan riwayat dan nilai tengah. Nilai terbaru serta selisih awal–akhir dan perubahan terakhir tetap terlihat dalam bentuk singkat. |
| Ringkasan subtes | “Perbandingan ini memakai nilai antarsubtes Garuda dalam setiap tryout.” | Hapus dari kartu ringkasan jika kalimat utama sudah berbunyi “PU masuk tiga nilai terendah pada 3 dari 4 TO.” Penjelasan metode tersedia pada section subtes. |
| Ringkasan drill | “Terdiri dari 30 soal … 18 soal … dan 10 soal …” | Hapus rincian per subtes dari ringkasan. Cukup jumlah total dan jumlah subtes. Rincian lengkap tersedia pada tabel drill. |
| Panduan tren | “Contoh pembuka obrolan; lanjutkan sesuai cerita siswa dan orang tua.” | Hapus. Kalimat ini bersifat umum dan tidak menambah temuan atau pertanyaan yang bisa dipakai SA. |
| Label pertanyaan tren | “Contoh pertanyaan untuk siswa”, “Contoh pertanyaan untuk orang tua” | Padatkan ke “Siswa” dan “Orang tua”. Heading pertanyaan sudah menjelaskan konteks. |
| Pendalaman materi | “Fokus materi: PU, LBI-S, LBIN.” | Hapus baris karena kode tersebut sudah ada dalam tabel tepat di atasnya. Jika diperlukan saat tabel tidak terlihat, gunakan label Subtes, bukan materi. |
| Legend tabel subtes | Uraian warna dan urutan baris yang diulang pada paragraf legend, disclosure, dan source note | Simpan satu penjelasan inti di dekat tabel; hapus salinan yang identik. Warna tetap memiliki legend tiga tingkat. |
| Pilihan jurusan | Disclosure “Konteks benchmark dan cara membahas” berisi ulang 546, 568,5, 713, 718 dan rumus selisih | Hapus disclosure duplikat setelah informasi yang diperlukan sudah tersedia pada tabel, legend, dan sumber popout. Jangan menghapus data sumber/provenance. |
| Popout pilihan | Penjelasan minus/plus di bawah setiap blok yang mengulang legend dan rumus sumber | Tampilkan satu penjelasan selisih yang berlaku untuk kartu terkait; hapus pengulangan identik. Tanda angka dan warna tetap ada. |
| Footer | Angka target lama 694/686 yang tidak dipakai pada perbandingan aktif | Pindahkan ke provenance teknis. Hapus dari bacaan rutin SA agar tidak memperkenalkan pembanding keempat. |

### Wording yang dipadatkan atau dipindah

| Lokasi | Versi ringkas yang disarankan | Penempatan |
|---|---|---|
| Panduan Ringkasan | “Sepakati satu atau dua hal yang ingin dibahas siswa.” | Tetap satu kalimat di section. |
| Panduan Nilai tryout | “Bahas apa yang berbeda dalam persiapan dan pengerjaan antar-TO.” | Perilaku filter dijelaskan sekali dekat kontrol, tidak dicampur ke arahan konsultasi. |
| Panduan Subtes | “Bahas satu soal yang salah untuk menemukan bagian yang sulit.” | Arahan statis tetap ada. Pertanyaan pendalaman di bawah tabel cukup satu pertanyaan yang lebih spesifik; tidak mengulang kalimat ini. |
| Panduan Drill | “Bahas cara siswa mengerjakan dan mengulas soal yang salah.” | Jumlah soal dan persentase benar sudah dilabeli tabel. Jangan menjanjikan penilaian ketepatan materi tanpa datanya. |
| Panduan Kelas | “Baca ringkasan pengajar; buka detail untuk melihat catatan tiap sesi.” | Tetap satu kalimat. |
| Panduan Pilihan jurusan | “Konfirmasi pilihan terkini sebelum membahas perbandingan nilai dan alternatif.” | Tetap satu kalimat. Konflik pilihan disebut sekali di catatan terdekat. |
| Legenda grafik | “Titik berwarna = TO terakhir. Garis abu-abu = nilai tengah.” | Arti bentuk, skala, dan definisi median tersedia dalam bantuan. Jangan menghilangkan penjelasan skala sepenuhnya. |
| Aturan subtes | “Warna merah menandai tiga nilai terendah pada setiap TO.” | Tetap dekat tabel bersama tiga swatch. Ties, urutan baris, dan rumus perubahan ada di Cara membaca tabel. |
| Pengantar materi | “3 subtes dengan rata-rata terendah · 3 materi dengan persentase benar terendah per subtes.” | Tetap dekat tabel; diperlukan untuk membedakan metode prioritas materi dari urutan tabel subtes. |
| Keterangan sumber subtes | “Sumber: Student Tower · disalin 21 Okt 2026.” | Rincian kode, data kosong, ties, status verifikasi dan rumus masuk detail sumber; jangan menyalin metode dari legend. |
| Catatan pilihan berbeda | “Profiling mencatat Farmasi UGM/UI; Catatan Kakak Asuh menyebut Teknik Mesin UI/UGM. Konfirmasi pilihan terkini.” | Tetap dekat pilihan. Tanggal Profiling dan ketiadaan tanggal catatan masuk rincian sumber. |
| Popout perbandingan | Heading “Perbandingan nilai” | Menggantikan “Nilai Garuda dibandingkan dengan apa?”; kartu di bawah sudah memberi nama dua acuannya. |
| Penjelasan acuan | “Pembanding, bukan syarat resmi diterima.” | Satu kali dekat dua angka pembanding. Detail definisi dan sumber di disclosure. |
| Acuan subtes popout | “Pembanding: nilai subtes peserta dengan nilai total tertinggi.” | Tetap dekat kartu subtes karena asal pembanding menentukan interpretasi selisih. |
| Alternatif kampus | “Farmasi di kampus lain dengan acuan ≤ nilai Garuda.” | Jangan pakai versi ini untuk pembaca minim literasi simbol; pilih “Acuan kampus berikut tidak melebihi nilai Garuda.” Gunakan satu kalimat, bukan keduanya. |
| Catatan alternatif | “Selisih positif bukan jaminan diterima.” | Tetap dekat alternatif; penjelasan pertimbangan biaya/lokasi/jenjang bisa masuk panduan atau konteks pilihan, tidak perlu diulang pada tiap kartu. |

### Informasi yang tetap harus mudah ditemukan

- Nilai siswa, jenis/baseline nilai, tanggal atau periode, dan cakupan filter.
- Perubahan dari hasil sebelumnya dan perubahan awal–akhir; keduanya menjawab pertanyaan berbeda meskipun bisa ditulis lebih singkat.
- Arti pembanding dan selisih. Jangan memadatkan semua angka menjadi label umum “Target”.
- Arti data kosong, ketidakpastian sumber, dan perbedaan belum tercatat vs belum dikerjakan.
- Konflik pilihan Farmasi/Teknik Mesin yang masih perlu dikonfirmasi.
- Cakupan ringkasan kelas dan catatan asli. Keduanya sudah tepat berada di popout.
- Pertanyaan pendalaman yang benar-benar berbeda antarsection. Jangan menghapus seluruh pendalaman SA hanya karena ada panduan statis.

Prinsip penempatan: ringkasan awal berisi satu temuan singkat per aspek; section utama menampilkan bukti yang dibutuhkan untuk membahas aspek tersebut; popout/disclosure menyimpan rincian sumber dan cara hitung. Temuan boleh muncul kembali sebagai konteks, tetapi paragraf penjelasannya tidak perlu disalin utuh.

### Contoh ringkasan awal yang lebih padat

Contoh berikut hanya untuk keadaan Semua TO dan nilai terakhir saat ini; versi terfilter wajib menyesuaikan label dan angka.

- **Nilai tryout:** 546 · turun 15 poin dari TO sebelumnya; turun 55 poin sejak TO pertama.
- **Subtes:** PU masuk tiga nilai terendah pada 3 dari 4 TO.
- **Drill soal:** 58 soal pada 3 subtes.
- **Kelas:** Hadir 4/4 sesi; 2 sesi memiliki catatan pengajar.
- **Pilihan:** Farmasi UGM/UI; pilihan terkini perlu dikonfirmasi karena Catatan Kakak Asuh menyebut Teknik Mesin.

Angka pada contoh harus tetap berasal dari data dan mengikuti logika cakupan masing-masing. Audit ini tidak mengusulkan menyamakan periode kelas/drill dengan riwayat TO atau menerapkan filter TO pada data kelas.

Penghematan kata atau waktu baca belum diukur. Setelah revisi diterapkan, bandingkan pemahaman SA terhadap nilai, cakupan, dan tindakan berikutnya; tampilan yang lebih pendek belum tentu lebih mudah dipahami.


### Pelaksanaan pemangkasan

Pemangkasan wording telah diterapkan pada Guided Report dan Meeting Mode tanggal 22 Oktober 2026. Ringkasan, panduan, legend, sumber dan popout dipadatkan sesuai catatan revisi. Konteks filter diperjelas; data serta kutipan asli dipertahankan. Temuan audit sebelumnya yang memerlukan perubahan model status data (misalnya membedakan status drill topik yang tidak tercatat dari status eksplisit belum dikerjakan), verifikasi definisi acuan, dan pengujian pemahaman SA tetap merupakan pekerjaan tersendiri. Tidak ada perubahan klaim bahwa prototype telah terhubung ke AI.


### Penyesuaian setelah feedback ringkasan — 22 Oktober 2026

Rekomendasi ringkasan subtes dan drill di atas disesuaikan: tampilkan tiga subtes beserta frekuensi masing-masing, serta rincian singkat `58 soal: PU 30 + PPU 18 + PM 10.` agar total mudah diperiksa. Rincian ini menggantikan usulan jumlah total dan jumlah subtes saja. Total 58 diverifikasi terhadap 15 sesi UTBK & Ujian Mandiri di snapshot sumber. Pemeriksaan browser mencakup filter Semua TO, Reguler dan Premium; ketika hanya satu TO, ringkasan menampilkan tiga nilai terendah beserta angkanya tanpa klaim berulang. Hasil utama diverifikasi pada kedua mode.
