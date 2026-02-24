import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">
          AIMS
        </h1>
        <p className="text-lg text-text-secondary">
          Agent Intelligence Management System
        </p>
        <p className="text-sm text-text-muted">
          Live workspace viewer for your OpenClaw AI agents
        </p>
        <Link
          href="/dashboard/openclaw"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  );
}
