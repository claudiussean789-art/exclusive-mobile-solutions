
-- ===== 20261010220000_wallet_accounts.sql =====

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  credit_balance numeric(12, 2) not null default 0 check (credit_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_catalog_prices (
  id text primary key,
  kind text not null check (kind in ('devices', 'repairs')),
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 1 and amount <= 10000),
  currency text not null default 'USD' check (currency = 'USD'),
  method text not null check (method in ('paypal', 'manual')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  paypal_order_id text unique,
  payment_reference text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.wallet_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  items jsonb not null,
  customer jsonb not null,
  total numeric(12, 2),
  currency text not null default 'USD' check (currency = 'USD'),
  payment_method text not null check (payment_method in ('wallet', 'paypal', 'manual', 'local', 'payoneer')),
  status text not null check (status in ('paid', 'requested')),
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount <> 0),
  kind text not null check (kind in ('deposit', 'spend')),
  description text not null,
  topup_id uuid references public.wallet_topups (id),
  order_id uuid references public.wallet_orders (id),
  created_at timestamptz not null default now(),
  constraint wallet_transactions_single_reference check (
    (kind = 'deposit' and topup_id is not null and order_id is null and amount > 0)
    or (kind = 'spend' and order_id is not null and topup_id is null and amount < 0)
  )
);

create unique index if not exists wallet_transactions_topup_once
  on public.wallet_transactions (topup_id) where topup_id is not null;
create unique index if not exists wallet_transactions_order_once
  on public.wallet_transactions (order_id) where order_id is not null;
create index if not exists wallet_transactions_user_created
  on public.wallet_transactions (user_id, created_at desc);
create index if not exists wallet_orders_user_created
  on public.wallet_orders (user_id, created_at desc);
