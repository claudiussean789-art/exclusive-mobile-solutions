import { supabase } from './supabase';

type PayoneerRequest = {
	type: 'order' | 'topup';
	customerName: string;
	customerEmail: string;
	preference: 'card' | 'bank';
	amount?: number;
	items?: { id: string; kind: string; name: string; identifier?: string }[];
	customer?: Record<string, string>;
};

const pendingKeys = new Map<string, { fingerprint: string; key: string }>();

export async function submitPayoneerRequest(request: PayoneerRequest) {
	const bytes = new TextEncoder().encode(JSON.stringify(request));
	const hash = await crypto.subtle.digest('SHA-256', bytes);
	const fingerprint = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
	const storageKey = `ems-payoneer-${request.type}`;
	let pending = pendingKeys.get(storageKey);
	try {
		const stored = sessionStorage.getItem(storageKey);
		if (stored) {
			const parsed: unknown = JSON.parse(stored);
			if (parsed && typeof parsed === 'object' && 'fingerprint' in parsed && 'key' in parsed &&
				typeof parsed.fingerprint === 'string' && typeof parsed.key === 'string') {
				pending = { fingerprint: parsed.fingerprint, key: parsed.key };
			}
		}
	} catch (error) {
		console.warn('Could not restore the pending Payoneer request key:', error);
	}
	if (!pending || pending.fingerprint !== fingerprint) pending = { fingerprint, key: crypto.randomUUID() };
	pendingKeys.set(storageKey, pending);
	try {
		sessionStorage.setItem(storageKey, JSON.stringify(pending));
	} catch (error) {
		console.warn('Could not persist the pending Payoneer request key:', error);
	}
	const { data: sessionData, error: sessionError } = supabase
		? await supabase.auth.getSession()
		: { data: { session: null }, error: null };
	if (sessionError) throw sessionError;
	const response = await fetch('/api/payoneer-request', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
		},
		body: JSON.stringify({ ...request, requestKey: pending.key }),
	});
	const result = await response.json() as { id?: string; notified?: boolean; error?: string };
	if (!response.ok || !result.id) throw new Error(result.error || 'Could not submit the Payoneer request.');
	pendingKeys.delete(storageKey);
	try {
		sessionStorage.removeItem(storageKey);
	} catch (error) {
		console.warn('Could not clear the pending Payoneer request key:', error);
	}
	return { id: result.id, notified: result.notified === true };
}
