-- Vanuza Empreendimentos: catálogo da loja.
-- Rode este arquivo inteiro no SQL Editor do Supabase do projeto da loja (passo a passo em docs/DEPLOY.md).

-- Quem pode gerenciar a loja. Só se muda por aqui (SQL Editor), nunca pela API.
create table public.administradores (
  email text primary key check (email = lower(email)),
  nome text not null default '',
  criado_em timestamptz not null default now()
);
alter table public.administradores enable row level security;

insert into public.administradores (email, nome) values ('vanuzamodesto72@gmail.com', 'Vanuza');

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.administradores
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- A tela de entrada pergunta antes de mandar o código, para ninguém de fora criar conta.
create or replace function public.email_pode_entrar(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.administradores where email = lower(trim(p_email)));
$$;

revoke all on function public.eh_admin() from public;
revoke all on function public.email_pode_entrar(text) from public;
grant execute on function public.eh_admin() to anon, authenticated;
grant execute on function public.email_pode_entrar(text) to anon, authenticated;

create policy "administradores: a própria gestão lê" on public.administradores
  for select to authenticated using (public.eh_admin());

-- Dados da loja (uma linha só).
create table public.loja (
  id smallint primary key default 1 check (id = 1),
  nome text not null default 'Vanuza Empreendimentos',
  frase text not null default 'Mais que moda, é você!',
  whatsapp text not null default '5592991124806' check (whatsapp ~ '^[0-9]{12,13}$'),
  endereco text not null default 'Rua Louro, nº 02, Honório Roldão, Manaus',
  instagram text,
  horario text,
  atualizado_em timestamptz not null default now()
);
alter table public.loja enable row level security;
insert into public.loja (id) values (1);

create policy "loja: todos leem" on public.loja for select using (true);
create policy "loja: gestão edita" on public.loja for update to authenticated
  using (public.eh_admin()) with check (public.eh_admin());

-- Categorias do catálogo.
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 1 and 40),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  icone text not null default 'sparkles',
  ordem int not null default 0,
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table public.categorias enable row level security;

create policy "categorias: todos leem as ativas" on public.categorias
  for select using (ativa or public.eh_admin());
create policy "categorias: gestão cria" on public.categorias
  for insert to authenticated with check (public.eh_admin());
create policy "categorias: gestão edita" on public.categorias
  for update to authenticated using (public.eh_admin()) with check (public.eh_admin());
create policy "categorias: gestão apaga" on public.categorias
  for delete to authenticated using (public.eh_admin());

insert into public.categorias (nome, slug, icone, ordem) values
  ('Perfumaria', 'perfumaria', 'perfume', 1),
  ('Feminino', 'feminino', 'vestido', 2),
  ('Masculino', 'masculino', 'camisa', 3),
  ('Infantil', 'infantil', 'infantil', 4),
  ('Calçados', 'calcados', 'sapato', 5),
  ('Bolsas', 'bolsas', 'bolsa', 6),
  ('Variedades', 'variedades', 'sparkles', 7);

-- Produtos.
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 1 and 80),
  descricao text check (char_length(descricao) <= 1000),
  categoria_id uuid references public.categorias (id) on delete set null,
  preco numeric(10, 2) not null check (preco > 0),
  preco_promocional numeric(10, 2) check (preco_promocional > 0),
  promocao_ate date,
  tamanhos text[] not null default '{}',
  cores text[] not null default '{}',
  quantidade int check (quantidade >= 0),
  esgotado boolean not null default false,
  visivel boolean not null default true,
  destaque boolean not null default false,
  fotos text[] not null default '{}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint promocao_menor_que_preco check (preco_promocional is null or preco_promocional < preco),
  constraint ate_dez_fotos check (cardinality(fotos) <= 10)
);
alter table public.produtos enable row level security;
create index produtos_categoria on public.produtos (categoria_id);
create index produtos_criado on public.produtos (criado_em desc);

create policy "produtos: todos leem os visíveis" on public.produtos
  for select using (visivel or public.eh_admin());
create policy "produtos: gestão cria" on public.produtos
  for insert to authenticated with check (public.eh_admin());
create policy "produtos: gestão edita" on public.produtos
  for update to authenticated using (public.eh_admin()) with check (public.eh_admin());
create policy "produtos: gestão apaga" on public.produtos
  for delete to authenticated using (public.eh_admin());

create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql set search_path = public as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger produtos_atualizado before update on public.produtos
  for each row execute function public.tocar_atualizado_em();
create trigger loja_atualizado before update on public.loja
  for each row execute function public.tocar_atualizado_em();

-- Quantidade chegou a zero: esgotado. Voltou a ter: disponível.
create or replace function public.produtos_seguir_quantidade()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.quantidade is not null and new.quantidade is distinct from old.quantidade then
    new.esgotado := new.quantidade = 0;
  end if;
  return new;
end;
$$;
create trigger produtos_quantidade before update on public.produtos
  for each row execute function public.produtos_seguir_quantidade();

-- Promoção em vários produtos de uma vez (desconto em % ou preço fixo).
create or replace function public.aplicar_promocao(
  p_ids uuid[], p_percentual numeric, p_preco numeric, p_ate date
) returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_qtd int;
begin
  if not public.eh_admin() then raise exception 'Sem permissão.'; end if;
  if p_percentual is null and p_preco is null then raise exception 'Informe o desconto.'; end if;
  if p_percentual is not null and (p_percentual <= 0 or p_percentual >= 100) then
    raise exception 'O desconto precisa ficar entre 1%% e 99%%.';
  end if;

  update public.produtos
     set preco_promocional = case
           when p_percentual is not null then round(preco * (1 - p_percentual / 100), 2)
           else p_preco end,
         promocao_ate = p_ate
   where id = any (p_ids)
     and (p_percentual is not null or p_preco < preco);
  get diagnostics v_qtd = row_count;
  return v_qtd;
end;
$$;

create or replace function public.encerrar_promocao(p_ids uuid[])
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare v_qtd int;
begin
  if not public.eh_admin() then raise exception 'Sem permissão.'; end if;
  update public.produtos set preco_promocional = null, promocao_ate = null where id = any (p_ids);
  get diagnostics v_qtd = row_count;
  return v_qtd;
end;
$$;

revoke all on function public.aplicar_promocao(uuid[], numeric, numeric, date) from public, anon;
revoke all on function public.encerrar_promocao(uuid[]) from public, anon;
grant execute on function public.aplicar_promocao(uuid[], numeric, numeric, date) to authenticated;
grant execute on function public.encerrar_promocao(uuid[]) to authenticated;

-- Fotos: bucket público (o catálogo é público), só a gestão envia e apaga.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "fotos: gestão envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos' and public.eh_admin());
create policy "fotos: gestão troca" on storage.objects
  for update to authenticated using (bucket_id = 'produtos' and public.eh_admin());
create policy "fotos: gestão apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos' and public.eh_admin());
