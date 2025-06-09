import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/stripe';

interface PaymentDetails {
  sessionId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  paymentStatus: string;
  campaignId?: string;
  campaignTitle?: string;
  productName?: string;
  donationAmount?: number;
}

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Fetch payment details from your backend
    fetchPaymentDetails(sessionId);
  }, [sessionId]);

  const fetchPaymentDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      const details = await response.json();
      setPaymentDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>
              {error || 'Unable to load payment details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your {paymentDetails.campaignId ? 'donation' : 'purchase'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-medium">
                  {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-medium capitalize">
                  {paymentDetails.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">{paymentDetails.customerEmail}</span>
              </div>
              {paymentDetails.productName && (
                <div className="flex justify-between">
                  <span>Item:</span>
                  <span className="font-medium">{paymentDetails.productName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Donation Info */}
          {paymentDetails.campaignId && paymentDetails.donationAmount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                Donation Impact
              </h3>
              <p className="text-sm text-green-700">
                {formatCurrency(paymentDetails.donationAmount)} from your purchase
                will go directly to support{' '}
                <span className="font-medium">
                  {paymentDetails.campaignTitle || 'the campaign'}
                </span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <Receipt className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button asChild className="flex-1">
              <Link to="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500">
            <p>
              A confirmation email has been sent to {paymentDetails.customerEmail}
            </p>
            <p className="mt-1">
              Session ID: {paymentDetails.sessionId}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}