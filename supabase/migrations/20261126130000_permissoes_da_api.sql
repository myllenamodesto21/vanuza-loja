-- Projetos novos do Supabase não liberam sozinhos as tabelas criadas pelo SQL Editor para a API.
-- Quem decide o que cada um vê e grava continua sendo o RLS (as políticas da primeira migração).
grant usage on schema public to anon, authenticated;

grant select on public.loja, public.categorias, public.produtos to anon, authenticated;
grant insert, update, delete on public.categorias, public.produtos to authenticated;
grant update on public.loja to authenticated;
grant select on public.administradores to authenticated;
