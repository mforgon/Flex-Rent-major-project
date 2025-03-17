'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PostgrestError } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Property {
  id: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
}

interface RentalOption {
  duration: 'daily' | 'weekly' | 'monthly';
  rate: number;
  label: string;
}

export default function BookingPage({ params }: { params: { id: string } }) {
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const [property, setProperty] = useState<Property | null>(null);

  // Fetch property details when component mounts
  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load property details',
          variant: 'destructive',
        });
        return;
      }

      setProperty(data);
    };

    fetchProperty();
  }, [params.id, supabase, toast]);

  if (!property) {
    return <div>Loading...</div>;
  }

  const rentalOptions: RentalOption[] = [
    { duration: 'daily', rate: property.daily_rate, label: 'Daily Rate' },
    { duration: 'weekly', rate: property.weekly_rate, label: 'Weekly Rate' },
    { duration: 'monthly', rate: property.monthly_rate, label: 'Monthly Rate' },
  ];

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Here you would integrate with your payment provider (e.g., Stripe)
      // For now, we'll just create a booking record
      const { error } = await supabase.from('bookings').insert({
        property_id: params.id,
        tenant_id: (await supabase.auth.getUser()).data.user?.id,
        duration_type: selectedDuration,
        status: 'pending',
        amount: rentalOptions.find(opt => opt.duration === selectedDuration)?.rate,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking created successfully!',
      });

      // Redirect to the bookings page or confirmation page
      router.push('/dashboard/tenant/bookings');
    } catch (error) {
      const pgError = error as PostgrestError;
      toast({
        title: 'Error',
        description: pgError.message || 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Rental Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <RadioGroup
              value={selectedDuration}
              onValueChange={setSelectedDuration}
              className="space-y-4"
            >
              {rentalOptions.map((option) => (
                <div key={option.duration} className="flex items-center space-x-4">
                  <RadioGroupItem value={option.duration} id={option.duration} />
                  <Label htmlFor={option.duration} className="flex-1">
                    <div className="flex justify-between">
                      <span>{option.label}</span>
                      <span className="font-semibold">${option.rate}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handlePayment}
              disabled={!selectedDuration || isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 