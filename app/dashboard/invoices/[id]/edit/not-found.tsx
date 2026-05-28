import Link from 'next/link';

export default function InvoiceEditNotFound() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Invoice not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The invoice you are trying to edit could not be found. It may have been deleted or the ID is invalid.
        </p>
        <Link
          href="/dashboard/invoices"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Back to invoices
        </Link>
      </div>
    </main>
  );
}
