import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { routes } from '../data/site'

const ModalContext = createContext<{ open: () => void }>({ open: () => {} })
export const useCallbackModal = () => useContext(ModalContext)

export function CallbackModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close])

  return (
    <ModalContext.Provider value={{ open }}>
      {children}
      {isOpen && <CallbackModal onClose={close} />}
    </ModalContext.Provider>
  )
}

function CallbackModal({ onClose }: { onClose: () => void }) {
  const { t, path } = useI18n()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', consent: false })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // The original site posts to a WordPress endpoint; wire this up to your own API.
    setSent(true)
  }

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-brand-dark/50 p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.modal.title}
    >
      <div
        className="relative w-full max-w-[460px] rounded-[22px] bg-white p-9 shadow-brand"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-2 text-2xl text-muted hover:text-brand"
        >
          ×
        </button>

        {sent ? (
          <p className="py-6 text-center font-semibold text-brand">{t.modal.success}</p>
        ) : (
          <form onSubmit={submit}>
            <h2 className="text-2xl text-brand">{t.modal.title}</h2>
            <p className="mb-6 mt-2 text-[15px] text-muted">{t.modal.subtitle}</p>

            <label className="mb-3.5 block">
              <input
                className="field"
                type="text"
                required
                placeholder={t.modal.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="mb-3.5 block">
              <input
                className="field"
                type="tel"
                required
                placeholder={t.modal.phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>

            <label className="mb-5 mt-1.5 flex items-start gap-2.5 text-[13px] text-muted">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-1"
              />
              <span>
                {t.modal.consent}{' '}
                <Link className="text-brand underline" to={path(routes.policy)} onClick={onClose}>
                  {t.modal.policy}
                </Link>{' '}
                ·{' '}
                <Link className="text-brand underline" to={path(routes.consent)} onClick={onClose}>
                  {t.modal.agreement}
                </Link>
              </span>
            </label>

            <button type="submit" className="btn-primary w-full">
              {t.modal.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
