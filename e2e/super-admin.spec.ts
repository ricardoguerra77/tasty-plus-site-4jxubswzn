import { test, expect } from '@playwright/test'

const SUPER_ADMIN_EMAIL = 'admin@tastyplus.com.br'
const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Skip@PassAdmin2025!'

test.describe('Super Admin Hierarchy, Password Reset & Direct Route Tests', () => {
  test('direct deep-links to /, /produtos, /noticias, /admin, /login never show NotFound', async ({
    page,
  }) => {
    // 1. Direct deep-link to /
    await page.goto('/')
    await expect(page.locator('text=404')).toBeHidden()
    await expect(page.locator('text=Página não encontrada')).toBeHidden()
    await expect(page.locator('text=Tasty Aromas e Sabores').first()).toBeVisible()

    // 2. Direct deep-link to /produtos
    await page.goto('/produtos')
    await expect(page.locator('text=404')).toBeHidden()
    await expect(page.locator('text=Página não encontrada')).toBeHidden()
    await expect(page.getByRole('heading', { level: 1, name: 'Nossos Produtos' })).toBeVisible()

    // 3. Direct deep-link to /noticias
    await page.goto('/noticias')
    await expect(page.locator('text=404')).toBeHidden()
    await expect(page.locator('text=Página não encontrada')).toBeHidden()
    await expect(page.getByRole('heading', { level: 1, name: 'Notícias' })).toBeVisible()

    // 4. Direct deep-link to /login
    await page.goto('/login')
    await expect(page.locator('text=404')).toBeHidden()
    await expect(page.locator('text=Página não encontrada')).toBeHidden()
    await expect(page.getByRole('heading', { level: 2, name: 'Acesso Restrito' })).toBeVisible()

    // 5. Direct deep-link to /admin (unauthenticated redirects to /login)
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=404')).toBeHidden()
    await expect(page.locator('text=Página não encontrada')).toBeHidden()
    await expect(page.getByRole('heading', { level: 2, name: 'Acesso Restrito' })).toBeVisible()
  })

  test('forgot password flow: valid email displays success message, invalid email displays inline error', async ({
    page,
  }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'Esqueci minha senha' })).toBeVisible()

    // Click forgot password
    await page.getByRole('button', { name: 'Esqueci minha senha' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Redefinir Senha' })).toBeVisible()

    // Submit invalid email
    const emailInput = page.locator('#reset-email')
    await emailInput.fill('invalid-email')
    await page.getByRole('button', { name: 'Enviar Instruções' }).click()

    // Verify inline error message
    await expect(
      page.locator('text=Por favor, informe um endereço de e-mail válido.'),
    ).toBeVisible()

    // Submit valid email
    await emailInput.fill('usuario.teste@tastyplus.com.br')
    await page.getByRole('button', { name: 'Enviar Instruções' }).click()

    // Success confirmation screen
    await expect(page.locator('text=Solicitação Enviada')).toBeVisible()
    await expect(
      page.locator(
        'text=Se este e-mail estiver cadastrado, enviaremos as instruções de redefinição.',
      ),
    ).toBeVisible()

    // Can return to login
    await page.getByRole('button', { name: 'Voltar ao Login' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Acesso Restrito' })).toBeVisible()
  })

  test('super admin login reveals Usuários tab and user operations; admin cannot manage users', async ({
    page,
  }) => {
    // 1. Login as Super Admin
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(SUPER_ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(SUPER_ADMIN_PASSWORD)
    await page.locator('button[type="submit"]:has-text("Entrar")').click()
    await expect(page).toHaveURL(/\/admin/)

    // Assert "Usuários" tab trigger is visible
    const usersTabTrigger = page.locator('button[role="tab"]:has-text("Usuários")')
    await expect(usersTabTrigger).toBeVisible()

    // Click "Usuários" tab
    await usersTabTrigger.click()
    await expect(page.locator('text=Gestão de Usuários')).toBeVisible()
    await expect(page.locator('text=Novo Usuário')).toBeVisible()

    // Create a new admin user
    const testAdminEmail = `novo.admin.${Date.now()}@tastyplus.com.br`
    const testAdminPass = 'Skip@PassAdmin2026!'
    await page.getByRole('button', { name: 'Novo Usuário' }).click()

    await expect(page.locator('text=Cadastre um novo usuário')).toBeVisible()
    await page.locator('#create-name').fill('Admin Teste Playwright')
    await page.locator('#create-email').fill(testAdminEmail)

    // Select role Admin
    await page.locator('#create-role').click()
    await page.locator('[role="option"]:has-text("Administrador")').click()

    await page.locator('#create-password').fill(testAdminPass)
    await page.locator('#create-password-confirm').fill(testAdminPass)

    await page.getByRole('button', { name: 'Cadastrar Usuário' }).click()

    // Expect success toast and user in the list
    await expect(page.locator('text=Usuário criado com sucesso')).toBeVisible()
    await expect(page.locator(`text=${testAdminEmail}`)).toBeVisible()

    // 2. Now logout
    await page.goto('/login')
    const logoutBtn = page.getByRole('button', { name: 'Encerrar Sessão' })
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
    }

    // 3. Login as the newly created Admin user
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(testAdminEmail)
    await page.locator('input[type="password"]').fill(testAdminPass)
    await page.locator('button[type="submit"]:has-text("Entrar")').click()
    await expect(page).toHaveURL(/\/admin/)

    // As regular admin: Usuários tab must NOT be visible
    await expect(page.locator('button[role="tab"]:has-text("Usuários")')).toBeHidden()

    // Verify direct API operation against users collection by regular admin returns 400/403 (rejected)
    const apiStatus = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/collections/users/records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'hacker@tastyplus.com.br',
            password: 'Skip@PassHacker123!',
            passwordConfirm: 'Skip@PassHacker123!',
            role: 'admin',
          }),
        })
        return res.status
      } catch {
        return -1
      }
    })

    // Expect forbidden / unauthorized
    expect([400, 403, 401]).toContain(apiStatus)
  })
})
