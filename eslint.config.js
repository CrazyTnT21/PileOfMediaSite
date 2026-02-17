import eslint from '@eslint/js';
import tslint from 'typescript-eslint';
import globals from "globals";
import html from "@html-eslint/eslint-plugin";
import translation_en from './src/assets/i18n/translations/en.json' with {type: "json"};

const translationKeys = Object.keys(translation_en);
const ignores = ["./dist/", "./node_modules/"];
const config = tslint.config(
    {...eslint.configs.recommended, files: ['**/*.{ts,tsx}']},
    ...tslint.configs.recommended.map(conf => ({
      ...conf,
      files: ['**/*.{ts,tsx}'],
    })),
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        globals: globals.browser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            "argsIgnorePattern": "^_",
            "varsIgnorePattern": "^_",
            "caughtErrorsIgnorePattern": "^_"
          }
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/adjacent-overload-signatures": "warn",
        "@typescript-eslint/prefer-readonly": "warn",
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "@typescript-eslint/explicit-member-accessibility": "warn"
      }
    },
    {
      files: ["**/*.html"],
      plugins: {
        "@html-eslint": html
      },
      language: "@html-eslint/html",
      rules: {
        ...html.configs["flat/recommended"].rules,
        "@html-eslint/indent": "off", // doesn't work well with attributes
        "@html-eslint/attrs-newline": "off", // requires a newline before the first attribute
        "@html-eslint/use-baseline": "off", // false positives, e.g datalist
        "@html-eslint/no-duplicate-class": "error",
        "@html-eslint/no-ineffective-attrs": "error",
        "@html-eslint/no-invalid-entity": "error",
        "@html-eslint/require-meta-charset": "error",
        "@html-eslint/no-skip-heading-levels": "error",
        "@html-eslint/lowercase": "error",
        "@html-eslint/no-extra-spacing-text": "error",
        "@html-eslint/no-multiple-empty-lines": "error",
        "@html-eslint/no-trailing-spaces": "error",
        "@html-eslint/no-positive-tabindex": "error",
        "@html-eslint/no-empty-headings": "error",
        "@html-eslint/require-img-alt": "error",
        "@html-eslint/no-inline-styles": "warn",
        "@html-eslint/sort-attrs": [
          "warn",
          {
            "priority": ["id", "class", "style", "name", "label", "rel", "href", "src", "type"]
          }
        ],
        "@html-eslint/id-naming-convention": [
          "error",
          "kebab-case"
        ],
        "@html-eslint/require-attrs": [
          "error",
          ...inputLabelRequireAttrs(),
        ],
        "@html-eslint/max-element-depth": [
          "warn",
          {
            "max": 10
          }
        ],
        "@html-eslint/no-restricted-attr-values": [
          "error",
          {
            attrPatterns: ["^data-translate$"],
            attrValuePatterns: [`^(?!${translationKeys.join("|")})`],
            message: "Translation key doesn't exist",
          }
        ],
      }
    }
).map(conf => ({
  ...conf,
  ignores,
}));
export default config;

function inputLabelRequireAttrs()
{
  const tags = ["app-input", "app-number-input", "app-autocomplete", "app-checkbox", "app-textarea", "app-image-input"];

  return [...tags
      .map(tag => ({
        tag,
        attr: "label",
        message: "'label' attribute missing. Inputs must have a label for accessibility"
      })),
    ...tags.map(tag => ({
      tag,
      attr: "data-translate-attributes",
      message: "'data-translate-attributes' attribute missing. Inputs must have a translation for the label"
    }))
  ];
}
