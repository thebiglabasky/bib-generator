import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

/**
 * See https://www.checklyhq.com/docs/cli/project-structure/
 */
const config = defineConfig({
  projectName: 'Bib Generator',
  repoUrl: 'https://github.com/thebiglabasky/bib-generator',
  logicalId: 'bib-generator',
  checks: {
    activate: true,
    muted: false,
    frequency: Frequency.EVERY_10M,
    locations: ['us-east-1', 'eu-west-2', 'ap-southeast-1'],
    runtimeId: '2025.04',
    checkMatch: '**/__checks__/**/*.check.ts',
    ignoreDirectoriesMatch: ['node_modules/**', '.next/**'],
    playwrightConfig: {
      timeout: 30000,
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
    browserChecks: {
      frequency: Frequency.EVERY_30M,
      testMatch: '**/__checks__/**/*.spec.ts',
    },
  },
  cli: {
    runLocation: 'eu-west-2',
    reporters: ['list'],
    retries: 0,
  },
})

export default config
