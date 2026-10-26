const express = require("express");
const puppeteer = require("puppeteer");
const { randomUUID } = require("crypto");
const { escapeHtml } = require("../utils/html");

const router = express.Router();

const buildPdfHtml = (transcript, analysis, sessionId) => {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const difficulty = ["Beginner", "Intermediate", "Advanced"].includes(analysis.difficulty)
    ? analysis.difficulty : "Intermediate";
  const estimatedReadTime = Math.max(1, Math.min(240, Number.parseInt(analysis.estimatedReadTime, 10) || 5));
  const safeSessionId = escapeHtml(typeof sessionId === "string" ? sessionId.slice(0, 8) : "N/A");

  const takeawaysHtml = (analysis.keyTakeaways || []).map((t, i) => `
    <div class="takeaway-item">
      <span class="takeaway-num">${i + 1}</span>
      <p>${escapeHtml(t)}</p>
    </div>`).join("");

  const actionItemsHtml = (analysis.actionItems || []).length === 0
    ? "<p class='empty'>No action items identified.</p>"
    : `<table><thead><tr><th>Task</th><th>Priority</th><th>Deadline</th><th>Assignee</th></tr></thead><tbody>
        ${(analysis.actionItems || []).map((a) => `
          <tr>
            <td>${escapeHtml(a.task)}</td>
            <td><span class="priority priority-${escapeHtml(String(a.priority || "").toLowerCase().replace(/[^a-z-]/g, ""))}">${escapeHtml(a.priority)}</span></td>
            <td>${escapeHtml(a.deadline || "—")}</td>
            <td>${escapeHtml(a.assignee || "—")}</td>
          </tr>`).join("")}
       </tbody></table>`;

  const topicsHtml = (analysis.studyTopics || []).map((t) => `<span class="topic-tag">${escapeHtml(t)}</span>`).join("");
  const transcriptPreview = escapeHtml((transcript || "").slice(0, 1500) + (transcript?.length > 1500 ? "\n\n[Transcript truncated…]" : ""));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>StudyBuddy AI — Study Guide</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #1e293b; font-size: 13px; line-height: 1.7; }
    .cover { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%); color: white; padding: 60px 50px; }
    .cover-badge { display: inline-block; background: rgba(99,102,241,0.3); border: 1px solid rgba(99,102,241,0.5);
                   color: #a5b4fc; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 600;
                   letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
    .cover h1 { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #818cf8, #c084fc, #38bdf8);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
    .cover-meta { color: #94a3b8; font-size: 12px; margin-top: 12px; display: flex; gap: 20px; }
    .content { padding: 40px 50px; }
    .section { margin-bottom: 36px; }
    .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
                      padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
    .section-icon { width: 32px; height: 32px; border-radius: 8px; display: flex;
                    align-items: center; justify-content: center; font-size: 16px; }
    .section-header h2 { font-size: 16px; font-weight: 700; color: #0f172a; }
    .summary-text { color: #334155; line-height: 1.8; }
    .summary-text strong { color: #4f46e5; }
    .takeaway-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 14px;
                     background: #f8fafc; border-left: 3px solid #6366f1;
                     border-radius: 0 8px 8px 0; margin-bottom: 8px; }
    .takeaway-num { width: 22px; height: 22px; background: #6366f1; color: white; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .takeaway-item p { color: #334155; font-size: 12.5px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1e293b; color: #e2e8f0; padding: 10px 14px; text-align: left; font-weight: 600; }
    td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) td { background: #f8fafc; }
    .priority { padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .priority-high   { background: #fee2e2; color: #dc2626; }
    .priority-medium { background: #fef3c7; color: #d97706; }
    .priority-low    { background: #dcfce7; color: #16a34a; }
    .topics-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .topic-tag { padding: 5px 14px; background: linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.1));
                 border: 1px solid rgba(99,102,241,0.3); color: #4f46e5; border-radius: 20px;
                 font-size: 11.5px; font-weight: 500; }
    .transcript-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
                      padding: 16px 20px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px;
                      color: #475569; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0;
              display: flex; justify-content: space-between; color: #94a3b8; font-size: 11px; }
    .empty { color: #94a3b8; font-style: italic; }
    .difficulty-badge { display: inline-block; padding: 3px 12px; border-radius: 12px;
                        font-size: 11px; font-weight: 600; margin-left: 8px; }
    .difficulty-Beginner     { background: #dcfce7; color: #16a34a; }
    .difficulty-Intermediate { background: #fef3c7; color: #d97706; }
    .difficulty-Advanced     { background: #fee2e2; color: #dc2626; }
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-badge">📚 StudyBuddy AI</div>
    <h1>Study Guide</h1>
    <p style="color:#94a3b8;font-size:13px;margin-top:6px;">
      AI-Generated Notes &amp; Analysis
      <span class="difficulty-badge difficulty-${difficulty}">${difficulty}</span>
    </p>
    <div class="cover-meta">
      <span>📅 ${date}</span>
      <span>⏱️ ~${estimatedReadTime} min read</span>
      <span>🆔 ${safeSessionId}</span>
    </div>
  </div>
  <div class="content">
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#eef2ff;">✨</div>
        <h2>Executive Summary</h2>
      </div>
      <div class="summary-text">${escapeHtml(analysis.summary || "No summary available.")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br/>")}</div>
    </div>
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#f0fdf4;">📌</div>
        <h2>Key Takeaways</h2>
      </div>
      ${takeawaysHtml || "<p class='empty'>No takeaways identified.</p>"}
    </div>
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#fff7ed;">✅</div>
        <h2>Action Items</h2>
      </div>
      ${actionItemsHtml}
    </div>
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#fdf4ff;">🎯</div>
        <h2>Study Topics</h2>
      </div>
      <div class="topics-wrap">${topicsHtml}</div>
    </div>
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#eff6ff;">📝</div>
        <h2>Original Transcript</h2>
      </div>
      <div class="transcript-box">${transcriptPreview}</div>
    </div>
    <div class="footer">
      <span>Generated by StudyBuddy AI</span>
      <span>${date}</span>
    </div>
  </div>
</body>
</html>`;
};

router.post("/export-pdf", async (req, res) => {
  const { sessionId, transcript = "", analysis } = req.body || {};
  if (!analysis || typeof analysis !== "object" || Array.isArray(analysis))
    return res.status(400).json({ success: false, error: "Analysis data is required" });
  if (typeof transcript !== "string" || transcript.length > 1_000_000)
    return res.status(400).json({ success: false, error: "Transcript is invalid or too large" });

  let browser;
  try {
    const html = buildPdfHtml(transcript, analysis, sessionId);
    const filename = `study-guide-${randomUUID().slice(0, 8)}.pdf`;
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });
    const pdf = await page.pdf({
      format: "A4", printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await browser.close();
    browser = null;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-store");
    return res.send(Buffer.from(pdf));
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error("[Export Error]", err.message);
    return res.status(500).json({ success: false, error: "PDF generation failed" });
  }
});

module.exports = router;