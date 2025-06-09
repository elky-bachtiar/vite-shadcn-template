import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckoutButton } from './checkout-button';
import { formatCurrency } from '@/lib/stripe';
import { Heart, Package } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
  campaignId?: string;
  campaignTitle?: string;
  donationPercentage?: number;
  stripeProductId?: string;
  stripePriceId?: string;
  isDigital?: boolean;
  inStock?: boolean;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  currency = 'usd',
  image,
  campaignId,
  campaignTitle,
  donationPercentage = 0,
  stripeProductId,
  stripePriceId,
  isDigital = false,
  inStock = true,
}: ProductCardProps) {
  const donationAmount = Math.round(price * (donationPercentage / 100));

  return (
    <Card className="w-full max-w-sm overflow-hidden">
      {/* Product Image */}
      {image && (
        <div className="aspect-square overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{name}</CardTitle>
          <div className="flex items-center gap-1">
            {isDigital && (
              <Badge variant="secondary\" className="text-xs">
                Digital
              </Badge>
            )}
            {!inStock && (
              <Badge variant="destructive" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-3">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price and Donation Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatCurrency(price, currency)}
            </span>
            <Package className="h-5 w-5 text-gray-400" />
          </div>

          {campaignId && donationPercentage > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Heart className="h-4 w-4" />
              <span>
                {formatCurrency(donationAmount, currency)} ({donationPercentage}%) goes to{' '}
                {campaignTitle || 'campaign'}
              </span>
            </div>
          )}
        </div>

        {/* Purchase Button */}
        {stripePriceId && inStock ? (
          <CheckoutButton
            priceId={stripePriceId}
            campaignId={campaignId}
            productName={name}
            amount={price}
            className="w-full"
            metadata={{
              product_id: id,
              donation_percentage: donationPercentage.toString(),
              is_digital: isDigital.toString(),
            }}
          >
            Buy Now
          </CheckoutButton>
        ) : (
          <div className="text-center text-sm text-gray-500">
            {!inStock ? 'Out of Stock' : 'Not available for purchase'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}