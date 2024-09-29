// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  plugins: { prettier },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'max-classes-per-file': 'off',
    'no-underscore-dangle': 'off',
    'import/extensions': 'off',
  },
});

// import path from "node:path";
// import { fileURLToPath } from "node:url";
// import js from "@eslint/js";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const compat = new FlatCompat({
//     baseDirectory: __dirname,
//     recommendedConfig: js.configs.recommended,
//     allConfig: js.configs.all
// });

// export default [...fixupConfigRules(compat.extends(
//     "airbnb-typescript",
//     "react-app",
//     "plugin:prettier/recommended",
//     "prettier",
// )), {
//     plugins: {
//         prettier: fixupPluginRules(prettier),
//     },

//     languageOptions: {
//         ecmaVersion: 5,
//         sourceType: "script",

//         parserOptions: {
//             project: "./tsconfig.eslint.json",
//         },
//     },

//     settings: {
//         react: {
//             version: "99.99.99",
//         },
//     },

//     rules: {
//         "@typescript-eslint/no-explicit-any": "off",
//         "max-classes-per-file": "off",
//         "no-underscore-dangle": "off",
//         "import/extensions": "off",
//     },
// }];
