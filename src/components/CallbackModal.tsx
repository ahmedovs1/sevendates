import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import {
  canSendDirectly,
  formEndpoint,
  formRecipients,
  formWhatsapp,
  routes,
  web3formsKey,
  web3formsUrl,
} from '../data/site'

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

/** `choose` is the no-backend path: the visitor picks the channel themselves. */
type Status = 'idle' | 'sending' | 'sent' | 'choose'

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.24.25-.41.09-.16.04-.3-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42l-.47-.01c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  )
}

function CallbackModal({ onClose }: { onClose: () => void }) {
  const { t, path } = useI18n()
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    consent: false,
  })

  const subject = `${t.modal.title} — Seven Dates`
  const summary = [
    `${t.modal.name}: ${form.name}`,
    `${t.modal.phone}: ${form.phone}`,
    `${t.modal.email}: ${form.email}`,
    form.message && `${t.modal.message}: ${form.message}`,
  ]
    .filter(Boolean)
    .join('\n')

  const mailHref = `mailto:${formRecipients.join(',')}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(summary)}`
  const whatsappHref = `https://wa.me/${formWhatsapp.number}?text=${encodeURIComponent(
    `${subject}\n${summary}`,
  )}`

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Nothing configured that can actually send mail — hand the message to the
    // visitor's own mail client or WhatsApp instead of dropping it.
    if (!canSendDirectly) {
      setStatus('choose')
      return
    }

    setStatus('sending')

    // Two independent routes. The relay is preferred — it sends from the
    // company's own mailbox — but on hosting where /api is not proxied it
    // answers 404, and then the form must still work rather than dead-end.
    const viaWeb3Forms = () =>
      fetch(web3formsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3formsKey,
          subject,
          from_name: 'Seven Dates',
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          page: window.location.href,
        }),
      })
        .then((r) => r.json())
        .then((body: { success?: boolean }) => {
          if (!body.success) throw new Error('Rejected by the mail service')
        })

    try {
      const res = formEndpoint
        ? await fetch(formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              ...form,
              subject,
              recipients: formRecipients,
              whatsapp: formWhatsapp.number,
              page: window.location.href,
            }),
          })
        : await fetch(web3formsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: web3formsKey,
              subject,
              from_name: 'Seven Dates',
              name: form.name,
              email: form.email,
              phone: form.phone,
              message: form.message,
              page: window.location.href,
            }),
          })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      // Web3Forms answers 200 with { success: false } on a bad key, so the
      // status code alone is not enough to call this delivered.
      if (!formEndpoint) {
        const body = (await res.json()) as { success?: boolean }
        if (!body.success) throw new Error('Rejected by the mail service')
      }
      setStatus('sent')
    } catch {
      // The relay did not take it. Try the keyed service before giving up, so a
      // proxy that is not configured yet never costs a lead.
      if (formEndpoint && web3formsKey) {
        try {
          await viaWeb3Forms()
          setStatus('sent')
          return
        } catch {
          /* fall through to the manual channels */
        }
      }
      setStatus('choose')
    }
  }

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-brand-deep/55 p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.modal.title}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-[22px] bg-white p-9 shadow-brand"
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

        {status === 'sent' ? (
          <div className="py-4 text-center">
            <p className="font-semibold text-brand">{t.modal.success}</p>
            <p className="mt-2 text-[15px] text-muted">{t.modal.successHint}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-accent mt-5 w-full"
            >
              <WhatsappIcon />
              {t.modal.openWhatsapp}
            </a>
          </div>
        ) : status === 'choose' ? (
          <div className="py-2">
            <h2 className="text-2xl text-brand">{t.modal.title}</h2>
            <p className="mb-6 mt-2 text-[15px] text-muted">{t.modal.chooseChannel}</p>

            <a href={mailHref} className="btn-primary w-full">
              {t.modal.sendMail}
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-accent mt-3 w-full"
            >
              <WhatsappIcon />
              {t.modal.sendWhatsapp}
            </a>
          </div>
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
            <label className="mb-3.5 block">
              <input
                className="field"
                type="email"
                required
                autoComplete="email"
                placeholder={t.modal.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="mb-3.5 block">
              <textarea
                className="field min-h-[110px] resize-y"
                rows={4}
                placeholder={t.modal.message}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
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

            <button type="submit" className="btn-primary w-full" disabled={status === 'sending'}>
              {status === 'sending' ? t.modal.sending : t.modal.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
