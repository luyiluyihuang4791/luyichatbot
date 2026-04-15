// ============================================
// LTU Chatbot - LINE Bot Server
// ============================================
// Handles webhook events from LINE and integrates with MiniMax API

import express from 'express';
import * as line from '@line/bot-sdk';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================
// Import data.js (as JSON for server-side)
// ============================================

// Campus memory data (same as in data.js)
const CAMPUS_MEMORY = {
  kampus: {
    nama: "嶺東科技大學",
    singkatan: "LTU",
    tagline: "學以致用，誠以待人",
    tahun_berdiri: 2005,
    status: "Terakreditasi A+ oleh Kementerian Pendidikan Taiwan",
    lokasi: {
      alamat: "1, Ling tung Rd.",
      kota: "Taichung",
      distrik: "Nantun",
      kode_pos: "408",
      koordinat: "24.1378° N, 120.6086° E",
    },
    website: "www.ltu.edu.tw",
    telepon: "886-4-23892088",
    fax: "886-4-36015202",
    email_umum: "ltu1211@teamail.ltu.edu.tw",
    rektor: "陳仁龍",
    motto: "學以致用，誠以待人",
  },
  fakultas_dan_prodi: [
    { nama: "商學院 (Business)", prodi: ["企業管理", "財務金融", "會計資訊", "國際商務", "行銷與流通"] },
    { nama: "設計學院 (Design)", prodi: ["數位設計", "視覺傳達", "創意產品設計", "時尚設計"] },
    { nama: "資訊科學學院 (Info Science)", prodi: ["資訊工程", "資訊管理", "人工智慧", "網路工程"] },
    { nama: "時裝學院 (Fashion)", prodi: ["時尚設計", "時尚经营管理"] },
  ],
  pendaftaran: {
    jalur: [
      { nama: "Jalur Prestasi", deskripsi: "Tanpa tes, berdasarkan nilai rapor dan prestasi", periode: "Januari - Maret" },
      { nama: "Jalur Reguler", deskripsi: " Melalui tes tertulis dan wawancara", periode: "April - Juli" },
    ],
    biaya_pendaftaran: {
      jalur_prestasi: "Rp 150.000",
      jalur_reguler: "Rp 200.000",
    },
  },
  beasiswa: [
    { nama: "Beasiswa KIP", cakupan: "Seluruh biaya pendidikan" },
    { nama: "Beasiswa Prestasi", cakupan: "50% SPP" },
    { nama: "Beasiswa Undian", cakupan: "Potongan 30%" },
  ],
};

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 3000;
const MINIMAX_API_ENDPOINT = 'https://api.minimax.io/anthropic/v1/messages';
const MINIMAX_MODEL = 'MiniMax-M2.7';

// System prompt (same as default in data.js)
const SYSTEM_PROMPT = `You are the official virtual FAQ assistant for Ling Tung University (嶺東科技大學 / LTU). Your mission is to help students, prospective students, and the campus community get accurate information about the university.

== LANGUAGE DETECTION & RESPONSE RULES (MANDATORY) ==
You MUST detect the language of the user's input and reply in the EXACT same language.
Supported languages and their rules:
- Indonesian (Bahasa Indonesia): If user writes in Indonesian → reply fully in Indonesian.
- English: If user writes in English → reply fully in English.
- Traditional Chinese (繁體中文): If user writes in Chinese characters → reply fully in Traditional Chinese (台灣繁體中文).
- Vietnamese (Tiếng Việt): If user writes in Vietnamese → reply fully in Vietnamese.
- Thai (ภาษาไทย): If user writes in Thai script → reply fully in Thai.
IMPORTANT: NEVER mix languages in a single reply. If a user writes in Thai, your ENTIRE response must be in Thai. If in Vietnamese, your ENTIRE response must be in Vietnamese. No exceptions.
If unsure of the language, default to English.

== SCOPE RULES ==
- ONLY answer questions related to the university (admissions, academics, scholarships, facilities, contacts, fees, etc.).
- If a question is off-topic, politely decline in the user's language and redirect to campus topics.
- Prioritize information from the campus memory data (DATA_KAMPUS) provided.
- If information is not available in memory, honestly say so and direct the user to the relevant office.
- NEVER fabricate information.

== RESPONSE FORMAT ==
- Be concise and direct. Use bullet points for multiple items.
- Include relevant contact/unit at the end when applicable.
- For procedures/steps, use numbered lists.
- Use a polite, professional tone appropriate to the detected language.`;

// ============================================
// Smart Memory Filter (same as minimax.js)
// ============================================

