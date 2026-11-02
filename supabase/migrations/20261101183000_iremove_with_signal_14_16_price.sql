insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('iremove-icloud-bypass-with-signal-iphone-14-16', 'repairs', 'iRemove iCloud Bypass With Signal — iPhone 14 / 15 / 16', 90)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
