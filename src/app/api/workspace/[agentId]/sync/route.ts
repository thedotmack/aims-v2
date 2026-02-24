import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const WORKSPACE_BASE_PATH =
  process.env.WORKSPACE_BASE_PATH || "/data/workspaces";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const body = await request.json().catch(() => ({}));
  const { target_host, target_user, target_path } = body;

  if (!target_host || !target_user || !target_path) {
    return NextResponse.json(
      { error: "Missing target_host, target_user, or target_path" },
      { status: 400 }
    );
  }

  // Validate agentId to prevent path traversal and command injection
  if (!/^[a-zA-Z0-9_-]+$/.test(agentId)) {
    return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
  }

  // Validate target_host (hostname or IP only, no special characters)
  if (!/^[a-zA-Z0-9._-]+$/.test(target_host)) {
    return NextResponse.json(
      { error: "Invalid target_host" },
      { status: 400 }
    );
  }

  // Validate target_user (unix username characters only)
  if (!/^[a-zA-Z0-9_-]+$/.test(target_user)) {
    return NextResponse.json(
      { error: "Invalid target_user" },
      { status: 400 }
    );
  }

  // Validate target_path (must be absolute, no shell metacharacters)
  if (!/^\/[a-zA-Z0-9_./-]+$/.test(target_path)) {
    return NextResponse.json(
      { error: "Invalid target_path: must be an absolute path with safe characters" },
      { status: 400 }
    );
  }

  const localPath = path.join(WORKSPACE_BASE_PATH, agentId);
  const remoteDest = `${target_user}@${target_host}:${target_path}/`;

  // Build rsync command with safe arguments
  const rsyncArgs = [
    "--archive",
    "--checksum",
    "--compress",
    "--partial",
    "--include='*/'",
    "--include='*.md'",
    "--include='*.yaml'",
    "--include='*.yml'",
    "--include='*.json'",
    "--include='*.txt'",
    "--exclude='*'",
  ].join(" ");

  try {
    const { stdout, stderr } = await execAsync(
      `rsync ${rsyncArgs} "${localPath}/" "${remoteDest}"`,
      { timeout: 30000 }
    );

    return NextResponse.json({
      status: "ok",
      message: "Sync completed",
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", error: message },
      { status: 500 }
    );
  }
}
