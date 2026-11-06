# Report konsultasi — catatan revisi

Diperbarui: 22 Oktober 2026. Acuan: feedback Mas Alvin dan screenshot tabel nilai subtes yang dirujuk sebagai draft Mbak Nana. Revisi ini diterapkan pada HTML Garuda Guided Report dan Meeting Mode. Aplikasi impor data dan penyimpanan sesi belum dibangun.

## Revisi pertama

| Feedback | Perubahan yang sudah diterapkan | Yang masih perlu dilakukan |
|---|---|---|
| Instruksi umum tiap section | Panduan SA singkat di enam bagian: ringkasan, tryout, subtes, drill, konteks, pilihan | Periksa kegunaan dan bahasanya bersama SA |
| Instruksi sesuai hasil TO | Pertanyaan dan arahan mengikuti kenaikan, penurunan, nilai awal–akhir sama, satu event, nilai belum lengkap, dan cakupan campuran | Tinjau isi bersama tim akademik; arahan dinamis di luar tryout/subtes belum diperluas |
| Penyelarasan nilai subtes | Tabel semua subtes dengan kolom TO, tanggal, jenis, rata-rata, perubahan, dan frekuensi masuk tiga terendah | Konfirmasi kesetaraan event dan makna lengkap kode subtes sumber. Screenshot menjadi referensi struktur, bukan sumber skor Garuda |
| Dukungan SA Knowledge | Bantuan terbuka/tutup “Panduan menggali kendala subtes”, diletakkan di bawah arahan subtes terpilih | Konten awal belum menjadi knowledge yang disahkan. Hubungkan referensi akademik yang ditinjau dan petakan kebutuhan bantuan pada drill, pilihan, serta penutup |
| Simulasi jurusan/universitas | Belum diterapkan pada revisi ini | Siapkan eksplorasi pilihan terpisah dari pilihan siswa, dengan sumber pembanding yang jelas |

## Perilaku tabel dan grafik

- Nilai total dan delapan subtes mengikuti snapshot Student Tower yang disalin 21 Oktober 2026. Record sudah dicocokkan secara teknis dengan paket data, tetapi pemeriksaan SA masih terbuka.
- Tampilan awal memakai semua empat TO. Filter reguler menampilkan tiga event dan premium satu event. Grafik menghubungkan skor menurut urutan TO; segmen lintas jenis memakai garis putus-putus dengan keterangan, tanpa menganggap kesulitan kedua jenis setara.
- Nomor TO mengikuti urutan seluruh riwayat sumber. Karena premium adalah TO 2, pilihan reguler menampilkan TO 1, TO 3, TO 4. Nama event asli tersedia pada judul kolom/titik, sehingga nomor tampilan tidak disamakan dengan nomor episode sumber.
- Tiga nilai terendah dihitung per event dari skor subtes yang tersedia. Skor yang sama dengan skor urutan ketiga ikut disorot; jumlah sorotan dapat lebih dari tiga. Skor kosong bukan nol. Jika kurang dari tiga nilai subtes tersedia, posisi terendah tidak ditentukan untuk event itu.
- Frekuensi memakai event yang memiliki skor subtes tersebut dan cukup nilai untuk menentukan posisi. Baris diurutkan menurut frekuensi terbanyak, kemudian rata-rata terendah.
- Rata-rata memakai nilai yang tersedia dalam pilihan event. Perubahan memakai skor event terakhir dikurangi event pertama yang dipilih; satu event atau nilai ujung yang kosong menghasilkan tanda belum tersedia.
- Klik nama subtes untuk mengganti pilihan grafik dan panduan pembahasan. Pilihan subtes pada grafik juga memperbarui panduan. Mengganti jenis TO memperbarui grafik, tabel, statistik, dan arahan.
- Pada data Garuda reguler: PU masuk tiga nilai terendah pada 3/3 TO, PK pada 2/3. Ini posisi relatif antarsubtes siswa, bukan diagnosis penyebab atau batas penerimaan.
- Rincian materi sintetis dihapus dari alur yang direvisi. Bagian materi dan dialog menyatakan rincian belum tersedia.
- Pada layar kecil, tabel dapat digeser dengan nama subtes tetap terlihat. Meeting Mode memakai perhitungan yang sama dan mendukung perpindahan langkah serta tautan ringkasan ke bagian yang dipilih.

## Verifikasi

Pemeriksaan otomatis mencakup sintaks kedua HTML, kecocokan seluruh skor subtes terhadap snapshot, filter jenis, frekuensi, rata-rata/median, perubahan, nilai kosong/nol, skor seri pada batas urutan ketiga, satu event, tanpa event, dan kesamaan logika kedua mode.

Pemeriksaan browser mencakup filter reguler/premium/semua, perubahan subtes, panduan naik/turun/tetap, bantuan yang dibuka, dialog status materi, navigasi Meeting Mode, serta tata letak desktop dan layar sempit. Pemeriksaan ini memvalidasi perilaku prototype; belum menggantikan tes penggunaan bersama SA.

## Revisi browser — 22 Oktober 2026

| Komentar | Perubahan |
|---|---|
| Tulisan “3 terendah” tidak perlu di dalam sel | Sel hanya menampilkan nilai dengan sorotan merah. Legenda dan kolom frekuensi tetap menjelaskan maknanya. |
| Grafik kurang rapi | Grafik responsif memakai lebar kartu, label skor/tanggal lebih jelas, serta tiga statistik ringkas di atasnya. Filter jenis TO tersedia langsung dan tersinkron dengan tabel. |
| Overview nilai perlu diperjelas | Panel skor menampilkan nilai terakhir, tanggal/jenis TO, selisih terhadap event sebelumnya, urutan skor, dan tautan ke grafik. Overview selalu memakai skor total meskipun grafik sedang menampilkan subtes. |
| Ringkasan belum mewakili report | Pada revisi awal, “Gambaran report” menghubungkan kondisi, bukti, dan arah konsultasi. Mencakup nilai, subtes, drill soal, cara belajar, serta target jurusan yang perlu dikonfirmasi; setiap temuan menuju rincian terkait. |

Ringkasan mengikuti pilihan jenis TO. Satu event tidak diberi klaim perkembangan; campuran jenis diberi keterangan. Perubahan garis grafik pada tindak lanjut dicatat di bawah. Bagian aktivitas mempertahankan periode sumbernya.

Untuk menjaga konsistensi ringkasan dengan rincian, bagian drill diperbarui menjadi 31 sesi sumber dan menampilkan selisih 61/138 pada ringkasan pekan terhadap 63/158 pada detail. Catatan pengajar dan kebiasaan mengikuti snapshot/Profiling, termasuk tanggal Profiling 31 Agustus. Konflik Farmasi UGM/UI terhadap Teknik Mesin UI/UGM ditampilkan untuk dikonfirmasi, bukan diputuskan oleh report.

Verifikasi tambahan mencakup perilaku overview reguler/premium/semua, skor total tetap pada overview ketika subtes grafik berubah, teks sel tanpa label berulang, geometri grafik pada lebar sempit/lebar, dan kesamaan logika kedua mode. Pemeriksaan browser mencakup layar 390 px tanpa luapan halaman, tampilan grafik, serta tautan ringkasan dan pengukuran grafik setelah langkah Meeting Mode dibuka.

## Tindak lanjut komentar browser — 22 Oktober 2026

