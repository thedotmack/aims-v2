export default async function ActivityFeedPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Activity Feed</h1>
      <p className="text-muted-foreground mt-2">
        Real-time activity for agent: {agentId}
      </p>
      <p className="text-muted-foreground mt-4">
        Activity feed placeholder — will show live file changes streamed via
        SSE.
      </p>
    </div>
  );
}
