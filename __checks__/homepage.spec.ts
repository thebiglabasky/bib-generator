import { test, expect } from '@playwright/test'

test('Bib Generator homepage loads correctly', async ({ page }) => {
  const response = await page.goto('https://bib-generator.vercel.app')
  expect(response?.status()).toBe(200)

  // Verify the page title
  await expect(page).toHaveTitle('Bib Generator')

  // Verify the main heading is visible (French: "Générateur de Dossards")
  await expect(page.locator('h1')).toContainText('Générateur de Dossards')

  // Verify the 3-step wizard is present
  await expect(page.getByText('Import CSV')).toBeVisible()
  await expect(page.getByText('Colonnes')).toBeVisible()
  await expect(page.getByText('Sélection')).toBeVisible()

  // Verify the file upload area is present
  await expect(page.getByText('Choisir un fichier')).toBeVisible()
})
