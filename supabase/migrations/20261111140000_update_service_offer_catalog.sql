alter table public.wallet_catalog_prices
  drop constraint if exists wallet_catalog_prices_kind_check;

alter table public.wallet_catalog_prices
  add constraint wallet_catalog_prices_kind_check
  check (kind in ('devices', 'repairs', 'wholesale', 'credits'));

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('unlock-12-months', 'credits', 'UnlockTool - Instant Activation', 45.00),
  ('dft-12-months', 'credits', 'DFT Pro License', 42.00),
  ('samsung-frp-other', 'repairs', 'Samsung FRP Remove', 18.00),
  ('icloud-remove', 'repairs', 'iCloud Clean Bypass', 35.00),
  ('google-pixel-carrier-unlock-tool', 'wholesale', 'Google Pixel & Carrier Unlock', 22.00)
on conflict (id) do update
set kind = excluded.kind,
    name = excluded.name,
    price = excluded.price,
    active = true,
    updated_at = now();
