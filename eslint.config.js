import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import globals from "globals";

const ignores = ["./dist/", "./node_modules/"];
const config = tslint.config(
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/adjacent-overload-signatures": "warn",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error"
    }
  },
).map(conf => ({
  ...conf,
  files: ['**/*.{ts,tsx}'],
  ignores,
}));
export default config;
