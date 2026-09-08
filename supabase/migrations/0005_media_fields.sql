-- 0005: поля карточки работы (название, описание, категория).
-- Раньше media хранила только url: категория из админки молча терялась,
-- и на сайте у всех работ показывалось «Работы».
-- Применить: SQL Editor → вставить → Run. Старые строки получат category='Работы' —
-- пересохраните их в /admin/gallery один раз, чтобы расставить категории.

alter table public.media
  add column if not exists alt text not null default '',
  add column if not exists description text not null default '',
  add column if not exists category text not null default 'Работы';
