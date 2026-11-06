# Devlog — Consultation Report SA

Dokumen ini menjadi titik referensi cepat untuk melanjutkan prototype **Consultation Report SA** di chat atau sesi kerja berikutnya.

## Status terakhir

**Tanggal:** 5 November 2026  
**Status:** Asset prototype sudah dipindahkan ke folder project ini.

Sumber awal asset berada di `SAKnowledge2`. Asset yang spesifik untuk Consultation Report sekarang berada di folder:

`/Users/fa-2400/Documents/ChatGPT/Consultation Guideline & Report`

Folder sumber masih menyimpan beberapa dokumen referensi umum Student Tower dan Student Profiling yang tidak dipindahkan.

## Prototype utama

| Kebutuhan | File |
|---|---|
| Entry point/default | `index.html` |
| Guided Report Garuda | `Consultation Brief - Garuda Mahawira Sena - Guided Report.html` |
| Meeting Mode Garuda | `Consultation Brief - Garuda Mahawira Sena - Meeting Mode.html` |
| Guided Report umum | `Consultation Brief - Guided Report.html` |
| Meeting Mode umum | `Consultation Brief - Meeting Mode.html` |
| Choice-Centric | `Consultation Brief - Choice-Centric.html` |
| Academic Flow | `Consultation Brief - Academic Flow.html` |
| Sample | `Consultation Brief - Sample.html` |
| Simulator wording | `Simulasi Wording SA - Tryout.html` |

Versi share statis/interaktif Garuda juga tersedia di folder root dengan nama yang mengandung `Static Share` atau `Interactive Share`.

## Struktur asset

```text
.
├── index.html
├── Consultation Brief - *.html
├── Report Konsultasi - *.md
├── Learning Call * - Report Findings.md
├── Student Tower - Dummy Consultation Data.md
├── report-logic/
│   ├── report-insights.js
│   └── tryout-wording.js
├── samples/
├── scripts/
└── outputs/
    ├── report-pilot-2026-10-21/
    ├── report-revision-2026-10-23/
    ├── garuda-refresh-2026-10-22/
    └── ...
```

`report-logic/` berisi sumber aturan/insight. `samples/` berisi contoh data. `outputs/` berisi snapshot, bukti sumber, screenshot, dan hasil verifikasi historis.

## Menjalankan secara lokal

Dari folder project ini:

```bash
npm start
```

Lalu buka [http://127.0.0.1:8788](http://127.0.0.1:8788). Entry point akan mengarahkan ke report Garuda versi Guided Report.

Alternatif tanpa npm:

```bash
python3 -m http.server 8788 --bind 127.0.0.1
```

## Pemeriksaan yang tersedia

```bash
npm run check
```

Script pemeriksaan berada di `scripts/check-report-insights.cjs` dan `scripts/check-garuda-refresh.cjs`. Script `update-*` adalah migrasi historis; jangan jalankan ulang tanpa memahami input dan backup yang digunakan.

## Catatan konteks produk

- Report ini dibuat untuk membantu Student Advisor menjalankan konsultasi berbasis data.
- Fokus prototype mencakup alur guided report, meeting mode, prioritas subtes, hasil tryout, drill/material, dan ringkasan yang bisa dipakai saat konsultasi.
- Contoh siswa utama yang dipakai adalah **Garuda Mahawira Sena**.
- Beberapa file HTML menyimpan data dan runtime logic langsung di dalam file sehingga dapat dibuka sebagai prototype mandiri.

## Dokumen kerja penting

- `Report Konsultasi - Draft Revisi 2026-10-23.md`
- `Report Konsultasi - Audit Copy 2026-10-22.md`
- `Report Konsultasi - Audit Fungsi Section.md`
- `Report Konsultasi - Pemetaan Data Garuda.md`
- `Report Konsultasi - Prioritas Subtes Pilihan.md`
- `Report Konsultasi - Prompt Ringkasan Kelas.md`
- `Report Konsultasi - Panduan Pilot.md`

## Cara merujuk project di chat baru

Gunakan konteks singkat berikut:

> Lanjutkan prototype Consultation Report SA dari folder `/Users/fa-2400/Documents/ChatGPT/Consultation Guideline & Report`. Baca `DEVLOG.md` terlebih dahulu. Entry point utama adalah `Consultation Brief - Garuda Mahawira Sena - Guided Report.html`; mode pembandingnya `Consultation Brief - Garuda Mahawira Sena - Meeting Mode.html`.

