export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Metadata } from 'next';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import Search from '@/app/ui/search';
import InvoicesTable from '@/app/ui/invoices/table';
import Pagination from '@/app/ui/invoices/pagination';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { fetchInvoicesPages } from '@/app/lib/data';

export function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Metadata {
  const query = searchParams.q?.trim();

  return {
    title: query ? `Search: ${query} • Invoices` : 'Invoices • Acme Dashboard',
    description:
      'Browse invoices, use search filters, and manage payment status from a clean dashboard experience.',
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;

  const query = params?.q ?? '';
  const currentPage = Number(params?.page ?? '1');
  const totalPages = Math.max(await fetchInvoicesPages(query), 1);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search and filter the invoice table with query parameters.
          </p>
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto">
          <Search placeholder="Search invoices" initialQuery={query} />
          <CreateInvoice />
        </div>
      </div>

      <Suspense fallback={<InvoicesTableSkeleton />}>
        <InvoicesTable query={query} currentPage={currentPage} />
      </Suspense>

      <div className="mt-6 flex items-center justify-end">
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}
