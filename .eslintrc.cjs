module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
    ],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    settings: { react: { version: "18.2" } },
    plugins: ["react-refresh", "jsdoc"],
    rules: {
        "indent": [
            "error",
            4,
            { "SwitchCase": 1 }
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
        "react/prop-types": 0,
        "react/jsx-no-target-blank": 0,
    },
}