- Default kedua mode menjadi **Semua TO**: empat event langsung muncul pada grafik, tabel, dan ringkasan.
- Keempat titik grafik dihubungkan secara kronologis. Segmen antara jenis TO yang berbeda berupa garis putus-putus; reguler ditandai lingkaran dan premium belah ketupat. Keterangan perbedaan jenis tetap tersedia di bawah grafik.
- Kartu “Arah konsultasi” dihapus dari ringkasan. Panel skor memakai lebar penuh; bantuan pembahasan tetap tersedia pada bagian masing-masing.
- Kalimat singkat “PU pada 3/3 TO” diganti penjelasan lengkap, misalnya “Dalam 3 dari 4 TO, Penalaran Umum (PU) masuk tiga nilai terendah Garuda.” Kalimat pendukung menjelaskan bahwa perbandingan dilakukan dengan subtes lain pada TO yang sama.
- Ringkasan drill diawali aktivitas siswa: 31 sesi pekan ini. Selisih sumber disampaikan dengan bahasa biasa, sementara kedua angka tetap tersedia pada bagian drill. Cara belajar dan pilihan jurusan juga ditulis ulang agar lebih mudah dipahami.

Pemeriksaan otomatis memastikan default empat event, empat titik/tiga segmen, dua segmen lintas jenis, satu event premium, tiga event reguler, label skor, serta kesamaan kedua mode. Browser diperiksa pada lebar 814 dan 390 px, termasuk grafik PU empat event dan grafik yang baru dibuka pada Meeting Mode.

## Tabel subtes lebih ringkas — 22 Oktober 2026

Tabel kedua mode dipadatkan: nama panjang dipindahkan ke keterangan “Arti kode & cara membaca tabel”, tinggi baris menjadi 37 px, header tanggal/jenis disingkat, dan kolom perubahan menjadi “Δ skor”. Nama lengkap tetap tersedia melalui label aksesibilitas, tooltip kode, dan keterangan yang dapat dibuka. Filter dan temuan teratas diringkas; legenda utama tetap terlihat dan penjelasan perhitungan tersedia pada keterangan tersebut.

Seluruh delapan kolom dengan empat TO muat dalam area tabel 724 px pada viewport 814 px; tinggi tabel sekitar 344 px. Pada mobile 390 px, hanya tabel yang bergeser horizontal, tanpa luapan halaman. Pemilihan subtes tetap memperbarui grafik dan panduan; perhitungan, angka, serta sorotan tidak berubah. Pemeriksaan otomatis kedua mode dan pemeriksaan browser pemilihan subtes/keterangan kode lolos.

## Contoh rincian materi — 22 Oktober 2026

Atas permintaan contoh untuk pengujian, kedua mode kini menampilkan panel “Materi yang perlu diperbaiki” setelah tabel subtes, sebelum panduan diskusi. Panel mengikuti kode subtes yang diklik. Data simulasi memuat 30 baris: tiga materi untuk PU, PPU, PB, PK, dan PM pada dua TO contoh. LBIN, LBI-A, dan LBI-S belum diberi contoh karena pemetaan kode belum dikonfirmasi.

Semua nama materi, jawaban, nama/tanggal TO pada panel adalah contoh, berlabel jelas dan memakai ID DEMO-001. Checkbox dapat mematikan contoh untuk memperlihatkan kondisi data asli yang belum tersedia. TO contoh memiliki pemilih tersendiri dan tidak mengikuti filter TO asli. Persentase dihitung dari benar/total, diurutkan terendah tanpa ambang penguasaan atau diagnosis. Contoh tidak memengaruhi nilai asli, ranking subtes, ringkasan, atau drill Garuda.

Dataset dan panduan field tersedia pada `samples/report-materials-demo.json` dan `samples/README-materi.md`; tautan unduh juga tersedia dalam panel. Dataset disalin ke HTML agar tetap mandiri. Belum ada importer atau penyimpanan materi. Pemeriksaan memastikan struktur/30 record, kecocokan salinan, batas benar/total, pergantian TO/subtes, kondisi kode tanpa contoh, toggle, serta kesamaan logika kedua mode. Browser diperiksa pada desktop dan mobile tanpa luapan halaman.

## Penyederhanaan tampilan materi — 22 Oktober 2026

Atas permintaan pengguna, label “Data contoh”, banner penjelasan simulasi, checkbox, tautan unduh, dan tombol tentang data dihapus dari panel materi pada kedua mode. Pemilih menjadi “Hasil TO” dengan tanggal, dan header tabel menjadi “Materi”. Data serta perhitungan tidak berubah. Status simulasi tetap tersimpan pada metadata dataset dan dokumentasi; rincian ini tetap perlu diganti sebelum dipakai sebagai hasil siswa asli. Pemeriksaan otomatis kedua HTML dan tampilan browser tanpa error telah dilakukan.

## Materi dalam ringkasan keseluruhan — 22 Oktober 2026

Panel materi tidak lagi mengikuti satu subtes yang diklik dan tidak memiliki pemilih tanggal. Panel mengambil tiga subtes dengan rata-rata skor terendah dari filter TO utama, lalu menampilkan tiga topik terendah per subtes dalam satu tabel berkelompok. Rata-rata dipilih sebagai definisi operasional “terjelek”, berbeda dari urutan matriks yang memakai frekuensi sorotan. Dasar ini dijelaskan pada panel.

Persentase topik = jumlah benar / jumlah soal seluruh record materi dengan ID topik yang sama. Jumlah soal menjadi bobotnya, bukan rata-rata sederhana persentase tiap event. Nilai kosong/tidak valid tidak diubah menjadi nol; rincian yang belum tersedia diberi keterangan. Jika ada skor subtes seri, kode dipakai untuk urutan yang konsisten sehingga maksimal tiga subtes tampil.

Fixture diperluas menjadi 64 record untuk delapan kode subtes, masing-masing empat topik pada dua TO; tiga topik terendah ditampilkan. Topik pada kode yang belum terpetakan tetap ilustrasi. Metadata simulasi dipertahankan sesuai dokumentasi, tanpa label di UI sesuai permintaan pengguna. Belum ada pemetaan event materi ke event asli.

Pemeriksaan mencakup tiga pilihan subtes pada filter semua/reguler/premium, agregasi berbobot, pengecualian topik keempat yang lebih tinggi, record kosong/tidak valid, panel tetap keseluruhan saat subtes diklik, kesamaan kedua mode, dan tampilan desktop/mobile.

## Semua TO sebagai satu tren awal — 22 Oktober 2026

Keputusan pengguna: reguler dan premium diperlakukan sebagai satu rangkaian perkembangan untuk versi awal. Jenis TO tetap dicatat dan dibedakan pada penanda grafik, tetapi tidak menggantikan temuan tren atau menghalangi perhitungan perubahan terakhir. Filter jenis tetap opsional.

Pertanyaan utama “Yang perlu digali SA” mengikuti perubahan skor pada TO yang dipilih. Ketika reguler dan premium sama-sama tampil, pertanyaan tambahan menanyakan apakah perbedaan soal, persiapan, atau pengalaman pengerjaan berkaitan dengan perubahan nilai. Perbedaan jenis menjadi bahan konfirmasi, bukan kesimpulan penyebab. Panduan tingkat subtes juga mengikuti arah skor tanpa meminta pemisahan jenis terlebih dahulu.

Pada Garuda semua TO: 601 → 576 → 561 → 546, selisih awal–akhir −55, perubahan terakhir −15. Pemeriksaan kedua mode memastikan cabang naik/turun/nilai awal–akhir sama/satu event, pertanyaan jenis hanya untuk riwayat campuran, sintaks/perhitungan, dan tidak ada error browser.

## Matriks dan generator wording SA — 22 Oktober 2026

