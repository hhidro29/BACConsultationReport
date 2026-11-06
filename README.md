# Report Konsultasi SA

Prototype report konsultasi untuk SA. Project ini terpisah dari prototype chatbot TestCenter Knowledge SA.

Repository: git@github.com:hhidro29/SAKnowledge2.git

## Jalankan lokal

Memerlukan Python 3. Dari folder project ini:

```bash
python3 -m http.server 8788 --bind 127.0.0.1
```

Buka <http://127.0.0.1:8788/>. Alternatif: `npm start`. Tidak perlu menginstal dependency atau mengisi API key.

Pada sesi pemisahan, server port 8787 juga diarahkan ke folder report ini agar tab dan tautan lokal lama tetap berfungsi. Port 8788 menjadi alamat utama untuk menjalankan project secara mandiri.

## File utama

- [Report Garuda](Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Guided%20Report.html)
- [Mode meeting](Consultation%20Brief%20-%20Garuda%20Mahawira%20Sena%20-%20Meeting%20Mode.html)
- [Simulator wording](Simulasi%20Wording%20SA%20-%20Tryout.html)
- [Draft revisi](Report%20Konsultasi%20-%20Draft%20Revisi%202026-10-23.md)
- [Prompt ringkasan kelas](Report%20Konsultasi%20-%20Prompt%20Ringkasan%20Kelas.md)

Kedua HTML Garuda memuat data dan logika runtime di dalam file. `report-logic/` menyimpan sumber aturan, `samples/` menyimpan contoh, dan `outputs/` menyimpan snapshot data, bukti sumber, serta hasil verifikasi. Varian HTML lainnya adalah eksplorasi desain atau versi share sebelumnya; perubahan terbaru ada pada kedua file utama di atas.

## Verifikasi

Memerlukan Node.js 20 atau lebih baru:

```bash
npm run check
```

Pemeriksaan mencakup konsistensi data sumber dan kedua mode report, median, urutan prioritas subtes, akurasi drill, batas 75%, serta isolasi referensi leaderboard per sesi.

## Deployment

Prototype ini siap dipublish sebagai static site tanpa build step. Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk langkah Vercel atau Netlify.

Script `update-*` adalah migrasi historis, bukan langkah wajib saat menjalankan report. Jangan jalankan ulang pada setiap start; sebagian membangun ulang HTML dari backup versi lama.

## Pemisahan project

Dipisahkan pada 23 Oktober 2026. Manifest `project-separation.json` mencatat hash file saat dipindahkan. Dokumen Student Tower dan Student Profiling yang menjadi referensi bersama disalin; sumber chatbot tetap berada di project TestCenterKnowledgeSA. Data dan aset report ikut dalam project ini agar tautan bukti dan pemeriksaan dapat berjalan mandiri.
