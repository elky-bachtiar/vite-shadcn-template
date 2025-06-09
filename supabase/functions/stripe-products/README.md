# Stripe Products Edge Function

This Supabase Edge Function provides a secure interface for interacting with Stripe's Product and Price APIs while caching data in Supabase for better performance and easier frontend access.

## Features

- **Role-based Access Control**: Read operations available to all authenticated users, write operations restricted to admins and campaign owners
- **Data Caching**: Products and prices are cached in Supabase tables for efficient frontend reads
- **Comprehensive CRUD Operations**: Full suite of operations for managing products and prices
- **Campaign-specific Products**: Products can be associated with specific campaigns

## API Operations

### Read Operations (Available to all authenticated users)

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `getAllProducts` | Get all products from cache | None |
| `getProductsByCampaign` | Get products for a specific campaign | `campaignId` (required) |
| `getProductById` | Get a product by its ID | `productId` (required) |
| `getProductByName` | Get products by name | `name` (required) |
| `productExists` | Check if a product exists for a campaign | `name` & `campaignId` (both required) |
| `getDonationProductForCampaign` | Get the donation product for a campaign | `campaignId` (required) |
| `getProductsByNameAndCampaignId` | Get products by name and campaign ID | `name` & `campaignId` (both required) |

### Write Operations (Restricted to admins and campaign owners)

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `createProduct` | Create a new product | `name`, `campaignId`, optional: `description`, `images`, `metadata`, `prices`, `active` |
| `createDonationProductForCampaign` | Create/update donation product | `campaignId`, `prices` |
| `updateDonationProductTariffs` | Update donation amounts | `productId`, `prices` |
| `addPriceToProduct` | Add a price to an existing product | `productId`, `prices` (array with a single price) |
| `updateProduct` | Update product details | `productId` and any product fields to update |
| `deleteProduct` | Delete a product | `productId` |

## Usage Examples

### Example 1: Get all products

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/stripe-products?action=getAllProducts`, {
  headers: {
    Authorization: `Bearer ${supabaseAccessToken}`
  }
});
const { success, data } = await response.json();
```

### Example 2: Create a product

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/stripe-products`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${supabaseAccessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'createProduct',
    name: 'T-Shirt',
    description: 'A premium cotton t-shirt',
    campaignId: 'campaign-uuid',
    prices: [
      {
        unitAmount: 2000, // $20.00
        currency: 'usd'
      }
    ],
    metadata: {
      size: 'M',
      color: 'Blue'
    }
  })
});
const { success, data } = await response.json();
```

### Example 3: Get donation product for campaign

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/stripe-products?action=getDonationProductForCampaign&campaignId=campaign-uuid`, {
  headers: {
    Authorization: `Bearer ${supabaseAccessToken}`
  }
});
const { success, data } = await response.json();
```

## Database Schema

This function expects the following tables to be present in your Supabase database:

### Products Table
```sql
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  stripe_product_id text not null,
  name text not null,
  description text,
  campaign_id uuid references public.campaigns(id),
  active boolean default true,
  metadata jsonb,
  created_at timestamp with time zone default now()
);
```

### Prices Table
```sql
create table public.prices (
  id uuid primary key default uuid_generate_v4(),
  stripe_price_id text not null,
  product_id uuid references public.products(id) on delete cascade,
  unit_amount integer not null,
  currency text not null,
  recurring_interval text,
  recurring_interval_count integer,
  metadata jsonb,
  created_at timestamp with time zone default now()
);
```

## Environment Variables Required

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin access to Supabase
- `STRIPE_SECRET_KEY`: Your Stripe secret key

## Development and Testing

1. Deploy the function to your Supabase project:
   ```bash
   supabase functions deploy stripe-products
   ```

2. Set the required secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   ```

3. Test the function using Playwright:
   ```bash
   # See the e2e/tests/stripe-products directory for test examples
   npx playwright test e2e/tests/stripe-products
   ```

## Security Considerations

- All write operations are restricted to authenticated users with admin or campaign_owner roles
- Stripe secret key is securely stored as an environment variable in Supabase
- Authentication is handled via Supabase Auth
- The function uses cors headers to allow cross-origin requests from your frontend
