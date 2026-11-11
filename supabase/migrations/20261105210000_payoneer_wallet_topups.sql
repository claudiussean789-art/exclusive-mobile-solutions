alter table public.wallet_topups
  drop constraint if exists wallet_topups_method_check;

alter table public.wallet_topups
  add constraint wallet_topups_method_check
  check (method in ('paypal', 'manual', 'payoneer')),
  add column if not exists payoneer_list_id text unique;

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
  if p_method not in ('paypal', 'manual', 'payoneer') then raise exception 'Unsupported top-up payment method.'; end if;
  insert into public.wallet_topups (user_id, amount, method)
  values (v_user_id, p_amount, p_method)
  returning * into v_topup;
  return v_topup;
end;
$$;
