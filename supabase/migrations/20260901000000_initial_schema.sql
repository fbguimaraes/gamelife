-- Schema inicial do produto.
-- Não adicionar, remover ou renomear colunas sem atualizar a documentação
-- interna de modelo de dados do projeto.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  pontos_totais integer not null default 0,
  nivel integer not null default 1,
  streak_atual integer not null default 0,
  streak_freezes_disponiveis integer not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  titulo text not null,
  descricao text,
  categoria text not null,
  frequencia text not null check (frequencia in ('diaria', 'dias_especificos', 'unica')),
  dias_semana smallint[] check (dias_semana is null or dias_semana <@ array[1,2,3,4,5,6,7]::smallint[]),
  peso text not null check (peso in ('leve', 'medio', 'dificil')),
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);
create index if not exists activities_user_id_idx on public.activities (user_id);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  concluida_em timestamptz not null default now(),
  pontos_ganhos integer not null
);
create index if not exists activity_logs_activity_id_idx on public.activity_logs (activity_id);
create index if not exists activity_logs_user_id_idx on public.activity_logs (user_id);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null,
  criterio text not null
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  desbloqueada_em timestamptz not null default now(),
  unique (user_id, achievement_id)
);
create index if not exists user_achievements_user_id_idx on public.user_achievements (user_id);
