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
