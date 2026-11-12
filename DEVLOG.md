# Devlog — Consultation Report SA (Brain Academy Checkpoint 1)

Titik referensi cepat untuk melanjutkan proyek di chat atau sesi kerja berikutnya. Baca ini dulu.

## Status terakhir

**Tanggal:** 11 November 2026
**Status:** Aplikasi React (Vite) aktif di `main`. Audit menyeluruh selesai dan perbaikan non-data sudah di-commit lokal (`d6e1604`). Item terkait data dan beberapa keputusan produk masih terbuka (lihat bawah).

Prototype HTML lama (`Consultation Brief - *.html` dst.) dipertahankan sebagai arsip referensi; aplikasi utama ada di `src/`.

## Aturan kerja (penting)

1. **Jangan deploy.** Jangan `git push origin main` atau `npm run deploy` kecuali pemilik proyek eksplisit menyuruh "deploy". Selama sesi cukup commit lokal dan cek lewat preview lokal.
2. **Zero AI / zero black-box.** Semua arahan SA dan analisis dihitung deterministik oleh `src/utils/saGuidelineEngine.ts`. Catatan pengajar di Tahap 4 ditampilkan apa adanya (verbatim).
3. **Sinkronisasi pilihan jurusan** antara Simulasi, Checkpoint V2, dan PDF A4 lewat localStorage `bac_v2_custom_programs_v1`, per siswa.

## Arsitektur

Stack: React, TypeScript, Vite, React Router (`HashRouter`), Lucide React. Repo: `hhidro29/BACConsultationReport`, branch `main`.

| Rute | File | Isi |
|---|---|---|
| `/v2` (default) | `src/pages/CheckpointV2Page.tsx` | 5 tahap konsultasi + cetak PDF A4 |
| `/v1` | `src/pages/CheckpointV1Page.tsx` | Versi lama |
| `/simulasi` | `src/pages/SimulasiPage.tsx` | Simulasi 1–4 pilihan prodi, validasi SNBT |
| `/rapor` | `src/pages/UpdateRaporPage.tsx` | Input nilai rapor |
| `/engine` | `src/pages/EngineMatrixPage.tsx` | Matriks rule-engine dan ambang |

Komponen penting: `ChoiceReviewModal` (review before/after sebelum pilihan diubah), `V2PdfModal` (cetak 2 halaman A4, font minimum 9px), `RuleTraceBox` (jejak aturan).

Data: `src/data/garudaData.ts` (3 siswa: `garuda`, `nadira`, `rizky`), `programCatalog.ts` (katalog prodi, `computeSimulatedProgram`, `validateSnbtChoices`), `classroomData.ts`, `raporData.ts`.

localStorage: `bac_v2_active_student_v1`, `bac_v2_custom_programs_v1`, `bac_v2_sa_notes_<id>`, `bac_v1_sa_notes`, `bac_sa_engine_config_v1`, `bac_rapor_garuda`. Akses lewat `src/utils/safeStorage.ts` (aman dari error dan JSON rusak).

Shortcut URL: `/?v=2`, `/?v=simulasi&student=nadira`, `/?v=1&preview=1`.

## Menjalankan dan memverifikasi

```bash
npm install
npm run dev                 # dev server (5173)
npm run build && npm start  # preview build di http://127.0.0.1:8788/
npx tsc --noEmit
npm run check
```

Alternatif preview: `python3 -m http.server 8788 -d dist`.

`npm run check`: bagian `check-report-insights.cjs` lulus (setelah `report-logic/package.json` dibuat CommonJS). `check-garuda-refresh.cjs` masih gagal karena mencocokkan teks data di HTML lama; ini isu data/legacy, bukan kode.

## Riwayat

