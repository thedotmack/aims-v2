"use client";

/**
 * FileViewer
 *
 * Read-only markdown renderer for workspace files. Uses react-markdown
 * with remark-gfm for GitHub-flavored markdown support.
 * Will be implemented in Phase 3.
 */

export function FileViewer({
  content,
}: {
  content: string;
}) {
  return (
    <div className="prose dark:prose-invert max-w-none p-4">
      <p className="text-muted-foreground">File viewer placeholder</p>
      <pre className="text-sm">{content}</pre>
    </div>
  );
}
