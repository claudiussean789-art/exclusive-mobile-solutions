import { getSupabase } from '../lib/supabase';

type TelegramAlert =
  | { type: 'registration' }
  | { type: 'topup'; topupId: string };

export async function sendTelegramAlert(alert: TelegramAlert): Promise<void> {
  try {
    const { data: { session }, error: sessionError } = await getSupabase().auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) return;

    const response = await fetch('/api/telegram-alert', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    });
    if (!response.ok) console.error('Telegram alert failed:', response.status);
  } catch (err) {
    console.error('Failed to send Telegram alert:', err);
  }
}