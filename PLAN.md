# AIMS v2 — Implementation Plan

**Product**: Live bidirectional workspace viewer/editor for OpenClaw AI agents
**Stack**: Next.js 15 (App Router) + React 19 + Tailwind CSS + shadcn/ui
**Deployment**: Self-hosted (VPS) — required for filesystem access, chokidar, rsync, SSE
**Created**: 2026-02-23

---

## Phase 0: Documentation Discovery (COMPLETE)

### Verified Facts

**OpenClaw File Structure** (`~/.openclaw/workspace/`):

| File | Purpose | When Loaded |
|------|---------|-------------|
| `SOUL.md` | Persona: voice, temperament, values, boundaries, tone | Session start |
| `IDENTITY.md` | Presentation: name, emoji, creature type, vibe, avatar | Session start |
| `USER.md` | User profile: name, address, communication preferences | Session start |
| `MEMORY.md` | Curated long-term memory, distilled from daily logs | Primary sessions only |
| `AGENTS.md` | Operating instructions, behavioral rules, priorities | Session start |
| `TOOLS.md` | Tool usage conventions | Session start |
| `memory/YYYY-MM-DD.md` | Daily memory log (append-only) | Today + yesterday |
| `HEARTBEAT.md` | Periodic check instructions (every 30 min default) | Heartbeat cycle |

- Files loaded at session start (snapshot, NOT hot-reloaded mid-session)
- Agent writes to `memory/YYYY-MM-DD.md` during sessions
- Agent curates important facts from daily logs into `MEMORY.md`
- All state is plain-text markdown — no database, fully Git-versionable
- Workspace path configurable via `~/.openclaw/openclaw.json`

**Architecture Decision: Self-Hosted Required**

Vercel cannot support this architecture:
- No persistent filesystem (rsync needs real files)
- No persistent processes (chokidar needs long-running watcher)
- No SSH daemon (rsync transport needs SSH)
- No singleton event bus (SSE broadcasting needs in-memory state)
- Edge runtime SSE limited to 300 seconds

**Target**: Single VPS (Hetzner/DigitalOcean/Fly.io, $5-10/mo) running Next.js with custom Node.js server.

**Allowed Tech Stack**:

| Role | Library | Why |
|------|---------|-----|
| Markdown editing | `@uiw/react-md-editor` | All-in-one editor + preview, dark mode, Next.js compatible |
| Markdown rendering | `react-markdown` + `remark-gfm` + `remark-frontmatter` | Industry standard, plugin ecosystem, safe HTML |
| Frontmatter parsing | `gray-matter` | Parse/stringify YAML frontmatter |
| Diff viewing | `react-diff-viewer-continued` | GitHub-style split/unified diffs, dark mode |
| File watching | `chokidar` | De facto Node.js file watcher, `awaitWriteFinish` handles rsync chunks |
| UI components | `shadcn/ui` | Copy-paste Radix + Tailwind components, no runtime lock-in |
| Real-time push | Server-Sent Events (native) | Unidirectional server→browser, fits the notification pattern perfectly |
| File transport | `rsync` + `fswatch`/`inotifywait` | Battle-tested delta sync over SSH |

**Anti-Patterns to Avoid**:
- Do NOT use WebSockets — SSE + POST is sufficient and simpler
- Do NOT use Monaco Editor — 2-5 MB bundle, overkill for markdown
- Do NOT use Vercel for deployment — architecture is fundamentally incompatible
- Do NOT build merge logic — optimistic locking with user-decides-on-conflict per PIVOT.md
- Do NOT hot-reload OpenClaw files mid-session — files are read at session start only
- Do NOT use atman-persist — deferred to post-MVP

---

## Phase 1: Project Scaffold

### What to Implement

1. Initialize Next.js 15 project with App Router, TypeScript, Tailwind CSS
2. Install and configure shadcn/ui
3. Set up project directory structure
4. Create initial `.env.example` with required vars
5. Create GitHub repo and push

### Tasks

```bash
# 1. Create Next.js project
cd ~/Scripts/aims-v2
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack

# 2. Install shadcn/ui
npx shadcn@latest init

# 3. Install core dashboard shadcn components
npx shadcn@latest add sidebar tabs card sheet dialog scroll-area badge toast \
  resizable breadcrumb dropdown-menu command tooltip button input separator skeleton

# 4. Install domain-specific dependencies
npm install @uiw/react-md-editor react-markdown remark-gfm remark-frontmatter \
  gray-matter react-diff-viewer-continued chokidar
```

