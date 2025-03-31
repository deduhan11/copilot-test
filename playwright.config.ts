import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  workers: 1,
  retries: 0,
  reporter: [
    ['html', {
      open: 'on-failure',
      outputFolder: 'test-results'
    }]
  ],
  use: {
    actionTimeout: 10000,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'API Testing',
      use: {
        baseURL: 'http://localhost:3000',
        extraHTTPHeaders: {
          'Accept': 'application/json'
        },
      },
    }
  ]
};

export default config;
