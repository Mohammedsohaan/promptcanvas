/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  projects: [
    {
      displayName: "services",
      preset: "ts-jest",
      testEnvironment: "node",
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: ["<rootDir>/services/__tests__/**/*.test.ts"],
    },
    {
      displayName: "components",
      preset: "ts-jest",
      testEnvironment: "jest-environment-jsdom",
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: [
        "<rootDir>/components/**/*.test.ts",
        "<rootDir>/components/**/*.test.tsx"
      ],
      setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
    },
    {
      displayName: "repositories",
      preset: "ts-jest",
      testEnvironment: "node",
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: ["<rootDir>/repositories/__tests__/**/*.test.ts"],
    }
  ],
};
