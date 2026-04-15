# LINE Bot Integration Guide - LTU Chatbot

## Overview

Dokumentasi ini menjelaskan bagaimana LINE Bot terintegrasi dengan LTU FAQ chatbot untuk allow users chat via LINE Messenger dan dapat jawaban dari MiniMax API.

---

## Architecture

```
User (LINE App)
    │
    ▼
LINE Platform
    │
    ▼ (HTTPS Webhook)
ngrok / Server
    │
    ▼
server.js (Express)
    │
    ├── Verify signature
    ├── Parse webhook event
    │
    ▼
MiniMax API (M2.7)
    │
    ▼
Response text
    │
    ▼
LINE Messaging API (reply)
    │
    ▼
User (LINE App)
```

---

## Prerequisites

1. **LINE Developer Account** - https://developers.line.biz/console
2. **Messaging API Channel** - dibuat di LINE Developers Console
3. **Channel Credentials**:
   - Channel ID: `2009809706`
   - Channel Secret
   - Long-lived Channel Access Token

4. **Server dengan HTTPS** - ngrok untuk development lokal

---

## Setup Steps

### 1. LINE Developers Console Setup

1. Buka https://developers.line.biz/console
2. Login dengan LINE account
3. Buat Provider (atau gunakan existing)
4. Create Channel → **Messaging API**
5. Copy credentials:
   - **Channel ID**: dari Basic settings tab
   - **Channel Secret**: dari Basic settings tab
   - **Long-lived Access Token**: dari Messaging API tab → Issue

### 2. Server Setup

```bash
# Install dependencies
npm install

# Create .env dari .env.example
cp .env.example .env
# Edit .env dengan credentials Anda

# Start server
npm start
```

### 3. Ngrok Setup (untuk local development)

```bash
# Terminal baru
ngrok http 3000

# Copy HTTPS URL (contoh: https://abc123.ngrok-free.app)
```

### 4. Configure Webhook URL

1. LINE Developers Console → Messaging API channel
2. Scroll ke **Webhook settings**
3. Paste ngrok URL (tanpa `/webhook`)
4. Klik **Update**
5. Klik **Verify**

### 5. Enable Webhook

1. Di同一页面, toggle **Use webhook** → ON
2. Matikan Auto-reply jika mau bot handle semua pesan

---

## File Reference

### server.js

Express server yang handle LINE webhook:

```javascript
// Key components:
- express.text() middleware untuk parse raw body
- LINE signature verification
- MiniMax API integration
- Reply via @line/bot-sdk
```

**Endpoints:**
- `POST /webhook` - LINE webhook handler
- `GET /` - Health check
- `GET /health` - Detailed status

### Environment Variables (.env)

```bash
LINE_CHANNEL_ID=2009809706
LINE_CHANNEL_SECRET=<your_secret>
LINE_CHANNEL_ACCESS_TOKEN=<your_token>
MINIMAX_API_KEY=<your_api_key>
PORT=3000
```

---

## Running the Server

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Start ngrok
ngrok http 3000

# Copy ngrok URL dan set di LINE Console
# Format: https://xxx.ngrok-free.dev/webhook
```

---

## Testing

### Test Webhook Verification

1. LINE Console → Webhook settings
2. Klik **Verify**
3. Harus muncul "Success"

### Test Bot Response

1. Buka LINE app
2. Kirim pesan ke Official Account
3. Lihat response dari MiniMax API

### Debug

```bash
# Lihat ngrok requests
http://127.0.0.1:4040

# Lihat server logs - output console saat npm start
```

---

## Common Issues & Fixes

### Webhook 400 Bad Request

**Cause:** Express.json middleware interfering with raw body parsing

**Fix:** Use `express.text({ type: '*/*' })` untuk webhook endpoint

### Signature Validation Failed

**Cause:** Body sudah di-parse sebelum signature verification

**Fix:** Preserve raw body untuk signature check

### LINE replyMessage undefined

**Cause:** Import method salah

**Fix:** Gunakan `line.LineBotClient.fromChannelAccessToken()` bukan `new line.LineBotClient()`

### MiniMax returns "Maaf, tidak ada respons"

**Cause:** Response format berbeda dari expected

**Fix:** Parse `data.content` array (bukan `data.choices[0].message.content`)
MiniMax M2.7 returns content as array: `[{type: "text", text: "..."}]`

---

## Message Types Supported

### Text Message
```javascript
{
  type: 'text',
  text: 'Hello, world!'
}
```

### Sticker
```javascript
{
  type: 'sticker',
  packageId: '1',
  stickerId: '1'
}
```

### Quick Reply
```javascript
{
  type: 'text',
  text: 'Select option',
  quickReply: {
    items: [
      { type: 'action', action: { type: 'message', label: 'Option 1', text: 'opt1' } },
    ]
  }
}
```

---

## API Reference

### LINE Messaging API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/bot/message/reply` | POST | Reply to user |
| `/v2/bot/message/push` | POST | Push to user |
| `/v2/bot/message/multicast` | POST | Push to multiple |
| `/v2/bot/message/broadcast` | POST | Broadcast all |

### LINE Login OAuth

| Endpoint | Purpose |
|----------|---------|
| `https://access.line.me/oauth2/v2.1/authorize` | Authorization URL |
| `POST https://api.line.me/oauth2/v2.1/token` | Get access token |
| `POST https://api.line.me/oauth2/v2.1/verify` | Verify token |
| `POST https://api.line.me/oauth2/v2.1/revoke` | Revoke token |

---

## Security Notes

1. **Never commit .env** - sudah di-.gitignore
2. **Verify webhook signature** - pastikan request dari LINE
3. **Use HTTPS** - LINE requires HTTPS for webhook
4. **PKCE for LINE Login** - recommended untuk OAuth flow

---

## Resources

- [LINE Messaging API Docs](https://developers.line.biz/en/docs/messaging-api/)
- [LINE Login Docs](https://developers.line.biz/en/docs/line-login/)
- [LINE Bot SDK Node.js](https://line.github.io/line-bot-sdk-nodejs/)
- [LIFF SDK](https://developers.line.biz/en/docs/liff/)
- [@line/bot-sdk npm](https://www.npmjs.com/package/@line/bot-sdk)

---

## Progress (2026-04-15)

### ✅ Completed

- LINE Channel created (ID: 2009809706)
- Server.js webhook handler working
- MiniMax API integration working
- LINE Bot responding to messages

### ⏳ Next Steps

1. **Rich Menu** - Buat menu di LINE Console
2. **Flex Message** - Format response yang lebih menarik
3. **Deploy** - Production hosting (Railway/Render/Heroku)

---

*Last updated: 2026-04-15*