import { expect, test } from '@playwright/test'

function getTargetUrl(pathname = '/') {
  const baseUrl = process.env.ENVIRONMENT_URL || process.env.BIB_GENERATOR_BASE_URL

  if (!baseUrl) {
    throw new Error('Set BIB_GENERATOR_BASE_URL to the public URL of the deployed bib-generator app.')
  }

  return new URL(pathname, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString()
}

test('loads the template designer and renders a preview bib', async ({ page }) => {
  await page.goto(getTargetUrl('/template'))

  await expect(page.getByRole('heading', { name: 'Designer de Dossard' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Outils' })).toBeVisible()
  await expect(page.getByText('210mm × 148.5mm')).toBeVisible()

  await page.getByRole('button', { name: 'Prévisualiser' }).click()

  await expect(page.getByRole('heading', { name: 'Prévisualisation avec données de test' })).toBeVisible()
  await expect(page.getByText('Jean')).toBeVisible()
  await expect(page.getByText('DUPONT')).toBeVisible()
  await expect(page.getByText('123')).toBeVisible()
})
