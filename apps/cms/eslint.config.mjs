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
      // Relax for CMS admin UI (can tighten later)
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      // Warn only until refactor: setState-in-effect and JSX-in-try/catch patterns
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/error-boundaries": "warn",
    },
  },
];

export default config;
