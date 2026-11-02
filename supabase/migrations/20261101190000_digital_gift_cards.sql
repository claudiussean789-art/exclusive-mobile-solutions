insert into public.wallet_catalog_prices (id, kind, name, price)
select 'giftcard-' || b.id || '-' || v.value,
       'credits',
       b.name || ' Digital Gift Card — $' || v.value,
       round(v.value * 1.05, 2)
from (values ('psn', 'PlayStation (PSN)'), ('apple', 'Apple / iTunes'), ('paysafe', 'Paysafecard'), ('google', 'Google Play')) as b(id, name)
cross join (values (10), (25), (50), (100)) as v(value)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
