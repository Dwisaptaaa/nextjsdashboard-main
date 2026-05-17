import { Suspense } from 'react';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import Search from '@/app/ui/search';
import InvoicesTable from '@/app/ui/invoices/table';
import Pagination from '@/app/ui/invoices/pagination';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { fetchInvoicesPages } from '@/app/lib/data';

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string };
}) {
  const query = (searchParams?.q ?? '') as string;
  const currentPage = Number(searchParams?.page ?? '1');

  const totalPages = await fetchInvoicesPages(query);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <div className="flex items-center gap-4">
          <Search placeholder="Search invoices" />
          <CreateInvoice />
        </div>
      </div>

      <Suspense fallback={<InvoicesTableSkeleton />}>
        {/* InvoicesTable is an async server component that fetches data */}
        {/* Chapter: Search and Pagination; server-side rendering with searchParams */}
        {/* The table will read `q` and `page` from props and fetch accordingly */}
        <InvoicesTable query={query} currentPage={currentPage} />
      </Suspense>

      <div className="mt-6 flex items-center justify-end">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
