import nextPlugin from "eslint-config-next/core-web-vitals";

const config = [
  ...nextPlugin,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react/no-unknown-property": "off",
      "react/no-unused-vars": "off",
      "react/no-deprecated": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/static-components": "off",
      "@next/next/no-img-element": "off",
      "import/no-anonymous-default-export": "warn",
    },
  },
];

export default config;
