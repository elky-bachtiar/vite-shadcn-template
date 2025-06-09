import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: { name: 'Shop2Give', version: '1.0.0' },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

async function logWebhookEvent(event: any, status: 'success' | 'error', error?: string) {
  try {
    await supabase.from('webhook_logs').insert({
      event_type: event.type,
      event_id: event.id,
      status,
      error_message: error,
      timestamp: new Date().toISOString(),
    });
  } catch (logError) {
    console.error('Failed to log webhook event:', logError);
  }
}

async function processDonations(session: Stripe.Checkout.Session) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  for (const item of lineItems.data) {
    const metadata = item.price?.metadata || {};
    const campaignId = metadata.campaignId;
    if (!campaignId) continue;

    const donationPercentage = Number(metadata.donationPercentage) || 50;
    const donationAmount = Math.floor((item.amount_total || 0) * (donationPercentage / 100));

    if (donationAmount > 0) {
      await supabase.from('campaign_donations').insert({
        campaignId,
        amount: donationAmount,
        paymentStatus: 'completed',
        paymentMethod: 'stripe',
        isAnonymous: false,
        donorId: session.customer,
        donorEmail: session.customer_email,
      });

      // Update campaign total
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('current_amount')
        .eq('id', campaignId)
        .single();

      if (campaign) {
        await supabase
          .from('campaigns')
          .update({
            current_amount: (campaign.current_amount || 0) + donationAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaignId);
      }
    }
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);

    await logWebhookEvent(event, 'success');

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await processDonations(session);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    await logWebhookEvent(
      { type: 'error', id: 'processing_failed' },
      'error',
      error.message
    );
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});