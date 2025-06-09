import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  images: string[];
  metadata: Record<string, string>;
  default_price?: {
    id: string;
    unit_amount: number;
    currency: string;
  };
}

interface UseStripeProductsOptions {
  campaignId?: string;
  limit?: number;
  active?: boolean;
}

export function useStripeProducts(options: UseStripeProductsOptions = {}) {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [options.campaignId, options.limit, options.active]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.campaignId) params.append('campaignId', options.campaignId);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.active !== undefined) params.append('active', options.active.toString());

      const url = options.campaignId
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-products?action=getProductsByCampaign&${params}`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-products?action=getAllProducts&${params}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (user) {
        headers['Authorization'] = `Bearer ${user.access_token}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    refetch,
  };
}

// Hook for creating products
export function useCreateStripeProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createProduct = async (productData: {
    name: string;
    description?: string;
    campaignId?: string;
    images?: string[];
    metadata?: Record<string, string>;
    prices?: Array<{
      unitAmount: number;
      currency: string;
      recurring?: {
        interval: 'day' | 'week' | 'month' | 'year';
        intervalCount?: number;
      };
    }>;
  }) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          action: 'createProduct',
          ...productData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create product');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduct,
    loading,
    error,
  };
}