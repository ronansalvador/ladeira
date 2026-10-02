import { defineConfig, devices } from '@playwright/test'

const testDatabaseUrl = process.env.E2E_DATABASE_URL

if (!testDatabaseUrl) {
  throw new Error(
    'Defina E2E_DATABASE_URL para um banco de testes isolado antes de executar a suíte.',
  )
}

const databaseUrl = new URL(testDatabaseUrl)
const databaseTarget = `${databaseUrl.pathname} ${databaseUrl.searchParams.get('schema') ?? ''}`
if (!/(e2e|test)/i.test(databaseTarget)) {
  throw new Error(
    'E2E_DATABASE_URL deve apontar para um banco ou schema de teste (com "e2e" ou "test" no nome).',
  )
}

// Usa o mesmo banco de teste na aplicação Next e nos hooks de limpeza do teste.
process.env.DATABASE_URL = testDatabaseUrl
process.env.JWT_SECRET =
  process.env.E2E_JWT_SECRET ?? 'local-e2e-only-secret-do-not-use-in-production'

const baseURL = 'http://127.0.0.1:3100'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 3100',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: testDatabaseUrl,
      JWT_SECRET:
        process.env.E2E_JWT_SECRET ??
        'local-e2e-only-secret-do-not-use-in-production',
    },
  },
})
