import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

interface CheckoutButtonProps {
  priceId: string;
  campaignId?: string;
  productName: string;
  amount: number;
  mode?: 'payment' | 'subscription';
  className?: string;
  children?: React.ReactNode;
  metadata?: Record<string, string>;
}

export function CheckoutButton({
  priceId,
  campaignId,
  productName,
  amount,
  mode = 'payment',
  className,
  children,
  metadata = {},
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create checkout session via edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href,
          mode,
          metadata: {
            ...metadata,
            campaign_id: campaignId || '',
            product_name: productName,
          },
        }),
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else if (sessionId) {
        // Redirect to Stripe Checkout using sessionId
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {children || `Purchase for $${(amount / 100).toFixed(2)}`}
    </Button>
  );
}