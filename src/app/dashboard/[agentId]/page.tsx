import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Brain, Clock, Activity } from "lucide-react";
import { MemoryFeed } from "@/components/dashboard/memory-feed";

const WORKSPACE_FILES = [
  {
    filename: "SOUL.md",
    description: "Core personality and behavioral guidelines",
  },
  {
    filename: "IDENTITY.md",
    description: "Agent identity, name, and public profile",
  },
  {
    filename: "USER.md",
    description: "User preferences and interaction history",
  },
  {
    filename: "MEMORY.md",
    description: "Persistent memory and learned context",
  },
  {
    filename: "AGENTS.md",
    description: "Multi-agent coordination and relationships",
  },
  {
    filename: "TOOLS.md",
    description: "Available tools and capability definitions",
  },
  {
    filename: "HEARTBEAT.md",
    description: "Health check and last activity timestamp",
  },
];

export default async function AgentOverviewPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  return (
    <div className="p-6 space-y-6">
      {/* Agent Identity Card */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🐾</span>
            <div>
              <CardTitle className="text-xl text-text-primary">
                OpenClaw
              </CardTitle>
              <CardDescription className="text-text-secondary">
                Your AI agent — always learning, always adapting
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border bg-surface">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-accent" />
              <div>
                <p className="text-2xl font-bold text-text-primary">7</p>
                <p className="text-xs text-text-muted">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-success" />
              <div>
                <p className="text-2xl font-bold text-text-primary">Just now</p>
                <p className="text-xs text-text-muted">Last Sync</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <Brain className="size-4 text-info" />
              <div>
                <p className="text-2xl font-bold text-text-primary">0</p>
                <p className="text-xs text-text-muted">Memory Entries Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <Activity className="size-4 text-warning" />
              <div>
                <p className="text-2xl font-bold text-text-primary">Idle</p>
                <p className="text-xs text-text-muted">Agent Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Soul Summary + Recent Memory */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-primary">
              Soul Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">
              Soul configuration will appear here...
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-primary">
              Recent Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemoryFeed agentId={agentId} limit={10} compact />
          </CardContent>
        </Card>
      </div>

      {/* File Grid */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-muted">
          Workspace Files
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORKSPACE_FILES.map((file) => (
            <Link
              key={file.filename}
              href={`/dashboard/${agentId}/files/${file.filename}`}
            >
              <Card className="border-border bg-surface transition-colors hover:bg-surface-raised hover:border-border-bright cursor-pointer h-full">
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-text-muted" />
                    <CardTitle className="text-sm font-mono text-text-primary">
                      {file.filename}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-text-secondary">
                    {file.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
