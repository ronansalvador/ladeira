# Testes E2E de autenticação

A suíte automatiza o fluxo real da interface: cria uma conta com e-mail aleatório, encerra a sessão, autentica com a conta recém-criada e apaga essa conta ao final. Ela usa o banco configurado em `E2E_DATABASE_URL`; não use o banco de produção ou o banco normal de desenvolvimento.

## Preparação

1. Crie um banco ou schema PostgreSQL isolado cujo nome contenha `e2e` ou `test`.
2. Exporte a URL desse banco como `E2E_DATABASE_URL` (não a salve no repositório).
3. Aplique as migrações nesse banco:

   ```bash
   DATABASE_URL="$E2E_DATABASE_URL" npx prisma migrate deploy
   ```

4. Instale o navegador usado pela suíte, se ainda não estiver instalado:

   ```bash
   npx playwright install chromium
   ```

## Executar

Na raiz do projeto, com `E2E_DATABASE_URL` exportada:

```bash
npm run test:e2e
```

Para abrir a interface visual do Playwright:

```bash
npm run test:e2e:ui
```

O servidor de teste inicia na porta 3100. O teste cria e remove um usuário aleatório no banco E2E; mantenha esse banco isolado.
