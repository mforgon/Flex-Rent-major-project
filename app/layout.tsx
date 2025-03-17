import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flex Rent - Modern Rental Room Management System',
  description: 'A powerful web application for property owners to manage rental rooms with flexible rental durations.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* Header */}
          <header className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <span className="font-semibold">Flex Rent</span>
              </Link>
              <nav className="flex items-center gap-4">
                {session ? (
                  <>
                    <Link href={session.user.user_metadata.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant'}>
                      <Button variant="ghost">Dashboard</Button>
                    </Link>
                    <form action="/auth/sign-out" method="post">
                      <Button variant="outline" type="submit">Sign Out</Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button>Sign Up</Button>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main>{children}</main>

          {/* Footer */}
          <footer className="border-t mt-8">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Flex Rent. All rights reserved.
              </div>
            </div>
          </footer>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
