export const LANGS = ["vi", "en"];

export const ROUTES = {
  vi: {
    home: "/", book: (s) => `/sach/${s}/`, read: (s) => `/doc/${s}/`, dl: (s) => `/tai/${s}/`,
    topic: (s) => `/chu-de/${s}/`, author: (s) => `/tac-gia/${s}/`,
    about: "/gioi-thieu/", copyright: "/ban-quyen/", privacy: "/quyen-rieng-tu/", contact: "/lien-he/",
  },
  en: {
    home: "/en/", book: (s) => `/en/book/${s}/`, read: (s) => `/en/read/${s}/`, dl: (s) => `/en/download/${s}/`,
    topic: (s) => `/en/topic/${s}/`, author: (s) => `/en/author/${s}/`,
    about: "/en/about/", copyright: "/en/copyright/", privacy: "/en/privacy/", contact: "/en/contact/",
  },
};

export const LANG_NAMES = {
  vi: { vi: "Tiếng Việt", en: "Vietnamese" }, en: { vi: "Tiếng Anh", en: "English" },
  fr: { vi: "Tiếng Pháp", en: "French" }, la: { vi: "Tiếng Latinh", en: "Latin" },
  zh: { vi: "Tiếng Trung", en: "Chinese" }, ja: { vi: "Tiếng Nhật", en: "Japanese" },
  ko: { vi: "Tiếng Hàn", en: "Korean" }, ru: { vi: "Tiếng Nga", en: "Russian" },
  de: { vi: "Tiếng Đức", en: "German" }, es: { vi: "Tiếng Tây Ban Nha", en: "Spanish" },
  pt: { vi: "Tiếng Bồ Đào Nha", en: "Portuguese" }, han: { vi: "Hán Nôm", en: "Han-Nom" },
};
export const langName = (code, ui) => LANG_NAMES[code]?.[ui] || code.toUpperCase();

