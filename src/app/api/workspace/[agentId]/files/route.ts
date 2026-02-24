import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import path from 'path';
import { computeContentHash } from '@/lib/file-hash';

const WORKSPACE_BASE_PATH =
  process.env.WORKSPACE_BASE_PATH || '/data/workspaces';

/** Allowed file extensions for listing. */
const ALLOWED_EXTENSIONS = new Set(['.md', '.yaml', '.yml', '.json', '.txt']);

/**
 * Security: resolve the requested path and verify it stays within the
 * workspace root to prevent directory-traversal attacks.
 */
function sanitizePath(
  filePath: string,
  workspaceRoot: string,
): string | null {
  const resolved = path.resolve(workspaceRoot, filePath);
  if (!resolved.startsWith(workspaceRoot + path.sep) && resolved !== workspaceRoot) {
    return null;
  }
  return resolved;
}

/**
 * Recursively list workspace files, skipping dot-dirs, node_modules,
 * and files whose extension is not in ALLOWED_EXTENSIONS.
 */
async function getFileList(
  directoryPath: string,
  basePath: string = directoryPath,
): Promise<
  Array<{
    name: string;
    path: string;
    size: number;
    last_modified: string;
    content_hash: string;
  }>
> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files: Array<{
    name: string;
    path: string;
    size: number;
    last_modified: string;
    content_hash: string;
  }> = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    // Skip hidden files/dirs and node_modules
    if (entry.name.startsWith('.')) continue;
    if (entry.name === 'node_modules') continue;

    if (entry.isDirectory()) {
      const subFiles = await getFileList(fullPath, basePath);
      files.push(...subFiles);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;

      const fileStat = await stat(fullPath);
      const content = await readFile(fullPath, 'utf-8');
      files.push({
        name: entry.name,
        path: relativePath,
        size: fileStat.size,
        last_modified: fileStat.mtime.toISOString(),
        content_hash: computeContentHash(content),
      });
    }
  }

  return files;
}

/**
 * GET /api/workspace/[agentId]/files
 *
 * Without ?path= query param: returns a recursive file listing.
 * With ?path=<relative>: returns that file's content + hash + metadata.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const workspaceRoot = path.join(WORKSPACE_BASE_PATH, agentId);
  const filePath = request.nextUrl.searchParams.get('path');

  if (!filePath) {
    // Return file listing
    try {
      const files = await getFileList(workspaceRoot);
      return NextResponse.json({ files });
    } catch {
      return NextResponse.json({ files: [] });
    }
  }

  // Return specific file
  const safePath = sanitizePath(filePath, workspaceRoot);
  if (!safePath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const content = await readFile(safePath, 'utf-8');
    const contentHash = computeContentHash(content);
    const fileStat = await stat(safePath);

    return NextResponse.json({
      content,
      content_hash: contentHash,
      last_modified: fileStat.mtime.toISOString(),
      file_path: filePath,
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

/**
 * POST /api/workspace/[agentId]/files
 *
 * Save a file with optimistic locking.  The client must provide
 * `expected_hash` (the content_hash it received when it loaded the file).
 * If the file changed on disk since then, a 409 Conflict is returned
 * with both versions so the UI can show a diff dialog.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const workspaceRoot = path.join(WORKSPACE_BASE_PATH, agentId);
  const body = await request.json();
  const { file_path, content, expected_hash } = body;

  if (!file_path || content === undefined || !expected_hash) {
    return NextResponse.json(
      { error: 'Missing required fields: file_path, content, expected_hash' },
      { status: 400 },
    );
  }

  const safePath = sanitizePath(file_path, workspaceRoot);
  if (!safePath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const currentContent = await readFile(safePath, 'utf-8');
    const currentHash = computeContentHash(currentContent);

    if (currentHash !== expected_hash) {
      // Conflict: the file changed since the client loaded it
      return NextResponse.json(
        {
          error: 'Conflict',
          your_content: content,
          current_content: currentContent,
          current_hash: currentHash,
        },
        { status: 409 },
      );
    }

    // Hash matches — safe to write
    await writeFile(safePath, content, 'utf-8');
    const newHash = computeContentHash(content);

    return NextResponse.json({
      content_hash: newHash,
      file_path,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 },
    );
  }
}
