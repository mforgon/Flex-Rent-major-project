'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PaymentForm } from '@/components/payment/PaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Stripe appearance options
const appearance: Appearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#0F172A',
    colorBackground: '#ffffff',
    colorText: '#1e293b',
    colorDanger: '#ef4444',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
};

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
  const [clientSecret, setClientSecret] = useState<string>('');
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

  const handleDurationSelect = async (duration: string) => {
    setSelectedDuration(duration);
    if (!property) return;

    const option = rentalOptions.find((opt) => opt.duration === duration);
    if (!option) return;

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: option.rate,
          duration_type: duration,
          property_id: property.id,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setClientSecret(data.clientSecret);
    } catch (error: unknown) {
      console.error('Payment initialization error:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize payment',
        variant: 'destructive',
      });
    }
  };

  if (!property) {
    return <div>Loading...</div>;
  }

  const rentalOptions: RentalOption[] = [
    { duration: 'daily', rate: property.daily_rate, label: 'Daily Rate' },
    { duration: 'weekly', rate: property.weekly_rate, label: 'Weekly Rate' },
    { duration: 'monthly', rate: property.monthly_rate, label: 'Monthly Rate' },
  ];

  const stripeOptions = {
    clientSecret,
    appearance,
    loader: 'auto' as const,
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
              onValueChange={handleDurationSelect}
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

            {clientSecret && (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <PaymentForm
                  propertyId={params.id}
                  durationType={selectedDuration}
                  amount={rentalOptions.find(opt => opt.duration === selectedDuration)?.rate || 0}
                />
              </Elements>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 