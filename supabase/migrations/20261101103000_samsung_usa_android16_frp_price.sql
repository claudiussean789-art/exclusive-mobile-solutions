insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('samsung-usa-android-16-frp-may-2026', 'repairs', 'Samsung USA Models Android 16 FRP — May 2026 Security Patch', 40)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
