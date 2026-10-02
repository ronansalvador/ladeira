import nextEnv from '@next/env'
import { spawnSync } from 'node:child_process'

nextEnv.loadEnvConfig(process.cwd())

const testDatabaseUrl = process.env.E2E_DATABASE_URL
if (!testDatabaseUrl) {
  console.error('Defina E2E_DATABASE_URL no arquivo .env local.')
  process.exit(1)
}

let databaseUrl
try {
  databaseUrl = new URL(testDatabaseUrl)
} catch {
  console.error('E2E_DATABASE_URL não contém uma URL válida.')
  process.exit(1)
}

const databaseTarget = `${databaseUrl.pathname} ${databaseUrl.searchParams.get('schema') ?? ''}`
if (!/(e2e|test)/i.test(databaseTarget)) {
  console.error(
    'Por segurança, E2E_DATABASE_URL precisa indicar um banco/schema com "e2e" ou "test" no nome.',
  )
  process.exit(1)
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(command, ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: testDatabaseUrl },
})

if (result.error) {
  console.error('Não foi possível iniciar o Prisma:', result.error.message)
  process.exit(1)
}
process.exit(result.status ?? 1)
