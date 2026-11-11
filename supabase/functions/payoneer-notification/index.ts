import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendOrderPaidEmail } from '../_shared/order-email.ts';

const ok = () => new Response('ok', { status: 200 });

const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const webhookSecret = Deno.env.get('PAYONEER_WEBHOOK_SECRET');
    if (!url || !serviceKey || !webhookSecret) return new Response('Not configured', { status: 503 });

    const provided = new URL(request.url).searchParams.get('secret') ?? '';
    if (!safeEqual(provided, webhookSecret)) return new Response('Unauthorized', { status: 401 });

    const notification = await request.json();
    // Only a fully charged payment marks an order paid; other statuses are acknowledged and ignored.
    if (notification.statusCode !== 'charged') return ok();

    const orderId = notification.transactionId;
    const listId = notification.identification?.longId ?? notification.longId;
    const amount = notification.payment?.amount ?? notification.amount;
    const currency = notification.payment?.currency ?? notification.currency;
    if (typeof orderId !== 'string') return ok();

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: topup, error: topupError } = await admin.from('wallet_topups')
      .select('id,user_id,amount,currency,method,status,payoneer_list_id')
      .eq('id', orderId)
      .maybeSingle();
    if (topupError) throw topupError;
    if (topup?.method === 'payoneer') {
      if (topup.status === 'completed') return ok();
      if (topup.status === 'pending' && !topup.payoneer_list_id) {
        return new Response('Checkout session is still being recorded.', { status: 503 });
      }
      if (topup.status !== 'pending'
        || typeof listId !== 'string'
        || topup.payoneer_list_id !== listId
        || !Number.isFinite(Number(amount))
        || Number(amount).toFixed(2) !== Number(topup.amount).toFixed(2)
        || currency !== topup.currency) {
        console.error('payoneer-notification top-up mismatch for transaction', orderId);
        return ok();
      }

      const { error: creditError } = await admin.rpc('complete_wallet_topup', {
        p_topup_id: topup.id,
        p_payment_reference: `payoneer:${topup.payoneer_list_id}`,
      });
      if (creditError) throw creditError;
      return ok();
    }

    const { data: order, error: orderError } = await admin.from('wallet_orders')
      .select('id,total,currency,payment_method,status,payoneer_list_id,items,customer')
      .eq('id', orderId)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.payment_method !== 'payoneer' || order.status === 'paid') return ok();
    if (order.status === 'pending' && !order.payoneer_list_id) {
      return new Response('Checkout session is still being recorded.', { status: 503 });
    }

    if (order.status !== 'pending'
      || order.total === null
      || typeof listId !== 'string'
      || order.payoneer_list_id !== listId
      || Number(amount).toFixed(2) !== Number(order.total).toFixed(2)
      || currency !== order.currency) {
      console.error('payoneer-notification mismatch for order', orderId);
      return ok();
    }

    const { data: updated, error: updateError } = await admin.from('wallet_orders')
      .update({
        status: 'paid',
        payment_reference: `payoneer:${order.payoneer_list_id}`,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle();
    if (updateError) throw updateError;
    if (updated) await sendOrderPaidEmail(order);
    return ok();
  } catch (error) {
    console.error('payoneer-notification failed:', error);
    return new Response('Error', { status: 500 });
  }
});
