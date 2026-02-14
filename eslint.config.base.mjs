/**
 * Shared ESLint rules for Skill-Learn monorepo.
 * Production-oriented, industry-standard rules. Extend this in apps/* and packages/*.
 * Use after eslint-config-next (or other base) in flat config.
 */
export default [
  {
    name: "skill-learn/production",
    rules: {
      // ——— General best practices ———
      "no-var": "error",
      "prefer-const": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-throw-literal": "error",
      "prefer-template": "warn",

      // ——— Security ———
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // ——— React (align with Next, tighten where needed) ———
      "react/jsx-no-target-blank": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // ——— Import / consistency ———
      "import/no-duplicates": "error",
    },
  },
  {
    name: "skill-learn/typescript",
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      // no-floating-promises / no-misused-promises need type-aware linting (parserOptions.project)
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
];
