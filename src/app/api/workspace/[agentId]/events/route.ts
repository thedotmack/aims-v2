import { workspaceEventBus, type WorkspaceFileChangeEvent } from '@/lib/workspace-event-bus';
import { initializeWorkspaceWatchers } from '@/lib/workspace-init';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ agentId: string }> }) {
  initializeWorkspaceWatchers();

  const { agentId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const handler = (event: WorkspaceFileChangeEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          workspaceEventBus.off(agentId, handler);
        }
      };
      workspaceEventBus.on(agentId, handler);

      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(`: heartbeat\n\n`)); }
        catch { clearInterval(heartbeat); }
      }, 30_000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        workspaceEventBus.off(agentId, handler);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
