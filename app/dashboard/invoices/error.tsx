'use client';

import Link from 'next/link';

export default function InvoicesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-red-600">Unable to load invoices</h1>
        <p className="mt-3 text-sm text-slate-600">
          There was a problem displaying the invoices list. Please try again or return to the dashboard.
        </p>
        <pre className="mt-4 rounded-lg bg-slate-100 p-4 text-xs text-slate-700">{error.message}</pre>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Retry
          </button>
          <Link
            href="/dashboard"
            className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
