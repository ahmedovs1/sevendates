import nodemailer from 'nodemailer'

import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/*
 * Load .env when the process was started plainly as `node <file>.js`.
 * systemd passes the variables itself via EnvironmentFile, and `npm start`
 * uses --env-file, so in both of those cases this is a no-op.
 */
const envFile = fileURLToPath(new URL('.env', import.meta.url))
if (!process.env.SMTP_HOST && existsSync(envFile)) {
  process.loadEnvFile(envFile)
}

/*
 * Connects and authenticates against the SMTP server without sending anything.
 * Use it after changing credentials to separate "settings are wrong" from
 * "mail was rejected".
 */

const { SMTP_HOST, SMTP_PORT = 465, SMTP_USER, SMTP_PASS } = process.env

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('SMTP settings missing. Copy .env.example to .env and fill it in,')
  console.error('then run this again (npm run verify).')
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

try {
  await transporter.verify()
  console.log(`OK — authenticated as ${SMTP_USER} on ${SMTP_HOST}:${SMTP_PORT}. No mail was sent.`)
} catch (err) {
  console.error(`FAILED — ${err?.message}`)
  process.exit(1)
}