create index if not exists wallet_topups_user_created
  on public.wallet_topups (user_id, created_at desc);

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('ip-se-2', 'devices', 'iPhone SE 2', 30),
  ('ip-xs', 'devices', 'iPhone XS', 35),
  ('ip-xs-max', 'devices', 'iPhone XS Max', 40),
  ('ip-xr', 'devices', 'iPhone XR', 35),
  ('ip-13', 'devices', 'iPhone 13 - Grade A', 480),
  ('ip-14-pro', 'devices', 'iPhone 14 Pro', 650),
  ('ipad-mini-5', 'devices', 'iPad mini (5th Generation)', 30),
  ('ipad-air-3', 'devices', 'iPad Air (3rd Gen)', 38),
  ('ipad-8', 'devices', 'iPad (8th Generation)', 100),
  ('ipad-9', 'devices', 'iPad (9th Generation)', 100),
  ('ipad-standard', 'devices', 'iPad', 100),
  ('ipad-mini-6', 'devices', 'iPad mini (6th Generation)', 100),
  ('ipad-mini-7', 'devices', 'iPad mini (7th Generation)', 100),
  ('ipad-air-11', 'devices', 'iPad Air 11-inch', 100),
  ('ipad-air-13', 'devices', 'iPad Air 13-inch', 100),
  ('ipad-pro-11', 'devices', 'iPad Pro 11-inch', 100),
  ('ipad-pro-13', 'devices', 'iPad Pro 13-inch', 100),
  ('sam-s22', 'devices', 'Galaxy S22 Ultra', 550),
  ('jdm-a02', 'devices', 'Galaxy A02', 40),
  ('jdm-a02s', 'devices', 'Galaxy A02s', 40),
  ('jdm-a03-core', 'devices', 'Galaxy A03 Core', 40),
  ('jdm-a03', 'devices', 'Galaxy A03', 40),
  ('jdm-a03s', 'devices', 'Galaxy A03s', 40),
  ('jdm-a04e', 'devices', 'Galaxy A04e', 40),
  ('jdm-a04', 'devices', 'Galaxy A04', 40),
  ('jdm-a04s', 'devices', 'Galaxy A04s', 40),
  ('jdm-a05', 'devices', 'Galaxy A05', 40),
  ('jdm-a05s', 'devices', 'Galaxy A05s', 40),
  ('jdm-a06', 'devices', 'Galaxy A06', 40),
  ('jdm-a06-5g', 'devices', 'Galaxy A06 5G', 40),
  ('jdm-a07', 'devices', 'Galaxy A07', 40),
  ('jdm-a07-5g', 'devices', 'Galaxy A07 5G', 40),
  ('jdm-a10', 'devices', 'Galaxy A10', 40),
  ('jdm-a10s', 'devices', 'Galaxy A10s', 40),
  ('jdm-a11', 'devices', 'Galaxy A11', 40),
  ('jdm-a12', 'devices', 'Galaxy A12', 40),
  ('jdm-a12-nacho', 'devices', 'Galaxy A12 Nacho', 40),
  ('jdm-a13-4g', 'devices', 'Galaxy A13 4G', 40),
  ('jdm-a13-5g', 'devices', 'Galaxy A13 5G', 40),
  ('jdm-a14-4g', 'devices', 'Galaxy A14 4G', 40),
  ('jdm-a14-5g', 'devices', 'Galaxy A14 5G', 40),
  ('jdm-a15-4g', 'devices', 'Galaxy A15 4G', 40),
  ('jdm-a15-5g', 'devices', 'Galaxy A15 5G', 40),
  ('jdm-a16-4g', 'devices', 'Galaxy A16 4G', 40),
  ('jdm-a16-5g', 'devices', 'Galaxy A16 5G', 40),
  ('jdm-a17-4g', 'devices', 'Galaxy A17 4G', 40),
  ('jdm-a17-5g', 'devices', 'Galaxy A17 5G', 40),
  ('jdm-a20s', 'devices', 'Galaxy A20s', 40),
  ('jdm-a21s', 'devices', 'Galaxy A21s', 40),
  ('jdm-a22-4g', 'devices', 'Galaxy A22 4G', 40),
  ('jdm-a22-5g', 'devices', 'Galaxy A22 5G', 40),
  ('jdm-a23-4g', 'devices', 'Galaxy A23 4G', 40),
  ('jdm-a23-5g', 'devices', 'Galaxy A23 5G', 40),
  ('jdm-a24', 'devices', 'Galaxy A24', 40),
  ('jdm-a25', 'devices', 'Galaxy A25', 40),
  ('jdm-a30s', 'devices', 'Galaxy A30s', 40),
  ('jdm-a31', 'devices', 'Galaxy A31', 40),
  ('jdm-a32-4g', 'devices', 'Galaxy A32 4G', 40),
  ('jdm-a32-5g', 'devices', 'Galaxy A32 5G', 40),
  ('jdm-a33-5g', 'devices', 'Galaxy A33 5G', 40),
  ('jdm-a34-5g', 'devices', 'Galaxy A34 5G', 40),
  ('jdm-a35-5g', 'devices', 'Galaxy A35 5G', 40),
  ('jdm-a36-5g', 'devices', 'Galaxy A36 5G', 40),
  ('jdm-a50', 'devices', 'Galaxy A50', 40),
  ('jdm-a51', 'devices', 'Galaxy A51', 40),
  ('jdm-a52', 'devices', 'Galaxy A52', 40),
  ('jdm-a53-5g', 'devices', 'Galaxy A53 5G', 40),
  ('jdm-a54-5g', 'devices', 'Galaxy A54 5G', 40),
  ('tec-camon-20', 'devices', 'Tecno Camon 20 Pro', 220),
  ('tec-spark-10', 'devices', 'Tecno Spark 10 Pro', 160),
  ('xiaomi-redmi-12', 'devices', 'Xiaomi Redmi Note 12', 190),
  ('xiaomi-13-pro', 'devices', 'Xiaomi 13 Pro', 580),
  ('screen', 'repairs', 'Screen Replacement', 40),
  ('board', 'repairs', 'Board Repair / Micro-soldering', 65),
  ('software', 'repairs', 'Software Flash', 25),
  ('galaxy-a54-frp', 'repairs', 'Galaxy A54 5G FRP Service', 35),
  ('samsung-frp-other', 'repairs', 'Samsung Galaxy FRP Service (Other Models)', 35),
  ('port', 'repairs', 'Charging Port', 30),
  ('battery', 'repairs', 'Battery Replacement', 35)
on conflict (id) do update set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true, updated_at = now();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, ''), updated_at = now() where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row when (old.email is distinct from new.email)
execute procedure public.sync_profile_email();

create or replace function public.request_wallet_topup(p_amount numeric, p_method text)
returns public.wallet_topups
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_topup public.wallet_topups;
begin
  if v_user_id is null then raise exception 'Sign in to add wallet credit.'; end if;
  if p_amount is null or p_amount < 1 or p_amount > 10000 or p_amount <> round(p_amount, 2) then
    raise exception 'Enter an amount from $1.00 to $10,000.00.';
  end if;
  if p_method not in ('paypal', 'manual') then raise exception 'Unsupported top-up payment method.'; end if;
  insert into public.wallet_topups (user_id, amount, method)
  values (v_user_id, p_amount, p_method)
  returning * into v_topup;
  return v_topup;
end;
$$;

create or replace function public.create_wallet_order(p_items jsonb, p_customer jsonb)
returns public.wallet_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_catalog public.wallet_catalog_prices;
  v_total numeric(12, 2) := 0;
  v_items jsonb := '[]'::jsonb;
  v_order public.wallet_orders;
  v_balance numeric(12, 2);