function filterCampusMemory(memory, userMessage) {
  const msg = userMessage.toLowerCase();
  const result = { kampus: memory.kampus };

  const sections = [
    { keys: ["daftar", "pendaftaran", "registrasi", "pmb", "syarat", "jalur"], field: "pendaftaran" },
    { keys: ["biaya", "ukt", "spp", "bayar", "keuangan", "golongan"], field: "biaya_pendidikan" },
    { keys: ["beasiswa", "kip", "bantuan", "keringanan"], field: "beasiswa" },
    { keys: ["prodi", "jurusan", "program", "studi", "fakultas", "rektor"], field: "fakultas_dan_prodi" },
    { keys: ["akademik", "nilai", "transkip", "surat keterangan", "baak"], field: "layanan_akademik" },
    { keys: ["fasilitas", "lab", "perpustakaan", "wifi", "kantin"], field: "fasilitas" },
    { keys: ["kontak", "telepon", "email", "hubungi"], field: "kontak_penting" },
    { keys: ["jam", "buka", "tutup", "layanan", "operasional"], field: "jam_layanan_kampus" },
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

// ============================================
// Message Builder
// ============================================

function buildMessages(systemPrompt, campusMemory, userMessage) {
  // Apply smart filter
  const relevantMemory = filterCampusMemory(campusMemory, userMessage);

  // Combine system prompt with campus memory
  let systemContent = systemPrompt.trim();
  systemContent += `\n\nDATA_KAMPUS:\n${JSON.stringify(relevantMemory, null, 2)}`;

  return [
    { role: "system", content: systemContent },
    { role: "user", content: userMessage.trim() }
  ];
}

// ============================================
// MiniMax API Integration
// ============================================

async function getMiniMaxResponse(userMessage) {
  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    return 'Maaf, API key belum dikonfigurasi.';
  }

  const messages = buildMessages(SYSTEM_PROMPT, CAMPUS_MEMORY, userMessage);

  console.log('[MiniMax] Sending request with', messages.length, 'messages');
  console.log('[MiniMax] System content length:', messages[0].content.length);

  try {
    const response = await fetch(MINIMAX_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        max_tokens: 1024,
        messages: messages,
      }),
    });

    if (!response.ok) {
      console.error('[MiniMax] API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('[MiniMax] Error body:', errorText);
      return 'Maaf, terjadi kesalahan pada sistem.';
    }

    const data = await response.json();
    console.log('[MiniMax] Response structure:', JSON.stringify(data).substring(0, 500));

    if (data.error) {
      console.error('[MiniMax] Error:', data.error);
      return 'Maaf, terjadi kesalahan pada sistem.';
    }

    // MiniMax response format: content is array with blocks like {type: "text", text: "..."} or {thinking: "..."}
    const contentBlocks = data.content || [];
    console.log('[MiniMax] Content blocks:', contentBlocks.length, 'blocks');

    // Extract text from content blocks - skip thinking blocks
    let responseText = null;
    for (const block of contentBlocks) {
      if (block.type === 'text' && block.text) {
        responseText = block.text;
        console.log('[MiniMax] Found text block:', block.text.substring(0, 100));
        break;
      }
    }

    if (!responseText) {
      // Try alternative format - direct text property
      if (typeof data.content === 'string') {
        responseText = data.content;
      } else {
        console.error('[MiniMax] No text found in content blocks');
        console.log('[MiniMax] Content blocks:', JSON.stringify(contentBlocks));
      }
    }

    return responseText || 'Maaf, tidak ada respons.';

  } catch (error) {
    console.error('[MiniMax] Fetch error:', error);
    return 'Maaf, terjadi kesalahan koneksi.';
  }
}

// ============================================
// LINE Client
// ============================================

const lineClient = line.LineBotClient.fromChannelAccessToken({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// ============================================
// Express App Setup
// ============================================

const app = express();

app.use(express.text({ type: '*/*' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.send('LTU Chatbot LINE Bot Server is running!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    line: {
      channelSecret: process.env.LINE_CHANNEL_SECRET ? 'configured' : 'missing',
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ? 'configured' : 'missing',
    },
    minimax: {
      apiKey: process.env.MINIMAX_API_KEY ? 'configured' : 'missing',
    },
  });
});

// ============================================
// LINE Webhook Handler
// ============================================

app.post('/webhook', (req, res) => {
  console.log('Webhook received');

  let bodyObj;
  try {
    bodyObj = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    console.error('Parse error:', e);
    return res.status(400).send('Bad Request');
  }

  // LINE verification ping - empty events
  if (!bodyObj.events || bodyObj.events.length === 0) {
    console.log('LINE verification ping - returning 200');
    return res.status(200).send('OK');
  }

  console.log('Events count:', bodyObj.events.length);

  // Process all events
  const promises = bodyObj.events.map(handleEvent);

  Promise.all(promises)
    .then(() => res.status(200).send())
    .catch((err) => {
      console.error('Error handling events:', err);
      res.status(500).send('Error');
    });
});

async function handleEvent(event) {
  console.log('Processing event:', event.type);

  // Only handle text messages
  if (event.type !== 'message' || event.message.type !== 'text') {
    console.log('Skipping non-text event');
    return null;
  }

  const userMessage = event.message.text;
  const replyToken = event.replyToken;
  const userId = event.source?.userId;

  console.log(`User ${userId} sent: "${userMessage}"`);

  try {
    // Get response from MiniMax with full campus context
    console.log('Getting MiniMax response...');
    const botResponse = await getMiniMaxResponse(userMessage);

    console.log(`Bot responding with: "${botResponse.substring(0, 100)}..."`);

    // Reply to LINE user
    await lineClient.replyMessage({
      replyToken: replyToken,
      messages: [
        {
          type: 'text',
          text: botResponse,
        },
      ],
    });

    console.log('Reply sent successfully');

  } catch (error) {
    console.error('Error in handleEvent:', error);

    // Try to send error message
    try {
      await lineClient.replyMessage({
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          },
        ],
      });
    } catch (replyError) {
      console.error('Error sending error reply:', replyError);
    }
  }
}

// ============================================
// Error Handling
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  LTU Chatbot LINE Bot Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Port: ${PORT}`);
  console.log(`  LINE Channel Secret: ${process.env.LINE_CHANNEL_SECRET ? '✓ configured' : '✗ MISSING'}`);
  console.log(`  LINE Access Token: ${process.env.LINE_CHANNEL_ACCESS_TOKEN ? '✓ configured' : '✗ MISSING'}`);
  console.log(`  MiniMax API Key: ${process.env.MINIMAX_API_KEY ? '✓ configured' : '✗ MISSING'}`);
  console.log(`  Campus Memory: ✓ loaded (${Object.keys(CAMPUS_MEMORY).length} sections)`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});