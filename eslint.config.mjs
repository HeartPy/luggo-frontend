import { FlatCompat } from "@eslint/eslintrc";
import withNuxt from "./.nuxt/eslint.config.mjs";
import stylistic from "@stylistic/eslint-plugin";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const eslintrc = new FlatCompat();

export default withNuxt(
  ...eslintrc.extends("plugin:vue/recommended"),
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/public/**",
      "**/.output/**",
      "**/.vscode/**",
      "**/.nuxt/**",
      "**/.git/**",
      "**/.data/**",
      "**/.idea/**",
      "**/.nitro/**",
      "**/.fleet/**",
      "**/test-results/**",
      "**/playwright-report/**",
      "**/*.log",
      "**/*.env",
      "**/.env.*",
      "**/*.DS_Store",
      "**/*.gitignore",
    ],
  },
  {
    files: ["**/*.vue", "**/*.ts"],
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "link-checker/valid-route": "off",
      "link-checker/valid-sitemap-link": "off",
    },
  },
  {
    files: ["**/*.vue"],
    rules: {
      "vue/no-multiple-template-root": "error",
      "vue/multi-word-component-names": "error",
      "vue/require-v-for-key": "error",
      "vue/no-use-v-if-with-v-for": "error",
      "vue/no-v-html": "off",
    },
  },
  {
    files: ["**/layouts/**/*.vue", "**/pages/**/*.vue", "**/error.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: true,
  }),
  {
    files: ["**/*.vue", "**/*.ts", "**/*.js"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    settings: {
      "better-tailwindcss": {
        tailwindConfig: "tailwind.config.ts",
      },
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "warn",
    },
  },
);
