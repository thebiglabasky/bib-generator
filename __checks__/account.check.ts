import {
  AgenticCheck,
  AlertChannel,
  ApiCheck,
  AssertionBuilder,
  BrowserCheck,
  DnsMonitor,
  HeartbeatMonitor,
  TcpMonitor,
  UrlAssertionBuilder,
  UrlMonitor,
} from 'checkly/constructs'

const alertChannel283583 = AlertChannel.fromId(283583)
const alertChannel287243 = AlertChannel.fromId(287243)

new HeartbeatMonitor('heartbeat-monitor-1', {
  name: 'Heartbeat Monitor #1',
  activated: true,
  muted: false,
  alertChannels: [alertChannel283583, alertChannel287243],
  period: 1,
  periodUnit: 'hours',
  grace: 30,
  graceUnit: 'minutes',
})

new TcpMonitor('google-tcp', {
  name: 'Google TCP',
  activated: false,
  muted: false,
  frequency: 10,
  locations: ['eu-central-1', 'ap-southeast-2'],
  alertChannels: [alertChannel283583, alertChannel287243],
  degradedResponseTime: 3000,
  maxResponseTime: 5000,
  request: {
    hostname: 'google.com',
    port: 80,
    ipFamily: 'IPv4',
    assertions: [],
  },
})

new DnsMonitor('checkly-dns', {
  name: 'Checkly DNS',
  activated: false,
  muted: false,
  frequency: 10,
  locations: ['eu-central-1', 'us-east-1'],
  alertChannels: [alertChannel283583, alertChannel287243],
  degradedResponseTime: 500,
  maxResponseTime: 1000,
  request: {
    query: 'checklyhq.com',
    recordType: 'A',
    protocol: 'UDP',
    assertions: [],
  },
})

new AgenticCheck('env-vars-agentic-check-test', {
  name: 'Env Vars Agentic Check test',
  activated: false,
  muted: false,
  frequency: 30,
  locations: ['eu-west-2', 'ap-east-1'],
  alertChannels: [alertChannel287243],
  prompt: `Go to https://app.getkontext.io, log in using {{K_USER}} and {{K_PASS}} and verify you're presented with a passkey authentication challenge.`,
})

new UrlMonitor('google', {
  name: 'Google',
  activated: false,
  muted: false,
  frequency: 1,
  locations: ['eu-central-1', 'ap-southeast-1'],
  tags: ['public'],
  alertChannels: [alertChannel283583, alertChannel287243],
  degradedResponseTime: 3000,
  maxResponseTime: 5000,
  request: {
    url: 'https://google.com',
    followRedirects: true,
    skipSSL: false,
    ipFamily: 'IPv4',
    assertions: [],
  },
})

new ApiCheck('demo-api-check', {
  name: 'Demo API check',
  activated: false,
  muted: false,
  frequency: 10,
  locations: ['eu-central-1', 'us-east-1'],
  tags: ['public'],
  alertChannels: [alertChannel283583, alertChannel287243],
  degradedResponseTime: 5000,
  maxResponseTime: 20000,
  retryStrategy: {
    type: 'LINEAR',
    maxRetries: 2,
    sameRegion: true,
    baseBackoffSeconds: 60,
    maxDurationSeconds: 600,
  },
  request: {
    method: 'GET',
    url: 'https://api.agify.io/?name=bella',
    body: '',
    bodyType: 'NONE',
    headers: [],
    queryParameters: [],
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.age').equals(45),
    ],
    basicAuth: { username: '', password: '' },
    followRedirects: true,
    skipSSL: false,
    ipFamily: 'IPv4',
  },
})

new UrlMonitor('bib-generator-url-monitor', {
  name: 'Bib Generator - URL Monitor',
  activated: true,
  muted: false,
  frequency: 10,
  degradedResponseTime: 2000,
  maxResponseTime: 5000,
  request: {
    url: 'https://bib-generator.vercel.app',
    followRedirects: true,
    skipSSL: false,
    ipFamily: 'IPv4',
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})
new UrlMonitor('root-uptime-monitor', {
  name: '/ Uptime Monitor',
  activated: false,
  muted: false,
  frequency: 10,
  locations: ['us-east-1', 'eu-west-1'],
  alertChannels: [alertChannel283583, alertChannel287243],
  degradedResponseTime: 3000,
  maxResponseTime: 5000,
  retryStrategy: {
    type: 'FIXED',
    maxRetries: 2,
    sameRegion: true,
    baseBackoffSeconds: 60,
    maxDurationSeconds: 600,
  },
  request: {
    url: 'https://checklyhq.com/',
    followRedirects: true,
    skipSSL: false,
    ipFamily: 'IPv4',
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})

new AgenticCheck('checkly-cli-whoami', {
  name: 'Checkly CLI - whoami',
  activated: true,
  muted: true,
  frequency: 1440,
  locations: ['ap-northeast-3', 'us-east-2', 'eu-central-1'],
  tags: ['cli-agentic-demo'],
  alertChannels: [alertChannel283583, alertChannel287243],
  prompt: `I need you to test the Checkly CLI using \`npx checkly whoami\` after setting an environment variables with CHECKLY_ACCOUNT_ID and CHECKLY_API_KEY to the following secrets I'm using:
- account id: {{AGENTIC_ACCOUNT_ID}}
- api key:  {{AGENTIC_API_KEY}}

This should show the account properly "Herve Enterprise"
Then test \`npx checkly account entitlements\` to verify I'm on the Enterprise plan and spot a handful of entitlements.

Finally lists checks using \`npx checkly checks list\` and verify it lists some checks

After each command execution, confirm that the exit code is 0 (success). If any command returns a non-zero exit code, the check should fail.

Each CLI command should complete and return output within a reasonable timeout (e.g., 10 seconds). If a command hangs or takes longer than expected, report it as a failure.

Verify that the output from each command is valid JSON or valid CLI output format. If output is malformed or contains parsing errors, the check should fail.`,
})

new BrowserCheck('bib-generator-homepage-ui', {
  name: 'Bib Generator - Homepage UI',
  activated: false,
  muted: false,
  frequency: 10,
  retryStrategy: {
    type: 'FIXED',
    maxRetries: 1,
    baseBackoffSeconds: 0,
    maxDurationSeconds: 600,
    sameRegion: false,
  },
  code: {
    entrypoint: './homepage.spec.ts',
  },
})
