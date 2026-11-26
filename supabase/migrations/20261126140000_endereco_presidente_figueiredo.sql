-- A loja fica em Presidente Figueiredo (AM), não em Manaus.
alter table public.loja
  alter column endereco set default 'Rua Louro, nº 02, Honório Roldão, Presidente Figueiredo (AM)';

update public.loja
   set endereco = 'Rua Louro, nº 02, Honório Roldão, Presidente Figueiredo (AM)'
 where id = 1 and endereco = 'Rua Louro, nº 02, Honório Roldão, Manaus';
