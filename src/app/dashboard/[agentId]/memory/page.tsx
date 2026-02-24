import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain } from "lucide-react";

export default async function MemoryFeedPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  await params;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Brain className="size-5 text-info" />
        <h1 className="text-xl font-bold text-text-primary">Memory Feed</h1>
      </div>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            Observations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            Memory feed will show claude-mem observations in a searchable
            timeline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
