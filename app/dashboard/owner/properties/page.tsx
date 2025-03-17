import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PropertyList } from '@/components/dashboard/property-list';
import { UpgradeBanner } from '@/components/dashboard/upgrade-banner';

const FREE_PLAN_LIMIT = 3;

export default async function PropertiesPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Fetch owner's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  // Fetch subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const isPremium = subscription?.status === 'active';
  const propertyCount = properties?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground">
            Manage your rental properties
          </p>
        </div>
        {(isPremium || propertyCount < FREE_PLAN_LIMIT) && (
          <Link href="/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        )}
      </div>

      {!isPremium && (
        <UpgradeBanner
          propertyCount={propertyCount}
          limit={FREE_PLAN_LIMIT}
        />
      )}

      <div className="bg-card rounded-lg shadow-sm">
        <PropertyList properties={properties || []} />
      </div>
    </div>
  );
} 