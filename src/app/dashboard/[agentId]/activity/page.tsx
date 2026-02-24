import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity } from "lucide-react";

export default async function ActivityFeedPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  await params;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="size-5 text-warning" />
        <h1 className="text-xl font-bold text-text-primary">Activity Feed</h1>
      </div>

      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-secondary">
            Real-Time Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            Activity feed will show live file changes streamed via SSE.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
