// ============================================================
// ollama.js — Modul integrasi API Ollama
// ============================================================

// ─── Smart Memory Filter ──────────────────────────────────

/**
 * Menyaring campus memory agar hanya bagian yang relevan dengan pertanyaan
 * yang dikirimkan ke model. Ini menghemat token secara drastis.
 *
 * @param {object} memory       - Full campus memory object
 * @param {string} userMessage  - Pertanyaan user
 * @returns {object} Subset memory yang relevan
 */
function filterCampusMemory(memory, userMessage) {
  const msg = userMessage.toLowerCase();
  const result = { kampus: memory.kampus }; // Selalu sertakan info dasar kampus

  // Mapping keyword → key di campus memory
  const sections = [
    {
      keys: ["daftar", "pendaftaran", "registrasi", "pmb", "syarat", "jalur"],
      field: "pendaftaran",
    },
    {
      keys: ["biaya", "ukt", "spp", "bayar", "keuangan", "golongan"],
      field: "biaya_pendidikan",
    },
    { keys: ["beasiswa", "kip", "bantuan", "keringanan"], field: "beasiswa" },
    {
      keys: [
        "prodi",
        "jurusan",
        "program",
        "studi",
        "fakultas",
        "informatika",
        "manajemen",
        "akuntansi",
        "sipil",
        "elektro",
        "sistem informasi",
      ],
      field: "fakultas_dan_prodi",
    },
    {
      keys: [
        "krs",
        "akademik",
        "nilai",
        "transkip",
        "surat keterangan",
        "baak",
        "ips",
        "ipk",
        "semester",
        "skripsi",
      ],
      field: "layanan_akademik",
    },
    {
      keys: [
        "fasilitas",
        "lab",
        "perpustakaan",
        "wifi",
        "kantin",
        "masjid",
        "sport",
        "asrama",
        "gym",
        "kolam",
      ],
      field: "fasilitas",
    },
    {
      keys: ["kontak", "telepon", "email", "hubungi", "bagian"],
      field: "kontak_penting",
    },
    {
      keys: ["jam", "buka", "tutup", "layanan", "operasional"],
      field: "jam_layanan_kampus",
    },
    {
      keys: ["kalender", "jadwal", "uts", "uas", "ujian", "libur", "akademik"],
      field: "kalender_akademik",
    },
    {
      keys: ["ukm", "kegiatan", "organisasi", "ormawa", "hima", "ekskul"],
      field: "unit_kegiatan_mahasiswa",
    },
  ];

  let matched = false;
  for (const section of sections) {
    if (section.keys.some((k) => msg.includes(k))) {
      if (memory[section.field]) {
        result[section.field] = memory[section.field];
        matched = true;
      }
    }
  }

  // Jika tidak ada keyword spesifik, kirim semua (kurangi detail)
  if (!matched) {
    return memory;
  }

  return result;
}

// ─── Message Builder ───────────────────────────────────────

/**
 * Membangun array messages untuk request ke Ollama.
 * Format: system (prompt) + system (memory) + riwayat chat + user message
 *
 * @param {string} systemPrompt - System prompt FAQ kampus
 * @param {object} campusMemory - Object memory kampus
 * @param {Array}  chatHistory  - Riwayat percakapan [{role, content}]
 * @param {string} userMessage  - Pesan terbaru dari user
 * @returns {Array} Array messages siap dikirim ke Ollama
 */
