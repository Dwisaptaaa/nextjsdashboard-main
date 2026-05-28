import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Acme Dashboard',
    template: '%s • Acme Dashboard',
  },
  description:
    'A secure invoice management dashboard built with Next.js App Router, Tailwind CSS, and NextAuth.',
  metadataBase: new URL('http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
