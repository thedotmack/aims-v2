'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileViewer } from '@/components/dashboard/file-viewer';
import { FileEditor } from '@/components/dashboard/file-editor';
import { ConflictDialog } from '@/components/dashboard/conflict-dialog';
import { useFileEditor } from '@/lib/hooks/use-file-editor';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'view' | 'edit';

export default function FilePage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const filePath = decodeURIComponent(params.filePath as string);
  const [viewMode, setViewMode] = useState<ViewMode>('view');

  const {
    content,
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
  } = useFileEditor();

  useEffect(() => {
    loadFile(agentId, filePath);
  }, [agentId, filePath, loadFile]);

  const handleSave = async () => {
    await saveFile(agentId, filePath);
    if (!conflict) {
      toast.success('File saved successfully');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--aims-accent-hover)]" />
          <h1 className="font-mono text-lg font-semibold text-[var(--aims-text-primary)]">
            {filePath}
          </h1>
        </div>
        <div className="flex rounded-lg border border-[var(--border)] bg-[var(--aims-surface)]">
          <button
            onClick={() => setViewMode('view')}
            className={`flex items-center gap-1 rounded-l-lg px-3 py-1.5 text-sm transition-colors ${
              viewMode === 'view'
                ? 'bg-[var(--aims-surface-raised)] text-[var(--aims-text-primary)]'
                : 'text-[var(--aims-text-secondary)]'
            }`}
          >
            <Eye className="h-4 w-4" /> View
          </button>
          <button
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1 rounded-r-lg px-3 py-1.5 text-sm transition-colors ${
              viewMode === 'edit'
                ? 'bg-[var(--aims-surface-raised)] text-[var(--aims-text-primary)]'
                : 'text-[var(--aims-text-secondary)]'
            }`}
          >
            <Pencil className="h-4 w-4" /> Edit
            {hasUnsavedChanges && (
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[var(--aims-warning)]" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="mb-2 h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ) : viewMode === 'view' ? (
        <Card>
          <CardContent className="p-6">
            <FileViewer content={content} filePath={filePath} />
          </CardContent>
        </Card>
      ) : (
        <FileEditor
          content={content}
          filePath={filePath}
          onChange={updateContent}
          onSave={handleSave}
          onDiscard={discardChanges}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
        />
      )}

      {/* Conflict Dialog */}
      {conflict && (
        <ConflictDialog
          open={!!conflict}
          yourContent={conflict.yourContent}
          theirContent={conflict.theirContent}
          onKeepMine={() => resolveConflictKeepMine(agentId, filePath)}
          onKeepTheirs={resolveConflictKeepTheirs}
          onCancel={() => {}}
        />
      )}
    </div>
  );
}
