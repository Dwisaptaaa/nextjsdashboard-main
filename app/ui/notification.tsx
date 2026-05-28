'use client';

export default function Notification({
  type,
  message,
}: {
  type: 'error' | 'success';
  message: string;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        type === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {message}
    </div>
  );
}
