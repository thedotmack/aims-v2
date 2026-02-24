# AIMS Sync Setup

This guide covers setting up the rsync-based file transport layer between agent machines and the AIMS server.

## Architecture Overview

```
Agent Machine                    AIMS Server
+-------------------+           +-------------------+
| sync-to-aims.sh   | --rsync-->| /data/workspaces/ |
| (fswatch/inotify) |           |   /openclaw/      |
+-------------------+           |   /agent-b/       |
                                +-------------------+
+-------------------+           |                   |
| pull-from-aims.sh | <-rsync-- | sync API (POST)   |
| (cron / manual)   |           | can push back     |
+-------------------+           +-------------------+
```

Two sync directions:
- **Push (agent -> server):** `sync-to-aims.sh` watches local workspace for changes and rsyncs them to the AIMS server in real time.
- **Pull (server -> agent):** `pull-from-aims.sh` pulls the latest workspace state from the AIMS server to the agent's local directory. Run manually or via cron.
- **Reverse push (server -> agent via API):** The AIMS dashboard can trigger a POST to `/api/workspace/{agentId}/sync` which rsyncs workspace files back to a specified agent host.

## Prerequisites

- **rsync** (v3.1+ recommended) installed on both agent machine and AIMS server
- **SSH** access from agent machine to server (for push) and/or server to agent (for reverse push)
- **fswatch** (macOS) or **inotify-tools** (Linux) on the agent machine (for real-time push sync)

### Installing prerequisites

macOS (agent machine):
```bash
brew install rsync fswatch
```

Ubuntu/Debian (agent machine or server):
```bash
sudo apt update && sudo apt install rsync inotify-tools
```

## SSH Key Setup

The agent machine needs passwordless SSH access to the AIMS server (and vice versa for reverse sync).

### 1. Generate a key pair on the agent machine

```bash
ssh-keygen -t ed25519 -C "aims-agent-$(hostname)" -f ~/.ssh/aims_agent_key -N ""
```

### 2. Copy the public key to the AIMS server

```bash
ssh-copy-id -i ~/.ssh/aims_agent_key.pub aims@your-server.example.com
```

### 3. Test the connection

```bash
ssh -i ~/.ssh/aims_agent_key aims@your-server.example.com "echo ok"
```

### 4. (Optional) Configure SSH shorthand

Add to `~/.ssh/config` on the agent machine:

```
Host aims-server
  HostName your-server.example.com
  User aims
  IdentityFile ~/.ssh/aims_agent_key
  IdentitiesOnly yes
```

Then set `AIMS_SERVER=aims-server` in your environment.

### 5. Reverse sync (server -> agent)

If using the AIMS dashboard reverse-push feature, the AIMS server also needs SSH key access to the agent machine. Repeat the key generation on the server and copy to the agent.

## Configuring sync-to-aims.sh (Push)

The push script watches the local workspace for changes and rsyncs them to the AIMS server.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AIMS_SERVER` | `your-server.example.com` | Hostname or IP of the AIMS server |
| `AIMS_USER` | `aims` | SSH user on the AIMS server |
| `AGENT_ID` | `openclaw` | Unique identifier for this agent |
| `LOCAL_WORKSPACE` | `$HOME/.openclaw/workspace` | Path to the agent's local workspace |
| `REMOTE_BASE_PATH` | `/data/workspaces` | Base path on the server for all agent workspaces |

### Running

```bash
# Inline configuration
AIMS_SERVER=aims.example.com \
AGENT_ID=my-agent \
LOCAL_WORKSPACE=/path/to/workspace \
  ./scripts/sync-to-aims.sh

