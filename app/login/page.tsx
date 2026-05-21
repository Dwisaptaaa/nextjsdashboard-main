import LoginForm from '@/app/ui/login-form';
import { redirect } from 'next/navigation';

const VALID_PASSWORD = '231712615';

export async function loginAction(formData: FormData) {
  'use server';

  const password = formData.get('password')?.toString() ?? '';

  if (password !== VALID_PASSWORD) {
    redirect('/login?error=invalid');
  }

  redirect('/dashboard');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <LoginForm action={loginAction} error={params?.error} />
      </div>
    </main>
  );
}
