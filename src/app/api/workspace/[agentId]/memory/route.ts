import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const CLAUDE_MEM_DB_URL = process.env.CLAUDE_MEM_DB_URL;

interface Observation {
  id: number;
  title: string | null;
  text: string;
  created_at: string;
  obs_type: string | null;
  project: string | null;
}

function openReadOnlyDatabase(): Database.Database | null {
  if (!CLAUDE_MEM_DB_URL) return null;
  try {
    return new Database(CLAUDE_MEM_DB_URL, { readonly: true });
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const observationType = searchParams.get('type');
  const searchQuery = searchParams.get('search');

  const db = openReadOnlyDatabase();
  if (!db) {
    return NextResponse.json({
      observations: [],
      total: 0,
      message: 'Database not configured',
    });
  }

  try {
    let whereClause = 'WHERE 1=1';
    const queryParams: Record<string, string | number> = {};

    // Filter by project matching agentId
    whereClause += ' AND (project = @project OR project IS NULL)';
    queryParams.project = agentId;

    if (observationType) {
      whereClause += ' AND obs_type = @observationType';
      queryParams.observationType = observationType;
    }

    if (searchQuery) {
      whereClause += ' AND (title LIKE @searchPattern OR text LIKE @searchPattern)';
      queryParams.searchPattern = `%${searchQuery}%`;
    }

    const countStatement = db.prepare(
      `SELECT COUNT(*) as total FROM observations ${whereClause}`
    );
    const { total } = countStatement.get(queryParams) as { total: number };

    const selectStatement = db.prepare(
      `SELECT id, title, text, created_at, obs_type, project
       FROM observations ${whereClause}
       ORDER BY created_at DESC
       LIMIT @limit OFFSET @offset`
    );
    const observations = selectStatement.all({
      ...queryParams,
      limit,
      offset,
    }) as Observation[];

    db.close();
    return NextResponse.json({ observations, total });
  } catch (error) {
    db.close();
    const message =
      error instanceof Error ? error.message : 'Database error';
    return NextResponse.json(
      { observations: [], total: 0, error: message },
      { status: 500 }
    );
  }
}