**Directory structure**:

```
src/
  app/
    layout.tsx                        # Root layout with sidebar
    page.tsx                          # Landing/agent selector
    dashboard/
      [agentId]/
        layout.tsx                    # Dashboard layout with file sidebar
        page.tsx                      # Agent overview
        files/
          [filePath]/
            page.tsx                  # File viewer/editor
        memory/
          page.tsx                    # Memory feed
        activity/
          page.tsx                    # Activity feed
    api/
      workspace/
        [agentId]/
          files/
            route.ts                  # GET file content, POST save with optimistic lock
          events/
            route.ts                  # SSE endpoint for file change notifications
          sync/
            route.ts                  # Trigger manual sync
  lib/
    workspace-event-bus.ts            # In-memory EventEmitter for SSE broadcasting
    workspace-watcher.ts              # chokidar file watcher setup
    file-hash.ts                      # SHA-256 content hashing utility
    hooks/
      use-workspace-events.ts         # Client-side EventSource hook
      use-file-editor.ts              # File load/save with optimistic locking
  components/
    dashboard/
      agent-sidebar.tsx               # Left sidebar: agent list + file tree
      file-viewer.tsx                 # Read-only markdown rendering
      file-editor.tsx                 # Markdown editor with preview
      conflict-dialog.tsx             # Diff view when optimistic lock fails
      memory-feed.tsx                 # Live memory observation feed
      sync-status-indicator.tsx       # Connection status badge
```

**`.env.example`**:

```bash
# Path where agent workspaces are stored on this server
WORKSPACE_BASE_PATH=/data/workspaces

# Optional: claude-mem database connection for memory feed
CLAUDE_MEM_DB_URL=

# Auth (Phase 7)
# NEXTAUTH_SECRET=
# NEXTAUTH_URL=http://localhost:3000
```

### Verification

- [ ] `npm run dev` starts without errors
- [ ] `localhost:3000` shows the Next.js default page
- [ ] shadcn/ui components import correctly (test: render a `<Button>`)
- [ ] All dependencies installed (`npm ls @uiw/react-md-editor react-markdown chokidar`)
- [ ] GitHub repo exists and is public

---

## Phase 2: Design System & Dashboard Layout

### What to Implement

Build a dark-mode-first dashboard shell with sidebar navigation. Design language: developer-focused, private, premium. Think Linear/Vercel dashboard — clean, high-contrast, information-dense.

### Design Tokens

Use CSS custom properties in `globals.css`. Dark mode is the default and only mode for MVP.

```
Color Palette:
  --background:        #0a0a0b     (near-black)
  --surface:           #141416     (cards, sidebar)
  --surface-raised:    #1c1c1f     (hover states, elevated elements)
  --border:            #27272a     (subtle borders)
  --border-bright:     #3f3f46     (active borders)
  --text-primary:      #fafafa     (headings, important text)
  --text-secondary:    #a1a1aa     (body text, descriptions)
  --text-muted:        #52525b     (timestamps, hints)
  --accent:            #6366f1     (indigo — primary actions, links, active states)
  --accent-hover:      #818cf8     (lighter indigo for hover)
  --success:           #22c55e     (synced, saved)
  --warning:           #eab308     (conflict, editing)
  --danger:            #ef4444     (errors, destructive actions)
  --info:              #3b82f6     (informational badges)

Typography:
  --font-sans:   'Inter', system-ui, sans-serif
  --font-mono:   'JetBrains Mono', 'Fira Code', monospace
```

### Tasks

1. **Root layout** (`src/app/layout.tsx`):
   - Dark background, Inter font via `next/font`
   - shadcn `SidebarProvider` wrapper
   - `<Toaster>` from sonner for notifications

2. **App sidebar** (`src/components/dashboard/agent-sidebar.tsx`):
   - Top: AIMS logo + "Your Agents" heading
   - Agent list (for MVP: single agent, hardcoded from env)
   - When agent selected: file tree showing workspace files
   - File tree items: icon + filename + status badge (synced/modified/conflict)
   - Bottom: connection status indicator (green dot = SSE connected)

