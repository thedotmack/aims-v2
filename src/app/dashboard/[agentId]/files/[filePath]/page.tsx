export default async function FileViewerPage({
  params,
}: {
  params: Promise<{ agentId: string; filePath: string }>;
}) {
  const { agentId, filePath } = await params;
  const decodedFilePath = decodeURIComponent(filePath);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">File Viewer</h1>
      <p className="text-muted-foreground mt-2">
        Agent: {agentId} | File: {decodedFilePath}
      </p>
      <p className="text-muted-foreground mt-4">
        File viewer placeholder — will render markdown with View / Edit / History
        tabs.
      </p>
    </div>
  );
}
