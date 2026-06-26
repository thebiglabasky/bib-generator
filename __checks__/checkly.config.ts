import { defineConfig } from 'checkly'

export default defineConfig({
  projectName: 'Bib Generator monitors',
  logicalId: 'bib-generator-monitors',
  checks: {
    checkMatch: '**/*.check.ts',
    browserChecks: { testMatch: '**/*.spec.ts' },
  },
})
