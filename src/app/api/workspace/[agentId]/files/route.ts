import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  return NextResponse.json({
    agentId,
    files: [],
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  return NextResponse.json({
    agentId,
    status: "not_implemented",
    message: "File save endpoint placeholder",
  });
}
