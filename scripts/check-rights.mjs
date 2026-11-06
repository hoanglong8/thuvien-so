// Chạy sau astro build. Fail nếu bất kỳ link file Drive nào trong dist/ không thuộc một cuốn được phép phát hành.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { RIGHTS_FILE, FORMATS_SERVED } from "./lib/catalog.mjs";

const catalogPath = process.env.CATALOG_FILE || "data/catalog.json";
const dist = process.argv[2] || "dist";
const { books } = JSON.parse(readFileSync(catalogPath, "utf8"));
const errors = [];

const allowed = new Set();
for (const b of books) {
  if (!b.file) continue;
  if (!RIGHTS_FILE.includes(b.rights)) errors.push(`${b.slug}: có file nhưng ban_quyen="${b.rights}"`);
  if (!FORMATS_SERVED.includes(b.file.format)) errors.push(`${b.slug}: định dạng ${b.file.format} không được phục vụ`);
  allowed.add(b.file.id);
}

const LINK = /(?:drive\.google\.com\/file\/d\/|docs\.google\.com\/document\/d\/|drive\.google\.com\/uc\?[^"'\s]*?id=)([\w-]{10,})/g;
let files = 0, links = 0;
(function scan(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { scan(p); continue; }
    if (!/\.(html|json|js|xml)$/.test(name)) continue;
    files++;
    for (const m of readFileSync(p, "utf8").matchAll(LINK)) {
      links++;
      if (!allowed.has(m[1])) errors.push(`${p}: link tới file Drive ${m[1]} không nằm trong danh sách được phép`);
    }
  }
})(dist);

if (errors.length) {
  console.error(`CỔNG BẢN QUYỀN: ${errors.length} lỗi\n` + errors.slice(0, 50).join("\n"));
  process.exit(1);
}
console.log(`Cổng bản quyền OK: ${files} file đã quét, ${links} link Drive, tất cả thuộc ${allowed.size} cuốn được phép.`);