Permintaan pengguna untuk mencakup seluruh kemungkinan parameter diwujudkan dalam 15 pola utama, lapisan kondisi data/jenis/besar perubahan/waktu, serta simulator. Mesin aturan terpisah ada pada `report-logic/tryout-wording.js` dan salinannya tertanam dalam kedua HTML mandiri. “Yang perlu digali SA” kini menghasilkan temuan, pertanyaan siswa, pertanyaan orang tua, tindak lanjut, dan pendalaman tambahan bila relevan. Wording membaca seluruh urutan perubahan, bukan sekadar skor awal–akhir.

Garuda semua TO dikenali sebagai turun tiga kali berturut-turut, total −55 dan perubahan terakhir −15. Nilai awal dan akhir yang sama tetapi riwayat berfluktuasi tidak disebut stabil; pembalikan terakhir tidak disebut konsisten. Nilai kosong tidak menjadi nol, dan delta terakhir tidak dihitung dari dua hasil lama bila event terakhir/sebelumnya kosong.

`Report Konsultasi - Matriks Wording Tryout.md` memuat definisi, prioritas aturan, dan seluruh template dasar. `Simulasi Wording SA - Tryout.html` memungkinkan penggantian skor dan parameter. Generator `scripts/build-tryout-wording.mjs` menghasilkan 12.960 kombinasi bucket kondisi beserta input/parameter/output di `outputs/tryout-wording-2026-10-22/semua-kombinasi-wording.jsonl`, dan menguji 3.280 urutan tanda perubahan. Kombinasi tersebut mencakup bucket yang didefinisikan, bukan semua angka skor atau panjang riwayat yang mungkin.

Default report: toleransi 0; ambang perubahan besar, jeda panjang, dan hasil lama nonaktif. Nilai ambang pada katalog hanyalah contoh untuk review. Pemeriksaan pola, batas, nilai kosong, tanggal, salinan mesin, logika kedua mode, serta browser simulator dan report lolos. Review wording dan aturan akademik bersama SA masih perlu dilakukan.

## Batas revisi dan kelanjutan

Nilai TO, ringkasan drill, dan catatan konteks sudah diselaraskan dengan snapshot yang tersedia. Pemeriksaan SA belum selesai. Selisih drill 61/138 terhadap 63/158 serta konflik target Farmasi/Teknik Mesin masih terbuka. Label/metode pembanding, skor berbobot, dan estimasi peringkat pada detail pilihan masih berupa bagian draft yang perlu diselaraskan. Jangan menyatakan seluruh report sudah tervalidasi hanya karena matriks nilai dan ringkasan sudah diperbarui.

Langkah berikut: tinjau gambaran report dan bantuan bersama SA, selaraskan detail pilihan dengan sumber, lalu bangun simulasi pilihan serta alur impor/sesi sesuai cakupan tes yang dipilih. Penyelarasan draft Nana terbatas pada screenshot yang diberikan; bagian draft lain belum ditinjau.


## Penerapan audit fungsi section — 22 Oktober 2026

Diterapkan pada Guided Report dan Meeting Mode Garuda:

- Ringkasan membuka agenda bersama siswa/keluarga; label tren memakai generator pola yang sama dengan grafik. Ringkasan drill dihitung dari agregat UTBK/UM yang sama dengan section 04: 58 soal pada PPU, PM, dan PU, bukan 31 sesi dari seluruh kategori.
- Section 02 memperjelas perannya sebagai pembahasan pengalaman di balik pola perkembangan, dengan filter yang tetap tersambung ke subtes dan urutan drill.
- Section 03 menjelaskan perbedaan urutan matriks berdasarkan frekuensi sorotan dan pemilihan materi berdasarkan rata-rata skor. Panduan utama mencakup seluruh fokus materi; pembahasan subtes terpilih berada pada disclosure tersendiri dan terbuka saat kode subtes diklik. Evidence detail memakai generator pola TO. Pertanyaan lanjutan membedakan materi belum dilatih, akurasi masih rendah, dan perbedaan hasil drill/TO.
- Section 04 menggali pemilihan latihan, review kesalahan, dan percobaan soal serupa tanpa bantuan. Pertanyaan orang tua berfokus pada dukungan latihan; pendalaman rutinitas ditempatkan pada section 05.
- Section 05 mengonfirmasi apakah hambatan Profiling masih berlaku sebelum menyusun dukungan keluarga.
- Section 06 menambahkan penggalian pilihan terkini dan pertimbangan keluarga. Label skor pada detail mengikuti skor terakhir/median/simulasi; skor subtes mengikuti acuan terakhir/median dan pada skenario tetap jelas berasal dari TO terakhir. Peringkat tetap merupakan acuan leaderboard pada prototype dan tidak dihitung ulang dari median/simulasi.
- Passing grade skenario memakai nilai repository pilihan yang sama dengan mode data, sehingga tidak lagi tertukar dengan nilai tengah leaderboard. Alternatif dibatasi pada program yang sama dan perlu dicocokkan dengan minat, biaya, dan lokasi.
- Ambang passing grade subtes statis yang belum terverifikasi tidak lagi dirender. Kartu menjadi “Subtes untuk dibahas” dengan skor siswa; angka sumber lama tetap berada dalam metadata pilihan, bukan dijadikan dasar klaim pengaruh atau peluang.

Struktur enam section dipertahankan. Pencatatan hasil sesi masih tersembunyi dan pengubahan pilihan penuh belum diaktifkan. Rincian materi/drill per materi tetap sample; audit ini tidak memvalidasi sumber akademik, rumus peringkat, atau definisi benchmark. Tampilan panduan section 03 dan isi ringkasan telah dilihat pada browser; tidak menjalankan suite tes.


## Penyederhanaan panduan SA — 22 Oktober 2026

- Pada kedua prototype Garuda, panduan perkembangan TO hanya menampilkan bukti pola, pertanyaan siswa, dan pertanyaan orang tua. Tambahan pertanyaan jenis TO dan arahan tindak lanjut tidak lagi ditumpuk pada panel. Catatan kekurangan data tetap mengikuti bukti jika ada.
- Pertanyaan penurunan konsisten berfokus pada alasan penurunan yang berulang dan upaya setelah TO sebelumnya, tanpa mengasumsikan soal semakin sulit. Sumber `report-logic/tryout-wording.js` diselaraskan.
- Dua disclosure “Bahas [subtes] lebih lanjut” dan “Pertanyaan lanjutan sesuai temuan” di section 03 dihapus beserta referensi render/event-nya. Panduan utama materi tetap ada. Klik kode subtes tetap memilih seri grafik, sesuai petunjuk yang diperbarui.
- Tidak menjalankan generator/build matriks wording karena skrip tersebut sekaligus menjalankan suite tes.


## Revamp section 05 — 22 Oktober 2026

Diterapkan pada Guided Report dan Meeting Mode Garuda. Section 05 kini memisahkan:

1. Kesimpulan dari pengamatan kelas: hadir 4/4 sesi dan catatan positif pengajar PPU/Biologi tentang antusiasme, keaktifan bertanya, serta pengerjaan tugas mandiri.
2. Hasil drill yang perlu ditelusuri: PPU 4/18 benar (22,2%), dihitung dari `drillSnapshot` yang sama dengan section 04, ditempatkan berdampingan dengan pengamatan pengajar PPU. Angka ini membuka penggalian pengalaman dan tidak menyimpulkan ketidakmandirian atau penyebab kesalahan.
3. Pertanyaan SA yang terpisah bagi siswa dan orang tua: pengalaman mengerjakan drill dibanding tugas kelas, hambatan menjalankan rencana belajar, respons saat menemui kesulitan di rumah, dan kebutuhan dukungan.

