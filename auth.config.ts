import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticate } from './app/lib/actions';

// This module exports a factory that returns a NextAuthConfig. We avoid
// importing native modules (bcrypt, postgres) at module evaluation time so
// middleware/edge bundlers don't attempt to include them.

export async function getAuthConfig(): Promise<NextAuthConfig> {
  return {
    session: { strategy: 'jwt' },
    providers: [
      CredentialsProvider({
        name: 'Email and password',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          const email = String(credentials?.email ?? '').trim();
          const password = String(credentials?.password ?? '');

          if (!email || !password) return null;

          try {
            return await authenticate(email, password);
          } catch {
            return null;
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }: { token: any; user?: any }) {
        if (user) {
          return { ...token, id: user.id, name: user.name, email: user.email };
        }
        return token;
      },
      async session({ session, token }: { session: any; token: any }) {
        if (token?.id) {
          session.user = { id: String(token.id), name: String(token.name), email: String(token.email) };
        }
        return session;
      },
    },
    pages: { signIn: '/login' },
    secret: process.env.NEXTAUTH_SECRET ?? 'change-me',
  };
}
