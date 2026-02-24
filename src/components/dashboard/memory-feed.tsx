'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Observation {
  id: number;
  title: string | null;
  text: string;
  created_at: string;
  obs_type: string | null;
  project: string | null;
}

interface MemoryFeedProps {
  agentId: string;
  limit?: number;
  compact?: boolean;
  observationTypeFilter?: string;
}

const OBSERVATION_TYPE_COLORS: Record<string, string> = {
  decision: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  discovery: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bugfix: 'bg-green-500/20 text-green-400 border-green-500/30',
  general: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const TEXT_TRUNCATION_THRESHOLD = 120;
const POLLING_INTERVAL_MS = 30_000;

export function MemoryFeed({
  agentId,
  limit = 50,
  compact = false,
  observationTypeFilter,
}: MemoryFeedProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedObservationIds, setExpandedObservationIds] = useState<Set<number>>(
    new Set()
  );

  const fetchObservations = useCallback(async () => {
    try {
      let url = `/api/workspace/${agentId}/memory?limit=${limit}`;
      if (observationTypeFilter && observationTypeFilter !== 'all') {
        url += `&type=${encodeURIComponent(observationTypeFilter)}`;
      }
      const response = await fetch(url);
      if (!response.ok) return;
      const data = await response.json();
      setObservations(data.observations || []);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, limit, observationTypeFilter]);

  useEffect(() => {
    setIsLoading(true);
    fetchObservations();
    const pollingInterval = setInterval(fetchObservations, POLLING_INTERVAL_MS);
    return () => clearInterval(pollingInterval);
  }, [fetchObservations]);

  const toggleObservationExpanded = (observationId: number) => {
    setExpandedObservationIds((previousIds) => {
      const nextIds = new Set(previousIds);
      if (nextIds.has(observationId)) {
        nextIds.delete(observationId);
      } else {
        nextIds.add(observationId);
      }
      return nextIds;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (observations.length === 0) {
    return (
      <div className="py-8 text-center text-text-muted">
        No memory entries yet
      </div>
    );
  }

  return (
    <ScrollArea className={compact ? 'h-[300px]' : 'h-[600px]'}>
      <div className="space-y-2 pr-4">
        {observations.map((observation) => {
          const isExpanded = expandedObservationIds.has(observation.id);
          const typeColorClasses =
            OBSERVATION_TYPE_COLORS[observation.obs_type || 'general'] ||
            OBSERVATION_TYPE_COLORS.general;
          const shouldTruncate =
            observation.text.length > TEXT_TRUNCATION_THRESHOLD;
          const displayText =
            isExpanded || !shouldTruncate
              ? observation.text
              : observation.text.slice(0, TEXT_TRUNCATION_THRESHOLD) + '...';

          return (
            <Card
              key={observation.id}
              className="cursor-pointer transition-colors hover:bg-surface-raised"
              onClick={() => toggleObservationExpanded(observation.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {observation.title || 'Untitled'}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {displayText}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {observation.obs_type && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${typeColorClasses}`}
                      >
                        {observation.obs_type}
                      </Badge>
                    )}
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {formatRelativeTimestamp(observation.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function formatRelativeTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const differenceInMs = now.getTime() - date.getTime();
  const differenceInMinutes = Math.floor(differenceInMs / 60_000);

  if (differenceInMinutes < 1) return 'just now';
  if (differenceInMinutes < 60) return `${differenceInMinutes}m ago`;

  const differenceInHours = Math.floor(differenceInMinutes / 60);
  if (differenceInHours < 24) return `${differenceInHours}h ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
