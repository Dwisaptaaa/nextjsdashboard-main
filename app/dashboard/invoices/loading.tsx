import { InvoicesTableSkeleton } from '@/app/ui/skeletons';

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 rounded-md bg-gray-100" />
        <div className="flex items-center gap-4">
          <div className="h-10 w-40 rounded-md bg-gray-100" />
          <div className="h-10 w-40 rounded-md bg-gray-100" />
        </div>
      </div>

      <InvoicesTableSkeleton />
    </div>
  );
}
