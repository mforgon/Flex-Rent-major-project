import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, Calendar, CreditCard, Home, Settings } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Get user role from metadata
  const userRole = session.user.user_metadata.role;

  const navigation = userRole === 'owner' 
    ? [
        { name: 'Overview', href: '/dashboard/owner', icon: Home },
        { name: 'Properties', href: '/dashboard/owner/properties', icon: Building2 },
        { name: 'Bookings', href: '/dashboard/owner/bookings', icon: Calendar },
        { name: 'Payments', href: '/dashboard/owner/payments', icon: CreditCard },
        { name: 'Settings', href: '/dashboard/owner/settings', icon: Settings },
      ]
    : [
        { name: 'Overview', href: '/dashboard/tenant', icon: Home },
        { name: 'My Bookings', href: '/dashboard/tenant/bookings', icon: Calendar },
        { name: 'Payments', href: '/dashboard/tenant/payments', icon: CreditCard },
        { name: 'Settings', href: '/dashboard/tenant/settings', icon: Settings },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="font-semibold">Flex Rent</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
} 