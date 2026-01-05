import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import svelteParser from "svelte-eslint-parser";

export default [
  // Base JS rules
  js.configs.recommended,

  // Svelte files
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: undefined,        // remove if not using TypeScript
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
      parser: undefined,          // remove if not using TypeScript
      sourceType: "module"
    }
  },

  // Disable ESLint rules that conflict with Prettier
  prettier
];
