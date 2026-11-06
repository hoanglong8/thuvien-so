// Đọc Sheet "Danh mục" (hoặc --file <csv>), áp cổng bản quyền, ghi data/catalog.json và tải ảnh bìa.
//   node scripts/build-catalog.mjs                       # đọc Sheet, cần GOOGLE_SERVICE_ACCOUNT_JSON
//   node scripts/build-catalog.mjs --file danh-muc.csv   # đọc file CSV xuất từ Sheet
//   --out <path>  ghi ra file khác (mặc định data/catalog.json)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog, parseCsv, rowsToObjects } from "./lib/catalog.mjs";
import { credentials, readSheet, getFile, api } from "./lib/google.mjs";

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const root = new URL("../", import.meta.url);
const cfg = JSON.parse(readFileSync(new URL("library.config.json", root), "utf8"));
const out = arg("--out") || fileURLToPath(new URL("data/catalog.json", root));
const cred = credentials();

let table;
if (arg("--file")) table = parseCsv(readFileSync(arg("--file"), "utf8").replace(/^\uFEFF/, ""));
else if (cred && cfg.sheetId) table = await readSheet(cred, cfg.sheetId, cfg.sheetName);
else { console.log("Không có nguồn dữ liệu (thiếu --file hoặc service account) — giữ nguyên catalog hiện tại."); process.exit(0); }

const catalog = buildCatalog(rowsToObjects(table));

if (cred && !arg("--file")) {
  const coverDir = new URL("public/covers/", root);
  mkdirSync(coverDir, { recursive: true });
  const ids = new Map(rowsToObjects(table).map((r) => [r.slug, r.drive_id]));
  let fetched = 0;
  for (const b of catalog.books) {
    if (b.cover) continue;
    const local = new URL(`${b.slug}.jpg`, coverDir);
    if (!existsSync(local) && ids.get(b.slug)) {
      try {
        const { thumbnailLink } = await getFile(cred, ids.get(b.slug));
        if (thumbnailLink) {
          const res = await api(cred, thumbnailLink.replace(/=s\d+$/, "=s400"));
          writeFileSync(local, Buffer.from(await res.arrayBuffer())); fetched++;
        }
      } catch (e) { console.warn(`Ảnh bìa ${b.slug}: ${e.message}`); }
    }
    if (existsSync(local)) b.cover = `/covers/${b.slug}.jpg`;
  }
  console.log(`Ảnh bìa mới: ${fetched}`);
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(catalog, null, 1) + "\n");
console.log(`Catalog: ${catalog.total} cuốn hiển thị (${catalog.withFile} có file) từ ${table.length - 1} dòng → ${out}`);
