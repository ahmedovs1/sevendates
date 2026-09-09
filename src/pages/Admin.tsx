import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dictionaries, LANGS, type LangCode } from '../i18n'
import { collectFields, readPath, type Overrides } from '../content/overrides'
import { useContent } from '../content/ContentProvider'
import type { Office } from '../data/site'
import type { Drink, EventItem } from '../content/types'

/*
 * Minimal editor for the parts of the site that change: metadata, contacts,
 * copy and the image lists.
 *
 * It only ever stores *differences* from the compiled content. Clearing a field
 * removes the override and the built-in value comes back, so there is no way to
 * edit the site into a blank page.
 */

type Section = 'seo' | 'contacts' | 'texts' | 'lists' | 'access'
type SeoDefaults = Record<string, Record<string, { title: string; description: string }>>

const SECTION_LABEL: Record<Section, string> = {
  seo: 'SEO',
  contacts: 'Контакты',
  texts: 'Тексты',
  lists: 'Списки',
  access: 'Доступы',
}

const ROUTES = [
  ['home', 'Главная'],
  ['products', 'О продукте'],
  ['about', 'Преимущества'],
  ['media', 'Медиа и события'],
  ['mixology', 'Миксология'],
  ['contacts', 'Контакты'],
  ['police', 'Политика конфиденциальности'],
  ['rules', 'Согласие'],
  ['news', 'Статья'],
] as const

/** Language identifiers the app depends on — not editable copy. */
const TECHNICAL_KEYS = ['code', 'label', 'htmlLang']

const api = (url: string, init?: RequestInit) =>
  fetch(url, { credentials: 'same-origin', ...init }).then(async (r) => {
    const body = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(body.error || `HTTP ${r.status}`)
    return body
  })

/* ------------------------------------------------------------------ shared */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-line px-3 py-2 text-[14px] outline-none focus:border-brand'

/* ------------------------------------------------------------------- login */

function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-5">
      <form onSubmit={submit} className="w-full max-w-[360px] rounded-[18px] bg-white p-8 shadow-card">
        <h1 className="text-2xl text-brand">Админка</h1>
        <p className="mb-6 mt-1 text-[14px] text-muted">Seven Dates</p>
        <input
          className={`${inputCls} mb-3`}
          type="text"
          autoFocus
          autoComplete="username"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className={inputCls}
          type="password"
          autoComplete="current-password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="mt-2 text-[13px] text-accent">{error}</p>}
        <button type="submit" className="btn-primary mt-5 w-full" disabled={busy}>
          {busy ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}

/* --------------------------------------------------------------------- SEO */