begin
  if v_user_id is null then raise exception 'Sign in to pay with wallet credit.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty.'; end if;
  if jsonb_typeof(p_customer) <> 'object' then raise exception 'Customer information is required.'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if v_item ->> 'kind' not in ('devices', 'repairs') then
      raise exception 'Server credit items need a confirmed price before wallet checkout.';
    end if;
    select * into v_catalog from public.wallet_catalog_prices
    where id = v_item ->> 'id' and kind = v_item ->> 'kind' and active for share;
    if not found then raise exception 'An item has no confirmed wallet price. Remove it or contact support.'; end if;
    v_total := v_total + v_catalog.price;
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'id', v_catalog.id, 'kind', v_catalog.kind, 'name', v_catalog.name,
      'unit_price', v_catalog.price, 'identifier', nullif(btrim(v_item ->> 'identifier'), '')
    ));
  end loop;

  select credit_balance into v_balance from public.profiles where id = v_user_id for update;
  if not found then raise exception 'Wallet profile not found.'; end if;
  if v_balance < v_total then raise exception 'INSUFFICIENT_CREDIT: Add wallet credit before placing this order.'; end if;

  update public.profiles set credit_balance = credit_balance - v_total, updated_at = now() where id = v_user_id;
  insert into public.wallet_orders (user_id, items, customer, total, payment_method, status)
  values (v_user_id, v_items, p_customer, v_total, 'wallet', 'paid') returning * into v_order;
  insert into public.wallet_transactions (user_id, amount, kind, description, order_id)
  values (v_user_id, -v_total, 'spend', 'Wallet payment for order ' || left(v_order.id::text, 8), v_order.id);
  return v_order;
end;
$$;

create or replace function public.create_order_request(p_items jsonb, p_customer jsonb, p_payment_method text)
returns public.wallet_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_catalog public.wallet_catalog_prices;
  v_total numeric(12, 2) := 0;
  v_total_known boolean := true;
  v_items jsonb := '[]'::jsonb;
  v_order public.wallet_orders;
begin
  if v_user_id is null then raise exception 'Sign in to save an order.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty.'; end if;
  if jsonb_typeof(p_customer) <> 'object' then raise exception 'Customer information is required.'; end if;
  if p_payment_method not in ('paypal', 'manual', 'local', 'payoneer') then raise exception 'Unsupported order payment method.'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    select * into v_catalog from public.wallet_catalog_prices
    where id = v_item ->> 'id' and kind = v_item ->> 'kind' and active;
    if found then
      v_total := v_total + v_catalog.price;
      v_items := v_items || jsonb_build_array(jsonb_build_object('id', v_catalog.id, 'kind', v_catalog.kind, 'name', v_catalog.name, 'unit_price', v_catalog.price, 'identifier', nullif(btrim(v_item ->> 'identifier'), '')));
    else
      v_total_known := false;
      v_items := v_items || jsonb_build_array(jsonb_build_object('id', v_item ->> 'id', 'kind', v_item ->> 'kind', 'name', left(coalesce(v_item ->> 'name', 'Service item'), 200), 'unit_price', null, 'identifier', nullif(btrim(v_item ->> 'identifier'), '')));
    end if;
  end loop;

  insert into public.wallet_orders (user_id, items, customer, total, payment_method, status)
  values (v_user_id, v_items, p_customer, case when v_total_known then v_total else null end, p_payment_method, 'requested')
  returning * into v_order;
  return v_order;
end;
$$;

create or replace function public.complete_wallet_topup(p_topup_id uuid, p_payment_reference text)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_topup public.wallet_topups;
  v_balance numeric(12, 2);
  v_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
begin
  if v_role <> 'service_role' then raise exception 'Only the verified payment service can complete a top-up.'; end if;
  if p_payment_reference is null or length(btrim(p_payment_reference)) < 3 then raise exception 'A verified payment reference is required.'; end if;
  select * into v_topup from public.wallet_topups where id = p_topup_id for update;
  if not found then raise exception 'Wallet top-up was not found.'; end if;
  if v_topup.status = 'completed' then
    if v_topup.payment_reference <> p_payment_reference then raise exception 'Top-up was already completed with another reference.'; end if;
    select credit_balance into v_balance from public.profiles where id = v_topup.user_id;
    return v_balance;
  end if;
  if v_topup.status <> 'pending' then raise exception 'Wallet top-up is not pending.'; end if;

  update public.profiles set credit_balance = credit_balance + v_topup.amount, updated_at = now()
  where id = v_topup.user_id returning credit_balance into v_balance;
  if not found then raise exception 'Wallet profile not found.'; end if;
  update public.wallet_topups set status = 'completed', payment_reference = btrim(p_payment_reference), completed_at = now()
  where id = v_topup.id;
  insert into public.wallet_transactions (user_id, amount, kind, description, topup_id)
  values (v_topup.user_id, v_topup.amount, 'deposit', 'Wallet top-up via ' || upper(v_topup.method), v_topup.id);
  return v_balance;
end;
$$;

