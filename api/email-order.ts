type Req = { method?: string; body?: unknown };
type Res = { status: (code: number) => Res; json: (body: unknown) => void };

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req: Req, res: Res) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.RESEND_FROM;
	if (!apiKey || !from) return res.status(500).json({ error: 'Email is not configured' });

	const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) as { to?: unknown; text?: unknown } | undefined;
	const to = typeof body?.to === 'string' ? body.to.trim() : '';
	const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 5000).replace(/\*/g, '') : '';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || !text) return res.status(400).json({ error: 'Invalid request' });

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
		body: JSON.stringify({
			from,
			to: [to],
			subject: 'Your Exclusive Mobile Solutions order',
			text: `Thank you for your order! Here are your order details:\n\n${text}\n\nWe will contact you shortly. For support, reach us on WhatsApp.`,
			html: `<p>Thank you for your order! Here are your order details:</p><pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(text)}</pre><p>We will contact you shortly. For support, reach us on WhatsApp.</p>`,
		}),
	});
	return res.status(response.ok ? 200 : 502).json({ ok: response.ok });
}