function SeoEditor({
  value,
  defaults,
  onChange,
}: {
  value: Overrides['seo']
  defaults: SeoDefaults
  onChange: (next: Overrides['seo']) => void
}) {
  const [lang, setLang] = useState<LangCode>('ru')

  const set = (route: string, field: string, next: string) => {
    const forRoute = { ...(value[route] ?? {}) }
    const forLang = { ...(forRoute[lang] ?? {}) }
    if (next.trim()) forLang[field as 'title'] = next
    else delete forLang[field as 'title']

    if (Object.keys(forLang).length) forRoute[lang] = forLang
    else delete forRoute[lang]

    const nextSeo = { ...value }
    if (Object.keys(forRoute).length) nextSeo[route] = forRoute
    else delete nextSeo[route]
    onChange(nextSeo)
  }

  return (
    <div>
      <LangTabs lang={lang} onChange={setLang} />
      <p className="mb-6 text-[13px] text-muted">
        Пустое поле — используется заготовленный текст, он показан подсказкой. Теги отдаёт сервер,
        поэтому превью в Telegram и WhatsApp обновятся сразу после сохранения.
      </p>
      <div className="grid gap-6">
        {ROUTES.map(([route, label]) => {
          const current = value[route]?.[lang] ?? {}
          const fallback = defaults[route]?.[lang] ?? { title: '', description: '' }
          const shownTitle = current.title?.trim() || fallback.title
          const shownDesc = current.description?.trim() || fallback.description
          return (
            <div key={route} className="rounded-[14px] border border-line p-5">
              <h3 className="mb-3 text-[17px] text-brand">{label}</h3>
              <div className="grid gap-3">
                <Field label="Title" hint={`По умолчанию: ${fallback.title}`}>
                  <input
                    className={inputCls}
                    value={current.title ?? ''}
                    placeholder={fallback.title}
                    onChange={(e) => set(route, 'title', e.target.value)}
                  />
                </Field>
                <Field label="Description" hint={`По умолчанию: ${fallback.description}`}>
                  <textarea
                    className={`${inputCls} min-h-[70px]`}
                    value={current.description ?? ''}
                    placeholder={fallback.description}
                    onChange={(e) => set(route, 'description', e.target.value)}
                  />
                </Field>
                <Field label="Картинка для превью" hint="Путь вида /images/background.png">
                  <input
                    className={inputCls}
                    value={current.ogImage ?? ''}
                    placeholder="/images/background.png"
                    onChange={(e) => set(route, 'ogImage', e.target.value)}
                  />
                </Field>

                {/* These fields never show up in the page body, which reads as
                    "nothing happened". The preview puts the result on screen. */}
                <div className="mt-1 rounded-lg bg-cream p-4">
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">
                    Так страницу увидят в поиске
                  </p>
                  <p className="text-[15px] leading-tight text-[#1a0dab]">{shownTitle}</p>
                  <p className="text-[12px] text-[#006621]">sevendates.uz{route === 'home' ? '' : `/${route}`}</p>
                  <p className="mt-1 text-[13px] leading-snug text-muted">{shownDesc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LangTabs({ lang, onChange }: { lang: LangCode; onChange: (l: LangCode) => void }) {
  return (
    <div className="mb-4 flex gap-2">
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold uppercase ${
            code === lang ? 'border-brand bg-brand text-white' : 'border-line text-muted'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- contacts */

function ContactsEditor({
  value,
  builtIn,
  onChange,
}: {
  value: Overrides['contacts']
  builtIn: { offices: Office[]; socials: { label: string; href: string }[] }
  onChange: (next: Overrides['contacts']) => void
}) {
  const offices = value.offices ?? builtIn.offices
  const socials = value.socials ?? builtIn.socials

  const setOffice = (i: number, field: keyof Office, next: string) => {
    const list = offices.map((o, idx) =>
      idx === i
        ? { ...o, [field]: field === 'emails' ? next.split(',').map((s) => s.trim()) : next }
        : o,
    )
    onChange({ ...value, offices: list })
  }

  const addOffice = () => {
    // A key that is not uz/ru/kz has no dictionary name, so seed `country` too.
    const key = `office-${Date.now().toString(36)}`
    onChange({
      ...value,
      offices: [...offices, { key, country: 'Новая страна', phone: '', phoneHref: '', emails: [] }],
    })
  }

  const removeOffice = (i: number) =>
    onChange({ ...value, offices: offices.filter((_, idx) => idx !== i) })

  const addSocial = () =>
    onChange({ ...value, socials: [...socials, { label: 'Ссылка', href: 'https://' }] })

  const removeSocial = (i: number) =>
    onChange({ ...value, socials: socials.filter((_, idx) => idx !== i) })

  return (
    <div className="grid gap-6">
      <p className="text-[13px] text-muted">
        Меняется на странице «Контакты» и в футере одновременно.
      </p>

      {offices.map((office, i) => (
        <div key={office.key} className="rounded-[14px] border border-line p-5">
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-[17px] uppercase text-brand">{office.country ?? office.key}</h3>
            <button
              type="button"
              onClick={() => confirm('Удалить этот офис?') && removeOffice(i)}
              className="ml-auto text-[13px] font-semibold text-accent"
            >
              Удалить офис
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Страна" hint="Как подписать блок на сайте">
              <input
                className={inputCls}
                value={office.country ?? ''}
                placeholder="Оставьте пустым для встроенного названия"
                onChange={(e) => setOffice(i, 'country', e.target.value)}
              />
            </Field>
            <Field label="Юрлицо">
              <input
                className={inputCls}
                value={office.company ?? ''}
                onChange={(e) => setOffice(i, 'company', e.target.value)}
              />
            </Field>
            <Field label="Телефон (как показывать)">
              <input
                className={inputCls}
                value={office.phone}
                onChange={(e) => setOffice(i, 'phone', e.target.value)}
              />
            </Field>
            <Field label="Телефон (ссылка)" hint="Формат tel:+998901234567">
              <input
                className={inputCls}
                value={office.phoneHref}
                onChange={(e) => setOffice(i, 'phoneHref', e.target.value)}
              />
            </Field>
            <Field label="Адрес">
              <input
                className={inputCls}
                value={office.address ?? ''}
                onChange={(e) => setOffice(i, 'address', e.target.value)}
              />
            </Field>
            <Field label="E-mail" hint="Несколько — через запятую">
              <input
                className={inputCls}
                value={office.emails.join(', ')}
                onChange={(e) => setOffice(i, 'emails', e.target.value)}
              />
            </Field>
          </div>
        </div>
      ))}

      <button type="button" onClick={addOffice} className="btn-outline justify-self-start px-5 py-2 text-[14px]">
        Добавить офис
      </button>

      <div className="rounded-[14px] border border-line p-5">
        <h3 className="mb-3 text-[17px] text-brand">Соцсети</h3>
        <div className="grid gap-3">
          {socials.map((s, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[200px_1fr_auto]">
              <input
                className={inputCls}
                value={s.label}
                onChange={(e) => {
                  const list = socials.map((x, idx) =>
                    idx === i ? { ...x, label: e.target.value } : x,
                  )
                  onChange({ ...value, socials: list })
                }}
              />
              <input
                className={inputCls}
                value={s.href}
                onChange={(e) => {
                  const list = socials.map((x, idx) =>
                    idx === i ? { ...x, href: e.target.value } : x,
                  )
                  onChange({ ...value, socials: list })
                }}
              />
              <button
                type="button"
                onClick={() => removeSocial(i)}
                className="text-[13px] font-semibold text-accent"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSocial} className="btn-outline mt-4 px-5 py-2 text-[14px]">
          Добавить ссылку
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- texts */

function TextsEditor({
  value,
  onChange,
}: {
  value: Overrides['texts']
  onChange: (next: Overrides['texts']) => void
}) {
  const [lang, setLang] = useState<LangCode>('ru')
  const [filter, setFilter] = useState('')

  const dict = dictionaries[lang]
  const fields = useMemo(() => {
    const found = collectFields(dict)
    return {
      scalars: found.scalars.filter((k) => !TECHNICAL_KEYS.includes(k)),
      arrays: found.arrays,
    }
  }, [dict])

  const patch = value[lang] ?? {}

  const write = (key: string, next: string | string[] | null) => {
    const forLang = { ...patch }
    if (next === null) delete forLang[key]
    else forLang[key] = next
    const nextTexts = { ...value }
    if (Object.keys(forLang).length) nextTexts[lang] = forLang
    else delete nextTexts[lang]
    onChange(nextTexts)
  }

  /** Current value of a list: the override if there is one, else the built-in. */
  const listOf = (key: string): string[] => {
    const override = patch[key]
    if (Array.isArray(override)) return override
    const base = readPath(dict, key)
    return Array.isArray(base) ? (base as string[]) : []
  }

  const groups = useMemo(() => {
    const out = new Map<string, { scalars: string[]; arrays: string[] }>()
    const match = (k: string) => !filter || k.toLowerCase().includes(filter.toLowerCase())
    const bucket = (k: string) => {
      const g = k.split('.')[0]
      if (!out.has(g)) out.set(g, { scalars: [], arrays: [] })
      return out.get(g)!
    }
    fields.scalars.filter(match).forEach((k) => bucket(k).scalars.push(k))
    fields.arrays.filter(match).forEach((k) => bucket(k).arrays.push(k))
    return out
  }, [fields, filter])

  return (
    <div>
      <LangTabs lang={lang} onChange={setLang} />
      <input
        className={`${inputCls} mb-5`}
        placeholder="Поиск по ключу, например hero или badges"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="grid gap-5">
        {[...groups].map(([group, { scalars, arrays }]) => (
          <div key={group} className="rounded-[14px] border border-line p-5">
            <h3 className="mb-3 text-[15px] font-bold uppercase tracking-wide text-brand">
              {group}
            </h3>

            <div className="grid gap-3">
              {scalars.map((key) => {
                const base = String(readPath(dict, key) ?? '')
                const current = typeof patch[key] === 'string' ? (patch[key] as string) : base
                const edited = key in patch
                return (
                  <Field key={key} label={key.slice(group.length + 1) || key}>
                    <textarea
                      className={`${inputCls} ${edited ? 'border-brand' : ''} min-h-[42px]`}
                      rows={current.length > 90 ? 3 : 1}
                      value={current}
                      // Matching the built-in means "no override": keeps the
                      // store small and lets a later fix in code win again.
                      onChange={(e) =>
                        write(key, e.target.value === base || !e.target.value.trim() ? null : e.target.value)
                      }
                    />
                  </Field>
                )
              })}
            </div>

            {arrays.map((key) => {
              const items = listOf(key)
              return (
                <div key={key} className="mt-5 rounded-lg bg-cream p-4">
                  <p className="mb-2 text-[13px] font-semibold text-ink">
                    {key.slice(group.length + 1) || key}
                    <span className="ml-2 font-normal text-muted">список, {items.length} шт.</span>
                  </p>
                  <div className="grid gap-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          className={inputCls}
                          value={item}
                          onChange={(e) =>
                            write(key, items.map((x, idx) => (idx === i ? e.target.value : x)))
                          }
                        />
                        <button
                          type="button"
                          className="shrink-0 px-2 text-[13px] font-semibold text-accent"
                          onClick={() => write(key, items.filter((_, idx) => idx !== i))}
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      className="text-[13px] font-semibold text-brand"
                      onClick={() => write(key, [...items, ''])}
                    >
                      + Добавить пункт
                    </button>
                    {Array.isArray(patch[key]) && (
                      <button
                        type="button"
                        className="text-[13px] font-semibold text-muted"
                        onClick={() => write(key, null)}
                      >
                        Вернуть исходный список
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- lists */

type ListKey = 'events' | 'cocktails' | 'mocktails' | 'awards'

function ListsEditor({
  value,
  builtIn,
  onChange,
}: {
  value: Overrides['lists']
  builtIn: {
    events: EventItem[]
    cocktails: Drink[]
    mocktails: Drink[]
    awards: { src: string; alt: string }[]
  }
  onChange: (next: Overrides['lists']) => void
}) {
  const [key, setKey] = useState<ListKey>('events')
  const [uploading, setUploading] = useState('')

  const list = (value[key] ?? builtIn[key]) as Record<string, string>[]
  const imageField = key === 'awards' ? 'src' : 'image'

  const update = (i: number, field: string, next: string) => {
    const items = list.map((item, idx) => (idx === i ? { ...item, [field]: next } : item))
    onChange({ ...value, [key]: items })
  }

  const remove = (i: number) => {
    onChange({ ...value, [key]: list.filter((_, idx) => idx !== i) })
  }

  const add = () => {
    // Seeded with an existing image so a fresh card is never broken before upload.
    const blank: Record<string, string> =
      key === 'awards'
        ? { src: '/images/reward1.jpg', alt: '' }
        : key === 'events'
          ? { slug: `item-${Date.now().toString(36)}`, image: '/images/background.png', title: '', dates: '', text: '' }
          : { slug: `item-${Date.now().toString(36)}`, image: '/images/background.png', name: '', text: '' }
    onChange({ ...value, [key]: [...list, blank] })
  }

  const upload = async (i: number, file: File) => {
    setUploading(`${key}-${i}`)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      const { url } = await api('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, name: file.name }),
      })
      update(i, imageField, url)
    } catch (err) {
      alert(`Не удалось загрузить: ${(err as Error).message}`)
    } finally {
      setUploading('')
    }
  }

  const fields =
    key === 'awards'
      ? [['alt', 'Описание']]
      : key === 'events'
        ? [
            ['title', 'Название'],
            ['dates', 'Даты'],
            ['text', 'Описание'],
          ]
        : [
            ['name', 'Название'],
            ['text', 'Описание'],
          ]

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {(['events', 'cocktails', 'mocktails', 'awards'] as ListKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKey(k)}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold ${
              k === key ? 'border-brand bg-brand text-white' : 'border-line text-muted'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <p className="mb-4 text-[13px] text-muted">
        Новый элемент появляется с временной картинкой — замените её кнопкой «Заменить фото».
      </p>

      <div className="grid gap-5">
        {list.map((item, i) => (
          <div key={i} className="grid gap-3 rounded-[14px] border border-line p-5 sm:grid-cols-[160px_1fr]">
            <div>
              <img
                src={item[imageField]}
                alt=""
                className="mb-2 aspect-4/3 w-full rounded-lg object-cover"
              />
              <label className="block cursor-pointer text-center text-[12px] font-semibold text-brand">
                {uploading === `${key}-${i}` ? 'Загрузка…' : 'Заменить фото'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && upload(i, e.target.files[0])}
                />
              </label>
            </div>
            <div className="grid gap-3">
              {fields.map(([field, label]) => (
                <Field key={field} label={label}>
                  <textarea
                    className={`${inputCls} min-h-[42px]`}
                    rows={field === 'text' ? 4 : 1}
                    value={item[field] ?? ''}
                    onChange={(e) => update(i, field, e.target.value)}
                  />
                </Field>
              ))}
              <button
                type="button"
                onClick={() => remove(i)}
                className="justify-self-start text-[13px] font-semibold text-accent"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={add} className="btn-outline mt-5 px-5 py-2 text-[14px]">
        Добавить элемент
      </button>
    </div>
  )
}


/* ------------------------------------------------------------------ access */

function AccessEditor({ me }: { me: string | null }) {
  const [users, setUsers] = useState<{ username: string; createdAt: string }[]>([])
  const [form, setForm] = useState({ username: '', password: '' })
  const [pw, setPw] = useState({ current: '', next: '' })
  const [note, setNote] = useState('')

  const reload = useCallback(() => {
    api('/api/admin/users').then((r) => setUsers(r.users)).catch(() => {})
  }, [])
  useEffect(reload, [reload])

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setNote('')
    try {
      await fn()
      setNote(ok)
      reload()
    } catch (err) {
      setNote((err as Error).message)
    }
  }

  return (
    <div className="grid gap-6">
      {note && <p className="text-[14px] font-semibold text-brand">{note}</p>}

      <div className="rounded-[14px] border border-line p-5">
        <h3 className="mb-1 text-[17px] text-brand">Кто имеет доступ</h3>
        <p className="mb-4 text-[13px] text-muted">
          Все учётные записи равноправны. Пароли хранятся в виде хешей — посмотреть их нельзя,
          можно только задать новый.
        </p>
        <div className="grid gap-2">
          {users.map((u) => (
            <div key={u.username} className="flex items-center gap-3 border-t border-line py-2.5">
              <span className="font-semibold">{u.username}</span>
              {u.username === me && <span className="text-[12px] text-muted">это вы</span>}
              <span className="ml-auto text-[12px] text-muted">
                с {new Date(u.createdAt).toLocaleDateString('ru-RU')}
              </span>
              {u.username !== me && users.length > 1 && (
                <button
                  type="button"
                  className="text-[13px] font-semibold text-accent"
                  onClick={() =>
                    confirm(`Удалить доступ для ${u.username}?`) &&
                    run(
                      () => api(`/api/admin/users/${encodeURIComponent(u.username)}`, { method: 'DELETE' }),
                      'Доступ удалён',
                    )
                  }
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[14px] border border-line p-5">
        <h3 className="mb-4 text-[17px] text-brand">Открыть доступ</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Логин" hint="Латиница, цифры, точка, дефис — от 3 символов">
            <input
              className={inputCls}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>
          <Field label="Пароль" hint="Не короче 8 символов">
            <input
              className={inputCls}
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
        </div>
        <button
          type="button"
          className="btn-primary mt-4 px-5 py-2 text-[14px]"
          onClick={() =>
            run(
              () =>
                api('/api/admin/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(form),
                }),
              'Доступ открыт',
            ).then(() => setForm({ username: '', password: '' }))
          }
        >
          Добавить
        </button>
      </div>

      <div className="rounded-[14px] border border-line p-5">
        <h3 className="mb-4 text-[17px] text-brand">Сменить свой пароль</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Текущий пароль">
            <input
              className={inputCls}
              type="password"
              autoComplete="current-password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
            />
          </Field>
          <Field label="Новый пароль" hint="Не короче 8 символов">
            <input
              className={inputCls}
              type="password"
              autoComplete="new-password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
          </Field>
        </div>
        <button
          type="button"
          className="btn-primary mt-4 px-5 py-2 text-[14px]"
          onClick={() =>
            run(
              () =>
                api('/api/admin/password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(pw),
                }),
              'Пароль изменён',
            ).then(() => setPw({ current: '', next: '' }))
          }
        >
          Сменить
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- shell */

export default function Admin() {
  const { overrides, loaded, offices, socials, events, cocktails, mocktails, awards } = useContent()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [me, setMe] = useState<string | null>(null)
  const [section, setSection] = useState<Section>('seo')
  const [draft, setDraft] = useState<Overrides | null>(null)
  const [defaults, setDefaults] = useState<SeoDefaults>({})
  const [status, setStatus] = useState('')

  useEffect(() => {
    api('/api/admin/session')
      .then((r) => {
        setAuthed(Boolean(r.authenticated))
        setMe(r.username ?? null)
      })
      .catch(() => setAuthed(false))
  }, [])

  useEffect(() => {
    if (authed && loaded && !draft) setDraft(structuredClone(overrides))
  }, [authed, loaded, overrides, draft])

  useEffect(() => {
    if (authed) api('/api/admin/defaults').then((r) => setDefaults(r.seo)).catch(() => {})
  }, [authed])

  const save = useCallback(async () => {
    // `access` manages accounts through its own endpoints — there is no draft
    // for it, and nothing to PUT into the content store.
    if (!draft || section === 'access') return
    setStatus('Сохраняем…')
    try {
      await api(`/api/admin/content/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft[section]),
      })
      setStatus('Сохранено. Обновите страницу сайта, чтобы увидеть изменения.')
    } catch (err) {
      setStatus(`Ошибка: ${(err as Error).message}`)
    }
  }, [draft, section])

  if (authed === null) return <div className="p-10 text-muted">Загрузка…</div>
  if (!authed)
    return (
      <Login
        onDone={() =>
          api('/api/admin/session').then((r) => {
            setMe(r.username ?? null)
            setAuthed(true)
          })
        }
      />
    )
  if (!draft) return <div className="p-10 text-muted">Загрузка контента…</div>

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-3 px-5 py-4">
          <strong className="text-brand">Админка Seven Dates</strong>
          <nav className="flex flex-wrap gap-2">
            {(Object.keys(SECTION_LABEL) as Section[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold ${
                  key === section ? 'border-brand bg-brand text-white' : 'border-line text-muted'
                }`}
              >
                {SECTION_LABEL[key]}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {section !== 'access' && (
              <button type="button" onClick={save} className="btn-primary px-5 py-2 text-[14px]">
                Сохранить «{SECTION_LABEL[section]}»
              </button>
            )}
            {me && <span className="text-[13px] text-muted">{me}</span>}
            <button
              type="button"
              className="text-[13px] text-muted hover:text-accent"
              onClick={() =>
                api('/api/admin/logout', { method: 'POST' }).then(() => setAuthed(false))
              }
            >
              Выйти
            </button>
          </div>
        </div>
        {status && <p className="px-5 pb-3 text-[13px] text-brand">{status}</p>}
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-8">
        {section === 'seo' && (
          <SeoEditor
            value={draft.seo}
            defaults={defaults}
            onChange={(seo) => setDraft({ ...draft, seo })}
          />
        )}
        {section === 'contacts' && (
          <ContactsEditor
            value={draft.contacts}
            builtIn={{ offices, socials }}
            onChange={(contacts) => setDraft({ ...draft, contacts })}
          />
        )}
        {section === 'texts' && (
          <TextsEditor value={draft.texts} onChange={(texts) => setDraft({ ...draft, texts })} />
        )}
        {section === 'access' && <AccessEditor me={me} />}
        {section === 'lists' && (
          <ListsEditor
            value={draft.lists}
            builtIn={{ events, cocktails, mocktails, awards }}
            onChange={(lists) => setDraft({ ...draft, lists })}
          />
        )}
      </main>
    </div>
  )
}