Informasi Profiling 31 Agustus tentang penundaan belajar hanya muncul sebagai konteks pertanyaan siswa, bukan kesimpulan kondisi terkini. Kehadiran tidak lagi diberi label kebiasaan belajar. Catatan pengajar yang kosong tidak dimasukkan sebagai kekurangan siswa; akses catatan asli dan Profiling tetap tersedia melalui tombol detail. Tidak menambahkan klaim bahwa sesi drill dikerjakan tanpa bantuan. Fokus section 04 tetap kesesuaian latihan dengan subtes yang perlu diperbaiki; section 05 membahas perilaku dan dukungan belajar.


## Ringkasan mengikuti temuan terkini — 22 Oktober 2026

Pada kedua prototype Garuda, Gambaran report diperbarui tanpa mengubah susunannya:

- Judul merangkum pola TO dan kode subtes yang paling sering disorot, tanpa mengulang angka awal/akhir yang sudah ada dalam panel skor.
- Baris subtes menampilkan frekuensi tertinggi serta kelompok berikutnya, mengikuti filter dan perhitungan matriks.
- Baris drill menampilkan total 58 soal serta distribusi PU 30, PPU 18, PM 10 dan akurasi masing-masing 63,3%, 22,2%, 50%. Semuanya diturunkan dari agregat section 04; tidak menyatakan pemetaan materi atau kondisi belajar mandiri.
- Baris cara belajar hanya merangkum kehadiran 4/4 dan catatan positif PPU/Biologi yang dibahas di section 05. Pernyataan Profiling lama tidak digunakan sebagai kesimpulan kondisi terkini.
- Baris pilihan membedakan pilihan Farmasi yang tercatat dari catatan SA tentang Teknik Mesin; konfirmasi tetap diperlukan.
- Footnote memperjelas cakupan drill UTBK/UM dan periode pengamatan kelas.


## Ringkasan dalam kalimat tanpa singkatan — 22 Oktober 2026

Gambaran report pada kedua prototype menjadi “Gambaran kondisi Garuda”. Nama subtes dan universitas ditulis lengkap; tryout menggantikan TO, latihan mandiri menggantikan drill dalam ringkasan, dan panduan konsultasi menggantikan label SA. Judul pola, urutan nilai, perubahan skor, frekuensi nilai rendah, sebaran latihan, pengamatan pengajar, dan konflik pilihan ditulis sebagai kalimat.

Ringkasan latihan menonjolkan total 58 soal, porsi terbanyak pada Penalaran Umum (30 soal), dan hasil Pengetahuan dan Pemahaman Umum (4 dari 18 soal benar). Rincian subtes lainnya tetap tersedia pada bagian detail. Kode subtes yang belum memiliki nama terkonfirmasi tidak ditebak perluasannya. Angka, sumber, cakupan dan perhitungan tetap sama; ringkasan tidak menambahkan penilaian kemampuan atau penyebab masalah.


## Dropdown jenis TO — 22 Oktober 2026

Dropdown pada Guided Report dan Meeting Mode diberi tinggi konsisten 36 px, ruang teks dan panah yang cukup, chevron seragam, serta keadaan hover/fokus yang lebih jelas. Kontrol tetap memakai select native agar navigasi keyboard dan menu pilihan perangkat tersedia. Lebar kontrol grafik dirapikan; pada layar kecil label dan dropdown tersusun dalam dua baris.

Diverifikasi pada lebar 814 px dan 390 px tanpa overflow halaman. Pilihan Premium/Reguler/Semua TO tetap menyinkronkan filter grafik dan tabel; default tetap Semua TO. Filter Premium juga diperiksa pada Meeting Mode.


## Kolom frekuensi nilai rendah — 22 Oktober 2026

Kolom “3 terendah” beserta angka frekuensinya dihapus dari tabel subtes pada Guided Report dan Meeting Mode. Referensi kolom pada petunjuk tabel ikut dihapus. Highlight merah dan perhitungan untuk pengurutan subtes tetap dipertahankan.


## Rincian 58 soal di ringkasan — 22 Oktober 2026

Total 58 soal cocok dengan 15 sesi UTBK & Ujian Mandiri pada snapshot sumber: Penalaran Umum 30 soal (19 benar), Pengetahuan dan Pemahaman Umum 18 soal (4 benar), serta Penalaran Matematika 10 soal (5 benar). Ringkasan sebelumnya hanya menyebut dua subtes sehingga pembaca tidak dapat merekonsiliasi totalnya. Pada kedua mode report, deskripsi kini menyebut seluruh subtes beserta jumlah soalnya, dihasilkan dari agregat yang sama dengan total. Hasil benar untuk subtes dengan akurasi terendah tetap disertakan.


## Cakupan TO pada rincian materi — 22 Oktober 2026

Keterangan di atas tabel membedakan TO dasar pemilihan subtes (mengikuti filter, default 4 TO Garuda pada 23 Agustus–8 Oktober 2026) dan TO asal rincian materi (dua event fixture pada 1 dan 15 Oktober 2026). Cakupan serta daftar nama/tanggal TO diturunkan dari record yang digunakan, bukan mengasumsikan rincian materi berasal dari seluruh TO Garuda. Daftar TO dapat dibuka melalui disclosure. Petunjuk perhitungan memperjelas bahwa benar/total dijumlahkan, kemudian persentase dihitung dari hasil gabungannya. Label sample tampilan yang sudah ada dipertahankan.


## Identitas TO dan pembuka obrolan — 22 Oktober 2026

Label grafik dan header tabel subtes pada kedua mode memakai jenis dan nomor episode dari nama TO sumber: Reguler 1, Premium 2, Reguler 2, Reguler 3. Nomor episode bukan nomor urutan gabungan. Tanggal tetap tampil; nama lengkap tersedia pada tooltip grafik/tabel.

Pertanyaan pola naik-turun dengan hasil akhir lebih tinggi diganti menjadi bahasa percakapan yang membandingkan pengalaman saat nilai naik dan turun, lalu menggali cara yang ingin dicoba lagi. Panel diberi keterangan sebagai contoh pembuka obrolan yang perlu dilanjutkan sesuai cerita siswa/orang tua. Sumber wording, salinan report, simulator, matriks dan keluaran kombinasi diselaraskan tanpa mengubah aturan klasifikasi tren.


## Istilah target nilai — 22 Oktober 2026

Header selisih menjadi “Selisih dari target nilai” dan kolom pembanding menjadi “Target nilai”. Petunjuk menjelaskan rumus nilai siswa yang dipilih dikurangi target. Istilah passing grade pada modal dan eksplorasi alternatif diganti menjadi “Target nilai minimum”. Angka dan perhitungan tetap sama.

Pemeriksaan ulang UI Student Tower pada 22 Oktober menampilkan label “Skor Tryout terakhir / Target skor” dengan 546/694 untuk Farmasi UGM. Snapshot sumber mencatat 686 untuk UI. Definisi rata-rata/median tidak ditampilkan di drawer yang diperiksa; penjelasan lama yang menyebut median tidak dipertahankan sebagai fakta terverifikasi. Acuan target nilai minimum dari repository Ruangguru tetap dipisahkan dari target nilai Student Tower dan tidak disebut batas resmi penerimaan. Perubahan diterapkan pada kedua mode report.


## Pembanding nilai tertinggi leaderboard — 22 Oktober 2026

