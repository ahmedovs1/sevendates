import type { ContentNode } from '../content/types'

/** Renders the block list extracted from the original pages. */
export default function RichText({ nodes }: { nodes: ContentNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'h2') {
          return (
            <h2 key={i} className="mt-8 text-[22px] text-brand">
              {node.text}
            </h2>
          )
        }
        if (node.type === 'h3') {
          return (
            <h3 key={i} className="mt-6 text-[18px] text-brand-dark">
              {node.text}
            </h3>
          )
        }
        if (node.type === 'li') {
          return (
            <p key={i} className="mt-2.5 flex gap-2.5 text-muted">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{node.text}</span>
            </p>
          )
        }
        return (
          <p key={i} className="mt-2.5 text-muted">
            {node.text}
          </p>
        )
      })}
    </>
  )
}
