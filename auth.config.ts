import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { users as mockUsers } from './app/lib/placeholder-data';
import type { User } from './app/lib/definitions';

// This module exports a factory that returns a NextAuthConfig. We avoid
// importing native modules (bcrypt, postgres) at module evaluation time so
// middleware/edge bundlers don't attempt to include them.

let cachedSqlClient: any = null;

async function getSqlClient() {
  if (cachedSqlClient) return cachedSqlClient;
  const POSTGRES_URL = process.env.POSTGRES_URL;
  if (!POSTGRES_URL) return null;

  // dynamic import to avoid bundling native modules into edge/middleware
  const pg = (await import('postgres')).default as any;
  cachedSqlClient = pg(POSTGRES_URL, { ssl: 'require', connect_timeout: 15 });
  return cachedSqlClient;
}

async function findUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email?.toLowerCase?.();
  if (!normalizedEmail) return null;

  const sql = await getSqlClient();
  if (sql) {
    const rows = await sql`SELECT id, name, email, password FROM users WHERE email = ${normalizedEmail}`;
    const row = rows[0];
    if (!row) return null;
    return {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      password: String(row.password),
    };
  }

  return mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail) ?? null;
}

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

          const user = await findUserByEmail(email);
          if (!user) return null;

          // Only import bcrypt when needed (server runtime). This prevents
          // edge/middleware bundlers from pulling in native bindings.
          const sql = await getSqlClient();
          if (sql) {
            const bcrypt = (await import('bcrypt')) as any;
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return null;
          } else {
            // fallback for mock users in dev/demo
            if (password !== user.password) return null;
          }

          return { id: user.id, email: user.email, name: user.name };
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
