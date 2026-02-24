import { EventEmitter } from 'events';

export interface WorkspaceFileChangeEvent {
  file_path: string;
  event_type: 'change' | 'add' | 'unlink';
  content_hash: string;
  timestamp: number;
}

// Singleton pattern — persists across route handler invocations in Node.js
class WorkspaceEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(1000);
  }

  on(agentId: string, handler: (event: WorkspaceFileChangeEvent) => void) {
    this.emitter.on(agentId, handler);
  }

  off(agentId: string, handler: (event: WorkspaceFileChangeEvent) => void) {
    this.emitter.off(agentId, handler);
  }

  emit(agentId: string, event: WorkspaceFileChangeEvent) {
    this.emitter.emit(agentId, event);
  }
}

// Module-level singleton
export const workspaceEventBus = new WorkspaceEventBus();
