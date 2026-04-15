// ============================================================
// minimax.js — Modul integrasi API MiniMax (Anthropic-compatible)
// ============================================================

// ─── Smart Memory Filter ──────────────────────────────────

function filterCampusMemory(memory, userMessage) {
  const msg = userMessage.toLowerCase();
  const result = { kampus: memory.kampus };

  const sections = [
    { keys: ["daftar", "pendaftaran", "registrasi", "pmb", "syarat", "jalur"], field: "pendaftaran" },
    { keys: ["biaya", "ukt", "spp", "bayar", "keuangan", "golongan"], field: "biaya_pendidikan" },
    { keys: ["beasiswa", "kip", "bantuan", "keringanan"], field: "beasiswa" },
    { keys: ["prodi", "jurusan", "program", "studi", "fakultas"], field: "fakultas_dan_prodi" },
    { keys: ["krs", "akademik", "nilai", "transkip", "surat keterangan", "baak"], field: "layanan_akademik" },
    { keys: ["fasilitas", "lab", "perpustakaan", "wifi", "kantin"], field: "fasilitas" },
    { keys: ["kontak", "telepon", "email", "hubungi"], field: "kontak_penting" },
    { keys: ["jam", "buka", "tutup", "layanan", "operasional"], field: "jam_layanan_kampus" },
    { keys: ["kalender", "jadwal", "uts", "uas", "ujian", "libur"], field: "kalender_akademik" },
    { keys: ["ukm", "kegiatan", "organisasi", "ormawa"], field: "unit_kegiatan_mahasiswa" },
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

  return matched ? result : memory;
}

// ─── Message Builder ────────────────────────────────────────

function buildMessages(systemPrompt, campusMemory, chatHistory, userMessage) {
  const messages = [];

  // Combine system prompt and campus memory into ONE system message
  let systemContent = systemPrompt.trim();
  if (campusMemory) {
    const relevantMemory = filterCampusMemory(campusMemory, userMessage);
    systemContent += `\n\nDATA_KAMPUS:${JSON.stringify(relevantMemory)}`;
  }
  messages.push({ role: "system", content: systemContent });

  for (const msg of chatHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: "user", content: userMessage.trim() });

  return messages;
}

// ─── Error Handling ─────────────────────────────────────────

class MiniMaxError extends Error {
  constructor(type, message) {
    super(message);
    this.name = "MiniMaxError";
    this.type = type;
  }
}

function getMiniMaxErrorHelp(err) {
  const helps = {
    connection: `⚠️ Tidak dapat terhubung ke MiniMax API.\n\nPastikan koneksi internet aktif.`,
    invalid_api_key: `⚠️ API key tidak valid.\n\nPeriksa kembali API key Anda.`,
    model_not_found: `⚠️ Model tidak ditemukan.\n\nModel: ${MINIMAX_MODEL}`,
    timeout: `⏱️ Request timeout.`,
    server_error: `🔴 MiniMax server error: ${err.message}`,
    parse_error: `⚠️ Gagal membaca response.`,
    empty_response: `⚠️ Response kosong.`,
    http_error: `🔴 HTTP error: ${err.message}`,
  };
  return helps[err.type] || `❌ Error: ${err.message}`;
}

// ─── Streaming Mode ─────────────────────────────────────────

