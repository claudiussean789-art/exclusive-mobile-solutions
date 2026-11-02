insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('ikeypro-a12-activator-hello-bypass-no-signal', 'repairs', 'iKeyPro A12+ Activator Hello Screen Bypass No Signal — iPhone XR to 17 Pro Max & iPads All Models [Windows Tool]', 2)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
