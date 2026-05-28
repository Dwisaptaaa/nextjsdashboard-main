import { redirect } from 'next/navigation';
import LoginForm from '@/app/ui/login-form';
import { auth } from '@/auth';

export const metadata = {
  title: 'Login',
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <LoginForm />
      </div>
    </main>
  );
}
