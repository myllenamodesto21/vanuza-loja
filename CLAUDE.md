@AGENTS.md

# Vanuza Empreendimentos (loja)

Projeto separado do sistema da Move: repositório, Supabase e Vercel próprios. Nunca use chaves, tabelas ou código do `sistema-move`.

- Interface em português do Brasil, simples, para a dona usar sozinha no celular. Sem travessão na interface.
- Mobile first (375px). Visual da logo: creme, rose gold, chocolate; títulos em Bodoni Moda (peso médio, nunca semibold), corpo em Jost, detalhe manuscrito em Great Vibes (`src/app/fontes.ts`, cores em `src/app/globals.css`).
- Datas dd/mm/aaaa, reais R$ 1.100,00, fuso America/Manaus (`src/lib/formatacao.ts`).
- Segurança no banco: toda tabela com RLS; só quem está em `administradores` grava (`eh_admin()`). Migrações novas em `supabase/migrations/`, nunca edite uma aplicada.
- Loja: páginas em `src/app/(loja)`, leituras em `src/lib/dados.ts`. Gestão: `src/app/gestao`, gravações em `src/lib/gestao.ts`, imagem do status em `src/lib/status.ts`.
- Antes de commitar: `npm run lint` e `npm run build`.
