import { test, expect } from '@playwright/test'

test('Checkly pricing page displays at least three plan tiers', async ({ page }) => {
  const targetUrl = process.env.ENVIRONMENT_URL ?? 'https://www.checklyhq.com/pricing'
  await page.goto(targetUrl)

  // Wait for the pricing section to be fully loaded
  const planTiers = page.locator('[class*="pricing"] [class*="plan"], [class*="tier"], [data-plan], [class*="PricingCard"], [class*="pricing-card"]')

  // Fallback: look for plan headings that typically name each tier
  const planHeadings = page.getByRole('heading').filter({ hasText: /hobby|starter|team|enterprise|pro|business|free|scale|pay/i })

  // Use whichever strategy finds the tiers
  const headingCount = await planHeadings.count()

  expect(headingCount, 'Expected at least 3 plan tier headings on the pricing page').toBeGreaterThanOrEqual(3)
})
