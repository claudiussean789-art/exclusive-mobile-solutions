insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('icloud-remove-iphone-5-x', 'repairs', 'iCloud Remove — iPhone 5 to X Series', 60)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
