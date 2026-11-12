# Panduan Copywriting: Laporan Konsultasi Checkpoint 1 & Simulasi SNBT

Dokumen serah-terima untuk agen atau orang lain yang melanjutkan penulisan ulang teks (copy) di proyek ini. Isinya: konteks, aturan yang tidak boleh dilanggar, masalah copy yang ditemukan, kosakata baku usulan, contoh sebelum/sesudah, lokasi string di kode, dan urutan kerja.

Status: **usulan, belum diterapkan.** Tidak ada teks di aplikasi yang sudah diubah berdasarkan dokumen ini. Semua usulan perlu disetujui pemilik proyek sebelum dikerjakan.

---

## 1. Konteks singkat

- **Produk:** Laporan konsultasi Checkpoint 1 (pasca 4 tryout UTBK) dan simulasi pilihan PTN (SNBT) untuk siswa kelas 12.
- **Tiga pembaca:**
  1. **SA / Kakak Asuh**: memandu sesi konsultasi dan membaca panduan fasilitasi.
  2. **Siswa kelas 12**: melihat posisi 8 subtes dan pilihan prodi.
  3. **Orang tua/wali**: membaca ringkasan, edukasi skor, dan lembar kesepakatan (PDF A4).
- **Stack:** React + TypeScript + Vite. Halaman utama: `src/pages/CheckpointV2Page.tsx` (5 tahap), `src/pages/SimulasiPage.tsx`, `src/components/ChoiceReviewModal.tsx`, PDF A4 di `src/components/V2PdfModal.tsx`.
- **Gaya visual:** mengikuti Super CMS Ruangguru (lihat `reference-super-cms-profiling.html`). Struktur informasi (IA) **tidak diubah**; yang dirapikan hanya tampilan dan teks.

## 2. Aturan yang tidak boleh dilanggar

1. **Jangan deploy.** Jangan `git push origin main` atau `npm run deploy` kecuali pemilik proyek eksplisit menyuruh "deploy". Commit lokal hanya jika diminta.
2. **Tanpa AI / tanpa black-box.** Semua panduan SA dihasilkan rule-engine deterministik di `src/utils/saGuidelineEngine.ts`. Copy yang ditulis di sana harus berupa **template statis** dengan placeholder (`{count}`, `{limit}`), bukan teks yang dibangkitkan model.
3. **Catatan pengajar ditampilkan verbatim** (Tahap 4). Jangan diparafrase atau dirapikan.
4. **Guardrail "bukan jaminan" harus tetap ada.** Target acuan adalah benchmark internal Ruangguru, bukan passing grade resmi SNPMB dan bukan jaminan lolos. Boleh dipersingkat, tidak boleh dihilangkan.
5. **PDF A4 harus tetap 2 halaman tanpa overflow** (210×297mm, font minimum 9px). Teks yang lebih panjang di bagian PDF berisiko memotong konten karena tinggi halaman dikunci dan `overflow:hidden`. Setelah mengubah copy PDF, ukur ulang `scrollHeight` vs `clientHeight` untuk 3 siswa (garuda, nadira, rizky).
6. **Jangan mengubah angka, ambang, atau logika** saat menulis ulang label. Contoh: batas zona -30 / -90 tetap.

## 3. Masalah copy yang ditemukan

1. **Satu konsep, banyak nama.**
   - "Selisih", "gap", "poin" dipakai bergantian.
   - "Target Acuan" kadang jadi "Acuan".
   - "Pilihan" kadang jadi "Pil.".
   - "Jurusan", "prodi", "program studi" tercampur.
   - "Tryout" dan "TO" tercampur.
   - "SA", "Smart Advisor", "Kakak Asuh" muncul bersamaan.
