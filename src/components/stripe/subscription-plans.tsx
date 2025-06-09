import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckoutButton } from './checkout-button';
import { formatCurrency } from '@/lib/stripe';
import { Check, Star } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  isPopular?: boolean;
  campaignId?: string;
  donationPercentage?: number;
}

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  campaignId?: string;
  campaignTitle?: string;
}

export function SubscriptionPlans({
  plans,
  campaignId,
  campaignTitle,
}: SubscriptionPlansProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const donationAmount = plan.donationPercentage
          ? Math.round(plan.price * (plan.donationPercentage / 100))
          : 0;

        return (
          <Card
            key={plan.id}
            className={`relative overflow-hidden ${
              plan.isPopular ? 'border-primary shadow-lg' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0">
                <Badge className="rounded-none rounded-bl-lg">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-gray-500">/{plan.interval}</span>
              </div>
              {donationAmount > 0 && (
                <div className="text-sm text-green-600 mt-2">
                  {formatCurrency(donationAmount)} goes to {campaignTitle || 'campaign'} monthly
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Subscribe Button */}
              <CheckoutButton
                priceId={plan.stripePriceId}
                campaignId={campaignId}
                productName={`${plan.name} Subscription`}
                amount={plan.price}
                mode="subscription"
                className="w-full"
                metadata={{
                  plan_id: plan.id,
                  donation_percentage: plan.donationPercentage?.toString() || '0',
                  interval: plan.interval,
                }}
              >
                Subscribe
              </CheckoutButton>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}