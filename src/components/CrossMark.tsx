/**
 * The red cross used for "free from" claims.
 *
 * Drawn inline rather than from `images.cross`: that PNG paints the mark on an
 * opaque pink square, which shows as a coloured block on light cards and cannot
 * be removed with CSS without also affecting the cross itself. Takes its colour
 * from `currentColor`, so pass a text-* class along with the size.
 */
export default function CrossMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
