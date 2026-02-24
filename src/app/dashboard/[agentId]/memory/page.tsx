export default async function MemoryFeedPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Memory Feed</h1>
      <p className="text-muted-foreground mt-2">
        Memory observations for agent: {agentId}
      </p>
      <p className="text-muted-foreground mt-4">
        Memory feed placeholder — will show claude-mem observations in a
        searchable timeline.
      </p>
    </div>
  );
}
