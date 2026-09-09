import nodemailer from 'nodemailer'

import { fileURLToPath } from 'node:url'
import { loadEnv } from './lib/env.js'

loadEnv(fileURLToPath(new URL('.env', import.meta.url)))

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
