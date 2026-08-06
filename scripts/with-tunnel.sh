#!/usr/bin/env bash
# Menjalankan app Next.js sekaligus menyalakan Cloudflare Tunnel ke localhost:3000.
# Tunnel dimatikan otomatis saat app dihentikan (Ctrl+C / exit).
#
# Gunakan lewat npm:  npm run dev / npm run start
# Nonaktifkan tunnel sementara:  TUNNEL_DISABLED=1 npm run dev
set -euo pipefail

CLOUDFLARED="${CLOUDFLARED:-$HOME/.local/bin/cloudflared}"
TUNNEL="${TUNNEL:-himasta}"
PIDFILE="/tmp/cloudflared-$TUNNEL.pid"
LOG="/tmp/himasta-tunnel.log"

start_tunnel() {
  if [ "${TUNNEL_DISABLED:-0}" = "1" ]; then
    echo "[tunnel] dilewati (TUNNEL_DISABLED=1)" >&2
    return 0
  fi
  if ! command -v "$CLOUDFLARED" >/dev/null 2>&1; then
    echo "[tunnel] cloudflared tidak ditemukan di $CLOUDFLARED - lanjut tanpa tunnel" >&2
    return 0
  fi
  if [ ! -f "$HOME/.cloudflared/config.yml" ]; then
    echo "[tunnel] ~/.cloudflared/config.yml tidak ditemukan - lanjut tanpa tunnel" >&2
    return 0
  fi
  if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "[tunnel] sudah berjalan (pid $(cat "$PIDFILE"))" >&2
    return 0
  fi
  rm -f "$PIDFILE"
  nohup "$CLOUDFLARED" tunnel run "$TUNNEL" >>"$LOG" 2>&1 &
  echo $! > "$PIDFILE"
  echo "[tunnel] cloudflared dimulai (pid $!) -> https://himasta.livowear.my.id" >&2
}

stop_tunnel() {
  if [ -f "$PIDFILE" ]; then
    local pid
    pid="$(cat "$PIDFILE")"
    rm -f "$PIDFILE"
    if kill -0 "$pid" 2>/dev/null; then
      echo "[tunnel] menghentikan cloudflared (pid $pid)" >&2
      kill "$pid" 2>/dev/null || true
    fi
  fi
}

trap stop_tunnel EXIT INT TERM

start_tunnel
"$@"
