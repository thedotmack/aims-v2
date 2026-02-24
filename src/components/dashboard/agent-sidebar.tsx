"use client";

/**
 * AgentSidebar
 *
 * Navigation sidebar for an agent's dashboard. Shows file tree,
 * navigation links (Overview, Files, Memory, Activity), and sync status.
 * Will be implemented in Phase 2.
 */

export function AgentSidebar({ agentId }: { agentId: string }) {
  return (
    <aside className="w-64 border-r p-4">
      <h2 className="font-semibold">Agent: {agentId}</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Sidebar placeholder
      </p>
    </aside>
  );
}
