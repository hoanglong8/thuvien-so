// Đoán tên sách / tác giả từ tên file. Chỉ là gợi ý ban đầu; người duyệt sửa lại trong Sheet.

const NOISE = [
  /\((?:z-library|1lib|z-lib)[^)]*\)/gi,
  /\[(?:z-library|1lib)[^\]]*\]/gi,
  /[-_ ]*(?:thuviensach\.vn|downloadsach\.com|sachvui\.com|ebookvie\.com)/gi,
  /^bản sao của\s+/i,
  /^copy of\s+/i,
  /^\d{3,}[-_ ]+/,
];

const MIME_FORMAT = {
  "application/pdf": "pdf",
  "application/epub+zip": "epub",
  "application/vnd.google-apps.document": "gdoc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/rtf": "rtf",
  "text/plain": "txt",
  "application/x-mobipocket-ebook": "mobi",
  "image/vnd.djvu": "djvu",
};
const EXT_FORMAT = ["pdf", "epub", "docx", "doc", "odt", "rtf", "txt", "mobi", "azw3", "djvu"];

export function formatOf(mimeType, name) {
  if (MIME_FORMAT[mimeType]) return MIME_FORMAT[mimeType];
  const ext = String(name).split(".").pop().toLowerCase();
  return EXT_FORMAT.includes(ext) ? ext : null;
}

export function guessFromFilename(name) {
  let s = String(name).replace(/\.(pdf|epub|docx?|odt|rtf|txt|mobi|azw3|djvu)$/i, "");
  for (const re of NOISE) s = s.replace(re, "");
  s = s.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  let author = "";
  // "Tên sách (Tác giả)" — chỉ nhận khi ngoặc cuối giống tên người (không có số)
  const paren = s.match(/^(.*\S)\s*\(([^()\d]{3,60})\)\s*$/);
  if (paren) { s = paren[1]; author = paren[2].trim(); }
  else {
    // "Tên sách - Tác giả" — lấy đoạn cuối nếu ngắn
    const parts = s.split(/\s+-\s+/);
    if (parts.length >= 2 && parts.at(-1).split(" ").length <= 5 && !/\d/.test(parts.at(-1))) {
      author = parts.pop().trim();
      s = parts.join(" - ");
    }
  }
  s = s.replace(/\s*\(\d{4}\)\s*/, " ").replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  return { title: s, author };
}
