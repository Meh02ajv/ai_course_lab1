const STOP_WORDS = new Set([
  "about", "after", "again", "also", "and", "are", "because", "been", "before", "being",
  "between", "could", "does", "from", "have", "into", "just", "more", "most", "only", "other",
  "should", "some", "such", "than", "that", "their", "them", "there", "these", "they", "this",
  "those", "through", "under", "very", "what", "when", "where", "which", "while", "with", "would",
  "your", "you", "the", "how", "can", "for", "was", "were", "will", "its", "not", "why",
]);

const termsIn = (text) => (String(text || "").toLowerCase().match(/[a-z0-9]{3,}/g) || [])
  .filter((term) => !STOP_WORDS.has(term));

const splitIntoChunks = (transcript, chunkSize = 900) => {
  const paragraphs = String(transcript || "").split(/\n+/).filter(Boolean);
  const chunks = [];

  for (const paragraph of paragraphs) {
    const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
    let current = "";
    for (const sentence of sentences) {
      if (sentence.length > chunkSize) {
        if (current) chunks.push(current);
        current = "";
        for (let i = 0; i < sentence.length; i += chunkSize) chunks.push(sentence.slice(i, i + chunkSize));
      } else if (current && current.length + sentence.length + 1 > chunkSize) {
        chunks.push(current);
        current = sentence;
      } else {
        current = current ? `${current} ${sentence}` : sentence;
      }
    }
    if (current) chunks.push(current);
  }
  return chunks;
};

const selectRelevantContext = (transcript, query, maxChars = 12000) => {
  const text = String(transcript || "");
  if (!text) return "";
  const queryTerms = new Set(termsIn(query));
  if (!queryTerms.size) return text.slice(0, maxChars);

  const chunks = splitIntoChunks(text);
  const ranked = chunks.map((chunk, index) => {
    const chunkTerms = new Set(termsIn(chunk));
    let score = 0;
    for (const term of queryTerms) if (chunkTerms.has(term)) score += 1;
    return { chunk, index, score };
  }).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  if (!ranked.length) return text.slice(0, maxChars);

  const chosen = [];
  let usedChars = 0;
  for (const item of ranked) {
    const extra = item.chunk.length + (chosen.length ? 2 : 0);
    if (usedChars + extra > maxChars) continue;
    chosen.push(item);
    usedChars += extra;
  }
  return chosen.sort((a, b) => a.index - b.index).map((item) => item.chunk).join("\n\n");
};

module.exports = { selectRelevantContext };
