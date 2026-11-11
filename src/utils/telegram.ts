export async function sendTelegramAlert(message: string): Promise<void> {
  try {
    const response = await fetch('/api/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'alert',
        text: message.replace(/<\/?b>/g, ''),
      }),
    });
    if (!response.ok) {
      console.error('Telegram alert failed:', response.status);
    }
  } catch (err) {
    console.error('Failed to send Telegram alert:', err);
  }
}