- **5 Nov 2026** Asset prototype dipindahkan dari `SAKnowledge2` ke folder ini.
- **Okt–Nov 2026** Migrasi ke React/Vite, Checkpoint V2, Simulasi, `ChoiceReviewModal`, rule-engine, PDF A4 2 halaman.
- **11 Nov 2026** Audit menyeluruh (tsc, build, check, tiga pembacaan kode paralel) dan perbaikan non-data `d6e1604`: redirector query, penyimpanan aman, matcher katalog dan validasi SNBT (duplikat, jenjang tak dikenal), banner delta modal, edge case engine Tahap 2/4/kelas, konfirmasi aksi reset, a11y dialog, font cetak 9px, konfigurasi dan dokumen deploy.
- **11 Nov 2026 (Fase 1 Copywriting & UI)** Penerapan panduan copywriting ber-nada lunak (soft) dan istilah tunggal "Kakak Asuh" pada `src/data/programCatalog.ts` (`getZoneFromGap` & `validateSnbtChoices`), `src/pages/SimulasiPage.tsx`, dan `src/components/ChoiceReviewModal.tsx` bersama integrasi token/komponen UI Super CMS (`Card`, `Button`, `Pill`, `Callout`, `Dialog`, `SegmentedControl`, `rg-table`). Typecheck `tsc` dan Vite production `build` lulus 100%.
- **11 Nov 2026 (Fase 2 Copywriting Halaman Report & Format Angka Simbol)** Penerapan label status subtes lunak (`Tercapai`, `Hampir 600`, `Perlu diperkuat`, `Fokus utama`), badge `Prioritas perbaikan 1–3`, header alur ringkas `Tahap 1–5`, panel edukasi `Cara membaca dua jenis skor` (`Skor per subtes` & `Skor sesuai jurusan`), pembakuan seksi panduan `Panduan Kakak Asuh`, serta standardisasi format angka selisih murni menggunakan simbol `+` dan `-` tanpa kata 'kurang', 'lebih', maupun 'poin' (misal `+40`, `-135`, `0`) di `src/pages/CheckpointV2Page.tsx`, `src/pages/SimulasiPage.tsx`, `src/components/ChoiceReviewModal.tsx`, `src/components/V2PdfModal.tsx`, dan `COPYWRITING.md`. Validasi `tsc` dan build Vite lulus 100%.

## Tindak lanjut terbuka

**Data (perlu review satu per satu):**
- Skor/gap hardcoded di `garudaData.ts` tidak cocok dengan hasil `computeSimulatedProgram` (semua basis).
- Garuda dan Nadira memiliki 3 pilihan S1, melanggar aturan SNBT 3 pilihan (maks 2 S1).
- Absensi `identity` vs `classroomData` berbeda; total TO Nadira meleset dari rata-rata subtes; Garuda "36+1+6+2" tidak sama dengan 44 sesi.
- Label zona di data tidak selaras dengan `getZoneFromGap`; ambang "reach" (-90) dan "wide" (-100) berbeda.
- Salinan `v1Data.ts` bertentangan dengan guardrail "bukan jaminan" ("sangat aman"), serta target/metadata berbeda dari katalog.
- NISN, sekolah, dan email SA ada di `garudaData.ts` (tinjau sebelum repo dipublikasikan).
- Rapor memakai satu kunci `bac_rapor_garuda` untuk semua siswa; nama mapel pendukung tidak cocok sehingga `supportAvg` 0.0.

**Keputusan produk:**
- Unduh PDF memakai file statis di `public/` (hanya Garuda dan V1). Pilih: snapshot, sembunyikan tombol untuk siswa tanpa file, atau generate dari data langsung.
- Tombol Konfirmasi di `ChoiceReviewModal` tetap aktif walau kombinasi SNBT tidak sah (hanya duplikat yang diblokir). Pertimbangkan blokir setelah data demo dirapikan.
- Rencana aksi 3 dan 4 di Tahap 4 masih teks statis.
- `outputs/` (28 MB) masih ter-track; layout cetak dengan 4 pilihan berteks panjang belum diuji (`overflow:hidden` memotong, tidak memindah halaman).

## Dokumen kerja di root

`Report Konsultasi - *.md` (draft revisi, audit copy/fungsi, pemetaan data Garuda, prioritas subtes, prompt ringkasan kelas, panduan pilot), `Learning Call * - Report Findings.md`, `Student Tower - Dummy Consultation Data.md`, dan `Sync Konsultasi Checkpoint ... 2026-11-06.md`. Script `scripts/update-*` adalah migrasi historis; jangan dijalankan ulang.

## Cara merujuk project di chat baru

> Lanjutkan proyek Brain Academy Checkpoint 1 dari folder `/Users/fa-2400/Documents/ChatGPT/Consultation Guideline & Report`. Baca `DEVLOG.md` terlebih dahulu. Jangan deploy atau push tanpa perintah eksplisit.
