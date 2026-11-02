-- Combined price migrations (20261101*). Safe to run more than once.
-- Requires the earlier wallet_catalog_prices migrations to have been applied.

insert into public.wallet_catalog_prices (id, kind, name, price) values
  ('samsung-usa-android-16-frp-may-2026', 'repairs', 'Samsung USA Models Android 16 FRP - May 2026 Security Patch', 40),
  ('icloud-remove-iphone-5-x', 'repairs', 'iCloud Remove - iPhone 5 to X Series', 60),
  ('iremove-tool-bypass-a12-no-signal-ios-17-26-1', 'repairs', 'iRemove Tool Bypass A12+ (No Signal) - iOS 17.0.1 to 26.1 - Mac/Windows', 20),
  ('iremove-icloud-bypass-with-signal-iphone-11-13-se', 'repairs', 'iRemove iCloud Bypass With Signal - iPhone 11 / 12 / 13 / SE2 / SE3', 60),
  ('iremove-icloud-bypass-with-signal-iphone-14-16', 'repairs', 'iRemove iCloud Bypass With Signal - iPhone 14 / 15 / 16', 90),
  ('ikeypro-a12-activator-hello-bypass-no-signal', 'repairs', 'iKeyPro A12+ Activator Hello Screen Bypass No Signal - iPhone XR to 17 Pro Max & iPads All Models [Windows Tool]', 2),
  ('generic-imei-checker-apple', 'wholesale', 'Generic IMEI Checker - Apple', 1),
  ('generic-imei-checker-samsung', 'wholesale', 'Generic IMEI Checker - Samsung', 1),
  ('generic-imei-checker-google', 'wholesale', 'Generic IMEI Checker - Google', 1),
  ('generic-imei-checker-xiaomi', 'wholesale', 'Generic IMEI Checker - Xiaomi', 1),
  ('generic-imei-checker-tecno', 'wholesale', 'Generic IMEI Checker - Tecno', 1),
  ('generic-imei-checker-other-brands', 'wholesale', 'Generic IMEI Checker - Other Brands', 1),
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

-- Digital gift cards: face value + 5%
insert into public.wallet_catalog_prices (id, kind, name, price)
select 'giftcard-' || b.id || '-' || v.value,
       'credits',
       b.name || ' Digital Gift Card - $' || v.value,
       round(v.value * 1.05, 2)
from (values ('psn', 'PlayStation (PSN)'), ('apple', 'Apple / iTunes'), ('paysafe', 'Paysafecard'), ('google', 'Google Play')) as b(id, name)
cross join (values (10), (25), (50), (100)) as v(value)
on conflict (id) do update
set kind = excluded.kind, name = excluded.name, price = excluded.price, active = true;