alter table public.profiles enable row level security;
alter table public.wallet_catalog_prices enable row level security;
alter table public.wallet_topups enable row level security;
alter table public.wallet_orders enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can update their own name" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Catalog prices are readable" on public.wallet_catalog_prices for select to authenticated using (active);
create policy "Users can read their own top-ups" on public.wallet_topups for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can read their own orders" on public.wallet_orders for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can read their own transactions" on public.wallet_transactions for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.profiles, public.wallet_catalog_prices, public.wallet_topups, public.wallet_orders, public.wallet_transactions from anon, authenticated;
grant select on public.profiles, public.wallet_catalog_prices, public.wallet_topups, public.wallet_orders, public.wallet_transactions to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant usage on schema public to authenticated;
revoke all on function public.request_wallet_topup(numeric, text) from public, anon;
revoke all on function public.create_wallet_order(jsonb, jsonb) from public, anon;
revoke all on function public.create_order_request(jsonb, jsonb, text) from public, anon;
revoke all on function public.complete_wallet_topup(uuid, text) from public, anon, authenticated;
grant execute on function public.request_wallet_topup(numeric, text) to authenticated;
grant execute on function public.create_wallet_order(jsonb, jsonb) to authenticated;
grant execute on function public.create_order_request(jsonb, jsonb, text) to authenticated;
grant execute on function public.complete_wallet_topup(uuid, text) to service_role;

-- ===== 20261011005500_add_wipay_checkout.sql =====

alter table public.wallet_orders
  drop constraint if exists wallet_orders_payment_method_check;

alter table public.wallet_orders
  add constraint wallet_orders_payment_method_check
  check (payment_method in ('wallet', 'paypal', 'manual', 'local', 'payoneer', 'wipay'));

create or replace function public.create_order_request(p_items jsonb, p_customer jsonb, p_payment_method text)
returns public.wallet_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_catalog public.wallet_catalog_prices;
  v_total numeric(12, 2) := 0;
  v_total_known boolean := true;
  v_items jsonb := '[]'::jsonb;
  v_order public.wallet_orders;
begin
  if v_user_id is null then raise exception 'Sign in to save an order.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty.'; end if;
  if jsonb_typeof(p_customer) <> 'object' then raise exception 'Customer information is required.'; end if;
  if p_payment_method not in ('paypal', 'manual', 'local', 'payoneer', 'wipay') then raise exception 'Unsupported order payment method.'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    select * into v_catalog from public.wallet_catalog_prices
    where id = v_item ->> 'id' and kind = v_item ->> 'kind' and active;
    if found then
      v_total := v_total + v_catalog.price;
      v_items := v_items || jsonb_build_array(jsonb_build_object('id', v_catalog.id, 'kind', v_catalog.kind, 'name', v_catalog.name, 'unit_price', v_catalog.price, 'identifier', nullif(btrim(v_item ->> 'identifier'), '')));
    else
      v_total_known := false;
      v_items := v_items || jsonb_build_array(jsonb_build_object('id', v_item ->> 'id', 'kind', v_item ->> 'kind', 'name', left(coalesce(v_item ->> 'name', 'Service item'), 200), 'unit_price', null, 'identifier', nullif(btrim(v_item ->> 'identifier'), '')));
    end if;
  end loop;

  insert into public.wallet_orders (user_id, items, customer, total, payment_method, status)
  values (v_user_id, v_items, p_customer, case when v_total_known then v_total else null end, p_payment_method, 'requested')
  returning * into v_order;
  return v_order;
end;
$$;


-- ===== 20261011010000_paypal_order_checkout.sql =====

alter table public.wallet_orders
  drop constraint if exists wallet_orders_status_check;

alter table public.wallet_orders
  add constraint wallet_orders_status_check
  check (status in ('paid', 'requested', 'pending', 'cancelled'));

alter table public.wallet_orders
  add column if not exists paypal_order_id text unique,
  add column if not exists payment_reference text,
  add column if not exists paid_at timestamptz;

alter table public.wallet_catalog_prices
  drop constraint if exists wallet_catalog_prices_kind_check;

alter table public.wallet_catalog_prices
  add constraint wallet_catalog_prices_kind_check
  check (kind in ('devices', 'repairs', 'wholesale'));

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('iphone-18-pro-max-unlock', 'wholesale', 'Apple iPhone 18 Pro Max - Official Factory Unlock', 34.99),
  ('iphone-18-pro-unlock', 'wholesale', 'Apple iPhone 18 Pro - Network & Carrier Unlock', 29.95),
  ('iphone-17-pro-max-unlock', 'wholesale', 'Apple iPhone 17 Pro Max - Premium Clean Unlock', 24.50),
  ('samsung-s26-ultra-unlock', 'wholesale', 'Samsung Galaxy S26 Ultra - Direct FRP & Network Unlock', 21),
  ('samsung-z-fold8-unlock', 'wholesale', 'Samsung Galaxy Z Fold8 & Z Fold8 Ultra Unlock', 38),
  ('iphone-duo-esim-unlock', 'wholesale', 'Apple iPhone Duo - Dual eSIM Unlock Service', 19.99),
  ('pixel-unbarring', 'wholesale', 'Google Pixel 8/9/10 Series - Direct Carrier Unbarring', 15),
  ('motorola-unlock-app', 'wholesale', 'Motorola Moto Edge / Razr - Code Unlock APP', 12.50),
  ('xiaomi-honor-unlock', 'wholesale', 'Xiaomi & Honor Account Removal & Network Unlock', 11),
  ('ipad-watch-fmi', 'wholesale', 'FMI OFF for iPad WiFi & iWatch GPS Removal', 28),
  ('att-nck-clean-pro', 'wholesale', 'USA AT&T NCK / Clean Pro iPhone & Samsung Unlock', 14.99),
  ('latin-america-carrier-unlock', 'wholesale', 'Mexico Nextel / Claro / Puerto Rico Carrier Service', 16.50)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261011013000_customer_registration_profile.sql =====

