import { startWatchingWorkspace } from './workspace-watcher';

let initialized = false;

export function initializeWorkspaceWatchers() {
  if (initialized) return;
  initialized = true;

  const basePath = process.env.WORKSPACE_BASE_PATH || '/data/workspaces';
  const workspacePath = `${basePath}/openclaw`;

  console.log(`[AIMS] Starting workspace watcher for openclaw at ${workspacePath}`);
  startWatchingWorkspace('openclaw', workspacePath);
}
