export const ADMIN_COOKIE = "gf_admin_session";
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_PASSWORD.length >= 16 &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 32,
  );
}

export async function createAdminSession(secret: string, expiresAt: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const payload = String(expiresAt);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const hexSignature = Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${payload}.${hexSignature}`;
}

export async function verifyAdminSession(token: string | undefined, secret: string) {
  if (!token) return false;
  const [expiryText, signatureHex, extra] = token.split(".");
  const expiresAt = Number(expiryText);
  if (extra || !/^\d{13}$/.test(expiryText || "") || !/^[a-f0-9]{64}$/.test(signatureHex || "") || expiresAt <= Date.now()) return false;

  const signature = new Uint8Array(signatureHex.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(expiryText));
}
