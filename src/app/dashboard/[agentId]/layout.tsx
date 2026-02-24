export default function AgentDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agentId: string }>;
}) {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar will be added in Phase 2 */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
