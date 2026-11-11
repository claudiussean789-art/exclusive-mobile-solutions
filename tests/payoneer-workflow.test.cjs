const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const Module = require('node:module');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
function loadHandler(file) {
	const result = buildSync({
		entryPoints: [path.join(root, 'api', file)], bundle: true, platform: 'node', format: 'cjs',
		write: false, alias: { '@supabase/supabase-js': path.join(__dirname, 'payoneer-supabase-mock.cjs') },
	});
	const mod = new Module(path.join(root, 'api', file), module);
	mod.filename = path.join(root, 'api', file);
	mod.paths = module.paths;
	mod._compile(result.outputFiles[0].text, mod.filename);
	return mod.exports.default;
}

test('Payoneer request approval, quote, link and duplicate email guard', async () => {
	process.env.SUPABASE_URL = 'https://supabase.invalid';
	process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
	process.env.TELEGRAM_BOT_TOKEN = 'test-token';
	process.env.TELEGRAM_CHAT_ID = '-123';
	process.env.TELEGRAM_ADMIN_USER_ID = '456';
	process.env.TELEGRAM_WEBHOOK_SECRET = 'test-secret';
	process.env.RESEND_API_KEY = 'test-key';
	process.env.RESEND_FROM = 'EMS <test@example.com>';
	const state = { orders: [], messages: [], emails: [], failEmail: false, emailError: null };
	const originalFetch = global.fetch;
	global.fetch = async (url, options) => {
		if (String(url).startsWith('https://api.telegram.org/')) {
			const body = JSON.parse(options.body);
			state.messages.push(body);
			return Response.json({ ok: true, result: {} });
		}
		if (url === 'https://api.resend.com/emails') {
			state.emails.push({ body: JSON.parse(options.body), headers: options.headers });
			if (state.failEmail) throw new Error('simulated network failure');
			if (state.emailError) return Response.json(state.emailError, { status: 400 });
			return Response.json({ id: 'email-1' });
		}
		throw new Error(`Unexpected network access: ${url}`);
	};
	class Query {
		constructor(table) { this.table = table; this.filters = []; this.patch = null; }
		select() { return this; }
		update(patch) { this.patch = patch; return this; }
		eq(key, value) { this.filters.push((row) => row[key] === value); return this; }
		is(key, value) { return this.eq(key, value); }
		in(key, values) { this.filters.push((row) => values.includes(row[key])); return this; }
		order() { return this; }
		limit() { return this; }
		run(single) {
			const rows = (this.table === 'wallet_catalog_prices' ? [] : state.orders)
				.filter((row) => this.filters.every((filter) => filter(row)));
			if (this.patch) rows.forEach((row) => Object.assign(row, this.patch));
			return { data: single ? rows[0] ?? null : rows.map((row) => ({ ...row })), error: null };
		}
		maybeSingle() { return Promise.resolve(this.run(true)); }
		single() { return Promise.resolve(this.run(true)); }
		throwOnError() { return Promise.resolve(this.run(false)); }
		then(resolve, reject) { return Promise.resolve(this.run(false)).then(resolve, reject); }
	}
	global.__payoneerMockClient = {
		auth: { getUser: async () => ({ data: { user: null }, error: null }) },
		from: (table) => new Query(table),
		rpc: async (name, args) => {
			if (name === 'create_payoneer_request') {
				let order = state.orders.find((row) => row.request_key === args.p_request_key);
				if (order && order.request_hash !== args.p_request_hash) return { data: null, error: new Error('conflicting key') };
				if (!order) {
					order = {
						id: crypto.randomUUID(), request_key: args.p_request_key, request_hash: args.p_request_hash,
						customer_name: args.p_name, customer_email: args.p_email, description: args.p_description,
						amount: args.p_amount, currency: 'USD', request_type: args.p_type,
						payment_preference: args.p_preference, status: 'Pending Approval',
						payment_url: null, email_status: 'not_sent', notification_status: 'pending',
					};
					state.orders.push(order);
				}
				return { data: { ...order }, error: null };
			}
			if (name === 'quote_payoneer_request') {
				const order = state.orders.find((row) => row.id === args.p_id && row.status === 'Approved' && row.amount === null);
				if (order) order.amount = args.p_amount;
				return { data: order && { ...order }, error: null };
			}
			if (name === 'reject_payoneer_request') {
				const order = state.orders.find((row) => row.id === args.p_id && row.status === 'Pending Approval');
				if (order) order.status = 'Rejected';
				return { data: order && { ...order }, error: null };
			}
			throw new Error(`Unexpected RPC: ${name}`);
		},
	};
	const requestHandler = loadHandler('payoneer-request.ts');
	const webhookHandler = loadHandler('telegram-webhook.ts');
	async function call(handler, body, headers = {}) {
		const result = {};
		const response = { status(code) { result.status = code; return this; }, json(value) { result.body = value; } };
		await handler({ method: 'POST', headers, body }, response);
		return result;
	}
	const webhook = (body, secret = 'test-secret') => call(webhookHandler, body, { 'x-telegram-bot-api-secret-token': secret });
	const message = (text, id = 456) => ({ message: { from: { id }, chat: { id: -123 }, text } });
	const callback = (data, id = 456) => ({ callback_query: { id: 'cb', from: { id }, message: { chat: { id: -123 } }, data } });
	try {
		const body = { requestKey: crypto.randomUUID(), type: 'order', customerName: 'Customer', customerEmail: 'customer@example.com', preference: 'card', items: [{ id: 'custom', kind: 'credits', name: 'Custom service' }] };
		const first = await call(requestHandler, body);
		assert.equal(first.status, 200);
		const id = first.body.id;
		assert.equal(state.orders[0].amount, null);
		assert.equal((await call(requestHandler, body)).body.id, id);
		assert.equal(state.orders.length, 1);
		assert.equal(state.messages.length, 1);
		assert.equal((await webhook(callback(`pa:${id}`), 'wrong')).status, 401);
		await webhook(callback(`pa:${id}`, 999));
		assert.equal(state.orders[0].status, 'Pending Approval');
		await webhook(callback(`pa:${id}`));
		assert.equal(state.orders[0].status, 'Approved');
		await webhook(callback(`pml:${id}`));
		assert.equal(state.orders[0].status, 'Approved');
		await webhook(message(`/amount ${id} 25.00`));
		await webhook(callback(`pml:${id}`));
		assert.equal(state.orders[0].status, 'Awaiting Payment Link');
		await webhook(message(`/link ${id} https://payoneer.com.evil.example/pay`));
		assert.equal(state.orders[0].payment_url, null);
		await webhook(message(`/link ${id} https://payoneer.me/example`));
		const confirmation = state.messages.at(-1).reply_markup.inline_keyboard[0][0].callback_data;
		await Promise.all([webhook(callback(confirmation)), webhook(callback(confirmation))]);
		assert.equal(state.orders[0].status, 'Link Sent');
		assert.equal(state.orders[0].email_status, 'sent');
		assert.equal(state.emails.length, 1);
		assert.match(state.emails[0].body.text, /25\.00 USD/);
		assert.match(state.emails[0].body.text, /https:\/\/payoneer\.me\/example/);
		assert.equal(state.emails[0].headers['Idempotency-Key'], `payoneer-order-${id}`);

		const rejected = await call(requestHandler, { ...body, requestKey: crypto.randomUUID() });
		await webhook(callback(`pr:${rejected.body.id}`));
		assert.equal(state.orders[1].status, 'Rejected');
		await webhook(callback(`pa:${rejected.body.id}`));
		assert.equal(state.orders[1].status, 'Rejected');

		const uncertain = await call(requestHandler, { ...body, requestKey: crypto.randomUUID() });
		const uncertainId = uncertain.body.id;
		await webhook(callback(`pa:${uncertainId}`));
		await webhook(message(`/amount ${uncertainId} 10.00`));
		await webhook(callback(`pmr:${uncertainId}`));
		await webhook(message(`/link ${uncertainId} https://payoneer.com/pay`));
		const retryConfirmation = state.messages.at(-1).reply_markup.inline_keyboard[0][0].callback_data;
		state.failEmail = true;
		await webhook(callback(retryConfirmation));
		await webhook(callback(retryConfirmation));
		assert.equal(state.orders[2].status, 'Awaiting Payment Link');
		assert.equal(state.orders[2].email_status, 'uncertain');
		assert.equal(state.emails.length, 2);

		const topupBody = { requestKey: crypto.randomUUID(), type: 'topup', customerName: 'Customer', customerEmail: 'customer@example.com', preference: 'bank', amount: 25 };
		assert.equal((await call(requestHandler, topupBody)).status, 401);
		global.__payoneerMockClient.auth.getUser = async () => ({ data: { user: { id: 'user-1', email: 'account@example.com' } }, error: null });
		const topup = await call(requestHandler, topupBody, { authorization: 'Bearer session' });
		assert.equal(topup.status, 200);
		assert.equal(state.orders[3].customer_email, 'account@example.com');
		assert.equal(state.orders[3].amount, 25);
		assert.equal(state.orders[3].status, 'Pending Approval');
		assert.equal(state.emails.length, 2);

		state.failEmail = false;
		for (const [action, preference] of [['pc', 'card'], ['pb', 'bank']]) {
			const request = await call(requestHandler, { ...topupBody, requestKey: crypto.randomUUID() }, { authorization: 'Bearer test' });
			const requestId = request.body.id;
			await webhook(callback(`pa:${requestId}`));
			assert.deepEqual(state.messages.at(-1).reply_markup.inline_keyboard[0].map((button) => button.callback_data),
				[`pc:${requestId}`, `pb:${requestId}`]);
			await webhook(callback(`${action}:${requestId}`));
			const prompt = state.messages.at(-1);
			assert.equal(prompt.reply_markup.force_reply, true);
			assert.match(prompt.text, new RegExp(`^Payoneer link for ${requestId}`));
			await webhook({ message: { from: { id: 999 }, chat: { id: -123 }, text: 'https://payoneer.me/example', reply_to_message: { from: { is_bot: true }, text: prompt.text } } });
			assert.equal(state.orders.find((row) => row.id === requestId).payment_url, null);
			await webhook({ message: { from: { id: 456 }, chat: { id: -123 }, text: 'https://payoneer.com.evil.example/pay', reply_to_message: { from: { is_bot: true }, text: prompt.text } } });
			assert.equal(state.orders.find((row) => row.id === requestId).payment_url, null);
			await webhook({ message: { from: { id: 456 }, chat: { id: -123 }, text: 'https://payoneer.me/example', reply_to_message: { from: { is_bot: true }, text: prompt.text } } });
			const order = state.orders.find((row) => row.id === requestId);
			assert.equal(order.payment_preference, preference);
			assert.equal(order.email_status, 'not_sent');
			assert.equal(state.messages.at(-1).reply_markup.inline_keyboard[0][0].text, 'Confirm and send email');
			const confirm = state.messages.at(-1).reply_markup.inline_keyboard[0][0].callback_data;
			await webhook(callback(confirm));
			assert.equal(order.email_status, 'sent');
			assert.match(state.emails.at(-1).body.text, /https:\/\/payoneer\.me\/example/);
			assert.match(state.emails.at(-1).body.text, preference === 'card' ? /Visa \/ debit card/ : /Bank transfer/);
		}

		const failedRequest = await call(requestHandler, { ...topupBody, requestKey: crypto.randomUUID() }, { authorization: 'Bearer test' });
		const failedId = failedRequest.body.id;
		await webhook(callback(`pa:${failedId}`));
		await webhook(callback(`pc:${failedId}`));
		await webhook(message(`/link ${failedId} https://payoneer.me/example`));
		const failedConfirmation = state.messages.at(-1).reply_markup.inline_keyboard[0][0].callback_data;
		state.emailError = { message: 'API key is invalid: private-api-key customer@example.com' };
		const emailCount = state.emails.length;
		await webhook(callback(failedConfirmation));
		const failedOrder = state.orders.find((row) => row.id === failedId);
		assert.equal(failedOrder.email_status, 'failed');
		assert.match(failedOrder.email_error, /Check the Resend API key in Vercel/);
		assert.doesNotMatch(failedOrder.email_error, /private-api-key|customer@example.com/);
		assert.match(state.messages.at(-1).text, /Check the Resend API key in Vercel/);
		assert.doesNotMatch(state.messages.at(-1).text, /private-api-key|customer@example.com/);
		await webhook(callback(failedConfirmation));
		assert.equal(state.emails.length, emailCount + 1);
	} finally {
		global.fetch = originalFetch;
		delete global.__payoneerMockClient;
	}
});
