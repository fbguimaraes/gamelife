-- Cria automaticamente a linha em public.users quando um usuário se
-- cadastra via Supabase Auth (auth.users). Roda como SECURITY DEFINER para
-- funcionar mesmo sem sessão ativa (ex: confirmação de e-mail pendente).
-- Decisão registrada em CLAUDE.md Seção 7 (item 1.6).

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
