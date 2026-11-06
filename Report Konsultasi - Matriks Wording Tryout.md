# Matriks wording SA — progres tryout

Diperbarui 22 Oktober 2026. Aturan awal untuk ditinjau SA/tim akademik; penyebab perubahan tidak disimpulkan otomatis. Reguler dan premium diperlakukan sebagai satu rangkaian sesuai keputusan pengguna. Wording pendalaman berbentuk tugas untuk SA, bukan pertanyaan langsung kepada siswa. Gunakan kata dasar seperti Bahas, Tinjau, Bandingkan, Pastikan atau Konfirmasi. Buat tugas singkat dan konkret; bentuk instruksi ditujukan kepada SA, tanpa mengarahkan jawaban siswa. Sebut objek yang dibahas tanpa menetapkan penyebab, mengasumsikan adanya kendala, atau mengarahkan jawaban. Temuan angka tetap terpisah dari tugas pendalaman. Nama field student, parent, nextStep, additionalQuestions dan typeQuestion dipertahankan untuk kompatibilitas; seluruh isinya kini berupa poin tugas.

## Parameter dan kemungkinan nilainya

| Parameter | Kondisi yang ditangani | Dampak wording |
|---|---|---|
| Jumlah hasil valid | 0, 1, 2, minimal 3 | Belum ada tren, satu pengalaman, satu perubahan, atau pola beberapa tryout |
| Kelengkapan | Lengkap, kosong di awal/tengah/akhir, semua kosong, nilai tidak valid | Jelaskan cakupan; nilai kosong bukan nol; perubahan terakhir membutuhkan dua event terakhir bernilai |
| Jenis tryout | Satu jenis, campuran, sebagian kosong, seluruhnya kosong | Tidak mengubah pola; campuran menambah poin pendalaman pengalaman jenis tryout |
| Selisih keseluruhan | Naik, turun, dalam toleransi | Membaca arah awal–akhir tanpa mengabaikan pergerakan di tengah |
| Selisih per tryout | Positif, negatif, dalam toleransi | Membaca konsistensi, jeda, dan perubahan arah terakhir |
| Variasi | Rentang skor, jumlah pergantian arah, urutan perubahan | Membedakan benar-benar tetap dari naik-turun yang kembali ke awal |
| Besar perubahan | Ambang belum diaktifkan; di bawah atau mencapai ambang untuk perubahan terakhir, terbesar, dan keseluruhan | Tambahan poin pendalaman pada perubahan yang melewati ambang konfigurasi |
| Waktu | Tanggal lengkap/tidak valid; jeda normal/panjang; hasil baru/lama; tanggal setelah acuan | Tambahan konteks waktu, tanpa otomatis mengasumsikan penyebab |
| Metrik | Skor total atau subtes | Aturan sama; label dan angka mengikuti metrik yang dipilih |

## Definisi dan urutan keputusan

1. Hanya angka finite >= 0 yang dianggap nilai valid. Nol adalah nilai, null/kosong/string/negatif bukan nol.
2. Jika semua tanggal valid, urutkan kronologis. Jika ada tanggal tidak valid, pertahankan urutan sumber dan nyatakan keterbatasannya; waktu tidak dinilai.
3. Tentukan pola: jumlah hasil → semua perubahan tetap → satu arah (dengan/tanpa jeda) → pembalikan pada perpindahan terakhir → naik-turun dengan arah keseluruhan naik/turun/tetap. Pembalikan terakhir tidak otomatis disebut konsisten.
4. Pilih satu template utama. Tambahkan kondisi data, besar perubahan, waktu, dan jenis tryout secara berurutan. Modifikasi ini dapat muncul bersama tanpa mengganti pola utama.
5. Selisih dalam toleransi memakai |delta| <= toleransi. Default report **0 poin**, sehingga kata tetap berarti tepat sama. Ambang opsional hanya aktif bila diisi angka positif.
6. Ukuran besar perubahan memakai >= ambang; jeda panjang dan hasil lama memakai > ambang. Hasil lama membutuhkan tanggal acuan dan tanggal hasil terakhir.
7. Untuk jeda di antara nilai kosong, pola hanya memakai hasil yang tersedia, dengan catatan kelengkapan. Perubahan pada tryout terakhir tidak dipinjam dari dua nilai lama bila hasil terakhir/sebelumnya kosong.
8. Konsistensi memakai tanda perubahan antarevent, bukan sekadar selisih awal–akhir atau regresi. Jeda tanggal tidak dianggap laju poin per hari.

## Matriks pola utama

