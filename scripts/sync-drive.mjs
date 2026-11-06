// Quét các thư mục gốc trên Drive, thêm sách mới vào Sheet "Danh mục" ở trạng thái "Chờ duyệt".
// Chỉ ghi các cột kỹ thuật cho dòng đã có; không bao giờ ghi đè metadata người duyệt đã sửa.
import { readFileSync } from "node:fs";
import { COLUMNS, slugify } from "./lib/catalog.mjs";
import { formatOf, guessFromFilename } from "./lib/filename.mjs";
import { credentials, listChildren, readSheet, appendRows, updateCells, colLetter, a1 } from "./lib/google.mjs";

const cfg = JSON.parse(readFileSync(new URL("../library.config.json", import.meta.url), "utf8"));
const cred = credentials();
if (!cred) { console.log("Chưa có GOOGLE_SERVICE_ACCOUNT_JSON — bỏ qua đồng bộ."); process.exit(0); }
if (!cfg.sheetId) throw new Error("library.config.json thiếu sheetId");

const FOLDER = "application/vnd.google-apps.folder";
const excluded = new Set(cfg.excludeFolderNames.map((s) => s.toLowerCase()));

async function walk(root) {
  const found = [];
  const queue = [{ id: root.id, path: [root.name], isPublic: root.id === cfg.publicFolderId }];
  while (queue.length) {
    const dir = queue.shift();
    for (const f of await listChildren(cred, dir.id)) {
      if (f.mimeType === FOLDER) {
        if (excluded.has(f.name.trim().toLowerCase())) { console.log(`Bỏ qua thư mục: ${[...dir.path, f.name].join("/")}`); continue; }
        queue.push({ id: f.id, path: [...dir.path, f.name], isPublic: dir.isPublic || f.id === cfg.publicFolderId });
        continue;
      }
      const format = formatOf(f.mimeType, f.name);
      if (!format) continue;
      // Chủ đề gợi ý = tên thư mục chứa file (trừ thư mục gốc)
      found.push({ f, format, path: dir.path.join("/"), topic: dir.path.length > 1 ? dir.path.at(-1) : "", isPublic: dir.isPublic });
    }
  }
  return found;
}

const table = await readSheet(cred, cfg.sheetId, cfg.sheetName);
let header = table[0] || [];
if (!header.length) {
  header = COLUMNS;
  await appendRows(cred, cfg.sheetId, cfg.sheetName, [COLUMNS]);
}
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
for (const k of COLUMNS) if (!(k in col)) throw new Error(`Sheet thiếu cột "${k}" — thêm cột này vào hàng tiêu đề`);

const existing = new Map();
table.slice(1).forEach((cells, i) => { if (cells[col.drive_id]) existing.set(cells[col.drive_id], { row: i + 2, cells }); });
const usedSlugs = new Set(table.slice(1).map((c) => c[col.slug]).filter(Boolean));

const roots = [...cfg.roots];
if (cfg.publicFolderId && !roots.some((r) => r.id === cfg.publicFolderId)) roots.push({ id: cfg.publicFolderId, name: "Công khai" });

const seen = new Set();
const additions = [];
const updates = [];
const today = new Date().toISOString().slice(0, 10);

for (const root of roots) {
  for (const { f, format, path, topic, isPublic } of await walk(root)) {
    if (seen.has(f.id)) continue;
    seen.add(f.id);
    const tech = {
      dinh_dang: format,
      dung_luong: f.size ? (Number(f.size) / 1048576).toFixed(1) : "",
      mime: f.mimeType,
      thu_muc: path,
      cong_khai: isPublic ? "có" : "không",
    };
    const old = existing.get(f.id);
    if (old) {
      for (const [k, v] of Object.entries(tech)) {
        if ((old.cells[col[k]] ?? "") !== v) updates.push({ range: a1(cfg.sheetName, `${colLetter(col[k])}${old.row}`), values: [[v]] });
      }
      continue;
    }
    const g = guessFromFilename(f.name);
    const base = slugify(g.title);
    let slug = base, n = 2;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);
    const row = {
      ...tech, drive_id: f.id, slug, ten_sach: g.title, tac_gia: g.author, chu_de: topic,
      ban_quyen: "chua-xac-dinh", truy_cap: "mien-phi", trang_thai: "Chờ duyệt", ngay_them: today,
      ghi_chu: formatNote(format),
    };
    additions.push(header.map((h) => row[h.trim()] ?? ""));
  }
}

for (const [id, old] of existing) {
  if (!seen.has(id) && old.cells[col.cong_khai] !== "mất file") {
    updates.push({ range: a1(cfg.sheetName, `${colLetter(col.cong_khai)}${old.row}`), values: [["mất file"]] });
  }
}

function formatNote(format) {
  return ["pdf", "epub", "gdoc"].includes(format) ? "" : `Cần chuyển ${format} sang PDF trước khi công khai`;
}

await appendRows(cred, cfg.sheetId, cfg.sheetName, additions);
await updateCells(cred, cfg.sheetId, updates);
console.log(`Đồng bộ xong: ${seen.size} file, thêm ${additions.length} dòng mới, cập nhật ${updates.length} ô.`);
