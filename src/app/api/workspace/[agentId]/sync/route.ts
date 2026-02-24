import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  return NextResponse.json({
    agentId,
    status: "ok",
    message: "Sync endpoint placeholder",
  });
}
