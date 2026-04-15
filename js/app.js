// ============================================================
// app.js — Logic utama aplikasi chatbot FAQ kampus
// ============================================================

// ─── State aplikasi ────────────────────────────────────────
const AppState = {
  chatHistory: [], // Riwayat percakapan [{role, content}]
  isLoading: false, // Status loading saat menunggu response
  apiReady: false, // True jika API key sudah diset dan valid
  useMemory: true, // Apakah menggunakan memory kampus

  // Getter: API key dari form (fallback ke default API key)
  get apiKey() {
    const formKey = document.getElementById("cfg-api-key")?.value;
    return formKey && formKey.trim() ? formKey : MINIMAX_API_KEY;
  },

  // Getter: konfigurasi model dari form
  get modelConfig() {
    return {
      model:
        document.getElementById("cfg-model")?.value ||
        DEFAULT_MODEL_CONFIG.model,
      stream: true,
      options: {
        temperature:
          parseFloat(document.getElementById("cfg-temperature")?.value) ||
          DEFAULT_MODEL_CONFIG.options.temperature,
        top_p:
          parseFloat(document.getElementById("cfg-top-p")?.value) ||
          DEFAULT_MODEL_CONFIG.options.top_p,
      },
    };
  },

  // Getter: endpoint MiniMax dari form
  get endpoint() {
    return document.getElementById("cfg-endpoint")?.value || MINIMAX_ENDPOINT;
  },

  // Getter: system prompt dari textarea
  get systemPrompt() {
    return (
      document.getElementById("system-prompt")?.value || DEFAULT_SYSTEM_PROMPT
    );
  },

  // Getter: bahasa jawaban yang dipilih pengguna
  get responseLanguage() {
    return (
      document.getElementById("cfg-language")?.value || "auto"
    ).toString();
  },
};

function getEffectiveSystemPrompt() {
  const basePrompt = AppState.systemPrompt;
  const lang = AppState.responseLanguage;

  // Peta bahasa → instruksi eksplisit untuk AI
  const langInstructions = {
    auto: `LANGUAGE RULE: Detect the language from the user's message and reply in EXACTLY that same language. Do not mix languages.`,
    english: `LANGUAGE RULE: You MUST reply in English only. Every word of your response must be in English, regardless of what language the user writes in.`,
    traditional_chinese: `LANGUAGE RULE: You MUST reply in Traditional Chinese (繁體中文) only. Every word of your response must be in Traditional Chinese. Do not use Simplified Chinese. Regardless of what language the user writes in.`,
    vietnamese: `LANGUAGE RULE: You MUST reply in Vietnamese (Ti\u1ebfng Vi\u1ec7t) only. Every word of your response must be in Vietnamese, regardless of what language the user writes in.`,
    indonesian: `LANGUAGE RULE: You MUST reply in Bahasa Indonesia only. Every word of your response must be in Indonesian, regardless of what language the user writes in.`,
    thai: `LANGUAGE RULE: You MUST reply in Thai (\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22) only. Every word of your response must be in Thai script, regardless of what language the user writes in.`,
  };

  const instruction = langInstructions[lang] || langInstructions.auto;

  return `${basePrompt.trim()}

${instruction}`;
}

