alter table public.wallet_orders
  add column if not exists payoneer_list_id text unique;
