"use client";

/**
 * MemoryFeed
 *
 * Displays claude-mem observations for an agent in a searchable timeline.
 * Shows observation type badges, timestamps, and expandable content.
 * Will be implemented in Phase 6.
 */

export function MemoryFeed({ agentId }: { agentId: string }) {
  return (
    <div className="p-4">
      <p className="text-muted-foreground">
        Memory feed placeholder for agent: {agentId}
      </p>
    </div>
  );
}
