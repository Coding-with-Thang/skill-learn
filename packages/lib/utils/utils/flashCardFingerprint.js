/**
 * Flash card fingerprint for deduplication
 * Hash of normalized question + answer to detect duplicates when sharing
 */

/**
 * Normalize text for fingerprint: lowercase, trim, collapse whitespace
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Simple hash for fingerprint (non-crypto, sufficient for dedup)
 * @param {string} str
 * @returns {string}
 */
function hash(str) {
  let h = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return Math.abs(h).toString(36);
}

/**
 * Compute fingerprint for a flash card
 * @param {string} question
 * @param {string} answer
 * @returns {string}
 */
export function computeFingerprint(question, answer) {
  const nq = normalize(question);
  const na = normalize(answer);
  return hash(`${nq}::${na}`);
}