2. **Format angka tidak seragam.** Ada "81.8%" dan "5.36%" berdampingan dengan "540,5" dan "-51,5". Bahasa Indonesia memakai koma desimal.
3. **Kapitalisasi tidak konsisten.** Sebagian judul Title Case ("Panduan Edukasi Orang Tua: Cara Membaca Dua Sistem Skor"), sebagian huruf kecil.
4. **Label yang terdengar menghakimi untuk orang tua.** "Terendah #1", "Butuh Peningkatan", "Butuh Peningkatan Signifikan", "Ambisius / Jauh", "PRIORITAS UTAMA".
5. **Jargon tanpa padanan sederhana** di bagian yang dibaca orang tua: IRT, TMB, SA, pembobot, keketatan.
6. **Kalimat panjang**, terutama pesan validasi SNBT dan catatan rambu.
7. **Emoji di judul** (sebagian sudah dihapus di mockup baru; lihat bagian 8).

## 4. Prinsip penulisan

- **Satu kosakata baku** (bagian 5).
- **Tiga lapisan pembaca:** angka dan label singkat untuk semua; penjelasan sederhana untuk orang tua; arahan fasilitasi untuk SA. Jangan campur ketiganya dalam satu kalimat.
- **Bingkai tindakan, bukan kekurangan.** Sebut apa yang bisa dilakukan, bukan seberapa rendah.
- **Netral dan tidak menjanjikan.** Jangan menyiratkan kepastian lolos atau gagal.
- **Kalimat aktif, satu ide per kalimat.** Tombol berupa kata kerja ("Pilih", "Hapus pilihan").
- **Huruf besar hanya di awal kalimat** untuk judul dan label. Singkatan resmi (UTBK, SNBT, PTN) tetap kapital.
- **Angka:** koma desimal (`81,8%`, `540,5`), pemisah ribuan titik bila ada, tanda minus "-" atau "+" konsisten. Selisih ditulis langsung dengan simbol tanda tambah/kurang tanpa kata "poin": `+40`, `-135`, `0` (jangan gunakan kata 'kurang', 'lebih', atau 'poin').

## 5. Kosakata baku (usulan)

| Konsep | Pakai | Hindari |
|---|---|---|
| Ujian latihan | Tryout (TO 1–4) | campuran "TO" dan "Tryout" dalam satu kalimat |
| Program studi | program studi (teks panjang), prodi (tabel/tombol), jurusan (teks untuk orang tua) | memakai ketiganya tanpa pola |
| Jarak ke target | "+N" / "-N" (mis. `+40`, `-135`) | kata "kurang N poin", "lebih N poin", "gap", "poin" di antarmuka |
| Skor terbobot | "skor sesuai jurusan" (keterangan kecil: skor IRT terbobot) | "skor IRT terbobot" sebagai judul |
| Skor reguler | "skor per subtes" (keterangan kecil: skor IRT reguler) | "skor IRT reguler" sebagai judul |
| Pendamping | pilih satu: **Kakak Asuh** (untuk siswa/orang tua), **SA** (internal) | "Smart Advisor" tanpa penjelasan |
| Benchmark | "target acuan internal" | "passing grade" tanpa kata "bukan" |
| Pilihan | "Pilihan 1" | "Pil. 1" |

## 6. Contoh sebelum dan sesudah

