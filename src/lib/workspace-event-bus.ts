/**
 * Workspace Event Bus
 *
 * Singleton EventEmitter for broadcasting file change events to SSE connections.
 * Will be implemented in Phase 4.
 */

export interface WorkspaceEvent {
  file_path: string;
  event_type: "change" | "add" | "unlink";
  content_hash: string;
  timestamp: number;
}

// Placeholder — implementation in Phase 4
