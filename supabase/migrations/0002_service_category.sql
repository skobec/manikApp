-- 0002: категория услуг для группировки прайса.
-- Необязательная: код умеет работать и без неё (фолбэк 'Услуги').
-- Применить так же, как 0001: SQL Editor → вставить → Run.

alter table public.services
  add column if not exists category text not null default 'Услуги';