export const T = {
  vi: {
    tagline: "Tra cứu, đọc trực tuyến và tải miễn phí sách public domain cùng các bản dịch tiếng Việt.",
    stats: (n, f) => `${n} cuốn sách · ${f} cuốn đọc và tải miễn phí`,
    loading: "Đang tải dữ liệu…",
    search: "Tìm theo tên sách, tác giả, dịch giả, NXB, ISBN…",
    tabs: { new: "Mới thêm", free: "Đọc miễn phí", all: "Tất cả (A–Z)" },
    allTopics: "Tất cả chủ đề", allLangs: "Mọi ngôn ngữ", allEras: "Mọi thời kỳ xuất bản",
    eras: [["0-1899", "Trước 1900"], ["1900-1945", "1900–1945"], ["1946-1975", "1946–1975"], ["1976-1999", "1976–1999"], ["2000-2100", "Từ 2000"]],
    count: (n) => `${n} cuốn`, more: "Xem thêm",
    empty: "Thư viện đang được cập nhật — chưa có sách nào khớp.",
    by: "Tác giả", translator: "Dịch giả", publisher: "Nhà xuất bản", year: "Năm xuất bản", language: "Ngôn ngữ",
    pages: "Số trang", isbn: "ISBN", topics: "Chủ đề", series: "Bộ sách", format: "Định dạng", size: "Dung lượng",
    read: "Đọc trực tuyến", download: "Tải về", free: "Miễn phí", infoOnly: "Chỉ thông tin",
    rightsLabel: {
      "public-domain": "Phạm vi công cộng (public domain)", "giay-phep-mo": "Giấy phép mở",
      "duoc-phep": "Phát hành có sự cho phép", "tu-bien-soan": "Bản biên soạn / dịch của Thư viện số",
      "con-ban-quyen": "Còn bản quyền",
    },
    copyrighted: "Sách còn bản quyền nên Thư viện số chỉ giới thiệu thông tin. Bạn có thể mua sách tại:",
    noFileYet: "File của cuốn này đang được chuẩn bị.",
    related: "Cùng chủ đề", booksBy: "Sách của", booksIn: "Sách thuộc chủ đề",
    readTitle: "Đọc", dlTitle: "Tải về", dlNote: "File được lưu trên Google Drive. Với file lớn, Google có thể hiện trang cảnh báo chưa quét virus — bấm \"Vẫn tải xuống\" để tiếp tục.",
    dlButton: "Tải file", back: "Quay lại trang sách", epubNote: "Định dạng EPUB chưa đọc trực tuyến được, vui lòng tải về.",
    nav: { about: "Giới thiệu", copyright: "Bản quyền & gỡ bỏ", privacy: "Quyền riêng tư", contact: "Liên hệ" },
    footer: "Thư viện số chỉ phát hành file của sách thuộc phạm vi công cộng, có giấy phép mở, được tác giả/NXB cho phép hoặc do Thư viện số tự biên soạn. Sách còn bản quyền chỉ có trang thông tin.",
    switchLang: "English", notFound: "Không tìm thấy trang", home: "Về trang chủ",
  },
  en: {
    tagline: "Search, read online and download public-domain books and Vietnamese translations for free.",
    stats: (n, f) => `${n} books · ${f} free to read and download`,
    loading: "Loading…",
    search: "Search by title, author, translator, publisher, ISBN…",
    tabs: { new: "Recently added", free: "Free to read", all: "All (A–Z)" },
    allTopics: "All topics", allLangs: "All languages", allEras: "Any publication period",
    eras: [["0-1899", "Before 1900"], ["1900-1945", "1900–1945"], ["1946-1975", "1946–1975"], ["1976-1999", "1976–1999"], ["2000-2100", "2000 onwards"]],
    count: (n) => `${n} books`, more: "Show more",
    empty: "The library is being updated — no matching books yet.",
    by: "Author", translator: "Translator", publisher: "Publisher", year: "Published", language: "Language",
    pages: "Pages", isbn: "ISBN", topics: "Topics", series: "Series", format: "Format", size: "Size",
    read: "Read online", download: "Download", free: "Free", infoOnly: "Info only",
    rightsLabel: {
      "public-domain": "Public domain", "giay-phep-mo": "Open licence",
      "duoc-phep": "Published with permission", "tu-bien-soan": "Edited / translated by Thư viện số",
      "con-ban-quyen": "In copyright",
    },
    copyrighted: "This book is still in copyright, so Thư viện số only lists its details. You can buy it at:",
    noFileYet: "The file for this book is being prepared.",
    related: "Same topic", booksBy: "Books by", booksIn: "Books in",
    readTitle: "Read", dlTitle: "Download", dlNote: "Files are stored on Google Drive. For large files Google may show a \"can't scan for viruses\" page — click \"Download anyway\" to continue.",
    dlButton: "Download file", back: "Back to book page", epubNote: "EPUB files can't be read online yet, please download them.",
    nav: { about: "About", copyright: "Copyright & takedown", privacy: "Privacy", contact: "Contact" },
    footer: "Thư viện số only distributes files of books that are in the public domain, openly licensed, published with the author's/publisher's permission, or edited by Thư viện số itself. In-copyright books have information pages only.",
    switchLang: "Tiếng Việt", notFound: "Page not found", home: "Back to home",
  },
};

// Trang tương ứng ở ngôn ngữ còn lại, dùng cho nút đổi ngôn ngữ và thẻ hreflang.
export function altPath(path, from) {
  const to = from === "vi" ? "en" : "vi";
  const a = ROUTES[from], b = ROUTES[to];
  for (const k of ["book", "read", "dl", "topic", "author"]) {
    const prefix = a[k]("§").split("§")[0];
    if (path.startsWith(prefix) && path !== prefix) return b[k](path.slice(prefix.length).replace(/\/$/, ""));
  }
  for (const k of ["about", "copyright", "privacy", "contact"]) if (path === a[k]) return b[k];
  return b.home;
}
