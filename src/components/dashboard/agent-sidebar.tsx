"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const WORKSPACE_FILES = [
  { filename: "SOUL.md", status: "synced" as const },
  { filename: "IDENTITY.md", status: "synced" as const },
  { filename: "USER.md", status: "synced" as const },
  { filename: "MEMORY.md", status: "modified" as const },
  { filename: "AGENTS.md", status: "synced" as const },
  { filename: "TOOLS.md", status: "synced" as const },
  { filename: "HEARTBEAT.md", status: "synced" as const },
];

function FileStatusBadge({ status }: { status: "synced" | "modified" }) {
  if (status === "synced") {
    return (
      <Badge
        variant="outline"
        className="ml-auto h-5 border-success/30 bg-success/10 text-success text-[10px] px-1.5"
      >
        synced
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="ml-auto h-5 border-warning/30 bg-warning/10 text-warning text-[10px] px-1.5"
    >
      modified
    </Badge>
  );
}

export function AgentSidebar({ agentId }: { agentId: string }) {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-text-primary">
            AIMS
          </span>
        </Link>
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted mt-1">
          Your Agents
        </p>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Agent entry */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-text-muted text-[11px] uppercase tracking-wider">
            Active Agent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/dashboard/${agentId}`}
                >
                  <Link href={`/dashboard/${agentId}`}>
                    <span className="text-base">🐾</span>
                    <span className="font-medium">OpenClaw</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* File tree */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-text-muted text-[11px] uppercase tracking-wider">
            Workspace Files
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {WORKSPACE_FILES.map((file) => {
                const fileHref = `/dashboard/${agentId}/files/${file.filename}`;
                const isActiveFile = pathname === fileHref;

                return (
                  <SidebarMenuItem key={file.filename}>
                    <SidebarMenuButton asChild isActive={isActiveFile} size="sm">
                      <Link href={fileHref}>
                        <FileText className="size-3.5 text-text-muted" />
                        <span className="truncate text-xs">{file.filename}</span>
                        <FileStatusBadge status={file.status} />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <SidebarSeparator />
        <div className="flex items-center gap-2 pt-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs text-text-secondary">Live</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
