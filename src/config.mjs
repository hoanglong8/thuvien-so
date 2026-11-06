export const SITE = {
  name: "Thư viện số",
  url: "https://thuvien-so.vercel.app",
  repo: "https://github.com/hoanglong8/thuvien-so",
  // Bật ở giai đoạn 3 (cần tên miền riêng, gói Vercel Pro và tài khoản AdSense đã duyệt).
  ads: { enabled: false, client: "" },
  // Link tìm sách ở nhà sách cho sách còn bản quyền. {q} = tên sách + tác giả.
  // Mã affiliate gắn vào đây khi có hợp đồng.
  shops: [
    { name: "Fahasa", url: "https://www.fahasa.com/searchengine?q={q}" },
    { name: "Tiki", url: "https://tiki.vn/search?q={q}" },
  ],
};
