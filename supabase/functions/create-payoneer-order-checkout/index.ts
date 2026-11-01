import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return json({ error: 'Authentication required.' }, 401);
    const url = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiBase = Deno.env.get('PAYONEER_API_BASE');
    const apiUser = Deno.env.get('PAYONEER_API_USER');
    const apiToken = Deno.env.get('PAYONEER_API_TOKEN');
    const webhookSecret = Deno.env.get('PAYONEER_WEBHOOK_SECRET');
    const origin = Deno.env.get('APP_ORIGIN');
    if (!url || !anonKey || !serviceKey || !apiBase || !apiUser || !apiToken || !webhookSecret || !origin) {
      return json({ error: 'Payoneer checkout is not configured.' }, 503);
    }

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: 'Your session is invalid. Sign in again.' }, 401);

    const body = await request.json();
    if (typeof body.orderId !== 'string') return json({ error: 'Order ID is required.' }, 400);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: order, error: orderError } = await admin.from('wallet_orders')
      .select('id,user_id,total,currency,payment_method,status,customer')
      .eq('id', body.orderId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.payment_method !== 'payoneer') return json({ error: 'Payoneer order request was not found.' }, 404);
    if (order.status !== 'requested' || order.total === null || Number(order.total) <= 0) {
      return json({ error: 'This order contains items without confirmed prices. Request a quote before paying with Payoneer.' }, 409);
    }

    const returnUrl = new URL('/', origin);
    returnUrl.searchParams.set('payoneer_order', order.id);
    const cancelUrl = new URL('/', origin);
    cancelUrl.searchParams.set('payoneer_order_cancelled', order.id);
    const notificationUrl = new URL(`${url}/functions/v1/payoneer-notification`);
    notificationUrl.searchParams.set('secret', webhookSecret);

    const customer = (order.customer ?? {}) as Record<string, string>;
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    let countryCode = 'JM';
    outer: for (let a = 65; a <= 90; a += 1) {
      for (let b = 65; b <= 90; b += 1) {
        const code = String.fromCharCode(a, b);
        if (regionNames.of(code) === customer.country) { countryCode = code; break outer; }
      }
    }
    const payoneerResponse = await fetch(`${apiBase}/api/lists`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${apiUser}:${apiToken}`)}`,
        'Content-Type': 'application/vnd.optile.payment.enterprise-v1-extensible+json',
        Accept: 'application/vnd.optile.payment.enterprise-v1-extensible+json',
      },
      body: JSON.stringify({
        transactionId: order.id,
        country: countryCode,
        customer: {
          number: user.id,
          email: customer.email || user.email,
        },
        payment: {
          amount: Number(Number(order.total).toFixed(2)),
          currency: order.currency,
          reference: `Exclusive Mobile Solutions order ${order.id.slice(0, 8)}`,
        },
        callback: {
          returnUrl: returnUrl.toString(),
          cancelUrl: cancelUrl.toString(),
          notificationUrl: notificationUrl.toString(),
        },
      }),
    });
    if (!payoneerResponse.ok) throw new Error(`Payoneer session creation failed (${payoneerResponse.status}).`);
    const session = await payoneerResponse.json();
    const redirectUrl = session.redirect?.url;
    const listId = session.identification?.longId;
    if (typeof redirectUrl !== 'string' || typeof listId !== 'string') {
      throw new Error('Payoneer did not return a checkout URL.');
    }

    const { data: updatedOrder, error: updateError } = await admin.from('wallet_orders')
      .update({ status: 'pending', payoneer_list_id: listId })
      .eq('id', order.id)
      .eq('user_id', user.id)
      .eq('status', 'requested')
      .select('id')
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updatedOrder) return json({ error: 'The order is no longer available for Payoneer checkout.' }, 409);
    return json({ approvalUrl: redirectUrl });
  } catch (error) {
    console.error('create-payoneer-order-checkout failed:', error);
    return json({ error: 'Could not start Payoneer checkout. Please retry or contact support.' }, 500);
  }
});
