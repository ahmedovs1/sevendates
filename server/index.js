import express from 'express'
import nodemailer from 'nodemailer'
import { existsSync } from 'node:fs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readOverrides, writeSection } from './lib/store.js'
import { clearCookie, issueCookie, requireAuth, sessionUser } from './lib/auth.js'
import {
  addUser,
  changePassword,
  ensureBootstrapUser,
  listUsers,
  removeUser,
  verifyUser,
} from './lib/users.js'
import { DEFAULT_SEO, LANGS, injectMeta } from './lib/seo.js'

/*
 * Load .env when the process was started plainly as `node <file>.js`.
 * systemd passes the variables itself via EnvironmentFile, and `npm start`
 * uses --env-file, so in both of those cases this is a no-op.
 */
const envFile = fileURLToPath(new URL('.env', import.meta.url))
if (!process.env.SMTP_HOST && existsSync(envFile)) {
  process.loadEnvFile(envFile)
}

const {
  PORT = 8787,
  SMTP_HOST,
  SMTP_PORT = 465,
  SMTP_USER,
  SMTP_PASS,
  MAIL_TO,
  MAIL_FROM,
  ALLOWED_ORIGIN = '',
  SITE_ORIGIN = '',
  DIST_DIR,
} = process.env

for (const [name, value] of Object.entries({ SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_TO })) {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
}
await ensureBootstrapUser()

const distDir = resolve(DIST_DIR || fileURLToPath(new URL('../dist', import.meta.url)))
const uploadsDir = fileURLToPath(new URL('./uploads/', import.meta.url))

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  // 465 is implicit TLS; anything else (587) starts plaintext and upgrades.
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

const app = express()
app.set('trust proxy', 1) // behind nginx, so req.ip is the real client
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: false, limit: '16kb' }))

const allowedOrigins = ALLOWED_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use((req, res, next) => {
  const origin = req.headers.origin
  // No list configured means same-origin only, which needs no CORS header.
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

/* ------------------------------------------------------------------ mailer */

/*
 * A public endpoint that sends mail is an open relay unless it is throttled:
 * without this, one script can burn the mailbox's reputation and get the domain
 * blacklisted. In-memory is enough for a single process; move to Redis if this
 * ever runs on more than one.
 */
const WINDOW_MS = 10 * 60 * 1000
const hits = new Map()

function rateLimited(ip, key, max) {
  const now = Date.now()
  const id = `${key}:${ip}`
  const recent = (hits.get(id) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= max) return true
  recent.push(now)
  hits.set(id, recent)
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
    }
  }
  return false
}

/** Strips CR/LF so user input cannot inject extra mail headers. */
const oneLine = (value, max) =>
  String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, max)

const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

app.post('/api/send', async (req, res) => {
  if (rateLimited(req.ip, 'send', 5)) {
    return res.status(429).json({ success: false, message: 'Too many requests' })
  }

  const name = oneLine(req.body?.name, 120)
  const phone = oneLine(req.body?.phone, 60)
  const email = oneLine(req.body?.email, 160)
  const page = oneLine(req.body?.page, 300)
  const message = String(req.body?.message ?? '').trim().slice(0, 4000)

  if (!name || !phone || !looksLikeEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid submission' })
  }

  const lines = [
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `E-mail: ${email}`,
    message ? `Сообщение: ${message}` : null,
    page ? `Страница: ${page}` : null,
  ].filter(Boolean)

  try {
    await transporter.sendMail({
      from: MAIL_FROM || `"Seven Dates" <${SMTP_USER}>`,
      to: MAIL_TO,
      // Reply goes to the visitor, not to the relay mailbox.
      replyTo: `"${name}" <${email}>`,
      subject: `Заявка с сайта — ${name}`,
      text: lines.join('\n'),
    })
    res.json({ success: true })
  } catch (err) {
    // Log server-side; tell the browser nothing about the mail infrastructure.
    console.error('sendMail failed:', err?.message)
    res.status(502).json({ success: false, message: 'Mail delivery failed' })
  }
})

/* ----------------------------------------------------------------- content */

/** Public: the frontend merges these over the values compiled into the bundle. */
app.get('/api/content', async (_req, res) => {
  const overrides = await readOverrides()
  res.set('Cache-Control', 'no-cache')
  // seoDefaults ships too: client-side navigation has to set the title itself,
  // and it must land on the same text the server would have rendered.
  res.json({ ...overrides, seoDefaults: DEFAULT_SEO })
})

app.get('/api/admin/session', (req, res) => {
  const user = sessionUser(req)
  res.json({ authenticated: user !== null, username: user })
})

