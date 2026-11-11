import { createHash } from 'node:crypto';
import { orderSummary, parseBody, supabaseAdmin, telegram, telegramChat, type PaymentOrder, type Request, type Response } from './_lib/payoneer.js';

type Item = { id: string; kind: string; name: string; identifier?: string; unit_price?: number | null };
type Input = {
	requestKey?: unknown; type?: unknown; customerName?: unknown; customerEmail?: unknown;
	items?: unknown; amount?: unknown; preference?: unknown; customer?: unknown;
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: Request, res: Response) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
	try {
		const body = parseBody(req.body) as Input;
		if (!body || typeof body.requestKey !== 'string' || !uuid.test(body.requestKey) ||
			(body.type !== 'order' && body.type !== 'topup') ||
			(body.preference !== 'card' && body.preference !== 'bank')) {
			return res.status(400).json({ error: 'Invalid request details' });
		}
		const admin = supabaseAdmin();
		const authorization = req.headers.authorization;
		let userId: string | null = null;
		let accountEmail: string | undefined;
		if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
			const { data, error } = await admin.auth.getUser(authorization.slice(7));
			if (error || !data.user) return res.status(401).json({ error: 'Invalid session' });
			userId = data.user.id;
			accountEmail = data.user.email;
		}
		if (body.type === 'topup' && !userId) return res.status(401).json({ error: 'Sign in to request a top-up' });
		const name = typeof body.customerName === 'string' ? body.customerName.trim() : '';
		const customerEmail = body.type === 'topup' ? accountEmail ?? '' :
			typeof body.customerEmail === 'string' ? body.customerEmail.trim() : '';
		if (!name || name.length > 150 || customerEmail.length > 254 || !email.test(customerEmail)) {
			return res.status(400).json({ error: 'Valid customer name and email are required' });
		}
		let amount: number | null = null;
		let items: Item[] = [];
		let description = 'Wallet top-up';
		if (body.type === 'topup') {
			if (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 1 ||
				body.amount > 10000 || Number(body.amount.toFixed(2)) !== body.amount) {
				return res.status(400).json({ error: 'Invalid top-up amount' });
			}
			amount = body.amount;
		} else {
			if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) return res.status(400).json({ error: 'Invalid cart' });
			for (const item of body.items) {
				if (!item || typeof item.id !== 'string' || item.id.length > 150 || typeof item.kind !== 'string' ||
					!['devices', 'repairs', 'credits', 'wholesale'].includes(item.kind) ||
					typeof item.name !== 'string' || !item.name.trim() || item.name.length > 200 ||
					(item.identifier !== undefined && (typeof item.identifier !== 'string' || item.identifier.length > 300))) {
					return res.status(400).json({ error: 'Invalid cart item' });
				}
				items.push({ id: item.id, kind: item.kind, name: item.name.trim(), identifier: item.identifier });
			}
			description = items.map((item) => `${item.name}${item.identifier ? ` (${item.identifier})` : ''}`).join('\n');
			if (description.length > 3000) return res.status(400).json({ error: 'Order description is too long' });
			const { data: prices, error } = await admin.from('wallet_catalog_prices').select('id,kind,price').in('id', items.map((item) => item.id)).eq('active', true);
			if (error) throw error;
			const priceMap = new Map((prices ?? []).map((price) => [`${price.kind}:${price.id}`, Number(price.price)]));
			items = items.map((item) => ({ ...item, unit_price: priceMap.get(`${item.kind}:${item.id}`) ?? null }));
			if (items.every((item) => priceMap.has(`${item.kind}:${item.id}`))) {
				amount = items.reduce((sum, item) => sum + (priceMap.get(`${item.kind}:${item.id}`) ?? 0), 0);
				if (!Number.isFinite(amount) || amount <= 0) amount = null;
			}
		}
		const customer: Record<string, string> = { full_name: name, email: customerEmail };
		if (body.customer && typeof body.customer === 'object' && !Array.isArray(body.customer)) {
			for (const key of ['phone', 'address', 'country', 'state_region', 'postal_code', 'device_model']) {
				const value = (body.customer as Record<string, unknown>)[key];
				if (typeof value !== 'string' || value.length > 300) return res.status(400).json({ error: `Invalid customer ${key}` });
				customer[key] = value.trim();
			}
		}
		const hash = createHash('sha256').update(JSON.stringify({
			userId, customer, items: items.map((item) => ({
				id: item.id, kind: item.kind, name: item.name, identifier: item.identifier,
			})),
			amount: body.type === 'topup' ? amount : null, preference: body.preference, type: body.type,
		})).digest('hex');
		const { data, error } = await admin.rpc('create_payoneer_request', {
			p_request_key: body.requestKey, p_request_hash: hash, p_user_id: userId, p_name: name,
			p_email: customerEmail, p_description: description, p_customer: customer, p_items: items, p_amount: amount,
			p_preference: body.preference, p_type: body.type,
		});
		if (error) throw error;
		const order = data as PaymentOrder;
		let notified = order.status !== 'Pending Approval' || (data as { notification_status?: string }).notification_status === 'sent';
		if (!notified) {
			const { data: claim, error: claimError } = await admin.from('payoneer_orders')
				.update({ notification_status: 'sending' }).eq('id', order.id)
				.eq('status', 'Pending Approval').in('notification_status', ['pending', 'failed']).select('id').maybeSingle();
			if (claimError) console.error('Could not claim Payoneer notification:', claimError);
			if (claim) {
				try {
					await telegram('sendMessage', {
						chat_id: telegramChat(), text: `Payoneer request\n\n${orderSummary(order)}`,
						reply_markup: { inline_keyboard: [[
							{ text: 'Approve', callback_data: `pa:${order.id}` },
							{ text: 'Reject', callback_data: `pr:${order.id}` },
						]] },
					});
					notified = true;
				} catch (notificationError) {
					console.error('Payoneer request notification failed:', notificationError);
				}
				const { error: saveError } = await admin.from('payoneer_orders')
					.update({ notification_status: notified ? 'sent' : 'failed' }).eq('id', order.id).eq('notification_status', 'sending');
				if (saveError) console.error('Could not record Payoneer notification status:', saveError);
			}
		}
		return res.status(200).json({ id: order.id, status: order.status, notified });
	} catch (error) {
		console.error('Payoneer request failed:', error);
		return res.status(500).json({ error: 'Could not create the Payoneer request. Retry with the same request reference.' });
	}
}
