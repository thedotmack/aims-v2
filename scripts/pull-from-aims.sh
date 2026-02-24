#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# AIMS -- Pull workspace changes FROM the AIMS server
# Run this on the agent's machine (via cron or manually)
# ============================================================

AIMS_SERVER="${AIMS_SERVER:-your-server.example.com}"
AIMS_USER="${AIMS_USER:-aims}"
AGENT_ID="${AGENT_ID:-openclaw}"
LOCAL_WORKSPACE="${LOCAL_WORKSPACE:-$HOME/.openclaw/workspace}"
REMOTE_BASE_PATH="${REMOTE_BASE_PATH:-/data/workspaces}"

REMOTE_SRC="${AIMS_USER}@${AIMS_SERVER}:${REMOTE_BASE_PATH}/${AGENT_ID}/"

RSYNC_OPTS=(
  --archive
  --checksum
  --compress
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

log "Pulling changes from AIMS server..."
log "Remote: ${REMOTE_SRC}"
log "Local: ${LOCAL_WORKSPACE}"

rsync "${RSYNC_OPTS[@]}" "${REMOTE_SRC}" "${LOCAL_WORKSPACE}/" 2>&1 | while read -r line; do
  log "  rsync: ${line}"
done

log "Pull complete."
