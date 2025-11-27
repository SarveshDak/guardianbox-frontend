import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // Ignore built files
  { ignores: ["dist"] },

  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    extends: [
      js.configs.recommended,
    ],
    rules: {
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      // For React Fast Refresh (Vite/CRA-style)
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
];
