import { expect, test } from '@playwright/test'

function getTargetUrl(pathname = '/') {
  const baseUrl = process.env.ENVIRONMENT_URL || process.env.BIB_GENERATOR_BASE_URL

  if (!baseUrl) {
    throw new Error('Set BIB_GENERATOR_BASE_URL to the public URL of the deployed bib-generator app.')
  }

  return new URL(pathname, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString()
}

// Inline CSV data so this spec works in both BrowserCheck and pw-test remote runners
// without needing a local filesystem reference.
const CSV_CONTENT = '\ufeffRéférence commande;Date de la commande;Statut de la commande;Nom payeur;Prénom payeur;Email payeur;Raison sociale;Moyen de paiement;Tarif;Montant tarif;Code Promo;Montant code promo;Nom de famille;Prénom Adulte 1;Prénom de l\'enfant;Année de naissance Enfant;"Prénom de l\'enfant 2   ";"Année de naissance Enfant 2 ";"Prénom de l\'enfant 3 ";"Année de naissance Enfant 3 ";Relais Adulte;Prénom Adulte 2 - Si relais;Téléphone;Mail;Je viens seul(e), et je souhaite que l\'on me surveille mon enfant pendant que je cours\r\n152801622;09/10/2025 21:59;Validé;Calbris;Gaëtan;gaetan.calbris@gmail.com;;Carte bancaire;Course Parents - Enfants;5,00;;;Calbris;Gaëtan;Solène;2016 et avant;;;;;Non;;0768644836;gaetan.calbris@gmail.com;\r\n152611641;08/10/2025 22:45;Validé;Lorage;Anne;aclorage@gmail.com;;Carte bancaire;Course Parents - Enfants;5,00;;;Cavelius;Claude;Paula;"2020 ; 2019";;;;;Non;;0689574825;Claude.cavelius@gmail.com;Non\r\n152599764;08/10/2025 21:47;Validé;Amchou;Ghizlaine;ghizlaineamchou@gmail.com;;Carte bancaire;Course Parents - Enfants;5,00;;;AMCHOU;Ghizlaine;Haroun;"2020 ; 2019";;;;;Non;;0609514039;ghizlaineamchou@gmail.com;Non\r\n152576850;08/10/2025 20:27;Validé;Santo;Mickael;M.santo64@hotmail.com;;Carte bancaire;Course Parents - Enfants;5,00;;;Tigzim;Maeva;Amaya;"2017 ; 2018";;;;;Non;;0669033688;mj.net64@hotmail.com;Non\r\n152564964;08/10/2025 19:42;Validé;Dourau;Jérémie;douraujeremie@gmail.com;;Carte bancaire;Course Parents - Enfants;5,00;;;Dourau;Jérémie;Tino;"2020 ; 2019";;;;;Non;;0603713132;douraujeremie@gmail.com;Non\r\n'

test('imports the sample CSV and prepares bib selection', async ({ page }) => {
  await page.goto(getTargetUrl('/'))
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Générateur de Dossards' })).toBeVisible()

  await page.locator('input[type="file"][accept=".csv"]').setInputFiles({
    name: 'course-nettoye.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(CSV_CONTENT),
  })

  await expect(page.getByText('Sélection').first()).toBeVisible()
  await expect(page.getByText('Solène CALBRIS')).toBeVisible()
  await expect(page.getByText('Gaëtan CALBRIS')).toBeVisible()

  await page.getByPlaceholder('Rechercher...').fill('Solène')
  await expect(page.getByText('Solène CALBRIS')).toBeVisible()
  await expect(page.getByRole('button', { name: /Générer \d+ dossard/ })).toBeEnabled()
})
