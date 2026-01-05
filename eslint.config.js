import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import svelteParser from "svelte-eslint-parser";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  // Base JS rules
  js.configs.recommended,

  // Svelte files
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      globals: {
        ...globals.browser
      },
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".svelte"],
        sourceType: "module"
      }
    },
    plugins: {
      svelte
    },
    rules: {
      ...svelte.configs.recommended.rules
    }
  },

  // JS / TS files
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module"
    },
    globals: {
        ...globals.browser
      }
  },

  // Disable ESLint rules that conflict with Prettier
  prettier
];
