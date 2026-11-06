# Cài đặt Google lần đầu (làm một lần, khoảng 15 phút)

Mục tiêu: cho GitHub Actions quyền **đọc** kho sách trên Drive và **sửa** đúng một Google Sheet.

## 1. Tạo service account

1. Vào https://console.cloud.google.com/ bằng tài khoản Google chứa kho sách.
2. Tạo project mới, ví dụ `thuvien-so`.
3. *APIs & Services → Library*: bật **Google Drive API** và **Google Sheets API**.
4. *IAM & Admin → Service Accounts → Create service account*: đặt tên `thuvien-so-sync`, không cần gán role.
5. Mở service account vừa tạo → *Keys → Add key → Create new key → JSON*. Trình duyệt tải về một file `.json`.
   - File này là khóa bí mật: không gửi qua chat, không commit vào repo, xóa khỏi máy sau bước 3.
6. Ghi lại email của service account (dạng `thuvien-so-sync@<project>.iam.gserviceaccount.com`).

## 2. Chia sẻ cho service account

- Thư mục kho sách (`01.Thư viện số`): *Chia sẻ* → thêm email service account → quyền **Người xem**.
- Google Sheet "Danh mục sách – Thư viện số": *Chia sẻ* → thêm email service account → quyền **Người chỉnh sửa**.

## 3. Đưa khóa vào GitHub

Repo `hoanglong8/thuvien-so` → *Settings → Secrets and variables → Actions → New repository secret*:
- Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
- Secret: dán **toàn bộ nội dung** file JSON.

## 4. Thư mục công khai

Thư mục công khai (`publicFolderId` trong `library.config.json`) đặt chia sẻ *Bất kỳ ai có đường liên kết → Người xem*. Chỉ chuyển vào đây những file được phép phát hành.

## 5. Chạy thử

Repo → *Actions → Đồng bộ kho sách từ Google Drive → Run workflow*. Khi chạy xong, Sheet có thêm các dòng `Chờ duyệt`.
