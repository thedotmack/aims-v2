"use client";

/**
 * useWorkspaceEvents
 *
 * Client-side hook that connects to the SSE endpoint for an agent's workspace
 * and provides a stream of file change events.
 * Will be implemented in Phase 4.
 */

// Placeholder — implementation in Phase 4
export function useWorkspaceEvents(_agentId: string) {
  return {
    events: [],
    connectionStatus: "disconnected" as const,
  };
}
