#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# AIMS -- Sync workspace files TO the AIMS server
# Run this on the machine where the agent operates
# ============================================================

# Configuration
AIMS_SERVER="${AIMS_SERVER:-your-server.example.com}"
AIMS_USER="${AIMS_USER:-aims}"
AGENT_ID="${AGENT_ID:-openclaw}"
LOCAL_WORKSPACE="${LOCAL_WORKSPACE:-$HOME/.openclaw/workspace}"
REMOTE_BASE_PATH="${REMOTE_BASE_PATH:-/data/workspaces}"

REMOTE_DEST="${AIMS_USER}@${AIMS_SERVER}:${REMOTE_BASE_PATH}/${AGENT_ID}/"

# rsync filter: only sync text files the agent uses
RSYNC_OPTS=(
  --archive
  --checksum
  --compress
  --delete
  --partial
  --include='*/'
  --include='*.md'
  --include='*.yaml'
  --include='*.yml'
  --include='*.json'
  --include='*.txt'
  --exclude='*'
  --exclude='.git'
  --exclude='node_modules'
  --exclude='.DS_Store'
)

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

do_sync() {
  log "Syncing ${LOCAL_WORKSPACE} -> ${REMOTE_DEST}"
  rsync "${RSYNC_OPTS[@]}" "${LOCAL_WORKSPACE}/" "${REMOTE_DEST}" 2>&1 | while read -r line; do
    log "  rsync: ${line}"
  done
  log "Sync complete."
}

# Initial full sync
log "Starting AIMS sync for agent '${AGENT_ID}'"
log "Local: ${LOCAL_WORKSPACE}"
log "Remote: ${REMOTE_DEST}"
do_sync

# Watch for changes and sync on change
if command -v fswatch &>/dev/null; then
  log "Using fswatch to watch for changes..."
  fswatch --latency 2 --recursive --exclude '\.git' --exclude 'node_modules' "${LOCAL_WORKSPACE}" | while read -r changed_file; do
    log "Change detected: ${changed_file}"
    do_sync
  done
elif command -v inotifywait &>/dev/null; then
  log "Using inotifywait to watch for changes..."
  while true; do
    inotifywait --recursive --event modify,create,delete,move \
      --exclude '(\.git|node_modules)' "${LOCAL_WORKSPACE}" 2>/dev/null
    sleep 2  # Debounce
    do_sync
  done
else
  log "ERROR: Neither fswatch nor inotifywait found."
  log "Install fswatch (macOS: brew install fswatch) or inotifywait (Linux: apt install inotify-tools)"
  exit 1
fi