| Pola | Contoh nilai | Kode |
|---|---|---|
| Belum ada nilai | Tidak ada | `no_data` |
| Baru satu nilai | 550 | `one_result` |
| Dua hasil: naik | 500 → 550 | `initial_up` |
| Dua hasil: turun | 550 → 500 | `initial_down` |
| Dua hasil: tetap | 550 → 550 | `initial_flat` |
| Naik konsisten | 500 → 525 → 550 → 575 | `steady_up` |
| Turun konsisten | 601 → 576 → 561 → 546 | `steady_down` |
| Tetap sepanjang riwayat | 550 → 550 → 550 → 550 | `steady_flat` |
| Cenderung naik, diselingi tetap | 500 → 525 → 525 → 550 | `up_with_pauses` |
| Cenderung turun, diselingi tetap | 600 → 575 → 575 → 550 | `down_with_pauses` |
| Terakhir berbalik naik | 600 → 550 → 520 → 540 | `recovery` |
| Terakhir berbalik turun | 500 → 550 → 580 → 560 | `reversal_down` |
| Naik-turun, akhir lebih tinggi | 500 → 560 → 530 → 550 → 570 | `fluctuating_up` |
| Naik-turun, akhir lebih rendah | 600 → 540 → 570 → 550 → 530 | `fluctuating_down` |
| Naik-turun, kembali mendekati awal | 550 → 600 → 520 → 530 → 550 → 550 | `fluctuating_flat` |

## Wording tiap pola

### 1. Belum ada nilai

Contoh: belum ada hasil.

- **Temuan:** Belum ada nilai valid untuk membaca perkembangan skor total.
- **Siswa:** Pastikan tryout yang diikuti dan ketersediaan hasilnya.
- **Orang tua:** Bahas pengalaman mengikuti tryout dan mengakses hasil, termasuk kendala jika ada.
- **Tindak lanjut:** Lengkapi hasil yang tersedia sebelum membahas perkembangan nilai.

### 2. Baru satu nilai

Contoh: 550.

- **Temuan:** Baru satu nilai skor total tersedia, yaitu 550. Perkembangan belum dapat disimpulkan.
- **Siswa:** Bahas persiapan dan pengalaman pengerjaan pada tryout yang tercatat.
- **Orang tua:** Identifikasi dukungan belajar yang tersedia serta kebutuhan siswa untuk tryout berikutnya.
- **Tindak lanjut:** Catat pengalaman tryout ini sebagai konteks; perkembangan nilai menunggu hasil pembanding.

### 3. Dua hasil: naik

Contoh: 500 → 550.

- **Temuan:** Skor total naik dari 500 menjadi 550 (naik 50 poin). Baru dua hasil tersedia.
- **Siswa:** Bandingkan persiapan dan pengalaman pengerjaan pada dua tryout yang tercatat.
- **Orang tua:** Bahas rutinitas dan dukungan belajar di antara kedua tryout.
- **Tindak lanjut:** Rangkum perbedaan pengalaman siswa dan hal yang ingin dievaluasi pada tryout berikutnya.

### 4. Dua hasil: turun

Contoh: 550 → 500.

- **Temuan:** Skor total turun dari 550 menjadi 500 (turun 50 poin). Baru dua hasil tersedia.
- **Siswa:** Bandingkan persiapan, pengalaman pengerjaan, dan pembahasan hasil pada kedua tryout.
- **Orang tua:** Bahas rutinitas belajar di antara kedua tryout, termasuk perubahan atau kendala jika ada.
- **Tindak lanjut:** Catat temuan dari kedua tryout tanpa menyimpulkan penyebab penurunan atau pola berulang.

### 5. Dua hasil: tetap

Contoh: 550 → 550.

- **Temuan:** Dua nilai skor total sama: 550 → 550.
- **Siswa:** Bandingkan jenis soal, cara pengerjaan, dan pengelolaan waktu pada kedua tryout dengan nilai yang sama.
- **Orang tua:** Bahas rutinitas dan dukungan belajar di antara kedua tryout.
- **Tindak lanjut:** Rangkum persamaan dan perbedaan pengalaman siswa meskipun kedua nilai serupa.

### 6. Naik konsisten

Contoh: 500 → 525 → 550 → 575.

- **Temuan:** Skor total naik 3 kali berturut-turut, dari 500 menjadi 575 (naik 75 poin). Perubahan terakhir: +25 poin.
- **Siswa:** Bahas persiapan dan pengerjaan tryout selama periode ini, serta cara siswa membahas hasilnya.
- **Orang tua:** Identifikasi rutinitas dan dukungan belajar yang berlangsung selama periode tersebut.
- **Tindak lanjut:** Rangkum cara belajar yang dinilai membantu oleh siswa serta hal yang ingin dievaluasi.

### 7. Turun konsisten

Contoh: 601 → 576 → 561 → 546.