Menindaklanjuti klarifikasi feedback, acuan pilihan menggunakan nilai tertinggi leaderboard per prodi dan universitas; median hanya untuk agregasi riwayat nilai siswa. Target tertinggi tetap sama ketika nilai siswa diganti antara terakhir/median. Angka 694/686 di Student Tower berlabel Target skor dan belum terverifikasi sebagai nilai tertinggi; dipertahankan sebagai data sumber terpisah, tidak digunakan sebagai fallback. Field leaderboardHighestScore untuk kedua pilihan masih null; tabel dan detail menampilkan belum tersedia, selisih tidak dihitung dari nol atau dari target sumber sebelumnya. Klaim lama nilai tertinggi 780 dihapus karena tidak didukung snapshot sumber. Nilai tertinggi dan selisih akan tampil bila field terverifikasi dilengkapi. Diterapkan pada kedua mode.


## Konfirmasi baris tertinggi UGM — 22 Oktober 2026

Pengguna memberikan screenshot leaderboard Farmasi UGM dan mengonfirmasi baris paling atas adalah yang tertinggi: Weighted Score 713. Angka ini kini ditampilkan sebagai target UGM pada kedua mode report, disertai metrik dan sumber screenshot. Nama lengkap event masih belum terbaca. Nilai tertinggi UI tetap belum tersedia.

Skor total Garuda 546 (atau median 568,5) belum terverifikasi sebanding dengan weighted score. Perhitungan selisih, progress perbandingan, dan seleksi alternatif berbasis weighted score ditahan saat metrik berbeda; tidak menampilkan selisih palsu −167. Catatan provenance disimpan pada leaderboard-reference-2026-10-22.json tanpa mengubah snapshot asli.


## Nilai tertinggi Farmasi UI — 22 Oktober 2026

Screenshot kedua menunjukkan baris pertama S1 - FARMASI pada UNIVERSITAS INDONESIA dengan Weighted Score 718. Angka ini dimasukkan pada kedua mode report. Kartu program di atas tabel menampilkan Pendidikan Dokter Gigi dan filter prodi berisi dua pilihan; label baris digunakan untuk mencegah salah mengambil 717 milik prodi lain. Filter event UI tidak tampak dipilih, berbeda dari screenshot UGM yang menampilkan event reguler terpotong. Provenance kedua referensi digabung dalam leaderboard-reference-2026-10-22.json; cakupan event tetap belum lengkap. Selisih tetap tidak dihitung dari skor total Garuda karena metrik weighted belum tersedia.


## Selisih langsung sesuai arahan pengguna — 22 Oktober 2026

Pengguna meminta label Weighted Score tidak ditampilkan dan selisih dihitung langsung. Kedua mode kini memakai nilai siswa yang dipilih dikurangi target leaderboard: 546−713=−167 untuk UGM, 546−718=−172 untuk UI; dengan median 568,5, selisihnya −144,5 dan −149,5. Label dan catatan penundaan dihapus. Perhitungan serta eksplorasi alternatif pada detail kembali mengikuti nilai siswa yang dipilih. Metadata metrik sumber tetap disimpan untuk provenance; kebijakan perbandingan sesuai arahan pengguna dicatat pada file referensi. Target yang kosong tetap tidak diperlakukan sebagai nol.


## Pembanding subtes pada detail pilihan — 22 Oktober 2026

Panel subtes yang sebelumnya hanya menampilkan nilai siswa kini memuat pembanding leaderboard, selisih, dan bar perbandingan pada kedua mode. Acuan diambil dari nilai subtes peserta pada baris tertinggi skor total pada screenshot pengguna. UGM: PU 734, PK 768, LBI-A 653; UI: PU 772, PK 734, LBI-A 604. Dengan nilai terakhir Garuda 465/488/505, selisih UGM −269/−280/−148 dan UI −307/−246/−99. Pemilihan median siswa memperbarui nilai serta selisih, sementara pembanding tetap. Seluruh delapan nilai subtes dari baris terkait dicatat dalam provenance; angka pembanding lama pada tuple focusSubtests diselaraskan.


## Legend pilihan yang mudah dipindai — 22 Oktober 2026

Paragraf panjang di bawah tabel pilihan diganti tiga definisi dengan label tebal: Target nilai, Selisih nilai, dan Peringkat perkiraan. Definisi ditampilkan sejajar di layar lebar dan bertumpuk di layar kecil. Rumus selisih dan makna angka negatif tetap terlihat, begitu juga penjelasan bahwa peringkat adalah perkiraan. Kalimat status aman/tidak aman yang tidak menambahkan informasi tabel dihapus. Diterapkan pada Guided Report dan Meeting Mode; perhitungan tidak diubah.


## Detail subtes lebih ringkas — 22 Oktober 2026

Tiga kartu subtes di modal pilihan diganti tabel dengan kolom Subtes, Nilai siswa, Pembanding, dan Selisih. Acuan nilai siswa disebut sekali pada caption dan bar per subtes dihapus. Penjelasan sumber pembanding tersedia dalam disclosure “Tentang pembanding”. Perhitungan terbaru/median dan warna selisih dipertahankan pada kedua mode report.


## Alternatif kampus berjajar — 22 Oktober 2026

Alternatif pada detail pilihan kini ditampilkan dalam tiga kartu sejajar, masing-masing memuat universitas, prodi, target nilai minimum, dan selisih. Angka tetap mengikuti acuan nilai siswa yang dipilih. Di layar sampai 600 px kartu bertumpuk agar isi mudah dibaca. Diterapkan pada kedua mode report.


## Subtes sejajar dalam kartu ringkas — 22 Oktober 2026

Sesuai feedback lanjutan, tabel subtes di modal dihapus dan diganti tiga kartu sejajar. Setiap kartu mengelompokkan kode subtes, nilai siswa, pembanding, serta selisih dalam satu tempat; label dan nilai berdekatan. Acuan tryout disebut sekali di atas kartu. Tidak ada bar, dan rincian pembanding tetap bisa dibuka. Pada layar kecil kartu menjadi baris ringkas. Kedua mode diperbarui tanpa mengubah angka atau perhitungan.


## Warna selisih pada tabel pilihan — 22 Oktober 2026

Selisih negatif kini merah, positif hijau, dan nol netral pada tabel utama pilihan di kedua mode. Tanda angka tetap tampil; data yang belum tersedia tetap berupa — tanpa warna status. Legend menjelaskan arti merah dan hijau sebagai posisi nilai terhadap target. Warna mengikuti nilai yang aktif saat acuan tryout terakhir/median diganti.


## Eksekusi audit keterbacaan popout — 22 Oktober 2026

Peringkat dilabeli perkiraan dan dijelaskan tetap saat baseline diganti karena mengikuti persentil sumber. Dua acuan dibedakan menjadi Acuan nilai Ruangguru dan Nilai tertinggi peserta di leaderboard. Bar dihapus; arti selisih berupa kalimat poin di bawah/di atas acuan langsung di dekat nilai. Kartu subtes tetap berjajar dan kini dipilih otomatis dari tiga nilai siswa terendah pada baseline aktif; nama terverifikasi ditampilkan, kode lain tetap sesuai sumber tanpa menebak perluasannya. Alternatif tetap berjajar, simbol ketaksamaan diganti kalimat, arti selisih positif dan perbedaan S1/D3 dijelaskan. Semua sumber dan rumus dirangkum dalam satu disclosure; tanggal screenshot dibedakan dari tanggal TO yang belum diketahui. Tahun/dokumen asal acuan Ruangguru belum tersedia dan dinyatakan di sumber. Konteks tambahan dengan target lama 686/694, konteks akademik berulang, serta tombol tambah topik dihapus dari popout. Tabel utama diselaraskan label dan legendnya, dengan warna selisih tetap. Snapshot dan angka sumber tidak diubah.

