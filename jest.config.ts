import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  dir: './',
})
 
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/graphql/generated.ts',
    '!src/app/layout.tsx',
    '!src/**/index.{js,ts}',
    '!src/app/robots.ts',
    '!src/app/sitemap.ts',
    '!src/proxy.ts',
    '!src/app/**/page.tsx',
    '!src/components/backgrounds/**/*.{js,jsx,ts,tsx}',
    '!src/components/banner/**/*.{js,jsx,ts,tsx}',
  ],
}
 
export default createJestConfig(config)