function loadSavedSettings() {
  const raw = localStorage.getItem("ltuBotSettings");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSettings() {
  const settings = {
    endpoint:
      document.getElementById("cfg-endpoint")?.value || MINIMAX_ENDPOINT,
    model:
      document.getElementById("cfg-model")?.value || DEFAULT_MODEL_CONFIG.model,
    temperature:
      parseFloat(document.getElementById("cfg-temperature")?.value) ||
      DEFAULT_MODEL_CONFIG.options.temperature,
    top_p:
      parseFloat(document.getElementById("cfg-top-p")?.value) ||
      DEFAULT_MODEL_CONFIG.options.top_p,
    useMemory:
      document.getElementById("cfg-use-memory")?.checked ?? AppState.useMemory,
    language: document.getElementById("cfg-language")?.value || "auto",
    apiKey: AppState.apiKey,
  };
  localStorage.setItem("ltuBotSettings", JSON.stringify(settings));
}

function applySavedSettings() {
  const saved = loadSavedSettings();
  if (!saved) return;

  const endpointInput = document.getElementById("cfg-endpoint");
  const modelInput = document.getElementById("cfg-model");
  const tempInput = document.getElementById("cfg-temperature");
  const topPInput = document.getElementById("cfg-top-p");
  const useMemoryInput = document.getElementById("cfg-use-memory");
  const languageInput = document.getElementById("cfg-language");
  const apiKeyInput = document.getElementById("cfg-api-key");

  // Auto-fix: override wrong old endpoint with correct one
  if (endpointInput) {
    endpointInput.value = (saved.endpoint && !saved.endpoint.includes("minimax.chat"))
      ? saved.endpoint
      : MINIMAX_ENDPOINT;
  }
  if (modelInput) {
    modelInput.value = saved.model || DEFAULT_MODEL_CONFIG.model;
  }
  if (tempInput)
    tempInput.value =
      saved.temperature ?? DEFAULT_MODEL_CONFIG.options.temperature;
  if (topPInput)
    topPInput.value = saved.top_p ?? DEFAULT_MODEL_CONFIG.options.top_p;
  if (useMemoryInput)
    useMemoryInput.checked = saved.useMemory ?? AppState.useMemory;
  if (languageInput) languageInput.value = saved.language || "auto";
  if (apiKeyInput && saved.apiKey) {
    apiKeyInput.value = saved.apiKey;
    AppState.apiReady = true;
  }
}

// ─── Inisialisasi aplikasi ─────────────────────────────────
async function startApp() {
  initUI();
  renderWelcomeMessage();
  await checkApiConnection();
  setInterval(checkApiConnection, 30000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}

/**
 * Inisialisasi semua element UI dan event listener.
 */
function initUI() {
  console.log("initUI started");

  // Isi nilai default di panel konfigurasi
  document.getElementById("system-prompt").value = DEFAULT_SYSTEM_PROMPT;
  document.getElementById("campus-memory").value = JSON.stringify(
    DEFAULT_CAMPUS_MEMORY,
    null,
    2,
  );
  document.getElementById("cfg-model").value = DEFAULT_MODEL_CONFIG.model;
  document.getElementById("cfg-temperature").value =
    DEFAULT_MODEL_CONFIG.options.temperature;
  document.getElementById("cfg-top-p").value =
    DEFAULT_MODEL_CONFIG.options.top_p;
  document.getElementById("cfg-endpoint").value = MINIMAX_ENDPOINT;
  document.getElementById("cfg-api-key").value = MINIMAX_API_KEY;
  AppState.apiReady = true;
  document.getElementById("cfg-language").value = "auto";

  // Muat konfigurasi tersimpan jika ada
  applySavedSettings();
  const tempLabel = document.getElementById("temperature-label");
  if (tempLabel) {
    tempLabel.textContent =
      document.getElementById("cfg-temperature")?.value ||
      String(DEFAULT_MODEL_CONFIG.options.temperature);
  }

  // Update label temperature secara real-time
  document
    .getElementById("cfg-temperature")
    .addEventListener("input", function () {
      document.getElementById("temperature-label").textContent = this.value;
      saveSettings();
    });

  // Update badge model
  updateModelBadge();
  document.getElementById("cfg-model").addEventListener("input", () => {
    updateModelBadge();
    saveSettings();
  });

  document.getElementById("cfg-top-p").addEventListener("change", saveSettings);
  document.getElementById("cfg-endpoint").addEventListener("change", saveSettings);

  // API Key input - trigger connection check on change
  document.getElementById("cfg-api-key").addEventListener("change", async () => {
    saveSettings();
    await checkApiConnection();
  });

  // Update useMemory state
  document.getElementById("cfg-use-memory").addEventListener("change", (e) => {
    AppState.useMemory = e.target.checked;
    saveSettings();
  });

  document
    .getElementById("cfg-language")
    .addEventListener("change", saveSettings);

  // Input pertanyaan: Enter untuk kirim
  const userInput = document.getElementById("user-input");
  console.log("user-input element:", userInput);
  userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  console.log("user-input keydown listener added");

  // Auto-resize textarea input
  document.getElementById("user-input").addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 140) + "px";
  });

  // Tombol kirim
  const sendBtn = document.getElementById("send-btn");
  console.log("send-btn element:", sendBtn);
  sendBtn.addEventListener("click", sendMessage);
  console.log("send-btn listener added");

  // Tombol reset chat
  document
    .getElementById("reset-chat-btn")
    .addEventListener("click", resetChat);

  // Tombol load sample memory
  document
    .getElementById("load-sample-btn")
    .addEventListener("click", loadSampleMemory);

  // Tombol copy system prompt
  document.getElementById("copy-prompt-btn").addEventListener("click", () => {
    copyToClipboard(
      document.getElementById("system-prompt").value,
      "System prompt disalin!",
    );
  });

  // Validasi JSON memory secara real-time
  document
    .getElementById("campus-memory")
    .addEventListener("input", validateMemoryJSON);

  // Tab panel sidebar
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Quick questions
  document.querySelectorAll(".quick-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("user-input").value = btn.textContent;
      sendMessage();
    });
  });

  // Toggle sidebar di mobile
  document
    .getElementById("toggle-sidebar-btn")
    ?.addEventListener("click", toggleSidebar);
  document.getElementById("overlay")?.addEventListener("click", toggleSidebar);

  console.log("initUI finished");
}

