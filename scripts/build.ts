import { build } from "esbuild";
import { copyFile } from "fs/promises";
import { manual } from "rimraf";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { debug, info, LogLevel, setLogLevel } from "./utils";

export async function runBuild(readArgs: boolean = true) {
	if (readArgs) {
		const args = await yargs(hideBin(process.argv))
			.option("logLevel", {
				alias: "ll",
				type: "string",
				default: "info",
				choices: Object.keys(LogLevel),
				description: "Log level.",
			})
			.help()
			.alias("help", "h")
			.parse();

		setLogLevel(args.logLevel);
	}

	await manual("out");
	debug("Removed previous extension build files.");
	debug("Start to build extension.");

	await build({
		entryPoints: [`${__dirname}/../src/extension.ts`],
		bundle: true,
		format: "cjs",
		minify: true,
		sourcemap: false,
		platform: "node",
		outfile: "out/extension.js",
		external: ["vscode"],
		logLevel: "warning",
	});

	await copyFile(`${__dirname}/../src/schema.json`, `${__dirname}/../out/schema.json`);
	debug("Copied schema to output folder.");
	info("Build ended successfully.");
}
