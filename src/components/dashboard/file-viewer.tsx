'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import { Badge } from '@/components/ui/badge';

interface FileViewerProps {
  content: string;
  filePath: string;
}

export function FileViewer({ content, filePath }: FileViewerProps) {
  const isMarkdown =
    filePath.endsWith('.md') || filePath.endsWith('.mdx');

  // Parse frontmatter for markdown files
  const { data: frontmatter, content: markdownContent } = isMarkdown
    ? matter(content)
    : { data: {}, content };
  const hasFrontmatter = Object.keys(frontmatter).length > 0;

  if (!isMarkdown) {
    return (
      <div className="file-viewer">
        <pre className="overflow-auto rounded-lg border border-[var(--border)] bg-[var(--aims-surface)] p-4 font-mono text-sm text-[var(--aims-text-primary)]">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <div className="file-viewer">
      {hasFrontmatter && (
        <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-[var(--border)] bg-[var(--aims-surface)] p-4">
          {Object.entries(frontmatter).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="font-mono text-xs">
              {key}: {String(value)}
            </Badge>
          ))}
        </div>
      )}

      <div className="aims-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </ReactMarkdown>
      </div>

      {/* Scoped markdown styles for dark mode */}
      <style jsx global>{`
        .aims-prose {
          color: var(--aims-text-primary);
          line-height: 1.75;
          max-width: none;
        }

        .aims-prose h1,
        .aims-prose h2,
        .aims-prose h3,
        .aims-prose h4,
        .aims-prose h5,
        .aims-prose h6 {
          color: var(--aims-text-primary);
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }

        .aims-prose h1 { font-size: 2em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
        .aims-prose h2 { font-size: 1.5em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
        .aims-prose h3 { font-size: 1.25em; }
        .aims-prose h4 { font-size: 1.1em; }

        .aims-prose p {
          margin-top: 0.75em;
          margin-bottom: 0.75em;
        }

        .aims-prose a {
          color: var(--aims-accent-hover);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .aims-prose a:hover {
          color: var(--primary);
        }

        .aims-prose strong {
          color: var(--aims-text-primary);
          font-weight: 600;
        }

        .aims-prose code {
          background: var(--aims-surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.15em 0.35em;
          font-size: 0.875em;
          font-family: var(--font-mono);
          color: var(--aims-accent-hover);
        }

        .aims-prose pre {
          background: var(--aims-surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1em;
          overflow-x: auto;
          margin: 1em 0;
        }

        .aims-prose pre code {
          background: transparent;
          border: none;
          padding: 0;
          color: var(--aims-text-primary);
          font-size: 0.875em;
        }

        .aims-prose blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 1em;
          margin: 1em 0;
          color: var(--aims-text-secondary);
          font-style: italic;
        }

        .aims-prose ul,
        .aims-prose ol {
          padding-left: 1.5em;
          margin: 0.75em 0;
        }

        .aims-prose li {
          margin: 0.25em 0;
        }

        .aims-prose ul { list-style-type: disc; }
        .aims-prose ol { list-style-type: decimal; }

        .aims-prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }

        .aims-prose th,
        .aims-prose td {
          border: 1px solid var(--border);
          padding: 0.5em 0.75em;
          text-align: left;
        }

        .aims-prose th {
          background: var(--aims-surface);
          font-weight: 600;
          color: var(--aims-text-primary);
        }

        .aims-prose td {
          color: var(--aims-text-secondary);
        }

        .aims-prose tr:nth-child(even) td {
          background: var(--aims-surface);
        }

        .aims-prose hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2em 0;
        }

        .aims-prose img {
          max-width: 100%;
          border-radius: 8px;
        }

        .aims-prose input[type="checkbox"] {
          margin-right: 0.5em;
          accent-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
