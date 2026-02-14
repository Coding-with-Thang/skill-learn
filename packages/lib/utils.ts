import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

/**
 * Extracts plain text from ProseMirror/Tiptap JSON format.
 * If the value is stored as JSON (e.g. {"type":"doc","content":[...]}), returns the concatenated text.
 * Otherwise returns the value as-is (plain string).
 * @param {string|object|null|undefined} value - The stored description (string or parsed JSON)
 * @returns {string} Plain text content
 */
export function extractTextFromProseMirror(value) {
  if (value == null || value === "") return "";

  let doc = value;
  if (typeof value === "string") {
    try {
      doc = JSON.parse(value);
    } catch {
      return value; // Plain string, return as-is
    }
  }

  if (typeof doc !== "object" || doc?.type !== "doc" || !Array.isArray(doc?.content)) {
    return typeof value === "string" ? value : "";
  }

  function extractFromNode(node) {
    if (!node) return "";
    if (node.type === "text" && node.text) return node.text;
    if (Array.isArray(node.content)) {
      return node.content.map(extractFromNode).join("");
    }
    return "";
  }

  return doc.content.map(extractFromNode).join("\n").trim();
}
