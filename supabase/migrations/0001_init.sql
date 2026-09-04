-- ============================================================
-- BeautyBooking / Nail Studio — initial schema (MVP, single business ready,
-- multi-tenant by design). AGENTS.md §17–20, §25–26.
--
-- Как применить: Supabase Dashboard → SQL Editor → New query →
-- вставить весь файл → Run. Повторный прогон безопасен (IF NOT EXISTS).
-- ============================================================

-- ---------- updated_at helper ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- businesses ----------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text default '',
  phone text default '',
  email text default '',
  city text default '',
  address text default '',
  timezone text not null default 'Europe/Moscow',
  avatar_url text default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- services ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text default '',
  price numeric(10, 2) not null default 0,
  currency text not null default 'RUB',
  duration_minutes integer not null default 60,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_business_idx on public.services (business_id);

-- ---------- clients ----------
-- Один человек = одна строка в рамках бизнеса (дедупликация по телефону).
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone text default '',
  email text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clients_business_idx on public.clients (business_id);
-- Не плодим дубликаты: один телефон — один клиент бизнеса (пустые телефоны игнорим).
create unique index if not exists clients_business_phone_uidx
  on public.clients (business_id, phone)
  where phone <> '';

-- ---------- appointments ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);
create index if not exists appointments_business_start_idx
  on public.appointments (business_id, start_at);

-- Защита от двойной записи (AGENTS.md §16): серверный триггер, не frontend.
-- Отклоняет пересекающиеся записи одного бизнеса (кроме отменённых).
create or replace function public.prevent_appointment_overlap()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.appointments a
    where a.business_id = new.business_id
      and a.id <> new.id
      and a.status <> 'cancelled'
      and new.status <> 'cancelled'
      and tstzrange(a.start_at, a.end_at) && tstzrange(new.start_at, new.end_at)
  ) then
    raise exception 'SLOT_TAKEN: это время уже занято, выберите другое'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_no_overlap on public.appointments;
create trigger appointments_no_overlap
  before insert or update on public.appointments
  for each row execute function public.prevent_appointment_overlap();

-- ---------- working_hours ----------
-- weekday: 0 = воскресенье … 6 = суббота.
create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  open_time time,
  close_time time,
  is_day_off boolean not null default false,
  unique (business_id, weekday)
);

-- ---------- blocked_periods ----------
-- Выходные конкретных дат, отпуска, перерывы.
create table if not exists public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text default '',
  check (end_at > start_at)
);
create index if not exists blocked_periods_business_idx
  on public.blocked_periods (business_id, start_at);

-- ---------- reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  author_name text not null default '',
  text text not null default '',
  rating smallint not null default 5 check (rating between 1 and 5),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists reviews_business_idx on public.reviews (business_id);

-- ---------- media ----------
-- kind: 'avatar' | 'work'.
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  kind text not null default 'work' check (kind in ('avatar', 'work')),
  url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists media_business_idx on public.media (business_id);

-- ---------- updated_at triggers ----------
drop trigger if exists businesses_touch on public.businesses;
create trigger businesses_touch
  before update on public.businesses
  for each row execute function public.touch_updated_at();

drop trigger if exists services_touch on public.services;
create trigger services_touch
  before update on public.services
  for each row execute function public.touch_updated_at();

drop trigger if exists clients_touch on public.clients;
create trigger clients_touch
  before update on public.clients
  for each row execute function public.touch_updated_at();

drop trigger if exists appointments_touch on public.appointments;
create trigger appointments_touch
  before update on public.appointments
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row Level Security (AGENTS.md §26). Мастер A (business_id=A)
-- не видит и не меняет данные бизнеса B.
-- ============================================================
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.working_hours enable row level security;
alter table public.blocked_periods enable row level security;
alter table public.reviews enable row level security;
alter table public.media enable row level security;

-- --- Публичное чтение (гости без аккаунта): только активные бизнесы ---
-- Чистим старые политики, чтобы повторный прогон не дублировал.
drop policy if exists "public read businesses" on public.businesses;
create policy "public read businesses"
  on public.businesses for select to anon, authenticated
  using (is_active = true);

drop policy if exists "public read services" on public.services;
create policy "public read services"
  on public.services for select to anon, authenticated
  using (
    is_active = true
    and exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true)
  );

drop policy if exists "public read working_hours" on public.working_hours;
create policy "public read working_hours"
  on public.working_hours for select to anon, authenticated
  using (
    exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true)
  );

drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews"
  on public.reviews for select to anon, authenticated
  using (
    is_active = true
    and exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true)
  );

drop policy if exists "public read media" on public.media;
create policy "public read media"
  on public.media for select to anon, authenticated
  using (
    exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true)
  );

-- --- Гостевая запись без аккаунта (MVP): anon может создавать
-- --- клиентов и записи. Позже заменить на Edge Function с rate-limit.
drop policy if exists "guest insert clients" on public.clients;
create policy "guest insert clients"
  on public.clients for insert to anon
  with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true)
  );

drop policy if exists "guest insert appointments" on public.appointments;
create policy "guest insert appointments"
  on public.appointments for insert to anon
  with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.is_active = true)
  );

-- --- Владелец (authenticated, owner_id = auth.uid()): полный доступ ---
drop policy if exists "owner all businesses" on public.businesses;
create policy "owner all businesses"
  on public.businesses for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Хелпер: бизнесы текущего владельца.
-- (Политики ниже опираются на него, чтобы не дублировать подзапросы.)

drop policy if exists "owner all services" on public.services;
create policy "owner all services"
  on public.services for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "owner all clients" on public.clients;
create policy "owner all clients"
  on public.clients for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "owner all appointments" on public.appointments;
create policy "owner all appointments"
  on public.appointments for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "owner all working_hours" on public.working_hours;
create policy "owner all working_hours"
  on public.working_hours for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "owner all blocked_periods" on public.blocked_periods;
create policy "owner all blocked_periods"
  on public.blocked_periods for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "owner all reviews" on public.reviews;
create policy "owner all reviews"
  on public.reviews for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "owner all media" on public.media;
create policy "owner all media"
  on public.media for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

-- ============================================================
-- Storage buckets: avatars (аватар мастера), works (фото работ).
-- Публичное чтение, запись — только владелец через RLS storage.objects.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
       ('works', 'works', true)
on conflict (id) do nothing;

drop policy if exists "public read avatars" on storage.objects;
create policy "public read avatars"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "public read works" on storage.objects;
create policy "public read works"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'works');

drop policy if exists "auth write avatars" on storage.objects;
create policy "auth write avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

drop policy if exists "auth write works" on storage.objects;
create policy "auth write works"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'works');