function buildMessages(systemPrompt, campusMemory, chatHistory, userMessage) {
  const messages = [];

  // System prompt utama
  messages.push({
    role: "system",
    content: systemPrompt.trim(),
  });

  // Smart filter: hanya sertakan bagian memory yang relevan dengan pertanyaan
  // Ini menghemat token secara drastis (dari ~3000 menjadi ~300-600 token)
  if (campusMemory) {
    const relevantMemory = filterCampusMemory(campusMemory, userMessage);
    messages.push({
      role: "system",
      content: `DATA_KAMPUS:${JSON.stringify(relevantMemory)}`,
    });
  } else {
    // Mode testing: tanpa memory
    messages.push({
      role: "system",
      content: `[OLLAMA RUNNING WITHOUT CAMPUS MEMORY DATA FOR TESTING]`,
    });
  }

  // Riwayat percakapan (konteks conversational)
  for (const msg of chatHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Pesan terbaru user
  messages.push({
    role: "user",
    content: userMessage.trim(),
  });

  return messages;
}

/**
 * Membangun request body lengkap untuk Ollama /api/chat.
 *
 * @param {string}  model    - Nama model (e.g., "qwen3:4b-instruct")
 * @param {object}  options  - Parameter model (temperature, top_p, dll)
 * @param {boolean} stream   - Apakah menggunakan streaming
 * @param {Array}   messages - Array messages dari buildMessages()
 * @returns {object} Request body siap dikirim
 */
function buildRequestBody(model, options, stream, messages) {
  return {
    model: model,
    stream: stream,
    options: {
      temperature: parseFloat(options.temperature) || 0.1,
      top_p: parseFloat(options.top_p) || 0.9,
      num_ctx: parseInt(options.num_ctx) || 4096,
    },
    messages: messages,
  };
}

// ─── STREAMING MODE ────────────────────────────────────────

/**
 * Mengirim request ke Ollama API dengan STREAMING.
 * Token diterima secara bertahap dan di-callback ke onToken().
 *
 * @param {string}   endpoint    - URL endpoint Ollama /api/chat
 * @param {object}   requestBody - Request body dari buildRequestBody()
 * @param {Function} onToken     - Callback(token, fullContent) per token baru
 * @param {Function} onComplete  - Callback(fullContent) saat selesai
 * @returns {Promise<string>}    - Full content setelah streaming selesai
 */
async function sendToOllamaStream(endpoint, requestBody, onToken, onComplete) {
  let response;

  // Paksa stream: true
  const streamBody = { ...requestBody, stream: true };

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(streamBody),
      // Timeout 10 menit — cukup untuk model loading + prompt eval + thinking
      signal: AbortSignal.timeout(600000),
    });
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      throw new OllamaError(
        "timeout",
        "Request timeout setelah 5 menit. Model mungkin tidak merespons.",
      );
    }
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new OllamaError(
        "connection",
        "Tidak dapat terhubung ke Ollama. Pastikan Ollama berjalan di " +
          endpoint,
      );
    }
    throw new OllamaError("network", `Error jaringan: ${err.message}`);
  }

  // Handle HTTP error
  if (!response.ok) {
    let errorBody = "";
    try {
      const errJson = await response.json();
      errorBody = errJson.error || JSON.stringify(errJson);
    } catch {
      errorBody = await response.text().catch(() => "");
    }

    if (response.status === 404) {
      throw new OllamaError(
        "model_not_found",
        `Model "${requestBody.model}" tidak ditemukan. Jalankan: ollama pull ${requestBody.model}`,
      );
    }
    if (response.status === 500) {
      throw new OllamaError(
        "server_error",
        `Ollama server error: ${errorBody}`,
      );
    }
    throw new OllamaError(
      "http_error",
      `HTTP ${response.status}: ${errorBody}`,
    );
  }

  // Baca response sebagai stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Proses baris-baris JSON yang lengkap
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Simpan baris terakhir yang mungkin belum lengkap

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const data = JSON.parse(trimmed);
          const token = data?.message?.content;

          if (token) {
            fullContent += token;
            onToken(token, fullContent);
          }

          if (data.done) {
            onComplete(fullContent);
            return fullContent;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Proses sisa buffer
  if (buffer.trim()) {
    try {
      const data = JSON.parse(buffer.trim());
      const token = data?.message?.content;
      if (token) {
        fullContent += token;
        onToken(token, fullContent);
      }
    } catch {
      /* ignore */
    }
  }

  onComplete(fullContent);
  return fullContent;
}

// ─── NON-STREAMING FALLBACK ────────────────────────────────

/**
 * Mengirim request ke Ollama API (non-streaming / fallback).
 * Timeout diperpanjang ke 5 menit.
 *
 * @param {string} endpoint    - URL endpoint Ollama
 * @param {object} requestBody - Request body dari buildRequestBody()
 * @returns {Promise<string>}  - Jawaban dari model
 */
