declare const process: { env: Record<string, string | undefined> };

export const config = { runtime: 'edge' };

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

const sendTelegramMessage = async (botToken: string, chatId: string, text: string) => {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error('Telegram sendMessage failed.');
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const authorization = request.headers.get('Authorization');
  if (!supabaseUrl || !anonKey || !botToken || !adminChatId || !authorization?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Not configured or unauthorized' }, 401);
  }

  try {
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: authorization },
    });
    if (!authResponse.ok) return jsonResponse({ error: 'Unauthorized' }, 401);
    const user = await authResponse.json();
    const body = await request.json();
    let text: string;

    if (body.type === 'registration') {
      text = [
        'New account registration',
        `Email: ${user.email ?? 'N/A'}`,
        `Full name: ${user.user_metadata?.full_name || 'N/A'}`,
        `Username: ${user.user_metadata?.username || 'N/A'}`,
      ].join('\n');
    } else if (body.type === 'topup' && typeof body.topupId === 'string') {
      const topupsUrl = new URL('/rest/v1/wallet_topups', supabaseUrl);
      topupsUrl.searchParams.set('select', 'id,amount,currency,method,status');
      topupsUrl.searchParams.set('id', `eq.${body.topupId}`);
      topupsUrl.searchParams.set('user_id', `eq.${user.id}`);
      const topupResponse = await fetch(topupsUrl, {
        headers: { apikey: anonKey, Authorization: authorization },
      });
      if (!topupResponse.ok) throw new Error('Could not verify the top-up.');
      const topups = await topupResponse.json();
      const topup = topups[0];
      if (!topup) return jsonResponse({ error: 'Top-up not found' }, 404);

      text = [
        'New deposit request',
        `Amount: ${topup.amount} ${topup.currency}`,
        `Method: ${topup.method}`,
        `Status: ${topup.status}`,
      ].join('\n');
    } else {
      return jsonResponse({ error: 'Invalid alert type' }, 400);
    }

    await sendTelegramMessage(botToken, adminChatId, text);
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Telegram alert failed:', error);
    return jsonResponse({ error: 'Telegram alert failed' }, 500);
  }
}