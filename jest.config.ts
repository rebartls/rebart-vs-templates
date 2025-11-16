import { Config } from "jest/build";
import { createDefaultPreset, JestConfigWithTsJest } from "ts-jest";

//link https://code.visualstudio.com/api/working-with-extensions/testing-extension
const preset = createDefaultPreset({});

const config: Config = {
	testEnvironment: "node",
	testRegex: "tests(/.*){0,}/[a-zA-Z0-9.]*.test.ts",
	testPathIgnorePatterns: [],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	transform: {
		"^.+\\.ts?$": ["ts-jest", {}],
	},
};

const je: JestConfigWithTsJest = {
	...preset,
};

export default je;
