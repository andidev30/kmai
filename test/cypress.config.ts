/// <reference types="node" />

import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
  },
  env: {
    apiUrl: process.env.CYPRESS_API_URL ?? "http://localhost:8787/api",
  },
})
