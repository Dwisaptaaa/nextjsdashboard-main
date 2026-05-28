import { redirect } from 'next/navigation';
import LoginForm from '@/app/ui/login-form';
import { auth } from '@/auth';

export const metadata = {
  title: 'Sign in • Acme Dashboard',
  description: 'Secure login for access to invoices, customers, and dashboard metrics.',
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <LoginForm />
      </div>
    </main>
  );
}
