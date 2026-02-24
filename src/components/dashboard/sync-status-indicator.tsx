"use client";

/**
 * SyncStatusIndicator
 *
 * Visual indicator showing the real-time sync status between the server
 * workspace and the browser. Shows connected/disconnected/syncing states.
 * Will be implemented in Phase 4.
 */

export function SyncStatusIndicator({
  connectionStatus,
}: {
  connectionStatus: "connected" | "disconnected" | "syncing";
}) {
  const statusColors = {
    connected: "bg-green-500",
    disconnected: "bg-red-500",
    syncing: "bg-yellow-500",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${statusColors[connectionStatus]}`}
      />
      <span className="text-xs text-muted-foreground capitalize">
        {connectionStatus}
      </span>
    </div>
  );
}
