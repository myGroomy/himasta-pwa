#!/usr/bin/env bash
# Menjalankan app Next.js sekaligus menyalakan Cloudflare Tunnel ke localhost:3000.
# Tunnel dimatikan otomatis saat app dihentikan (Ctrl+C / exit).
#
# Gunakan lewat npm:  npm run dev / npm run start
# Nonaktifkan tunnel:  TUNNEL_DISABLED=1 npm run dev
# Paksa mode:          TUNNEL_MODE=local|domain|ask npm run dev
set -euo pipefail

CLOUDFLARED="${CLOUDFLARED:-$HOME/.local/bin/cloudflared}"
TUNNEL="${TUNNEL:-himasta}"
TUNNEL_DOMAIN="${TUNNEL_DOMAIN:-}"
TUNNEL_MODE="${TUNNEL_MODE:-ask}"
PIDFILE="/tmp/cloudflared-$TUNNEL.pid"
LOG="/tmp/himasta-tunnel.log"
MODE="local"

log() { echo "[tunnel] $*" >&2; }

check_command() {
  local cmd="${1:-}"
  if [ -z "$cmd" ]; then
    log "tidak ada command yang diberikan."
    return 1
  fi
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log "'$cmd' tidak ditemukan. Jalankan 'npm install' dulu."
    return 1
  fi
  return 0
}

tunnel_available() {
  command -v "$CLOUDFLARED" >/dev/null 2>&1 || return 1
  [ -f "$HOME/.cloudflared/config.yml" ] || return 1
  return 0
}

tunnel_registered() {
  "$CLOUDFLARED" tunnel list 2>/dev/null | grep -qw "$TUNNEL"
}

choose_mode() {
  if [ "${TUNNEL_DISABLED:-0}" = "1" ]; then
    MODE="local"
    return 0
  fi
  case "$TUNNEL_MODE" in
    local)
      MODE="local"
      return 0
      ;;
    domain)
      MODE="domain"
      return 0
      ;;
  esac
  if [ -t 0 ]; then
    local answer
    printf 'Akses lewat mana?\n  1) Local (http://localhost:3000)\n  2) Domain (tunnel)\nPilihan [Enter=Local]: ' >&2
    read -r answer || answer=""
    case "$answer" in
      2 | domain | Domain) MODE="domain" ;;
      *) MODE="local" ;;
    esac
  else
    MODE="local"
    log "non-interaktif (no TTY) - pakai mode LOCAL"
  fi
}

start_tunnel() {
  if ! tunnel_available; then
    log "cloudflared/config.yml tidak ditemukan - lanjut tanpa tunnel"
    return 1
  fi
  if ! tunnel_registered; then
    log "tunnel '$TUNNEL' tidak terdaftar di akun - lanjut tanpa tunnel"
    return 1
  fi
  if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    log "sudah berjalan (pid $(cat "$PIDFILE"))"
    return 0
  fi
  rm -f "$PIDFILE"
  nohup "$CLOUDFLARED" tunnel run "$TUNNEL" >>"$LOG" 2>&1 &
  echo $! > "$PIDFILE"
  sleep 3
  if ! kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    log "cloudflared gagal start - lihat $LOG - lanjut tanpa tunnel"
    rm -f "$PIDFILE"
    return 1
  fi
  if [ -n "$TUNNEL_DOMAIN" ]; then
    log "cloudflared dimulai (pid $(cat "$PIDFILE")) -> $TUNNEL_DOMAIN"
  else
    log "cloudflared dimulai (pid $(cat "$PIDFILE"))"
  fi
}

stop_tunnel() {
  if [ -f "$PIDFILE" ]; then
    local pid
    pid="$(cat "$PIDFILE")"
    rm -f "$PIDFILE"
    if kill -0 "$pid" 2>/dev/null; then
      log "menghentikan cloudflared (pid $pid)"
      kill "$pid" 2>/dev/null || true
    fi
  fi
}

trap stop_tunnel EXIT INT TERM

check_command "${1:-}" || exit 1

choose_mode
if [ "$MODE" = "domain" ] && ! start_tunnel; then
  MODE="local"
fi

if [ "$MODE" = "domain" ]; then
  if [ -n "$TUNNEL_DOMAIN" ]; then
    log "MODE = DOMAIN -> $TUNNEL_DOMAIN"
  else
    log "MODE = DOMAIN (tunnel aktif, isi TUNNEL_DOMAIN untuk URL publik)"
  fi
else
  log "MODE = LOCAL -> http://localhost:3000"
fi

"$@"
