import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCatalog, parseCsv, rowsToObjects, slugify, cleanTopic } from "../scripts/lib/catalog.mjs";
import { guessFromFilename, formatOf } from "../scripts/lib/filename.mjs";

const rows = () => rowsToObjects(parseCsv(readFileSync(new URL("fixtures/sample.csv", import.meta.url), "utf8")));
const bySlug = () => Object.fromEntries(buildCatalog(rows()).books.map((b) => [b.slug, b]));

test("chỉ sách đã duyệt và có loại bản quyền hợp lệ mới hiển thị", () => {
  const books = bySlug();
  assert.equal(books["sach-chua-duyet"], undefined);
  assert.equal(books["sach-chua-ro-quyen"], undefined);
  assert.equal(Object.keys(books).length, 7);
});

test("sách còn bản quyền có trang thông tin nhưng không có file và không lộ mã Drive", () => {
  const b = bySlug()["sapiens-luoc-su-loai-nguoi"];
  assert.equal(b.file, null);
  assert.ok(!JSON.stringify(b).includes("TESTsecret0005"));
});

test("file chỉ có khi nằm trong thư mục công khai và đúng định dạng", () => {
  const books = bySlug();
  assert.equal(books["dai-viet-su-ky-toan-thu"].file, null);
  assert.equal(books["binh-ngo-dai-cao"].file, null);
  assert.equal(books["truyen-kieu"].file.format, "pdf");
  assert.equal(books["nhung-nguyen-ly-toan-hoc-cua-triet-hoc-tu-nhien"].file.format, "gdoc");
});

test("sách trả phí không bao giờ có link tải miễn phí", () => {
  const r = rows();
  r[0].truy_cap = "tra-phi";
  assert.equal(buildCatalog(r).books.find((b) => b.slug === "truyen-kieu").file, null);
});

test("slug tiếng Việt bỏ dấu, giữ slug đã có và không trùng", () => {
  assert.equal(slugify("Đại Việt sử ký toàn thư"), "dai-viet-su-ky-toan-thu");
  const r = [{ ten_sach: "A" }, { ten_sach: "A" }, { ten_sach: "B", slug: "giu-nguyen" }];
  buildCatalog(r);
  assert.deepEqual(r.map((x) => x.slug), ["a", "a-2", "giu-nguyen"]);
});

test("chủ đề bỏ tiền tố số thứ tự thư mục", () => {
  assert.equal(cleanTopic("02.Khoa học & Công nghệ"), "Khoa học & Công nghệ");
  assert.equal(cleanTopic("03A.Thần thoại Việt Nam"), "Thần thoại Việt Nam");
});

test("đoán tên sách và tác giả từ tên file thật trong kho", () => {
  assert.deepEqual(
    guessFromFilename("A History of the Vietnamese (2013) [CAMBRIDGE CONCISE HISTORIES] (K. W. Taylor) (z-library.sk, 1lib.sk, z-lib.sk).pdf"),
    { title: "A History of the Vietnamese", author: "K. W. Taylor" });
  assert.deepEqual(guessFromFilename("Búp Sen Xanh - Sơn Tùng.pdf"), { title: "Búp Sen Xanh", author: "Sơn Tùng" });
  assert.equal(guessFromFilename("9966-ho-chi-minh-chan-dung-mot-cuoc-doi-thuviensach.vn.pdf").title, "ho-chi-minh-chan-dung-mot-cuoc-doi");
  assert.equal(formatOf("application/vnd.google-apps.document", "x"), "gdoc");
  assert.equal(formatOf("image/jpeg", "1.JPEG"), null);
});
