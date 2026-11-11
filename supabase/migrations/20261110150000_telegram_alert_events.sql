create table if not exists public.telegram_alert_events (
  event_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.telegram_alert_events enable row level security;
revoke all on public.telegram_alert_events from anon, authenticated;