// ─── Cek status koneksi MiniMax API ────────────────────────
async function checkApiConnection() {
  const apiKey = AppState.apiKey;
  const endpoint = AppState.endpoint;

  if (!apiKey) {
    AppState.apiReady = false;
    updateStatusBadge("no-key");
    return;
  }

  const status = await checkMiniMaxStatus(apiKey, endpoint);

  if (status.ok) {
    AppState.apiReady = true;
    updateStatusBadge("ready");
  } else {
    AppState.apiReady = false;
    updateStatusBadge("error", status.error);
  }
}

/**
 * Update tampilan status badge di header.
 * @param {"no-key"|"ready"|"error"} state
 * @param {string} errorMessage
 */
function updateStatusBadge(state, errorMessage = "") {
  const indicator = document.getElementById("status-indicator");
  const statusText = document.getElementById("status-text");
  if (!indicator || !statusText) return;

  switch (state) {
    case "ready":
      indicator.className = "status-dot ready";
      statusText.textContent = "MiniMax Ready";
      statusText.title = "API terhubung dan siap";
      break;
    case "no-key":
      indicator.className = "status-dot offline";
      statusText.textContent = "API Key Needed";
      statusText.title = "Masukkan API key di panel konfigurasi";
      break;
    case "error":
      indicator.className = "status-dot offline";
      statusText.textContent = "API Error";
      statusText.title = errorMessage || "Gagal terhubung ke MiniMax";
      break;
    default:
      indicator.className = "status-dot offline";
      statusText.textContent = "MiniMax Offline";
      statusText.title = "Jalankan: ollama serve";
      break;
  }
}

