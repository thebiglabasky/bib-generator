import { BrowserCheck, Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'
import type { Region } from 'checkly'

const baseUrl = '{{BIB_GENERATOR_BASE_URL}}'
const primaryLocations: Array<keyof Region> = ['eu-west-3', 'eu-central-1', 'us-east-1']

new UrlMonitor('bib-generator-homepage-url', {
  name: 'Bib Generator homepage',
  frequency: Frequency.EVERY_10M,
  locations: primaryLocations,
  tags: ['bib-generator', 'nextjs', 'route'],
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    url: `${baseUrl}/`,
    ipFamily: 'IPv4',
    assertions: [
      UrlAssertionBuilder.statusCode().equals(200),
    ],
  },
})

new UrlMonitor('bib-generator-config-url', {
  name: 'Bib Generator race configuration route',
  frequency: Frequency.EVERY_30M,
  locations: primaryLocations,
  tags: ['bib-generator', 'nextjs', 'route'],
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    url: `${baseUrl}/config`,
    ipFamily: 'IPv4',
    assertions: [
      UrlAssertionBuilder.statusCode().equals(200),
    ],
  },
})

new UrlMonitor('bib-generator-template-url', {
  name: 'Bib Generator template designer route',
  frequency: Frequency.EVERY_30M,
  locations: primaryLocations,
  tags: ['bib-generator', 'nextjs', 'route'],
  degradedResponseTime: 4000,
  maxResponseTime: 15000,
  request: {
    url: `${baseUrl}/template`,
    ipFamily: 'IPv4',
    assertions: [
      UrlAssertionBuilder.statusCode().equals(200),
    ],
  },
})

new BrowserCheck('bib-generator-csv-workflow', {
  name: 'Bib Generator CSV import workflow',
  code: {
    entrypoint: './csv-import.spec.ts',
  },
  frequency: Frequency.EVERY_30M,
  locations: ['eu-west-3', 'us-east-1'],
  tags: ['bib-generator', 'csv', 'browser'],
})

new BrowserCheck('bib-generator-template-designer-workflow', {
  name: 'Bib Generator template designer workflow',
  code: {
    entrypoint: './template-designer.spec.ts',
  },
  frequency: Frequency.EVERY_1H,
  locations: ['eu-west-3', 'us-east-1'],
  tags: ['bib-generator', 'template-designer', 'browser'],
})
