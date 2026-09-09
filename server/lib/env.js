import { existsSync, readFileSync } from 'node:fs'

/*
 * Loads a .env file into process.env.
 *
 * process.loadEnvFile() only exists from Node 20.6, and the hosting this runs
 * on ships Node 18 — so parse the file ourselves when it is missing. Values
 * already present in the environment win, which keeps PM2 ecosystem files and
 * systemd EnvironmentFile in charge where they are used.
 */
export function loadEnv(file) {
  if (!existsSync(file)) return

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(file)
    return
  }

  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    // Strip one layer of matching quotes; anything else is taken literally.
    const value = trimmed.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}
