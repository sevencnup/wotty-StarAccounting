#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR=""
SERVER_PROCESS_NAME="wotty-server"
WEB_PROCESS_NAME="wotty-web"
SERVER_HEALTHCHECK_URL="http://127.0.0.1:3006/api/health"
WEB_HEALTHCHECK_URL="http://127.0.0.1:3000/"
WAIT_SECONDS=60

log() {
  printf '[deploy] %s\n' "$1"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$1" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage:
  bash server/scripts/deploy-direct-linux.sh --app-dir /www/wwwroot/staraccountting.sevencn.com [options]

Options:
  --app-dir <path>               Repository root on the server. Required.
  --server-process-name <name>   PM2 process name for server. Default: wotty-server.
  --web-process-name <name>      PM2 process name for web. Default: wotty-web.
  --server-health-url <url>      Health check URL for backend. Default: http://127.0.0.1:3006/api/health.
  --web-health-url <url>         Health check URL for frontend. Default: http://127.0.0.1:3000/.
  --wait-seconds <seconds>       Max wait time for health checks. Default: 60.
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
  fi
}

run() {
  log "$*"
  "$@"
}

wait_for_http() {
  local url="$1"
  local label="$2"
  local attempt=1

  while (( attempt <= WAIT_SECONDS )); do
    if curl -fsSL "$url" >/dev/null 2>&1; then
      log "$label is healthy: $url"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  fail "$label did not become healthy within ${WAIT_SECONDS}s: $url"
}

restart_pm2_process() {
  local process_name="$1"
  local working_dir="$2"

  if pm2 describe "$process_name" >/dev/null 2>&1; then
    run pm2 restart "$process_name" --update-env
  else
    run pm2 start npm --name "$process_name" --cwd "$working_dir" -- start
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app-dir)
      APP_DIR="${2:-}"
      shift 2
      ;;
    --server-process-name)
      SERVER_PROCESS_NAME="${2:-}"
      shift 2
      ;;
    --web-process-name)
      WEB_PROCESS_NAME="${2:-}"
      shift 2
      ;;
    --server-health-url)
      SERVER_HEALTHCHECK_URL="${2:-}"
      shift 2
      ;;
    --web-health-url)
      WEB_HEALTHCHECK_URL="${2:-}"
      shift 2
      ;;
    --wait-seconds)
      WAIT_SECONDS="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage
      fail "Unknown argument: $1"
      ;;
  esac
done

[[ -n "$APP_DIR" ]] || { usage; fail "--app-dir is required"; }
[[ "$WAIT_SECONDS" =~ ^[0-9]+$ ]] || fail "--wait-seconds must be a positive integer"

require_command node
require_command npm
require_command npx
require_command pm2
require_command curl

APP_DIR="$(cd "$APP_DIR" && pwd)"

[[ -d "$APP_DIR/server" ]] || fail "Missing backend directory: $APP_DIR/server"
[[ -d "$APP_DIR/web" ]] || fail "Missing frontend directory: $APP_DIR/web"

log "Installing and building backend"
(
  cd "$APP_DIR/server"
  run npm ci
  run npx prisma generate
  run npm run build
)

log "Installing and building frontend"
(
  cd "$APP_DIR/web"
  run npm ci
  run npm run build
)

log "Restarting services with pm2"
restart_pm2_process "$SERVER_PROCESS_NAME" "$APP_DIR/server"
restart_pm2_process "$WEB_PROCESS_NAME" "$APP_DIR/web"
pm2 save >/dev/null 2>&1 || true

wait_for_http "$SERVER_HEALTHCHECK_URL" "backend"
wait_for_http "$WEB_HEALTHCHECK_URL" "frontend"

log "Direct deployment completed successfully"