// ─── Kirim pesan ──────────────────────────────────────────
async function sendMessage() {
  console.log("sendMessage called");

  if (AppState.isLoading) return;

  const input = document.getElementById("user-input");
  const userMessage = input.value.trim();

  // Validasi input kosong
  if (!userMessage) {
    shakeInput(input);
    return;
  }

  // Validasi API key
  if (!AppState.apiKey) {
    shakeInput(input);
    appendMessage("error", "⚠️ API key belum diset.\n\nMasukkan API key MiniMax di panel konfigurasi tab \"API\".");
    return;
  }

  // Validasi JSON memory
  const memoryText = document.getElementById("campus-memory")?.value || "{}";
  let campusMemory;
  try {
    campusMemory = JSON.parse(memoryText);
  } catch {
    showMemoryError(
      "Format JSON memory tidak valid. Perbaiki JSON sebelum mengirim pesan.",
    );
    switchTab("memory");
    return;
  }

  // Hapus input dan tampilkan pesan user
  input.value = "";
  input.style.height = "auto";
  appendMessage("user", userMessage);

  // Tambah ke history
  AppState.chatHistory.push({ role: "user", content: userMessage });

  // Tampilkan loading indicator
  setLoading(true);
  const loadingId = appendLoadingBubble();

  try {
    let responseText;

    if (!AppState.apiReady) {
      // ── Demo Mode: API belum ready ──
      await simulateDelay(1000);
      responseText = getMockResponse(userMessage, campusMemory);
      removeLoadingBubble(loadingId);
      appendMessage("assistant", responseText);
    } else {
      // ── REAL MODE: Kirim ke MiniMax dengan STREAMING ──
      const messages = buildMessages(
        getEffectiveSystemPrompt(),
        AppState.useMemory ? campusMemory : null,
        AppState.chatHistory.slice(0, -1),
        userMessage,
      );

      const config = AppState.modelConfig;
      const requestBody = buildMiniMaxRequestBody(
        config.model,
        config.options,
        messages,
      );

      // Tampilkan "thinking" bubble sementara model memproses
      removeLoadingBubble(loadingId);
      const streamBubble = appendStreamingBubble();
      let firstTokenReceived = false;

      // Timer untuk menampilkan progress estimasi saat model masih thinking
      const thinkingTimer = setInterval(() => {
        if (!firstTokenReceived) {
          showThinkingProgress(streamBubble);
        }
      }, 3000);

      try {
        responseText = await sendToMiniMaxStream(
          AppState.apiKey,
          AppState.endpoint,
          requestBody,
          // onToken: update bubble secara live
          (token, fullContent) => {
            if (!firstTokenReceived) {
              firstTokenReceived = true;
              clearInterval(thinkingTimer);
              clearThinkingProgress(streamBubble);
            }
            updateStreamingBubble(streamBubble, fullContent);
          },
          // onComplete: finalize bubble dengan markdown
          (fullContent) => {
            clearInterval(thinkingTimer);
            finalizeStreamingBubble(streamBubble, fullContent);
          },
        );
      } catch (streamErr) {
        clearInterval(thinkingTimer);
        // Hapus streaming bubble yang tertinggal
        streamBubble.wrapper?.remove();
        throw streamErr;
      }
    }

    // Tambah ke history
    AppState.chatHistory.push({ role: "assistant", content: responseText });

    // Batasi history agar tidak terlalu panjang (max 20 pasang)
    if (AppState.chatHistory.length > 40) {
      AppState.chatHistory = AppState.chatHistory.slice(-40);
    }
  } catch (err) {
    removeLoadingBubble(loadingId);

    // Tampilkan error di chat
    const helpMsg =
      err instanceof MiniMaxError
        ? getMiniMaxErrorHelp(err)
        : `❌ Error tak terduga: ${err.message}`;

    appendMessage("error", helpMsg);

    // Hapus pesan user dari history jika gagal
    AppState.chatHistory.pop();

    // Tandai sebagai error jika connection/API error
    if (err.type === "connection" || err.type === "invalid_api_key") {
      AppState.apiReady = false;
      updateStatusBadge("error", err.message);
    }
  } finally {
    setLoading(false);
  }
}

// ─── Fungsi UI ─────────────────────────────────────────────

/**
 * Menambah bubble pesan ke panel chat.
 * Mendukung markdown sederhana (bold, bullet, code).
 */
function appendMessage(role, content) {
  const chatPanel = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${role}`;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${role}`;

  if (role === "assistant" || role === "error") {
    bubble.innerHTML = parseMarkdown(content);
  } else {
    bubble.textContent = content;
  }

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent =
    role === "user" ? "Kamu" : role === "error" ? "⚠️ System" : "🤖 LTU Bot";

  if (role === "assistant") {
    const copyBtn = document.createElement("button");
    copyBtn.className = "msg-copy-btn";
    copyBtn.title = "Salin jawaban";
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    copyBtn.addEventListener("click", () =>
      copyToClipboard(content, "Disalin!"),
    );
    meta.appendChild(copyBtn);
  }

  wrapper.appendChild(meta);
  wrapper.appendChild(bubble);
  chatPanel.appendChild(wrapper);

  chatPanel.scrollTo({ top: chatPanel.scrollHeight, behavior: "smooth" });
  return wrapper;
}

/**
 * Membuat bubble kosong untuk streaming — konten diisi bertahap.
 * @returns {{ wrapper: Element, bubble: Element, rawContent: string }}
 */
function appendStreamingBubble() {
  const chatPanel = document.getElementById("chat-messages");

  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper assistant";

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = "🤖 LTU Bot";

  // Streaming indicator
  const streamIndicator = document.createElement("span");
  streamIndicator.className = "stream-indicator";
  streamIndicator.textContent = " ⬤";
  meta.appendChild(streamIndicator);

  const bubble = document.createElement("div");
  bubble.className = "message-bubble assistant streaming";
  bubble.innerHTML = `<span class="stream-cursor">▍</span>`;

  wrapper.appendChild(meta);
  wrapper.appendChild(bubble);
  chatPanel.appendChild(wrapper);
  chatPanel.scrollTo({ top: chatPanel.scrollHeight, behavior: "smooth" });

  return { wrapper, bubble, meta, streamIndicator };
}

