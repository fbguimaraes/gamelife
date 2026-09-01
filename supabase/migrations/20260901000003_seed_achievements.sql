-- Conquistas do MVP. Critério em formato "chave_N", lido pela lógica de
-- desbloqueio em src/lib/achievements.ts:
--   streak_N     -> streak_atual (recalculado em src/lib/streak.ts) >= N
--   atividades_N -> total de activity_logs do usuário >= N

-- unique em titulo: não é um campo novo (Seção 5 já lista `titulo`), apenas
-- uma restrição de integridade para o `on conflict` abaixo tornar este seed
-- seguro de rodar mais de uma vez.
alter table public.achievements add constraint achievements_titulo_key unique (titulo);

insert into public.achievements (titulo, descricao, criterio) values
  ('Primeiro Passo', 'Concluiu a primeira atividade.', 'atividades_1'),
  ('Uma Semana Firme', 'Manteve uma sequência de 7 dias.', 'streak_7'),
  ('Duas Semanas Fortes', 'Manteve uma sequência de 14 dias.', 'streak_14'),
  ('Um Mês Sem Parar', 'Manteve uma sequência de 30 dias.', 'streak_30'),
  ('Meio Cento', 'Concluiu 50 atividades no total.', 'atividades_50'),
  ('Centena', 'Concluiu 100 atividades no total.', 'atividades_100')
on conflict (titulo) do nothing;
