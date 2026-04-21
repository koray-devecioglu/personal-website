#!/usr/bin/env node
/**
 * `pnpm build:cv` — generate a printable CV PDF from the built site.
 *
 * Flow:
 *   1. Assumes `astro build` has already run and `dist/` contains
 *      cv/print/index.html plus its assets.
 *   2. Spawns `astro preview` on a local port (default 4328).
 *   3. Launches headless Chromium (Playwright), loads
 *      http://127.0.0.1:<port>/cv/print, and calls page.pdf().
 *   4. Writes the result to `public/cv.pdf` so the *next* `astro build`
 *      picks it up as a static asset served at `/cv.pdf`.
 *
 * Why `public/cv.pdf` and not `dist/cv.pdf`?
 *   - Astro clears and rebuilds `dist/` on every build, so a PDF written
 *     there is thrown away.
 *   - Writing to `public/` makes the PDF a real, committable artifact
 *     that survives deploys without the build environment (Cloudflare
 *     Pages) needing Playwright + a browser.
 *
 * Why not do this as part of the default `astro build`?
 *   - Cloudflare Pages doesn't have Chromium preinstalled. We could
 *     `playwright install` during the build, but that's 300MB+ of
 *     download per deploy for no user-visible benefit.
 *   - Running it locally + committing the PDF is explicit, cheap, and
 *     makes review of CV changes visible in the diff.
 *
 * Usage:
 *   pnpm build && pnpm build:cv
 *
 * The script exits non-zero on any failure; CI can rely on it.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const OUT = resolve(ROOT, "public", "cv.pdf");
const PORT = Number.parseInt(process.env.CV_PDF_PORT ?? "4328", 10);

if (!existsSync(DIST)) {
  console.error(
    "[build-cv-pdf] dist/ not found. Run `pnpm build` first — this script" +
      " needs a built site to preview.",
  );
  process.exit(1);
}

// ── Preview server lifecycle ───────────────────────────────────────────

let server: ChildProcess | undefined;

function startPreview(): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    const baseUrl = `http://127.0.0.1:${PORT}`;
    server = spawn(
      "pnpm",
      ["exec", "astro", "preview", "--host", "127.0.0.1", "--port", String(PORT)],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
    );

    let settled = false;
    const resolveOnce = (value: string): void => {
      if (settled) return;
      settled = true;
      resolvePromise(value);
    };
    const rejectOnce = (reason: unknown): void => {
      if (settled) return;
      settled = true;
      rejectPromise(reason);
    };

    server.stdout?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      // astro preview prints the Local URL when it's ready to serve.
      if (text.includes("Local") || text.includes(baseUrl)) {
        resolveOnce(baseUrl);
      }
    });
    server.stderr?.on("data", (chunk: Buffer) => {
      process.stderr.write(chunk);
    });
    server.on("error", rejectOnce);
    server.on("exit", (code) => {
      if (!settled) {
        rejectOnce(new Error(`astro preview exited early with code ${code ?? "null"}`));
      }
    });

    // Safety net — if the "Local" line never appears, bail after 20s.
    setTimeout(() => {
      rejectOnce(new Error("astro preview didn't report readiness within 20s"));
    }, 20_000).unref();
  });
}

function stopPreview(): void {
  if (server && !server.killed) {
    server.kill("SIGTERM");
  }
}

// ── Render the PDF ─────────────────────────────────────────────────────

async function renderPdf(baseUrl: string): Promise<Buffer> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = `${baseUrl}/cv/print`;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (!response || !response.ok()) {
      throw new Error(`Failed to load ${url}: ${response?.status() ?? "no response"}`);
    }
    // Let Fraunces + Inter finish layout; `networkidle` doesn't fully
    // guarantee font swap has completed.
    await page.evaluate(async () => {
      if (document.fonts) await document.fonts.ready;
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "16mm", bottom: "16mm", left: "16mm" },
      preferCSSPageSize: true,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

// ── Main ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const outDir = dirname(OUT);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log(`[build-cv-pdf] starting astro preview on port ${PORT}…`);
  const baseUrl = await startPreview();

  console.log(`[build-cv-pdf] rendering ${baseUrl}/cv/print to PDF…`);
  const pdf = await renderPdf(baseUrl);

  writeFileSync(OUT, pdf);
  const sizeKb = Math.round(pdf.length / 1024);
  console.log(`[build-cv-pdf] wrote ${OUT.replace(ROOT + "/", "")} (${sizeKb} KB).`);
  console.log("[build-cv-pdf] done. Commit public/cv.pdf to publish the update.");
}

main()
  .catch((err: unknown) => {
    console.error("[build-cv-pdf]", err);
    process.exitCode = 1;
  })
  .finally(() => {
    stopPreview();
  });
