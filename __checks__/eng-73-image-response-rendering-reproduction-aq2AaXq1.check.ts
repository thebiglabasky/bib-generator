/**
* This is a Checkly CLI ApiCheck construct. To learn more, visit:
* - https://www.checklyhq.com/docs/cli/
* - https://www.checklyhq.com/docs/cli/constructs-reference/#apicheck
*/

import { ApiCheck, Frequency, AssertionBuilder, RetryStrategyBuilder } from 'checkly/constructs'

new ApiCheck('eng-73-image-response-rendering-reproduction-aq2AaXq1', {
  name: 'ENG-73 - Image response rendering reproduction',
  description: 'Reproduces ENG-73 with a small raster image response below the stored-body limit.',
  activated: true,
  muted: true,
  shouldFail: false,
  runParallel: false,
  locations: ['eu-west-3'],
  tags: ['eng-73', 'image-response', 'reproduction'],
  frequency: Frequency.EVERY_10M,
  maxResponseTime: 20000,
  degradedResponseTime: 5000,
  request: {
    url: 'https://httpbingo.org/image/png',
    method: 'GET',
    followRedirects: true,
    skipSSL: false,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
    ],
    body: ``,
    bodyType: 'NONE',
    headers: [],
    queryParameters: [],
  },
  retryStrategy: RetryStrategyBuilder.fixedStrategy({
    baseBackoffSeconds: 0,
    maxRetries: 1,
    maxDurationSeconds: 600,
    sameRegion: false,
  }),
})
