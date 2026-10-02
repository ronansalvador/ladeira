# Gafieira da Ladeira

Aplicação web para apoiar a operação da Gafieira da Ladeira: cadastro de clientes e produtos, organização de bailes, abertura e acompanhamento de comandas, registro de consumos e consulta de relatórios.

> **Segurança:** configure `JWT_SECRET` antes de usar login/cadastro. Não versione `.env` nem copie credenciais para o repositório. As APIs administrativas validam a sessão no servidor; a autorização visual das telas não substitui essa validação.

## Funcionalidades

- Login e cadastro de usuários.
- Cadastro e listagem de clientes.
- Cadastro, edição, exclusão e listagem de produtos.
- Criação de bailes e consulta de bailes e comandas.
- Abertura de comandas vinculadas a cliente, baile e tipo de entrada.
- Inclusão, alteração e remoção de consumos; fechamento de comanda.
- Consulta de comandas fechadas por data e exportação de relatório em PDF ou Excel.

## Tecnologias

- Next.js 15 (App Router), React 19 e TypeScript.
- PostgreSQL com Prisma ORM 6.
- Tailwind CSS 4.
- `xlsx`, `jspdf` e `jspdf-autotable` para exportação de relatórios.

## Requisitos

- Node.js 18.18 ou mais recente e npm.
- PostgreSQL acessível pela aplicação.

## Configuração local

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Crie um banco PostgreSQL e configure `DATABASE_URL` e `JWT_SECRET` em um arquivo `.env` na raiz do projeto. O segredo JWT deve ser aleatório e ter pelo menos 32 caracteres. Gere um segredo localmente com `openssl rand -hex 32` e não o compartilhe nem o versione. Exemplo de formato:

   ```env
   DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO?schema=public"
   JWT_SECRET="substitua-por-um-segredo-aleatorio-com-ao-menos-32-caracteres"
   ```

3. Gere o Prisma Client e aplique as migrações existentes ao banco de desenvolvimento:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000).

Não há seed de dados configurado. O cadastro público cria usuários com perfil `user`; um operador confiável precisa conceder o perfil administrativo diretamente no banco. A API não aceita perfil enviado pelo navegador. Senhas MD5 antigas são atualizadas para scrypt no próximo login bem-sucedido.

## Scripts disponíveis

| Comando               | Descrição                                                  |
| --------------------- | ---------------------------------------------------------- |
| `npm run dev`         | Inicia o Next.js em modo de desenvolvimento com Turbopack. |
| `npm run lint`        | Executa o ESLint.                                          |
| `npm run build`       | Gera o build de produção com Turbopack.                    |
| `npm run start`       | Inicia o servidor de produção após o build.                |
| `npm run test:e2e`    | Executa os testes E2E de cadastro e login.                 |
| `npm run test:e2e:ui` | Abre a interface interativa do Playwright.                 |

## Testes E2E

Os testes Playwright exercitam o cadastro, logout e login pela interface. Eles criam um usuário com e-mail aleatório e o removem ao final. Configure `E2E_DATABASE_URL` para um banco/schema isolado cujo nome contenha `e2e` ou `test`; a configuração bloqueia outros nomes para reduzir o risco de usar o banco errado. **Nunca use o banco de produção.**

Prepare o banco de teste e instale o Chromium uma vez:

```bash
DATABASE_URL="$E2E_DATABASE_URL" npx prisma migrate deploy
npx playwright install chromium
```

Depois, execute `npm run test:e2e`. Detalhes em [tests/README.md](tests/README.md).

## Deploy na Vercel

1. Importe na Vercel o repositório GitHub e confirme que o diretório raiz do projeto contém `package.json` e `prisma/schema.prisma`.
2. Mantenha o framework como **Next.js**, o comando de build como `npm run build` e o diretório de saída padrão. A instalação deve usar `npm ci` e o `package-lock.json` versionado.
3. Configure `DATABASE_URL` e `JWT_SECRET` nas variáveis de ambiente da Vercel para **Production**. Se usar Preview Deployments, configure também essas variáveis com um banco de staging separado; não conecte previews ao banco de produção.
4. Faça push para a branch configurada como produção. A integração GitHub/Vercel inicia o deploy automaticamente; acompanhe o build e os logs em **Deployments**.
5. Após publicar, valide login, cadastro e uma operação administrativa. Alterações nas variáveis de ambiente só entram em vigor em um novo deploy.

Não versione `.env`, não coloque segredos em variáveis `NEXT_PUBLIC_*` e não use credenciais de produção em testes ou previews. A troca de `JWT_SECRET` invalida as sessões existentes.

### Migrações Prisma em produção

O repositório mantém o histórico em `prisma/migrations/`. Se `schema.prisma` não mudou e não há migration nova, não é necessário executar uma migração para publicar código. Para uma alteração futura no schema, crie e revise uma migration em desenvolvimento com `npx prisma migrate dev --name descricao_da_alteracao`, e versione juntos o schema e a pasta gerada em `prisma/migrations/`.

