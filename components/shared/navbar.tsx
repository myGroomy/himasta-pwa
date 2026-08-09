'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Bell,
  LogOut,
  ShieldCheck,
  BarChart3,
  History,
  MessageSquarePlus,
  Users,
  Globe,
} from 'lucide-react'
import { ROLE_LABELS } from '@/lib/constants'
import type { SessionUser } from '@/lib/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { SearchDialog } from '@/components/shared/search-dialog'

export type NavDivision = {
  id: string
  name: string
  slug: string
}

type NavbarProps = {
  user: SessionUser
  divisions: NavDivision[]
  unreadCount: number
  latestNotifications: { id: string; title: string; message: string; isRead: boolean; link: string | null; createdAt: Date }[]
}

export function Navbar({ user, divisions, unreadCount, latestNotifications }: NavbarProps) {
  const router = useRouter()

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 font-bold hover:opacity-90 transition-opacity">
          <div className="relative h-9 w-9 overflow-hidden rounded-md">
            <Image
              src="/himasta-logo.webp"
              alt="Logo HIMASTA"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-extrabold tracking-tight leading-none text-foreground">HIMASTA</span>
            <span className="text-[10px] font-medium text-muted-foreground leading-none mt-1">Sistem Informasi &amp; Operasional</span>
          </div>
        </Link>

        {/* Right Actions: Search, Theme, Notifications & Profile Avatar */}
        <div className="flex items-center gap-2">
          <SearchDialog divisions={divisions} />
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label="Buka Landing Page"
            title="Landing Page"
          >
            <Link href="/welcome">
              <Globe className="h-5 w-5" />
            </Link>
          </Button>
          
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-secondary" aria-label="Notifikasi">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px] bg-pastel-red text-pastel-red-foreground border-0">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Pusat Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {latestNotifications.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {latestNotifications.map(n => (
                    <DropdownMenuItem key={n.id} asChild className="p-3 mb-1 cursor-pointer items-start">
                      <Link href={n.link || '/notifikasi'} onClick={() => {
                          if (!n.isRead) {
                              fetch(`/api/notifications/${n.id}`, { method: 'PATCH' }).catch(() => {})
                          }
                      }}>
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-start justify-between w-full">
                              <span className={`text-sm font-medium ${!n.isRead ? 'text-primary' : ''}`}>{n.title}</span>
                              {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />}
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                            <span className="text-[10px] text-muted-foreground/70">{timeAgo(n.createdAt)}</span>
                          </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">Belum ada notifikasi</div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="justify-center text-primary font-medium w-full text-center">
                <Link href="/notifikasi">Lihat Semua Notifikasi</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 hover:bg-secondary">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-secondary text-foreground font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold leading-tight text-foreground">{user.name}</span>
                  <span className="block text-[11px] text-muted-foreground leading-tight">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profil">Profil Pengguna</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/direktori">Direktori Anggota</Link>
              </DropdownMenuItem>

              {(user.role === 'BPH' || user.role === 'KADIV') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/approval" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Approval Center
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {user.role === 'BPH' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/analytics" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      Analytics &amp; Report
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-400" />
                      Kelola Anggota
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/periode" className="flex items-center gap-2">
                      <History className="h-4 w-4 text-cyan-400" />
                      Manajemen Periode
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/feedback">
                  <MessageSquarePlus className="h-4 w-4" />
                  Kritik &amp; Saran
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={async () => {
                  await signOut({ redirect: false })
                  router.push('/')
                  router.refresh()
                }}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
