import { TableRowSkeleton } from '@/app/ui/skeletons';

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

      <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
        <div className="hidden min-w-full text-gray-900 md:table">
          <div className="rounded-lg text-left text-sm font-normal">
            <div className="grid grid-cols-6 gap-4 px-4 py-5 font-medium">
              <div className="h-6 w-full rounded bg-gray-100" />
              <div className="h-6 w-full rounded bg-gray-100" />
              <div className="h-6 w-full rounded bg-gray-100" />
              <div className="h-6 w-full rounded bg-gray-100" />
              <div className="h-6 w-full rounded bg-gray-100" />
              <div className="h-6 w-full rounded bg-gray-100" />
            </div>
          </div>
          <div className="bg-white">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        </div>

        <div className="md:hidden space-y-4">
          <div className="rounded-md bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100" />
              <div className="h-6 w-24 rounded bg-gray-100" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
            </div>
          </div>
          <div className="rounded-md bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100" />
              <div className="h-6 w-24 rounded bg-gray-100" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
