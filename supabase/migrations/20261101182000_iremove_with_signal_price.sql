insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('iremove-icloud-bypass-with-signal-iphone-11-13-se', 'repairs', 'iRemove iCloud Bypass With Signal — iPhone 11 / 12 / 13 / SE2 / SE3', 60)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
