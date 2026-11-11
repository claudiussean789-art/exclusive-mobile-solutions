type OrderItem = { name?: string; unit_price?: number | string | null; identifier?: string | null };
type OrderCustomer = { full_name?: string; email?: string };
type EmailableOrder = {
  id: string;
  total: number | string | null;
  currency: string;
  payment_method: string;
  items: OrderItem[] | string | null;
  customer: OrderCustomer | string | null;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character] ?? character);

const parse = <T>(value: T | string | null): T | null => {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value) as T; } catch { return null; }
};

// Never throws: a failed email must not undo or fail a confirmed payment.
export async function sendOrderPaidEmail(order: EmailableOrder): Promise<void> {
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('PAYMENT_RECEIPT_FROM_EMAIL');
    const customer = parse<OrderCustomer>(order.customer);
    const to = customer?.email?.trim();
    if (!apiKey || !from || !to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return;

    const items = parse<OrderItem[]>(order.items) ?? [];
    const money = (value: number | string | null | undefined) => value === null || value === undefined
      ? 'Price to be confirmed'
      : new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(Number(value));
    const ref = order.id.slice(0, 8);
    const lines = items.map((item) => `${item.name ?? 'Item'} — ${money(item.unit_price)}${item.identifier ? ` (${item.identifier})` : ''}`);
    const name = customer?.full_name?.trim() || 'Customer';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `order-paid-${order.id}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Payment received — order ${ref}`,
        text: `Hello ${name},\n\nWe received your ${order.payment_method} payment. Your order ${ref} is now In process.\n\n${lines.join('\n')}\n\nTotal: ${money(order.total)}\n\nThank you for choosing Exclusive Mobile Solutions.`,
        html: `<p>Hello ${escapeHtml(name)},</p><p>We received your ${escapeHtml(order.payment_method)} payment. Your order <strong>${ref}</strong> is now <strong>In process</strong>.</p><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul><p>Total: <strong>${escapeHtml(money(order.total))}</strong></p><p>Thank you for choosing Exclusive Mobile Solutions.</p>`,
      }),
    });
    if (!response.ok) console.error('Order email failed:', response.status, await response.text());
  } catch (error) {
    console.error('Order email failed:', error);
  }
}
