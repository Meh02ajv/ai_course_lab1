require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const rateLimit = require("express-rate-limit").rateLimit;

const transcribeRouter = require("./routes/transcribe");
const analyzeRouter    = require("./routes/analyze");
const chatRouter       = require("./routes/chat");
const exportRouter     = require("./routes/export");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
  credentials: true,
}));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." },
}));
app.use("/api/transcribe", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/api/analyze", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/api/chat", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/api/export-pdf", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api", transcribeRouter);
app.use("/api", analyzeRouter);
app.use("/api", chatRouter);
app.use("/api", exportRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      assemblyai: !!process.env.ASSEMBLYAI_API_KEY,
      gemini:     !!process.env.GEMINI_API_KEY,
      youtube:    !!process.env.YOUTUBE_API_KEY,
    },
  });
});

app.use((_req, res) => res.status(404).json({ success: false, error: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error("[Error]", err.message);
  const status = err.code === "LIMIT_FILE_SIZE" ? 413
    : err.message === "Invalid file type." ? 415
    : err.status || 500;
  res.status(status).json({ success: false, error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 StudyBuddy AI Backend running on http://localhost:${PORT}`);
  console.log(`   AssemblyAI : ${process.env.ASSEMBLYAI_API_KEY ? "✅" : "❌ Missing"}`);
  console.log(`   Gemini     : ${process.env.GEMINI_API_KEY     ? "✅" : "❌ Missing"}`);
  console.log(`   YouTube    : ${process.env.YOUTUBE_API_KEY    ? "✅" : "❌ Missing"}\n`);
});

module.exports = app;