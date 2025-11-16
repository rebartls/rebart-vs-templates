import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["**/tests/*", "*.config.*", ".*rc.*", "*.mjs", "scripts/*", "out/**", "dist/**", "templates/**", "configurations/**"],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.strictTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"@typescript-eslint/no-unnecessary-type-parameters": "off",
			"@typescript-eslint/unbound-method": "off",
			"@typescript-eslint/no-non-null-assertion": 'off',
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: false,
				},
			],
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{
					allowNumber: true,
				},
			],
		},
	}
);
