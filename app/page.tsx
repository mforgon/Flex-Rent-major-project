import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PropertyList } from "@/components/properties/property-list";

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'available')
    .limit(3)
    .order('created_at', { ascending: false });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Find Your Perfect <br />
              Rental Space
            </h1>
            <p className="text-lg text-muted-foreground max-w-[600px]">
              Discover flexible rental options with daily, weekly, and monthly rates.
              Book your ideal space today with our modern rental platform.
            </p>
            <div className="flex gap-4">
              <Link href="/properties">
                <Button size="lg">Browse Properties</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline" size="lg">List Your Property</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Featured Properties</h2>
                <p className="text-muted-foreground mt-2">
                  Explore our handpicked selection of top rental spaces
                </p>
              </div>
              <Link href="/properties">
                <Button variant="outline">View All Properties</Button>
              </Link>
            </div>

            <PropertyList properties={properties || []} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Flexible Duration</h3>
              <p className="text-muted-foreground">
                Choose from daily, weekly, or monthly rental options to suit your needs
              </p>
            </div>
            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Secure Payments</h3>
              <p className="text-muted-foreground">
                Integrated with Stripe for safe and reliable payment processing
              </p>
            </div>
            <div className="flex flex-col gap-4 items-center text-center p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">ID Verification</h3>
              <p className="text-muted-foreground">
                Enhanced security with identity verification for all users
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
