import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'

const prisma = new PrismaClient()

test.afterAll(async () => {
  await prisma.$disconnect()
})

test('cadastra uma conta e permite entrar com ela', async ({ page }) => {
  const name = 'Usuário E2E'
  const email = `e2e-${randomUUID()}@example.test`
  const password = 'Senha-E2E-2601!'

  try {
    await page.goto('/register')
    await page.getByPlaceholder('Digite seu nome').fill(name)
    await page.getByPlaceholder('email@email.com').fill(email)
    await page.getByPlaceholder('digite sua senha').nth(0).fill(password)
    await page.getByPlaceholder('digite novamente sua senha').fill(password)

    const registerResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/register') &&
        response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Registrar' }).click()
    const registerResponse = await registerResponsePromise

    expect(registerResponse.status()).toBe(200)
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()

    await page.getByRole('button', { name: 'Sair' }).click()
    await expect(page).toHaveURL('/login')

    await page.getByPlaceholder('email@email.com').fill(email)
    await page.getByPlaceholder('digite sua senha').fill(password)

    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/login') &&
        response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Logar' }).click()
    const loginResponse = await loginResponsePromise

    expect(loginResponse.status()).toBe(200)
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()
  } finally {
    // Remove somente a conta aleatória criada por este teste no banco E2E.
    await prisma.user.deleteMany({ where: { email } })
  }
})
