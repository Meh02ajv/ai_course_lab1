const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { selectRelevantContext } = require("../utils/transcriptContext");

const router = express.Router();

const buildChatPrompt = (transcript) => `
You are StudyBuddy AI, an intelligent study assistant. Answer questions STRICTLY based on the transcript below.

RULES:
1. Only use information from the transcript
2. If the answer is not in the transcript, say: "I couldn't find that information in your notes."
3. Be concise, clear, and educational
4. Use markdown formatting (bullet points, bold, headers)
5. Never make up facts or add external information

TRANSCRIPT CONTEXT:
"""
${transcript.slice(0, 12000)}
"""
`;

router.post("/chat", async (req, res) => {
  const { message, transcript, sessionId, history = [] } = req.body || {};
  if (typeof message !== "string" || !message.trim() || message.length > 1000)
    return res.status(400).json({ success: false, error: "Message must be between 1 and 1000 characters" });
  if (typeof transcript !== "string" || !transcript.trim() || transcript.length > 1_000_000)
    return res.status(400).json({ success: false, error: "Transcript context is missing or too large" });
  if (!Array.isArray(history))
    return res.status(400).json({ success: false, error: "Chat history must be a list" });
  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ success: false, error: "Gemini API key not configured" });

  try {
    console.log(`[Chat] Session: ${sessionId} | Message: "${message.slice(0, 60)}"`);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      generationConfig: { temperature: 0.4, topP: 0.9, maxOutputTokens: 2048 },
      systemInstruction: buildChatPrompt(selectRelevantContext(transcript, message)),
    });

    const chatHistory = history
      .filter((m) => typeof m?.content === "string" && m.content.trim())
      .slice(-10)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content.slice(0, 4000) }],
      }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const answer = result.response.text();

    return res.json({ success: true, data: { answer, sessionId } });
  } catch (err) {
    console.error("[Chat Error]", err.message);
    return res.status(500).json({ success: false, error: err.message || "Chat failed" });
  }
});

module.exports = router;