import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NewPropertyPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Check subscription status and property count
  const [{ data: profile }, { count }] = await Promise.all([
    supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', session.user.id)
      .single(),
    supabase
      .from('properties')
      .select('*', { count: true })
      .eq('owner_id', session.user.id)
  ]);

  const isPremium = profile?.subscription_status === 'active';
  const propertyCount = count || 0;
  const hasReachedLimit = !isPremium && propertyCount >= 3;

  if (hasReachedLimit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Property Limit Reached</AlertTitle>
          <AlertDescription>
            You've reached the maximum of 3 properties on the Free plan. Upgrade to Premium to add more properties.
            <div className="mt-4 flex gap-4">
              <Link href="/dashboard/owner/subscription">
                <Button>
                  Upgrade to Premium
                </Button>
              </Link>
              <Link href="/dashboard/owner/properties">
                <Button variant="outline">
                  Back to Properties
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Rest of the property creation form
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Property</h1>
      {/* Property creation form component */}
    </div>
  );
} 