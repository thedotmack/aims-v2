'use client';

import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ReactDiffViewer = dynamic(
  () => import('react-diff-viewer-continued'),
  { ssr: false },
);

interface ConflictDialogProps {
  open: boolean;
  yourContent: string;
  theirContent: string;
  onKeepMine: () => void;
  onKeepTheirs: () => void;
  onCancel: () => void;
}

export function ConflictDialog({
  open,
  yourContent,
  theirContent,
  onKeepMine,
  onKeepTheirs,
  onCancel,
}: ConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Conflict Detected</DialogTitle>
          <DialogDescription>
            The agent modified this file while you were editing. Choose which
            version to keep.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <ReactDiffViewer
            oldValue={yourContent}
            newValue={theirContent}
            splitView={true}
            leftTitle="Your Changes"
            rightTitle="Agent's Changes"
            useDarkTheme={true}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onKeepTheirs}>
            Keep Theirs
          </Button>
          <Button onClick={onKeepMine}>Keep Mine</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
