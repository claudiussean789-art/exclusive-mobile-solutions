insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('iremove-tool-bypass-a12-no-signal-ios-17-26-1', 'repairs', 'iRemove Tool Bypass A12+ (No Signal) — iOS 17.0.1 to 26.1 — Mac/Windows', 20)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
