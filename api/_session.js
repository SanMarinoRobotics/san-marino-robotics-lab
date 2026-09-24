const crypto = require('crypto');

const COOKIE_NAME = 'sma_session';
const LONG_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days — "keep me logged in"
const SHORT_TTL_SECONDS = 60 * 60 * 12; // 12 hours — not remembered

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return secret;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function createToken(email, ttlSeconds) {
  const payload = JSON.stringify({ email, exp: Date.now() + ttlSeconds * 1000 });
  const encoded = Buffer.from(payload).toString('base64url');
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature || '');
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  return verifyToken(token);
}

function setSessionCookie(res, email, remember) {
  const ttlSeconds = remember ? LONG_TTL_SECONDS : SHORT_TTL_SECONDS;
  const token = createToken(email, ttlSeconds);
  let cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/`;
  // Only "remembered" sessions get a persistent Max-Age; otherwise the cookie
  // is a browser-session cookie (cleared on close) with a 12h server-side cap.
  if (remember) cookie += `; Max-Age=${LONG_TTL_SECONDS}`;
  res.setHeader('Set-Cookie', cookie);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

module.exports = { getSession, setSessionCookie, clearSessionCookie };
