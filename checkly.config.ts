import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

/**
 * See https://www.checklyhq.com/docs/cli/project-structure/
 */
const config = defineConfig({
  projectName: 'bib-generator',
  logicalId: 'bib-generator',
  checks: {
    activated: true,
    muted: false,
    frequency: Frequency.EVERY_10M,
    locations: ['eu-west-3', 'eu-central-1', 'us-east-1'],
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
    runLocation: 'eu-west-3',
    reporters: ['list'],
    retries: 0,
  },
})

export default config
