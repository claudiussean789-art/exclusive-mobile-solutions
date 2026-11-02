insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('att-nck-samsung-s10', 'devices', 'AT&T Galaxy S10 NCK Unlock', 40),
  ('att-nck-samsung-s10-plus', 'devices', 'AT&T Galaxy S10+ NCK Unlock', 40),
  ('att-nck-samsung-s20', 'devices', 'AT&T Galaxy S20 NCK Unlock', 40),
  ('att-nck-samsung-s20-plus', 'devices', 'AT&T Galaxy S20+ NCK Unlock', 40),
  ('att-nck-samsung-s20-ultra', 'devices', 'AT&T Galaxy S20 Ultra NCK Unlock', 40),
  ('att-nck-samsung-s21', 'devices', 'AT&T Galaxy S21 NCK Unlock', 40),
  ('att-nck-samsung-s21-plus', 'devices', 'AT&T Galaxy S21+ NCK Unlock', 40),
  ('att-nck-samsung-s21-ultra', 'devices', 'AT&T Galaxy S21 Ultra NCK Unlock', 40),
  ('att-nck-samsung-s22', 'devices', 'AT&T Galaxy S22 NCK Unlock', 40),
  ('att-nck-samsung-s22-plus', 'devices', 'AT&T Galaxy S22+ NCK Unlock', 40),
  ('att-nck-samsung-s22-ultra', 'devices', 'AT&T Galaxy S22 Ultra NCK Unlock', 40)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
