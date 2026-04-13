# Start Project — LTU Bot

Panduan ini menjelaskan cara menjalankan proyek `ChatBot` di laptop lain.

## 1. Ringkasan

Proyek ini adalah aplikasi web statis:

- `index.html` sebagai entry point
- `css/style.css` untuk styling
- `js/app.js`, `js/ollama.js`, dan `js/data.js` untuk logic dan integrasi Ollama

Aplikasi dapat dijalankan dengan:

- `Ollama` lokal + browser
- Atau `Docker Compose` jika ingin menjalankan web dan Ollama dalam container

> Tidak ada dependensi Node.js atau `npm install` yang dibutuhkan untuk aplikasi front-end ini.

## 2. Prasyarat

Laptop lain harus memiliki salah satu dari berikut:

- Browser modern (Chrome, Edge, Firefox)
- Ollama terpasang dan model tersedia
- Atau Docker Desktop jika ingin menggunakan Docker Compose

### 2.1. Ollama

Jika Anda ingin menggunakan kemampuan AI sesungguhnya, install Ollama:

- Download dari: https://ollama.ai

Kemudian download model default yang digunakan proyek:

```bash
ollama pull qwen3:4b-instruct
```

## 3. Cara menjalankan (Metode A): Local browser + Ollama

1. Buka folder proyek `ChatBot`.
2. Jalankan Ollama:

```bash
ollama serve
```

3. Buka `index.html` di browser:

- Klik dua kali file `index.html`
- Atau jalankan di Windows:

```powershell
start index.html
```

4. Pada panel `Model` di aplikasi, pastikan `Ollama Base URL` diatur ke:

```
http://localhost:11434
```

5. Mulai tanya dalam kotak chat.

### Catatan

- Jika Ollama tidak dapat dijangkau, aplikasi akan otomatis masuk `Demo Mode`.
- Untuk menghindari masalah CORS, jalankan file lewat Live Server atau gunakan Docker.

## 4. Cara menjalankan (Metode B): Docker Compose

Jika laptop lain memiliki Docker Desktop, gunakan Docker Compose untuk menyalakan aplikasi web dan Ollama bersamaan.

1. Buka folder proyek.
2. Jalankan:

```bash
docker compose up --build
```

3. Akses aplikasi di browser:

```
http://localhost:8080.
```

### Catatan penting

- `docker-compose.yml` sudah mengatur service `web` dan `ollama`.
- Service `web` melayani static site lewat Nginx.
- Service `ollama` membuka port `11434`.
- Jika laptop tidak punya GPU, sesuaikan pengaturan Docker Compose dengan menghapus atau mengomentari bagian `deploy.resources.reservations.devices`.

## 5. Struktur file penting

```
ChatBot/
├── index.html
├── css/style.css
├── js/data.js
├── js/ollama.js
├── js/app.js
├── Dockerfile
├── docker-compose.yml
└── start.md
```

## 6. Troubleshooting umum

- `Model not found`: jalankan `ollama pull qwen3:4b-instruct`
- `Cannot connect`: pastikan Ollama serve aktif di `localhost:11434`
- `CORS error`: jalankan lewat Live Server atau gunakan Docker
- `Demo Mode`: artinya aplikasi tidak menemukan Ollama, tetapi UI tetap bisa dilihat

## 7. Tips untuk laptop lain

- Copy seluruh folder `ChatBot` ke laptop yang baru
- Pastikan browser sudah terpasang
- Jika ingin menggunakan Ollama, install Ollama dan download model yang sama
- Jika ingin cepat demo, buka `index.html` langsung dan gunakan mode offline jika Ollama belum tersedia

---

Selamat menjalankan proyek LTU Bot di laptop lain!
