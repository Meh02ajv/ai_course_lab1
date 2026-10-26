# 🧠 StudyBuddy AI

> **Turn any audio recording into a complete AI-powered study guide — instantly.**

StudyBuddy AI is a full-stack application that records or accepts audio files, transcribes them using AssemblyAI, analyzes the content with Google Gemini, and delivers summaries, key takeaways, action items, a Q&A chatbot, YouTube recommendations, and a downloadable PDF study guide.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙️ **Live Recording** | Record directly from your microphone via the browser |
| 📁 **File Upload** | Upload MP3, WAV, WebM, OGG, or M4A files (up to 100MB) |
| 📝 **Speech-to-Text** | High-accuracy transcription via AssemblyAI |
| 🤖 **AI Summarization** | Executive summary, key takeaways & action items via Gemini |
| 💬 **Transcript Q&A** | Ask questions using relevant passages retrieved from your transcript |
| ▶️ **YouTube Recs** | Auto-fetched video recommendations per study topic |
| 📄 **PDF Export** | Download a beautifully styled PDF study guide |
| 🎨 **Calm UI** | Warm neutral palette, clear typography, and restrained accents |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **React Hot Toast** — notifications
- **React Markdown** — markdown rendering
- **Lucide React** — icons
- **Axios** — HTTP client

### Backend
- **Node.js** + **Express.js**
- **Multer** — audio file handling
- **express-rate-limit** — per-IP request limits for API endpoints
- **AssemblyAI SDK** — speech-to-text
- **@google/generative-ai** — Gemini LLM
- **Puppeteer** — PDF generation
- **dotenv** — environment management

---

## 📁 Project Structure

```
StudyBuddy AI/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── AudioCapture.tsx
│   │   │   ├── TranscriptPanel.tsx
│   │   │   ├── AnalysisPanel.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── YouTubePanel.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   └── ProcessingStatus.tsx
│   │   ├── hooks/
│   │   │   └── useAudioRecorder.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   └── routes/
│   │       ├── transcribe.js
│   │       ├── analyze.js
│   │       ├── chat.js
│   │       └── export.js
│   ├── uploads/                 # Temporary audio files, removed after processing
│   ├── .env
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v22.12+ | https://nodejs.org |
| **npm** | v9+ | Included with Node.js |

---

## 🔑 API Keys Setup

### 1. AssemblyAI (Speech-to-Text)
1. Go to **https://www.assemblyai.com/**
2. Click **"Sign Up Free"**
3. Go to **Dashboard → API Keys** → Copy your key
> 💡 Free tier: **100 hours/month**

### 2. Google Gemini (AI Analysis + Chat)
1. Go to **https://aistudio.google.com/**
2. Click **"Get API Key"** → **"Create API key"** → Copy your key
> 💡 Free tier: **15 requests/min**, **1M tokens/day**

### 3. YouTube Data API v3
1. Go to **https://console.cloud.google.com/**
2. Create a project → Enable **YouTube Data API v3**
3. Go to **Credentials** → **Create API Key** → Copy your key
> 💡 Free tier: **10,000 units/day**

---

## ⚙️ Installation & Setup

### Step 1 — Install dependencies
```bash
# Install root
npm install

# Install frontend
cd frontend && npm install && cd ..

# Install backend
cd backend && npm install && cd ..
```

### Step 2 — Configure environment variables

#### `backend/.env`
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
GEMINI_API_KEY=your_gemini_key_here
YOUTUBE_API_KEY=your_youtube_key_here
```

#### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3 — Run the application
```bash
# Run both together (recommended)
npm run dev

# Or separately:
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Step 4 — Open in browser
```
Frontend : http://localhost:3000
Backend  : http://localhost:5000/api/health
```

---

## 🧪 Quick Test Flow
1. Open `http://localhost:3000`
2. Click the microphone and record 30–60 seconds
3. Click **"Transcribe & Analyze"**
4. Explore Summary, Takeaways, Action Items, Topics
5. Ask the chatbot a question
6. Browse YouTube recommendations
7. Click **"Export PDF Study Guide"**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/api/health`                  | Server health check       |
| `POST` | `/api/transcribe`              | Upload audio → transcript |
| `POST` | `/api/analyze`                 | Transcript → AI analysis  |
| `POST` | `/api/chat`                    | Retrieval-based transcript Q&A |
| `POST` | `/api/export-pdf`              | Generate and stream a PDF study guide |

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| Microphone not working | Allow mic permissions in browser, use Chrome/Edge |
| AssemblyAI error | Check `ASSEMBLYAI_API_KEY` in `backend/.env` |
| Gemini API error | Check `GEMINI_API_KEY`, check rate limits (15 req/min) |
| YouTube not showing | Check `YOUTUBE_API_KEY`, ensure API is enabled |
| PDF export fails | Run `cd backend && npm install` to reinstall Puppeteer |
| Port in use | Run `npx kill-port 3000` or `npx kill-port 5000` |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend && npx vercel --prod
```
Set `NEXT_PUBLIC_API_URL=https://your-backend.com/api` in Vercel dashboard.

### Backend → Railway / Render
1. Push to GitHub
2. Connect repo to Railway or Render
3. Set root directory to `backend/`
4. Add all env variables
5. Deploy ✅

The API applies per-IP limits (100 requests per 15 minutes overall, with lower limits for transcription, analysis, chat, and PDF generation). The default rate-limit store is in-memory and is intended for a single backend instance; use a shared store and add authentication before running multiple instances or opening the service broadly to the public.

---

## 📄 License
MIT License — free to use, modify, and distribute.

---

<div align="center">
  <p>Built with ❤️ by the StudyBuddy AI Team</p>
  <p>
    <a href="https://assemblyai.com">AssemblyAI</a> ·
    <a href="https://aistudio.google.com">Google AI Studio</a> ·
    <a href="https://nextjs.org">Next.js</a>
  </p>
</div>