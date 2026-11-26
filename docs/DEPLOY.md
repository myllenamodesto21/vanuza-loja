# Colocar a loja no ar

Tudo no plano gratuito. São 3 partes: Supabase (banco, fotos e login), Vercel (site) e o primeiro acesso da Vanuza.
Este projeto é separado do sistema da Move: **crie um projeto novo** no Supabase e na Vercel, nunca reaproveite os do sistema.

## 1. Supabase

1. Entre em <https://supabase.com/dashboard> e clique em **New project**.
   - Nome: `vanuza-loja`. Região: **South America (São Paulo)**. Crie uma senha do banco forte (guarde num gerenciador; o site não usa).
2. **SQL Editor > New query**: cole o arquivo `supabase/migrations/20261126120000_loja.sql` inteiro e clique em **Run**.
   Isso cria as tabelas, as categorias iniciais, as regras de segurança, a pasta de fotos e libera o e-mail da Vanuza na gestão.
3. **Authentication > Users > Add user > Create new user**:
   - E-mail: `vanuzamodesto72@gmail.com`
   - Marque **Auto Confirm User**. Senha: qualquer uma longa (ela nunca vai usar).
4. **Authentication > Sign In / Providers**:
   - Desligue **Allow new users to sign up** (ninguém de fora cria conta).
   - Em **Email**, confira que está ligado.
5. **Authentication > Emails > Magic Link** (o modelo do e-mail de entrada). Troque o conteúdo por:

   ```html
   <h2>Seu código para entrar na loja</h2>
   <p style="font-size:32px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
   <p>Vale por 1 hora. Se não foi você, é só ignorar.</p>
   ```

   Assunto: `Código da loja Vanuza`.
6. **Authentication > Passkeys** (entrada com a digital): ligue e preencha
   - **Relying Party ID**: o domínio do site, sem `https://` (ex.: `vanuza-loja.vercel.app`)
   - **Relying Party Name**: `Vanuza Empreendimentos`
   - **Origins**: `https://vanuza-loja.vercel.app`
7. **Authentication > URL Configuration**: Site URL `https://vanuza-loja.vercel.app`.
8. **Project Settings > API Keys**: copie a **Project URL** e a **Publishable key** (`sb_publishable_...`). Não copie a secret.

> Limite do e-mail gratuito do Supabase: poucos e-mails por hora. Para a Vanuza basta, porque ela usa a digital no dia a dia e o código só em celular novo.

## 2. Vercel

1. Em <https://vercel.com/new>, importe o repositório `vanuza-loja` (crie um projeto novo).
2. Nome do projeto: `vanuza-loja` (vira o endereço gratuito `vanuza-loja.vercel.app`; se estiver ocupado, use outro e ajuste o Supabase nos passos 6 e 7).
3. Em **Environment Variables**, adicione:

   | Nome | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | a Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | a Publishable key |
   | `NEXT_PUBLIC_SITE_URL` | `https://vanuza-loja.vercel.app` |

4. **Deploy**.

## 3. Primeiro acesso da Vanuza (no celular dela)

1. Abra `https://vanuza-loja.vercel.app/gestao`.
2. Toque em **Receber código no e-mail**, confirme o e-mail e digite o código de 6 ou 8 números.
3. Na tela inicial aparece **Entrar com a digital**: toque em **Ativar agora** e use a digital ou o rosto.
4. Adicione à tela de início (Ajustes da loja explica como no Android e no iPhone).

Daí em diante, ela fica logada; se sair ou trocar de navegador, entra com **Entrar com a digital**.

## Mais alguém na gestão

No SQL Editor:

```sql
insert into public.administradores (email, nome) values ('outro@email.com', 'Nome');
```

E crie o usuário em Authentication > Users (passo 1.3).

## Domínio próprio depois

Compre o `.com.br` no Registro.br, adicione em Vercel > Settings > Domains e troque o endereço em `NEXT_PUBLIC_SITE_URL` e nos passos 1.6 e 1.7.
Atenção: a digital fica presa ao domínio; depois da troca, a Vanuza entra uma vez pelo código e ativa a digital de novo.