/**
 * Update konten streaming bubble dengan teks sementara (plain + cursor).
 */
function updateStreamingBubble({ bubble }, fullContent) {
  // Tampilkan sebagai plain text dengan newlines selama streaming
  const escaped = fullContent
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  bubble.innerHTML = escaped + `<span class="stream-cursor">▍</span>`;

  // Auto-scroll
  const chatPanel = document.getElementById("chat-messages");
  chatPanel.scrollTo({ top: chatPanel.scrollHeight, behavior: "smooth" });
}

/**
 * Finalize streaming bubble — render markdown penuh, hapus cursor & indicator.
 */
function finalizeStreamingBubble(
  { wrapper, bubble, meta, streamIndicator },
  fullContent,
) {
  // Render markdown
  bubble.innerHTML = parseMarkdown(fullContent);
  bubble.classList.remove("streaming");

  // Hapus stream indicator
  streamIndicator?.remove();

  // Tambahkan copy button
  const copyBtn = document.createElement("button");
  copyBtn.className = "msg-copy-btn";
  copyBtn.title = "Salin jawaban";
  copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  copyBtn.addEventListener("click", () =>
    copyToClipboard(fullContent, "Disalin!"),
  );
  meta.appendChild(copyBtn);

  // Scroll ke bawah
  const chatPanel = document.getElementById("chat-messages");
  chatPanel.scrollTo({ top: chatPanel.scrollHeight, behavior: "smooth" });
}

/**
 * Tampilkan progress "thinking" pada streaming bubble.
 * Dipanggil setiap 3 detik selama model belum generate token pertama.
 */
const _thinkingStart = {};
function showThinkingProgress({ bubble, wrapper }) {
  const id = (wrapper._thinkingId = wrapper._thinkingId || Date.now());
  _thinkingStart[id] = _thinkingStart[id] || Date.now();
  const elapsed = Math.round((Date.now() - _thinkingStart[id]) / 1000);

  const phases = [
    { max: 5, msg: "Memproses konteks..." },
    { max: 15, msg: "Model sedang membaca data kampus..." },
    { max: 30, msg: "Model sedang berpikir... ⏳" },
    { max: 60, msg: "Hampir selesai, harap sabar... 🧠" },
    {
      max: Infinity,
      msg: `Masih memproses (${elapsed}d)... Model mungkin perlu waktu lebih lama.`,
    },
  ];

  const phase = phases.find((p) => elapsed <= p.max);
  bubble.innerHTML = `<span class="thinking-label">${phase.msg}</span> <span class="stream-cursor">▍</span>`;
}

/**
 * Hapus indikator thinking dari bubble (sebelum stream dimulai).
 */
function clearThinkingProgress({ bubble }) {
  bubble.innerHTML = `<span class="stream-cursor">▍</span>`;
}

/**
 * Menambah bubble loading (typing indicator).
 */
function appendLoadingBubble() {
  const id = "loading-" + Date.now();
  const chatPanel = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper assistant";
  wrapper.id = id;

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = "🤖 LTU Bot";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble assistant loading-bubble";
  bubble.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;

  wrapper.appendChild(meta);
  wrapper.appendChild(bubble);
  chatPanel.appendChild(wrapper);
  chatPanel.scrollTo({ top: chatPanel.scrollHeight, behavior: "smooth" });

  return id;
}

/**
 * Menghapus bubble loading.
 */
function removeLoadingBubble(id) {
  document.getElementById(id)?.remove();
}

/**
 * Reset seluruh percakapan.
 */
function resetChat() {
  AppState.chatHistory = [];
  const chatPanel = document.getElementById("chat-messages");

  chatPanel.style.opacity = "0";
  chatPanel.style.transform = "translateY(10px)";
  setTimeout(() => {
    chatPanel.innerHTML = "";
    renderWelcomeMessage();
    chatPanel.style.opacity = "1";
    chatPanel.style.transform = "translateY(0)";
  }, 250);
}

/**
 * Tampilkan pesan sambutan awal.
 */
