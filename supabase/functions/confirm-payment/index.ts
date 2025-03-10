import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  try {
    const { clientSecret } = await req.json();

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(clientSecret);

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment not succeeded");
    }

    const { propertyId, startDate, endDate, duration, userId } =
      paymentIntent.metadata;

    // Create a booking
    const { error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        property_id: propertyId,
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        duration,
        status: "confirmed",
        payment_intent_id: paymentIntent.id,
      });

    if (bookingError) throw bookingError;

    // Update property status
    const { error: propertyError } = await supabaseClient
      .from("properties")
      .update({ status: "occupied" })
      .eq("id", propertyId);

    if (propertyError) throw propertyError;

    return new Response(
      JSON.stringify({ message: "Payment confirmed and booking created" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}); 