alter table public.profiles
  add column if not exists username text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists address text not null default '';

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username <> '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, username, phone, address)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    lower(coalesce(new.raw_user_meta_data ->> 'username', '')),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'address', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        username = excluded.username,
        phone = excluded.phone,
        address = excluded.address,
        updated_at = now();
  return new;
end;
$$;


-- ===== 20261011020000_manual_topup_receipts.sql =====

alter table public.wallet_topups
  add column if not exists customer_payment_reference text,
  add column if not exists receipt_path text,
  add column if not exists receipt_email_sent_at timestamptz;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wallet-payment-receipts',
  'wallet-payment-receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Customers can upload their own wallet receipts"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'wallet-payment-receipts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 1
);

create or replace function public.submit_manual_topup_receipt(
  p_topup_id uuid,
  p_receipt_path text,
  p_payment_reference text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Sign in to submit a payment receipt.'; end if;
  if p_payment_reference is null or length(btrim(p_payment_reference)) < 3
    or length(btrim(p_payment_reference)) > 200 then
    raise exception 'Enter a valid bank transfer reference.';
  end if;
  if p_receipt_path is null or p_receipt_path !~ (
    '^' || v_user_id::text || '/' || p_topup_id::text || '\.(jpg|png|webp|pdf)$'
  ) then
    raise exception 'The payment receipt file is invalid.';
  end if;

  update public.wallet_topups
  set receipt_path = p_receipt_path,
      customer_payment_reference = btrim(p_payment_reference)
  where id = p_topup_id
    and user_id = v_user_id
    and method = 'manual'
    and status = 'pending'
    and receipt_path is null
    and exists (
      select 1 from storage.objects
      where bucket_id = 'wallet-payment-receipts'
        and name = p_receipt_path
    );
  if not found then raise exception 'The pending top-up or uploaded receipt could not be found.'; end if;
end;
$$;

revoke all on function public.submit_manual_topup_receipt(uuid, text, text) from public, anon;
grant execute on function public.submit_manual_topup_receipt(uuid, text, text) to authenticated;


-- ===== 20261011103000_google_pixel_services.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('google-pixel-carrier-unlock-tool', 'wholesale', 'Google Pixel Carrier Unlock Windows Tool', 18.90),
  ('pixel-service-tool-refill-credits', 'wholesale', 'Pixel Service Tool - Refill Credits', 0.55),
  ('gpixel-pro-credits-new-user', 'wholesale', 'GPixel Pro Credits - New User', 0.90),
  ('gpixel-pro-credits-existing-user', 'wholesale', 'GPixel Pro Credits - Existing User', 0.90)
on conflict (id) do update
set kind = excluded.kind,
    name = excluded.name,
    price = excluded.price,
    active = true;


-- ===== 20261011110000_wallet_service_checkout.sql =====

alter table public.wallet_catalog_prices
  drop constraint if exists wallet_catalog_prices_kind_check;

alter table public.wallet_catalog_prices
  add constraint wallet_catalog_prices_kind_check
  check (kind in ('devices', 'repairs', 'wholesale', 'credits'));

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('eft-1-month', 'credits', 'EFT Tool - 1 Month Activation (30 Days)', 20.00),
  ('eft-3-months', 'credits', 'EFT Tool - 3 Months Activation (90 Days)', 18.00),
  ('eft-6-months', 'credits', 'EFT Tool - 6 Months Activation (180 Days)', 27.00),
  ('eft-12-months', 'credits', 'EFT Tool - 12 Months Activation (360 Days)', 45.00),
  ('unlock-3-months', 'credits', 'Unlock Tool - 3 Months Activation (90 Days)', 18.00),
  ('unlock-6-months', 'credits', 'Unlock Tool - 6 Months Activation (180 Days)', 27.00),
  ('unlock-12-months', 'credits', 'Unlock Tool - 12 Months Activation (360 Days)', 45.00),
  ('unlock-rent-6-hours', 'credits', 'Unlock Tool - Rent (6 Hours)', 1.20)
on conflict (id) do update
set kind = excluded.kind,
    name = excluded.name,
    price = excluded.price,
    active = true;

create or replace function public.create_wallet_order(p_items jsonb, p_customer jsonb)
returns public.wallet_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_catalog public.wallet_catalog_prices;
  v_total numeric(12, 2) := 0;
  v_items jsonb := '[]'::jsonb;
  v_order public.wallet_orders;
  v_balance numeric(12, 2);
begin
  if v_user_id is null then raise exception 'Sign in to pay with wallet credit.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty.'; end if;
  if jsonb_typeof(p_customer) <> 'object' then raise exception 'Customer information is required.'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if v_item ->> 'kind' not in ('devices', 'repairs', 'wholesale', 'credits') then
      raise exception 'This item cannot be paid for with wallet credit.';
    end if;
    select * into v_catalog from public.wallet_catalog_prices
    where id = v_item ->> 'id' and kind = v_item ->> 'kind' and active for share;
    if not found then raise exception 'An item has no confirmed wallet price. Remove it or contact support.'; end if;
    v_total := v_total + v_catalog.price;
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'id', v_catalog.id, 'kind', v_catalog.kind, 'name', v_catalog.name,
      'unit_price', v_catalog.price, 'identifier', nullif(btrim(v_item ->> 'identifier'), '')
    ));
  end loop;

  select credit_balance into v_balance from public.profiles where id = v_user_id for update;
  if not found then raise exception 'Wallet profile not found.'; end if;
  if v_balance < v_total then raise exception 'INSUFFICIENT_CREDIT: Add wallet credit before placing this order.'; end if;

  update public.profiles set credit_balance = credit_balance - v_total, updated_at = now() where id = v_user_id;
  insert into public.wallet_orders (user_id, items, customer, total, payment_method, status)
  values (v_user_id, v_items, p_customer, v_total, 'wallet', 'paid') returning * into v_order;
  insert into public.wallet_transactions (user_id, amount, kind, description, order_id)
  values (v_user_id, -v_total, 'spend', 'Wallet payment for order ' || left(v_order.id::text, 8), v_order.id);
  return v_order;