function renderWelcomeMessage() {
  const chatPanel = document.getElementById("chat-messages");
  chatPanel.innerHTML = `
    <div class="welcome-state">
      <div class="welcome-icon">🎓</div>
      <h2 class="welcome-title">Selamat Datang di LTU Bot</h2>
      <p class="welcome-subtitle">Asisten virtual FAQ 嶺東科技大學. Tanyakan apa saja seputar kampus!</p>
    </div>
  `;
}

/**
 * Shortcut untuk quick question dari welcome state.
 */
function quickAsk(question) {
  const chatPanel = document.getElementById("chat-messages");
  const welcomeState = chatPanel.querySelector(".welcome-state");
  if (welcomeState) welcomeState.remove();

  document.getElementById("user-input").value = question;
  sendMessage();
}

/**
 * Load ulang sample memory kampus ke textarea.
 */
function loadSampleMemory() {
  document.getElementById("campus-memory").value = JSON.stringify(
    DEFAULT_CAMPUS_MEMORY,
    null,
    2,
  );
  clearMemoryError();
  showToast("Sample memory kampus berhasil dimuat!");
}

/**
 * Update badge model aktif.
 */
function updateModelBadge() {
  const model =
    document.getElementById("cfg-model")?.value || DEFAULT_MODEL_CONFIG.model;
  document.getElementById("active-model-badge").textContent = model;
}

/**
 * Switch tab di sidebar.
 */
function switchTab(tabName) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-panel")
    .forEach((p) => p.classList.remove("active"));

  document
    .querySelector(`.tab-btn[data-tab="${tabName}"]`)
    ?.classList.add("active");
  document.getElementById(`tab-${tabName}`)?.classList.add("active");
}

/**
 * Toggle sidebar di mobile.
 */
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const isOpen = sidebar.classList.toggle("open");
  overlay.classList.toggle("visible", isOpen);
  document.body.classList.toggle("sidebar-open", isOpen);
}

/**
 * Set loading state.
 */
function setLoading(state) {
  AppState.isLoading = state;
  const btn = document.getElementById("send-btn");
  const input = document.getElementById("user-input");

  btn.disabled = state;
  input.disabled = state;

  if (state) {
    btn.innerHTML = `<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
  } else {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  }
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Parser markdown sederhana untuk pesan chatbot.
 * Mendukung: **bold**, `code`, ```block```, • bullets, numbered list.
 */
function parseMarkdown(text) {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    (_, code) => `<pre><code>${code.trim()}</code></pre>`,
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^## (.+)$/gm, "<h3>$1</h3>");

  // Bullet list
  html = html.replace(/^[•\-\*] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

  // Numbered list
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs
  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br>");
  html = "<p>" + html + "</p>";

  // Bersihkan p kosong
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>(<\/?(ul|ol|li|h[3-6]|pre)>)/g, "$1");
  html = html.replace(/(<\/?(ul|ol|li|h[3-6]|pre)>)<\/p>/g, "$1");

  return html;
}

/**
 * Copy teks ke clipboard dan tampilkan toast.
 */
async function copyToClipboard(text, message = "Disalin ke clipboard!") {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast(message);
  }
}

/**
 * Tampilkan toast notifikasi sementara.
 */
function showToast(message) {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  });
}

/**
 * Efek shake pada input jika kosong.
 */
function shakeInput(el) {
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
  setTimeout(() => el.classList.remove("shake"), 500);
  el.focus();
}

/**
 * Validasi JSON memory dan tampilkan error inline.
 */
function validateMemoryJSON() {
  const text = document.getElementById("campus-memory")?.value || "";
  if (!text.trim()) {
    clearMemoryError();
    return;
  }
  try {
    JSON.parse(text);
    clearMemoryError();
  } catch (e) {
    showMemoryError(`JSON tidak valid: ${e.message}`);
  }
}

function showMemoryError(msg) {
  const err = document.getElementById("memory-error");
  if (err) {
    err.textContent = msg;
    err.style.display = "block";
    document.getElementById("campus-memory")?.classList.add("input-error");
  }
}

function clearMemoryError() {
  const err = document.getElementById("memory-error");
  if (err) {
    err.textContent = "";
    err.style.display = "none";
    document.getElementById("campus-memory")?.classList.remove("input-error");
  }
}

/**
 * Simulasi delay untuk mock mode.
 */
function simulateDelay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// Render welcome message saat load