async function sendToOllama(endpoint, requestBody) {
  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(300000), // 5 menit
    });
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      throw new OllamaError(
        "timeout",
        "Request timeout setelah 5 menit. Model mungkin sedang memuat atau sibuk.",
      );
    }
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new OllamaError(
        "connection",
        "Tidak dapat terhubung ke Ollama. Pastikan Ollama berjalan di " +
          endpoint,
      );
    }
    throw new OllamaError("network", `Error jaringan: ${err.message}`);
  }

  if (!response.ok) {
    let errorBody = "";
    try {
      const errJson = await response.json();
      errorBody = errJson.error || JSON.stringify(errJson);
    } catch {
      errorBody = await response.text().catch(() => "");
    }

    if (response.status === 404) {
      throw new OllamaError(
        "model_not_found",
        `Model "${requestBody.model}" tidak ditemukan. Jalankan: ollama pull ${requestBody.model}`,
      );
    }
    if (response.status === 500) {
      throw new OllamaError(
        "server_error",
        `Ollama server error: ${errorBody}`,
      );
    }
    throw new OllamaError(
      "http_error",
      `HTTP ${response.status}: ${errorBody}`,
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new OllamaError("parse_error", "Gagal membaca response dari Ollama.");
  }

  const content =
    data?.message?.content || data?.choices?.[0]?.message?.content || null;

  if (!content) {
    throw new OllamaError(
      "empty_response",
      "Ollama mengembalikan response kosong. Coba lagi.",
    );
  }

  return content;
}

// ─── STATUS CHECKS ─────────────────────────────────────────

/**
 * Mengecek apakah Ollama aktif dengan request ringan ke /api/tags.
 *
 * @param {string} baseUrl - Base URL Ollama (e.g., "http://localhost:11434")
 * @returns {Promise<{ok: boolean, models: string[]}>}
 */
async function checkOllamaStatus(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, models: [] };
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    return { ok: true, models };
  } catch {
    return { ok: false, models: [] };
  }
}

/**
 * Mengecek apakah model sudah di-load ke VRAM via /api/ps.
 * Model yang sudah loaded = siap menjawab tanpa delay loading.
 *
 * @param {string} baseUrl    - Base URL Ollama (e.g., "http://localhost:11434")
 * @param {string} modelName  - Nama model yang dicek (e.g., "qwen3:4b-instruct")
 * @returns {Promise<boolean>} - true jika model sudah loaded di memori
 */
