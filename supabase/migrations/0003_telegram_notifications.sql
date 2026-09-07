-- 0003: уведомления о новых записях в Telegram (v1, бесплатно).
--
-- Настройка владельца (один раз, ~10 минут):
--  1) @BotFather → /newbot → токен вида 123456:ABC...
--  2) В SQL Editor выполнить, подставив токен:
--       select vault.create_secret('<TOKEN>', 'telegram_bot_token');
--     (если секрет уже есть: select vault.update_secret('<TOKEN>', 'telegram_bot_token');)
--  3) Написать боту /start, узнать свой chat id (@userinfobot),
--     вписать его на странице /admin/notifications и включить.
-- Дальше каждая новая запись сама шлёт сообщение в Telegram.
-- Подробнее: docs/notifications.md

create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

-- ---------- notification_settings ----------
create table if not exists public.notification_settings (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  telegram_enabled boolean not null default false,
  telegram_chat_id text not null default ''
);

alter table public.notification_settings enable row level security;

drop policy if exists "owner all notification_settings" on public.notification_settings;
create policy "owner all notification_settings"
  on public.notification_settings for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

-- ---------- trigger: новая запись → Telegram ----------
-- pg_net отправляет асинхронно: даже если Telegram недоступен,
-- запись успешно создаётся, уведомление просто не дойдёт.
create or replace function public.notify_appointment_telegram()
returns trigger
language plpgsql
as $$
declare
  tok text;
  chat text;
  tzw text;
  sname text;
  cname text;
  cphone text;
  msg text;
begin
  select telegram_chat_id into chat
  from public.notification_settings
  where business_id = new.business_id
    and telegram_enabled = true
    and telegram_chat_id <> '';
  if not found then
    return new;
  end if;

  select decrypted_secret into tok
  from vault.decrypted_secrets
  where name = 'telegram_bot_token'
  limit 1;
  if tok is null then
    return new;
  end if;

  select timezone into tzw from public.businesses where id = new.business_id;
  select name into sname from public.services where id = new.service_id;
  select name, phone into cname, cphone from public.clients where id = new.client_id;

  msg := '🔔 Новая запись!' || chr(10)
    || 'Услуга: ' || coalesce(sname, '—') || chr(10)
    || 'Дата: ' || to_char(new.start_at AT TIME ZONE coalesce(tzw, 'UTC'), 'DD.MM.YYYY') || chr(10)
    || 'Время: ' || to_char(new.start_at AT TIME ZONE coalesce(tzw, 'UTC'), 'HH24:MI') || chr(10)
    || 'Клиент: ' || coalesce(cname, '—') || chr(10)
    || 'Телефон: ' || coalesce(cphone, '—');

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || tok || '/sendMessage',
    body := jsonb_build_object('chat_id', chat, 'text', msg),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  return new;
end;
$$;

drop trigger if exists appointments_notify_telegram on public.appointments;
create trigger appointments_notify_telegram
  after insert on public.appointments
  for each row execute function public.notify_appointment_telegram();

-- ---------- тестовая отправка из админки ----------
create or replace function public.test_telegram_notification()
returns text
language plpgsql
security definer
as $$
declare
  bid uuid;
  tok text;
  chat text;
begin
  select b.id into bid
  from public.businesses b
  where b.owner_id = auth.uid()
  limit 1;
  if bid is null then
    raise exception 'NO_BUSINESS';
  end if;

  select telegram_chat_id into chat
  from public.notification_settings
  where business_id = bid and telegram_chat_id <> '';
  if chat is null then
    raise exception 'NO_CHAT_ID';
  end if;

  select decrypted_secret into tok
  from vault.decrypted_secrets
  where name = 'telegram_bot_token'
  limit 1;
  if tok is null then
    raise exception 'NO_BOT_TOKEN';
  end if;

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || tok || '/sendMessage',
    body := jsonb_build_object('chat_id', chat, 'text', '✅ Уведомления подключены! Новые записи будут приходить сюда.'),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  return 'ok';
end;
$$;

grant execute on function public.test_telegram_notification() to authenticated;
