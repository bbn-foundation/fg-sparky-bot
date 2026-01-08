import stylistic from "@stylistic/eslint-plugin";
import oxlint from "eslint-plugin-oxlint";
import { type Config, defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const _default: Config[] = defineConfig(
  globalIgnores([
    "node_modules",
    "**/node_modules",
    "**/dist",
    "dist",
    "build",
  ]),
  tseslint.configs.recommendedTypeCheckedOnly,
  tseslint.configs.disableTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  stylistic.configs.customize({
    braceStyle: "1tbs",
    semi: true,
    quotes: "double",
  }),
  oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
);

export default _default;
