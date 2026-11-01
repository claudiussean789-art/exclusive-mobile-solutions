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
