import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/*
 * Single-editor auth: one password in the server environment, a signed cookie
 * for the session. No user table, because there is one editor.
 *
 * The cookie carries only an expiry plus an HMAC of it, so nothing sensitive is
 * stored client-side and a tampered cookie fails the signature check.
 */

const COOKIE = 'sd_admin'
const MAX_AGE_MS = 12 * 60 * 60 * 1000

/*
 * Resolved on first use, not at import time. ES modules evaluate imports before
 * the importing module's body, so at import time index.js has not called
 * process.loadEnvFile() yet — reading SESSION_SECRET here would always miss it
 * and silently fall back to a per-boot random key, ending every session on
 * restart.
 */
let secret
function getSecret() {
  if (secret) return secret
  secret = process.env.SESSION_SECRET || randomBytes(32).toString('hex')
  if (!process.env.SESSION_SECRET) {
    console.warn('SESSION_SECRET is not set — admin sessions will end on restart.')
  }
  return secret
}

const sign = (value) => createHmac('sha256', getSecret()).update(value).digest('hex')

/** Constant-time compare that tolerates differing lengths. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function issueCookie(res, username) {
  const expires = Date.now() + MAX_AGE_MS
  const payload = `${encodeURIComponent(username)}.${expires}`
  const token = `${payload}.${sign(payload)}`
  res.setHeader(
    'Set-Cookie',
    // httpOnly: unreachable from JS, so an XSS cannot lift the session.
    // sameSite=Strict: the admin is never linked to from elsewhere.
    `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${MAX_AGE_MS / 1000}` +
      (process.env.NODE_ENV === 'production' ? '; Secure' : ''),
  )
}

export function clearCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`)
}

function readCookie(req) {
  const raw = req.headers.cookie
  if (!raw) return null
  for (const part of raw.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE) return rest.join('=')
  }
  return null
}

/** Returns the signed-in username, or null. */
export function sessionUser(req) {
  const token = readCookie(req)
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [name, expires, mac] = parts
  if (!safeEqual(mac, sign(`${name}.${expires}`))) return null
  if (!(Number(expires) > Date.now())) return null
  return decodeURIComponent(name)
}

export const isAuthenticated = (req) => sessionUser(req) !== null

/** Express guard for every mutating admin route. */
export function requireAuth(req, res, next) {
  const user = sessionUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  req.adminUser = user
  next()
}
