import React from 'react';
import { useParams } from 'react-router-dom';
import { DonationForm } from '@/components/stripe/donation-form';
import { ProductCard } from '@/components/stripe/product-card';
import { useStripeProducts } from '@/hooks/use-stripe-products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Target, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/stripe';

// Mock campaign data - in a real app, this would come from your campaigns API
const mockCampaign = {
  id: '1',
  title: 'Medical Equipment for Rural Clinic',
  description: 'Help us provide essential medical equipment to our rural clinic serving over 5,000 people who otherwise would have no access to healthcare.',
  goalAmount: 35000,
  currentAmount: 12500,
  donorCount: 84,
  daysLeft: 45,
  location: 'Guatemala',
  category: 'Medical',
  isUrgent: true,
  featuredImageUrl: 'https://images.pexels.com/photos/8475547/pexels-photo-8475547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  ownerName: 'Dr. Maria Rodriguez',
  createdAt: '2024-01-15',
};

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products, loading: productsLoading } = useStripeProducts({
    campaignId: id,
    active: true,
  });

  const campaign = mockCampaign; // In real app: useCampaign(id)
  const progressPercentage = (campaign.currentAmount / campaign.goalAmount) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={campaign.featuredImageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-3xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{campaign.category}</Badge>
                {campaign.isUrgent && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {campaign.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {campaign.daysLeft} days left
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {campaign.donorCount} donors
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised: {formatCurrency(campaign.currentAmount * 100)}</span>
                    <span>Goal: {formatCurrency(campaign.goalAmount * 100)}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="text-center text-sm text-gray-600">
                    {progressPercentage.toFixed(1)}% of goal reached
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {campaign.description}
                </p>
              </CardContent>
            </Card>

            {/* Related Products */}
            {products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Support Through Products</CardTitle>
                  <CardDescription>
                    Purchase these products and a portion will go directly to this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {products.slice(0, 4).map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          description={product.description || ''}
                          price={product.default_price?.unit_amount || 0}
                          currency={product.default_price?.currency || 'usd'}
                          image={product.images[0]}
                          campaignId={campaign.id}
                          campaignTitle={campaign.title}
                          donationPercentage={parseInt(product.metadata.donation_percentage || '50')}
                          stripeProductId={product.id}
                          stripePriceId={product.default_price?.id}
                          isDigital={product.metadata.type === 'digital'}
                          inStock={true}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Donation Sidebar */}
          <div className="space-y-6">
            <DonationForm
              campaignId={campaign.id}
              campaignTitle={campaign.title}
            />

            {/* Campaign Owner */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{campaign.ownerName}</p>
                    <p className="text-sm text-gray-600">
                      Created {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Campaign */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Help spread the word about this important cause
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}