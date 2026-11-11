create table public.payoneer_orders (
  id uuid primary key default gen_random_uuid(),
  request_key uuid not null unique,
  request_hash text not null,
  user_id uuid references auth.users(id),
  wallet_topup_id uuid unique references public.wallet_topups(id),
  wallet_order_id uuid unique references public.wallet_orders(id),
  customer_name text not null check (length(customer_name) between 1 and 150),
  customer_email text not null check (length(customer_email) between 3 and 254),
  description text not null check (length(description) between 1 and 3000),
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  amount numeric(12,2) check (amount > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  payment_preference text not null check (payment_preference in ('card', 'bank')),
  request_type text not null check (request_type in ('order', 'topup')),
  status text not null default 'Pending Approval'
    check (status in ('Pending Approval', 'Approved', 'Awaiting Payment Link', 'Link Sent', 'Paid', 'Rejected')),
  payment_method text check (payment_method in ('request', 'link')),
  payment_url text,
  email_status text not null default 'not_sent'
    check (email_status in ('not_sent', 'sending', 'sent', 'failed', 'uncertain')),
  email_id text,
  email_error text,
  email_sent_at timestamptz,
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sending', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payoneer_orders enable row level security;
revoke all on public.payoneer_orders from public, anon, authenticated;
grant select on public.payoneer_orders to authenticated;
create policy "Customers can view their own Payoneer requests"
  on public.payoneer_orders for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.create_payoneer_request(
  p_request_key uuid, p_request_hash text, p_user_id uuid, p_name text,
  p_email text, p_description text, p_customer jsonb, p_items jsonb, p_amount numeric,
  p_preference text, p_type text
)
returns public.payoneer_orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.payoneer_orders;
  v_topup_id uuid;
  v_wallet_order_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_request_key::text, 0));
  select * into v_order from public.payoneer_orders where request_key = p_request_key;
  if found then
    if v_order.request_hash <> p_request_hash then
      raise exception 'Request key was already used for a different request';
    end if;
    return v_order;
  end if;
  if p_type = 'topup' then
    if p_user_id is null or p_amount is null or p_amount < 1 or p_amount > 10000 then
      raise exception 'Invalid wallet top-up';
    end if;
    insert into public.wallet_topups (user_id, amount, method)
      values (p_user_id, p_amount, 'payoneer') returning id into v_topup_id;
  elsif p_type = 'order' and p_user_id is not null then
    insert into public.wallet_orders (user_id, items, customer, total, currency, payment_method, status)
      values (p_user_id, p_items, p_customer, p_amount, 'USD', 'payoneer', 'requested')
      returning id into v_wallet_order_id;
  end if;
  insert into public.payoneer_orders
    (request_key, request_hash, user_id, wallet_topup_id, wallet_order_id, customer_name, customer_email,
     description, customer, items, amount, payment_preference, request_type)
  values
    (p_request_key, p_request_hash, p_user_id, v_topup_id, v_wallet_order_id, p_name, p_email,
     p_description, p_customer, p_items, p_amount, p_preference, p_type)
  returning * into v_order;
  return v_order;
end;
$$;
revoke all on function public.create_payoneer_request(uuid, text, uuid, text, text, text, jsonb, jsonb, numeric, text, text) from public, anon, authenticated;
grant execute on function public.create_payoneer_request(uuid, text, uuid, text, text, text, jsonb, jsonb, numeric, text, text) to service_role;

create or replace function public.reject_payoneer_request(p_id uuid)
returns public.payoneer_orders language plpgsql security definer set search_path = ''
as $$
declare v_order public.payoneer_orders;
begin
  update public.payoneer_orders set status = 'Rejected', updated_at = now()
  where id = p_id and status = 'Pending Approval' returning * into v_order;
  if not found then return null; end if;
  if v_order.wallet_order_id is not null then
    update public.wallet_orders set status = 'cancelled'
      where id = v_order.wallet_order_id and status = 'requested';
  end if;
  if v_order.wallet_topup_id is not null then
    update public.wallet_topups set status = 'cancelled'
      where id = v_order.wallet_topup_id and status = 'pending';
  end if;
  return v_order;
end;
$$;
revoke all on function public.reject_payoneer_request(uuid) from public, anon, authenticated;
grant execute on function public.reject_payoneer_request(uuid) to service_role;

create or replace function public.quote_payoneer_request(p_id uuid, p_amount numeric)
returns public.payoneer_orders language plpgsql security definer set search_path = ''
as $$
declare v_order public.payoneer_orders;
begin
  if p_amount is null or p_amount < 0.01 or p_amount > 10000 or p_amount <> round(p_amount, 2) then
    raise exception 'Invalid quote';
  end if;
  update public.payoneer_orders set amount = p_amount, updated_at = now()
  where id = p_id and status = 'Approved' and request_type = 'order' and amount is null
  returning * into v_order;
  if not found then return null; end if;
  if v_order.wallet_order_id is not null then
    update public.wallet_orders set total = p_amount
      where id = v_order.wallet_order_id and status = 'requested';
  end if;
  return v_order;
end;
$$;
revoke all on function public.quote_payoneer_request(uuid, numeric) from public, anon, authenticated;
grant execute on function public.quote_payoneer_request(uuid, numeric) to service_role;
