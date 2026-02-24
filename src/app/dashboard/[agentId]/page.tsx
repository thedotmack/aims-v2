export default async function AgentOverviewPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Agent Overview</h1>
      <p className="text-muted-foreground mt-2">
        Dashboard for agent: {agentId}
      </p>
      <p className="text-muted-foreground mt-4">
        Agent overview placeholder — will show workspace summary, recent
        activity, and file tree.
      </p>
    </div>
  );
}
