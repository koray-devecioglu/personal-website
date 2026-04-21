/**
 * Open Graph image generator.
 *
 * `renderOgCard({ title, eyebrow, footer })` returns a PNG buffer sized
 * 1200×630 — the Facebook/Twitter/Slack-safe default. Invoked at build
 * time by the `/og/[slug].png.ts` endpoint; no runtime server required.
 *
 * Design:
 *   - Cream background, matching the light-theme paper tone.
 *   - Fraunces 600 title, auto-fit between 56px and 96px based on length.
 *   - Muted eyebrow above, accent rule below the title block.
 *   - Footer row with site name and the post date / type.
 *
 * Satori requires TrueType, OpenType, or WOFF (not WOFF2). We load
 * Fraunces from `@fontsource/fraunces`' woff files at build time; only
 * two weights are pulled (400 and 600) to keep memory low.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

import { SITE } from "../data/links";

const WIDTH = 1200;
const HEIGHT = 630;

// Cached across calls; loaded once per build process.
let cachedFonts: Array<{
  name: string;
  data: Buffer;
  weight: 400 | 600;
  style: "normal";
}> | null = null;

function loadFonts() {
  if (cachedFonts) return cachedFonts;

  // Resolve relative to the repo root so the build works from any cwd.
  const root = resolve(process.cwd());
  const fraunces400 = readFileSync(
    resolve(
      root,
      "node_modules/@fontsource/fraunces/files/fraunces-latin-400-normal.woff",
    ),
  );
  const fraunces600 = readFileSync(
    resolve(
      root,
      "node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff",
    ),
  );

  cachedFonts = [
    { name: "Fraunces", data: fraunces400, weight: 400, style: "normal" },
    { name: "Fraunces", data: fraunces600, weight: 600, style: "normal" },
  ];
  return cachedFonts;
}

export interface OgCardInput {
  /** Small uppercase label above the title (e.g. the post type). */
  eyebrow: string;
  /** The main headline. */
  title: string;
  /** Small right-aligned footer text (e.g. a humanised date). */
  footer?: string;
}

/** Auto-fit a title to the card. Long titles shrink; short titles grow. */
function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 40) return 92;
  if (len <= 70) return 80;
  if (len <= 110) return 68;
  return 56;
}

export async function renderOgCard(input: OgCardInput): Promise<Buffer> {
  const fonts = loadFonts();

  const accent = "#c08a3e"; // OKLCH warm ochre, baked to hex for satori.
  const bg = "#faf6ee";
  const ink = "#1d1712";
  const muted = "#6a6058";

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: bg,
          fontFamily: "Fraunces",
          color: ink,
        },
        children: [
          // Top band: eyebrow + title
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column" },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 26,
                      color: muted,
                      textTransform: "uppercase",
                      letterSpacing: 4,
                      marginBottom: 32,
                      fontWeight: 400,
                    },
                    children: input.eyebrow,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: titleFontSize(input.title),
                      lineHeight: 1.1,
                      fontWeight: 600,
                      letterSpacing: -1,
                    },
                    children: input.title,
                  },
                },
              ],
            },
          },
          // Accent rule
          {
            type: "div",
            props: {
              style: {
                width: 120,
                height: 6,
                background: accent,
                borderRadius: 3,
              },
            },
          },
          // Footer row: site name / date
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 24,
                color: muted,
                fontWeight: 400,
              },
              children: [
                { type: "div", props: { children: SITE.domain } },
                { type: "div", props: { children: input.footer ?? "" } },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: fonts.map((f) => ({ ...f, data: f.data })),
    },
  );

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  })
    .render()
    .asPng();

  return Buffer.from(png);
}
