"use client";

/**
 * FileEditor
 *
 * Markdown editor with live preview for workspace files. Uses @uiw/react-md-editor.
 * Supports Cmd+S save shortcut and optimistic locking via content hashes.
 * Will be implemented in Phase 3.
 */

export function FileEditor({
  content,
  onChange,
  onSave,
}: {
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="p-4">
      <p className="text-muted-foreground">File editor placeholder</p>
      <textarea
        className="w-full h-64 font-mono text-sm border rounded p-2"
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
