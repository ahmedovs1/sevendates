import { readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scrypt = promisify(scryptCb)

/*
 * Editor accounts.
 *
 * Passwords are stored as scrypt hashes with a per-user salt — the file can be
 * read by whoever can read the server, and a stolen copy still must not hand
 * over the passwords themselves.
 */

const dataDir = fileURLToPath(new URL('../data/', import.meta.url))
const file = join(dataDir, 'users.json')

const KEY_LEN = 64

async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const key = await scrypt(password, salt, KEY_LEN)
  return { salt, hash: key.toString('hex') }
}

let cache = null

async function load() {
  if (cache) return cache
  try {
    cache = JSON.parse(await readFile(file, 'utf8'))
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('users.json unreadable:', err.message)
    cache = []
  }
  return cache
}

async function persist(users) {
  await mkdir(dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(users, null, 2), 'utf8')
  await rename(tmp, file)
  cache = users
}

/**
 * Creates the first account from the environment when the file is still empty,
 * so a fresh deploy has a way in. Once an account exists the env is ignored.
 */
export async function ensureBootstrapUser() {
  const users = await load()
  if (users.length) return

  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) {
    console.warn('No editor accounts and no ADMIN_USERNAME/ADMIN_PASSWORD — /admin cannot be used.')
    return
  }
  const { salt, hash } = await hashPassword(password)
  await persist([{ username, salt, hash, createdAt: new Date().toISOString() }])
  console.log(`Created the first editor account: ${username}`)
}

export async function listUsers() {
  return (await load()).map((u) => ({ username: u.username, createdAt: u.createdAt }))
}

export async function verifyUser(username, password) {
  const users = await load()
  const user = users.find((u) => u.username === username)
  if (!user) {
    // Hash anyway so a missing account takes the same time as a wrong password.
    await hashPassword(String(password ?? ''))
    return false
  }
  const { hash } = await hashPassword(String(password ?? ''), user.salt)
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(user.hash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function addUser(username, password) {
  const clean = String(username ?? '').trim()
  if (!/^[a-zA-Z0-9._-]{3,40}$/.test(clean)) {
    throw new Error('Логин: 3–40 символов, латиница, цифры, точка, дефис, подчёркивание')
  }
  if (String(password ?? '').length < 8) throw new Error('Пароль короче 8 символов')

  const users = await load()
  if (users.some((u) => u.username === clean)) throw new Error('Такой логин уже есть')

  const { salt, hash } = await hashPassword(password)
  await persist([...users, { username: clean, salt, hash, createdAt: new Date().toISOString() }])
  return clean
}

export async function removeUser(username, requestedBy) {
  const users = await load()
  if (username === requestedBy) throw new Error('Нельзя удалить собственную учётную запись')
  if (users.length <= 1) throw new Error('Нельзя удалить последнюю учётную запись')
  if (!users.some((u) => u.username === username)) throw new Error('Учётная запись не найдена')

  await persist(users.filter((u) => u.username !== username))
}

export async function changePassword(username, currentPassword, nextPassword) {
  if (!(await verifyUser(username, currentPassword))) throw new Error('Текущий пароль неверный')
  if (String(nextPassword ?? '').length < 8) throw new Error('Новый пароль короче 8 символов')

  const users = await load()
  const { salt, hash } = await hashPassword(nextPassword)
  await persist(users.map((u) => (u.username === username ? { ...u, salt, hash } : u)))
}
