#!/usr/bin/env node
/**
 * `pnpm new-post` — scaffold a content file with valid frontmatter.
 *
 *   pnpm new-post --type essay --title "Welcome to the refit"
 *   pnpm new-post --type tutorial --title "Ship Astro content" --tags astro,tooling
 *   pnpm new-post --type bookmark --title "Zod cheatsheet" --url https://…
 *   pnpm new-post --type essay --title "Part two" --series building-this-site --mdx
 *
 * Flag-driven rather than interactive — scripts that prompt tend to
 * break CI, IDE runs, and headless environments. If you forget a flag
 * the script prints a one-page usage and exits non-zero.
 *
 * Everything the script writes passes the same Zod schema the runtime
 * uses (from `src/content/_schemas.ts`), so a fresh file is immediately
 * buildable.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { z } from "astro/zod";

import { ALLOWED_TAGS, type Tag } from "../src/content/_tags.ts";
import {
  bookmarkSchema,
  essaySchema,
  noteSchema,
  projectSchema,
  tilSchema,
  tutorialSchema,
} from "../src/content/_schemas.ts";

// ── Configuration ──────────────────────────────────────────────────────

const POST_TYPES = {
  essay: { folder: "essays", schema: essaySchema },
  tutorial: { folder: "tutorials", schema: tutorialSchema },
  til: { folder: "tils", schema: tilSchema },
  note: { folder: "notes", schema: noteSchema },
  project: { folder: "projects", schema: projectSchema },
  bookmark: { folder: "bookmarks", schema: bookmarkSchema },
} as const;

type PostType = keyof typeof POST_TYPES;

const USAGE = `
Usage: pnpm new-post --type <type> --title "<title>" [options]

Types:
  essay | tutorial | til | note | project | bookmark

Options:
  --type <type>          Required. One of the types above.
  --title "<text>"       Required. The post title.
  --slug <slug>          Optional. Defaults to kebab-cased title.
  --description "<text>" Optional. Defaults to a TODO placeholder.
  --tags <a,b,c>         Optional. Comma-separated; must be allowed.
  --series <slug>        Optional. Attach to an existing series.
  --url <url>            Required for --type bookmark.
  --mdx                  Use .mdx extension instead of .md.
  --draft                Mark the post as a draft.
  --help                 Show this help.

Allowed tags:
  ${ALLOWED_TAGS.join(", ")}
`;

// ── Entry point ────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exitCode = 1;
});

async function main() {
  const args = parseFlags();

  if (args.help) {
    console.log(USAGE);
    return;
  }

  const type = requireFlag(args.type, "--type") as PostType;
  if (!(type in POST_TYPES)) {
    fail(
      `Unknown --type "${type}". Expected one of: ${Object.keys(POST_TYPES).join(", ")}.`,
    );
  }

  const title = requireFlag(args.title, "--title");
  const slug = args.slug ? ensureSlug(args.slug) : slugify(title);
  const tags = parseTags(args.tags);
  const description =
    args.description ?? `TODO: write a one-sentence teaser for "${title}".`;

  const { folder, schema } = POST_TYPES[type];
  const extension = args.mdx ? ".mdx" : ".md";

  const frontmatter = buildFrontmatter({
    type,
    title,
    slug,
    description,
    tags,
    series: args.series,
    url: args.url,
    draft: Boolean(args.draft),
  });

  // Validate against the schema the runtime will use. If this throws,
  // something is wrong with the script itself — fix before shipping.
  schema(() => z.any()).parse({
    ...frontmatter,
    date: new Date(frontmatter.date),
  });

  const targetPath = resolve(repoRoot(), "src/content", folder, `${slug}${extension}`);

  if (existsSync(targetPath)) {
    fail(`Refusing to overwrite existing file: ${targetPath}`);
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, renderFile(frontmatter, type), "utf8");

  console.log(`✓ Created ${relativeToCwd(targetPath)}`);
  console.log(`  Edit the body, fill in the description, and run \`pnpm dev\`.`);
}

// ── Flag parsing ───────────────────────────────────────────────────────

interface ParsedFlags {
  type?: string;
  title?: string;
  slug?: string;
  description?: string;
  tags?: string;
  series?: string;
  url?: string;
  mdx?: boolean;
  draft?: boolean;
  help?: boolean;
}

function parseFlags(): ParsedFlags {
  const { values } = parseArgs({
    options: {
      type: { type: "string" },
      title: { type: "string" },
      slug: { type: "string" },
      description: { type: "string" },
      tags: { type: "string" },
      series: { type: "string" },
      url: { type: "string" },
      mdx: { type: "boolean" },
      draft: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });
  return values as ParsedFlags;
}

function requireFlag(value: string | undefined, name: string): string {
  if (!value || !value.trim()) {
    fail(`Missing required flag: ${name}\n${USAGE}`);
  }
  return value.trim();
}

function parseTags(raw: string | undefined): Tag[] {
  if (!raw) return [];
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as Tag[];

  const bad = list.filter((t) => !(ALLOWED_TAGS as readonly string[]).includes(t));
  if (bad.length > 0) {
    fail(
      `Unknown tag(s): ${bad.join(", ")}. Allowed tags are:\n  ${ALLOWED_TAGS.join(", ")}`,
    );
  }
  return list;
}

// ── Slug helpers ───────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  if (!slug) fail(`Could not derive a slug from title "${title}". Pass --slug.`);
  return slug;
}

function ensureSlug(slug: string): string {
  if (!SLUG_RE.test(slug)) {
    fail(
      `Invalid slug "${slug}". Slugs are kebab-case: lowercase letters, digits, hyphens.`,
    );
  }
  return slug;
}

// ── Frontmatter + body ─────────────────────────────────────────────────

interface BuiltFrontmatter {
  title: string;
  description: string;
  date: string;
  slug?: string;
  tags: Tag[];
  series?: string;
  draft?: boolean;
  url?: string;
}

function buildFrontmatter(opts: {
  type: PostType;
  title: string;
  slug: string;
  description: string;
  tags: Tag[];
  series?: string;
  url?: string;
  draft: boolean;
}): BuiltFrontmatter {
  const fm: BuiltFrontmatter = {
    title: opts.title,
    description: opts.description,
    date: todayISO(),
    slug: opts.slug,
    tags: opts.tags,
  };
  if (opts.series) fm.series = ensureSlug(opts.series);
  if (opts.draft) fm.draft = true;
  if (opts.type === "bookmark") {
    if (!opts.url) fail("--type bookmark requires --url <url>.");
    fm.url = opts.url;
  }
  return fm;
}

function renderFile(fm: BuiltFrontmatter, type: PostType): string {
  const yaml: string[] = ["---"];
  yaml.push(`title: ${quote(fm.title)}`);
  yaml.push(`description: ${quote(fm.description)}`);
  yaml.push(`date: ${fm.date}`);
  if (fm.slug) yaml.push(`slug: ${fm.slug}`);
  yaml.push(`tags: [${fm.tags.join(", ")}]`);
  if (fm.series) yaml.push(`series: ${fm.series}`);
  if (fm.draft) yaml.push(`draft: true`);
  if (fm.url) yaml.push(`url: ${quote(fm.url)}`);
  if (type === "project") {
    yaml.push(`role: TODO`);
    yaml.push(`stack: []`);
    yaml.push(`status: active`);
  }
  if (type === "tutorial") {
    yaml.push(`prereqs: []`);
    yaml.push(`stack: []`);
  }
  yaml.push("---");
  yaml.push("");
  yaml.push(`<!-- TODO: write ${type} body. -->`);
  yaml.push("");
  return yaml.join("\n");
}

function quote(s: string): string {
  // Only escape double-quotes; YAML double-quoted strings handle the rest.
  return `"${s.replace(/"/g, '\\"')}"`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Paths ──────────────────────────────────────────────────────────────

function repoRoot(): string {
  // scripts/new-post.ts → repo root is one level up.
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..");
}

function relativeToCwd(absolute: string): string {
  const cwd = process.cwd();
  return absolute.startsWith(cwd) ? absolute.slice(cwd.length + 1) : absolute;
}

// ── Error helper ───────────────────────────────────────────────────────

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}