Screenshot sumber UGM dan UI disalin dari lampiran pengguna ke folder pilot dan ditautkan langsung pada disclosure sumber. Lokasi bukti ditambahkan ke metadata provenance. Nilai subtes terakhir yang kosong tidak lagi diganti diam-diam dengan nilai TO sebelumnya saat menentukan tiga subtes terendah.


## Intensitas sorotan tiga nilai terendah — 22 Oktober 2026

Warna latar nilai terendah per TO kini bertingkat: terendah pertama merah paling pekat, kedua lebih muda, ketiga paling tipis. Penentuan tingkat mengikuti peringkat nilai dalam setiap kolom TO, bukan frekuensi atau urutan baris. Nilai sama memperoleh warna sama; aturan sorotan pada batas ketiga dan hitungan frekuensi tetap. Legend tiga tingkat, tooltip peringkat, dan label pembaca layar ditambahkan tanpa menambah badge di sel. Berlaku di Guided Report dan Meeting Mode.


## Penjelasan materi dipindah ke bawah tabel — 22 Oktober 2026

Pengantar Materi yang perlu diperbaiki dipadatkan menjadi satu kalimat tentang tiga subtes dan tiga materi prioritas. Rincian pemilihan, cakupan nilai TO, cakupan rincian materi, daftar TO, status sample, dan cara menghitung persentase dipindah ke disclosure Cara pemilihan dan cakupan data setelah tabel. ID data dinamis tetap agar informasi mengikuti filter TO. Kedua mode diperbarui; angka tidak berubah.


## Hapus ringkasan frekuensi di atas tabel subtes — 22 Oktober 2026

Kalimat Paling sering disorot dihapus dari kedua mode beserta elemen, pengisian dinamis, dan gaya khususnya. Filter TO kini langsung diikuti tabel. Urutan baris, intensitas warna, serta perhitungan frekuensi tetap.


## Periode tabel materi terlihat langsung — 22 Oktober 2026

Periode nilai subtes dan hasil TO materi tampil ringkas di atas tabel, beserta jumlah TO masing-masing. Periode nilai subtes mengikuti filter jenis TO; periode hasil materi mengikuti tanggal record rincian materi, sehingga tidak disamakan dengan riwayat nilai asli. Periode drill per materi belum tercatat dan ditampilkan apa adanya. Penjelasan dan daftar event tetap di disclosure bawah tabel. Kedua mode diperbarui.


## Satu rentang tanggal tabel materi — 22 Oktober 2026

Label di atas tabel dipadatkan menjadi Periode data dengan satu rentang dari tanggal paling awal sampai paling akhir pada nilai subtes dan rincian materi yang digunakan. Jumlah TO, periode tiap sumber, dan keterangan periode drill dipindahkan ke disclosure Cara pemilihan dan cakupan data. Kedua mode diperbarui; angka tabel tidak berubah.


## Penempatan hasil drill dan pendalaman KBM — 22 Oktober 2026

Hasil drill PPU 4/18 benar (22,2%) dipindah dari Cara belajar ke bagian Drill terkait, tanpa membandingkannya dengan pengamatan pengajar. Cara belajar menampilkan catatan KBM dan pertanyaan tentang keragaman materi yang ditanyakan atau dipilih siswa untuk dibahas. Keaktifan bertanya tidak dijadikan kesimpulan tentang keragaman topik. Panduan SA diselaraskan pada kedua mode.


## Hapus ringkasan drill PPU tambahan — 22 Oktober 2026

Sesuai koreksi pengguna, ringkasan hasil drill PPU yang sempat dipindahkan ke bagian Drill terkait dihapus, bukan dipindahkan. Data PPU pada tabel drill tetap ditampilkan. Berlaku di kedua mode.


## Aktivitas kelas dan dokumentasi prompt ringkasan — 22 Oktober 2026

Section Cara belajar diganti Aktivitas belajar di kelas pada kedua mode. Kehadiran dan cakupan catatan dihitung dari empat sesi sumber; narasi dibatasi pada dua catatan PPU/Biologi dengan atribusi pengajar dan tautan ke catatan asli. Setiap sesi menampilkan tanggal, jam sumber, mapel, pengajar, status hadir dan ketersediaan catatan. Pertanyaan belajar di rumah, Profiling, label evaluatif, dan kesimpulan umum di section ini dihapus. Navigasi diselaraskan. Fixture JSON menyimpan input, ID sumber dan narasi prototype. Dokumen Report Konsultasi - Prompt Ringkasan Kelas.md memuat prompt siap pakai, kontrak input/output, validasi struktur dan makna, fallback, serta skenario uji. Prototype belum memanggil AI; pemeriksaan ID/kutipan tidak dianggap validasi makna otomatis.


## Detail kelas dipindah ke popout — 22 Oktober 2026

Tampilan utama Aktivitas belajar di kelas dipadatkan menjadi statistik, ringkasan, dan tombol Lihat detail kelas. Keterangan cakupan catatan, tautan bukti ringkasan, daftar sesi, catatan asli, dan tautan sumber ditampilkan dalam dialog khusus yang dapat ditutup lewat tombol, Escape, atau klik backdrop. Tautan bukti tetap membuka catatan sesi terkait. Berlaku pada kedua mode; data, narasi dan prompt tidak berubah. Dokumentasi penempatan UI diselaraskan.


## Eksekusi pemangkasan wording — 22 Oktober 2026

Kedua mode memakai ringkasan awal yang lebih singkat: riwayat nilai lengkap dan rincian drill per subtes tidak diulang di overview, ringkasan kelas dihitung dari fixture sumber, dan konflik pilihan ditulis ringkas. Panduan statis per section dipadatkan menjadi satu kalimat. Label pembuka pertanyaan dipersingkat; baris Fokus materi yang mengulang kode subtes dihapus. Legend tabel disingkat, sementara aturan ties, urutan, nilai kosong, skala grafik, definisi nilai tengah dan perilaku filter tersedia dalam bantuan. Judul drill disesuaikan menjadi Bagaimana hasil drill soalnya, dengan keterangan data kosong dalam Cara membaca drill.

Disclosure benchmark duplikat dihapus; rincian sumber pilihan tetap di popout. Label perbandingan, peserta acuan dan selisih alternatif diperjelas; footer tidak mengulang angka target lama yang tersimpan pada provenance. Label tanggal pembaruan pilihan dan tahun seleksi yang belum didukung field sumber dihapus. Label nilai terakhir dan headline kini menyebut jenis TO ketika difilter. Nama langkah kelas/drill dan tombol akhir Meeting Mode diselaraskan.

Pemeriksaan: sintaks kedua file, ID HTML, referensi elemen yang dihapus, fixture dan fallback kelas; browser filter Premium/Semua TO, acuan median/terakhir, selisih pilihan UGM, detail kelas dan navigasi Meeting Mode. Nilai, sumber catatan, aturan pemilihan materi, serta mesin tren TO tidak diubah. Narasi asli pengajar tetap utuh.


## Tiga subtes di ringkasan dan rincian jumlah drill — 22 Oktober 2026

Ringkasan awal menampilkan tiga subtes yang paling sering masuk kelompok tiga nilai terendah, beserta frekuensi masing-masing. Urutan mengikuti tabel subtes: frekuensi terbanyak, lalu rata-rata nilai terendah untuk frekuensi yang sama. Untuk Semua TO hasilnya PU (3 dari 4 TO), LBI-S (2 dari 4 TO), dan LBIN (2 dari 4 TO). Filter satu TO menampilkan tiga nilai terendah beserta nilainya, tanpa menyimpulkan pola berulang.

