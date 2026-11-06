// Chạy trên máy cá nhân: chuyển file sang PDF trước khi đưa vào thư mục công khai trên Drive.
//   node scripts/convert-to-pdf.mjs <file hoặc thư mục ảnh> [...] [--out <thư mục>]
// - docx/doc/odt/rtf/txt/mobi/azw3/html: dùng ebook-convert của Calibre
// - thư mục chứa ảnh scan (jpg/png/webp/jfif): gộp theo thứ tự tên file thành 1 PDF (cần Python + Pillow)
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const oi = args.indexOf("--out");
const outDir = oi >= 0 ? resolve(args.splice(oi, 2)[1]) : null;
if (!args.length) { console.log("Cách dùng: node scripts/convert-to-pdf.mjs <file|thư mục ảnh> [...] [--out <thư mục>]"); process.exit(1); }

const CALIBRE = ["C:/Program Files/Calibre2/ebook-convert.exe", "/usr/bin/ebook-convert", "/Applications/calibre.app/Contents/MacOS/ebook-convert"]
  .find(existsSync) || "ebook-convert";
const DOC = [".docx", ".doc", ".odt", ".rtf", ".txt", ".mobi", ".azw3", ".html", ".htm", ".fb2"];
const IMG = /\.(jpe?g|png|webp|jfif|tiff?)$/i;
const IMAGES_TO_PDF = `
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
pages = [Image.open(f).convert("RGB") for f in files]
pages[0].save(out, save_all=True, append_images=pages[1:], resolution=150)
`;

for (const input of args.map((a) => resolve(a))) {
  const isDir = statSync(input).isDirectory();
  const out = join(outDir || (isDir ? resolve(input, "..") : resolve(input, "..")), `${basename(input, isDir ? "" : extname(input))}.pdf`);
  if (outDir) mkdirSync(outDir, { recursive: true });
  if (isDir) {
    const imgs = readdirSync(input).filter((f) => IMG.test(f)).sort((a, b) => a.localeCompare(b, "vi", { numeric: true })).map((f) => join(input, f));
    if (!imgs.length) { console.warn(`Bỏ qua ${input}: không có ảnh`); continue; }
    execFileSync("python", ["-c", IMAGES_TO_PDF, out, ...imgs], { stdio: "inherit" });
    console.log(`✓ ${imgs.length} ảnh → ${out}`);
  } else if (DOC.includes(extname(input).toLowerCase())) {
    execFileSync(CALIBRE, [input, out], { stdio: ["ignore", "ignore", "inherit"] });
    console.log(`✓ ${input} → ${out}`);
  } else console.warn(`Bỏ qua ${input}: định dạng chưa hỗ trợ`);
}
