import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const isProd = process.env.NODE_ENV === "production";

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),

	// This must come after the extends and be a full config object
	{
		files: ["**/*.ts", "**/*.tsx"],
		rules: {
			"@typescript-eslint/no-explicit-any": isProd ? "error" : "off",
			"@typescript-eslint/no-unused-vars": isProd ? "error" : "off",
		},
	},
];

export default eslintConfig;
