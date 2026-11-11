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
    if (typeof body.topupId !== 'string') return json({ error: 'Top-up ID is required.' }, 400);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: topup, error: topupError } = await admin.from('wallet_topups')
      .select('id,user_id,amount,currency,method,status')
      .eq('id', body.topupId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (topupError) throw topupError;
    if (!topup || topup.method !== 'payoneer' || topup.status !== 'pending') {
      return json({ error: 'Pending Payoneer top-up was not found.' }, 404);
    }
    const { data: manualRequest, error: manualError } = await admin.from('payoneer_orders')
      .select('id').eq('wallet_topup_id', topup.id).maybeSingle();
    if (manualError) throw manualError;
    if (manualRequest) return json({ error: 'This top-up requires manual Payoneer approval.' }, 409);

    const returnUrl = new URL('/', origin);
    returnUrl.searchParams.set('payoneer_topup', topup.id);
    const cancelUrl = new URL('/', origin);
    cancelUrl.searchParams.set('payoneer_topup_cancelled', '1');
    const notificationUrl = new URL(`${url}/functions/v1/payoneer-notification`);
    notificationUrl.searchParams.set('secret', webhookSecret);
    const payoneerResponse = await fetch(`${apiBase}/api/lists`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${apiUser}:${apiToken}`)}`,
        'Content-Type': 'application/vnd.optile.payment.enterprise-v1-extensible+json',
        Accept: 'application/vnd.optile.payment.enterprise-v1-extensible+json',
      },
      body: JSON.stringify({
        transactionId: topup.id,
        country: 'JM',
        customer: { number: user.id, email: user.email },
        payment: {
          amount: Number(Number(topup.amount).toFixed(2)),
          currency: topup.currency,
          reference: `Exclusive Mobile Solutions wallet top-up ${topup.id.slice(0, 8)}`,
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

    const { data: updatedTopup, error: updateError } = await admin.from('wallet_topups')
      .update({ payoneer_list_id: listId })
      .eq('id', topup.id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updatedTopup) return json({ error: 'The top-up is no longer available for Payoneer checkout.' }, 409);
    return json({ approvalUrl: redirectUrl });
  } catch (error) {
    console.error('create-payoneer-topup-checkout failed:', error);
    return json({ error: 'Could not start Payoneer checkout. Please retry or contact support.' }, 500);
  }
});
