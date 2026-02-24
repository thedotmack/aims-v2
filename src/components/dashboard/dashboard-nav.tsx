"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

const TABS = [
  { label: "Overview", segment: "" },
  { label: "Files", segment: "files" },
  { label: "Memory", segment: "memory" },
  { label: "Activity", segment: "activity" },
] as const;

function resolveTabHref(agentId: string, segment: string): string {
  if (segment === "") return `/dashboard/${agentId}`;
  if (segment === "files") return `/dashboard/${agentId}/files/SOUL.md`;
  return `/dashboard/${agentId}/${segment}`;
}

function getCurrentSection(pathname: string): string {
  if (pathname.includes("/files")) return "Files";
  if (pathname.includes("/memory")) return "Memory";
  if (pathname.includes("/activity")) return "Activity";
  return "Overview";
}

function isTabActive(pathname: string, agentId: string, segment: string): boolean {
  const basePath = `/dashboard/${agentId}`;
  if (segment === "") {
    return pathname === basePath;
  }
  return pathname.startsWith(`${basePath}/${segment}`);
}

export function DashboardNav({ agentId }: { agentId: string }) {
  const pathname = usePathname();
  const currentSection = getCurrentSection(pathname);

  return (
    <div className="border-b border-border">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 px-4">
        <SidebarTrigger className="mr-2 text-text-secondary hover:text-text-primary" />
        <nav className="flex gap-1">
          {TABS.map((tab) => {
            const isActive = isTabActive(pathname, agentId, tab.segment);
            return (
              <Link
                key={tab.segment}
                href={resolveTabHref(agentId, tab.segment)}
                className={`relative px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-2 border-t border-border">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-text-muted hover:text-text-secondary">
                  AIMS
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/${agentId}`}
                  className="text-text-muted hover:text-text-secondary"
                >
                  OpenClaw
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-text-secondary">
                {currentSection}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
