export function extractQuote(plaintext) {
  if (!plaintext) return '';

  const sentences = plaintext
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (!sentences.length) return '';

  const scored = sentences.map((s) => {
    let score = 0;
    const len = s.length;

    // Sweet spot for a pull quote
    if (len >= 60 && len <= 200) score += 4;
    else if (len > 200 && len <= 300) score += 1;
    else if (len < 40) score -= 3;

    // First-person voice is engaging
    if (/\bI\b/.test(s)) score += 3;
    if (/\bwe\b/i.test(s)) score += 1;

    // Direct speech / quoted material already punchy
    if (/["""]/.test(s)) score += 2;

    // Exclamatory or strong phrasing
    if (s.endsWith('!')) score += 2;

    // Strong superlatives / absolutes
    if (/\b(never|always|every|most|best|worst|fastest|first|last|only|nothing|everything)\b/i.test(s)) score += 2;

    // Avoid dry/structural starters
    if (/^(The |A |An |It |This |That |In |On |At |By |For |With |But |And |So |When |After |Before )/.test(s)) score -= 1;

    // Avoid sentences with too many commas (likely lists)
    if ((s.match(/,/g) ?? []).length > 3) score -= 2;

    // Avoid sentences with parenthetical asides
    if (s.includes('(') || s.includes('[')) score -= 1;

    // Skip very first sentence — usually a dek restatement
    if (sentences.indexOf(s) === 0) score -= 2;

    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.s ?? sentences[0];
}
