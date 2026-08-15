-- BizFlow Coach — Supabase 스키마
-- Supabase 대시보드의 SQL Editor에 붙여넣어 실행한다.
--
-- 기존 Firestore 모델(users/{uid} + users/{uid}/conversations/{id})을 옮긴 것이며,
-- firestore.rules의 "소유자만 접근 + 기본 거부"를 RLS로 동일하게 재현한다.

-- ============================================================
-- 1. 테이블
-- ============================================================

create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  email             text,
  photo_url         text,
  business_profile  jsonb,          -- { name, industry, product, employees }
  full_description  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.profiles is '사용자 기본 정보 + 비즈니스 프로필';

create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  messages    jsonb not null default '[]'::jsonb,   -- [{ author, text }]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.conversations is '코치별 상담 대화 이력';

create index if not exists conversations_user_id_updated_at_idx
  on public.conversations (user_id, updated_at desc);

-- ============================================================
-- 2. updated_at 자동 갱신
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. 가입 시 프로필 자동 생성
--    클라이언트가 별도로 INSERT하지 않아도 되도록 트리거로 처리한다.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, photo_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. RLS — 본인 행만 접근 가능. 정책에 걸리지 않는 모든 접근은 기본 거부된다.
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.conversations enable row level security;

drop policy if exists "본인 프로필 조회" on public.profiles;
create policy "본인 프로필 조회" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "본인 프로필 생성" on public.profiles;
create policy "본인 프로필 생성" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "본인 프로필 수정" on public.profiles;
create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "본인 대화 조회" on public.conversations;
create policy "본인 대화 조회" on public.conversations
  for select using (auth.uid() = user_id);

drop policy if exists "본인 대화 생성" on public.conversations;
create policy "본인 대화 생성" on public.conversations
  for insert with check (auth.uid() = user_id);

drop policy if exists "본인 대화 수정" on public.conversations;
create policy "본인 대화 수정" on public.conversations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "본인 대화 삭제" on public.conversations;
create policy "본인 대화 삭제" on public.conversations
  for delete using (auth.uid() = user_id);
