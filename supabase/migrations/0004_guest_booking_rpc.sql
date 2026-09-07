-- 0004: гостевое бронирование через RPC (без прямого доступа anon к таблицам).
--
-- Проблема, которую чинит: PostgREST при Prefer: return=representation делает
-- SELECT после INSERT, а anon-SELECT на clients/appointments запрещён
-- (приватность: телефоны и имена клиентов) → 42501 даже при успешной вставке.
-- Плюс гость никак не мог узнать занятые часы (SELECT тоже запрещён).
--
-- Решение: security-definer функции отдают гостю только нужное —
-- занятые/заблокированные часы даты и результат его собственной записи.
-- PII других клиентов не утекает. Прямые guest-INSERT политики больше не нужны.
--
-- Применить: SQL Editor → вставить → Run (идемпотентно).

-- ---------- занятые + заблокированные часы даты ----------
create or replace function public.get_day_times(
  p_business_id uuid,
  p_date date,
  p_timezone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  booked text[];
  blocked text[];
begin
  select coalesce(array_agg(t order by t), '{}') into booked
  from (
    select distinct to_char(start_at AT TIME ZONE p_timezone, 'HH24:MI') as t
    from appointments
    where business_id = p_business_id
      and (start_at AT TIME ZONE p_timezone)::date = p_date
      and status <> 'cancelled'
  ) s;

  select coalesce(array_agg(t order by t), '{}') into blocked
  from (
    select distinct to_char(h, 'HH24:MI') as t
    from generate_series(
      ((p_date::text || ' 00:00')::timestamp AT TIME ZONE p_timezone),
      ((p_date::text || ' 00:00')::timestamp AT TIME ZONE p_timezone) + interval '23 hours',
      interval '1 hour'
    ) as h
    where exists (
      select 1 from blocked_periods p
      where p.business_id = p_business_id
        and p.start_at < h + interval '1 hour'
        and p.end_at > h
    )
  ) s;

  return jsonb_build_object('booked', to_jsonb(booked), 'blocked', to_jsonb(blocked));
end;
$$;

grant execute on function public.get_day_times(uuid, date, text) to anon, authenticated;

-- ---------- создание записи гостем ----------
create or replace function public.create_booking(
  p_business_id uuid,
  p_service_id uuid,
  p_date date,
  p_time text,
  p_duration_minutes integer,
  p_timezone text,
  p_name text,
  p_phone text,
  p_comment text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid;
  sname text;
  cid uuid;
  start_at timestamptz;
  end_at timestamptz;
  aid uuid;
begin
  if p_name = '' or p_phone = '' then
    raise exception 'NO_CLIENT_DATA';
  end if;
  if p_time !~ '^[0-2][0-9]:[0-5][0-9]$' then
    raise exception 'BAD_TIME';
  end if;
  if p_duration_minutes < 1 or p_duration_minutes > 600 then
    raise exception 'BAD_DURATION';
  end if;

  select id, name into sid, sname
  from services
  where id = p_service_id and business_id = p_business_id and is_active = true;
  if sid is null then
    raise exception 'NO_SERVICE';
  end if;

  -- Клиент: ищем по телефону в рамках бизнеса, иначе создаём.
  -- Уникальный индекс + повторный select закрывают гонку.
  select id into cid from clients
  where business_id = p_business_id and phone = p_phone and p_phone <> '';
  if cid is null then
    insert into clients (business_id, name, phone)
    values (p_business_id, p_name, p_phone)
    returning id into cid;
  end if;

  start_at := ((p_date::text || ' ' || p_time)::timestamp AT TIME ZONE p_timezone);
  end_at := start_at + (p_duration_minutes || ' minutes')::interval;

  insert into appointments (business_id, service_id, client_id, start_at, end_at, status, notes)
  values (p_business_id, sid, cid, start_at, end_at, 'pending', p_comment)
  returning id into aid;
  -- Пересечение ловит триггер appointments_no_overlap (SLOT_TAKEN).

  return jsonb_build_object(
    'id', aid,
    'service_name', sname,
    'date', to_char(start_at AT TIME ZONE p_timezone, 'YYYY-MM-DD'),
    'time', to_char(start_at AT TIME ZONE p_timezone, 'HH24:MI'),
    'name', p_name,
    'phone', p_phone
  );
end;
$$;

grant execute on function public.create_booking(uuid, uuid, date, text, integer, text, text, text, text)
  to anon, authenticated;

-- Прямые гостевые вставки больше не используются (всё идёт через RPC) —
-- убираем по принципу минимальных привилегий.
drop policy if exists "guest insert clients" on public.clients;
drop policy if exists "guest insert appointments" on public.appointments;