end;
$$;

revoke all on function public.create_wallet_order(jsonb, jsonb) from public, anon;
grant execute on function public.create_wallet_order(jsonb, jsonb) to authenticated;


-- ===== 20261011120000_crypto_order_verification.sql =====

alter table public.wallet_orders
  add column if not exists crypto_txid text;

alter table public.wallet_orders
  drop constraint if exists wallet_orders_status_check;

alter table public.wallet_orders
  add constraint wallet_orders_status_check
  check (status in ('paid', 'requested', 'pending', 'pending_verification', 'cancelled'));

alter table public.wallet_orders
  drop constraint if exists wallet_orders_payment_method_check;

alter table public.wallet_orders
  add constraint wallet_orders_payment_method_check
  check (payment_method in ('wallet', 'paypal', 'manual', 'local', 'payoneer', 'wipay', 'crypto'));

create or replace function public.set_wallet_order_paid_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    new.paid_at := coalesce(new.paid_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists wallet_order_set_paid_at on public.wallet_orders;
create trigger wallet_order_set_paid_at
before update of status on public.wallet_orders
for each row execute function public.set_wallet_order_paid_at();

create unique index if not exists wallet_orders_crypto_txid_unique
  on public.wallet_orders (crypto_txid)
  where crypto_txid is not null;

create or replace function public.submit_crypto_order(
  p_items jsonb,
  p_customer jsonb,
  p_txid text
)
returns public.wallet_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_catalog public.wallet_catalog_prices;
  v_total numeric(12, 2) := 0;
  v_items jsonb := '[]'::jsonb;
  v_order public.wallet_orders;
  v_txid text := btrim(p_txid);
begin
  if v_user_id is null then raise exception 'Sign in to submit a crypto payment for verification.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty.'; end if;
  if jsonb_typeof(p_customer) <> 'object' then raise exception 'Customer information is required.'; end if;
  if v_txid is null or length(v_txid) < 6 or length(v_txid) > 200 then
    raise exception 'Enter a valid transaction ID or Binance Pay ID (6–200 characters).';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if v_item ->> 'kind' not in ('devices', 'repairs', 'wholesale', 'credits') then
      raise exception 'This item is not available for crypto checkout.';
    end if;
    select * into v_catalog from public.wallet_catalog_prices
    where id = v_item ->> 'id' and kind = v_item ->> 'kind' and active;
    if not found then
      raise exception 'Every item needs a confirmed server price before crypto payment can be submitted.';
    end if;
    v_total := v_total + v_catalog.price;
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'id', v_catalog.id,
      'kind', v_catalog.kind,
      'name', v_catalog.name,
      'unit_price', v_catalog.price,
      'identifier', nullif(btrim(v_item ->> 'identifier'), '')
    ));
  end loop;

  insert into public.wallet_orders (
    user_id, items, customer, total, payment_method, status, payment_reference, crypto_txid
  )
  values (
    v_user_id, v_items, p_customer, v_total, 'crypto', 'pending_verification', 'crypto:' || v_txid, v_txid
  )
  returning * into v_order;
  return v_order;
