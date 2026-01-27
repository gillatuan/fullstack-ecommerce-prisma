import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^const/(.*)$': '<rootDir>/const/$1',
    '^decorator/(.*)$': '<rootDir>/decorator/$1',
    '^generated/(.*)$': '<rootDir>/generated/$1',
  },

  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
