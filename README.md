# Report Konsultasi SA (Brain Academy Checkpoint 1)

Laporan konsultasi Checkpoint 1 dan simulasi pilihan PTN (SNBT) untuk Kakak Asuh / Smart Advisor, siswa kelas 12, dan orang tua. Stack: React, TypeScript, Vite, React Router (HashRouter), Lucide React.

Repository: git@github.com:hhidro29/BACConsultationReport.git

## Jalankan lokal

Memerlukan Node.js 20 atau lebih baru.

```bash
npm install
npm run dev        # dev server Vite (port 5173)
npm run build      # build produksi ke dist/
npm start          # preview hasil build di http://127.0.0.1:8788/ (jalankan build dulu)
```

## Rute

| Rute | Halaman |
|---|---|
| `/#/v2` | Checkpoint V2 (default), 5 tahap konsultasi + cetak PDF A4 |
| `/#/v1` | Checkpoint V1 (versi lama) |
| `/#/simulasi` | Simulasi 1–4 pilihan prodi SNBT |
| `/#/rapor` | Update nilai rapor |
| `/#/engine` | Matriks rule-engine dan pengaturan ambang |

Shortcut query: `/?v=2`, `/?v=simulasi&student=nadira`, `/?v=1&preview=1`.

## Struktur kode

- `src/pages/` halaman; `src/components/` modal PDF dan `ChoiceReviewModal`.
- `src/utils/saGuidelineEngine.ts` rule-engine deterministik (tanpa AI); `saRuleStore.ts` menyimpan konfigurasi aturan di localStorage; `safeStorage.ts` helper localStorage yang aman.
- `src/data/` data siswa, katalog prodi (`programCatalog.ts`), kelas, dan rapor.
- localStorage: `bac_v2_active_student_v1`, `bac_v2_custom_programs_v1`, `bac_v2_sa_notes_<id>`, `bac_v1_sa_notes`, `bac_sa_engine_config_v1`, `bac_rapor_garuda`.

## Verifikasi

```bash
npx tsc --noEmit
npm run build
npm run check
```

`npm run check` memeriksa `report-logic/` dan snapshot HTML Garuda versi lama (prototype sebelum migrasi React).

## Deployment

Lihat [DEPLOYMENT.md](DEPLOYMENT.md). Deploy hanya atas instruksi eksplisit pemilik proyek.

## Arsip prototype lama

File `Consultation Brief - *.html`, `Report Konsultasi - *.md`, `report-logic/`, `samples/`, dan `outputs/` di root adalah artefak fase prototype HTML sebelum migrasi ke React. Dipertahankan sebagai referensi; aplikasi utama ada di `src/`. Script `scripts/update-*` adalah migrasi historis, jangan dijalankan ulang.

## Pemisahan project

Dipisahkan pada 23 Oktober 2026. Manifest `project-separation.json` mencatat hash file saat dipindahkan. Dokumen Student Tower dan Student Profiling yang menjadi referensi bersama disalin; sumber chatbot tetap berada di project TestCenterKnowledgeSA. Data dan aset report ikut dalam project ini agar tautan bukti dan pemeriksaan dapat berjalan mandiri.