Jumlah drill diberi rincian singkat yang dihitung dari sumber yang sama: 58 soal = PU 30 + PPU 18 + PM 10. Angka dicocokkan dengan 15 sesi kelas UTBK & Ujian Mandiri dalam snapshot Student Tower, periode 28 September–4 Oktober 2026; bukan agregat seluruh kelas. Data asal dan jumlah soal tidak diubah. Berlaku pada Guided Report dan Meeting Mode.


## Hapus kolom Perubahan pada tabel subtes — 22 Oktober 2026

Kolom selisih nilai awal–akhir dihapus dari tabel Nilai per subtes pada kedua mode beserta penjelasannya di bantuan. Fokus tabel tetap pada nilai tiap TO, sorotan tiga nilai terendah dan rata-rata; urutan baris tetap berdasarkan frekuensi masuk tiga nilai terendah, lalu rata-rata. Tren subtes tetap tersedia melalui grafik. Nilai dan perhitungan prioritas tidak berubah.


## Istilah tryout menggantikan TO — 22 Oktober 2026

Singkatan TO pada tampilan kedua mode diganti menjadi tryout, termasuk label filter, ringkasan, grafik, tabel, panduan SA, bantuan, popout, tooltip dan label aksesibilitas. Template teks dinamis diselaraskan agar istilah tetap sama saat filter berubah. ID record sumber tetap dipertahankan; angka dan perhitungan tidak berubah.


## Header kelompok Leaderboard Ruangguru — 22 Oktober 2026

Header tabel pilihan dibuat dua tingkat: Berdasarkan Leaderboard Ruangguru menaungi Peringkat dan Nilai tertinggi memakai colspan dua kolom. Pilihan siswa, selisih dan aksi membentang dua baris header. Penjelasan bahwa peringkat merupakan estimasi Student Tower tetap pada legend; tooltip nilai tertinggi dan semua angka tetap. Scope header kelompok/kolom disertakan untuk aksesibilitas. Berlaku pada kedua mode.


## Tipografi header pilihan diselaraskan — 22 Oktober 2026

Semua label header tabel pilihan memakai ukuran 12 px, bobot 600, line-height 1,4, kapitalisasi biasa dan jarak huruf normal. Header gabungan tetap di tengah di atas Peringkat dan Nilai tertinggi; header yang membentang dua baris disejajarkan secara vertikal dengan padding yang konsisten. Berlaku pada kedua mode tanpa mengubah isi atau angka.


## Catatan perbedaan pilihan ke pendalaman SA — 22 Oktober 2026

Catatan Profiling Farmasi UGM/UI dan Catatan Kakak Asuh Teknik Mesin UI/UGM dipindahkan dari banner sebelum tabel pilihan ke Yang perlu digali SA setelah tabel. Catatan menjadi konteks bagi pertanyaan konfirmasi pilihan siswa, tanpa banner kuning tambahan. Sumber pilihan dan informasi perbandingan tetap. Berlaku pada kedua mode.


## Prioritas subtes pada detail pilihan — 22 Oktober 2026

Pemilihan tiga nilai siswa terendah di popout pilihan dihentikan. Bagian Subtes prioritas untuk pilihan ini mengikuti konfigurasi terpisah per prodi, kampus dan jalur dengan sumber pemetaan. Konfigurasi Farmasi UGM/UI belum terisi karena data yang ada belum memuat bobot/relevansi; tampilan menyatakan pemetaan belum tersedia, bukan mengasumsikan prioritas dari nilai siswa atau leaderboard. Nilai kosong tidak mengganti subtes prioritas dan tidak menghasilkan selisih palsu. Mekanisme berlaku pada kedua mode; pemetaan menunggu sumber Ruangguru atau tim akademik.


## Pemetaan Farmasi dari tabel acuan Ruangguru — 22 Oktober 2026

Screenshot List Prodi Terbaru tab data updated menyediakan acuan per subtes. Konfigurasi Farmasi UGM (kode 13611002, baris 5042) dan UI (13211007, baris 4981) diisi dari delapan kolom subtes. Tiga acuan tertinggi pada keduanya: PK, PU, PM. Kartu memakai acuan subtes dari tabel yang sama, bukan peserta leaderboard, dengan selisih terhadap acuan tersebut. Prioritas tetap saat nilai terakhir/nilai tengah diganti.

Sumber screenshot dan JSON transkripsi tersimpan di folder pilot dan ditautkan pada disclosure kedua mode. Sumber acuan total diperbarui menjadi List Prodi Terbaru; tahun berlaku dan metode PG belum terverifikasi. Ini aturan prioritas pembahasan berdasarkan acuan tertinggi, bukan klaim bobot resmi atau pengaruh kausal. Nilai leaderboard total, peringkat dan skor asli Garuda tidak berubah.


## Alternatif kampus dengan acuan terdekat — 22 Oktober 2026

Filter alternatif yang hanya menerima acuan di bawah/sama dengan nilai siswa diganti dengan pengurutan selisih absolut terkecil. Selisih negatif kecil ikut tampil. Kandidat mengikuti prodi dan jenjang yang sama dengan pilihan aktif, mengecualikan kampus aktif dan nilai tidak valid; maksimal tiga pilihan dengan nama kampus sebagai pemecah seri. Daftar tidak lagi disembunyikan saat nilai siswa melampaui acuan kampus aktif.

Pada nilai terakhir 546, S1 Farmasi menghasilkan Pattimura (544,43; +1,57), Negeri Malang (547,65; −1,65), Tadulako (532,55; +13,45). D3 tidak dicampur ke perbandingan S1. Selisih negatif merah dan positif hijau. Judul dan penjelasan menyatakan acuan terdekat, bukan klaim reachable; penentuan keterjangkauan belum memiliki parameter waktu/tren atau batas tervalidasi. Angka sumber tetap; cakupan daftar tersimpan dijelaskan pada disclosure sumber. Berlaku pada kedua mode.


## Pendalaman SA berbentuk tugas netral — 22 Oktober 2026

Seluruh Yang perlu digali SA di kedua mode menggunakan kalimat tugas untuk SA, bukan pertanyaan langsung atau instruksi yang mengasumsikan jawaban. Cakupan: tren nilai, materi, drill, pilihan jurusan, serta template utama dan kondisi tambahan mesin wording (data belum lengkap, perubahan besar, waktu, dan jenis tryout). Bahasa Menelusuri/Membandingkan/Mengidentifikasi/Mengonfirmasi menyebut objek pembahasan tanpa menyimpulkan penyebab dari angka. Kebutuhan bantuan, kendala dan perubahan tidak dianggap sudah ada sebelum dikonfirmasi. Bukti angka dan sumber tetap terpisah.

Sumber mesin, salinan kedua report, generator, matriks, simulator dan keluaran kombinasi diselaraskan. Nama field lama dipertahankan untuk kompatibilitas, tetapi isi field pendalaman adalah tugas netral. Pemeriksaan generator: 15 pola, 12.960 kombinasi kondisi dan 3.280 urutan perubahan; seluruh field tugas utama/tambahan tidak mengandung tanda tanya. Angka, aturan tren dan pilihan prioritas tidak berubah.


## Kata dasar untuk tugas pendalaman SA — 22 Oktober 2026

Poin pendalaman memakai kata dasar Bahas, Tinjau, Bandingkan, Pastikan, Konfirmasi, Catat dan Sepakati. Kalimat drill, materi, pilihan jurusan dan tren disingkat agar aktivitas SA jelas, tanpa menebak penyebab atau mengarahkan jawaban siswa. Contoh drill: Bahas cara siswa memilih materi drill pada subtes PU. Tinjau contoh pengerjaan dan pembahasan jawabannya jika tersedia. Kebutuhan dukungan tetap mengikuti penjelasan siswa serta orang tua. Sumber mesin, kedua report, matriks dan simulator diselaraskan; angka serta aturan pemilihan tidak berubah.


