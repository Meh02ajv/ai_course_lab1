const test = require("node:test");
const assert = require("node:assert/strict");
const { escapeHtml } = require("../src/utils/html");
const { selectRelevantContext } = require("../src/utils/transcriptContext");

test("escapeHtml encodes markup that could execute when embedded in PDF HTML", () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script> & "notes"'),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &quot;notes&quot;"
  );
});

test("selectRelevantContext retrieves matching transcript content beyond the opening section", () => {
  const transcript = [
    "The course begins with a brief welcome and housekeeping notes.",
    "Photosynthesis converts light energy into chemical energy in chloroplasts. Chlorophyll absorbs light, and the Calvin cycle fixes carbon dioxide into sugars.",
  ].join("\n\n");

  const context = selectRelevantContext(transcript, "How does the Calvin cycle fix carbon dioxide?");
  assert.match(context, /Calvin cycle fixes carbon dioxide/);
  assert.doesNotMatch(context, /brief welcome/);
});