# Or export variables first
export AIMS_SERVER=aims.example.com
export AGENT_ID=my-agent
export LOCAL_WORKSPACE=/path/to/workspace
./scripts/sync-to-aims.sh
```

### What gets synced

Only these file types are synced:
- `*.md` (Markdown)
- `*.yaml` / `*.yml` (YAML config)
- `*.json` (JSON data)
- `*.txt` (Plain text)

Excluded:
- `.git/` directories
- `node_modules/`
- `.DS_Store` files
- All other file types

### Running as a background service (systemd)

Create `/etc/systemd/system/aims-sync.service`:

```ini
[Unit]
Description=AIMS workspace sync (push to server)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=agent
Environment=AIMS_SERVER=aims.example.com
Environment=AGENT_ID=openclaw
Environment=LOCAL_WORKSPACE=/home/agent/.openclaw/workspace
ExecStart=/path/to/aims-v2/scripts/sync-to-aims.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now aims-sync.service
sudo journalctl -u aims-sync -f  # View logs
```

## Configuring pull-from-aims.sh (Pull)

The pull script fetches the latest workspace state from the AIMS server.

### Environment variables

Same as push (see table above).

### Running manually

```bash
AIMS_SERVER=aims.example.com AGENT_ID=my-agent ./scripts/pull-from-aims.sh
```

### Running via cron (periodic pull)

```bash
crontab -e
```

Add a line to pull every 5 minutes:

```cron
*/5 * * * * AIMS_SERVER=aims.example.com AGENT_ID=openclaw LOCAL_WORKSPACE=/home/agent/.openclaw/workspace /path/to/aims-v2/scripts/pull-from-aims.sh >> /var/log/aims-pull.log 2>&1
```

## Server-Side Setup

### 1. Create the aims user

```bash
sudo useradd -m -s /bin/bash aims
sudo mkdir -p /data/workspaces
sudo chown aims:aims /data/workspaces
```

### 2. Create workspace directories per agent

```bash
sudo -u aims mkdir -p /data/workspaces/openclaw
sudo -u aims mkdir -p /data/workspaces/agent-b
```

Or let rsync create them automatically (the `aims` user needs write permission on `/data/workspaces`).

### 3. Set restrictive permissions

```bash
sudo chmod 750 /data/workspaces
sudo chmod 750 /data/workspaces/openclaw
```

### 4. Configure the AIMS Next.js app

Set in `.env` (or `.env.local`):

```
WORKSPACE_BASE_PATH=/data/workspaces
```

## Reverse Sync API

The AIMS server exposes `POST /api/workspace/{agentId}/sync` to push workspace files back to an agent machine.

### Request

```bash
curl -X POST http://aims.example.com:3000/api/workspace/openclaw/sync \
  -H 'Content-Type: application/json' \
  -d '{
    "target_host": "agent-machine.local",
    "target_user": "agent",
    "target_path": "/home/agent/.openclaw/workspace"
  }'
```

### Response (success)

```json
{
  "status": "ok",
  "message": "Sync completed",
  "stdout": "",
  "stderr": ""
}
```

### Response (error)

```json
{
  "status": "error",
  "error": "rsync: connection unexpectedly closed..."
}
```

## Troubleshooting

### Permission denied (SSH)

- Verify the SSH key is authorized on the remote machine: check `~/.ssh/authorized_keys`.
- Ensure the `.ssh` directory has permissions `700` and `authorized_keys` has `600`.
- Test with `ssh -v` for verbose output.

### rsync: connection unexpectedly closed

- Check that `rsync` is installed on both machines.
- Check the SSH connection works independently: `ssh aims@server "echo ok"`.
- Check firewall rules allow SSH (port 22) traffic.

### No changes detected (fswatch/inotifywait)

- Verify the `LOCAL_WORKSPACE` path exists and contains files.
- Check that fswatch is installed: `which fswatch`.
- On Linux, check inotify watch limits: `cat /proc/sys/fs/inotify/max_user_watches`. Increase if needed: `echo 65536 | sudo tee /proc/sys/fs/inotify/max_user_watches`.

### NAT / firewall issues for reverse sync

If the AIMS server cannot directly SSH to the agent machine (common with NAT):
- Use the **pull model** (`pull-from-aims.sh` via cron) instead of reverse push.
- Or set up an SSH reverse tunnel from the agent to the server:
  ```bash
  ssh -R 2222:localhost:22 aims@server -N
  ```
  Then on the server, use `target_host=localhost` and `target_port=2222` (requires SSH config adjustments).

### Files not syncing (wrong types)

Only `*.md`, `*.yaml`, `*.yml`, `*.json`, and `*.txt` files are synced. If you need other file types, update the `--include` patterns in the scripts and the API route.

## Security Notes

- **SSH keys:** Use dedicated keys for AIMS sync, not your personal keys. Consider using `command=` restrictions in `authorized_keys` to limit what the key can do.
- **Agent ID validation:** The API route only accepts alphanumeric characters, hyphens, and underscores in agent IDs to prevent path traversal.
- **Input validation:** The sync API validates `target_host`, `target_user`, and `target_path` to prevent command injection.
- **No `--delete` on pull:** The pull script intentionally omits `--delete` to avoid accidentally removing local files the agent created.
- **Timeout:** The API route enforces a 30-second timeout on rsync operations.
- **Authentication:** The sync API does not yet have authentication (planned for Phase 7). In production, restrict access at the network level or add API key validation.
- **Rate limiting:** Consider adding rate limiting to the sync API to prevent abuse. A reverse proxy (nginx, Caddy) can handle this.
- **Audit logging:** The scripts log all sync operations with timestamps. Consider forwarding these logs to a central logging system.
