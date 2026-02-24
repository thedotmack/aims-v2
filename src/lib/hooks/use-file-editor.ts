'use client';

import { useState, useCallback } from 'react';

interface ConflictState {
  yourContent: string;
  theirContent: string;
  currentHash: string;
}

interface UseFileEditorReturn {
  content: string;
  originalContent: string;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  conflict: ConflictState | null;
  loadFile: (agentId: string, filePath: string) => Promise<void>;
  updateContent: (newContent: string) => void;
  saveFile: (agentId: string, filePath: string) => Promise<void>;
  resolveConflictKeepMine: (agentId: string, filePath: string) => Promise<void>;
  resolveConflictKeepTheirs: () => void;
  discardChanges: () => void;
}

export function useFileEditor(): UseFileEditorReturn {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [hashWhenEditingStarted, setHashWhenEditingStarted] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conflict, setConflict] = useState<ConflictState | null>(null);

  const hasUnsavedChanges = content !== originalContent;

  const loadFile = useCallback(
    async (agentId: string, filePath: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/workspace/${agentId}/files?path=${encodeURIComponent(filePath)}`,
        );
        if (!res.ok) throw new Error('Failed to load file');
        const data = await res.json();
        setContent(data.content);
        setOriginalContent(data.content);
        setHashWhenEditingStarted(data.content_hash);
        setConflict(null);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const saveFile = useCallback(
    async (agentId: string, filePath: string) => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/workspace/${agentId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_path: filePath,
            content,
            expected_hash: hashWhenEditingStarted,
          }),
        });

        if (res.status === 409) {
          const data = await res.json();
          setConflict({
            yourContent: data.your_content,
            theirContent: data.current_content,
            currentHash: data.current_hash,
          });
          return;
        }

        if (!res.ok) throw new Error('Failed to save file');

        const data = await res.json();
        setHashWhenEditingStarted(data.content_hash);
        setOriginalContent(content);
        setConflict(null);
      } finally {
        setIsSaving(false);
      }
    },
    [content, hashWhenEditingStarted],
  );

  const resolveConflictKeepMine = useCallback(
    async (agentId: string, filePath: string) => {
      if (!conflict) return;
      setIsSaving(true);
      try {
        const res = await fetch(`/api/workspace/${agentId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_path: filePath,
            content,
            expected_hash: conflict.currentHash, // Use the latest known server hash
          }),
        });
        if (!res.ok) throw new Error('Failed to save after conflict resolution');
        const data = await res.json();
        setHashWhenEditingStarted(data.content_hash);
        setOriginalContent(content);
        setConflict(null);
      } finally {
        setIsSaving(false);
      }
    },
    [content, conflict],
  );

  const resolveConflictKeepTheirs = useCallback(() => {
    if (!conflict) return;
    setContent(conflict.theirContent);
    setOriginalContent(conflict.theirContent);
    setHashWhenEditingStarted(conflict.currentHash);
    setConflict(null);
  }, [conflict]);

  const discardChanges = useCallback(() => {
    setContent(originalContent);
    setConflict(null);
  }, [originalContent]);

  return {
    content,
    originalContent,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    conflict,
    loadFile,
    updateContent,
    saveFile,
    resolveConflictKeepMine,
    resolveConflictKeepTheirs,
    discardChanges,
  };
}
