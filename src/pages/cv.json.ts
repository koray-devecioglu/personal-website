/**
 * /cv.json — machine-readable CV.
 *
 * Serves the validated JSON Resume 1.0.0 payload. Handy for
 *   - job-board integrations that ingest JSON Resume directly
 *   - custom resume-writer CLIs
 *   - being able to grep my own CV without opening a browser
 *
 * Private-meta fields (those starting with `_`, like `_placeholder`
 * and `_note`) are stripped here — they're useful for humans editing
 * the JSON, not for consumers.
 */
import type { APIRoute } from "astro";
import { loadResume } from "../lib/resume";

export const GET: APIRoute = () => {
  const resume = loadResume();
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(resume)) {
    if (key.startsWith("_")) continue;
    payload[key] = value;
  }

  // JSON Resume recommends advertising the schema version used.
  payload.meta = {
    version: "v1.0.0",
    canonical: "https://jsonresume.org/schema/",
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