3. **Dashboard layout** (`src/app/dashboard/[agentId]/layout.tsx`):
   - Horizontal tab bar: Overview | Files | Memory | Activity
   - Content area below tabs
   - Breadcrumb: AIMS > Agent Name > Current Section

4. **Agent overview page** (`src/app/dashboard/[agentId]/page.tsx`):
   - Agent identity card (from IDENTITY.md): name, emoji, vibe
   - Soul summary card (first 3 paragraphs of SOUL.md)
   - Recent memory entries (last 5 from today's memory file)
   - Quick stats: total files, last sync time, memory entries today
   - File grid: clickable cards for each workspace file with last-modified time

### Documentation References

- shadcn/ui Sidebar: `npx shadcn@latest add sidebar` — use `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`
- shadcn/ui Tabs: Radix-based, keyboard navigable
- next/font: `import { Inter, JetBrains_Mono } from 'next/font/google'`

### Verification

- [ ] Dashboard renders with dark background and sidebar
- [ ] Sidebar shows agent list with file tree
- [ ] Tabs navigate between Overview/Files/Memory/Activity
- [ ] Overview page shows identity card and soul summary
- [ ] All text is legible (proper contrast ratios on dark background)
- [ ] Responsive: sidebar collapses on mobile (shadcn handles this)

---

## Phase 3: File Viewer & Editor

### What to Implement

The core feature: view and edit OpenClaw workspace markdown files with live preview.

### Tasks

1. **File listing API** (`src/app/api/workspace/[agentId]/files/route.ts`):
   - `GET` with no `?path=` param → return list of all files in workspace with metadata (name, size, last modified, content hash)
   - `GET ?path=SOUL.md` → return file content + content hash
   - `POST` → save file with optimistic locking (send `content` + `expected_hash`, return 409 on conflict)
   - **Security**: sanitize file paths to prevent directory traversal (strip `..`, validate within workspace root)

   ```typescript
   // Content hash utility
   import { createHash } from 'crypto';
   function computeContentHash(content: string | Buffer): string {
     return createHash('sha256').update(content).digest('hex');
   }
   ```

2. **File viewer** (`src/components/dashboard/file-viewer.tsx`):
   - Read-only markdown rendering using `react-markdown` + `remark-gfm`
   - Frontmatter displayed as a metadata header (parsed with `gray-matter`, rendered as key-value badges)
   - Monospace font for code blocks
   - "Edit" button to switch to editor mode

3. **File editor** (`src/components/dashboard/file-editor.tsx`):
   - `@uiw/react-md-editor` in split-pane mode (edit left, preview right)
   - Must be loaded with `next/dynamic` + `ssr: false` (uses browser APIs)
   - Dark mode: set `data-color-mode="dark"` on parent element
   - Save button (keyboard shortcut: Cmd+S / Ctrl+S)
   - "Discard changes" button
   - Shows file path + last modified time in header
   - Unsaved changes indicator (yellow dot in tab/breadcrumb)

   ```typescript
   // Dynamic import pattern for the editor
   import dynamic from 'next/dynamic';
   const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
   ```

4. **Conflict dialog** (`src/components/dashboard/conflict-dialog.tsx`):
   - Triggered when save returns HTTP 409
   - Shows side-by-side diff using `react-diff-viewer-continued`
   - Left: "Your changes" / Right: "Agent's changes"
   - Three actions: "Keep mine" (force-overwrite), "Keep theirs" (discard my edit), "Cancel" (return to editor)
   - Uses shadcn `Dialog` component

5. **`useFileEditor` hook** (`src/lib/hooks/use-file-editor.ts`):
   - `loadFile(path)` → fetches content + hash, stores hash as `hashWhenEditingStarted`
   - `saveFile(path, content)` → POST with content + expected_hash
   - On 409: sets `conflict` state with both versions
   - `resolveConflictKeepMine(path)` → re-POST with current server hash as expected
   - `resolveConflictKeepTheirs()` → reload file content, clear conflict

6. **Files page** (`src/app/dashboard/[agentId]/files/[filePath]/page.tsx`):
   - URL: `/dashboard/agent-123/files/SOUL.md`
   - Tabs within page: View | Edit | History (history deferred)
   - Renders file-viewer or file-editor based on active tab

### Verification

- [ ] API returns file list with correct metadata
- [ ] API returns file content and SHA-256 hash
- [ ] API rejects save when hash doesn't match (409 with both versions)
- [ ] API accepts save when hash matches
- [ ] Markdown renders correctly (headings, lists, code blocks, tables)
- [ ] Editor loads without SSR errors
- [ ] Editor dark mode matches dashboard theme
- [ ] Conflict dialog shows diff with correct sides
- [ ] Cmd+S triggers save
- [ ] Path traversal blocked (`../../../etc/passwd` returns 400)

---

## Phase 4: Real-Time Sync Engine

### What to Implement

Server-side file watching + SSE broadcasting so the dashboard updates live when the agent writes files.

### Tasks

1. **Workspace event bus** (`src/lib/workspace-event-bus.ts`):
   - Singleton `EventEmitter` (persists across route handler invocations in Node.js)
   - Methods: `on(agentId, handler)`, `off(agentId, handler)`, `emit(agentId, event)`
   - Event shape: `{ file_path, event_type: 'change'|'add'|'unlink', content_hash, timestamp }`
   - `setMaxListeners(1000)` to support many concurrent SSE connections

2. **Workspace watcher** (`src/lib/workspace-watcher.ts`):
   - Uses `chokidar.watch()` with:
     - `awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }` — critical for rsync which writes in chunks
     - `atomic: true` — handles write-to-tmp-then-rename pattern
     - `ignoreInitial: true` — don't fire events for existing files on startup
     - `depth: 3` — don't recurse too deep
     - Ignore: `.git`, `node_modules`, non-markdown extensions
   - On change/add: read file, compute hash, emit to event bus
   - On unlink: emit with empty hash
   - `startWatchingWorkspace(agentId, path)` / `stopWatchingWorkspace(agentId)`
   - Maintain `Map<string, FSWatcher>` of active watchers

3. **SSE endpoint** (`src/app/api/workspace/[agentId]/events/route.ts`):
   - `export const dynamic = 'force-dynamic'`
   - `export const runtime = 'nodejs'`
   - Return `new Response(readableStream, { headers: { 'Content-Type': 'text/event-stream', ... } })`
   - Subscribe to event bus for this agentId
   - Send heartbeat comment (`: heartbeat\n\n`) every 30 seconds
   - Clean up listener on `request.signal.addEventListener('abort', ...)`

4. **`useWorkspaceEvents` hook** (`src/lib/hooks/use-workspace-events.ts`):
   - Creates `EventSource` connection to `/api/workspace/{agentId}/events`
   - Exposes `connectionStatus: 'connecting' | 'connected' | 'disconnected'`
   - Auto-reconnect with 3-second delay on error
   - Calls `onFileChange(payload)` callback for each event
   - On reconnect: trigger a full file list refresh to catch missed events

5. **Sync status indicator** (`src/components/dashboard/sync-status-indicator.tsx`):
   - Green pulsing dot + "Live" when connected
   - Yellow dot + "Reconnecting..." when disconnected
   - Uses the `connectionStatus` from `useWorkspaceEvents`

6. **Wire it up**: When a file_changed event arrives in the browser:
   - If user is viewing that file in read-only mode → auto-refresh content
   - If user is editing that file → show toast: "Agent updated this file" with button to view diff
   - Update file tree sidebar badges (show "modified" indicator)

7. **Server startup**: Initialize chokidar watchers when the server starts
   - For MVP: read agent config from env vars or a simple JSON file
   - Call `startWatchingWorkspace()` for each configured agent

### Documentation References

- chokidar `awaitWriteFinish`: prevents multiple events from rsync chunk writes
- chokidar `atomic`: handles editor/rsync write-to-temp-then-rename pattern
- SSE format: `data: {json}\n\n` for messages, `: comment\n\n` for heartbeats
- `ReadableStream` in Next.js route handlers: `export const dynamic = 'force-dynamic'` required

### Anti-Pattern Guards

- Do NOT use polling instead of SSE — SSE is more efficient and lower latency
- Do NOT skip `awaitWriteFinish` — rsync writes trigger multiple partial-file events without it
- Do NOT use `chokidar.watch()` without `ignoreInitial: true` — floods events on startup
- Do NOT forget heartbeats — proxy servers (nginx) close idle SSE connections after ~60s

### Verification

- [ ] chokidar detects file changes in workspace directory
- [ ] Event bus broadcasts to correct agentId subscribers
- [ ] SSE endpoint streams events to browser (test with `curl -N`)
- [ ] Browser receives file_changed events within ~1 second of file write
- [ ] SSE reconnects after disconnect
- [ ] Heartbeat keeps connection alive through proxies
- [ ] File viewer auto-refreshes on change event
- [ ] Editor shows "file changed" toast when agent modifies the open file
- [ ] No duplicate events for single rsync write (awaitWriteFinish works)

---

## Phase 5: rsync Agent Sync

### What to Implement

The transport layer: getting files from the agent's machine to the server and back.

### Tasks

1. **Agent-side sync script** (`scripts/sync-to-aims.sh`):
   - Bash script the user runs on their agent's machine
   - Uses `fswatch` (macOS) or `inotifywait` (Linux) to detect local changes
   - Triggers `rsync --checksum` over SSH to push changes to server
   - Options: `--archive --checksum --compress --delete --partial`
   - Include only: `*.md`, `*.yaml`, `*.yml`, `*.json`, `*.txt` + directories
   - `--latency 2` debounce on fswatch (coalesce rapid writes)
   - Initial full sync on start

2. **Server workspace directory setup**:
   - Workspace base path: `$WORKSPACE_BASE_PATH/{agent_id}/`
   - Each agent gets an isolated directory
   - Server must have SSH authorized key for the agent's machine (for reverse sync)
   - Alternatively: agent pulls changes on a cron (simpler, no inbound SSH needed)

3. **Reverse sync API** (`src/app/api/workspace/[agentId]/sync/route.ts`):
   - `POST /api/workspace/{agentId}/sync` — triggers rsync push back to agent machine
   - Used after human saves a file edit
   - Calls `rsync --checksum` from server to agent's machine via SSH
   - If SSH to agent fails (NAT, offline): queue the change, agent pulls on next cron

4. **Agent pull script** (`scripts/pull-from-aims.sh`):
   - Alternative to reverse SSH: agent polls the server
   - Runs on cron (every 30 seconds or on heartbeat)
   - `rsync --checksum` from server to local workspace
   - Simpler setup: no inbound SSH needed on agent's machine

5. **Setup documentation** (`docs/SYNC-SETUP.md`):
   - How to configure SSH keys
   - How to install and run the sync scripts
   - Troubleshooting common issues (permissions, firewall, NAT)

### Anti-Pattern Guards

- Do NOT sync the entire home directory — include only target file extensions
- Do NOT use rsync without `--checksum` — mod-time comparison fails across machines
- Do NOT skip `--partial` — interrupted transfers should resume, not restart
- Do NOT use `--delete` without the include/exclude filters — could delete non-workspace files

### Verification

- [ ] Sync script detects local file changes and pushes to server
- [ ] Server receives files in correct workspace directory
- [ ] chokidar picks up rsync-delivered files and broadcasts SSE events
- [ ] Reverse sync pushes edited files back to agent's machine
- [ ] Agent pull script works as alternative to reverse SSH
- [ ] Only markdown/yaml/json/txt files are synced (no binaries, no .git)
- [ ] Large file sync doesn't trigger duplicate chokidar events (awaitWriteFinish)

---

## Phase 6: Memory Feed (claude-mem Integration)

### What to Implement

Live feed showing agent memory observations — the "why" behind file changes.

### Tasks

1. **Memory feed API** (`src/app/api/workspace/[agentId]/memory/route.ts`):
   - Connects to claude-mem SQLite database (read-only)
   - `GET ?limit=50&offset=0&type=decision|discovery|bugfix` — fetch recent observations
   - Filter by project name matching the agent
   - Return: `{ id, title, text, created_at, type }`

2. **Memory feed component** (`src/components/dashboard/memory-feed.tsx`):
   - Reverse-chronological list of observations
   - Each entry: timestamp + title + truncated text + type badge
   - Click to expand full observation text
   - Type badges with colors: decision (purple), discovery (blue), bugfix (green), general (gray)
   - Auto-updates via polling (every 30 seconds) or SSE extension
   - shadcn `ScrollArea` for the feed container

3. **Memory page** (`src/app/dashboard/[agentId]/memory/page.tsx`):
   - Full-page memory feed with filters
   - Filter bar: type dropdown, date range picker, search text
   - Pagination or infinite scroll

4. **Memory card on overview** (`src/app/dashboard/[agentId]/page.tsx`):
   - Compact version: last 5 observations
   - "View all" link to memory page

### Verification

- [ ] Memory API returns observations from claude-mem database
- [ ] Feed renders with correct timestamps and type badges
- [ ] Filters work (type, date range)
- [ ] Click expands observation text
- [ ] Auto-refresh picks up new observations

---

## Phase 7: Authentication & Multi-Agent

### What to Implement

Basic auth so multiple users can have private dashboards.

### Tasks

1. **Auth setup**: NextAuth.js v5 (Auth.js) with App Router
   - Email + password provider for MVP
   - Session stored in JWT
   - Protect all `/dashboard/*` routes

2. **Agent registration**:
   - Simple form: agent name + workspace path on server
   - Store in SQLite or JSON file (no heavy DB for MVP)
   - Link agent to authenticated user

3. **Multi-agent support**:
   - Sidebar shows all agents belonging to the logged-in user
   - Each agent has its own workspace directory and watcher

### Verification

- [ ] Login page works
- [ ] Unauthenticated users cannot access dashboard
- [ ] Users can register new agents
- [ ] Users only see their own agents

---

## Phase 8: Verification & Polish

### Final Verification Checklist

1. **End-to-end flow**:
   - [ ] Agent writes to MEMORY.md → rsync pushes to server → chokidar detects → SSE notifies browser → dashboard updates
   - [ ] Human edits SOUL.md in dashboard → save succeeds → rsync pushes back to agent
   - [ ] Agent edits SOUL.md while human is editing → save returns 409 → diff dialog shows → human resolves conflict

2. **Anti-pattern grep checks**:
   ```bash
   # No WebSocket imports (we use SSE)
   grep -r "socket.io\|ws\|WebSocket" src/ --include="*.ts" --include="*.tsx"

   # No Monaco imports (we use @uiw/react-md-editor)
   grep -r "monaco" src/ --include="*.ts" --include="*.tsx"

   # No Vercel-specific deployment config
   grep -r "vercel" src/ --include="*.ts" --include="*.tsx"

   # All API routes sanitize file paths
   grep -r "\.\./" src/app/api/ --include="*.ts"
   ```

3. **Performance checks**:
   - [ ] Bundle size: `npm run build` shows reasonable chunk sizes
   - [ ] SSE connection stable for 10+ minutes
   - [ ] File save round-trip < 500ms
   - [ ] No memory leaks in chokidar watchers

4. **Security checks**:
   - [ ] Path traversal blocked on all file API endpoints
   - [ ] Auth required on all dashboard routes
   - [ ] No secrets in client-side code
   - [ ] rsync uses SSH key auth (no passwords)

---

## Appendix: Key Code Patterns

### SSE Route Handler (copy this pattern)

```typescript
// src/app/api/workspace/[agentId]/events/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const handler = (event: FileChangeEvent) => {
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
```

### Optimistic Lock Save (copy this pattern)

```typescript
// On save attempt:
const response = await fetch(`/api/workspace/${agentId}/files`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file_path: 'SOUL.md',
    content: editorContent,
    expected_hash: hashWhenEditingStarted, // SHA-256 from when file was loaded
  }),
});

if (response.status === 409) {
  // Agent changed the file while we were editing
  const { your_content, current_content, current_hash } = await response.json();
  // Show diff dialog with both versions
}
```

### chokidar Config (copy this pattern)

```typescript
chokidar.watch(workspacePath, {
  ignored: (path) => path.includes('.git') || path.includes('node_modules'),
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  atomic: true,
  depth: 3,
});
```

---

## Phase Execution Order

| Phase | Dependencies | Can Parallelize With |
|-------|-------------|---------------------|
| 1. Scaffold | None | — |
| 2. Design & Layout | Phase 1 | — |
| 3. File Viewer/Editor | Phase 2 | Phase 4 (backend) |
| 4. Real-Time Sync | Phase 1 | Phase 3 (frontend) |
| 5. rsync Agent Sync | Phase 4 | — |
| 6. Memory Feed | Phase 2 | Phase 5 |
| 7. Auth & Multi-Agent | Phase 2 | Phase 5, 6 |
| 8. Verification | All phases | — |
