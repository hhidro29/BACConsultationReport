# Deployment

Prototype ini adalah static site. Tidak ada backend, database, API key, atau build step yang diperlukan.

## Opsi cepat: Vercel

1. Push folder project ini ke repository GitHub.
2. Di Vercel pilih **New Project**, lalu import repository tersebut.
3. Biarkan **Framework Preset** kosong/Other.
4. Isi **Build Command** dengan kosong dan **Output Directory** dengan `.` (atau biarkan default).
5. Klik **Deploy**.

Konfigurasi header sudah tersedia di `vercel.json`.

## Opsi cepat: Netlify

1. Push folder project ini ke repository GitHub.
2. Di Netlify pilih **Add new site → Import an existing project**.
3. Pilih repository tersebut.
4. Isi **Publish directory** dengan `.` dan kosongkan build command.
5. Deploy.

Konfigurasi publish dan header sudah tersedia di `netlify.toml`.

## Cek sebelum publish

Jalankan dari folder project:

```bash
npm run check
npm start
```

Kemudian buka `http://127.0.0.1:8788/` dan cek report utama, Meeting Mode, serta simulator wording.

## Catatan akses data

File HTML prototype menyimpan data contoh dan logika runtime langsung di dalam file. Semua file yang ikut dipublish dapat diakses oleh pengunjung situs. Jangan masukkan data siswa nyata, secret, atau API key ke repository ini.
