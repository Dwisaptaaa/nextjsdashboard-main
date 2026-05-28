'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-700 transition hover:bg-slate-100 hover:text-slate-900 md:flex-none md:justify-start md:p-2 md:px-3"
    >
      Sign Out
    </button>
  );
}
