import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
      options: {
        projectConfig: {
          root: "",
          sourceRoot: "src",
          buildOptions: {
            tsConfig: "tsconfig.cypress.json",
          },
        },
      },
    },
    specPattern: "**/*.cy.ts",
    supportFile: "cypress/support/component.ts",
  },
});
