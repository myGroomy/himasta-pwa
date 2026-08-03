'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  GraduationCap,
  Home,
  Megaphone,
  QrCode,
  FolderOpen,
  Users,
  Bell,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/constants'
import type { SessionUser } from '@/lib/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type NavDivision = {
  id: string
  name: string
  slug: string
}

type NavbarProps = {
  user: SessionUser
  divisions: NavDivision[]
  unreadCount: number
}

export function Navbar({ user, divisions, unreadCount }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems: { href: string; label: string; icon: React.ReactNode }[] = [
    { href: '/', label: 'Portal', icon: <Home className="h-4 w-4" /> },
    { href: '/announcements', label: 'Pengumuman', icon: <Megaphone className="h-4 w-4" /> },
    { href: '/absensi', label: 'Absensi', icon: <QrCode className="h-4 w-4" /> },
    { href: '/dokumen', label: 'Dokumen', icon: <FolderOpen className="h-4 w-4" /> },
    { href: '/direktori', label: 'Direktori', icon: <Users className="h-4 w-4" /> },
  ]

  if (user.role === 'BPH') {
    navItems.push({ href: '/admin/approval', label: 'Approval', icon: <ShieldCheck className="h-4 w-4" /> })
  }

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">HIMASTA</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 gap-1.5 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Divisi
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Workspace Divisi</DropdownMenuLabel>
              {divisions.map((d) => (
                <DropdownMenuItem key={d.id} asChild>
                  <Link href={`/divisi/${d.slug}`}>{d.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasi">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/notifikasi">Buka pusat notifikasi</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight">{user.name}</span>
                  <span className="block text-xs text-muted-foreground leading-tight">
                    {ROLE_LABELS[user.role]}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/direktori">Profil & Direktori</Link>
              </DropdownMenuItem>
              {user.role === 'BPH' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/approval">Approval Center</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users">Kelola Anggota</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={async () => {
                  await signOut({ redirect: false })
                  router.push('/login')
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

      <MobileNav pathname={pathname} navItems={navItems} divisions={divisions} />
    </header>
  )
}

function MobileNav({
  pathname,
  navItems,
  divisions,
}: {
  pathname: string
  navItems: { href: string; label: string; icon: React.ReactNode }[]
  divisions: NavDivision[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        Menu
      </button>
      {open && (
        <nav className="grid grid-cols-2 gap-1 p-2">
          {navItems.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                  active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
          {divisions.map((d) => (
            <Link
              key={d.id}
              href={`/divisi/${d.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              <Building2 className="h-4 w-4" />
              {d.name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
