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

  // one plain-text body, reused by every delivery channel
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
      // service down or misconfigured — fall back rather than lose the lead
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
          <p className="py-6 text-center font-semibold text-brand">{t.modal.success}</p>
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
              {t.modal.sendWhatsapp}
            </a>

            <p className="mt-5 text-center text-[13px] leading-relaxed text-muted">
              {formRecipients.join(' · ')}
              <span className="block">{formWhatsapp.label}</span>
            </p>
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
