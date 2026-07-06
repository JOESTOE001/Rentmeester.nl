import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"

interface MarkdownBodyProps {
  content: string
  className?: string
}

/**
 * Rendert markdown + HTML (bijv. <strong>, <em>) veilig.
 * Gebruik voor body-tekst uit markdown-content (bijv. referenties)
 */
export function MarkdownBody({ content, className = "" }: MarkdownBodyProps) {
  if (!content.trim()) return null

  return (
    <div
      className={`markdown-body text-foreground [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-semibold ${className}`}
    >
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
    </div>
  )
}
