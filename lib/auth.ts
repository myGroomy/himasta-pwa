import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
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
}

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
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.divisionId = user.divisionId ?? null
      } else if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, role: true, divisionId: true },
          })
          if (!dbUser || !dbUser.isActive) {
            token.id = undefined
            token.role = undefined
          } else {
            token.role = dbUser.role
            token.divisionId = dbUser.divisionId ?? null
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
      }
      return session
    },
  },
}
