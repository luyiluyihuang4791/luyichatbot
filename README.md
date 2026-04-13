# LTU Bot — FAQ Kampus Cerdas 🎓

Aplikasi web chatbot FAQ kampus berbasis AI menggunakan model lokal **Ollama** dengan model `qwen3:4b-instruct`. Didesain khusus untuk membantu mahasiswa dan calon mahasiswa menemukan informasi seputar kampus dengan cepat dan akurat.

---

## ✨ Fitur Utama

- 💬 **Panel chat** interaktif dengan auto-scroll dan riwayat percakapan
- 📝 **System prompt** yang bisa diedit langsung dari UI
- 🧠 **Memory kampus** berbasis JSON yang dapat dikustomisasi
- ⚙️ **Konfigurasi model** (temperature, top_p, context length) via form
- 🔍 **Generator request body** untuk preview payload ke Ollama
- 📋 **Tombol copy** untuk prompt, memory, dan request body
- ⚡ **Quick questions** — klik untuk otomatis mengisi input
- 🔌 **Mock mode** — tetap bisa didemo meski Ollama tidak aktif
- 📱 **Responsif** — layout 2 kolom di desktop, stacked di mobile
- 🌐 **Status indikator** koneksi Ollama real-time

---

## 🗂️ Struktur File

```
ChatBot/
├── index.html          # Single-page app (entry point)
├── css/
│   └── style.css       # Stylesheet utama (design system)
├── js/
│   ├── data.js         # System prompt & campus memory default
│   ├── ollama.js       # Modul integrasi API Ollama + error handling
│   └── app.js          # Logic UI, state, event handler
└── README.md           # Dokumentasi ini
```

---

## 🚀 Cara Menjalankan

### Prasyarat

1. **Ollama** terinstall di komputer kamu
   - Download: [https://ollama.ai](https://ollama.ai)
2. Model `qwen3:4b-instruct` sudah di-download

### Langkah Setup

```bash
# 1. Download model (hanya sekali)
ollama pull qwen3:4b-instruct

# 2. Jalankan Ollama server
ollama serve
```

### Buka Aplikasi

Cukup buka file `index.html` di browser:

```
# Windows
start index.html

# Atau drag-drop file index.html ke browser
```

> ⚠️ **Catatan CORS**: Jika mengalami error CORS saat mengakses Ollama dari browser, jalankan dengan `live server` atau tambahkan environment variable:
>
> ```
> OLLAMA_ORIGINS=* ollama serve
> ```

### Alternatif: Gunakan Live Server (Rekomendasi)

```bash
# Jika menggunakan VS Code, install ekstensi "Live Server"
# Klik kanan index.html → "Open with Live Server"

# Atau gunakan npx serve:
npx serve . -p 3000
# Buka: http://localhost:3000
```

---

## 🔧 Konfigurasi

Semua konfigurasi dapat diubah langsung dari panel sidebar kanan:

| Tab         | Isi                                               |
| ----------- | ------------------------------------------------- |
| **Prompt**  | System prompt FAQ kampus (bisa diedit)            |
| **Memory**  | Data kampus dalam format JSON                     |
| **Model**   | Endpoint, nama model, temperature, top_p, num_ctx |
| **Request** | Preview & copy request body ke Ollama             |

### Konfigurasi Default

```json
{
  "model": "qwen3:4b-instruct",
  "stream": false,
  "options": {
    "temperature": 0.1,
    "top_p": 0.9,
    "num_ctx": 8192
  }
}
```

---

## 🧠 Memory Kampus

Memory kampus berisi data JSON yang meliputi:

- 🏛️ **Profil kampus** — nama, lokasi, tahun berdiri
- 📋 **Pendaftaran** — jalur, syarat, cara daftar, kontak PMB
- 🎓 **Fakultas & Prodi** — daftar lengkap dengan akreditasi
- 💰 **Biaya pendidikan** — UKT per golongan, biaya lain
- 🎁 **Beasiswa** — KIP Kuliah, prestasi akademik, mitra
- 📚 **Layanan akademik** — KRS, transkrip, surat keterangan
- 🏋️ **Fasilitas** — akademik, penunjang, olahraga, asrama
- 📞 **Kontak** — semua unit penting dengan nomor & email
- 🕐 **Jam layanan** — jam operasional tiap unit

Klik **"Load Sample"** untuk memuat ulang data default.

---

## 🤖 Perilaku Chatbot

Chatbot dikonfigurasi untuk:

- ✅ **Hanya** menjawab pertanyaan seputar kampus
- ✅ Mengutamakan data dari memory kampus
- ✅ Jujur jika informasi tidak tersedia
- ✅ Mengarahkan ke unit yang tepat (BAAK, PMB, Keuangan, dll)
- ❌ Menolak pertanyaan di luar konteks kampus
- ❌ Tidak mengarang informasi

---

## 🛠️ Mode Demo (Offline)

Jika Ollama tidak aktif, aplikasi otomatis masuk ke **Demo Mode**:

- Status badge menunjukkan "Ollama Offline (Demo Mode)"
- Chatbot tetap menjawab berdasarkan mock data
- Cocok untuk demo UI tanpa perlu koneksi ke Ollama

---

## 🔗 Integrasi Ollama

Aplikasi menggunakan endpoint `POST /api/chat` dengan format:

```json
{
  "model": "qwen3:4b-instruct",
  "stream": false,
  "options": { "temperature": 0.1, "top_p": 0.9, "num_ctx": 8192 },
  "messages": [
    { "role": "system", "content": "...system prompt FAQ..." },
    { "role": "system", "content": "...data memory kampus JSON..." },
    { "role": "user", "content": "...pertanyaan user..." }
  ]
}
```

---

## 💡 Tips Pengembangan

1. **Ganti data kampus**: Edit `DEFAULT_CAMPUS_MEMORY` di `js/data.js`
2. **Sesuaikan system prompt**: Edit `DEFAULT_SYSTEM_PROMPT` di `js/data.js`
3. **Tambah quick questions**: Edit array `QUICK_QUESTIONS` di `js/data.js`
4. **Ganti model**: Ubah `DEFAULT_MODEL_CONFIG.model` atau lewat UI
5. **Custom styling**: Semua CSS variables ada di `css/style.css` bagian `:root`

---

## 📝 Catatan Teknis

- Tidak ada dependency eksternal (pure HTML/CSS/JS)
- Tidak menggunakan localStorage atau database
- Riwayat chat disimpan di memori browser (hilang saat refresh)
- Maximum 40 pesan dalam riwayat untuk menjaga performa
- Timeout request ke Ollama: 60 detik

---

_Dibuat dengan ❤️ untuk civitas akademika kampus_
