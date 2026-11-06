// Quy tắc dùng chung cho build-catalog, check-rights và test. Cổng bản quyền nằm ở đây.

export const COLUMNS = [
  "drive_id", "slug", "ten_sach", "ten_goc", "tac_gia", "dich_gia", "nxb", "nam_xb", "ngon_ngu",
  "chu_de", "tags", "bo_sach", "isbn", "so_trang", "mo_ta", "mo_ta_en", "anh_bia",
  "dinh_dang", "dung_luong", "mime", "thu_muc", "cong_khai",
  "ban_quyen", "can_cu_quyen", "truy_cap", "trang_thai", "ngay_them", "ghi_chu",
];

// Chỉ các loại này mới được kèm file đọc/tải.
export const RIGHTS_FILE = ["public-domain", "giay-phep-mo", "duoc-phep", "tu-bien-soan"];
// Hiện trang thông tin nhưng không bao giờ có file.
export const RIGHTS_INFO = ["con-ban-quyen"];
export const FORMATS_SERVED = ["pdf", "epub", "gdoc"];

export const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

export const slugify = (s) => fold(s).replace(/&/g, " va ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "sach";

export const list = (s) => String(s || "").split(/[;\n]/).map((x) => x.trim()).filter(Boolean);

// "02.Khoa học & Công nghệ" -> "Khoa học & Công nghệ"
export const cleanTopic = (s) => String(s || "").replace(/^\s*\d+[A-Za-z]?[._\s-]+/, "").trim();

export const isApproved = (r) => fold(r.trang_thai).trim() === "da duyet";

export function visibility(r) {
  const rights = String(r.ban_quyen || "").trim();
  if (!isApproved(r)) return "hidden";
  if (RIGHTS_FILE.includes(rights)) return "file-allowed";
  if (RIGHTS_INFO.includes(rights)) return "info";
  return "hidden";
}

export function fileFor(r) {
  if (visibility(r) !== "file-allowed") return null;
  if (fold(r.cong_khai).trim() !== "co") return null;
  if (String(r.truy_cap || "").trim() === "tra-phi") return null;
  const format = String(r.dinh_dang || "").trim().toLowerCase();
  if (!FORMATS_SERVED.includes(format) || !r.drive_id) return null;
  return { id: String(r.drive_id).trim(), format, size: Number(r.dung_luong) || null };
}

export function toBook(r) {
  const vis = visibility(r);
  if (vis === "hidden") return null;
  return {
    slug: r.slug,
    title: String(r.ten_sach || "").trim(),
    originalTitle: String(r.ten_goc || "").trim(),
    authors: list(r.tac_gia),
    translators: list(r.dich_gia),
    publisher: String(r.nxb || "").trim(),
    year: Number(r.nam_xb) || null,
    lang: String(r.ngon_ngu || "").trim().toLowerCase(),
    topics: list(r.chu_de).map(cleanTopic).filter(Boolean),
    tags: list(r.tags),
    series: String(r.bo_sach || "").trim(),
    isbn: String(r.isbn || "").trim(),
    pages: Number(r.so_trang) || null,
    desc: String(r.mo_ta || "").trim(),
    descEn: String(r.mo_ta_en || "").trim(),
    cover: String(r.anh_bia || "").trim(),
    rights: String(r.ban_quyen).trim(),
    added: String(r.ngay_them || "").trim(),
    file: fileFor(r),
  };
}

// Gán slug duy nhất cho các dòng chưa có slug; giữ nguyên slug đã có để URL không đổi.
export function assignSlugs(rows) {
  const used = new Set(rows.map((r) => r.slug).filter(Boolean));
  for (const r of rows) {
    if (r.slug) continue;
    const base = slugify(r.ten_sach || r.drive_id);
    let s = base, i = 2;
    while (used.has(s)) s = `${base}-${i++}`;
    used.add(s);
    r.slug = s;
  }
  return rows;
}

export function buildCatalog(rows) {
  assignSlugs(rows);
  const books = rows.map(toBook).filter(Boolean)
    .sort((a, b) => (b.added || "").localeCompare(a.added || "") || a.title.localeCompare(b.title, "vi"));
  return {
    updated: new Date().toISOString().slice(0, 10),
    total: books.length,
    withFile: books.filter((b) => b.file).length,
    books,
  };
}

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function rowsToObjects(table) {
  const [head, ...body] = table;
  const keys = head.map((h) => h.trim());
  return body.map((cells) => Object.fromEntries(keys.map((k, i) => [k, cells[i] ?? ""])));
}
