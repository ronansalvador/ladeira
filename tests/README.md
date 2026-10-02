# Testes E2E de autenticação

A suíte automatiza o fluxo real da interface: cria uma conta com e-mail aleatório, encerra a sessão, autentica com a conta recém-criada e apaga essa conta ao final. Ela usa o banco configurado em `E2E_DATABASE_URL`; não use o banco de produção ou o banco normal de desenvolvimento.

## Preparação

1. Crie um banco ou schema PostgreSQL isolado cujo nome contenha `e2e` ou `test`.
2. Configure a URL desse banco como `E2E_DATABASE_URL` no `.env` local (não a salve no repositório). A configuração Playwright carrega esse arquivo automaticamente.
3. Aplique as migrações nesse banco:

   ```bash
   npm run test:e2e:migrate
   ```

4. Instale o navegador usado pela suíte, se ainda não estiver instalado:

   ```bash
   npx playwright install chromium
   ```

   Em algumas distribuições Linux antigas, o Playwright não oferece um Chromium baixável. Nesse caso, instale Google Chrome/Chromium pelo sistema; a configuração usa automaticamente `/usr/bin/google-chrome` ou `/usr/bin/chromium`, ou aceite um caminho personalizado em `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Executar

Na raiz do projeto, com `E2E_DATABASE_URL` definida no `.env`:

```bash
npm run test:e2e
```

Para abrir a interface visual do Playwright:

```bash
npm run test:e2e:ui
```

O servidor de teste inicia na porta 3100. O teste cria e remove um usuário aleatório no banco E2E; mantenha esse banco isolado.
