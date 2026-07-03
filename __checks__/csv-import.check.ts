import { BrowserCheck, Frequency } from 'checkly/constructs'

new BrowserCheck('bib-generator-csv-workflow', {
  name: 'Bib Generator CSV import workflow',
  code: {
    entrypoint: './csv-import.spec.ts',
  },
  frequency: Frequency.EVERY_30M,
  locations: ['eu-west-3', 'us-east-1'],
  tags: ['bib-generator', 'csv', 'browser'],
})
