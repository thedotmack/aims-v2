import { watch, type FSWatcher } from 'chokidar';
import { readFile } from 'fs/promises';
import { computeContentHash } from './file-hash';
import { workspaceEventBus, type WorkspaceFileChangeEvent } from './workspace-event-bus';
import path from 'path';

const activeWatchers = new Map<string, FSWatcher>();

export function startWatchingWorkspace(agentId: string, workspacePath: string) {
  if (activeWatchers.has(agentId)) return;

  const watcher = watch(workspacePath, {
    ignored: (filePath: string) => {
      // Ignore .git, node_modules, and non-text files
      if (filePath.includes('.git') || filePath.includes('node_modules')) return true;
      // Only watch markdown, yaml, json, txt files (and directories)
      const ext = path.extname(filePath).toLowerCase();
      if (ext && !['.md', '.yaml', '.yml', '.json', '.txt'].includes(ext)) return true;
      return false;
    },
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    atomic: true,
    depth: 3,
  });

  const handleFileEvent = async (eventType: 'change' | 'add' | 'unlink', filePath: string) => {
    const relativePath = path.relative(workspacePath, filePath);
    let contentHash = '';

    if (eventType !== 'unlink') {
      try {
        const content = await readFile(filePath);
        contentHash = computeContentHash(content);
      } catch {
        return; // File might have been deleted between event and read
      }
    }

    const event: WorkspaceFileChangeEvent = {
      file_path: relativePath,
      event_type: eventType,
      content_hash: contentHash,
      timestamp: Date.now(),
    };

    workspaceEventBus.emit(agentId, event);
  };

  watcher.on('change', (filePath) => handleFileEvent('change', filePath));
  watcher.on('add', (filePath) => handleFileEvent('add', filePath));
  watcher.on('unlink', (filePath) => handleFileEvent('unlink', filePath));

  activeWatchers.set(agentId, watcher);
}

export function stopWatchingWorkspace(agentId: string) {
  const watcher = activeWatchers.get(agentId);
  if (watcher) {
    watcher.close();
    activeWatchers.delete(agentId);
  }
}
