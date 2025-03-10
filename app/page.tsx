import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PropertyList } from "@/components/properties/property-list";
import { Building2, Calendar, CreditCard, Shield } from 'lucide-react';

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
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Rental Property
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A modern platform for property owners and tenants to connect, manage bookings, and handle payments seamlessly.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/properties">
                <Button variant="outline" size="lg">Browse Properties</Button>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Flex Rent?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Rentals</h3>
              <p className="text-muted-foreground">
                Choose from daily, weekly, or monthly rental options to suit your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">
                Simple and quick booking process with instant confirmation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">
                Safe and reliable payment processing for both owners and tenants.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Properties</h3>
              <p className="text-muted-foreground">
                All properties are verified to ensure quality and safety.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
