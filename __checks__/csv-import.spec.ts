import { expect, test } from '@playwright/test'
import path from 'node:path'

function getTargetUrl(pathname = '/') {
  const baseUrl = process.env.ENVIRONMENT_URL || process.env.BIB_GENERATOR_BASE_URL

  if (!baseUrl) {
    throw new Error('Set BIB_GENERATOR_BASE_URL to the public URL of the deployed bib-generator app.')
  }

  return new URL(pathname, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString()
}

test('imports the sample CSV and prepares bib selection', async ({ page }) => {
  await page.goto(getTargetUrl('/'))
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Générateur de Dossards' })).toBeVisible()

  await page.locator('input[type="file"][accept=".csv"]').setInputFiles(
    path.join(process.cwd(), 'resources/course-nettoye.csv'),
  )

  await expect(page.getByText('Sélection')).toBeVisible()
  await expect(page.getByText('Solène CALBRIS')).toBeVisible()
  await expect(page.getByText('Gaëtan CALBRIS')).toBeVisible()

  await page.getByPlaceholder('Rechercher...').fill('Solène')
  await expect(page.getByText('Solène CALBRIS')).toBeVisible()
  await expect(page.getByRole('button', { name: /Générer \d+ dossard/ })).toBeEnabled()
})
