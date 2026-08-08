#!/usr/bin/env node
// Menjalankan app Next.js sekaligus menyalakan Cloudflare Tunnel ke localhost:3000.
// Tunnel dimatikan otomatis saat app dihentikan (Ctrl+C / exit).
//
// Gunakan lewat npm:  npm run dev / npm run start
// Nonaktifkan tunnel:  TUNNEL_DISABLED=1 npm run dev
// Paksa mode:          TUNNEL_MODE=local|domain|ask npm run dev
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, openSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'

const HERE = dirname(fileURLToPath(import.meta.url))
const isWindows = process.platform === 'win32'
const HOME = homedir()

const CLOUDFLARED = process.env.CLOUDFLARED || join(HOME, '.local', 'bin', isWindows ? 'cloudflared.exe' : 'cloudflared')
const TUNNEL = process.env.TUNNEL || 'himasta'
const TUNNEL_DOMAIN = process.env.TUNNEL_DOMAIN || ''
const TUNNEL_MODE = process.env.TUNNEL_MODE || 'ask'
const TUNNEL_DISABLED = process.env.TUNNEL_DISABLED === '1'
const TUNNEL_CONFIG = join(HOME, '.cloudflared', 'config.yml')
const LOG = join(tmpdir(), 'himasta-tunnel.log')

const log = (...args) => console.error('[tunnel]', ...args)

let tunnelProcess = null

const cleanup = () => {
  if (tunnelProcess && !tunnelProcess.killed) {
    try { tunnelProcess.kill('SIGTERM') } catch { /* ignore */ }
  }
}

process.on('exit', cleanup)
process.on('SIGINT', () => { cleanup(); process.exit(130) })
process.on('SIGTERM', () => { cleanup(); process.exit(143) })

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms))

function askQuestion(query) {
  return new Promise((resolveAnswer) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr })
    rl.question(query, (answer) => { rl.close(); resolveAnswer(answer.trim()) })
  })
}

function resolveCloudflared() {
  if (existsSync(CLOUDFLARED)) return CLOUDFLARED
  const probe = spawnSync('cloudflared', ['--version'], { stdio: 'ignore' })
  if (!probe.error) return 'cloudflared'
  return null
}

function tunnelRegistered(bin) {
  const out = spawnSync(bin, ['tunnel', 'list'], { encoding: 'utf8' })
  if (out.error || out.status !== 0) return false
  const text = `${out.stdout}\n${out.stderr}`
  return new RegExp(`\\b${TUNNEL}\\b`).test(text)
}

function startTunnel(bin) {
  const logFd = openSync(LOG, 'a')
  tunnelProcess = spawn(bin, ['tunnel', 'run', TUNNEL], {
    stdio: ['ignore', logFd, logFd],
    detached: process.platform !== 'win32',
  })
  tunnelProcess.on('error', () => { /* ditangani lewat cek exitCode */ })
  return new Promise(async (resolveStart) => {
    await sleep(3000)
    if (tunnelProcess.exitCode !== null) {
      log(`cloudflared gagal start - lihat ${LOG} - lanjut tanpa tunnel`)
      tunnelProcess = null
      resolveStart(false)
      return
    }
    if (TUNNEL_DOMAIN) {
      log(`cloudflared dimulai (pid ${tunnelProcess.pid}) -> ${TUNNEL_DOMAIN}`)
    } else {
      log(`cloudflared dimulai (pid ${tunnelProcess.pid})`)
    }
    resolveStart(true)
  })
}

function tunnelReady(bin) {
  if (bin === null) {
    log('cloudflared tidak ditemukan - pakai mode LOCAL')
    return false
  }
  if (!existsSync(TUNNEL_CONFIG)) {
    log('~/.cloudflared/config.yml tidak ditemukan - pakai mode LOCAL')
    return false
  }
  if (!tunnelRegistered(bin)) {
    log(`tunnel '${TUNNEL}' tidak terdaftar di akun - pakai mode LOCAL`)
    return false
  }
  return true
}

async function chooseMode(bin) {
  if (TUNNEL_DISABLED) return 'local'
  if (TUNNEL_MODE === 'local') return 'local'
  if (TUNNEL_MODE === 'domain') return tunnelReady(bin) ? 'domain' : 'local'
  if (!tunnelReady(bin)) return 'local'
  if (process.stdin.isTTY) {
    const answer = await askQuestion(
      'Akses lewat mana?\n  1) Local (http://localhost:3000)\n  2) Domain (tunnel)\nPilihan [Enter=Local]: '
    )
    return answer === '2' || /^domain$/i.test(answer) ? 'domain' : 'local'
  }
  log('non-interaktif (no TTY) - pakai mode LOCAL')
  return 'local'
}

async function main() {
  const args = process.argv.slice(2)
  const nextBin = resolve(HERE, '..', 'node_modules', 'next', 'dist', 'bin', 'next')
  if (!existsSync(nextBin)) {
    console.error('[tunnel] binary "next" tidak ditemukan. Jalankan "npm install" dulu.')
    process.exit(1)
  }

  const bin = resolveCloudflared()
  let mode = await chooseMode(bin)
  if (mode === 'domain' && !(await startTunnel(bin))) {
    mode = 'local'
  }

  if (mode === 'domain') {
    if (TUNNEL_DOMAIN) {
      log(`MODE = DOMAIN -> ${TUNNEL_DOMAIN}`)
    } else {
      log('MODE = DOMAIN (tunnel aktif, isi TUNNEL_DOMAIN untuk URL publik)')
    }
  } else {
    log('MODE = LOCAL -> http://localhost:3000')
  }

  const child = spawn(process.execPath, [nextBin, ...args], { stdio: 'inherit' })
  child.on('exit', (code) => {
    cleanup()
    process.exit(code ?? (child.signalCode ? 1 : 0))
  })
}

main()
