'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface WorkspaceFileChangeEvent {
  file_path: string;
  event_type: 'change' | 'add' | 'unlink';
  content_hash: string;
  timestamp: number;
}

interface UseWorkspaceEventsOptions {
  agentId: string;
  onFileChange?: (event: WorkspaceFileChangeEvent) => void;
  onReconnect?: () => void;
}

export function useWorkspaceEvents({ agentId, onFileChange, onReconnect }: UseWorkspaceEventsOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onFileChangeRef = useRef(onFileChange);
  const onReconnectRef = useRef(onReconnect);

  // Keep refs up to date without re-triggering effect
  useEffect(() => { onFileChangeRef.current = onFileChange; }, [onFileChange]);
  useEffect(() => { onReconnectRef.current = onReconnect; }, [onReconnect]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/workspace/${agentId}/events`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WorkspaceFileChangeEvent;
        onFileChangeRef.current?.(data);
      } catch {
        // Ignore parse errors (e.g. heartbeat comments)
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus('disconnected');
      eventSource.close();

      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        setConnectionStatus('connecting');
        onReconnectRef.current?.();
        connect();
      }, 3000);
    };
  }, [agentId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return { connectionStatus };
}
