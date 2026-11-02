insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('generic-imei-checker-apple', 'wholesale', 'Generic IMEI Checker — Apple', 1),
  ('generic-imei-checker-samsung', 'wholesale', 'Generic IMEI Checker — Samsung', 1),
  ('generic-imei-checker-google', 'wholesale', 'Generic IMEI Checker — Google', 1),
  ('generic-imei-checker-xiaomi', 'wholesale', 'Generic IMEI Checker — Xiaomi', 1),
  ('generic-imei-checker-tecno', 'wholesale', 'Generic IMEI Checker — Tecno', 1),
  ('generic-imei-checker-other-brands', 'wholesale', 'Generic IMEI Checker — Other Brands', 1)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