- **Temuan:** Skor total turun 3 kali berturut-turut, dari 601 menjadi 546 (turun 55 poin). Perubahan terakhir: -15 poin.
- **Siswa:** Bahas persiapan dan pengerjaan tryout selama periode ini, serta cara siswa membahas hasilnya.
- **Orang tua:** Bahas kondisi dan rutinitas belajar selama periode ini, termasuk perubahan jika ada.
- **Tindak lanjut:** Sepakati tindak lanjut berdasarkan contoh pengerjaan dan penjelasan siswa, tanpa menetapkan penyebab dari tren nilai saja.

### 8. Tetap sepanjang riwayat

Contoh: 550 → 550 → 550 → 550.

- **Temuan:** Skor total sama pada setiap perpindahan hasil yang tersedia. Perubahan terakhir: 0 poin.
- **Siswa:** Bandingkan jenis soal dan cara pengerjaan antartryout, termasuk kesulitan atau perubahan yang dirasakan siswa.
- **Orang tua:** Identifikasi rutinitas, dukungan yang tersedia, dan kebutuhan belajar menurut siswa serta orang tua.
- **Tindak lanjut:** Rangkum perkembangan dari contoh pengerjaan; nilai yang tetap belum menjelaskan penguasaan materi.

### 9. Cenderung naik, diselingi tetap

Contoh: 500 → 525 → 525 → 550.

- **Temuan:** Skor total cenderung naik, diselingi hasil yang sama. Awal–akhir: 500 → 550. Perubahan terakhir: +25 poin.
- **Siswa:** Bandingkan persiapan dan pengalaman pada tryout dengan nilai meningkat dan nilai tetap.
- **Orang tua:** Bahas rutinitas dan dukungan belajar selama periode tersebut.
- **Tindak lanjut:** Catat persamaan dan perbedaan pengalaman serta hal yang ingin ditinjau pada hasil berikutnya.

### 10. Cenderung turun, diselingi tetap

Contoh: 600 → 575 → 575 → 550.

- **Temuan:** Skor total cenderung turun, diselingi hasil yang sama. Awal–akhir: 600 → 550. Perubahan terakhir: -25 poin.
- **Siswa:** Bandingkan persiapan dan pengalaman pada tryout dengan nilai menurun dan nilai tetap.
- **Orang tua:** Bahas rutinitas dan kondisi belajar selama periode tersebut, termasuk kendala jika ada.
- **Tindak lanjut:** Sepakati fokus pembahasan berdasarkan contoh pengerjaan dan pengalaman siswa.

### 11. Terakhir berbalik naik

Contoh: 600 → 550 → 520 → 540.

- **Temuan:** Skor total pada hasil terakhir yang tersedia kembali naik setelah sempat turun. Awal–akhir: 600 → 540. Perubahan terakhir: +20 poin.
- **Siswa:** Bandingkan persiapan dan pengalaman pada tryout terakhir dengan tryout sebelumnya.
- **Orang tua:** Bahas kondisi, rutinitas, dan dukungan belajar menjelang tryout terakhir.
- **Tindak lanjut:** Catat perbedaan pengalaman untuk ditinjau pada hasil berikutnya; satu kenaikan belum menunjukkan konsistensi.

### 12. Terakhir berbalik turun

Contoh: 500 → 550 → 580 → 560.

- **Temuan:** Skor total pada hasil terakhir yang tersedia kembali turun setelah sempat naik. Awal–akhir: 500 → 560. Perubahan terakhir: -20 poin.
- **Siswa:** Bandingkan persiapan dan pengalaman pada tryout terakhir dengan tryout sebelumnya.
- **Orang tua:** Bahas kondisi, rutinitas, dan dukungan belajar menjelang tryout terakhir.
- **Tindak lanjut:** Catat perbedaan pengalaman untuk ditinjau pada hasil berikutnya; satu penurunan belum menunjukkan konsistensi.

### 13. Naik-turun, akhir lebih tinggi

Contoh: 500 → 560 → 530 → 550 → 570.

- **Temuan:** Skor total naik-turun; nilai akhir lebih tinggi daripada awal: 500 → 570. Perubahan terakhir: +20 poin.
- **Siswa:** Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih tinggi dan lebih rendah.
- **Orang tua:** Bahas rutinitas dan dukungan belajar antartryout, termasuk perbedaan jika ada.
- **Tindak lanjut:** Rangkum persamaan dan perbedaan pengalaman di sepanjang riwayat, termasuk hal yang ingin dievaluasi.

### 14. Naik-turun, akhir lebih rendah

Contoh: 600 → 540 → 570 → 550 → 530.

