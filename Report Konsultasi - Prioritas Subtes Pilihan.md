# Prioritas subtes pada detail pilihan jurusan

Bagian ini mengikuti acuan nilai subtes per prodi, kampus, jenjang dan jalur. Tabel nilai per subtes tetap menjadi tempat melihat kesulitan akademik siswa secara keseluruhan.

## Sumber

Screenshot pengguna Screenshot 2026-10-21 at 1.12.00 PM.png: List Prodi Terbaru, tab data updated, diterima 22 Oktober 2026. Salinan area tabel dan transkripsi JSON tersimpan pada folder outputs/report-pilot-2026-10-21 sebagai acuan-subtes-farmasi-2026-10-21.png dan acuan-subtes-farmasi-2026-10-22.json.

| S1 Farmasi | Kode prodi | Baris sheet | PK | PU | PM |
|---|---|---:|---:|---:|---:|
| Universitas Gadjah Mada | 13611002 | 5042 | 937 | 844 | 750 |
| Universitas Indonesia | 13211007 | 4981 | 919 | 827 | 736 |

Aturan prototype: urutkan semua acuan subtes dari tertinggi, ambil tiga pertama; kode menjadi pemecah seri. Keduanya menghasilkan PK, PU, PM. Ini aturan prioritas pembahasan berdasarkan acuan nilai, bukan bukti pengaruh kausal atau bobot resmi penerimaan. Screenshot memuat label daya tampung 2026 dan peminat 2025; tahun berlaku serta metode PG per subtes belum terverifikasi.

## Konfigurasi dan perilaku

choiceSubtestPriorities menyimpan identitas pilihan, sumber, lokasi bukti dan pgSubtests berisi acuan seluruh subtes. Identitas prodi, universitas, jenjang dan jalur harus cocok dengan pilihan aktif. Acuan harus numerik dalam rentang 0–1.000, minimal tiga subtes, dan kodenya dikenali. JSON mencatat padanan kolom: PB mengikuti PG PBM; LBIN mengikuti padanan PG LBE yang sudah digunakan report tanpa menetapkan kepanjangan LBIN.

- Pemetaan tidak valid/belum tersedia: tampilkan keterangan belum tersedia, tanpa memakai nilai siswa terendah, selisih terbesar atau nilai leaderboard tertinggi sebagai pengganti.
- Pemetaan valid: tampilkan tiga kartu sesuai urutan acuan tertinggi.
- Kartu membandingkan nilai Garuda dengan acuan nilai subtes Ruangguru dari tabel ini, bukan nilai peserta leaderboard. Selisih = nilai Garuda − acuan subtes.
- Nilai tryout terakhir/nilai tengah mengubah nilai siswa dan selisih saja; daftar prioritas tetap mengikuti pilihan.
- Nilai siswa tidak tersedia: tampilkan — tanpa menghitung selisih, dan pertahankan kartu subtes prioritas.
- Sumber, tautan screenshot dan metode pemilihan tersedia di Lihat sumber data dan cara hitung.

## Contoh cek

Nilai tryout terakhir: UGM PK 488−937=−449, PU 465−844=−379, PM 597−750=−153. UI PK 488−919=−431, PU 465−827=−362, PM 597−736=−139. Saat beralih ke nilai tengah, prioritas tetap PK, PU, PM.
