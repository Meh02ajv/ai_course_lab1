const express = require("express");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

const buildAnalysisPrompt = (transcript) => `
You are an expert educational AI assistant. Analyze the following transcript and return a structured JSON response.

TRANSCRIPT:
"""
${transcript}
"""

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "summary": "A comprehensive 3-5 paragraph executive summary in markdown format with **bold** key terms",
  "keyTakeaways": ["First key takeaway", "Second key takeaway", "Third key takeaway"],
  "actionItems": [{ "task": "Action item", "priority": "High", "deadline": null, "assignee": null }],
  "studyTopics": ["Topic 1 for YouTube", "Topic 2 for YouTube", "Topic 3 for YouTube"],
  "difficulty": "Beginner",
  "estimatedReadTime": 5
}

Rules:
- keyTakeaways: 4-8 complete sentences
- actionItems: priority must be "High", "Medium", or "Low"
- studyTopics: 3-6 specific searchable YouTube topics
- difficulty: exactly "Beginner", "Intermediate", or "Advanced"
- estimatedReadTime: integer in minutes
`;

const formatDuration = (iso) => {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const h = parseInt(match[1] || 0), m = parseInt(match[2] || 0), s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const searchYouTube = async (topics) => {
  if (!process.env.YOUTUBE_API_KEY) { console.warn("[YouTube] API key not configured"); return []; }
  const videos = [], seen = new Set();

  for (const topic of topics.slice(0, 4)) {
    try {
      const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: process.env.YOUTUBE_API_KEY, q: topic, part: "snippet",
          type: "video", maxResults: 3, order: "relevance", videoDuration: "medium",
        },
        timeout: 8000,
      });

      const items = searchRes.data.items || [];
      const videoIds = items.map((i) => i.id.videoId).join(",");
      let statsMap = {};

      if (videoIds) {
        try {
          const statsRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
            params: { key: process.env.YOUTUBE_API_KEY, id: videoIds, part: "statistics,contentDetails" },
            timeout: 5000,
          });
          statsRes.data.items?.forEach((v) => {
            statsMap[v.id] = {
              viewCount: v.statistics?.viewCount,
              duration: formatDuration(v.contentDetails?.duration),
            };
          });
        } catch (_) { }
      }

      for (const item of items) {
        const vid = item.id.videoId;
        if (seen.has(vid)) continue;
        seen.add(vid);
        videos.push({
          videoId: vid,
          title: item.snippet.title,
          description: item.snippet.description?.slice(0, 200) || "",
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          viewCount: statsMap[vid]?.viewCount,
          duration: statsMap[vid]?.duration,
          url: `https://www.youtube.com/watch?v=${vid}`,
        });
      }
    } catch (err) { console.error(`[YouTube] Search failed for "${topic}":`, err.message); }
  }
  return videos;
};

router.post("/analyze", async (req, res) => {
  const { transcript, sessionId } = req.body;
  if (!transcript || transcript.trim().length < 10)
    return res.status(400).json({ success: false, error: "Transcript is too short or missing" });
  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ success: false, error: "Gemini API key not configured" });

  try {
    console.log(`[Analyze] Session: ${sessionId}`);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      generationConfig: { temperature: 0.3, topP: 0.8, maxOutputTokens: 4096 },
    });

    const result = await model.generateContent(buildAnalysisPrompt(transcript));
    const rawText = result.response.text().trim();

    let analysis;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    analysis.keyTakeaways = Array.isArray(analysis.keyTakeaways) ? analysis.keyTakeaways : [];
    analysis.actionItems = Array.isArray(analysis.actionItems) ? analysis.actionItems : [];
    analysis.studyTopics = Array.isArray(analysis.studyTopics) ? analysis.studyTopics : [];
    analysis.difficulty = ["Beginner", "Intermediate", "Advanced"].includes(analysis.difficulty)
      ? analysis.difficulty : "Intermediate";
    analysis.estimatedReadTime = parseInt(analysis.estimatedReadTime) || 5;

    const videos = await searchYouTube(analysis.studyTopics);
    console.log(`[YouTube] Found ${videos.length} videos`);

    return res.json({ success: true, data: { analysis, videos } });
  } catch (err) {
    console.error("[Analyze Error]", err.message);
    return res.status(500).json({ success: false, error: err.message || "Analysis failed" });
  }
});

module.exports = router;