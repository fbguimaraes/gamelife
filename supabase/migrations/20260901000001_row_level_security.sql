-- Row Level Security: cada usuário só acessa seus próprios dados
-- (CLAUDE.md Seção 3, item "Autenticação de usuário" / Seção 6 item 1.5).

alter table public.users enable row level security;
alter table public.activities enable row level security;
alter table public.activity_logs enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- users: cada usuário vê e edita apenas o próprio perfil.
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- activities: CRUD restrito ao dono da atividade.
create policy "activities_select_own" on public.activities
  for select using (auth.uid() = user_id);

create policy "activities_insert_own" on public.activities
  for insert with check (auth.uid() = user_id);

create policy "activities_update_own" on public.activities
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "activities_delete_own" on public.activities
  for delete using (auth.uid() = user_id);

-- activity_logs: usuário só vê/registra/remove os próprios logs de conclusão.
create policy "activity_logs_select_own" on public.activity_logs
  for select using (auth.uid() = user_id);

create policy "activity_logs_insert_own" on public.activity_logs
  for insert with check (auth.uid() = user_id);

create policy "activity_logs_delete_own" on public.activity_logs
  for delete using (auth.uid() = user_id);

-- achievements: tabela de referência (não pertence a um usuário específico).
-- Leitura liberada para qualquer usuário autenticado; sem escrita via RLS
-- (gerenciada fora do fluxo do usuário final).
create policy "achievements_select_authenticated" on public.achievements
  for select to authenticated using (true);

-- user_achievements: usuário só vê/registra as próprias conquistas desbloqueadas.
create policy "user_achievements_select_own" on public.user_achievements
  for select using (auth.uid() = user_id);

create policy "user_achievements_insert_own" on public.user_achievements
  for insert with check (auth.uid() = user_id);
