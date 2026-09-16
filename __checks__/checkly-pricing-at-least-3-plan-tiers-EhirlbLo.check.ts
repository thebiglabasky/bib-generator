/**
* This is a Checkly CLI BrowserCheck construct. To learn more, visit:
* - https://www.checklyhq.com/docs/cli/
* - https://www.checklyhq.com/docs/cli/constructs-reference/#browsercheck
*/

import { BrowserCheck, Frequency } from 'checkly/constructs'

new BrowserCheck('checkly-pricing-at-least-3-plan-tiers-EhirlbLo', {
  name: 'Checkly Pricing - At Least 3 Plan Tiers',
  activated: false,
  muted: true,
  shouldFail: false,
  runParallel: false,
  locations: ['us-east-1'],
  tags: [],
  frequency: Frequency.EVERY_24H,
  environmentVariables: [
    { key: 'ENVIRONMENT_URL', value: 'https://www.checklyhq.com/pricing', locked: false, secret: false },
  ],
  code: {
    entrypoint: './checkly-pricing-at-least-3-plan-tiers-EhirlbLo.spec.ts',
  },
})
