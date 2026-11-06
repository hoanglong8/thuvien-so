import { BOOKS } from "../lib/data.mjs";

// Chỉ số tìm kiếm gọn cho trình duyệt; khóa ngắn để giảm dung lượng khi kho lên hàng chục nghìn cuốn.
export function GET() {
  const rows = BOOKS.map((b) => {
    const o = { s: b.slug, t: b.title };
    if (b.originalTitle) o.o = b.originalTitle;
    if (b.authors.length) o.a = b.authors;
    if (b.translators.length) o.tr = b.translators;
    if (b.publisher) o.p = b.publisher;
    if (b.year) o.y = b.year;
    if (b.lang) o.l = b.lang;
    if (b.topics.length) o.tp = b.topics;
    if (b.tags.length) o.tg = b.tags;
    if (b.series) o.sr = b.series;
    if (b.isbn) o.i = b.isbn;
    if (b.file) o.f = b.file.format;
    if (b.cover) o.c = b.cover;
    return o;
  });
  return new Response(JSON.stringify(rows), { headers: { "content-type": "application/json" } });
}
