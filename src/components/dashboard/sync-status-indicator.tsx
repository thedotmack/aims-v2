'use client';

import { type ConnectionStatus } from '@/lib/hooks/use-workspace-events';

interface SyncStatusIndicatorProps {
  connectionStatus: ConnectionStatus;
}

export function SyncStatusIndicator({ connectionStatus }: SyncStatusIndicatorProps) {
  const statusConfig = {
    connected: { color: 'bg-green-500', label: 'Live', animate: 'animate-pulse' },
    connecting: { color: 'bg-yellow-500', label: 'Connecting...', animate: 'animate-pulse' },
    disconnected: { color: 'bg-red-500', label: 'Disconnected', animate: '' },
  };

  const config = statusConfig[connectionStatus];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`inline-block h-2 w-2 rounded-full ${config.color} ${config.animate}`} />
      <span className="text-[var(--text-secondary)]">{config.label}</span>
    </div>
  );
}
