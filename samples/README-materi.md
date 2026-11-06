# Contoh rincian materi report

`report-materials-demo.json` berisi 64 baris simulasi: delapan kode subtes × empat topik × dua TO. Semua materi, nilai, dan nama/tanggal TO bersifat contoh; tidak berasal dari Garuda. Contoh topik pada kode LBIN, LBI-A, dan LBI-S tidak menetapkan arti kode atau pemetaan resmi sumber.

Satu baris = satu materi pada satu subtes dan satu TO. Kolom minimum untuk pengambilan data asli: `studentId`, `eventId`, `eventName`, `eventDate` (YYYY-MM-DD), `subtest`, `materialId`, `materialName`, `correct`, `total`, dan `dataStatus`. Jumlah benar harus bilangan bulat antara nol dan total soal; total harus lebih dari nol. Gunakan ID materi yang konsisten agar riwayat dapat digabungkan. Materi kosong tidak berarti nilai nol.

Pada kedua HTML Garuda, dataset ini disalin sebagai `sampleMaterialData` agar halaman tetap dapat dibuka mandiri. Dataset terpisah dari `materials` yang masih kosong dan tidak memengaruhi nilai TO, ringkasan, ranking subtes, atau drill asli. Belum ada importer maupun penyimpanan data materi.

Panel materi bersifat keseluruhan: ambil tiga subtes dengan rata-rata skor terendah dari filter TO utama. Untuk setiap subtes, gabungkan record topik menurut `materialId`, hitung jumlah benar / jumlah soal, lalu ambil tiga persentase terendah. Data keempat yang lebih tinggi tidak ditampilkan. Klik satu subtes tidak mempersempit panel ini. Riwayat materi masih berasal dari fixture terpisah dan belum dipetakan ke ID event asli.

Atas permintaan pengguna, label simulasi dan kontrol pengembang tidak tampil pada report. Statusnya tetap tersimpan dalam dokumentasi dan metadata JSON sampai diganti dengan sumber asli. Jangan menganggap materi contoh ini sebagai diagnosis siswa.
