/**
* This is a Checkly CLI BrowserCheck construct. To learn more, visit:
* - https://www.checklyhq.com/docs/cli/
* - https://www.checklyhq.com/docs/cli/constructs-reference/#browsercheck
*/

import { BrowserCheck, Frequency } from 'checkly/constructs'

new BrowserCheck('checkly-sudoku-95ZY00Zt', {
  name: 'Checkly Sudoku',
  activated: true,
  muted: false,
  shouldFail: false,
  runParallel: false,
  locations: ['us-east-1'],
  tags: [],
  sslCheckDomain: '',
  frequency: Frequency.EVERY_6H,
  environmentVariables: [],
  code: {
    entrypoint: './checkly-sudoku-95ZY00Zt.spec.ts',
  },
})
