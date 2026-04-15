# Start Project — LTU Bot

Panduan ini menjelaskan cara menjalankan proyek `ChatBot` di laptop lain.

## 1. Ringkasan

Proyek ini adalah aplikasi web statis:

- `index.html` sebagai entry point
- `css/style.css` untuk styling
- `js/app.js`, `js/minimax.js`, dan `js/data.js` untuk logic dan integrasi MiniMax API

Aplikasi menggunakan **MiniMax API** untuk kemampuan AI. Tidak ada Ollama atau Docker.

> Tidak ada dependensi Node.js atau `npm install` yang dibutuhkan untuk aplikasi front-end ini.

## 2. Prasyarat

Laptop lain harus memiliki:

- Browser modern (Chrome, Edge, Firefox)
- Koneksi internet (untuk mengakses MiniMax API)
- API key MiniMax (daftar di https://api.minimax.chat)

## 3. Cara menjalankan

### Method A: Live Server (Direkomendasikan)

1. Buka folder proyek `ChatBot`.
2. Jalankan Live Server:

```bash
npx serve . -p 3000
```

3. Buka browser ke `http://localhost:3000`

4. Masukkan API key MiniMax di panel sidebar tab **"API"**

### Method B: Langsung buka file

1. Klik dua kali file `index.html`
2. Masukkan API key di panel sidebar tab **"API"**

> Catatan: Untuk menghindari masalah CORS, gunakan Live Server.

## 4. Struktur file penting

```
ChatBot/
├── index.html
├── css/style.css
├── js/data.js
├── js/minimax.js
├── js/app.js
├── CLAUDE.md
├── README.md
└── start.md
```

## 5. Troubleshooting umum

- `API Key Needed`: Masukkan API key di tab "API" di panel sidebar
- `API Error`: Periksa apakah API key valid dan koneksi internet aktif
- `CORS error`: Jalankan lewat Live Server (`npx serve . -p 3000`)
- `Demo Mode`: Jika belum ada API key, chatbot akan gunakan mode demo

## 6. Tips untuk laptop lain

- Copy seluruh folder `ChatBot` ke laptop yang baru
- Pastikan browser sudah terpasang
- Daftar API key di https://api.minimax.chat jika belum punya
- Masukkan API key di tab "API" sebelum menggunakan chatbot

---

Selamat menjalankan proyek LTU Bot!