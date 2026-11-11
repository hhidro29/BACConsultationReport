# Deployment

Aplikasi ini adalah SPA Vite + React dengan `HashRouter`. Tidak ada backend, database, atau API key. Hasil build ada di `dist/` (folder ini tidak di-commit).

> Deploy hanya dilakukan atas instruksi eksplisit pemilik proyek. Selama pengembangan cukup commit lokal dan cek lewat preview lokal.

## Build dan cek lokal

```bash
npm install
npm run build
npm start
```

`npm start` menjalankan `vite preview` di `http://127.0.0.1:8788/` dan memerlukan `npm run build` terlebih dahulu. Alternatif tanpa Vite:

```bash
python3 -m http.server 8788 -d dist
```

`base: './'` dan `HashRouter` membuat hasil build bisa dipublish di root maupun subpath.

## GitHub Pages (script bawaan)

```bash
npm run deploy
```

Script ini menjalankan `vite build && gh-pages -d dist` dan langsung mempublikasikan ke branch `gh-pages` di remote `origin`. Jalankan hanya saat memang akan rilis.

## Vercel / Netlify

`vercel.json` dan `netlify.toml` sudah berisi build command `npm run build` dan output `dist`. Import repository, biarkan pengaturan terbaca dari file konfigurasi, lalu deploy.

## Cek sebelum publish

```bash
npx tsc --noEmit
npm run build
npm run check
```

`npm run check` memeriksa logika `report-logic/` dan snapshot HTML Garuda lama; bagian kedua dapat gagal jika teks data di HTML lama berubah.

## Catatan akses data

Semua file di `dist/` (termasuk PDF di `public/`) dapat diakses pengunjung situs. Data siswa di `src/data/` ikut ter-bundle ke JavaScript. Jangan masukkan data siswa nyata, secret, atau API key ke repository ini.
