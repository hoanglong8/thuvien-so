# Thư viện số

Website tra cứu, đọc trực tuyến và tải miễn phí sách public domain và bản dịch tiếng Việt. Giao diện tiếng Việt và tiếng Anh. Dựng theo mô hình của [hackerbooks-vi](https://github.com/hoanglong8/hackerbooks-vi): dữ liệu tĩnh, GitHub Actions cập nhật, Vercel tự deploy. Khác biệt chính: mỗi cuốn có trang riêng để Google index, và nguồn dữ liệu là Google Drive + Google Sheet.

## Kiến trúc

```
Google Drive (kho sách)            Google Sheet "Danh mục" (1 dòng = 1 cuốn, nơi duyệt)
        │                                   ▲            │
        ▼                                   │            ▼
GitHub Actions (02:30 hằng ngày + nút chạy tay)
  scripts/sync-drive.mjs     Drive → Sheet: thêm sách mới ở trạng thái "Chờ duyệt"
  scripts/build-catalog.mjs  Sheet → data/catalog.json, áp cổng bản quyền, tải ảnh bìa
  commit ─▶ Vercel build Astro ─▶ scripts/check-rights.mjs quét lại toàn bộ dist/
```

| File | Vai trò |
|---|---|
| `library.config.json` | ID Sheet, thư mục gốc cần quét, thư mục công khai, thư mục loại trừ |
| `scripts/lib/catalog.mjs` | Cột của Sheet và **cổng bản quyền** |
| `scripts/sync-drive.mjs` | Quét Drive, thêm dòng mới vào Sheet; chỉ cập nhật cột kỹ thuật của dòng cũ |
| `scripts/build-catalog.mjs` | Sinh `data/catalog.json` từ Sheet (hoặc `--file danh-muc.csv`) |
| `scripts/check-rights.mjs` | Chạy sau build, fail nếu có link file Drive không được phép |
| `scripts/convert-to-pdf.mjs` | Chạy trên máy: chuyển docx/txt/mobi… hoặc thư mục ảnh scan sang PDF |
| `src/` | Site Astro: trang chủ tìm kiếm, trang sách, đọc, tải, chủ đề, tác giả, trang pháp lý (vi + en) |
| `.github/workflows/sync.yml` | Lịch đồng bộ hằng ngày |

## Cổng bản quyền

Một cuốn **hiện lên site** khi `trang_thai = Đã duyệt` và `ban_quyen` thuộc một trong:

| `ban_quyen` | Ý nghĩa | Có file đọc/tải? |
|---|---|---|
| `public-domain` | Hết thời hạn bảo hộ | Có |
| `giay-phep-mo` | Creative Commons hoặc giấy phép mở khác | Có |
| `duoc-phep` | Tác giả / NXB cho phép bằng văn bản (ghi căn cứ vào `can_cu_quyen`) | Có |
| `tu-bien-soan` | Bản dịch, biên soạn do Thư viện số tự làm | Có |
| `con-ban-quyen` | Còn bản quyền | Không — chỉ trang thông tin + link mua |
| `chua-xac-dinh` | Mặc định khi đồng bộ | Không hiện |

Ngay cả khi đủ điều kiện trên, file chỉ được gắn link khi đồng thời: file nằm trong thư mục công khai (`cong_khai = có`), định dạng là PDF, EPUB hoặc Google Docs, và `truy_cap` khác `tra-phi`.

## Quy trình thêm sách

1. Bỏ file vào kho trên Drive. Định dạng khác PDF/EPUB thì chuyển trước: `node scripts/convert-to-pdf.mjs "đường/dẫn/file.docx" --out D:/pdf`.
2. Sách được phép phát hành: chuyển vào thư mục công khai.
3. Hôm sau (hoặc bấm *Actions → Đồng bộ kho sách → Run workflow*), sách xuất hiện trong Sheet ở trạng thái `Chờ duyệt`.
4. Sửa metadata, chọn `ban_quyen`, đổi `trang_thai` thành `Đã duyệt`.
5. Lần đồng bộ kế tiếp sẽ đưa sách lên site.

Hướng dẫn cài service account lần đầu: [docs/SETUP-GOOGLE.md](docs/SETUP-GOOGLE.md).

## Chạy local

```bash
npm install
node scripts/build-catalog.mjs --file tests/fixtures/sample.csv --out tests/fixtures/catalog.json
CATALOG_FILE=tests/fixtures/catalog.json npm run build   # build với dữ liệu mẫu
npx astro preview
npm test
```

## Lộ trình

- Giai đoạn 2: tra metadata Open Library / Google Books, tóm tắt bằng Claude API (`ANTHROPIC_API_KEY` trong GitHub Secrets), sách liên quan tốt hơn.
- Giai đoạn 3: tên miền riêng, Vercel Pro (gói Hobby cấm quảng cáo), GA4, AdSense — bật `SITE.ads` trong `src/config.mjs`.
- Khi kho lên hàng chục nghìn cuốn: chuyển ảnh bìa ra khỏi git (Vercel Blob hoặc tương đương).
