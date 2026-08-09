import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  nim: string | null
  divisionId: string | null
  isSuper?: boolean
}

// Google login aktif hanya jika kredensial OAuth terpasang di .env.local.
const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'NIM atau Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        const identifier = credentials.identifier.trim().toLowerCase()

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { nim: identifier.toUpperCase() }, { nim: identifier }],
          },
        })

        if (!user || !user.isActive) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          divisionId: user.divisionId,
          isSuper: user.isSuper,
        }
      },
    }),
    ...(googleProvider ? [googleProvider] : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google: akun hanya boleh masuk kalau emailnya sudah terdaftar di portal.
      // Belum punya akun → arahkan daftar dulu (flow normal).
      if (account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email?.toLowerCase() ?? '' },
          select: { isActive: true },
        })
        if (!dbUser || !dbUser.isActive) return '/register?google=new'
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user?.email) {
        // user.id dari Google = sub (bukan id DB) → cari user asli by email.
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, name: true, role: true, divisionId: true, isActive: true, isSuper: true },
        })
        if (dbUser && dbUser.isActive) {
          token.id = dbUser.id
          token.name = dbUser.name
          token.role = dbUser.role
          token.divisionId = dbUser.divisionId ?? null
          token.isSuper = dbUser.isSuper
        } else {
          token.id = undefined
          token.role = undefined
        }
      } else if (user) {
        token.id = user.id
        token.role = user.role
        token.divisionId = user.divisionId ?? null
        token.isSuper = (user as SessionUser).isSuper ?? false
      } else if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, role: true, divisionId: true, isSuper: true },
          })
          if (!dbUser || !dbUser.isActive) {
            token.id = undefined
            token.role = undefined
          } else {
            token.role = dbUser.role
            token.divisionId = dbUser.divisionId ?? null
            token.isSuper = dbUser.isSuper
          }
        } catch {
          // Abaikan error DB temporal
        }
      }
      return token
    },
    async session({ session, token }) {
      if (!token.id || !token.role) {
        return {
          ...session,
          user: undefined,
        }
      }
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.divisionId = (token.divisionId as string) ?? null
        session.user.isSuper = Boolean(token.isSuper)
      }
      return session
    },
  },
}
