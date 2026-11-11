type Req = { method?: string; body?: unknown };
type Res = { status: (code: number) => Res; json: (body: unknown) => void };

export default async function handler(req: Req, res: Res) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

	const token = process.env.TELEGRAM_BOT_TOKEN;
	const chatId = process.env.TELEGRAM_CHAT_ID;
	if (!token || !chatId) return res.status(500).json({ error: 'Telegram is not configured' });

	const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) as { text?: unknown; type?: unknown } | undefined;
	const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 3800) : '';
	if (!text) return res.status(400).json({ error: 'Missing order text' });

	const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ chat_id: chatId, text: body?.type === 'alert' ? text : `🛒 New order\n\n${text.replace(/\*/g, '')}`, disable_web_page_preview: true }),
	});
	return res.status(response.ok ? 200 : 502).json({ ok: response.ok });
}
