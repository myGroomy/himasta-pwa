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
let nextProcess = null

const cleanup = () => {
  if (nextProcess && !nextProcess.killed) {
    try { nextProcess.kill('SIGTERM') } catch { /* ignore */ }
  }
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
  if (process.env.CLOUDFLARED && existsSync(process.env.CLOUDFLARED)) return process.env.CLOUDFLARED

  const candidates = [CLOUDFLARED]
  if (isWindows) {
    const baseName = join(HOME, '.local', 'bin', 'cloudflared')
    candidates.push(baseName, `${baseName}.exe`)
    candidates.push(join(HOME, 'cloudflared', 'cloudflared.exe'))
    candidates.push(join(HOME, '.cloudflared', 'cloudflared.exe'))
    candidates.push('C:\\cloudflared\\cloudflared.exe')
    const userProfile = process.env.USERPROFILE
    if (userProfile && userProfile !== HOME) {
      const profileBase = join(userProfile, '.local', 'bin', 'cloudflared')
      candidates.push(profileBase, `${profileBase}.exe`)
      candidates.push(join(userProfile, 'cloudflared', 'cloudflared.exe'))
    }
  }
  for (const c of candidates) {
    if (c && existsSync(c)) return c
  }

  const onPath = isWindows
    ? spawnSync('where.exe', ['cloudflared'], { encoding: 'utf8', windowsHide: true })
    : spawnSync('which', ['cloudflared'], { encoding: 'utf8' })
  if (onPath.status === 0 && onPath.stdout) {
    const first = onPath.stdout.split(/\r?\n/).map((s) => s.trim()).find(Boolean)
    if (first) return first
  }

  const probe = runCloudflared('cloudflared', ['--version'])
  if (!probe.error && probe.status === 0) return 'cloudflared'
  return null
}

function needsShellFor(bin) {
  return isWindows && (bin === 'cloudflared' || !/^[A-Za-z]:[\\/]/.test(bin) || /\.(cmd|bat)$/i.test(bin))
}

function runCloudflared(bin, args) {
  const shell = needsShellFor(bin)
  const b = shell && bin.includes(' ') ? `"${bin}"` : bin
  return spawnSync(b, args, { encoding: 'utf8', shell, windowsHide: true })
}

function tunnelRegistered(bin) {
  const out = runCloudflared(bin, ['tunnel', 'list'])
  if (out.error || out.status !== 0) return false
  const text = `${out.stdout}\n${out.stderr}`
  return new RegExp(`\\b${TUNNEL}\\b`).test(text)
}

function startTunnel(bin) {
  const logFd = openSync(LOG, 'a')
  const needsShell = needsShellFor(bin)
  const runArgs = ['tunnel', 'run', TUNNEL]
  const runBin = needsShell && bin.includes(' ') ? `"${bin}"` : bin
  tunnelProcess = spawn(runBin, runArgs, {
    stdio: ['ignore', logFd, logFd],
    detached: process.platform !== 'win32',
    shell: needsShell,
    windowsHide: true,
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

  nextProcess = spawn(process.execPath, [nextBin, ...args], { stdio: 'inherit' })
  nextProcess.on('exit', (code) => {
    cleanup()
    process.exit(code ?? (nextProcess.signalCode ? 1 : 0))
  })
}

main()
