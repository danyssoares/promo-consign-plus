{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts"
  ],
  "testMatch": [
    "**/__tests__/**/*.{ts,tsx}",
    "**/?(*.)+(spec|test).{ts,tsx}"
  ],
  "moduleDirectories": ["node_modules", "src"],
  "moduleNameMapper": {
    "@/(.*)": "<rootDir>/src/$1"
  },
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"]
}