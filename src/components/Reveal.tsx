import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Fades its content up the first time it scrolls into view, then stops
 * observing — the reveal is a one-shot entrance, not a scroll-linked effect.
 *
 * `stagger` shifts each direct child by 80ms so a grid arrives card after card
 * instead of snapping in as one block.
 */
export default function Reveal({
  children,
  className = '',
  stagger = false,
}: {
  children: ReactNode
  className?: string
  stagger?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Held in state, not written with classList: className is React's to own, so
  // an imperative class here would be dropped the next time className changes.
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reveal at once when we must not or cannot animate — the OS asks for
    // reduced motion, or the browser has no IntersectionObserver. Skipping this
    // would leave the content hidden forever.
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        io.disconnect()
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${stagger ? 'reveal-stagger' : 'reveal'}${shown ? ' is-revealed' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
