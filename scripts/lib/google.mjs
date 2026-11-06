// Gọi Drive/Sheets API bằng service account, không cần thư viện ngoài.
import { createSign } from "node:crypto";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
];

export function credentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  return JSON.parse(raw);
}

let cached;
export async function accessToken(cred) {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: cred.client_email, scope: SCOPES.join(" "), aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(cred.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  if (!res.ok) throw new Error(`Google token: ${res.status} ${await res.text()}`);
  const j = await res.json();
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

export async function api(cred, url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${await accessToken(cred)}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`${init.method || "GET"} ${url}: ${res.status} ${await res.text()}`);
  return res;
}

const DRIVE = "https://www.googleapis.com/drive/v3/files";
const FIELDS = "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,thumbnailLink)";

export async function listChildren(cred, folderId) {
  const out = [];
  let pageToken = "";
  do {
    const p = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`, fields: FIELDS, pageSize: "1000",
      supportsAllDrives: "true", includeItemsFromAllDrives: "true",
    });
    if (pageToken) p.set("pageToken", pageToken);
    const j = await (await api(cred, `${DRIVE}?${p}`)).json();
    out.push(...j.files);
    pageToken = j.nextPageToken || "";
  } while (pageToken);
  return out;
}

export async function getFile(cred, id) {
  const p = new URLSearchParams({ fields: "id,thumbnailLink", supportsAllDrives: "true" });
  return (await api(cred, `${DRIVE}/${id}?${p}`)).json();
}

const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";
// sheet rỗng = trang tính đầu tiên của file
export const a1 = (sheet, ref) => (sheet ? `'${sheet}'!${ref}` : ref);
const range = (sheet, ref) => encodeURIComponent(a1(sheet, ref));

export async function readSheet(cred, sheetId, sheet) {
  const j = await (await api(cred, `${SHEETS}/${sheetId}/values/${range(sheet, "A:AZ")}`)).json();
  return j.values || [];
}

export async function appendRows(cred, sheetId, sheet, rows) {
  if (!rows.length) return;
  const p = new URLSearchParams({ valueInputOption: "RAW", insertDataOption: "INSERT_ROWS" });
  await api(cred, `${SHEETS}/${sheetId}/values/${range(sheet, "A1")}:append?${p}`, {
    method: "POST", body: JSON.stringify({ values: rows }),
  });
}

export async function updateCells(cred, sheetId, data) {
  if (!data.length) return;
  await api(cred, `${SHEETS}/${sheetId}/values:batchUpdate`, {
    method: "POST", body: JSON.stringify({ valueInputOption: "RAW", data }),
  });
}

export const colLetter = (i) => {
  let s = "";
  for (i += 1; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
};
