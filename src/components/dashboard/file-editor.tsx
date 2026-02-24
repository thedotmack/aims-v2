'use client';

import { useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface FileEditorProps {
  content: string;
  filePath: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

export function FileEditor({
  content,
  filePath,
  onChange,
  onSave,
  onDiscard,
  hasUnsavedChanges,
  isSaving,
}: FileEditorProps) {
  // Cmd+S / Ctrl+S keyboard shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !isSaving) {
          onSave();
        }
      }
    },
    [hasUnsavedChanges, isSaving, onSave],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div data-color-mode="dark">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-[var(--aims-text-secondary)]">
            {filePath}
          </span>
          {hasUnsavedChanges && (
            <span
              className="inline-block h-2 w-2 rounded-full bg-[var(--aims-warning)]"
              title="Unsaved changes"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={!hasUnsavedChanges}
          >
            <X className="mr-1 h-4 w-4" /> Discard
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            <Save className="mr-1 h-4 w-4" />{' '}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      <MDEditor
        value={content}
        onChange={(val) => onChange(val || '')}
        height={600}
        preview="live"
      />
    </div>
  );
}
