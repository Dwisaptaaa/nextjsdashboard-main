export const dynamic = 'force-dynamic';

import CustomersTable from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const query = (searchParams?.q ?? '') as string;
  const customers = await fetchFilteredCustomers(query);

  return (
    <main>
      <CustomersTable customers={customers} />
    </main>
  );
}
