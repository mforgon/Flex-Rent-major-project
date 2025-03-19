import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';

export default async function SubscriptionPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Get user's subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', session.user.id)
    .single();

  const isPremium = profile?.subscription_status === 'active';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the right plan for your business
        </p>
      </div>

      <SubscriptionPlans isPremium={isPremium} />
    </div>
  );
} 