end;
$$;

revoke all on function public.submit_crypto_order(jsonb, jsonb, text) from public, anon;
grant execute on function public.submit_crypto_order(jsonb, jsonb, text) to authenticated;


-- ===== 20261011130000_dft_pro_service_prices.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('dft-3-months', 'credits', 'DFT Pro - 3 Months Activation (90 Days)', 18.00),
  ('dft-6-months', 'credits', 'DFT Pro - 6 Months Activation (180 Days)', 27.00),
  ('dft-12-months', 'credits', 'DFT Pro - 12 Months Activation (360 Days)', 45.00),
  ('dft-rent-6-hours', 'credits', 'DFT Pro - Rent (6 Hours)', 1.20)
on conflict (id) do update
set kind = excluded.kind,
    name = excluded.name,
    price = excluded.price,
    active = true;


-- ===== 20261011140000_global_unlocker_credit_packages.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('global-unlocker-10-credits', 'credits', 'Global Unlocker Pro - 10 Credits', 15.00),
  ('global-unlocker-25-credits', 'credits', 'Global Unlocker Pro - 25 Credits', 30.00),
  ('global-unlocker-50-credits', 'credits', 'Global Unlocker Pro - 50 Credits', 57.00),
  ('global-unlocker-100-credits', 'credits', 'Global Unlocker Pro - 100 Credits', 112.00)
on conflict (id) do update
set kind = excluded.kind,
    name = excluded.name,
    price = excluded.price,
    active = true;


-- ===== 20261013100000_admin_order_fulfillment.sql =====

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.wallet_orders
  add column if not exists fulfillment_status text not null default 'pending';

alter table public.wallet_orders
  drop constraint if exists wallet_orders_fulfillment_status_check;

alter table public.wallet_orders
  add constraint wallet_orders_fulfillment_status_check
  check (fulfillment_status in ('pending', 'in_progress', 'completed', 'failed'));

update public.wallet_orders
set fulfillment_status = case
  when status in ('paid', 'in_progress') then 'in_progress'
  when status in ('completed') then 'completed'
  when status in ('cancelled', 'failed') then 'failed'
  else 'pending'
end
where fulfillment_status = 'pending';

create or replace function public.admin_list_orders()
returns setof public.wallet_orders
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Admin access required.';
  end if;
  return query
    select *
    from public.wallet_orders
    order by created_at desc;
end;
$$;

create or replace function public.admin_set_order_fulfillment_status(p_order_id uuid, p_status text)
returns public.wallet_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.wallet_orders;
begin
  if auth.uid() is null then
    raise exception 'Sign in required.';
  end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Admin access required.';
  end if;
  if p_status not in ('pending', 'in_progress', 'completed', 'failed') then
    raise exception 'Invalid status.';
  end if;

  update public.wallet_orders
  set fulfillment_status = p_status
  where id = p_order_id
  returning * into v_order;

  if not found then
    raise exception 'Order not found.';
  end if;

  return v_order;
end;
$$;

revoke all on function public.admin_list_orders() from public, anon;
revoke all on function public.admin_set_order_fulfillment_status(uuid, text) from public, anon;
grant execute on function public.admin_list_orders() to authenticated;
grant execute on function public.admin_set_order_fulfillment_status(uuid, text) to authenticated;


-- ===== 20261015220000_payoneer_order_checkout.sql =====

alter table public.wallet_orders
  add column if not exists payoneer_list_id text unique;


-- ===== 20261016200000_samsung_jdm_frp_prices.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price)
select
  'jdm-frp-' || trim(both '-' from lower(regexp_replace(model, '[^a-zA-Z0-9]+', '-', 'g'))),
  'repairs',
  'Samsung JDM FRP — ' || model,
  40
from unnest(array[
  'Galaxy A02', 'Galaxy A02s', 'Galaxy A03 Core', 'Galaxy A03', 'Galaxy A03s',
  'Galaxy A04e', 'Galaxy A04', 'Galaxy A04s', 'Galaxy A05', 'Galaxy A05s',
  'Galaxy A06', 'Galaxy A06 5G', 'Galaxy A07', 'Galaxy A07 5G',
  'Galaxy A10', 'Galaxy A10s', 'Galaxy A11', 'Galaxy A12', 'Galaxy A12 Nacho',
  'Galaxy A13 4G', 'Galaxy A13 5G', 'Galaxy A14 4G', 'Galaxy A14 5G',
  'Galaxy A15 4G', 'Galaxy A15 5G', 'Galaxy A16 4G', 'Galaxy A16 5G',
  'Galaxy A17 4G', 'Galaxy A17 5G', 'Galaxy A20s', 'Galaxy A21s',
  'Galaxy A22 4G', 'Galaxy A22 5G', 'Galaxy A23 4G', 'Galaxy A23 5G',
  'Galaxy A24', 'Galaxy A25', 'Galaxy A30s', 'Galaxy A31',
  'Galaxy A32 4G', 'Galaxy A32 5G', 'Galaxy A33 5G', 'Galaxy A34 5G',
  'Galaxy A35 5G', 'Galaxy A36 5G', 'Galaxy A50', 'Galaxy A51', 'Galaxy A52',
  'Galaxy A53 5G', 'Galaxy A54 5G'
]) as model
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261022180600_samsung_ultra_frp_prices.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price)
select
  'samsung-ultra-frp-' || trim(both '-' from lower(regexp_replace(model, '[^a-zA-Z0-9]+', '-', 'g'))),
  'repairs',
  'Samsung FRP — ' || model,
  90
