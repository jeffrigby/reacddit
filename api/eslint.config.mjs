import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    ignores: ["**/.aws-sam/**"],
    languageOptions: {
      globals: {
        ...globals.node,
        process: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  pluginJs.configs.recommended,
];
