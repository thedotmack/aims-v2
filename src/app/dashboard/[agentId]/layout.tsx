import { AgentSidebar } from "@/components/dashboard/agent-sidebar";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SidebarInset } from "@/components/ui/sidebar";

export default async function AgentDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  return (
    <>
      <AgentSidebar agentId={agentId} />
      <SidebarInset>
        <DashboardNav agentId={agentId} />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </>
  );
}