## Bullet untuk beberapa tugas SA — 22 Oktober 2026

Poin pendalaman yang memuat beberapa tugas ditampilkan sebagai daftar bullet; satu tugas tetap berupa paragraf. Drill dan materi menggunakan daftar tugas eksplisit. Renderer bersama juga memisahkan kalimat tugas pada output tren, tanpa memecah kalimat keterangan atau angka desimal. Elemen daftar memakai ul/li dan isi ditulis lewat textContent. Kedua mode diperbarui; wording, data dan aturan prioritas tetap.


## Hapus penjelasan warna dari legend pilihan — 22 Oktober 2026

Keterangan Merah (−): di bawah pembanding dan Hijau (+): di atas pembanding dihapus dari legend tabel pilihan pada kedua mode. Rumus selisih tetap terlihat; warna dan angka tidak berubah.


## Revisit bantuan tabel pilihan — 22 Oktober 2026

Legend tiga kolom yang selalu terbuka diganti satu catatan singkat: Peringkat bersifat perkiraan. Nilai tertinggi peserta bukan batas kelulusan. Definisi disimpan dalam disclosure Cara membaca tabel, diurutkan sesuai kolom: Peringkat, Nilai tertinggi, Selisih nilai. Penjelasan peringkat tetap menyebut estimasi persentil Student Tower dan tidak berubah saat acuan nilai siswa diganti; rumus memakai kalimat sederhana. Keterangan warna yang sudah dihapus tidak ditambahkan kembali. Detail bantuan memakai susunan label dan isi yang berdekatan, satu kolom pada layar kecil. Berlaku di kedua mode; angka dan perhitungan tetap.


## Lengkapi nama literasi pada tampilan yang sudah memakai kepanjangan — 22 Oktober 2026

Atas persetujuan pengguna, nama tampilan LBI-A menjadi Literasi Bahasa Indonesia — Saintek, LBI-S menjadi Literasi Bahasa Indonesia — Soshum, dan LBIN menjadi Literasi Bahasa Inggris. Pembaruan memakai field nama bersama pada kedua report, sehingga tabel drill, pilihan grafik, bantuan kode, dan komponen yang sebelumnya menampilkan kepanjangan ikut selaras. Tampilan yang hanya memakai kode tetap hanya menampilkan kode. Tabel drill tersimpan juga diselaraskan. Dasar penamaan adalah padanan kolom leaderboard yang sudah digunakan report (LBI Saintek/LBI Soshum/LBE), bukan kamus kode resmi Student Tower; keterangan sumber disesuaikan. Nilai, kode sumber, urutan, dan perhitungan tidak berubah.


## Hapus keterangan singkat di bawah grafik — 22 Oktober 2026

Keterangan “Titik berwarna = tryout terakhir · garis abu-abu = nilai tengah.” dihapus dari kedua mode sesuai feedback pengguna. Bantuan Cara membaca grafik tetap tersedia; grafik dan perhitungannya tetap. Style khusus keterangan yang tidak terpakai dihapus.


## Ambil ulang periode 13 Juli–26 November — 22 Oktober 2026

Data Garuda diambil ulang melalui browser Codex dalam lima interval maksimal 31 hari. Semua halaman rincian drill dicatat; total periode dihitung dari sesi bertanggal karena snapshot mingguan dapat melampaui batas filter. Kedua mode report memakai paket baru pada `outputs/garuda-refresh-2026-10-22/`; paket W40 lama tetap disimpan.

Hasil: 114 baris drill lintas mata pelajaran; subset UTBK & Ujian Mandiri 19 sesi, 74 soal, 36 benar. Kelas 44 sesi: 35 hadir, 1 terlambat, 6 sakit, 2 izin. Kehadiran 36/44 mencakup terlambat. Ada 16 catatan pengajar terisi dan 28 sesi tanpa catatan terisi. Ringkasan diperbarui dengan 16 kutipan asli yang bisa ditelusuri. Empat tryout dan seluruh nilai subtes cocok dengan pengambilan baru; nilai total tetap 601 → 576 → 561 → 546. Konteks WhatsApp 19 Oktober ditaruh di disclosure drill dengan atribusi sumber, terpisah dari ringkasan kelas.

Header membedakan periode yang diminta dari tanggal data: data terbaru 21 Oktober, diambil 22 Oktober. November belum tersedia. Nilai yang tidak tercatat tetap —. Rincian materi prototype, leaderboard, dan acuan prodi tidak diambil ulang. Dua baris Biologi identik dipertahankan sesuai sumber karena ID sesi asli tidak tersedia.

Pemeriksaan integritas lulus pada kedua mode: JS valid, data tertanam sesuai paket, matriks nilai tryout cocok, dan semua kutipan catatan cocok persis. Browser memverifikasi statistik, ringkasan kelas, rincian 44 sesi, serta filter tryout; bukti tampilan dan hasil pemeriksaan tersimpan pada folder pengambilan baru.


## Revisi ringkasan, prioritas, kelas dan sesi leaderboard — 23 Oktober 2026

Sepuluh masukan browser diterapkan pada kedua mode. Ringkasan drill menunjukkan cakupan tiga subtes prioritas, jumlah soal dan akurasi tertimbang (kurang jika <75%). Kehadiran menyebut jumlah terlambat. Footnote ringkasan dihapus. Median menggantikan rata-rata pada tabel subtes, dengan urutan frekuensi tiga terbawah → median → nilai terbaru. Urutan ini juga menentukan materi prioritas. Materi digabung ke tabel drill sebagai rincian tiga subtes; status drill materi yang belum terpetakan tidak diisi dari data simulasi.

Progres memiliki parameter kelompok skor per seri; ambang dan target jumlah soal default kosong, dapat diisi pada Pengaturan indikator. Detail kelas tampil sebagai tabel berhalaman, lengkap dengan catatan asli dan sorotan terlambat. Popup kelas dihapus. Pemilih sesi leaderboard serta riwayat peringkat ditambahkan; angka per sesi/pilihan dapat diisi lokal. Peringkat langsung tidak dihitung dari estimasi persentil. Referensi 713/718 yang belum diketahui sesinya tetap terpisah, tidak dipinjam oleh sesi bertanggal yang belum memiliki data.

Data pengambilan 22 Oktober, nilai asli tryout, dan kutipan pengajar tetap. Uji integritas kedua mode serta aturan batas/urutan/pemisahan sesi lulus. Browser memeriksa ringkasan, materi, 44 sesi unik pada delapan halaman, 16 catatan, satu terlambat, pergantian sesi, dan parameter indikator. Rincian aturan/keterbatasan: `Report Konsultasi - Draft Revisi 2026-10-23.md`; bukti pada `outputs/report-revision-2026-10-23/`.


## Referensi sementara section 6 — 23 Oktober 2026

Atas permintaan pengguna, tampilan memakai nilai versi sebelumnya selama data per sesi belum diberikan: UGM 17/69 dengan nilai tertinggi 713; UI 10/41 dengan nilai tertinggi 718. Peringkat tersebut merupakan estimasi dari persentil, bukan urutan langsung yang sudah diverifikasi.

Fallback hanya untuk tampilan. Data sesi yang sudah diisi tetap diutamakan; form input tetap kosong bila belum ada data sesi, sehingga nilai sementara tidak tersimpan sebagai observasi. Riwayat menampilkan satu baris referensi lama dan hanya menambahkan sesi yang memiliki data, tanpa membuat riwayat angka yang sama untuk seluruh sesi.
