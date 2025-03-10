import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { SubscriptionPlan } from "@/lib/stripe/types";
import { useState } from "react";
import { Stripe } from "stripe";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSubscribe: (planId: string) => Promise<Stripe.Subscription | undefined>;
  isLoading?: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan = false,
  onSubscribe,
  isLoading = false,
}: PlanCardProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      await onSubscribe(plan.id);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          ${plan.price}/{plan.interval}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={isCurrentPlan || isLoading || isSubscribing}
        >
          {isCurrentPlan
            ? "Current Plan"
            : isSubscribing
            ? "Processing..."
            : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  );
} 