app.post('/api/admin/login', async (req, res) => {
  // Throttled separately from the form: this is the door to the whole site.
  if (rateLimited(req.ip, 'login', 10)) {
    return res.status(429).json({ error: 'Слишком много попыток, подождите' })
  }
  const username = String(req.body?.username ?? '').trim()
  if (!(await verifyUser(username, req.body?.password))) {
    return res.status(401).json({ error: 'Неверный логин или пароль' })
  }
  issueCookie(res, username)
  res.json({ ok: true, username })
})

app.post('/api/admin/logout', (req, res) => {
  clearCookie(res)
  res.json({ ok: true })
})

app.get('/api/admin/users', requireAuth, async (_req, res) => res.json({ users: await listUsers() }))

app.post('/api/admin/users', requireAuth, async (req, res) => {
  try {
    const username = await addUser(req.body?.username, req.body?.password)
    res.json({ ok: true, username })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/admin/users/:username', requireAuth, async (req, res) => {
  try {
    await removeUser(req.params.username, req.adminUser)
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/api/admin/password', requireAuth, async (req, res) => {
  try {
    await changePassword(req.adminUser, req.body?.current, req.body?.next)
    res.json({ ok: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/api/admin/defaults', requireAuth, (_req, res) => res.json({ seo: DEFAULT_SEO }))

app.put('/api/admin/content/:section', requireAuth, express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const saved = await writeSection(req.params.section, req.body ?? {})
    res.json({ ok: true, section: req.params.section, content: saved[req.params.section] })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/*
 * Uploads land outside dist/, which `npm run build` wipes, and are served from
 * here so nothing needs a rebuild to appear.
 */
const ALLOWED_IMAGE = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' }

app.post('/api/admin/upload', requireAuth, express.json({ limit: '8mb' }), async (req, res) => {
  const { dataUrl, name } = req.body ?? {}
  const match = /^data:([^;]+);base64,(.+)$/.exec(String(dataUrl ?? ''))
  if (!match) return res.status(400).json({ error: 'Expected a base64 data URL' })

  const ext = ALLOWED_IMAGE[match[1]]
  if (!ext) return res.status(415).json({ error: 'Only PNG, JPEG and WebP are accepted' })

  const bytes = Buffer.from(match[2], 'base64')
  if (bytes.length > 5 * 1024 * 1024) return res.status(413).json({ error: 'Larger than 5 MB' })

  // Rebuild the filename from scratch — never trust the client's path.
  const stem = String(name ?? 'image')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  const file = `${stem || 'image'}-${Date.now().toString(36)}${ext}`

  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, file), bytes)
  res.json({ ok: true, url: `/uploads/${file}` })
})

app.get('/uploads/:file', (req, res) => {
  // basename-only guard: no traversal out of the uploads directory.
  const file = req.params.file.replace(/[/\\]/g, '')
  if (!Object.values(ALLOWED_IMAGE).includes(extname(file))) return res.sendStatus(404)
  res.sendFile(join(uploadsDir, file), (err) => err && res.sendStatus(404))
})

/* --------------------------------------------------------------- SEO / SPA */

const originOf = (req) =>
  SITE_ORIGIN || `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers.host}`

app.get('/robots.txt', (req, res) => {
  const origin = originOf(req)
  res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`)
})

app.get('/sitemap.xml', async (req, res) => {
  const origin = originOf(req)
  const routes = ['home', 'products', 'about', 'media', 'mixology', 'contacts', 'police', 'rules']
  const urls = []
  for (const route of routes) {
    for (const lang of LANGS) {
      const prefix = lang === 'ru' ? '' : `/${lang}`
      const suffix = route === 'home' ? '' : `/${route}`
      urls.push(`  <url><loc>${origin}${prefix}${suffix || '/'}</loc></url>`)
    }
  }
  res
    .type('application/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

/*
 * Static build output. In production nginx serves these directly and never
 * reaches Node, but serving them here too keeps the service self-contained —
 * without it the catch-all below would answer asset requests with index.html
 * and the app would never boot.
 *
 * index:false so `/` falls through to the handler that injects the meta tags.
 */
app.use((req, res, next) => {
  if (req.path === '/index.html') return next() // must go through meta injection
  express.static(distDir, { index: false, maxAge: '1h' })(req, res, next)
})

/*
 * Everything else is the SPA — routes rather than assets, which is exactly
 * where the per-page meta has to be stitched in.
 */
app.get(/.*/, async (req, res) => {
  if (req.path.startsWith('/api/')) return res.sendStatus(404)
  try {
    const html = await readFile(join(distDir, 'index.html'), 'utf8')
    const { seo } = await readOverrides()
    res.set('Cache-Control', 'no-cache')
    res.type('html').send(injectMeta(html, req.path, seo, originOf(req)))
  } catch {
    res.status(500).send('Build not found. Run `npm run build` in the project root.')
  }
})

app.listen(PORT, () => {
  console.log(`Mailer + CMS on :${PORT} — SMTP ${SMTP_HOST}:${SMTP_PORT}, dist ${distDir}`)
})