async function checkModelReady(baseUrl, modelName) {
  try {
    const res = await fetch(`${baseUrl}/api/ps`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const loadedModels = data.models || [];
    // Cek apakah nama model cocok (partial match untuk handle tag seperti :latest)
    return loadedModels.some((m) => {
      const name = m.name || m.model || "";
      return name === modelName || name.startsWith(modelName.split(":")[0]);
    });
  } catch {
    return false;
  }
}

// ─── ERROR HANDLING ────────────────────────────────────────

/**
 * Custom Error class untuk error Ollama dengan type classification.
 */
class OllamaError extends Error {
  constructor(type, message) {
    super(message);
    this.name = "OllamaError";
    this.type = type;
  }
}

/**
 * Mendapatkan pesan bantuan berdasarkan tipe error Ollama.
 *
 * @param {OllamaError} err
 * @returns {string} Pesan error yang user-friendly
 */
function getOllamaErrorHelp(err) {
  const helps = {
    connection: `⚠️ Ollama tidak berjalan.\n\n**Cara memulai Ollama:**\n1. Buka terminal\n2. Jalankan: \`ollama serve\`\n3. Pastikan berjalan di port 11434`,
    model_not_found: `⚠️ ${err.message}\n\n**Download model:**\n\`ollama pull llama3.2:3b\``,
    timeout: `⏱️ ${err.message}\n\nModel mungkin sedang loading ke VRAM. Coba kirim ulang pertanyaan.`,
    server_error: `🔴 ${err.message}`,
    parse_error: `⚠️ ${err.message}`,
    empty_response: `⚠️ ${err.message}`,
    http_error: `🔴 ${err.message}`,
  };
  return helps[err.type] || `❌ Error: ${err.message}`;
}

// ─── MOCK MODE ─────────────────────────────────────────────

/**
 * MOCK MODE — Fallback jika Ollama tidak aktif.
 * Memberikan jawaban demo dari data yang ada.
 *
 * @param {string} userMessage  - Pesan user
 * @param {object} campusMemory - Memory kampus
 * @returns {string} Jawaban mock
 */
function getMockResponse(userMessage, campusMemory) {
  const msg = userMessage.toLowerCase();
  const kampus = campusMemory?.kampus;
  const pendaftaran = campusMemory?.pendaftaran;
  const beasiswa = campusMemory?.beasiswa;

  if (msg.includes("syarat") && msg.includes("daftar")) {
    const syarat =
      pendaftaran?.syarat_umum?.join("\n• ") || "Informasi tidak tersedia";
    return `**Syarat Pendaftaran ${kampus?.nama || "Kampus"}:**\n\n• ${syarat}\n\n📞 Info lebih lanjut: Hubungi PMB di ${pendaftaran?.kontak_pmb?.whatsapp || "-"}`;
  }

  if (msg.includes("biaya") && msg.includes("daftar")) {
    const biaya = pendaftaran?.biaya_pendaftaran;
    return `**Biaya Pendaftaran:**\n\n• Jalur Prestasi: ${biaya?.jalur_prestasi || "-"}\n• Jalur Reguler: ${biaya?.jalur_reguler || "-"}\n• Jalur Transfer: ${biaya?.jalur_transfer || "-"}\n\n📞 Konfirmasi ke PMB: ${pendaftaran?.kontak_pmb?.telepon || "-"}`;
  }

  if (msg.includes("krs")) {
    const krs = campusMemory?.layanan_akademik?.krs;
    const steps = krs?.cara_pengisian?.join("\n") || "Informasi tidak tersedia";
    return `**Cara Pengisian KRS:**\n\n${steps}\n\n📞 Hubungi BAAK: ${campusMemory?.layanan_akademik?.kontak_baak?.telepon || "-"}`;
  }

  if (
    msg.includes("lokasi") ||
    msg.includes("alamat") ||
    msg.includes("di mana")
  ) {
    const lokasi = kampus?.lokasi;
    return `**Lokasi ${kampus?.nama}:**\n\n📍 ${lokasi?.alamat}, ${lokasi?.kota}, ${lokasi?.provinsi} ${lokasi?.kode_pos}\n\n🗺️ ${lokasi?.petunjuk_arah || ""}`;
  }

  if (msg.includes("beasiswa")) {
    const list =
      beasiswa?.map((b) => `• **${b.nama}** — ${b.cakupan}`).join("\n") ||
      "Informasi tidak tersedia";
    return `**Beasiswa Tersedia:**\n\n${list}\n\n📞 Hubungi Bagian Kemahasiswaan untuk detail.`;
  }

  if (
    msg.includes("prodi") ||
    msg.includes("jurusan") ||
    msg.includes("fakultas")
  ) {
    const fakultas = campusMemory?.fakultas_dan_prodi;
    const list =
      fakultas
        ?.map(
          (f) => `**${f.fakultas}:** ${f.prodi.map((p) => p.nama).join(", ")}`,
        )
        .join("\n") || "Informasi tidak tersedia";
    return `**Program Studi yang Tersedia:**\n\n${list}`;
  }

  return `🤖 *[MODE DEMO — Ollama tidak aktif]*\n\nSaya menerima pertanyaan Anda: "*${userMessage}*"\n\nUntuk jawaban lengkap, pastikan Ollama berjalan:\n\`\`\`\nollama serve\n\`\`\`\n\nUntuk saat ini, coba pertanyaan seperti:\n• Apa saja syarat pendaftaran?\n• Berapa biaya pendaftaran?\n• Bagaimana cara isi KRS?\n• Di mana lokasi kampus?\n• Apakah ada beasiswa?`;
}
