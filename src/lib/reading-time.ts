/**
 * Reading-time estimator.
 *
 * The target is 240 WPM, which is the "comfortable non-fiction" rate
 * Medium and many research desks settle on — a touch slower than the
 * 265 WPM average so long-form technical prose doesn't look artificially
 * quick. Code blocks, tables, and frontmatter are stripped first, so a
 * post with a 50-line code block doesn't claim twelve minutes.
 *
 * Output is a minimum of 1 minute — anything shorter rounds up, because
 * "< 1 min read" is noisier than "1 min read".
 */

const WORDS_PER_MINUTE = 240;

export interface ReadingTime {
  minutes: number;
  words: number;
}

export function readingTime(raw: string): ReadingTime {
  const words = countWords(stripNoise(raw));
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return { minutes, words };
}

/** Remove things that shouldn't count as "reading" — fenced code,
 * inline code, HTML blocks, frontmatter, link URLs (keep link text). */
function stripNoise(input: string): string {
  return input
    .replace(/^---[\s\S]*?\n---\s*/m, "") // YAML frontmatter
    .replace(/```[\s\S]*?```/g, "") // fenced code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!\[[^\]]*]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1") // keep link text, drop URLs
    .replace(/<[^>]+>/g, ""); // HTML tags (MDX components, etc.)
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