| Sekarang | Usulan | Catatan |
|---|---|---|
| Terendah #1 | Prioritas perbaikan 1 | Badge pada tabel 8 subtes (prioritas 1 s.d. 3) |
| PRIORITAS UTAMA | Fokus utama | Status subtes (selisih ≤ -91) |
| PERLU DITINGKATKAN | Perlu diperkuat | Selisih -31 s.d. -90 |
| MENDEKATI 600 | Hampir 600 | Selisih -1 s.d. -30 |
| TERCAPAI | Tercapai | Selisih ≥ 0 |
| Realistis / Tercapai | Sudah tercapai | Zona prodi |
| Mendekati Target | Hampir tercapai | Zona prodi, -1 s.d. -30 |
| Target Bertahap | Dicapai bertahap | Zona prodi, -31 s.d. -90 |
| Ambisius / Jauh | Perlu usaha besar | Zona prodi, < -90 |
| Butuh Peningkatan Signifikan | Perlu peningkatan besar | `statusText` zona terjauh |
| Selisih: -135 | -135 | Tabel subtes & jarak target |
| Fondasi 600 & Evaluasi Skor IRT Reguler | Kemampuan dasar di 8 subtes | Judul Tahap 1 |
| Skor IRT Reguler / Skor IRT Terbobot | Skor per subtes / Skor sesuai jurusan | Panel edukasi skor |
| Panduan Edukasi Orang Tua: Cara Membaca Dua Sistem Skor | Cara membaca dua jenis skor | Judul panel |
| Untuk 3 pilihan SNBT 2026, maksimal hanya boleh 2 S1. Ganti salah satu slot ke Vokasi (D4/D3) atau kurangi menjadi 2 pilihan. | Pilihan belum sah: dengan 3 pilihan, maksimal 2 S1. Ganti satu ke D4/D3, atau pakai 2 pilihan. | Pesan validasi SNBT |
| Angka target acuan dan posisi peringkat di atas merupakan benchmark peserta internal Ruangguru (bukan passing grade resmi SNPMB atau jaminan kelolosan personal). | Target ini acuan internal Ruangguru, bukan passing grade resmi dan bukan jaminan lolos. | Disclaimer Simulasi |
| Kompetisi & Lokasi | Peminat dan lokasi | Kepala kolom tabel katalog |
| Aksi (Fokus Pil. 1) | Untuk Pilihan 1 | Kepala kolom tabel katalog |
| Slot Alternatif #1 | Alternatif 1 | Meja bandingkan |

> Catatan: usulan di atas adalah titik awal. Beberapa label (misalnya "Fokus 1", "Perlu usaha besar") belum diuji ke SA atau orang tua. Pemilik proyek perlu memutuskan apakah label tegas seperti "Ambisius / Jauh" memang sengaja dipertahankan.

## 7. Lokasi string di kode

Mengubah label sering berarti menyentuh lebih dari satu tempat. Cek semuanya sebelum mengganti.

| Jenis teks | Lokasi |
|---|---|
| Template panduan SA Tahap 1–4 (pola tryout, Tahap 2, Tahap 3, Tahap 4, kelas) | `src/utils/saGuidelineEngine.ts`: `DEFAULT_ENGINE_CONFIG` (kira-kira baris 92–268), beberapa kalimat dibentuk langsung di fungsi `analyzeStage1`…`analyzeStageClassroom` |
| Template yang bisa diubah SA lewat halaman Engine | `/engine` (`EngineMatrixPage.tsx`), disimpan di localStorage `bac_sa_engine_config_v1`. Perubahan default di kode **tidak menimpa** konfigurasi yang sudah tersimpan di browser pengguna. |
| Label status subtes (TERCAPAI / MENDEKATI 600 / PERLU DITINGKATKAN / PRIORITAS UTAMA) | `getSubtestStatus` di `CheckpointV2Page.tsx` **dan** field `status` yang di-hardcode di `src/data/garudaData.ts` (tipe literal di baris 12) **dan** badge di `V2PdfModal.tsx` |
| Label zona prodi dan `statusText` | `getZoneFromGap` di `src/data/programCatalog.ts`, juga dipakai tema warna di `SimulasiPage.tsx` (`getZoneTheme`) dan `ChoiceReviewModal.tsx` |
| Pesan validasi SNBT | `validateSnbtChoices` di `programCatalog.ts` |
| Judul dan label halaman | Langsung di JSX: `CheckpointV2Page.tsx`, `SimulasiPage.tsx`, `ChoiceReviewModal.tsx`, `UpdateRaporPage.tsx`, `CheckpointV1Page.tsx` + `src/data/v1Data.ts` (salinan lama) |
| Teks PDF A4 | `V2PdfModal.tsx`, `V1PdfModal.tsx` |
| Dialog konfirmasi | `window.confirm` di `CheckpointV2Page.tsx`, `UpdateRaporPage.tsx`, `EngineMatrixPage.tsx`; komponen `Dialog` di `SimulasiPage.tsx` |

## 8. Hal terkait yang sudah/sedang berjalan

