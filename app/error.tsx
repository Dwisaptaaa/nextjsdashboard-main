'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-red-600">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-600">
          There was a problem loading this page. Please try again or contact your administrator.
        </p>
        <pre className="mt-4 rounded-lg bg-slate-100 p-4 text-xs text-slate-700">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Reload page
        </button>
      </div>
    </main>
  );
}
