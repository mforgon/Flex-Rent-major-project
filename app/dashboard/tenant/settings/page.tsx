import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CreditCard, Bell, Shield } from 'lucide-react';

export default async function TenantSettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Fetch tenant's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <p className="text-muted-foreground">{profile?.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-muted-foreground">{profile?.phone || 'Not set'}</p>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Payment Methods</h2>
            </div>
            <Button variant="outline">Add Payment Method</Button>
          </div>
          <p className="text-muted-foreground">
            Manage your payment methods and billing information
          </p>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          <p className="text-muted-foreground">
            Set up your notification preferences
          </p>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Security</h2>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
          <p className="text-muted-foreground">
            Manage your account security settings
          </p>
        </Card>

        {/* Account Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Account Status</h2>
              <p className="text-muted-foreground">
                Your account is active and in good standing
              </p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
} 