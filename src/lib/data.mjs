import { readFileSync } from "node:fs";
import { slugify } from "../../scripts/lib/catalog.mjs";

// CATALOG_FILE cho phép build thử với dữ liệu mẫu mà không đụng vào data/catalog.json.
const catalog = JSON.parse(readFileSync(process.env.CATALOG_FILE || "data/catalog.json", "utf8"));

export const META = { updated: catalog.updated, total: catalog.total, withFile: catalog.withFile };
export const BOOKS = catalog.books;

function group(key) {
  const m = new Map();
  for (const b of BOOKS) for (const name of b[key]) {
    const s = slugify(name);
    if (!m.has(s)) m.set(s, { slug: s, name, books: [] });
    m.get(s).books.push(b);
  }
  return [...m.values()].sort((a, b) => b.books.length - a.books.length || a.name.localeCompare(b.name, "vi"));
}

export const TOPICS = group("topics");
export const AUTHORS = group("authors");
export const topicSlug = (name) => slugify(name);

export function related(book, n = 6) {
  const t = new Set(book.topics);
  return BOOKS.filter((b) => b !== book && b.topics.some((x) => t.has(x))).slice(0, n);
}

export const readUrl = (f) => f.format === "gdoc"
  ? `https://docs.google.com/document/d/${f.id}/preview`
  : `https://drive.google.com/file/d/${f.id}/preview`;

export const downloadUrl = (f) => f.format === "gdoc"
  ? `https://docs.google.com/document/d/${f.id}/export?format=pdf`
  : `https://drive.google.com/uc?export=download&id=${f.id}`;

export const canReadOnline = (f) => f && f.format !== "epub";
