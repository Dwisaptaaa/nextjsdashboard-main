import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { users as mockUsers } from './app/lib/placeholder-data';
import type { User } from './app/lib/definitions';

const sql = process.env.POSTGRES_URL
  ? postgres(process.env.POSTGRES_URL, {
      ssl: 'require',
      connect_timeout: 15,
    })
  : null;

const getSql = () => {
  if (!sql) {
    throw new Error('Database unavailable. Please set POSTGRES_URL.');
  }
  return sql;
};

async function findUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email?.toLowerCase?.();
  if (!normalizedEmail) {
    return null;
  }

  if (sql) {
    const rows = await getSql()`SELECT id, name, email, password FROM users WHERE email = ${normalizedEmail}`;
    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      password: String(row.password),
    };
  }

  return (
    mockUsers.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null
  );
}

export const authOptions: NextAuthConfig = {
  session: {
    strategy: 'jwt',
  },
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

        if (!email || !password) {
          return null;
        }

        const user = await findUserByEmail(email);
        if (!user) {
          return null;
        }

        const isPasswordValid = sql
          ? await bcrypt.compare(password, user.password)
          : password === user.password;

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
        };
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.id) {
        session.user = {
          id: String(token.id),
          name: String(token.name),
          email: String(token.email),
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'change-me',
};
