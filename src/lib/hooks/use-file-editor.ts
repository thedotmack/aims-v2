"use client";

/**
 * useFileEditor
 *
 * Client-side hook for loading and saving workspace files with optimistic
 * locking. Tracks the content hash from when editing started and sends it
 * on save to detect conflicts.
 * Will be implemented in Phase 3.
 */

// Placeholder — implementation in Phase 3
export function useFileEditor(_agentId: string, _filePath: string) {
  return {
    content: "",
    isLoading: true,
    isSaving: false,
    conflict: null,
    loadFile: async () => {},
    saveFile: async (_content: string) => {},
    resolveConflictKeepMine: async () => {},
    resolveConflictKeepTheirs: async () => {},
  };
}
