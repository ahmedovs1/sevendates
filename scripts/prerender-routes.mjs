import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * Раскладывает копию index.html по каталогам маршрутов.
 *
 * Одностраничное приложение отдаёт один index.html на любой адрес, и обычно за
 * это отвечает `try_files $uri /index.html` в nginx. На хостинге без доступа к
 * конфигу такой директивы нет: nginx ищет файл /admin, не находит и отвечает
 * 404. Каталог с index.html внутри решает это без единой строки конфига.
 */

const dist = fileURLToPath(new URL('../dist/', import.meta.url))

const ROUTES = ['products', 'about', 'media', 'mixology', 'contacts', 'police', 'rules', 'soon']
const LANGS = ['', 'en', 'uz']
const NEWS = 'news/seven-dates-premium-revolutionary-italian-health-drink'

const paths = ['admin']
for (const lang of LANGS) {
  if (lang) paths.push(lang)
  for (const route of ROUTES) paths.push(lang ? `${lang}/${route}` : route)
  paths.push(lang ? `${lang}/${NEWS}` : NEWS)
}

const source = join(dist, 'index.html')
for (const p of paths) {
  const target = join(dist, p, 'index.html')
  await mkdir(dirname(target), { recursive: true })
  await copyFile(source, target)
}

console.log(`prerender: разложено ${paths.length} маршрутов`)
