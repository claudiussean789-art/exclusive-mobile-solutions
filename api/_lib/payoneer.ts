import { createClient } from '@supabase/supabase-js';

export type Request = {
	method?: string;
	body?: unknown;
	headers: Record<string, string | string[] | undefined>;
};
export type Response = { status: (code: number) => Response; json: (body: unknown) => void };
export type PaymentOrder = {
	id: string;
	customer_name: string;
	customer_email: string;
	description: string;
	amount: number | null;
	currency: string;
	status: string;
	payment_url: string | null;
	email_status: string;
	request_type: string;
	payment_preference: string;
};

export const supabaseAdmin = () => {
	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) throw new Error('Supabase server configuration is missing');
	return createClient(url, key, { auth: { persistSession: false } });
};

export async function telegram(method: string, payload: object) {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	if (!token) throw new Error('Telegram bot token is not configured');
	const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const result = await response.json() as { ok?: boolean; description?: string };
	if (!response.ok || !result.ok) throw new Error(`Telegram ${method} failed: ${result.description ?? response.status}`);
}

export const telegramChat = () => {
	const id = process.env.TELEGRAM_CHAT_ID;
	if (!id) throw new Error('Telegram chat is not configured');
	return id;
};

export function approvedPayoneerUrl(value: string): string | null {
	try {
		const url = new URL(value);
		const host = url.hostname.toLowerCase();
		if (url.protocol !== 'https:' || url.username || url.password || url.port ||
			!['payoneer.com', 'payoneer.me'].some((domain) => host === domain || host.endsWith(`.${domain}`))) return null;
		return url.toString();
	} catch {
		return null;
	}
}

export function orderSummary(order: PaymentOrder) {
	return [
		`Order: ${order.id}`,
		`Request: ${order.request_type === 'topup' ? 'Wallet top-up' : 'Order'}`,
		`Customer: ${order.customer_name}`,
		`Email: ${order.customer_email}`,
		`Description: ${order.description}`,
		`Amount: ${order.amount === null ? 'Requires quote' : `${Number(order.amount).toFixed(2)} ${order.currency}`}`,
		`Payment preference: ${order.payment_preference === 'bank' ? 'Bank transfer' : 'Card'}`,
		`Status: ${order.status}`,
	].join('\n');
}

export function parseBody(body: unknown): unknown {
	if (typeof body !== 'string') return body;
	return JSON.parse(body);
}
