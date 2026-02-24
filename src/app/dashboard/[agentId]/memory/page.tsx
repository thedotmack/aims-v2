'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { MemoryFeed } from '@/components/dashboard/memory-feed';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

const OBSERVATION_TYPES = ['all', 'decision', 'discovery', 'bugfix', 'general'];

export default function MemoryPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [activeObservationType, setActiveObservationType] = useState('all');

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Brain className="size-5 text-info" />
        <h1 className="text-xl font-bold text-text-primary">Memory Feed</h1>
      </div>

      {/* Observation type filter buttons */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {OBSERVATION_TYPES.map((type) => (
            <Button
              key={type}
              variant={activeObservationType === type ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveObservationType(type)}
              className="capitalize text-xs"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <MemoryFeed
        agentId={agentId}
        limit={100}
        observationTypeFilter={activeObservationType}
      />
    </div>
  );
}
