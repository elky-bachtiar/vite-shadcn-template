import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Loader2 } from 'lucide-react';
import { CheckoutButton } from './checkout-button';
import { formatCurrency } from '@/lib/stripe';

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
  suggestedAmounts?: number[];
}

export function DonationForm({
  campaignId,
  campaignTitle,
  suggestedAmounts = [500, 1000, 2500, 5000, 10000], // amounts in cents
}: DonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) * 100 : 0);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Make a Donation
        </CardTitle>
        <CardDescription>
          Support {campaignTitle} with your contribution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Suggested Amounts */}
        <div>
          <Label className="text-sm font-medium">Choose an amount</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {suggestedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? 'default' : 'outline'}
                onClick={() => handleAmountSelect(amount)}
                className="h-12"
              >
                {formatCurrency(amount)}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <Label htmlFor="custom-amount">Or enter a custom amount</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              id="custom-amount"
              type="number"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="pl-8"
              min="1"
              step="0.01"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message">Message (optional)</Label>
          <Textarea
            id="message"
            placeholder="Leave a message of support..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <Label htmlFor="anonymous" className="text-sm">
            Make this donation anonymous
          </Label>
        </div>

        {/* Checkout Button */}
        {finalAmount >= 100 && (
          <CheckoutButton
            priceId={`donation_${finalAmount}`} // This would need to be created dynamically
            campaignId={campaignId}
            productName={`Donation to ${campaignTitle}`}
            amount={finalAmount}
            className="w-full"
            metadata={{
              donation_message: message,
              is_anonymous: isAnonymous.toString(),
              campaign_title: campaignTitle,
            }}
          >
            Donate {formatCurrency(finalAmount)}
          </CheckoutButton>
        )}

        {finalAmount > 0 && finalAmount < 100 && (
          <p className="text-sm text-gray-500 text-center">
            Minimum donation amount is $1.00
          </p>
        )}
      </CardContent>
    </Card>
  );
}