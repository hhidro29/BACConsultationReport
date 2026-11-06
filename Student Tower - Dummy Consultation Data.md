# Student Tower - Synthetic Consultation Fixtures

Dummy data permanen untuk development dan pengujian chatbot konsultasi SA sekarang disimpan sebagai fixture terstruktur di folder prototype.

## Sumber Kanonis

- [Panduan fixture](</Users/fa-2400/Documents/ChatGPT/Knowledge Management/prototype/fixtures/student-tower/README.md>)
- [Data siswa sintetis](</Users/fa-2400/Documents/ChatGPT/Knowledge Management/prototype/fixtures/student-tower/students.json>)
- [Skenario percakapan dan expected behavior](</Users/fa-2400/Documents/ChatGPT/Knowledge Management/prototype/fixtures/student-tower/scenarios.json>)
- [Schema fixture](</Users/fa-2400/Documents/ChatGPT/Knowledge Management/prototype/fixtures/student-tower/schema.json>)

## Prinsip

- JSON fixture adalah sumber kanonis; hindari menyalin data yang sama ke dokumen lain.
- Identitas siswa, sekolah, persona, skor, preferensi, risiko, dan catatan bersifat sintetis. Persona memakai pola konsultasi siswa kelas 12 yang realistis untuk pengujian workflow; nama sebagian PTN/prodi memakai entitas nyata dan memiliki metadata sumber resmi. Metrik simulasi tetap bukan data penerimaan resmi.
- `students.json` memodelkan snapshot konteks siswa.
- `scenarios.json` memodelkan percakapan yang perlu diuji dan perilaku yang diharapkan.
- Expected behavior menguji kualitas proses, bukan kecocokan jawaban kata demi kata.
- Fixture dipakai untuk development, demo, dan regression checks sampai sumber data Student Tower siap.

## Cara Menambah Kasus

1. Tambahkan siswa sintetis baru ke `students.json` bila kasus membutuhkan kondisi yang berbeda.
2. Tambahkan skenario baru ke `scenarios.json` dan referensikan `student_id` yang sesuai.
3. Perbarui schema jika struktur context berubah.
4. Jangan gunakan data siswa nyata untuk mengisi fixture.