from unnest(array[
  'Galaxy S22 Ultra',
  'Galaxy S23 Ultra',
  'Galaxy S24 Ultra',
  'Galaxy S25 Ultra',
  'Galaxy S26 Ultra'
]) as model
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101103000_samsung_usa_android16_frp_price.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('samsung-usa-android-16-frp-may-2026', 'repairs', 'Samsung USA Models Android 16 FRP — May 2026 Security Patch', 40)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101180000_icloud_iphone_5_x_price.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('icloud-remove-iphone-5-x', 'repairs', 'iCloud Remove — iPhone 5 to X Series', 60)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101181000_iremove_a12_bypass_price.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('iremove-tool-bypass-a12-no-signal-ios-17-26-1', 'repairs', 'iRemove Tool Bypass A12+ (No Signal) — iOS 17.0.1 to 26.1 — Mac/Windows', 20)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101182000_iremove_with_signal_price.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('iremove-icloud-bypass-with-signal-iphone-11-13-se', 'repairs', 'iRemove iCloud Bypass With Signal — iPhone 11 / 12 / 13 / SE2 / SE3', 60)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101183000_iremove_with_signal_14_16_price.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('iremove-icloud-bypass-with-signal-iphone-14-16', 'repairs', 'iRemove iCloud Bypass With Signal — iPhone 14 / 15 / 16', 90)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101184000_ikeypro_a12_activator_price.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('ikeypro-a12-activator-hello-bypass-no-signal', 'repairs', 'iKeyPro A12+ Activator Hello Screen Bypass No Signal — iPhone XR to 17 Pro Max & iPads All Models [Windows Tool]', 2)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101190000_digital_gift_cards.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price)
select 'giftcard-' || b.id || '-' || v.value,
       'credits',
       b.name || ' Digital Gift Card — $' || v.value,
       round(v.value * 1.05, 2)
from (values ('psn', 'PlayStation (PSN)'), ('apple', 'Apple / iTunes'), ('paysafe', 'Paysafecard'), ('google', 'Google Play')) as b(id, name)
cross join (values (10), (25), (50), (100)) as v(value)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101200000_generic_imei_checkers.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('generic-imei-checker-apple', 'wholesale', 'Generic IMEI Checker — Apple', 1),
  ('generic-imei-checker-samsung', 'wholesale', 'Generic IMEI Checker — Samsung', 1),
  ('generic-imei-checker-google', 'wholesale', 'Generic IMEI Checker — Google', 1),
  ('generic-imei-checker-xiaomi', 'wholesale', 'Generic IMEI Checker — Xiaomi', 1),
  ('generic-imei-checker-tecno', 'wholesale', 'Generic IMEI Checker — Tecno', 1),
  ('generic-imei-checker-other-brands', 'wholesale', 'Generic IMEI Checker — Other Brands', 1)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;


-- ===== 20261101201000_att_samsung_nck_prices.sql =====

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('att-nck-samsung-s10', 'devices', 'AT&T Galaxy S10 NCK Unlock', 40),
  ('att-nck-samsung-s10-plus', 'devices', 'AT&T Galaxy S10+ NCK Unlock', 40),
  ('att-nck-samsung-s20', 'devices', 'AT&T Galaxy S20 NCK Unlock', 40),
  ('att-nck-samsung-s20-plus', 'devices', 'AT&T Galaxy S20+ NCK Unlock', 40),
  ('att-nck-samsung-s20-ultra', 'devices', 'AT&T Galaxy S20 Ultra NCK Unlock', 40),
  ('att-nck-samsung-s21', 'devices', 'AT&T Galaxy S21 NCK Unlock', 40),
  ('att-nck-samsung-s21-plus', 'devices', 'AT&T Galaxy S21+ NCK Unlock', 40),
  ('att-nck-samsung-s21-ultra', 'devices', 'AT&T Galaxy S21 Ultra NCK Unlock', 40),
  ('att-nck-samsung-s22', 'devices', 'AT&T Galaxy S22 NCK Unlock', 40),
  ('att-nck-samsung-s22-plus', 'devices', 'AT&T Galaxy S22+ NCK Unlock', 40),
  ('att-nck-samsung-s22-ultra', 'devices', 'AT&T Galaxy S22 Ultra NCK Unlock', 40)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;

