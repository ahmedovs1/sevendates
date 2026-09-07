import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LANGS, flagOf, localizePath, useI18n, type LangCode } from '../i18n'

export default function LangSwitcher() {
  const { lang } = useI18n()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const switchTo = (next: LangCode) => {
    setOpen(false)
    navigate(localizePath(pathname, next))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line px-2.5 py-1.5 text-[13px] font-semibold uppercase"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <img src={flagOf(lang)} alt="" className="h-3 w-[18px] rounded-[2px] object-cover" />
        {lang}
      </button>

      {open && (
        <ul
          className="absolute right-0 top-[calc(100%+8px)] min-w-[118px] rounded-xl border border-line bg-white p-1.5 shadow-brand"
          role="listbox"
        >
          {LANGS.map((code) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => switchTo(code)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-semibold uppercase hover:bg-cream"
              >
                <img src={flagOf(code)} alt="" className="h-3 w-[18px] rounded-[2px] object-cover" />
                {code}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