- **Redesain UI bertahap** (gaya Super CMS, IA tidak berubah):
  - Mockup statis: folder `mockups/` (`tahap1-v2.html`, `simulasi.html`). Badge "TAHAP 1 DARI 5" sudah dipersingkat menjadi "Tahap 1".
  - Token dan komponen dasar: `src/styles/ui.css` dan `src/components/ui/`.
  - `SimulasiPage.tsx` sebagian sudah dimigrasi. Checkpoint V2 belum.
- **Daftar tindak lanjut data** ada di `DEVLOG.md` (bagian "Tindak lanjut terbuka"). Ini terpisah dari copywriting, tapi beberapa copy yang bertentangan dengan guardrail ada di sana (mis. salinan v1 yang menyebut "sangat aman").
- **Jangan menyentuh isi data siswa** (skor, gap, absensi) saat menulis ulang copy. Pemilik proyek sedang meninjaunya satu per satu.

## 9. Urutan kerja yang disarankan

1. **Putuskan nada label** bersama pemilik proyek: apakah label tegas ("Ambisius / Jauh", "PRIORITAS UTAMA") sengaja dipertahankan, atau dilunakkan.
2. **Finalkan kosakata baku** (bagian 5) dan aturan angka.
3. **Susun daftar string lengkap** per halaman (Tahap 1–5, Simulasi, modal, dialog, PDF) dalam tabel: lokasi file, teks sekarang, teks usulan, pembaca (SA/siswa/orang tua).
4. **Terapkan bertahap**, satu halaman per langkah, bersamaan dengan migrasi UI halaman itu: Simulasi, `ChoiceReviewModal`, lalu Checkpoint V2 per tahap.
5. **Setelah tiap langkah:** `npx tsc --noEmit`, `npm run build`, cek visual di lebar 1280 dan 1024, dan untuk teks PDF ukur ulang overflow.
6. **Tulis ulang template engine terakhir**, karena berdampak ke konfigurasi tersimpan pengguna. Beri catatan bahwa pengguna yang pernah mengubah aturan di `/engine` perlu "Reset ke default" untuk melihat teks baru.

## 10. Keputusan dan tindak lanjut terbuka

### Sudah diputuskan:
- **Nada label status:** Diputuskan **Lunak (Soft)** — e.g. "Perlu usaha besar" (bukan "Ambisius / Jauh"), "Fokus utama" (bukan "PRIORITAS UTAMA"), "Perlu diperkuat" (bukan "PERLU DITINGKATKAN"), "Hampir 600" (bukan "MENDEKATI 600"), "Sudah tercapai" (bukan "Realistis / Tercapai").
- **Istilah baku pendamping:** Diputuskan **Kakak Asuh** untuk seluruh teks antarmuka yang dibaca siswa, orang tua, maupun panduan fasilitasi. (SA hanya sebagai singkatan teknis/internal kode bila diperlukan).
- **Label box panduan fasilitasi:** Diputuskan **Panduan Kakak Asuh** (bukan "Tugas fasilitasi Kakak Asuh").
- **Badge subtes terlemah:** Diputuskan **Prioritas perbaikan 1**, **Prioritas perbaikan 2**, **Prioritas perbaikan 3** (bukan "Fokus 1" atau "Terendah #1").
- **Format selisih:** Gunakan **hanya simbol plus minus dan angka** (`+40`, `-135`, `0`), **tanpa kata 'kurang', 'lebih', atau 'poin'**.
- **Fase 1 diterapkan:** Halaman Simulasi (`SimulasiPage.tsx`), modal peninjauan (`ChoiceReviewModal.tsx`), dan fungsi katalog (`programCatalog.ts`: `getZoneFromGap` & `validateSnbtChoices`) telah dimigrasikan menggunakan komponen UI baru dan copy baku soft.

### Masih terbuka:
- Apakah istilah teknis (IRT, TMB) cukup dijelaskan sekali di panel edukasi, atau perlu tooltip di setiap kemunculan.
- Apakah copy PDF dan copy layar harus identik atau boleh berbeda (PDF lebih formal dan ringkas karena ruang terbatas).
