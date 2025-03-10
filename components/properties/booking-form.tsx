"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";
import { useNavigation } from "@/lib/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  duration: z.enum(["daily", "weekly", "monthly"], {
    required_error: "Please select a duration.",
  }),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  endDate: z.date({
    required_error: "Please select an end date.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Property {
  id: string;
  name: string;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
}

interface BookingFormProps {
  propertyId: string;
  propertyName: string;
  rates: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export function BookingForm({ propertyId, propertyName, rates }: BookingFormProps) {
  const { navigateToSignIn, navigateToPayment } = useNavigation();
  const { toast: useToastToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: "daily",
      startDate: undefined,
      endDate: undefined,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigateToSignIn('/payment');
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        useToastToast({
          title: 'Error',
          description: 'End date must be after start date.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            property_id: propertyId,
            user_id: session.user.id,
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            duration,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create a payment session with Stripe
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: data.id,
          amount: rates[duration],
          duration,
        }),
      });

      const { sessionId } = await response.json();

      navigateToPayment(sessionId);
    } catch (error) {
      useToastToast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setDuration(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (${rates.daily}/day)</SelectItem>
                  <SelectItem value="weekly">Weekly (${rates.weekly}/week)</SelectItem>
                  <SelectItem value="monthly">Monthly (${rates.monthly}/month)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold">
                  {formatCurrency(rates[duration])}
                </span>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Book Now"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 