- **Temuan:** Skor total naik-turun; nilai akhir lebih rendah daripada awal: 600 → 530. Perubahan terakhir: -20 poin.
- **Siswa:** Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih rendah dan lebih tinggi.
- **Orang tua:** Bahas rutinitas dan kondisi belajar antartryout, termasuk kendala jika ada.
- **Tindak lanjut:** Sepakati fokus tindak lanjut berdasarkan pengalaman siswa dan contoh pengerjaan.

### 15. Naik-turun, kembali mendekati awal

Contoh: 550 → 600 → 520 → 530 → 550 → 550.

- **Temuan:** Skor total naik-turun, meskipun nilai awal dan akhir sama: 550 → 550. Perubahan terakhir: 0 poin.
- **Siswa:** Bandingkan persiapan dan pengalaman pada tryout dengan nilai lebih tinggi dan lebih rendah di sepanjang riwayat.
- **Orang tua:** Bahas kondisi, rutinitas, dan dukungan belajar selama periode nilai naik-turun.
- **Tindak lanjut:** Rangkum perbedaan pengalaman sepanjang riwayat; kesamaan nilai awal dan akhir belum menunjukkan kestabilan.

## Lapisan tambahan dan kombinasi

| Kondisi | Tambahan yang dihasilkan |
|---|---|
| Hasil kosong/tidak valid | Jumlah kekurangan, cakupan nilai yang dibaca, dan poin pendalaman melengkapi hasil |
| Nilai tryout terakhir kosong | Penegasan bahwa pola belum menggambarkan tryout terakhir |
| Tanggal tidak valid | Urutan sumber dipertahankan; jeda dan kebaruan tidak dinilai |
| Perubahan terakhir mencapai ambang | Fakta ambang + poin pendalaman apa yang berbeda pada tryout terakhir |
| Perubahan terbesar terjadi sebelumnya | Fakta perubahan terbesar + poin pendalaman tentang dua tryout tersebut |
| Selisih kumulatif mencapai ambang | Nyatakan selisih awal–akhir meskipun perubahan tiap tryout lebih kecil |
| Jeda panjang | Nyatakan panjang jeda + telusuri kegiatan/rutinitas selama jeda |
| Hasil lama | Nyatakan usia hasil + telusuri hasil atau kondisi yang lebih baru |
| Hasil bertanggal setelah acuan | Minta pemeriksaan tanggal; jangan sebut hasil lama |
| Jenis campuran | Pertanyaan pengalaman antara jenis tryout, terpisah dari poin pendalaman utama |
| Jenis kosong | Informasi kelengkapan jenis, tanpa membatalkan tren |

Toleransi positif dapat membuat kenaikan kecil berturut-turut masuk kategori tetap per langkah meskipun selisih kumulatif lebih besar; seluruh delta dan selisih kumulatif tetap tersedia. Batas 5/10 poin, 20/50 poin, dan 30 hari pada contoh simulasi adalah **nilai untuk review**, bukan standar akademik. Report memakai toleransi 0 dan menonaktifkan ambang besar/jeda/lama sampai ditentukan.

## Cakupan kombinasi yang dihasilkan

Generator menghasilkan **12.960 kombinasi konfigurasi**: 15 contoh pola × 4 jenis tryout × 6 keadaan data × 3 toleransi × 3 ambang besar perubahan × 4 keadaan waktu. Beberapa konfigurasi menghasilkan teks sama; contoh tanpa nilai tidak dapat mempunyai tren atau jeda meskipun modifier dipilih. Ini seluruh kombinasi bucket tersebut, bukan klaim bahwa semua angka skor, panjang riwayat, atau kondisi operasional sudah terwakili. Nilai skor mentah memiliki kemungkinan tak terbatas; mesin aturan mengelompokkannya secara komposisional.

Selain itu, semua **3.280 urutan tanda perubahan** sepanjang 0–7 perpindahan diuji, termasuk kondisi nilai ujung sama tetapi berfluktuasi. Pemeriksaan tambahan mencakup nilai nol, batas toleransi/ambang, kronologi, nilai terakhir kosong, dan tanggal masa depan.

- [Simulator wording](Simulasi%20Wording%20SA%20-%20Tryout.html)
- [Semua kombinasi beserta input, parameter, dan output](outputs/tryout-wording-2026-10-22/semua-kombinasi-wording.jsonl)
- [Cakupan pengujian](outputs/tryout-wording-2026-10-22/cakupan-dan-hasil-uji.json)
- [Contoh dasar yang bisa dipakai ulang](samples/tryout-wording-cases.json)

Sumber aturan: `report-logic/tryout-wording.js`. Salinannya tertanam pada kedua HTML Garuda agar tetap bisa dibuka mandiri.