async function sendToMiniMaxStream(apiKey, endpoint, requestBody, onToken, onComplete) {
  const streamBody = {
    model: requestBody.model || MINIMAX_MODEL,
    messages: requestBody.messages,
    stream: true,
  };

  let response;
  try {
    console.log("[MiniMax] Sending request to:", endpoint);
    console.log("[MiniMax] Request body:", JSON.stringify(streamBody, null, 2));
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(streamBody),
      signal: AbortSignal.timeout(120000),
    });
    console.log("[MiniMax] Response status:", response.status);
    console.log("[MiniMax] Response ok:", response.ok);
  } catch (err) {
    console.error("[MiniMax] Fetch error:", err);
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      throw new MiniMaxError("timeout", "Request timeout.");
    }
    if (err.name === "TypeError") {
      throw new MiniMaxError("connection", "Tidak dapat terhubung.");
    }
    throw new MiniMaxError("network", `Error: ${err.message}`);
  }

  if (!response.ok) {
    let errorBody = await response.text().catch(() => "");
    console.error("[MiniMax] HTTP error body:", errorBody);
    if (response.status === 401) {
      throw new MiniMaxError("invalid_api_key", "API key tidak valid.");
    }
    throw new MiniMaxError("http_error", `HTTP ${response.status}: ${errorBody}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let buffer = "";
  let currentEvent = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Proses SSE lines: "event: ..." atau "data: ..."
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("event:")) {
          currentEvent = trimmed.substring(6).trim();
          continue;
        }

        if (!trimmed.startsWith("data:")) continue;

        const jsonStr = trimmed.substring(5).trim();
        if (!jsonStr) continue;

        try {
          const data = JSON.parse(jsonStr);
          console.log("[MiniMax] SSE event:", data.type, "| delta type:", data.delta?.type);

          // MiniMax thinking block — skip (internal reasoning, not the actual answer)
          // Only process text_delta (the real answer)
          if (data.type === "content_block_delta" && data.delta?.type === "text_delta") {
            const text = data.delta?.text;
            if (text) {
              console.log("[MiniMax] Got text:", text.substring(0, 50));
              fullContent += text;
              onToken(text, fullContent);
            }
          }

          // Message stop
          if (data.type === "message_stop") {
            console.log("[MiniMax] Stream complete, total length:", fullContent.length);
            onComplete(fullContent);
            return fullContent;
          }
        } catch (e) {
          console.error("[MiniMax] JSON parse error:", e);
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  console.log("[MiniMax] Stream reading done, buffer:", buffer.length, "chars");

  // Process remaining buffer
  const trimmed = buffer.trim();
  if (trimmed.startsWith("data:")) {
    const jsonStr = trimmed.substring(5).trim();
    try {
      const data = JSON.parse(jsonStr);
      // Skip thinking_delta, only process text_delta
      if (data.type === "content_block_delta" && data.delta?.type === "text_delta") {
        const text = data.delta?.text;
        if (text) { fullContent += text; onToken(text, fullContent); }
      }
    } catch {}
  }

  onComplete(fullContent);
  return fullContent;
}

// ─── Status Check ────────────────────────────────────────────

async function checkMiniMaxStatus(apiKey, endpoint) {
  if (!apiKey || !apiKey.trim()) {
    return { ok: false, error: "API key kosong" };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        max_tokens: 10,
        messages: [{ role: "user", content: "test" }]
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) return { ok: true, error: null };
    if (res.status === 401) return { ok: false, error: "API key invalid" };
    return { ok: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── Request Body Builder ────────────────────────────────────

function buildMiniMaxRequestBody(model, options, messages) {
  return {
    model: model || MINIMAX_MODEL,
    messages: messages,
    max_tokens: 1024,
  };
}

// ─── Mock Mode ─────────────────────────────────────────────

function getMockResponse(userMessage, campusMemory) {
  const msg = userMessage.toLowerCase();
  const kampus = campusMemory?.kampus;
  const pendaftaran = campusMemory?.pendaftaran;
  const beasiswa = campusMemory?.beasiswa;

  if (msg.includes("syarat") && msg.includes("daftar")) {
    const syarat = pendaftaran?.syarat_umum?.join("\n• ") || "Informasi tidak tersedia";
    return `**Syarat Pendaftaran:**\n\n• ${syarat}\n\n📞 Hubungi PMB untuk info lebih lanjut.`;
  }

  if (msg.includes("biaya") && msg.includes("daftar")) {
    const biaya = pendaftaran?.biaya_pendaftaran;
    return `**Biaya Pendaftaran:**\n\n• Jalur Prestasi: ${biaya?.jalur_prestasi || "-"}\n• Jalur Reguler: ${biaya?.jalur_reguler || "-"}\n\n📞 Konfirmasi ke PMB.`;
  }

  if (msg.includes("beasiswa")) {
    const list = beasiswa?.map((b) => `• **${b.nama}** — ${b.cakupan}`).join("\n") || "Informasi tidak tersedia";
    return `**Beasiswa Tersedia:**\n\n${list}`;
  }

  return `🤖 Demo Mode\n\nPertanyaan Anda: "${userMessage}"\n\nMasukkan API key valid di tab "API" untuk jawaban penuh.`;
}