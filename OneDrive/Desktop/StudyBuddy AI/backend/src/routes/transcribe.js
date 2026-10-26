const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const axios   = require("axios");
const FormData = require("form-data");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `audio-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/mp3","audio/mpeg","audio/wav","audio/webm",
                     "audio/ogg","audio/mp4","audio/x-m4a","audio/aac",
                     "audio/m4a","video/mp4"];
    if (allowed.includes(file.mimetype) ||
        file.originalname.match(/\.(mp3|wav|webm|ogg|m4a|mp4|aac)$/i))
      cb(null, true);
    else cb(new Error("Invalid file type."), false);
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

// ── Upload file to AssemblyAI ──────────────────────────────
const uploadToAssemblyAI = async (filePath, apiKey) => {
  console.log("[Transcribe] Uploading file to AssemblyAI...");
  const fileStream = fs.createReadStream(filePath);
  const response   = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    fileStream,
    {
      headers: {
        "Authorization":  apiKey,
        "Content-Type":   "application/octet-stream",
        "Transfer-Encoding": "chunked",
      },
      maxContentLength: Infinity,
      maxBodyLength:    Infinity,
      timeout:          300000,
    }
  );
  console.log("[Transcribe] ✅ File uploaded:", response.data.upload_url);
  return response.data.upload_url;
};

// ── Submit transcription job ───────────────────────────────
const submitTranscription = async (audioUrl, apiKey) => {
  console.log("[Transcribe] Submitting transcription job...");
  const response = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    {
      audio_url:          audioUrl,
      language_detection: true,
      punctuate:          true,
      format_text:        true,
    },
    {
      headers: {
        "Authorization": apiKey,
        "Content-Type":  "application/json",
      },
      timeout: 30000,
    }
  );
  console.log("[Transcribe] ✅ Job submitted, ID:", response.data.id);
  return response.data.id;
};

// ── Poll for transcription result ─────────────────────────
const pollTranscription = async (transcriptId, apiKey) => {
  console.log("[Transcribe] Polling for result...");
  const maxAttempts = 120; // 10 minutes max
  const delay       = 5000; // poll every 5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delay));

    const response = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: { "Authorization": apiKey },
        timeout: 30000,
      }
    );

    const { status, text, error, audio_duration, confidence } = response.data;
    console.log(`[Transcribe] Poll ${i + 1}/${maxAttempts}: ${status}`);

    if (status === "completed") {
      console.log(`[Transcribe] ✅ Done! Words: ${text?.split(" ").length}`);
      return { text, audio_duration, confidence };
    }

    if (status === "error") {
      throw new Error(error || "Transcription failed");
    }
    // status === "processing" or "queued" → keep polling
  }

  throw new Error("Transcription timed out after 10 minutes");
};

// ── POST /api/transcribe ───────────────────────────────────
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (!req.file)
      return res.status(400).json({ success: false, error: "No audio file provided" });

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey)
      return res.status(500).json({ success: false, error: "AssemblyAI API key not configured" });

    console.log(`[Transcribe] File: ${req.file.filename} | Size: ${(req.file.size/1024/1024).toFixed(1)}MB`);

    // Step 1: Upload file
    const uploadUrl = await uploadToAssemblyAI(filePath, apiKey);

    // Step 2: Submit job
    const transcriptId = await submitTranscription(uploadUrl, apiKey);

    // Step 3: Poll for result
    const { text, audio_duration, confidence } = await pollTranscription(transcriptId, apiKey);

    // Cleanup
    fs.unlink(filePath, () => {});

    return res.json({
      success: true,
      data: {
        transcript: text,
        sessionId:  req.body.sessionId || `session-${Date.now()}`,
        duration:   audio_duration,
        confidence: confidence,
      },
    });

  } catch (err) {
    console.error("[Transcribe Error]", err.message);
    if (filePath && fs.existsSync(filePath)) fs.unlink(filePath, () => {});
    return res.status(500).json({
      success: false,
      error: err.message || "Transcription failed",
    });
  }
});

module.exports = router;