Para a versão documentada aqui, `schema.prisma` não tem alterações pendentes e não foi criada migration nova; portanto, as mudanças de aplicação não exigem migração de banco.

Antes de liberar uma versão que inclua migrations, faça backup e aplique-as **uma vez** ao banco de produção com `npx prisma migrate deploy`, usando uma `DATABASE_URL` de produção fornecida por um ambiente seguro. Depois faça o deploy da aplicação. Não execute `prisma migrate dev` nem `prisma migrate reset` em produção; o segundo pode apagar dados. Para mudanças incompatíveis, planeje uma migração gradual (expandir, migrar dados, depois remover campos antigos).

## Estrutura principal

```text
src/app/       Páginas, componentes e Route Handlers da API
src/lib/       Cliente Prisma compartilhado
prisma/        Schema e histórico de migrações
public/        Arquivos estáticos
```

As telas ficam no App Router, em `src/app/`. Os endpoints HTTP ficam em `src/app/api/` e usam Route Handlers do Next.js. O modelo de dados está em `prisma/schema.prisma`.

## Endpoints existentes

| Método          | Endpoint                                  | Uso                                                           |
| --------------- | ----------------------------------------- | ------------------------------------------------------------- |
| `POST`          | `/api/login`                              | Autenticar usuário.                                           |
| `POST`          | `/api/register`                           | Registrar usuário.                                            |
| `POST`          | `/api/logout`                             | Encerrar a sessão.                                            |
| `GET`, `POST`   | `/api/clientes`                           | Listar e cadastrar clientes.                                  |
| `GET`, `POST`   | `/api/produtos`                           | Listar e cadastrar produtos.                                  |
| `PUT`, `DELETE` | `/api/produtos`                           | Atualizar ou excluir produto; o `id` é enviado no corpo JSON. |
| `GET`, `POST`   | `/api/bailes`                             | Listar e criar bailes.                                        |
| `GET`           | `/api/bailes/{id}`                        | Consultar um baile e suas comandas.                           |
| `GET`, `POST`   | `/api/comandas`                           | Listar e abrir comandas.                                      |
| `GET`           | `/api/comandas/{id}`                      | Consultar uma comanda.                                        |
| `POST`          | `/api/comandas/fechar/{id}`               | Fechar uma comanda e calcular seu total.                      |
| `GET`, `POST`   | `/api/consumos`                           | Listar e adicionar consumos.                                  |
| `PUT`, `DELETE` | `/api/consumos/{id}`                      | Alterar quantidade ou remover um consumo.                     |
| `GET`           | `/api/relatorios/consumo?data=AAAA-MM-DD` | Listar comandas fechadas na data informada.                   |

## Melhorias recomendadas

### Prioridade crítica — segurança

- Implementar limitação de tentativas de login/registro e monitoramento contra abuso.
- Considerar revogação de sessões em todos os dispositivos e política de redefinição de senha.
- Evitar devolver objetos de erro internos ao cliente e remover logs que possam expor detalhes operacionais.

### Prioridade alta — integridade dos dados

- Validar e tipar payloads recebidos (por exemplo, com Zod): campos obrigatórios, IDs inteiros positivos, datas válidas, quantidades maiores que zero, preços finitos/não negativos e enumerações permitidas.
- Impedir adicionar, alterar ou remover consumos de comandas já fechadas; tornar o fechamento idempotente e calcular/gravar o total em uma transação.
- Usar centavos inteiros ou `Decimal` do Prisma em vez de `Float` para valores monetários, evitando erros de arredondamento.
- Armazenar os tipos de entrada/status como enums e centralizar os preços de ingresso, que atualmente estão fixos em diferentes pontos da aplicação.
- Validar o parâmetro `data` do relatório e usar limites de intervalo de data consistentes com o fuso horário configurado.

### Qualidade e experiência de uso

- Padronizar respostas e códigos HTTP da API; hoje alguns handlers não tratam exceções e outros retornam detalhes internos.
- Tratar `response.ok`, estados de carregamento e erros nos formulários e buscas do frontend; desabilitar ações enquanto uma requisição está em andamento.
- Corrigir o idioma do documento HTML para `pt-BR` e remover imports/estados não usados e páginas antigas de rascunho.
- Ampliar os testes para autorização, validação de dados, fechamento de comanda e cálculo de totais; adicionar um seed de desenvolvimento se fizer sentido.
- Avaliar paginação e limites nos endpoints que hoje retornam coleções completas com relações incluídas.

## Observações

- O banco definido no Prisma é PostgreSQL e a conexão usa `DATABASE_URL`.
- O JWT é mantido em cookie `HttpOnly`, `Secure` em produção e `SameSite=Strict`; rotas de dados consultam o perfil atual no banco. O cadastro sempre atribui perfil `user`.
- Há um teste E2E Playwright para cadastro/login; ainda não há seed de dados configurado.
