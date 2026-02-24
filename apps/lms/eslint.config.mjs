import nextPlugin from "eslint-config-next/core-web-vitals";
import baseConfig from "../../eslint.config.base.mjs";
import eslintConfigPrettier from "eslint-config-prettier";

const config = [
  ...nextPlugin,
  ...baseConfig,
  eslintConfigPrettier,
  {
    rules: {
      // Project-specific: allow SVG/React and third-party props
      "react/no-unknown-property": "off",
      // Allow default export for Next.js pages/layouts
      "import/no-anonymous-default-export": "warn",
      // Relax for LMS UI (can tighten later)
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      // Allow operational logging in API routes/components.
      "no-console": "off",
      // React Compiler lint rules are noisy in current codebase.
      // Keep disabled until components are refactored for compiler-safe patterns.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/purity": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default config;
