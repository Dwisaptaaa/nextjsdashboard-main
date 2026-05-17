export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <div className="h-12 w-40 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-8 space-y-4">
          <div className="h-10 rounded-lg bg-gray-200" />
          <div className="h-10 rounded-lg bg-gray-200" />
          <div className="h-12 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
