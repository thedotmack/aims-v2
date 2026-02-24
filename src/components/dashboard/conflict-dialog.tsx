"use client";

/**
 * ConflictDialog
 *
 * Modal dialog shown when a file save fails due to concurrent edits (409 conflict).
 * Displays a side-by-side diff using react-diff-viewer-continued and offers
 * "Keep mine", "Keep theirs", and "Cancel" actions.
 * Will be implemented in Phase 3.
 */

export function ConflictDialog({
  isOpen,
  onKeepMine,
  onKeepTheirs,
  onCancel,
}: {
  isOpen: boolean;
  yourContent: string;
  theirContent: string;
  onKeepMine: () => void;
  onKeepTheirs: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-4xl w-full">
        <h2 className="text-lg font-semibold">Conflict Detected</h2>
        <p className="text-muted-foreground mt-2">
          Conflict dialog placeholder — will show side-by-side diff
        </p>
        <div className="flex gap-2 mt-4">
          <button onClick={onKeepMine}>Keep Mine</button>
          <button onClick={onKeepTheirs}>Keep Theirs</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
